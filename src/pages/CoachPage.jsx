import { useMemo, useState } from "react";
import { HeartPulse, Sparkles } from "lucide-react";
import Card from "../components/Card";
import PageTitle from "../components/PageTitle";
import { getStravaDeviceId, stravaApi } from "../services/stravaClient";
import "../styles/coach.css";

const STRAVA_DATA_KEY = "hlm_runhub.strava.data.v1";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function loadCoachData() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STRAVA_DATA_KEY) ?? "{}");
    const activities = (Array.isArray(stored.activities) ? stored.activities : [])
      .filter((activity) => {
        const type = activity.sportType ?? activity.sport_type ?? activity.type;
        return !type || ["Run", "TrailRun", "VirtualRun", "Treadmill"].includes(type);
      })
      .map((activity) => {
        const dateValue = activity.startDateLocal ?? activity.start_date_local ?? activity.startDate;
        const date = typeof dateValue === "string" ? new Date(dateValue) : null;
        const meters = Number(activity.distanceMeters ?? activity.distance);
        const distanceKm = Number(activity.distanceKm ?? (Number.isFinite(meters) ? meters / 1000 : NaN));
        const movingTimeSeconds = Number(activity.movingTimeSeconds ?? activity.movingTime ?? activity.moving_time);
        return { date, distanceKm, movingTimeSeconds };
      })
      .filter((activity) => activity.date && !Number.isNaN(activity.date.getTime()) && activity.date >= new Date(Date.now() - 12 * WEEK_MS))
      .sort((a, b) => b.date - a.date);
    return { connected: stored.connected === true, activities };
  } catch {
    return { connected: false, activities: [] };
  }
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildWeeklySummary(activities) {
  return Array.from({ length: 12 }, (_, index) => {
    const monday = new Date();
    monday.setHours(12, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - (11 - index) * 7);
    const weekStart = localDateKey(monday);
    const end = new Date(monday.getTime() + WEEK_MS);
    const runs = activities.filter(({ date }) => date >= monday && date < end);
    const distanceKm = runs.reduce((sum, item) => sum + (Number.isFinite(item.distanceKm) ? item.distanceKm : 0), 0);
    const movingTimeSeconds = runs.reduce((sum, item) => sum + (Number.isFinite(item.movingTimeSeconds) ? item.movingTimeSeconds : 0), 0);
    const pace = distanceKm > 0 && movingTimeSeconds > 0 ? Math.round(movingTimeSeconds / distanceKm) : null;
    return {
      weekStart,
      runCount: runs.length,
      distanceKm: Math.round(distanceKm * 10) / 10,
      longestRunKm: Math.round(Math.max(0, ...runs.map((run) => Number.isFinite(run.distanceKm) ? run.distanceKm : 0)) * 10) / 10,
      averagePaceSecondsPerKm: pace !== null && pace >= 60 && pace <= 3600 ? pace : null,
    };
  });
}

export default function CoachPage() {
  const [storedData] = useState(loadCoachData);
  const [readiness, setReadiness] = useState({ legs: "Normale", energy: "Normal", sleep: "Okay" });
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const deviceId = useMemo(() => getStravaDeviceId(), []);
  const weeks = useMemo(() => buildWeeklySummary(storedData.activities), [storedData.activities]);
  const activityCount = weeks.reduce((sum, week) => sum + week.runCount, 0);
  const recentKm = weeks.slice(-4).reduce((sum, week) => sum + week.distanceKm, 0);
  const recentWeeks = weeks.slice(-8);
  const maxWeeklyKm = Math.max(1, ...recentWeeks.map((week) => week.distanceKm));

  async function askCoach(intent = "overview") {
    setLoading(true);
    setError("");
    setAnalysis("");
    try {
      // Match the exact schema validated by the RunHub Worker.
      const payload = {
        goal: null,
        plan: null,
        weeks,
      };
      const result = await stravaApi(deviceId, "/api/runhub/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (typeof result.analysis !== "string" || !result.analysis.trim()) {
        throw new Error("Jeg fik ikke et svar denne gang. Prøv gerne igen om lidt.");
      }
      setAnalysis(result.analysis);
    } catch (requestError) {
      setError(requestError.message || "Coachens svar kunne ikke hentes lige nu.");
    } finally {
      setLoading(false);
    }
  }

  const lowReadiness = readiness.legs === "Tunge" || readiness.energy === "Lav" || readiness.sleep === "Dårlig";

  return (
    <div className="coach-page-compact">
      <PageTitle eyebrow="PERSONLIG TRÆNING" title="AI Coach" description="En hjælpsom sparringspartner til din løbetræning." />
      <Card className="coach-privacy-compact">
        <span className="coach-privacy-copy">🔒 Privat analyse · Aktivitetsnavne, ID'er og GPS-data deles ikke.</span>
      </Card>
      <Card className="coach-compact-card coach-compact-recommendation">
        <div className="coach-decision-copy">
          <span className="coach-status-pill"><HeartPulse size={13} /> DIN LØBECOACH</span>
          <h2>{lowReadiness ? "Giv kroppen lidt ekstra omsorg" : "Lad os tage træningen ét skridt ad gangen"}</h2>
          <p className="coach-small-copy">{lowReadiness ? "Dit check-in tyder på, at du måske har brug for en lettere dag. Vælg et roligt pas eller restitution, og mærk efter undervejs." : "Fortæl mig, hvordan du har det i dag, så hjælper jeg dig med et overskueligt næste skridt."}</p>
          <div className="coach-compact-focus">
            <div className="coach-mini"><small>ET GODT UDGANGSPUNKT</small><strong>{activityCount ? `${activityCount} løb registreret de seneste 12 uger` : "Forbind Strava for at tage udgangspunkt i din træning"}</strong></div>
          </div>
        </div>
        <div className="coach-decision-stack">
          <button type="button" className="primary coach-analyze-button" disabled={loading || !storedData.connected || activityCount === 0} onClick={() => askCoach()}><Sparkles size={15} /> {loading ? "Jeg kigger på din træning…" : "Tal med min coach"}</button>
          {!storedData.connected && <span className="coach-small-copy">Forbind Strava for at få personlig vejledning.</span>}
        </div>
      </Card>
      <Card className="coach-compact-card">
        <div className="coach-heading-row"><div><small>DAGLIGT CHECK-IN</small><h3>Hvordan har du det i dag?</h3><p className="coach-small-copy">Der er ikke noget rigtigt svar — brug det, der passer bedst.</p></div></div>
        <div className="coach-compact-grid">
          {[['legs', 'Ben', ['Friske', 'Normale', 'Tunge']], ['energy', 'Energi', ['God', 'Normal', 'Lav']], ['sleep', 'Søvn', ['God', 'Okay', 'Dårlig']]].map(([key, label, choices]) => (
            <div className="coach-mini" key={key}><strong>{label}</strong><div className="coach-choices">{choices.map((choice) => <button type="button" key={choice} className={readiness[key] === choice ? "active" : ""} aria-pressed={readiness[key] === choice} onClick={() => setReadiness((current) => ({ ...current, [key]: choice }))}>{choice}</button>)}</div></div>
          ))}
        </div>
      </Card>
      {error && <p className="coach-error" role="alert">{error}</p>}
      {analysis && <section className="coach-analysis-output" aria-live="polite"><strong>Et par ord fra din coach</strong><div>{analysis}</div></section>}
      <details className="coach-data-details">
        <summary>Se data bag coachens vurdering</summary>
        <div className="coach-data-details-content">
          <div className="coach-mini"><small>LØB DE SENESTE 12 UGER</small><strong>{activityCount} aktiviteter</strong></div>
          <div className="coach-mini"><small>DISTANCE DE SENESTE 4 UGER</small><strong>{new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1 }).format(recentKm)} km</strong></div>
          <div className="coach-chart">{recentWeeks.map((week) => <div className="coach-chart-col" key={week.weekStart}><span>{new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "short" }).format(new Date(`${week.weekStart}T12:00:00`))}</span><div className="coach-chart-bar" style={{ height: `${Math.max(3, (week.distanceKm / maxWeeklyKm) * 68)}px` }} /><strong>{week.distanceKm} km</strong></div>)}</div>
        </div>
      </details>
      <p className="coach-small-copy">AI-råd er generelle træningsforslag, ikke medicinsk rådgivning. Stop eller nedjustér ved smerter eller usædvanlig utilpashed.</p>
    </div>
  );
}
PLACEHOLDER
