import { Fragment, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/training.css";
import Card from "../components/Card";
import PageTitle from "../components/PageTitle";
import { trainingTeams } from "../data/trainingPlans";
import { getWorkoutForDate } from "../data/workoutSchedule";
import StravaConnection from "../components/StravaConnection";
import {
  RACE_GOAL_STORAGE_KEY,
  SELECTED_PLAN_STORAGE_KEY,
  getTrainingPlans,
} from "../services/trainingPlanLibrary";
import { estimateWorkoutLoad, getTrainingIntensity } from "../services/trainingLoad";

const weekdays = [
  { offset: 0, name: "Mandag", planDay: "monday" },
  { offset: 1, name: "Tirsdag", planDay: "tuesday" },
  { offset: 2, name: "Onsdag", planDay: "wednesday" },
  { offset: 3, name: "Torsdag", planDay: "thursday" },
  { offset: 4, name: "Fredag", planDay: "friday" },
  { offset: 5, name: "Lørdag", planDay: "saturday" },
  { offset: 6, name: "Søndag", planDay: "sunday" },
];
const danishLevel = {
  base: "Base",
  build: "Build",
  performance: "Performance",
};

function getMonday(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

function shiftDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date, includeYear = false) {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

function formatWeekReference(date) {
  const thursday = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const weekday = thursday.getUTCDay() || 7;
  thursday.setUTCDate(thursday.getUTCDate() + 4 - weekday);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `Uge ${weekNumber} · ${thursday.getUTCFullYear()}`;
}

function formatKilometers(kilometers) {
  return `${new Intl.NumberFormat("da-DK", {
    maximumFractionDigits: 1,
  }).format(kilometers)} km`;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")} min`;
}

function getDateActivities(dateKey, activities) {
  return activities.filter(
    (activity) => activity.startDateLocal?.slice(0, 10) === dateKey,
  );
}

function getDateDistance(dateKey, activities) {
  return getDateActivities(dateKey, activities).reduce(
    (total, activity) => total + activity.distanceKm,
    0,
  );
}

function formatWorkoutTarget(workout) {
  return workout.distanceKm === undefined
    ? `${workout.durationMinutes} min`
    : formatKilometers(workout.distanceKm);
}

function formatPlanVolume(kilometers, minutes) {
  const parts = [];
  if (kilometers > 0 || minutes === 0) parts.push(formatKilometers(kilometers));
  if (minutes > 0) parts.push(`${minutes} min`);
  return parts.join(" + ");
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getActivityDescription(activity) {
  const details = [];
  if (Number.isFinite(activity.distanceKm)) {
    details.push(formatKilometers(activity.distanceKm));
  }
  if (Number.isFinite(activity.movingTime) && activity.movingTime > 0) {
    details.push(formatDuration(activity.movingTime));
  }
  return details.length > 0
    ? `${activity.name} · ${details.join(" · ")}`
    : activity.name;
}

function getWorkoutTarget(workouts) {
  return workouts.reduce(
    (target, workout) => ({
      distanceKm: target.distanceKm + (workout.distanceKm ?? 0),
      durationMinutes: target.durationMinutes + (workout.durationMinutes ?? 0),
    }),
    { distanceKm: 0, durationMinutes: 0 },
  );
}

function matchesClubTarget(workouts, clubWorkout) {
  const ownTarget = getWorkoutTarget(workouts);
  return (
    Math.abs(ownTarget.distanceKm - (clubWorkout.distance ?? 0)) < 0.1 &&
    Math.abs(ownTarget.durationMinutes - (clubWorkout.duration ?? 0)) < 1
  );
}

function parseStoredGoal() {
  const value = window.localStorage.getItem(RACE_GOAL_STORAGE_KEY);
  if (!value) return null;
  const goal = JSON.parse(value);
  if (
    !goal ||
    typeof goal.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(goal.date) ||
    typeof goal.description !== "string" ||
    !Number.isFinite(goal.distanceKm) ||
    !["base", "build", "performance"].includes(goal.level)
  ) {
    throw new Error("Dit gemte race-mål har et ugyldigt format.");
  }
  const [year, month, day] = goal.date.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (getDateKey(date) !== goal.date) {
    throw new Error("Datoen i dit gemte race-mål er ugyldig.");
  }
  return { ...goal, raceDate: date };
}

function loadTrainingData() {
  try {
    const goal = parseStoredGoal();
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
    return { goal, plan, plans, error: "" };
  } catch (error) {
    return {
      goal: null,
      plan: null,
      plans: [],
      error: `Træningsdata kunne ikke indlæses: ${error.message}`,
    };
  }
}

function getPlanWeekIndex(plan, goal, monday) {
  if (!plan || !goal) return -1;
  const goalMonday = getMonday(goal.raceDate);
  const firstPlanMonday = shiftDate(
    goalMonday,
    -7 * (plan.weeklyKilometers.length - 1),
  );
  const currentMondayUtc = Date.UTC(
    monday.getFullYear(),
    monday.getMonth(),
    monday.getDate(),
  );
  const firstMondayUtc = Date.UTC(
    firstPlanMonday.getFullYear(),
    firstPlanMonday.getMonth(),
    firstPlanMonday.getDate(),
  );
  const weekIndex = Math.round(
    (currentMondayUtc - firstMondayUtc) / (7 * 24 * 60 * 60 * 1000),
  );
  return weekIndex >= 0 && weekIndex < plan.weeklyKilometers.length
    ? weekIndex
    : -1;
}

function getEstimatedPeak(plan, goal) {
  if (!plan || !goal) return null;
  const peak = plan.weeklyKilometers.reduce(
    (current, kilometers, index) =>
      kilometers > current.kilometers ? { kilometers, index } : current,
    { kilometers: -Infinity, index: -1 },
  );
  const raceMonday = getMonday(goal.raceDate);
  const durationPeak = (plan.weeklyDurationMinutes ?? []).reduce(
    (current, minutes, index) =>
      minutes > current.minutes ? { minutes, index } : current,
    { minutes: 0, index: -1 },
  );
  return {
    kilometers: peak.kilometers,
    weekStart: shiftDate(
      raceMonday,
      -7 * (plan.weeklyKilometers.length - peak.index - 1),
    ),
    durationMinutes: durationPeak.minutes,
    durationWeekStart:
      durationPeak.index >= 0
        ? shiftDate(
            raceMonday,
            -7 * (plan.weeklyKilometers.length - durationPeak.index - 1),
          )
        : null,
  };
}

function getClubWeekKilometers(team, monday, raceDate) {
  return weekdays.reduce((total, day) => {
    const date = shiftDate(monday, day.offset);
    if (raceDate && date > raceDate) return total;
    return total + (getWorkoutForDate(date, team).distance || 0);
  }, 0);
}

function getClubPeak(team, firstMonday, weeks, raceDate) {
  return Array.from({ length: weeks }, (_, index) => {
    const weekStart = shiftDate(firstMonday, index * 7);
    return {
      weekStart,
      kilometers: getClubWeekKilometers(team, weekStart, raceDate),
    };
  }).reduce(
    (peak, week) => (week.kilometers > peak.kilometers ? week : peak),
    { weekStart: firstMonday, kilometers: 0 },
  );
}

function describeClubWorkout(workout) {
  const amount =
    workout.distance > 0
      ? formatKilometers(workout.distance)
      : workout.duration > 0
        ? `${workout.duration} min`
        : "";
  return amount ? `${workout.name} · ${amount}` : workout.name;
}

function getTotal(workouts, value) {
  return workouts.reduce((total, workout) => total + value(workout), 0);
}

function formatLoad(load) {
  return new Intl.NumberFormat("da-DK", {
    maximumFractionDigits: 1,
  }).format(load);
}

export default function TrainingPage({ calendarTeam }) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [trainingData] = useState(loadTrainingData);
  const [selectedDate, setSelectedDate] = useState("");
  const [stravaActivities, setStravaActivities] = useState([]);

  const todayDateKey = getDateKey(new Date());
  const weekEnd = shiftDate(weekStart, 6);
  const weekDates = weekdays.map((day) => ({
    ...day,
    date: shiftDate(weekStart, day.offset),
  }));
  const weekWorkouts = useMemo(
    () =>
      Object.fromEntries(
        trainingTeams.map((team) => [
          team,
          weekDates.map(({ date }) => getWorkoutForDate(date, team)),
        ]),
      ),
    // Dates are reconstructed on each render; the ISO week start identifies the schedule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getDateKey(weekStart)],
  );
  const loadCurve = useMemo(
    () =>
      trainingTeams.slice(1).map((team) => {
        const dailyLoads = weekDates.map((_, dayIndex) =>
          estimateWorkoutLoad(weekWorkouts[team][dayIndex]),
        );
        return {
          team,
          dailyLoads,
          weeklyLoad: dailyLoads.reduce((total, load) => total + (load ?? 0), 0),
        };
      }),
    [weekWorkouts, weekDates],
  );
  const chartMax = Math.max(
    1,
    ...loadCurve.flatMap(({ dailyLoads }) => {
      let cumulative = 0;
      return dailyLoads.map((load) => {
        cumulative += load ?? 0;
        return cumulative;
      });
    }),
  );
  const chartPoints = loadCurve.map((series) => {
    let cumulative = 0;
    const points = series.dailyLoads.map((load, index) => {
      cumulative += load ?? 0;
      return {
        x: 30 + (index * 640) / 6,
        y: 145 - (cumulative / chartMax) * 125,
        dailyLoad: load,
        cumulative,
      };
    });
    return { ...series, points };
  });
  const planWeekIndex = getPlanWeekIndex(
    trainingData.plan,
    trainingData.goal,
    weekStart,
  );
  const estimatedPeak = getEstimatedPeak(trainingData.plan, trainingData.goal);
  const clubTeam = calendarTeam === "Hold 3" ? "Hold 3" : "Hold 2";
  const peakWindowStart =
    trainingData.plan && trainingData.goal
      ? shiftDate(
          getMonday(trainingData.goal.raceDate),
          -7 * (trainingData.plan.weeklyKilometers.length - 1),
        )
      : getMonday(new Date());
  const clubPeak = getClubPeak(
    clubTeam,
    peakWindowStart,
    trainingData.plan && trainingData.goal
      ? trainingData.plan.weeklyKilometers.length
      : 52,
    trainingData.goal?.raceDate,
  );
  const realisticPeak = estimatedPeak ?? clubPeak;
  const ownWorkouts =
    planWeekIndex >= 0
      ? trainingData.plan.workoutsByWeek?.[planWeekIndex] ?? []
      : [];
  const selectedDay = weekDates.find(
    ({ date }) => getDateKey(date) === selectedDate,
  );
  const selectedOwnWorkouts = selectedDay
    ? ownWorkouts.filter(({ day }) => day === selectedDay.planDay)
    : [];
  const weekActualTotal = weekDates.reduce(
    (total, { date }) =>
      total + getDateDistance(getDateKey(date), stravaActivities),
    0,
  );

  function openDay(date) {
    const dateKey = getDateKey(date);
    setSelectedDate((current) => (current === dateKey ? "" : dateKey));
  }

  return (
    <>
      <PageTitle
        eyebrow="HOLD 1 · HOLD 2 · HOLD 3"
        title="Træning"
        description="Sammenlign klubbens og din egen plan med de faktiske løbeture, der er importeret fra Strava."
      />
      <StravaConnection onActivitiesChange={setStravaActivities} />
      {trainingData.error && (
        <p className="training-data-error" role="alert">
          {trainingData.error}
        </p>
      )}
      <Card className="training-plan-banner">
          <div>
            <small>
              {trainingData.goal
                ? `DIT RACE-MÅL · ${danishLevel[trainingData.goal.level]}`
                : `KLUBPROGRAM · ${clubTeam.toUpperCase()}`}
            </small>
            <strong>
              {trainingData.goal?.description ?? "Ingen personligt race-mål valgt"}
            </strong>
            <span>
              {trainingData.goal
                ? `${formatKilometers(trainingData.goal.distanceKm)} · ${formatDate(trainingData.goal.raceDate, true)}`
                : "Dit forventede peak følger klubbens program"}
            </span>
          </div>
          <div className="training-plan-week">
            <small>AKTIVT PROGRAM</small>
            {trainingData.plan ? (
              <>
                <strong>{trainingData.plan.name}</strong>
                {planWeekIndex >= 0 && (
                  <span>
                    Uge {planWeekIndex + 1} · ugemål{" "}
                    {formatPlanVolume(
                      trainingData.plan.weeklyKilometers[planWeekIndex],
                      trainingData.plan.weeklyDurationMinutes?.[planWeekIndex] ?? 0,
                    )}
                  </span>
                )}
              </>
            ) : (
              <span>Følger {clubTeam}s program</span>
            )}
          </div>
          <div className="training-club-peak">
            <small>KLUBBENS PEAK · {clubTeam.toUpperCase()}</small>
            <strong>{formatKilometers(clubPeak.kilometers)}</strong>
            <span>{formatWeekReference(clubPeak.weekStart)}</span>
          </div>
          <div className="training-plan-peak">
            <small>DIT REALISTISKE PEAK</small>
            <strong>{formatKilometers(realisticPeak.kilometers)}</strong>
            <span>{formatWeekReference(realisticPeak.weekStart)}</span>
            {trainingData.plan && realisticPeak.durationMinutes > 0 && (
              <span>
                Tidsbaseret peak: {realisticPeak.durationMinutes} min ·{" "}
                {formatWeekReference(realisticPeak.durationWeekStart)}
              </span>
            )}
            <span>
              {trainingData.plan
                ? "Kilometer-peak; tidsbaserede pas vises separat"
                : `Baseret på ${clubTeam}s program`}
            </span>
          </div>
      </Card>
      {!trainingData.error && !trainingData.goal && (
        <p className="training-plan-hint">
          Vælg et personligt mål under Race Center → Mine race-mål for at få
          beregnet dit realistiske peak ud fra en egen plan.
        </p>
      )}
      <Card className="team-training-card">
        <div className="team-training-toolbar">
          <button
            type="button"
            aria-label="Forrige uge"
            onClick={() => {
              setWeekStart((current) => shiftDate(current, -7));
              setSelectedDate("");
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <h2>{formatDate(weekStart)} – {formatDate(weekEnd, true)}</h2>
          <button
            type="button"
            aria-label="Næste uge"
            onClick={() => {
              setWeekStart((current) => shiftDate(current, 7));
              setSelectedDate("");
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="team-training-table-wrap">
          <table className="team-training-table">
            <thead>
              <tr>
                <th scope="col">Dag</th>
                <th scope="col">Klubbens træning</th>
                <th scope="col">Egen ambition</th>
                <th scope="col">Reel træning · Strava</th>
              </tr>
            </thead>
            <tbody>
              {weekDates.map((day, dayIndex) => {
                const dateKey = getDateKey(day.date);
                const isSelected = selectedDate === dateKey;
                const isToday = dateKey === todayDateKey;
                const actualActivities = getDateActivities(dateKey, stravaActivities);
                const actual = getDateDistance(dateKey, stravaActivities);
                const isFutureDate = dateKey > getDateKey(new Date());
                const dailyOwnWorkouts =
                  planWeekIndex >= 0
                    ? ownWorkouts.filter(({ day: planDay }) => planDay === day.planDay)
                    : [];
                const comparisonWorkout = weekWorkouts[clubTeam][dayIndex];
                const clubWorkouts = trainingTeams.map((team) => ({
                  team,
                  workout: weekWorkouts[team][dayIndex],
                }));
                const hasOwnSchedule =
                  planWeekIndex >= 0 &&
                  Array.isArray(trainingData.plan.workoutsByWeek);
                const ownPlanDiffers =
                  hasOwnSchedule &&
                  !matchesClubTarget(dailyOwnWorkouts, comparisonWorkout);
                const followsClubPlan = !ownPlanDiffers;
                return (
                  <Fragment key={dateKey}>
                    <tr
                      className={`training-day-row${isSelected ? " selected" : ""}${isToday ? " today" : ""}`}
                    >
                      <th scope="row">
                        <button
                          type="button"
                          className="training-day-button"
                          aria-expanded={isSelected}
                          aria-current={isToday ? "date" : undefined}
                          onClick={() => openDay(day.date)}
                        >
                          <span className="training-day-heading">
                            <strong>{day.name}</strong>
                            {isToday && (
                              <span className="training-today-label">I dag</span>
                            )}
                          </span>
                          <small>{formatDate(day.date)}</small>
                        </button>
                      </th>
                      <td>
                        <div className="club-day-workouts">
                          {clubWorkouts.map(({ team, workout }) => (
                            <span key={team}>
                              <b>{team}</b>
                              <span className="club-workout-description">
                                {describeClubWorkout(workout)}
                                {workout.distance > 0 && (
                                  <small>
                                    {getTrainingIntensity(workout).label} ·{" "}
                                    {formatLoad(estimateWorkoutLoad(workout))} belastningspoint
                                  </small>
                                )}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {followsClubPlan ? (
                          <span className="training-rest">
                            Følg {clubTeam}: {describeClubWorkout(comparisonWorkout)}
                          </span>
                        ) : hasOwnSchedule ? (
                          dailyOwnWorkouts.length > 0 ? (
                            <div className="own-day-workouts">
                              {dailyOwnWorkouts.map((workout) => (
                                <span key={workout.day}>
                                  {workout.description} ·{" "}
                                  {formatWorkoutTarget(workout)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="training-rest">
                              Hviledag i egen plan
                            </span>
                          )
                        ) : null}
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`actual-run-button${actualActivities.length > 0 && !isFutureDate ? " recorded" : ""}${isFutureDate ? " future" : ""}`}
                          onClick={() => openDay(day.date)}
                          aria-label={`${day.name}: ${isFutureDate ? "træning ikke registreret endnu" : actualActivities.length > 0 ? `${formatKilometers(actual)} fra Strava` : "ingen Strava-aktivitet"}`}
                        >
                          {isFutureDate ? (
                            <span>Træning ikke registreret endnu</span>
                          ) : actualActivities.length > 0 ? (
                            <>
                              <strong>{formatKilometers(actual)}</strong>
                              {actualActivities.map((activity) => (
                                <span
                                  className="actual-activity-summary"
                                  key={activity.id}
                                >
                                  {getActivityDescription(activity)}
                                </span>
                              ))}
                            </>
                          ) : (
                            <span>Ingen aktivitet</span>
                          )}
                        </button>
                      </td>
                    </tr>
                    {isSelected && (
                      <tr className="training-detail-row">
                        <td colSpan={4}>
                          <div className="training-day-detail">
                            <div>
                              <h3>
                                {selectedDay.name} · {formatDate(selectedDay.date, true)}
                              </h3>
                              <h4>Klubbens træning</h4>
                              {clubWorkouts.map(({ team, workout }) => (
                                <p key={team}>
                                  <b>{team}:</b> {describeClubWorkout(workout)}
                                  {workout.zone ? ` · Zone ${workout.zone}` : ""}
                                </p>
                              ))}
                            </div>
                            <div>
                              <h4>Din træning</h4>
                              {!hasOwnSchedule ? (
                                <p>
                                  {trainingData.plan
                                    ? "Den valgte plan har ikke et dagsprogram. Upload en JSON-plan med workoutsByWeek."
                                    : "Vælg et race-mål og upload din træningsplan under Race Center."}
                                </p>
                              ) : selectedOwnWorkouts.length > 0 ? (
                                selectedOwnWorkouts.map((workout) => (
                                  <p key={workout.day}>
                                    {workout.description} ·{" "}
                                    {formatWorkoutTarget(workout)}
                                  </p>
                                ))
                              ) : (
                                <p>Hviledag i din plan.</p>
                              )}
                            </div>
                            <div className="actual-training-detail">
                              <h4>Reel træning fra Strava</h4>
                              {actualActivities.length > 0 ? (
                                actualActivities.map((activity) => (
                                  <p key={activity.id}>
                                    <b>{activity.name}</b>
                                    {Number.isFinite(activity.distanceKm)
                                      ? ` · ${formatKilometers(activity.distanceKm)}`
                                      : ""}
                                    {Number.isFinite(activity.movingTime) &&
                                    activity.movingTime > 0
                                      ? ` · ${formatDuration(activity.movingTime)}`
                                      : ""}
                                  </p>
                                ))
                              ) : (
                                <p>
                                  {isFutureDate
                                    ? "Træning ikke registreret endnu."
                                    : "Ingen løbeaktivitet fra Strava denne dag."}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Ugetotal</th>
                <td>
                  {trainingTeams.map((team) => {
                    const total = getTotal(
                      weekWorkouts[team],
                      (workout) => workout.distance,
                    );
                    const timeTotal = getTotal(
                      weekWorkouts[team],
                      (workout) => workout.duration,
                    );
                    return (
                      <span className="training-total" key={team}>
                        {team}: {team === "Hold 1"
                          ? `${timeTotal} min`
                          : formatKilometers(total)}
                      </span>
                    );
                  })}
                </td>
                <td>
                  {planWeekIndex >= 0
                    ? formatKilometers(trainingData.plan.weeklyKilometers[planWeekIndex])
                    : "–"}
                </td>
                <td>{formatKilometers(weekActualTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
      <Card className="training-load-card">
        <div className="training-load-heading">
          <div>
            <small>KLUBBENS TRÆNINGSBELASTNING</small>
            <h2>Estimeret belastningskurve</h2>
            <p>
              Daglig belastning = kilometer × intensitetsfaktor. Kurven viser
              ugens akkumulerede belastningspoint.
            </p>
          </div>
          <div className="training-load-factors">
            Rolig × 1,0 · Moderat × 1,2 · Hård × 1,5 · Langtur × 1,25 ·
            Konkurrence × 1,7
          </div>
        </div>
        <div className="training-load-chart-wrap">
          <svg
            className="training-load-chart"
            viewBox="0 0 700 175"
            role="img"
            aria-label={`Akkumuleret estimeret belastning for ${loadCurve.map(({ team }) => team).join(" og ")}`}
          >
            {[0, 0.5, 1].map((fraction) => {
              const y = 145 - fraction * 125;
              return (
                <line
                  key={fraction}
                  x1="30"
                  x2="670"
                  y1={y}
                  y2={y}
                  className="training-load-gridline"
                />
              );
            })}
            {weekDates.map((day, index) => {
              const x = 30 + (index * 640) / 6;
              return (
                <text
                  key={day.planDay}
                  x={x}
                  y="168"
                  textAnchor="middle"
                  className="training-load-axis-label"
                >
                  {day.name.slice(0, 3)}
                </text>
              );
            })}
            {chartPoints.map(({ team, points }) => (
              <g key={team} className={`load-series-${team.replace(" ", "-").toLowerCase()}`}>
                <polyline
                  className="training-load-line"
                  points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
                />
                {points.map(({ x, y, dailyLoad, cumulative }, index) => (
                  <circle key={index} cx={x} cy={y} r="4">
                    <title>
                      {weekdays[index].name}: {formatLoad(dailyLoad ?? 0)} daglige,
                      {` ${formatLoad(cumulative)} akkumulerede belastningspoint`}
                    </title>
                  </circle>
                ))}
              </g>
            ))}
          </svg>
        </div>
        <div className="training-load-legend">
          {loadCurve.map(({ team, weeklyLoad }) => (
            <div key={team} className={`load-legend-${team.replace(" ", "-").toLowerCase()}`}>
              <span />
              <strong>{team}</strong>
              <span>{formatLoad(weeklyLoad)} belastningspoint denne uge</span>
            </div>
          ))}
        </div>
        <p className="training-load-note">
          Hold 1 er tidsbaseret i ugeplanen og indgår ikke i kilometerbaseret
          belastning. Belastningspoint er et estimat efter de valgte faktorer,
          ikke en måling af fysiologisk træningsbelastning.
        </p>
      </Card>
    </>
  );
}
