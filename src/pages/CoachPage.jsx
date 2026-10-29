import { useMemo, useState } from "react";
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronUp,
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
const VDOT_ACTIVITIES = 10;
const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;
const RUN_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);
const LEVEL_LABELS = { base: "Base", build: "Build", performance: "Performance" };

function safeNumber(...values) {
  return values.find(Number.isFinite) ?? null;
}
function round(value, digits = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
function average(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}
function standardDeviation(values) {
  const valid = values.filter(Number.isFinite);
  if (valid.length < 2) return 0;
  const mean = average(valid);
  return Math.sqrt(average(valid.map((value) => (value - mean) ** 2)));
}
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
  return safeNumber(activity.movingTimeSeconds, activity.movingTime, activity.moving_time);
}
function activityElevation(activity) {
  return safeNumber(activity.totalElevationGainMeters, activity.totalElevationGain, activity.total_elevation_gain);
}
function activityAverageHeartRate(activity) {
  return safeNumber(activity.averageHeartRate, activity.averageHeartrate, activity.average_heartrate);
}
function activityMaxHeartRate(activity) {
  return safeNumber(activity.maxHeartRate, activity.maxHeartrate, activity.max_heartrate);
}
function activityAverageWatts(activity) {
  return safeNumber(activity.averageWatts, activity.average_watts);
}
function activityCadence(activity) {
  return safeNumber(activity.averageCadence, activity.average_cadence);
}
function isRunningActivity(activity) {
  const type = activity.sportType ?? activity.sport_type ?? activity.type;
  return !type || RUN_TYPES.has(type);
}
function estimateIntensity(activity, paceSecondsPerKm) {
  const explicit = String(activity.intensity ?? activity.intensityZone ?? activity.workoutType ?? activity.name ?? "").toLowerCase();
  if (/interval|tempo|threshold|tærskel|race|hard|speed|test|5k|10k/.test(explicit)) return "hard";
  if (/easy|recovery|rolig|let/.test(explicit)) return "easy";
  const effort = safeNumber(activity.sufferScore, activity.suffer_score);
  if (effort !== null) return effort >= 100 ? "hard" : effort >= 50 ? "moderate" : "easy";
  const averageHr = activityAverageHeartRate(activity);
  const maxHr = activityMaxHeartRate(activity);
  if (averageHr !== null && maxHr > 0) {
    const ratio = averageHr / maxHr;
    return ratio >= 0.88 ? "hard" : ratio >= 0.78 ? "moderate" : "easy";
  }
  return Number.isFinite(paceSecondsPerKm) ? "unknown" : "unknown";
}
function calculateTrainingLoad(activity, distanceKm, movingTimeSeconds) {
  const effort = safeNumber(activity.sufferScore, activity.suffer_score);
  if (effort !== null && effort >= 0) return effort;
  const hours = movingTimeSeconds > 0 ? movingTimeSeconds / 3600 : 0;
  const averageHr = activityAverageHeartRate(activity);
  const maxHr = activityMaxHeartRate(activity);
  if (hours > 0 && averageHr !== null && maxHr > 0) {
    return hours * 100 * Math.max(0.5, Math.min(1.5, (averageHr / maxHr) ** 2));
  }
  return Math.max(0, distanceKm * 1.5);
}

// Samme Daniels-Gilbert-princip som en klassisk VDOT-beregner.
function calculateVdot(distanceKm, seconds) {
  if (!(distanceKm > 0) || !(seconds > 0)) return null;
  const minutes = seconds / 60;
  const velocity = (distanceKm * 1000) / minutes;
  const oxygenCost = -4.6 + 0.182258 * velocity + 0.000104 * velocity ** 2;
  const sustainableFraction =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * minutes) +
    0.2989558 * Math.exp(-0.1932605 * minutes);
  const vdot = oxygenCost / sustainableFraction;
  return Number.isFinite(vdot) && vdot > 0 ? vdot : null;
}
function getActivityVdotAssessment(activity, index) {
  const distanceKm = activityDistanceKm(activity);
  const seconds = activityMovingTime(activity);
  const pace = distanceKm > 0 && seconds > 0 ? seconds / distanceKm : null;
  const vdot = calculateVdot(distanceKm, seconds);
  const intensity = estimateIntensity(activity, pace);
  const explicit = String(activity.intensity ?? activity.workoutType ?? activity.name ?? "").toLowerCase();
  const hr = activityAverageHeartRate(activity);
  const maxHr = activityMaxHeartRate(activity);
  const hrRatio = hr !== null && maxHr > 0 ? hr / maxHr : null;
  const explicitPerformance = /race|test|benchmark|5k|10k|tempo|threshold|tærskel|interval|hard/.test(explicit);
  const performanceRelevant =
    Number.isFinite(vdot) &&
    distanceKm >= 3 &&
    seconds >= 10 * 60 &&
    (explicitPerformance || intensity === "hard" || hrRatio >= 0.86);
  const reason = performanceRelevant
    ? explicitPerformance
      ? "Markeret som test eller kvalitet"
      : "Høj registreret intensitet"
    : intensity === "easy"
      ? "Rolig tur frasorteret"
      : distanceKm < 3
        ? "For kort til robust estimat"
        : "Ingen tydelig maksimal indsats";
  return {
    index,
    date: parseActivityDate(activity),
    distanceKm,
    seconds,
    pace,
    vdot: round(vdot, 1),
    performanceRelevant,
    reason,
  };
}
function estimateCoachVdot(activities) {
  const assessments = activities.slice(0, VDOT_ACTIVITIES).map(getActivityVdotAssessment);
  const eligible = assessments.filter((item) => item.performanceRelevant && Number.isFinite(item.vdot));
  if (!eligible.length) {
    return { estimate: null, confidence: "Begrænset", assessments, eligibleCount: 0 };
  }
  const weightedSum = eligible.reduce((sum, item) => sum + item.vdot * (VDOT_ACTIVITIES - item.index), 0);
  const weightSum = eligible.reduce((sum, item) => sum + (VDOT_ACTIVITIES - item.index), 0);
  return {
    estimate: round(weightedSum / weightSum, 1),
    confidence: eligible.length >= 5 ? "Godt" : eligible.length >= 3 ? "Moderat" : "Begrænset",
    assessments,
    eligibleCount: eligible.length,
  };
}
function extractNumericVdot(value) {
  if (Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/vdot\s*([0-9]+(?:[.,][0-9]+)?)/i);
    return match ? Number(match[1].replace(",", ".")) : null;
  }
  if (!value || typeof value !== "object") return null;
  for (const key of ["vdot", "targetVdot", "minimumVdot", "minVdot", "requiredVdot", "name", "title", "description"]) {
    const result = extractNumericVdot(value[key]);
    if (Number.isFinite(result)) return result;
  }
  return null;
}
function readStoredVdot() {
  const keys = ["hlm_runhub.performance.vdot.v1", "hlm_runhub.vdot.v1", "runhub.vdot", "vdot"];
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const value = extractNumericVdot(parsed);
      if (Number.isFinite(value)) return round(value, 1);
    } catch {
      const raw = window.localStorage.getItem(key);
      const value = Number(String(raw).replace(",", "."));
      if (Number.isFinite(value)) return round(value, 1);
    }
  }
  return null;
}
function readStoredGoal() {
  const raw = window.localStorage.getItem(RACE_GOAL_STORAGE_KEY);
  if (!raw) return null;
  const goal = JSON.parse(raw);
  if (!goal || typeof goal.date !== "string" || !Number.isFinite(goal.distanceKm) || !LEVEL_LABELS[goal.level]) {
    throw new Error("Dit gemte race-mål har et ugyldigt format.");
  }
  const [year, month, day] = goal.date.split("-").map(Number);
  const raceDate = new Date(year, month - 1, day, 12);
  return { distanceKm: goal.distanceKm, level: goal.level, raceDate };
}
function createEmptyWeek(weekStart) {
  return { weekStart, runCount: 0, runningDays: new Set(), distanceKm: 0, longestRunKm: 0, movingTimeSeconds: 0, elevationGainMeters: 0, trainingLoad: 0, easyKm: 0, moderateKm: 0, hardKm: 0, unknownIntensityKm: 0 };
}
function summarizeActivity(activity) {
  const date = parseActivityDate(activity);
  const distanceKm = activityDistanceKm(activity);
  const seconds = activityMovingTime(activity);
  const pace = distanceKm > 0 && seconds > 0 ? seconds / distanceKm : null;
  return {
    date: date ? dateKey(date) : null,
    distanceKm: round(distanceKm, 2),
    movingTimeSeconds: seconds,
    paceSecondsPerKm: Number.isFinite(pace) ? Math.round(pace) : null,
    elevationGainMeters: round(activityElevation(activity), 0),
    averageHeartRate: round(activityAverageHeartRate(activity), 0),
    averageWatts: round(activityAverageWatts(activity), 0),
    averageCadence: round(activityCadence(activity), 0),
    intensity: estimateIntensity(activity, pace),
    trainingLoad: round(calculateTrainingLoad(activity, distanceKm ?? 0, seconds ?? 0), 1),
  };
}
function getCoachInputs() {
  const stored = JSON.parse(window.localStorage.getItem(STRAVA_DATA_KEY) ?? "{}");
  const activities = (Array.isArray(stored.activities) ? stored.activities : [])
    .filter(isRunningActivity)
    .filter((activity) => parseActivityDate(activity))
    .sort((a, b) => parseActivityDate(b) - parseActivityDate(a));
  const goal = readStoredGoal();
  const plans = getTrainingPlans();
  const selectedPlanId = window.localStorage.getItem(SELECTED_PLAN_STORAGE_KEY);
  const matchingPlans = goal
    ? plans.filter((plan) => Math.abs(plan.distanceKm - goal.distanceKm) < 0.01 && plan.level === goal.level)
    : [];
  const plan = matchingPlans.find(({ id }) => id === selectedPlanId) ?? matchingPlans[0] ?? null;
  const currentMonday = getMonday(new Date());
  const firstMonday = shiftDate(currentMonday, -7 * (WEEKS_TO_ANALYZE - 1));
  const map = new Map();

  activities.forEach((activity) => {
    const date = parseActivityDate(activity);
    const distanceKm = activityDistanceKm(activity);
    if (!date || !Number.isFinite(distanceKm) || distanceKm < 0) return;
    const monday = getMonday(date);
    if (monday < firstMonday || monday > shiftDate(currentMonday, 6)) return;
    const key = dateKey(monday);
    const week = map.get(key) ?? createEmptyWeek(key);
    const seconds = activityMovingTime(activity) ?? 0;
    const pace = distanceKm > 0 && seconds > 0 ? seconds / distanceKm : null;
    const intensity = estimateIntensity(activity, pace);
    week.runCount += 1;
    week.runningDays.add(dateKey(date));
    week.distanceKm += distanceKm;
    week.longestRunKm = Math.max(week.longestRunKm, distanceKm);
    week.movingTimeSeconds += seconds;
    week.elevationGainMeters += activityElevation(activity) ?? 0;
    week.trainingLoad += calculateTrainingLoad(activity, distanceKm, seconds);
    week[`${intensity === "unknown" ? "unknownIntensity" : intensity}Km`] += distanceKm;
    map.set(key, week);
  });

  const weeks = Array.from({ length: WEEKS_TO_ANALYZE }, (_, index) => {
    const monday = shiftDate(currentMonday, -7 * (WEEKS_TO_ANALYZE - index - 1));
    const week = map.get(dateKey(monday)) ?? createEmptyWeek(dateKey(monday));
    return {
      weekStart: week.weekStart,
      runCount: week.runCount,
      runningDays: week.runningDays.size,
      distanceKm: round(week.distanceKm, 1) ?? 0,
      longestRunKm: round(week.longestRunKm, 1) ?? 0,
      movingTimeSeconds: Math.round(week.movingTimeSeconds),
      elevationGainMeters: Math.round(week.elevationGainMeters),
      trainingLoad: round(week.trainingLoad, 1) ?? 0,
      easyKm: round(week.easyKm, 1) ?? 0,
      moderateKm: round(week.moderateKm, 1) ?? 0,
      hardKm: round(week.hardKm, 1) ?? 0,
      unknownIntensityKm: round(week.unknownIntensityKm, 1) ?? 0,
    };
  });

  const recentWeeks = weeks.slice(-4);
  const previousWeeks = weeks.slice(-8, -4);
  const averageWeeklyKm = average(recentWeeks.map((week) => week.distanceKm)) ?? 0;
  const previousAverageWeeklyKm = average(previousWeeks.map((week) => week.distanceKm)) ?? 0;
  const acuteLoad = weeks.at(-1)?.trainingLoad ?? 0;
  const chronicLoad = average(weeks.slice(-6).map((week) => week.trainingLoad)) ?? 0;
  const activeWeeks = weeks.filter((week) => week.runCount > 0);
  const variation = activeWeeks.length
    ? standardDeviation(activeWeeks.map((week) => week.distanceKm)) / Math.max(1, average(activeWeeks.map((week) => week.distanceKm)))
    : 1;
  const activeShare = activeWeeks.length / WEEKS_TO_ANALYZE;
  const frequencyShare = Math.min(1, (average(activeWeeks.map((week) => Math.min(week.runningDays, 5))) ?? 0) / 4);
  const consistencyScore = Math.round(Math.max(0, Math.min(100, activeShare * 55 + frequencyShare * 30 + (1 - Math.min(1, variation)) * 15)));
  const planWeekIndex = plan && goal
    ? Math.round((currentMonday - shiftDate(getMonday(goal.raceDate), -7 * (plan.weeklyKilometers.length - 1))) / WEEK_MS)
    : -1;
  const coachVdot = estimateCoachVdot(activities);
  const storedVdot = readStoredVdot();
  const programVdot = extractNumericVdot(plan);

  return {
    connected: stored.connected === true,
    goal,
    plan,
    planWeekIndex,
    weeks,
    activityCount: weeks.reduce((sum, week) => sum + week.runCount, 0),
    averageWeeklyKm: round(averageWeeklyKm, 1) ?? 0,
    recentActivities: activities.slice(0, RECENT_ACTIVITIES_TO_SHARE).map(summarizeActivity),
    coachVdot,
    storedVdot,
    programVdot,
    trends: {
      previousAverageWeeklyKm: round(previousAverageWeeklyKm, 1) ?? 0,
      volumeChangePercent: previousAverageWeeklyKm > 0 ? round(((averageWeeklyKm - previousAverageWeeklyKm) / previousAverageWeeklyKm) * 100, 1) : null,
      acuteLoad: round(acuteLoad, 1) ?? 0,
      chronicLoad: round(chronicLoad, 1) ?? 0,
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
function emptyInputs() {
  return {
    connected: false, goal: null, plan: null, planWeekIndex: -1, weeks: [], activityCount: 0,
    averageWeeklyKm: 0, recentActivities: [], storedVdot: null, programVdot: null,
    coachVdot: { estimate: null, confidence: "Begrænset", assessments: [], eligibleCount: 0 },
    trends: { previousAverageWeeklyKm: 0, volumeChangePercent: null, acuteLoad: 0, chronicLoad: 0, consistencyScore: 0 },
    availableSignals: { heartRate: false, power: false, elevation: false, cadence: false },
  };
}
function initialState() {
  try { return { inputs: getCoachInputs(), error: "" }; }
  catch (error) { return { inputs: emptyInputs(), error: `Træningsdata kunne ikke indlæses: ${error.message}` }; }
}
function createCoachPayload(inputs, readiness, intent = "overview") {
  return {
    schemaVersion: 3,
    intent,
    goal: inputs.goal ? {
      distanceKm: inputs.goal.distanceKm,
      raceDate: dateKey(inputs.goal.raceDate),
      level: inputs.goal.level,
    } : null,
    plan: inputs.plan ? {
      name: inputs.plan.name,
      level: inputs.plan.level,
      currentWeekIndex: inputs.planWeekIndex,
      programVdot: inputs.programVdot,
    } : null,
    performanceMatch: {
      storedVdot: inputs.storedVdot,
      coachEstimatedVdot: inputs.coachVdot.estimate,
      confidence: inputs.coachVdot.confidence,
      eligibleActivities: inputs.coachVdot.eligibleCount,
      analyzedActivities: inputs.coachVdot.assessments.length,
    },
    readiness,
    trends: inputs.trends,
    availableSignals: inputs.availableSignals,
    weeks: inputs.weeks,
    recentActivities: inputs.recentActivities,
    privacy: { excludesActivityNames: true, excludesActivityIds: true, excludesGpsData: true },
  };
}
function formatPace(seconds) {
  if (!(seconds > 0)) return "–";
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")} min/km`;
}
function formatDuration(seconds) {
  if (!(seconds > 0)) return "–";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}` : `${minutes} min`;
}
function formatVdot(value) {
  return Number.isFinite(value) ? value.toFixed(1).replace(".", ",") : "–";
}
function vdotInterpretation(stored, estimate, program) {
  if (!Number.isFinite(estimate)) return "Der mangler performance-relevante aktiviteter til et robust aktivitetsestimat.";
  const storedText = Number.isFinite(stored)
    ? Math.abs(estimate - stored) <= 1.5
      ? "Aktivitetsestimatet ligger tæt på dit gemte VDOT og understøtter det aktuelle træningsniveau."
      : estimate > stored
        ? "Aktivitetsestimatet ligger over dit gemte VDOT. Overvej et nyt benchmark, før træningstempoet ændres."
        : "Aktivitetsestimatet ligger under dit gemte VDOT. Brug ikke estimatet alene til at sænke niveauet."
    : "Der blev ikke fundet et gemt VDOT i Performance.";
  const programText = Number.isFinite(program)
    ? estimate >= program
      ? " Det estimerede niveau matcher programmets reference."
      : ` Programmets reference ligger ${formatVdot(program - estimate)} VDOT højere.`
    : " Programmets VDOT-reference kunne ikke aflæses.";
  return storedText + programText;
}

const weekLabel = new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "short" });

export default function CoachPage({ setPage }) {
  const [inputState, setInputState] = useState(initialState);
  const { inputs, error: inputError } = inputState;
  const [analysis, setAnalysis] = useState("");
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVdotLogic, setShowVdotLogic] = useState(false);
  const [chartView, setChartView] = useState("distance");
  const [readiness, setReadiness] = useState({ legs: "Normale", energy: "Normal", sleep: "Okay" });
  const deviceId = useMemo(() => getStravaDeviceId(), []);
  const latestWeek = inputs.weeks.at(-1);
  const plannedKm = inputs.plan && inputs.planWeekIndex >= 0
    ? inputs.plan.weeklyKilometers?.[inputs.planWeekIndex] ?? null
    : null;
  const completedKm = latestWeek?.distanceKm ?? 0;
  const completion = plannedKm > 0 ? Math.round((completedKm / plannedKm) * 100) : null;
  const maxChart = Math.max(1, ...inputs.weeks.slice(-8).map((week) =>
    chartView === "load" ? week.trainingLoad : chartView === "intensity" ? week.hardKm + week.moderateKm : week.distanceKm,
  ));

  function refreshInputs() {
    try {
      setInputState({ inputs: getCoachInputs(), error: "" });
      setAnalysis("");
      setRequestError("");
    } catch (error) {
      setInputState((current) => ({ ...current, error: `Træningsdata kunne ikke indlæses: ${error.message}` }));
    }
  }
  async function requestAnalysis(intent = "overview") {
    setLoading(true);
    setRequestError("");
    setAnalysis("");
    try {
      const result = await stravaApi(deviceId, "/api/runhub/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createCoachPayload(inputs, readiness, intent)),
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

  const signalNames = [
    inputs.availableSignals.heartRate && "Puls",
    inputs.availableSignals.power && "Watt",
    inputs.availableSignals.elevation && "Højde",
    inputs.availableSignals.cadence && "Kadence",
  ].filter(Boolean).join(" · ") || "Distance · Tid";
  const recommendationTitle = readiness.legs === "Tunge" || readiness.energy === "Lav" || readiness.sleep === "Dårlig"
    ? "Tilpas dagens belastning"
    : "Genetablér kontinuiteten";
  const recommendationCopy = readiness.legs === "Tunge" || readiness.energy === "Lav" || readiness.sleep === "Dårlig"
    ? "Dit daglige check-in viser mindst ét belastet signal. Vælg let træning eller restitution frem for at kompensere med et hårdt pas."
    : "Brug et gennemførligt pas og byg ugens belastning gradvist. Lad kvalitetspassene følge dit aktuelle VDOT-niveau.";

  return (
    <>
      <style>{`
        .coach-page-compact{display:grid;gap:7px}.coach-page-compact .coach-compact-card{padding:10px 12px}.coach-compact-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:7px}.coach-compact-recommendation{display:grid;grid-template-columns:1fr auto;gap:10px;border-color:rgba(255,211,77,.38)}.coach-compact-focus,.coach-compact-stats,.coach-compact-goal,.coach-compact-signals,.coach-compact-checkin,.coach-compact-performance{display:grid;gap:5px}.coach-compact-focus{grid-template-columns:repeat(3,1fr);margin-top:7px}.coach-compact-stats{grid-template-columns:repeat(4,1fr);margin-top:7px}.coach-compact-goal{grid-template-columns:1fr 1fr;margin-top:7px}.coach-compact-signals{grid-template-columns:repeat(2,1fr);margin-top:7px}.coach-compact-checkin{grid-template-columns:repeat(3,1fr);margin-top:7px}.coach-compact-performance{grid-template-columns:repeat(4,1fr);margin-top:7px}.coach-mini{padding:7px;border:1px solid #293a5e;border-radius:8px;background:rgba(4,9,23,.3)}.coach-mini small{display:block;color:#19d5ee;font-size:7px;font-weight:900}.coach-mini strong{display:block;margin-top:3px;font-size:11px}.coach-mini span{display:block;margin-top:2px;color:#93a5c5;font-size:7px;line-height:1.35}.coach-progress{height:6px;margin-top:7px;overflow:hidden;border-radius:99px;background:#202d49}.coach-progress i{display:block;height:100%;background:linear-gradient(90deg,#19d5ee,#45d699)}.coach-intensity{display:grid;height:7px;margin-top:6px;overflow:hidden;border-radius:99px}.coach-vdot-row{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:5px;align-items:stretch;margin-top:7px}.coach-vdot-arrow{display:grid;place-items:center;color:#667897}.coach-vdot-guide{margin-top:6px;padding:8px;border:1px solid rgba(255,211,77,.3);border-radius:8px;background:rgba(255,211,77,.05);font-size:8px;line-height:1.45}.coach-vdot-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:5px}.coach-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px}.coach-vdot-detail{margin-top:6px}.coach-vdot-activity{display:grid;grid-template-columns:68px 58px 58px 1fr;gap:6px;padding:5px 2px;border-bottom:1px solid #293a5e;font-size:7px}.coach-vdot-activity.is-excluded{opacity:.5}.coach-choices{display:flex;gap:3px;margin-top:4px;flex-wrap:wrap}.coach-choices button,.coach-chart-tabs button,.coach-questions button,.coach-toggle{padding:5px 7px;border:1px solid #344767;border-radius:7px;background:#101a30;color:#b9c5d9;font-size:7px;cursor:pointer}.coach-choices button.active,.coach-chart-tabs button.active{border-color:#19d5ee;color:#7eeaf6}.coach-chart-tabs{display:flex;gap:4px}.coach-chart{display:flex;height:95px;align-items:flex-end;gap:7px;margin-top:6px;border-bottom:1px solid #304160}.coach-chart-col{display:grid;flex:1;justify-items:center;gap:2px;font-size:6px}.coach-chart-bar{width:min(20px,80%);min-height:3px;border-radius:4px 4px 0 0;background:linear-gradient(#2bd8ed,#087e9d)}.coach-questions{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-top:7px}.coach-analysis-output{margin-top:7px;padding:8px;border:1px solid rgba(25,213,238,.28);border-radius:8px;background:rgba(25,213,238,.04);white-space:pre-wrap}.coach-privacy-compact{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 10px}.coach-privacy-copy{font-size:8px;color:#93a5c5}.coach-heading-row{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.coach-small-copy{margin:3px 0 0;color:#93a5c5;font-size:8px;line-height:1.4}.coach-status-pill{padding:4px 7px;border:1px solid rgba(255,211,77,.3);border-radius:99px;color:#ffe38a;font-size:7px;font-weight:900;white-space:nowrap}@media(max-width:820px){.coach-compact-grid{grid-template-columns:1fr}.coach-vdot-row{grid-template-columns:1fr}.coach-vdot-arrow{transform:rotate(90deg)}.coach-compact-recommendation{grid-template-columns:1fr}}@media(max-width:560px){.coach-compact-focus,.coach-compact-stats,.coach-compact-goal,.coach-compact-signals,.coach-compact-checkin,.coach-compact-performance,.coach-vdot-actions,.coach-questions{grid-template-columns:1fr 1fr}.coach-vdot-activity{grid-template-columns:55px 45px 50px 1fr}}
      `}</style>

      <div className="coach-page-compact">
        <PageTitle
          eyebrow="PERSONLIG TRÆNING"
          title="AI Coach"
          description="Din træningsdata omsat til konkrete beslutninger."
        />

        <Card className="coach-privacy-compact">
          <span className="coach-privacy-copy">🔒 Privat analyse · GPS, aktivitetsnavne og Strava-ID'er sendes ikke</span>
          <button type="button" className="coach-refresh" onClick={refreshInputs} aria-label="Genindlæs træningsdata">
            <RefreshCw size={15} />
          </button>
        </Card>

        {inputError && <p className="coach-error" role="alert">{inputError}</p>}

        <Card className="coach-compact-card coach-compact-recommendation">
          <div>
            <span className="coach-status-pill">● COACHENS VURDERING</span>
            <h2>{recommendationTitle}</h2>
            <p className="coach-small-copy">{recommendationCopy}</p>
            <div className="coach-compact-focus">
              <div className="coach-mini"><small>NÆSTE SKRIDT</small><strong>Et roligt, gennemførligt pas</strong></div>
              <div className="coach-mini"><small>BELASTNING</small><strong>Byg gradvist op</strong></div>
              <div className="coach-mini"><small>PERFORMANCE</small><strong>Brug aktuelle VDOT-tempi</strong></div>
            </div>
          </div>
          <button
            type="button"
            className="primary coach-analyze-button"
            disabled={loading || !inputs.connected || inputs.activityCount === 0}
            onClick={() => requestAnalysis("overview")}
          >
            <Sparkles size={15} /> {loading ? "Analyserer..." : "Analyser"}
          </button>
        </Card>

        <div className="coach-compact-grid">
          <Card className="coach-compact-card">
            <div className="coach-heading-row"><div><small>DENNE UGE</small><h3>Plan mod faktisk</h3></div><span className="coach-small-copy">Uge {inputs.planWeekIndex >= 0 ? inputs.planWeekIndex + 1 : "–"}</span></div>
            <div className="coach-compact-stats">
              <div className="coach-mini"><small>PLANLAGT</small><strong>{plannedKm ?? "–"} km</strong><span>Program</span></div>
              <div className="coach-mini"><small>GENNEMFØRT</small><strong>{completedKm} km</strong><span>{latestWeek?.runCount ?? 0} pas</span></div>
              <div className="coach-mini"><small>AF PLANEN</small><strong>{completion !== null ? `${completion}%` : "–"}</strong><span>{plannedKm ? `${Math.max(0, round(plannedKm - completedKm, 1))} km tilbage` : "Ingen aktiv plan"}</span></div>
              <div className="coach-mini"><small>LANG TUR</small><strong>{latestWeek?.longestRunKm ?? 0} km</strong><span>Denne uge</span></div>
            </div>
            <div className="coach-progress"><i style={{ width: `${Math.min(100, Math.max(0, completion ?? 0))}%` }} /></div>
            <div
              className="coach-intensity"
              style={{ gridTemplateColumns: `${latestWeek?.easyKm || 0.1}fr ${latestWeek?.moderateKm || 0.1}fr ${latestWeek?.hardKm || 0.1}fr` }}
              aria-label="Intensitetsfordeling"
            >
              <i style={{ background: "#45d699" }} /><i style={{ background: "#ffd34d" }} /><i style={{ background: "#ff6b70" }} />
            </div>
            <p className="coach-small-copy">🟢 Let {latestWeek?.easyKm ?? 0} km · 🟡 Moderat {latestWeek?.moderateKm ?? 0} km · 🔴 Hård {latestWeek?.hardKm ?? 0} km</p>
          </Card>

          <Card className="coach-compact-card">
            <small>VEJEN MOD DIT MÅL</small>
            <h3>{inputs.goal ? `${inputs.goal.distanceKm} km · ${LEVEL_LABELS[inputs.goal.level]}` : "Intet race-mål valgt"}</h3>
            <p className="coach-small-copy">{inputs.goal ? new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long", year: "numeric" }).format(inputs.goal.raceDate) : "Vælg mål i Race Center"}</p>
            <div className="coach-compact-goal">
              <div className="coach-mini"><small>PROGRAM</small><strong>{inputs.plan?.name ?? "Ingen plan"}</strong><span>{inputs.planWeekIndex >= 0 ? `Uge ${inputs.planWeekIndex + 1}` : "Ikke aktiv"}</span></div>
              <div className="coach-mini"><small>NÆSTE UGE</small><strong>{inputs.plan?.weeklyKilometers?.[inputs.planWeekIndex + 1] ?? "–"} km</strong><span>Planlagt</span></div>
              <div className="coach-mini"><small>GEMT VDOT</small><strong>{formatVdot(inputs.storedVdot)}</strong><span>Performance</span></div>
              <div className="coach-mini"><small>PROGRAMNIVEAU</small><strong>{Number.isFinite(inputs.programVdot) ? `VDOT ${formatVdot(inputs.programVdot)}+` : "–"}</strong><span>Reference</span></div>
            </div>
          </Card>
        </div>

        <Card className="coach-compact-card">
          <div className="coach-heading-row">
            <div><small>PERFORMANCE MATCH</small><h3>Coachens estimerede VDOT</h3><p className="coach-small-copy">Estimat fra relevante aktiviteter blandt de seneste 10 løbetræninger.</p></div>
            <span className="coach-status-pill">{inputs.coachVdot.confidence.toUpperCase()} DATAGRUNDLAG</span>
          </div>
          <div className="coach-vdot-row">
            <div className="coach-mini"><small>GEMT I PERFORMANCE</small><strong>{formatVdot(inputs.storedVdot)}</strong><span>Træningstempo</span></div>
            <div className="coach-vdot-arrow">→</div>
            <div className="coach-mini"><small>COACHENS ESTIMAT</small><strong>{formatVdot(inputs.coachVdot.estimate)}</strong><span>{inputs.coachVdot.eligibleCount} relevante af {inputs.coachVdot.assessments.length}</span></div>
            <div className="coach-vdot-arrow">→</div>
            <div className="coach-mini"><small>PROGRAMNIVEAU</small><strong>{Number.isFinite(inputs.programVdot) ? `${formatVdot(inputs.programVdot)}+` : "–"}</strong><span>{Number.isFinite(inputs.programVdot) && Number.isFinite(inputs.coachVdot.estimate) ? `Forskel ${formatVdot(inputs.programVdot - inputs.coachVdot.estimate)}` : "Ingen reference"}</span></div>
          </div>
          <div className="coach-vdot-guide"><strong>Coachens fortolkning</strong><br />{vdotInterpretation(inputs.storedVdot, inputs.coachVdot.estimate, inputs.programVdot)}</div>
          <div className="coach-vdot-actions">
            <div className="coach-mini"><small>TRÆNINGSTEMPO</small><strong>Brug gemt VDOT {formatVdot(inputs.storedVdot)}</strong></div>
            <div className="coach-mini"><small>COACH-KONTROL</small><strong>{Number.isFinite(inputs.coachVdot.estimate) ? "Aktivitetsestimat tilgængeligt" : "Nyt benchmark anbefales"}</strong></div>
            <div className="coach-mini"><small>NÆSTE BENCHMARK</small><strong>5 km eller 10 km test</strong></div>
          </div>
          <div className="coach-toggle-row">
            <div><small>BEREGNINGSGRUNDLAG</small><p className="coach-small-copy">Tekniske detaljer er skjult som standard.</p></div>
            <button type="button" className="coach-toggle" aria-expanded={showVdotLogic} onClick={() => setShowVdotLogic((value) => !value)}>
              {showVdotLogic ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showVdotLogic ? "Skjul beregningslogik" : "Vis beregningslogik"}
            </button>
          </div>
          {showVdotLogic && (
            <div className="coach-vdot-detail">
              <p className="coach-small-copy">Coachen beregner VDOT fra distance og tid og medtager kun ture med tydeligt performance-signal. Rolige ture overskriver ikke VDOT i Performance.</p>
              {inputs.coachVdot.assessments.map((item) => (
                <div className={`coach-vdot-activity ${item.performanceRelevant ? "" : "is-excluded"}`} key={`${item.date?.toISOString()}-${item.index}`}>
                  <span>{item.date ? new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "short" }).format(item.date) : "–"}</span>
                  <strong>{round(item.distanceKm, 1) ?? "–"} km</strong>
                  <strong>VDOT {formatVdot(item.vdot)}</strong>
                  <span>{item.performanceRelevant ? `INDGÅR · ${item.reason}` : `FRASORTERET · ${item.reason}`}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="coach-compact-grid">
          <Card className="coach-compact-card">
            <small>TRÆNINGSSIGNALER</small><h3>Status lige nu</h3>
            <div className="coach-compact-signals">
              <div className="coach-mini"><TrendingUp size={14} /><small>KONTINUITET</small><strong>{inputs.trends.consistencyScore}/100</strong></div>
              <div className="coach-mini"><Gauge size={14} /><small>BELASTNING</small><strong>{inputs.trends.acuteLoad}</strong><span>Normal {inputs.trends.chronicLoad}</span></div>
              <div className="coach-mini"><Target size={14} /><small>LANG TUR</small><strong>{latestWeek?.longestRunKm ?? 0} km</strong></div>
              <div className="coach-mini">{inputs.availableSignals.power ? <Zap size={14} /> : <HeartPulse size={14} />}<small>DATA</small><strong>{signalNames}</strong></div>
            </div>
          </Card>

          <Card className="coach-compact-card">
            <small>DAGLIG KONTEKST</small><h3>Hvordan har du det i dag?</h3>
            <div className="coach-compact-checkin">
              {[
                ["legs", "Ben", ["Friske", "Normale", "Tunge"]],
                ["energy", "Energi", ["God", "Normal", "Lav"]],
                ["sleep", "Søvn", ["God", "Okay", "Dårlig"]],
              ].map(([key, label, choices]) => (
                <div className="coach-mini" key={key}><strong>{label}</strong><div className="coach-choices">
                  {choices.map((choice) => <button type="button" key={choice} className={readiness[key] === choice ? "active" : ""} onClick={() => setReadiness((current) => ({ ...current, [key]: choice }))}>{choice}</button>)}
                </div></div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="coach-compact-card">
          <div className="coach-heading-row">
            <div><small>DIN UDVIKLING</small><h3>8 ugers træningshistorik</h3></div>
            <div className="coach-chart-tabs">
              {[['distance', 'Distance'], ['load', 'Belastning'], ['intensity', 'Intensitet']].map(([value, label]) => <button type="button" key={value} className={chartView === value ? "active" : ""} onClick={() => setChartView(value)}>{label}</button>)}
            </div>
          </div>
          <div className="coach-chart">
            {inputs.weeks.slice(-8).map((week) => {
              const value = chartView === "load" ? week.trainingLoad : chartView === "intensity" ? week.hardKm + week.moderateKm : week.distanceKm;
              return <div className="coach-chart-col" key={week.weekStart}>
                <span>{weekLabel.format(new Date(`${week.weekStart}T12:00:00`))}</span>
                <div className="coach-chart-bar" style={{ height: `${Math.max(3, (value / maxChart) * 68)}px` }} />
                <strong>{round(value, 1)}</strong>
              </div>;
            })}
          </div>
        </Card>

        <div className="coach-compact-grid">
          <Card className="coach-compact-card">
            <small>PERFORMANCE-SIGNALER</small><h3>Aktuelle pejlemærker</h3>
            <div className="coach-compact-performance">
              <div className="coach-mini"><small>GEMT VDOT</small><strong>{formatVdot(inputs.storedVdot)}</strong></div>
              <div className="coach-mini"><small>COACH-VDOT</small><strong>{formatVdot(inputs.coachVdot.estimate)}</strong></div>
              <div className="coach-mini"><small>4-UGERS KM</small><strong>{inputs.averageWeeklyKm}</strong></div>
              <div className="coach-mini"><small>PROGRAM</small><strong>{Number.isFinite(inputs.programVdot) ? `VDOT ${formatVdot(inputs.programVdot)}+` : "–"}</strong></div>
            </div>
          </Card>

          <Card className="coach-compact-card">
            <small>SPØRG COACHEN</small><h3>Hvad vil du have hjælp til?</h3>
            <div className="coach-questions">
              {[
                ["today", "Hvad bør jeg træne i dag?"],
                ["week", "Hvordan ser min uge ud?"],
                ["load", "Er belastningen passende?"],
                ["goal", "Passer træningen til mit mål?"],
                ["interval", "Foreslå et intervalpas"],
                ["vdot", "Forklar mit VDOT-match"],
              ].map(([intent, label]) => <button type="button" key={intent} disabled={loading || !inputs.connected} onClick={() => requestAnalysis(intent)}>{label}</button>)}
            </div>
          </Card>
        </div>

        {requestError && <p className="coach-error" role="alert">{requestError}</p>}
        {analysis && <section className="coach-analysis-output" aria-live="polite"><strong>Forslag fra din AI-coach</strong><div>{analysis}</div></section>}
        <p className="coach-small-copy">AI-råd er generelle træningsforslag, ikke medicinsk rådgivning. Stop eller nedjustér ved smerter, svimmelhed eller usædvanlig utilpashed.</p>
      </div>
    </>
  );
}
