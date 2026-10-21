import { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Gauge,
  HeartPulse,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
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
const RECENT_ACTIVITIES_TO_SHARE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const LEVEL_LABELS = {
  base: "Base",
  build: "Build",
  performance: "Performance",
};

const RUN_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

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

function safeNumber(...values) {
  for (const value of values) {
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values) {
  const validValues = values.filter(Number.isFinite);
  if (!validValues.length) return null;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function standardDeviation(values) {
  const validValues = values.filter(Number.isFinite);
  if (validValues.length < 2) return 0;
  const mean = average(validValues);
  const variance = average(validValues.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function parseActivityDate(activity) {
  const value = activity.startDateLocal ?? activity.start_date_local ?? activity.startDate;
  if (typeof value !== "string" || value.length < 10) return null;
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function activityDistanceKm(activity) {
  const direct = safeNumber(activity.distanceKm);
  if (direct !== null) return direct;
  const meters = safeNumber(activity.distanceMeters, activity.distance);
  return meters !== null ? meters / 1000 : null;
}

function activityMovingTime(activity) {
  return safeNumber(
    activity.movingTimeSeconds,
    activity.movingTime,
    activity.moving_time,
  );
}

function activityElevation(activity) {
  return safeNumber(
    activity.totalElevationGainMeters,
    activity.totalElevationGain,
    activity.total_elevation_gain,
  );
}

function activityAverageHeartRate(activity) {
  return safeNumber(
    activity.averageHeartRate,
    activity.averageHeartrate,
    activity.average_heartrate,
  );
}

function activityMaxHeartRate(activity) {
  return safeNumber(activity.maxHeartRate, activity.maxHeartrate, activity.max_heartrate);
}

function activityAverageWatts(activity) {
  return safeNumber(activity.averageWatts, activity.average_watts);
}

function activityWeightedWatts(activity) {
  return safeNumber(activity.weightedAverageWatts, activity.weighted_average_watts);
}

function activityCadence(activity) {
  return safeNumber(activity.averageCadence, activity.average_cadence);
}

function isRunningActivity(activity) {
  const type = activity.sportType ?? activity.sport_type ?? activity.type;
  return !type || RUN_TYPES.has(type);
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

function estimateIntensity(activity, paceSecondsPerKm) {
  const explicit = String(
    activity.intensity ?? activity.intensityZone ?? activity.workoutType ?? "",
  ).toLowerCase();

  if (/interval|tempo|threshold|race|hard|speed/.test(explicit)) return "hard";
  if (/easy|recovery|rolig|let/.test(explicit)) return "easy";

  const relativeEffort = safeNumber(activity.sufferScore, activity.suffer_score);
  if (relativeEffort !== null) {
    if (relativeEffort >= 100) return "hard";
    if (relativeEffort >= 50) return "moderate";
    return "easy";
  }

  const averageHr = activityAverageHeartRate(activity);
  const maxHr = activityMaxHeartRate(activity);
  if (averageHr !== null && maxHr !== null && maxHr > 0) {
    const ratio = averageHr / maxHr;
    if (ratio >= 0.88) return "hard";
    if (ratio >= 0.78) return "moderate";
    return "easy";
  }

  if (Number.isFinite(paceSecondsPerKm)) return "unknown";
  return "unknown";
}

function calculateTrainingLoad(activity, distanceKm, movingTimeSeconds) {
  const relativeEffort = safeNumber(activity.sufferScore, activity.suffer_score);
  if (relativeEffort !== null && relativeEffort >= 0) return relativeEffort;

  const hours = Number.isFinite(movingTimeSeconds) ? movingTimeSeconds / 3600 : 0;
  const averageHr = activityAverageHeartRate(activity);
  const maxHr = activityMaxHeartRate(activity);
  const averageWatts = activityAverageWatts(activity);
  const weightedWatts = activityWeightedWatts(activity);

  if (hours > 0 && averageHr !== null && maxHr !== null && maxHr > 0) {
    return hours * 100 * Math.max(0.5, Math.min(1.5, (averageHr / maxHr) ** 2));
  }

  if (hours > 0 && averageWatts !== null && weightedWatts !== null && averageWatts > 0) {
    return hours * 100 * Math.max(0.5, Math.min(1.5, weightedWatts / averageWatts));
  }

  return Math.max(0, distanceKm * 1.5);
}

function createEmptyWeek(weekStart) {
  return {
    weekStart,
    runCount: 0,
    runningDays: new Set(),
    distanceKm: 0,
    longestRunKm: 0,
    movingTimeSeconds: 0,
    elevationGainMeters: 0,
    trainingLoad: 0,
    easyKm: 0,
    moderateKm: 0,
    hardKm: 0,
    unknownIntensityKm: 0,
    weightedHeartRate: 0,
    heartRateSeconds: 0,
    weightedWatts: 0,
    wattsSeconds: 0,
    cadenceValues: [],
  };
}

function summarizeActivity(activity) {
  const activityDate = parseActivityDate(activity);
  const distanceKm = activityDistanceKm(activity);
  const movingTimeSeconds = activityMovingTime(activity);
  const paceSecondsPerKm =
    Number.isFinite(distanceKm) && distanceKm > 0 && Number.isFinite(movingTimeSeconds)
      ? movingTimeSeconds / distanceKm
      : null;

  return {
    date: activityDate ? dateKey(activityDate) : null,
    distanceKm: round(distanceKm, 2),
    movingTimeSeconds: movingTimeSeconds ?? null,
    paceSecondsPerKm: paceSecondsPerKm ? Math.round(paceSecondsPerKm) : null,
    elevationGainMeters: round(activityElevation(activity), 0),
    averageHeartRate: round(activityAverageHeartRate(activity), 0),
    maxHeartRate: round(activityMaxHeartRate(activity), 0),
    averageWatts: round(activityAverageWatts(activity), 0),
    weightedAverageWatts: round(activityWeightedWatts(activity), 0),
    averageCadence: round(activityCadence(activity), 0),
    intensity: estimateIntensity(activity, paceSecondsPerKm),
    trainingLoad: round(
      calculateTrainingLoad(activity, distanceKm ?? 0, movingTimeSeconds ?? 0),
      1,
    ),
  };
}

function calculateBestEfforts(activities) {
  const targets = [5, 10, 21.0975, 42.195];
  const result = {};

  for (const target of targets) {
    const candidates = activities
      .map(summarizeActivity)
      .filter(
        (activity) =>
          Number.isFinite(activity.distanceKm) &&
          activity.distanceKm >= target &&
          Number.isFinite(activity.paceSecondsPerKm),
      )
      .map((activity) => ({
        seconds: Math.round(activity.paceSecondsPerKm * target),
        date: activity.date,
      }))
      .sort((a, b) => a.seconds - b.seconds);

    result[String(target)] = candidates[0] ?? null;
  }

  return result;
}

function getCoachInputs() {
  const storedData = JSON.parse(window.localStorage.getItem(STRAVA_DATA_KEY) ?? "{}");
  const rawActivities = Array.isArray(storedData.activities) ? storedData.activities : [];
  const activities = rawActivities
    .filter(isRunningActivity)
    .map((activity) => ({ activity, date: parseActivityDate(activity) }))
    .filter(({ date }) => date)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(({ activity }) => activity);

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
  const plan = matchingPlans.find(({ id }) => id === selectedPlanId) ?? matchingPlans[0] ?? null;

  const currentMonday = getMonday(new Date());
  const firstAnalyzedMonday = shiftDate(currentMonday, -7 * (WEEKS_TO_ANALYZE - 1));
  const weeklyActivityMap = new Map();

  for (const activity of activities) {
    const activityDate = parseActivityDate(activity);
    const distanceKm = activityDistanceKm(activity);
    if (!activityDate || !Number.isFinite(distanceKm) || distanceKm < 0) continue;

    const activityMonday = getMonday(activityDate);
    if (activityMonday < firstAnalyzedMonday || activityMonday > shiftDate(currentMonday, 6)) continue;

    const weekStart = dateKey(activityMonday);
    const week = weeklyActivityMap.get(weekStart) ?? createEmptyWeek(weekStart);
    const movingTimeSeconds = activityMovingTime(activity) ?? 0;
    const paceSecondsPerKm = distanceKm > 0 && movingTimeSeconds > 0
      ? movingTimeSeconds / distanceKm
      : null;
    const intensity = estimateIntensity(activity, paceSecondsPerKm);
    const averageHr = activityAverageHeartRate(activity);
    const averageWatts = activityAverageWatts(activity);
    const cadence = activityCadence(activity);

    week.runCount += 1;
    week.runningDays.add(dateKey(activityDate));
    week.distanceKm += distanceKm;
    week.longestRunKm = Math.max(week.longestRunKm, distanceKm);
    week.movingTimeSeconds += movingTimeSeconds;
    week.elevationGainMeters += activityElevation(activity) ?? 0;
    week.trainingLoad += calculateTrainingLoad(activity, distanceKm, movingTimeSeconds);
    week[`${intensity === "unknown" ? "unknownIntensity" : intensity}Km`] += distanceKm;

    if (averageHr !== null && movingTimeSeconds > 0) {
      week.weightedHeartRate += averageHr * movingTimeSeconds;
      week.heartRateSeconds += movingTimeSeconds;
    }
    if (averageWatts !== null && movingTimeSeconds > 0) {
      week.weightedWatts += averageWatts * movingTimeSeconds;
      week.wattsSeconds += movingTimeSeconds;
    }
    if (cadence !== null) week.cadenceValues.push(cadence);

    weeklyActivityMap.set(weekStart, week);
  }

  const weeks = Array.from({ length: WEEKS_TO_ANALYZE }, (_, index) => {
    const monday = shiftDate(currentMonday, -7 * (WEEKS_TO_ANALYZE - index - 1));
    const week = weeklyActivityMap.get(dateKey(monday)) ?? createEmptyWeek(dateKey(monday));
    const runningDays = [...week.runningDays].sort();
    const restGaps = runningDays.slice(1).map((day, dayIndex) => {
      const previous = new Date(`${runningDays[dayIndex]}T12:00:00`);
      const current = new Date(`${day}T12:00:00`);
      return Math.max(0, Math.round((current - previous) / DAY_MS) - 1);
    });

    return {
      weekStart: week.weekStart,
      runCount: week.runCount,
      runningDays: runningDays.length,
      averageRestDaysBetweenRuns: round(average(restGaps), 1),
      distanceKm: round(week.distanceKm, 1) ?? 0,
      longestRunKm: round(week.longestRunKm, 1) ?? 0,
      longRunSharePercent: week.distanceKm > 0
        ? round((week.longestRunKm / week.distanceKm) * 100, 1)
        : 0,
      movingTimeSeconds: Math.round(week.movingTimeSeconds),
      averagePaceSecondsPerKm:
        week.distanceKm > 0 && week.movingTimeSeconds > 0
          ? Math.round(week.movingTimeSeconds / week.distanceKm)
          : null,
      elevationGainMeters: Math.round(week.elevationGainMeters),
      trainingLoad: round(week.trainingLoad, 1) ?? 0,
      easyKm: round(week.easyKm, 1) ?? 0,
      moderateKm: round(week.moderateKm, 1) ?? 0,
      hardKm: round(week.hardKm, 1) ?? 0,
      unknownIntensityKm: round(week.unknownIntensityKm, 1) ?? 0,
      averageHeartRate: week.heartRateSeconds > 0
        ? Math.round(week.weightedHeartRate / week.heartRateSeconds)
        : null,
      averageWatts: week.wattsSeconds > 0
        ? Math.round(week.weightedWatts / week.wattsSeconds)
        : null,
      averageCadence: round(average(week.cadenceValues), 0),
    };
  });

  const recentWeeks = weeks.slice(-4);
  const previousWeeks = weeks.slice(-8, -4);
  const averageWeeklyKm = average(recentWeeks.map((week) => week.distanceKm)) ?? 0;
  const previousAverageWeeklyKm = average(previousWeeks.map((week) => week.distanceKm)) ?? 0;
  const acuteLoad = average(recentWeeks.slice(-1).map((week) => week.trainingLoad)) ?? 0;
  const chronicLoad = average(weeks.slice(-6).map((week) => week.trainingLoad)) ?? 0;
  const rampRatePercent = chronicLoad > 0 ? ((acuteLoad - chronicLoad) / chronicLoad) * 100 : null;
  const activeWeeks = weeks.filter((week) => week.runCount > 0);
  const distanceVariation = activeWeeks.length
    ? standardDeviation(activeWeeks.map((week) => week.distanceKm)) /
      Math.max(1, average(activeWeeks.map((week) => week.distanceKm)))
    : 1;
  const activeWeekShare = activeWeeks.length / WEEKS_TO_ANALYZE;
  const frequencyShare = Math.min(
    1,
    (average(activeWeeks.map((week) => Math.min(week.runningDays, 5))) ?? 0) / 4,
  );
  const consistencyScore = Math.round(
    Math.max(0, Math.min(100, activeWeekShare * 55 + frequencyShare * 30 + (1 - Math.min(1, distanceVariation)) * 15)),
  );

  const planWeekIndex =
    plan && goal
      ? Math.round(
          (currentMonday.getTime() -
            shiftDate(
              getMonday(goal.raceDate),
              -7 * (plan.weeklyKilometers.length - 1),
            ).getTime()) /
            WEEK_MS,
        )
      : -1;

  return {
    connected: storedData.connected === true,
    athleteName: storedData.athleteName ?? "",
    goal,
    plan,
    planWeekIndex,
    weeks,
    recentActivities: activities.slice(0, RECENT_ACTIVITIES_TO_SHARE).map(summarizeActivity),
    bestEfforts: calculateBestEfforts(activities),
    activityCount: weeks.reduce((total, week) => total + week.runCount, 0),
    averageWeeklyKm: round(averageWeeklyKm, 1) ?? 0,
    trends: {
      previousAverageWeeklyKm: round(previousAverageWeeklyKm, 1) ?? 0,
      volumeChangePercent: previousAverageWeeklyKm > 0
        ? round(((averageWeeklyKm - previousAverageWeeklyKm) / previousAverageWeeklyKm) * 100, 1)
        : null,
      acuteLoad: round(acuteLoad, 1) ?? 0,
      chronicLoad: round(chronicLoad, 1) ?? 0,
      rampRatePercent: round(rampRatePercent, 1),
      consistencyScore,
    },
    availableSignals: {
      heartRate: activities.some((activity) => activityAverageHeartRate(activity) !== null),
      power: activities.some((activity) => activityAverageWatts(activity) !== null),
      elevation: activities.some((activity) => activityElevation(activity) !== null),
      cadence: activities.some((activity) => activityCadence(activity) !== null),
    },
  };
}

function emptyCoachInputs() {
  return {
    connected: false,
    athleteName: "",
    goal: null,
    plan: null,
    planWeekIndex: -1,
    weeks: [],
    recentActivities: [],
    bestEfforts: {},
    activityCount: 0,
    averageWeeklyKm: 0,
    trends: {
      previousAverageWeeklyKm: 0,
      volumeChangePercent: null,
      acuteLoad: 0,
      chronicLoad: 0,
      rampRatePercent: null,
      consistencyScore: 0,
    },
    availableSignals: {
      heartRate: false,
      power: false,
      elevation: false,
      cadence: false,
    },
  };
}

function getInitialCoachState() {
  try {
    return { inputs: getCoachInputs(), error: "" };
  } catch (error) {
    return {
      inputs: emptyCoachInputs(),
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
          (getMonday(inputs.goal.raceDate).getTime() - getMonday(new Date()).getTime()) /
            WEEK_MS,
        ),
        level: inputs.goal.level,
      }
    : null;

  const plan =
    inputs.plan && inputs.planWeekIndex >= 0
      ? {
          name: inputs.plan.name,
          level: inputs.plan.level,
          distanceKm: inputs.plan.distanceKm,
          currentWeekIndex: inputs.planWeekIndex,
          upcomingWeeklyTargetsKm: inputs.plan.weeklyKilometers
            .slice(inputs.planWeekIndex, inputs.planWeekIndex + 12)
            .map((kilometers) => round(kilometers, 1)),
        }
      : null;

  return {
    schemaVersion: 2,
    goal,
    plan,
    trends: inputs.trends,
    availableSignals: inputs.availableSignals,
    bestEfforts: inputs.bestEfforts,
    weeks: inputs.weeks,
    recentActivities: inputs.recentActivities,
    privacy: {
      excludesActivityNames: true,
      excludesActivityIds: true,
      excludesGpsData: true,
    },
  };
}

function formatPace(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "–";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")} min/km`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "–";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = Math.round(seconds % 60);
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${minutes}:${String(rest).padStart(2, "0")}`;
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
  const totalWeeksWithRuns = inputs.weeks.filter(({ runCount }) => runCount > 0).length;
  const latestWeek = inputs.weeks.at(-1);
  const maxWeeklyDistance = Math.max(1, ...inputs.weeks.map((week) => week.distanceKm));

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
        description="Få konkrete træningsråd baseret på kontinuitet, belastning, intensitet, puls, watt og dit næste løbsmål."
      />

      <Card className="coach-privacy">
        <div className="coach-privacy-icon" aria-hidden="true">
          <Bot size={22} />
        </div>
        <div>
          <strong>Detaljer nok til coaching, uden identitet og GPS</strong>
          <p>
            Coachen modtager ugentlige summer og op til {RECENT_ACTIVITIES_TO_SHARE} anonymiserede
            løb med distance, tid, tempo, højdemeter og tilgængelige puls-, watt- og kadencetal.
            Aktivitetsnavne, Strava-ID'er og GPS-data sendes ikke.
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
            {inputs.connected ? `${inputs.activityCount} løb på 12 uger` : "Ikke forbundet"}
          </strong>
          <span>
            {inputs.connected
              ? `${totalWeeksWithRuns} aktive uger · ${inputs.averageWeeklyKm} km/uge de seneste 4 uger`
              : "Forbind Strava på træningssiden for at bruge coachen."}
          </span>
          {!inputs.connected && (
            <button type="button" onClick={() => setPage("training")}>Gå til Træning</button>
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
              <span>Coachen kan analysere træningen, men kan ikke styre den mod et bestemt løb.</span>
              <button type="button" onClick={() => setPage("race")}>Vælg et mål</button>
            </>
          )}
        </Card>

        <Card className="coach-overview-card">
          <small>TRÆNINGSPLAN</small>
          {inputs.plan ? (
            <>
              <strong>{inputs.plan.name}</strong>
              <span>
                {inputs.planWeekIndex >= 0 && inputs.plan.weeklyKilometers[inputs.planWeekIndex] !== undefined
                  ? `${inputs.plan.weeklyKilometers[inputs.planWeekIndex]} km planlagt denne uge`
                  : "Planen er ikke aktiv i den aktuelle uge"}
              </span>
            </>
          ) : (
            <>
              <strong>Ingen matchende plan valgt</strong>
              <span>Vælg en plan for at få råd om afvigelser og kommende uger.</span>
              <button type="button" onClick={() => setPage("race")}>Se træningsplaner</button>
            </>
          )}
        </Card>
      </div>

      <div className="coach-metrics-grid">
        <Card className="coach-metric-card">
          <TrendingUp size={19} aria-hidden="true" />
          <small>KONTINUITET</small>
          <strong>{inputs.trends.consistencyScore}/100</strong>
          <span>Baseret på aktive uger, løbefrekvens og stabilitet.</span>
        </Card>

        <Card className="coach-metric-card">
          <Gauge size={19} aria-hidden="true" />
          <small>BELASTNING</small>
          <strong>{inputs.trends.acuteLoad} / {inputs.trends.chronicLoad}</strong>
          <span>
            Seneste uge mod gennemsnittet af seks uger
            {inputs.trends.rampRatePercent !== null
              ? ` · ${inputs.trends.rampRatePercent > 0 ? "+" : ""}${inputs.trends.rampRatePercent}%`
              : ""}
          </span>
        </Card>

        <Card className="coach-metric-card">
          <Target size={19} aria-hidden="true" />
          <small>LANG TUR</small>
          <strong>{latestWeek ? `${latestWeek.longestRunKm} km` : "–"}</strong>
          <span>
            {latestWeek && latestWeek.distanceKm > 0
              ? `${latestWeek.longRunSharePercent}% af denne uges distance`
              : "Ingen løb registreret i denne uge"}
          </span>
        </Card>

        <Card className="coach-metric-card">
          {inputs.availableSignals.power ? <Zap size={19} aria-hidden="true" /> : <HeartPulse size={19} aria-hidden="true" />}
          <small>TRÆNINGSSIGNALER</small>
          <strong>
            {[
              inputs.availableSignals.heartRate && "Puls",
              inputs.availableSignals.power && "Watt",
              inputs.availableSignals.elevation && "Højde",
              inputs.availableSignals.cadence && "Kadence",
            ].filter(Boolean).join(" · ") || "Kun distance og tid"}
          </strong>
          <span>Coachen bruger kun signaler, der findes i dine importerede aktiviteter.</span>
        </Card>
      </div>

      <Card className="coach-analysis-card">
        <div className="coach-analysis-heading">
          <div className="coach-privacy-icon" aria-hidden="true">
            <Sparkles size={21} />
          </div>
          <div>
            <h2>Din træningsanalyse</h2>
            <p>Coachen vurderer progression, fordeling, restitution og match med mål og plan.</p>
          </div>
        </div>

        <div className="coach-weekly-summary">
          {inputs.weeks.slice(-8).map((week) => (
            <div key={week.weekStart}>
              <span>{weekLabel.format(new Date(`${week.weekStart}T12:00:00`))}</span>
              <div aria-label={`${week.distanceKm} kilometer`}>
                <i style={{ height: `${Math.max(3, Math.min(100, (week.distanceKm / maxWeeklyDistance) * 100))}%` }} />
              </div>
              <strong>{week.distanceKm} km</strong>
            </div>
          ))}
        </div>

        {latestWeek && latestWeek.runCount > 0 && (
          <div className="coach-current-week-details">
            <span><Activity size={16} /> {latestWeek.runCount} ture på {latestWeek.runningDays} løbedage</span>
            <span>Tempo: {formatPace(latestWeek.averagePaceSecondsPerKm)}</span>
            <span>Tid: {formatDuration(latestWeek.movingTimeSeconds)}</span>
            <span>Højdemeter: {latestWeek.elevationGainMeters} m</span>
          </div>
        )}

        {!inputs.connected && (
          <p className="coach-notice">Forbind Strava først for at få en personlig analyse.</p>
        )}

        {inputs.connected && inputs.activityCount === 0 && (
          <p className="coach-notice">
            Der er ingen importerede løbeture i de seneste 12 uger. Synkronisér Strava under
            Træning, og genindlæs derefter data her.
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
            <div className="coach-analysis-text">{analysis}</div>
            <p>
              AI-råd er generelle træningsforslag, ikke medicinsk rådgivning. Stop eller nedjustér
              ved smerter, svimmelhed eller usædvanlig utilpashed, og søg faglig hjælp ved
              vedvarende gener.
            </p>
          </section>
        )}
      </Card>
    </>
  );
}
