import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../components/Card";
import { trainingTeams } from "../data/trainingPlans";
import { getWorkoutForDate } from "../data/workoutSchedule";
import {
  RACE_GOAL_STORAGE_KEY,
  SELECTED_PLAN_STORAGE_KEY,
  getTrainingPlans,
  trainingPlanLevels,
} from "../services/trainingPlanLibrary";
import "../styles/race-goals.css";

const blankGoal = { description: "", date: "", distanceKm: "", level: "base" };
const danishLevel = {
  base: "Base",
  build: "Build",
  performance: "Performance",
};
const calendarWeekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function readGoal() {
  try {
    const value = window.localStorage.getItem(RACE_GOAL_STORAGE_KEY);
    if (!value) return { goal: blankGoal, error: "" };
    const goal = JSON.parse(value);
    const storedDate =
      typeof goal?.date === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(goal.date) &&
      parseLocalDate(goal.date).toISOString().slice(0, 10) === goal.date;
    if (
      !goal ||
      typeof goal.description !== "string" ||
      !storedDate ||
      !Number.isFinite(goal.distanceKm) ||
      goal.distanceKm <= 0 ||
      !trainingPlanLevels.includes(goal.level)
    ) {
      throw new Error("Det gemte race-mål har et ugyldigt format.");
    }
    return { goal: { ...goal, distanceKm: String(goal.distanceKm) }, error: "" };
  } catch (error) {
    return {
      goal: blankGoal,
      error: `Race-målet kunne ikke indlæses: ${error.message}`,
    };
  }
}

function readPlans() {
  try {
    return { plans: getTrainingPlans(), error: "" };
  } catch (error) {
    return {
      plans: [],
      error: `Planbiblioteket kunne ikke indlæses: ${error.message}`,
    };
  }
}

function parseLocalDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

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

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getCalendarDays(month) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = shiftDate(firstDay, -mondayOffset);
  return Array.from({ length: 42 }, (_, index) => shiftDate(gridStart, index));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("da-DK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatKilometers(kilometers) {
  return `${new Intl.NumberFormat("da-DK", {
    maximumFractionDigits: 1,
  }).format(kilometers)} km`;
}

function formatPlanVolume(kilometers, minutes) {
  const parts = [];
  if (kilometers > 0 || minutes === 0) parts.push(formatKilometers(kilometers));
  if (minutes > 0) parts.push(`${minutes} min`);
  return parts.join(" + ");
}

function formatDistance(distance) {
  return new Intl.NumberFormat("da-DK", {
    maximumFractionDigits: 1,
  }).format(distance);
}

function getLevelGuidance(plans, distanceKm, level) {
  const details = new Set();
  for (const plan of plans) {
    if (plan.distanceKm !== distanceKm || plan.level !== level) continue;
    const vdot = plan.name.match(/\bVDOT\s*\d+\+?/i)?.[0];
    const target = plan.name.match(/\bsub\s*[\d:]+(?:\s*min)?/i)?.[0];
    const baseRange = plan.name.match(/\(\s*\d+\s*-\s*\d+\s*km/i)?.[0];
    if (target) {
      const normalizedTarget = target.replace(/\s+/g, " ");
      details.add(
        /min$/i.test(normalizedTarget) || /[\d]:/.test(normalizedTarget)
          ? normalizedTarget
          : `${normalizedTarget} min`,
      );
    }
    if (vdot) details.add(vdot.replace(/\s+/g, " "));
    if (baseRange) {
      details.add(baseRange.slice(1).replace(/\s+/g, " ").trim());
    }
  }
  return details.size > 0 ? ` (${[...details].join(", ")})` : "";
}

function getClubWeek(team, monday, raceDate) {
  return Array.from({ length: 7 }, (_, day) => {
    const date = shiftDate(monday, day);
    return date > raceDate
      ? 0
      : getWorkoutForDate(date, team).distance || 0;
  }).reduce((total, distance) => total + distance, 0);
}

function makeComparison(goal, plan, team) {
  const raceDate = parseLocalDate(goal.date);
  const raceMonday = getMonday(raceDate);
  const firstMonday = shiftDate(
    raceMonday,
    -7 * (plan.weeklyKilometers.length - 1),
  );
  const weeks = plan.weeklyKilometers.map((ownKilometers, index) => {
    const monday = shiftDate(firstMonday, index * 7);
    const clubKilometers = getClubWeek(team, monday, raceDate);
    const ownDurationMinutes = plan.weeklyDurationMinutes?.[index] ?? 0;
    return {
      index,
      monday,
      ownKilometers,
      ownDurationMinutes,
      clubKilometers,
      difference:
        ownDurationMinutes > 0 ? null : ownKilometers - clubKilometers,
      recommendedKilometers: Math.max(ownKilometers, clubKilometers),
    };
  });
  const ownPeak = weeks.reduce(
    (peak, week) =>
      week.ownKilometers > peak.ownKilometers ? week : peak,
    weeks[0],
  );
  const durationPeak = weeks.reduce(
    (peak, week) =>
      week.ownDurationMinutes > peak.minutes
        ? { minutes: week.ownDurationMinutes, monday: week.monday }
        : peak,
    { minutes: 0, monday: firstMonday },
  );
  const clubPeak = weeks.reduce(
    (peak, week) =>
      week.clubKilometers > peak.clubKilometers ? week : peak,
    weeks[0],
  );
  const firstAboveClub = weeks.find(
    (week) => week.difference !== null && week.difference > 0,
  );
  const recommendedPeak = weeks.reduce(
    (peak, week) =>
      week.recommendedKilometers > peak.recommendedKilometers ? week : peak,
    weeks[0],
  );
  return {
    weeks,
    ownPeak,
    durationPeak,
    clubPeak,
    recommendedPeak,
    planStart: firstMonday,
    firstAboveClub,
  };
}

export default function RaceGoalsPage({ calendarTeam, setCalendarTeam }) {
  const [goalState, setGoalState] = useState(readGoal);
  const [plansState, setPlansState] = useState(readPlans);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [formError, setFormError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const initialDate = goalState.goal.date
      ? parseLocalDate(goalState.goal.date)
      : new Date();
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1, 12);
  });
  const [clubTeam, setClubTeam] = useState("Hold 3");

  const availableDistances = useMemo(
    () =>
      [...new Set(plansState.plans.map((plan) => plan.distanceKm))].sort(
        (first, second) => first - second,
      ),
    [plansState.plans],
  );
  const selectedDistance = availableDistances.some(
    (distance) =>
      Math.abs(distance - Number(goalState.goal.distanceKm)) < 0.01,
  )
    ? availableDistances.find(
        (distance) =>
          Math.abs(distance - Number(goalState.goal.distanceKm)) < 0.01,
      )
    : "";
  const availableLevels = useMemo(
    () =>
      trainingPlanLevels.filter((level) =>
        plansState.plans.some(
          (plan) =>
            plan.distanceKm === selectedDistance && plan.level === level,
        ),
      ),
    [plansState.plans, selectedDistance],
  );
  const selectedLevel = availableLevels.includes(goalState.goal.level)
    ? goalState.goal.level
    : availableLevels[0] ?? "";

  const matchingPlans = useMemo(
    () =>
      plansState.plans.filter(
        (plan) =>
          plan.distanceKm === selectedDistance && plan.level === selectedLevel,
      ),
    [plansState.plans, selectedDistance, selectedLevel],
  );
  const selectedPlan =
    matchingPlans.find((plan) => plan.id === selectedPlanId) ??
    matchingPlans[0];
  const comparison =
    goalState.goal.date && selectedPlan
      ? makeComparison(goalState.goal, selectedPlan, clubTeam)
      : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const calendarDays = getCalendarDays(calendarMonth);
  const calendarMonthLabel = new Intl.DateTimeFormat("da-DK", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const previousMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() - 1,
    1,
    12,
  );

  function updateGoal(field, value) {
    setGoalState((current) => ({
      ...current,
      goal:
        field === "distanceKm"
          ? {
              ...current.goal,
              distanceKm: value,
              level:
                plansState.plans.find(
                  (plan) => plan.distanceKm === Number(value),
                )?.level ?? "",
            }
          : { ...current.goal, [field]: value },
    }));
  }

  function saveGoal(event) {
    event.preventDefault();
    if (!goalState.goal.description.trim()) {
      setFormError("Skriv en beskrivelse af dit konkurrencemål.");
      return;
    }
    if (!goalState.goal.date || goalState.goal.date < todayString) {
      setFormError("Vælg en dato i dag eller fremtiden.");
      return;
    }
    if (selectedDistance === "") {
      setFormError("Vælg en distance, der findes i planbiblioteket.");
      return;
    }
    const distanceKm = selectedDistance;
    if (!availableLevels.includes(selectedLevel)) {
      setFormError("Vælg et niveau, der findes for den valgte distance.");
      return;
    }
    try {
      const goal = { ...goalState.goal, distanceKm, level: selectedLevel };
      window.localStorage.setItem(RACE_GOAL_STORAGE_KEY, JSON.stringify(goal));
      setGoalState({ goal: { ...goal, distanceKm: String(distanceKm) }, error: "" });
      setFormError("");
    } catch (error) {
      setFormError(`Målet kunne ikke gemmes i denne browser: ${error.message}`);
    }
  }

  return (
    <>
      <Card className="race-goal-card">
        <h2>Dit konkurrencemål</h2>
        <form className="race-goal-form" onSubmit={saveGoal}>
          <label className="race-goal-description">
            Beskrivelse
            <input
              required
              value={goalState.goal.description}
              onChange={(event) => updateGoal("description", event.target.value)}
              placeholder="Fx Aarhus Halvmarathon"
            />
          </label>
          <label>
            Dato
            <span className="race-goal-date-control">
              <input
                required
                type="date"
                min={todayString}
                value={goalState.goal.date}
                onChange={(event) => {
                  updateGoal("date", event.target.value);
                  if (event.target.value) {
                    const selected = parseLocalDate(event.target.value);
                    setCalendarMonth(
                      new Date(selected.getFullYear(), selected.getMonth(), 1, 12),
                    );
                  }
                }}
              />
              <button
                type="button"
                className="race-goal-calendar-toggle"
                aria-label={calendarOpen ? "Luk kalender" : "Vælg dato i kalender"}
                aria-expanded={calendarOpen}
                onClick={() => setCalendarOpen((open) => !open)}
              >
                <CalendarDays size={18} />
                <span>Vælg i kalender</span>
              </button>
            </span>
            {calendarOpen && (
              <div
                className="race-goal-calendar"
                role="group"
                aria-label="Vælg konkurrencedato"
              >
                <div className="race-goal-calendar-toolbar">
                  <button
                    type="button"
                    aria-label="Forrige måned"
                    disabled={previousMonth < currentMonthStart}
                    onClick={() => setCalendarMonth(previousMonth)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <strong>{calendarMonthLabel}</strong>
                  <button
                    type="button"
                    aria-label="Næste måned"
                    onClick={() =>
                      setCalendarMonth(
                        (month) =>
                          new Date(
                            month.getFullYear(),
                            month.getMonth() + 1,
                            1,
                            12,
                          ),
                      )
                    }
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="race-goal-calendar-grid">
                  {calendarWeekdays.map((weekday) => (
                    <span className="weekday" key={weekday}>
                      {weekday}
                    </span>
                  ))}
                  {calendarDays.map((day) => {
                    const key = dateKey(day);
                    const isCurrentMonth =
                      day.getMonth() === calendarMonth.getMonth();
                    const isSelected = key === goalState.goal.date;
                    const isPast = key < todayString;
                    return (
                      <button
                        type="button"
                        key={key}
                        className={`${isCurrentMonth ? "" : "outside-month"}${isSelected ? " selected" : ""}`}
                        disabled={isPast}
                        aria-pressed={isSelected}
                        aria-label={formatDate(day)}
                        onClick={() => {
                          updateGoal("date", key);
                          setCalendarOpen(false);
                          setFormError("");
                        }}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </label>
          <label>
            Distance (km)
            <select
              required
              value={selectedDistance}
              onChange={(event) => updateGoal("distanceKm", event.target.value)}
              disabled={availableDistances.length === 0}
            >
              <option value="" disabled>
                {availableDistances.length === 0
                  ? "Ingen plan tilgængelig"
                  : "Vælg en tilgængelig distance"}
              </option>
              {availableDistances.map((distance) => (
                <option key={distance} value={distance}>
                  {formatDistance(distance)} km
                </option>
              ))}
            </select>
          </label>
          <label>
            Niveau
            <select
              required
              value={selectedLevel}
              disabled={availableLevels.length === 0}
              onChange={(event) => updateGoal("level", event.target.value)}
            >
              {availableLevels.length === 0 && (
                <option value="" disabled>
                  Vælg en distance først
                </option>
              )}
              {availableLevels.map((level) => (
                <option key={level} value={level}>
                  {danishLevel[level]}
                  {getLevelGuidance(plansState.plans, selectedDistance, level)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sammenlign med
            <select
              value={clubTeam}
              onChange={(event) => {
                setClubTeam(event.target.value);
                setCalendarTeam(event.target.value);
              }}
            >
              {trainingTeams.slice(1).map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
            <small className="race-goal-field-note">
              Hold 1 har tidsbaserede pas og kan ikke sammenlignes direkte i km.
            </small>
          </label>
          <button className="primary race-goal-save" type="submit">
            Gem race-mål
          </button>
        </form>
        {(formError || goalState.error) && (
          <p className="race-goal-error" role="alert">
            {formError || goalState.error}
          </p>
        )}
      </Card>

      {goalState.goal.date && selectedPlan ? (
        <Card className="plan-comparison-card">
          <div className="plan-comparison-heading">
            <div>
              <small>UGENTLIGE KILOMETER</small>
              <h2>
                {goalState.goal.description} · {formatKilometers(selectedPlan.distanceKm)}
              </h2>
            </div>
            {matchingPlans.length > 1 && (
              <label>
                Plan
                <select
                  value={selectedPlan.id}
                  onChange={(event) => {
                    setSelectedPlanId(event.target.value);
                    try {
                      window.localStorage.setItem(
                        SELECTED_PLAN_STORAGE_KEY,
                        event.target.value,
                      );
                    } catch (error) {
                      setFormError(`Planvalget kunne ikke gemmes: ${error.message}`);
                    }
                  }}
                >
                  {matchingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="plan-peak-stats">
            <div>
              <small>KLUBBENS PEAK · {clubTeam.toUpperCase()}</small>
              <strong>{formatKilometers(comparison.clubPeak.clubKilometers)}</strong>
              <span>Ugen fra {formatDate(comparison.clubPeak.monday)}</span>
            </div>
            <div>
              <small>DIN PLAN-PEAK · KM · {danishLevel[selectedPlan.level].toUpperCase()}</small>
              <strong>{formatKilometers(comparison.ownPeak.ownKilometers)}</strong>
              <span>Ugen fra {formatDate(comparison.ownPeak.monday)}</span>
              {comparison.durationPeak.minutes > 0 && (
                <span>
                  Tidsbaseret peak: {comparison.durationPeak.minutes} min i ugen
                  fra {formatDate(comparison.durationPeak.monday)}
                </span>
              )}
            </div>
            <div className="plan-peak-difference plan-start-guidance">
              <small>DIN OPSTART OG FØRSTE ØGNING</small>
              <strong>{formatDate(comparison.planStart)}</strong>
              <span>
                {comparison.firstAboveClub
                  ? `Øg over klubniveau fra ${formatDate(comparison.firstAboveClub.monday)}: ${formatKilometers(comparison.firstAboveClub.difference)} mere`
                  : "Planen kommer ikke over klubbens mængde"}
              </span>
            </div>
          </div>
          <div className="plan-start-notice">
            Startdatoen placerer hele programmet så sent som muligt frem mod
            konkurrencedatoen. Følg mindst klubbens kilometer indtil din plan
            kræver mere. Den tilpassede ugemængde topper på{" "}
            <strong>
              {formatKilometers(comparison.recommendedPeak.recommendedKilometers)}
            </strong>{" "}
            i ugen fra {formatDate(comparison.recommendedPeak.monday)}.
          </div>
          <div className="plan-comparison-table-wrap">
            <table className="plan-comparison-table">
              <thead>
                <tr>
                  <th scope="col">Uge fra</th>
                  <th scope="col">Planens træning</th>
                  <th scope="col">{clubTeam}</th>
                  <th scope="col">Variation +/-</th>
                </tr>
              </thead>
              <tbody>
                {comparison.weeks.map((week) => (
                  <tr
                    key={week.index}
                    className={
                      week === comparison.firstAboveClub
                        ? "plan-first-above-club"
                        : ""
                    }
                  >
                    <th scope="row">
                      {formatDate(week.monday)}
                      {week === comparison.firstAboveClub && (
                        <small>Her begynder din plan at kræve mere</small>
                      )}
                      {week.index === comparison.ownPeak.index && (
                        <small>Din peak-uge</small>
                      )}
                      {week.index === comparison.clubPeak.index && (
                        <small>Klubbens peak-uge</small>
                      )}
                    </th>
                    <td>
                      {formatPlanVolume(
                        week.ownKilometers,
                        week.ownDurationMinutes,
                      )}
                    </td>
                    <td>{formatKilometers(week.clubKilometers)}</td>
                    <td
                      className={`plan-variation${week.difference > 0 ? " more" : week.difference < 0 ? " less" : ""}`}
                      title={
                        week.difference === null
                          ? "Tidsbaserede pas kan ikke omregnes pålideligt til kilometer"
                          : week.difference > 0
                          ? "Mere end klubbens program"
                          : week.difference < 0
                            ? "Mindre end klubbens program"
                            : "Samme distance som klubbens program"
                      }
                    >
                      {week.difference === null
                        ? "—"
                        : `${week.difference > 0 ? "+" : week.difference < 0 ? "−" : ""}${formatKilometers(Math.abs(week.difference))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="plan-comparison-note">
            Klubbens tal kommer fra det valgte holds offentliggjorte ugeprogram.
            Variation viser forskellen mellem planens og klubbens ugentlige
            kilometer: plus er mere end klubben, minus er mindre. Tidsbaserede
            pas vises i minutter; de omregnes ikke til kilometer, så variation
            vises som — i de uger. Brug den
            anbefalede opstart ovenfor til at undgå at sætte mængden ned, når du
            skifter program. Dette er en programsammenligning, ikke registrerede
            løb.
          </p>
        </Card>
      ) : goalState.goal.date ? (
        <Card className="plan-no-match">
          <h2>Ingen matchende plan endnu</h2>
          <p>
            Vælg en distance og et niveau, der findes i planbiblioteket,
            så beregner appen din peak og uge-for-uge forskellen til {clubTeam}.
          </p>
        </Card>
      ) : null}
      <Card className="plan-library-card">
        <div className="plan-library-heading">
          <div>
            <h2>Planbibliotek</h2>
            <p>
              Planerne hentes automatisk fra appens JSON-bibliotek og matches på
              distance og niveau.
            </p>
          </div>
        </div>
        <details className="plan-json-help">
          <summary>Sådan tilføjes planer til biblioteket</summary>
          <p>
            JSON-filer i src/data/training-plans læses automatisk. Angiv
            distance med race_distance_km og pas med sessions. Dag 1 er mandag,
            dag 7 er søndag. Niveau udledes af planens navn: Base, Build eller
            Performance (samt Beginner, Intermediate eller Advanced). Pas kan
            angives med distance_km eller distance_min.
          </p>
          <pre>{`{
  "id": "cph-half-begynder-12uger",
  "name": "Halvmarathon – Begynder",
  "race_distance_km": 21.0975,
  "duration_weeks": 12,
  "sessions": [
    {
      "week": 1,
      "day": 1,
      "title": "Rolig løb",
      "distance_km": 4,
      "note": "4 km"
    }
  ]
}`}</pre>
        </details>
        {plansState.error && (
          <p className="race-goal-error" role="alert">
            {plansState.error}
          </p>
        )}
        {plansState.plans.length === 0 ? (
          <p className="plan-library-empty">
            Biblioteket indeholder ingen træningsplaner endnu.
          </p>
        ) : (
          <ul className="plan-library-list">
            {plansState.plans.map((plan) => (
              <li key={plan.id}>
                <div>
                  <strong>{plan.name}</strong>
                  <span>
                    {formatKilometers(plan.distanceKm)} · {danishLevel[plan.level]} ·{" "}
                    {plan.weeklyKilometers.length} uger
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
