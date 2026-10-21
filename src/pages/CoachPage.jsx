import { useMemo, useState } from "react";
import { Bot, RefreshCw, Sparkles } from "lucide-react";
import Card from "../components/Card";
import PageTitle from "../components/PageTitle";
import {
  RACE_GOAL_STORAGE_KEY,
  SELECTED_PLAN_STORAGE_KEY,
  getTrainingPlans,
} from "../services/trainingPlanLibrary";
import { getStravaDeviceId, stravaApi } from "../services/stravaClient";
import "../styles/coach.css";

const STRAVA_DATA_KEY = "hlm_runhub.strava.data.v1";
const WEEKS_TO_ANALYZE = 12;
const LEVEL_LABELS = {
  base: "Base",
  build: "Build",
  performance: "Performance",
};

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonday(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function shiftDate(date, days) {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

function readStoredGoal() {
  const value = window.localStorage.getItem(RACE_GOAL_STORAGE_KEY);
  if (!value) return null;
  const goal = JSON.parse(value);
  if (
    !goal ||
    typeof goal.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(goal.date) ||
    !Number.isFinite(goal.distanceKm) ||
    !LEVEL_LABELS[goal.level]
  ) {
    throw new Error("Dit gemte race-mål har et ugyldigt format.");
  }
  const [year, month, day] = goal.date.split("-").map(Number);
  const raceDate = new Date(year, month - 1, day, 12);
  if (dateKey(raceDate) !== goal.date) {
    throw new Error("Datoen i dit gemte race-mål er ugyldig.");
  }
  return { distanceKm: goal.distanceKm, level: goal.level, raceDate };
}

function getCoachInputs() {
  const storedData = JSON.parse(
    window.localStorage.getItem(STRAVA_DATA_KEY) ?? "{}",
  );
  const activities = Array.isArray(storedData.activities)
    ? storedData.activities
    : [];
  const goal = readStoredGoal();
  const plans = getTrainingPlans();
  const selectedPlanId = window.localStorage.getItem(SELECTED_PLAN_STORAGE_KEY);
  const matchingPlans = goal
    ? plans.filter(
        (plan) =>
          Math.abs(plan.distanceKm - goal.distanceKm) < 0.01 &&
          plan.level === goal.level,
      )
    : [];
  const plan =
    matchingPlans.find(({ id }) => id === selectedPlanId) ??
    matchingPlans[0] ??
    null;
  const currentMonday = getMonday(new Date());
  const weeklyActivityMap = new Map();

  for (const activity of activities) {
    if (
      typeof activity.startDateLocal !== "string" ||
      !Number.isFinite(activity.distanceKm) ||
      activity.distanceKm < 0
    ) {
      continue;
    }
    const activityDate = new Date(`${activity.startDateLocal.slice(0, 10)}T12:00:00`);
    if (Number.isNaN(activityDate.getTime())) continue;
    const weekStart = dateKey(getMonday(activityDate));
    const week = weeklyActivityMap.get(weekStart) ?? {
      weekStart,
      runCount: 0,
      distanceKm: 0,
      longestRunKm: 0,
      movingTimeSeconds: 0,
    };
    week.runCount += 1;
    week.distanceKm += activity.distanceKm;
    week.longestRunKm = Math.max(week.longestRunKm, activity.distanceKm);
    week.movingTimeSeconds += Number.isFinite(activity.movingTime)
      ? activity.movingTime
      : 0;
    weeklyActivityMap.set(weekStart, week);
  }

  const weeks = Array.from({ length: WEEKS_TO_ANALYZE }, (_, index) => {
    const monday = shiftDate(
      currentMonday,
      -7 * (WEEKS_TO_ANALYZE - index - 1),
    );
    const week = weeklyActivityMap.get(dateKey(monday)) ?? {
      weekStart: dateKey(monday),
      runCount: 0,
      distanceKm: 0,
      longestRunKm: 0,
      movingTimeSeconds: 0,
    };
    return {
      weekStart: week.weekStart,
      runCount: week.runCount,
      distanceKm: Number(week.distanceKm.toFixed(1)),
      longestRunKm: Number(week.longestRunKm.toFixed(1)),
      averagePaceSecondsPerKm:
        week.distanceKm > 0 && week.movingTimeSeconds > 0
          ? Math.round(week.movingTimeSeconds / week.distanceKm)
          : null,
    };
  });
  const recentWeeks = weeks.slice(-4);
  const averageWeeklyKm =
    recentWeeks.reduce((total, week) => total + week.distanceKm, 0) /
    recentWeeks.length;
  const planWeekIndex =
    plan && goal
      ? Math.round(
          (currentMonday.getTime() -
            shiftDate(
              getMonday(goal.raceDate),
              -7 * (plan.weeklyKilometers.length - 1),
            ).getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        )
      : -1;

  return {
    connected: storedData.connected === true,
    athleteName: storedData.athleteName ?? "",
    goal,
    plan,
    planWeekIndex,
    weeks,
    activityCount: weeks.reduce((total, week) => total + week.runCount, 0),
    averageWeeklyKm: Number(averageWeeklyKm.toFixed(1)),
  };
}

function getInitialCoachState() {
  try {
    return { inputs: getCoachInputs(), error: "" };
  } catch (error) {
    return {
      inputs: {
        connected: false,
        athleteName: "",
        goal: null,
        plan: null,
        planWeekIndex: -1,
        weeks: [],
        activityCount: 0,
        averageWeeklyKm: 0,
      },
      error: `Træningsdata kunne ikke indlæses: ${error.message}`,
    };
  }
}

function createCoachPayload(inputs) {
  const goal = inputs.goal
    ? {
        distanceKm: inputs.goal.distanceKm,
        raceDate: dateKey(inputs.goal.raceDate),
        weeksUntilRace: Math.ceil(
          (getMonday(inputs.goal.raceDate).getTime() -
            getMonday(new Date()).getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        ),
        level: inputs.goal.level,
      }
    : null;
  const plan =
    inputs.plan && inputs.planWeekIndex >= 0
      ? {
          level: inputs.plan.level,
          distanceKm: inputs.plan.distanceKm,
          upcomingWeeklyTargetsKm: inputs.plan.weeklyKilometers
            .slice(inputs.planWeekIndex, inputs.planWeekIndex + 12)
            .map((kilometers) => Number(kilometers.toFixed(1))),
        }
      : null;

  return { goal, plan, weeks: inputs.weeks };
}

const weekLabel = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
});

export default function CoachPage({ setPage }) {
  const [inputState, setInputState] = useState(getInitialCoachState);
  const { inputs, error: inputError } = inputState;
  const [analysis, setAnalysis] = useState("");
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);
  const deviceId = useMemo(() => getStravaDeviceId(), []);
  const totalWeeksWithRuns = inputs.weeks.filter(
    ({ runCount }) => runCount > 0,
  ).length;

  function refreshInputs() {
    try {
      setInputState({ inputs: getCoachInputs(), error: "" });
      setAnalysis("");
      setRequestError("");
    } catch (error) {
      setInputState((current) => ({
        ...current,
        error: `Træningsdata kunne ikke indlæses: ${error.message}`,
      }));
    }
  }

  async function requestAnalysis() {
    setLoading(true);
    setRequestError("");
    setAnalysis("");
    try {
      const result = await stravaApi(deviceId, "/api/runhub/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createCoachPayload(inputs)),
      });
      if (typeof result.analysis !== "string" || !result.analysis.trim()) {
        throw new Error("AI-coachen returnerede ikke en analyse.");
      }
      setAnalysis(result.analysis);
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const runButtonDisabled = loading || !inputs.connected || inputs.activityCount === 0;

  return (
    <>
      <PageTitle
        eyebrow="PERSONLIG TRÆNING"
        title="AI Coach"
        description="Få en træningsanalyse, der sætter dine seneste løbeture i perspektiv af dit mål og din plan."
      />
      <Card className="coach-privacy">
        <div className="coach-privacy-icon" aria-hidden="true">
          <Bot size={22} />
        </div>
        <div>
          <strong>Kun ugentlige opsummeringer deles</strong>
          <p>
            Coachen modtager dit mål, planens ugentlige kilometermål og
            aggregerede tal for de seneste 12 uger. Aktivitetsnavne, ID’er,
            GPS-data og individuelle løbeture sendes ikke.
            Analysen bruger Cloudflare Workers AI og kan være underlagt
            kontoens forbrugsgrænser og priser.
          </p>
        </div>
        <button
          type="button"
          className="coach-refresh"
          onClick={refreshInputs}
          aria-label="Genindlæs træningsdata"
          title="Genindlæs træningsdata"
        >
          <RefreshCw size={17} />
        </button>
      </Card>

      {inputError && <p className="coach-error" role="alert">{inputError}</p>}

      <div className="coach-overview">
        <Card className="coach-overview-card">
          <small>STRAVA</small>
          <strong>
            {inputs.connected
              ? `${inputs.activityCount} løb de seneste 12 uger`
              : "Ikke forbundet"}
          </strong>
          <span>
            {inputs.connected
              ? `${totalWeeksWithRuns} aktive uger · ${inputs.averageWeeklyKm} km/uge i de seneste 4 uger`
              : "Forbind Strava på træningssiden for at dele dine træningsopsummeringer."}
          </span>
          {!inputs.connected && (
            <button type="button" onClick={() => setPage("training")}>
              Gå til Træning
            </button>
          )}
        </Card>
        <Card className="coach-overview-card">
          <small>DIT MÅL</small>
          {inputs.goal ? (
            <>
              <strong>{inputs.goal.distanceKm} km · {LEVEL_LABELS[inputs.goal.level]}</strong>
              <span>
                Løbsdato: {new Intl.DateTimeFormat("da-DK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(inputs.goal.raceDate)}
              </span>
            </>
          ) : (
            <>
              <strong>Intet personligt mål valgt</strong>
              <span>Coachen kan stadig se træningen, men får ikke et konkret løbsmål.</span>
              <button type="button" onClick={() => setPage("race")}>
                Vælg et mål
              </button>
            </>
          )}
        </Card>
        <Card className="coach-overview-card">
          <small>TRÆNINGSPLAN</small>
          {inputs.plan ? (
            <>
              <strong>{inputs.plan.name}</strong>
              <span>
                {inputs.planWeekIndex >= 0
                  ? `${inputs.plan.weeklyKilometers[inputs.planWeekIndex]} km planlagt denne uge`
                  : "Plan ikke aktiv for den aktuelle uge"}
              </span>
            </>
          ) : (
            <>
              <strong>Ingen matchende plan valgt</strong>
              <span>Vælg en plan under Race Center for at sammenligne træningsmængden.</span>
              <button type="button" onClick={() => setPage("race")}>
                Se træningsplaner
              </button>
            </>
          )}
        </Card>
      </div>

      <Card className="coach-analysis-card">
        <div className="coach-analysis-heading">
          <div className="coach-privacy-icon" aria-hidden="true">
            <Sparkles size={21} />
          </div>
          <div>
            <h2>Din træningsanalyse</h2>
            <p>Coachen ser efter kontinuitet, belastningsudvikling og afstand til målet.</p>
          </div>
        </div>
        <div className="coach-weekly-summary">
          {inputs.weeks.slice(-8).map((week) => (
            <div key={week.weekStart}>
              <span>{weekLabel.format(new Date(`${week.weekStart}T12:00:00`))}</span>
              <div aria-label={`${week.distanceKm} kilometer`}>
                <i style={{ height: `${Math.max(3, Math.min(100, (week.distanceKm / Math.max(1, ...inputs.weeks.map((item) => item.distanceKm))) * 100))}%` }} />
              </div>
              <strong>{week.distanceKm} km</strong>
            </div>
          ))}
        </div>
        {!inputs.connected && (
          <p className="coach-notice">
            Forbind Strava først. Kun ugentlige summer og løbsantal sendes til AI-coachen.
          </p>
        )}
        {inputs.connected && inputs.activityCount === 0 && (
          <p className="coach-notice">
            Der er ingen importerede løbeture i de seneste 12 uger. Synkronisér Strava under Træning, og genindlæs data her.
          </p>
        )}
        <button
          type="button"
          className="primary coach-analyze-button"
          onClick={requestAnalysis}
          disabled={runButtonDisabled}
        >
          <Sparkles size={17} />
          {loading ? "Analyserer træningen..." : "Analyser min træning"}
        </button>
        {requestError && <p className="coach-error" role="alert">{requestError}</p>}
        {analysis && (
          <section className="coach-analysis-result" aria-live="polite">
            <h3>Forslag fra din AI-coach</h3>
            <div>{analysis}</div>
            <p>
              AI-råd er generelle træningsforslag, ikke medicinsk rådgivning.
              Justér efter dagsform, og søg faglig hjælp ved smerter eller
              vedvarende gener.
            </p>
          </section>
        )}
      </Card>
    </>
  );
}
