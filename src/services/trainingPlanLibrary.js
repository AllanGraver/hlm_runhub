export const trainingPlanLevels = ["base", "build", "performance"];
export const RACE_GOAL_STORAGE_KEY = "hlm_runhub_race_goal";
export const PLAN_STORAGE_KEY = "hlm_runhub_training_plan_library";
export const SELECTED_PLAN_STORAGE_KEY = "hlm_runhub_selected_training_plan";

const bundledPlanFiles = import.meta.glob("../data/training-plans/*.json", {
  eager: true,
  import: "default",
});

const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function isWorkout(workout) {
  return (
    workout &&
    weekdays.includes(workout.day) &&
    typeof workout.description === "string" &&
    workout.description.trim().length > 0 &&
    (typeof workout.distanceKm === "number" &&
    Number.isFinite(workout.distanceKm) &&
    workout.distanceKm >= 0
      ? typeof workout.durationMinutes === "undefined"
      : typeof workout.durationMinutes === "number" &&
        Number.isFinite(workout.durationMinutes) &&
        workout.durationMinutes >= 0 &&
        typeof workout.distanceKm === "undefined")
  );
}

function validateWorkoutsByWeek(workoutsByWeek, weeklyKilometers) {
  if (
    !Array.isArray(workoutsByWeek) ||
    workoutsByWeek.length !== weeklyKilometers.length ||
    workoutsByWeek.some(
      (week) =>
        !Array.isArray(week) ||
        week.some((workout) => !isWorkout(workout)),
    )
  ) {
    throw new Error(
      "workoutsByWeek skal indeholde et uge-array pr. uge med ugedag, beskrivelse og distanceKm eller durationMinutes.",
    );
  }

  const hasDuplicateDays = workoutsByWeek.some((week) => {
    const days = week.map(({ day }) => day);
    return new Set(days).size !== days.length;
  });
  if (hasDuplicateDays) {
    throw new Error(
      "Angiv højst ét træningspas pr. ugedag i hver uge i workoutsByWeek.",
    );
  }

  const mismatchedWeek = workoutsByWeek.findIndex((week, index) => {
    const total = week.reduce(
      (sum, workout) => sum + (workout.distanceKm ?? 0),
      0,
    );
    return Math.abs(total - weeklyKilometers[index]) > 0.1;
  });
  if (mismatchedWeek !== -1) {
    throw new Error(
      `Kilometrene i workoutsByWeek for uge ${mismatchedWeek + 1} skal svare til weeklyKilometers.`,
    );
  }
}

function levelFromName(name) {
  const normalized = name.toLocaleLowerCase("da");
  if (
    normalized.includes("performance") ||
    normalized.includes("advanced") ||
    normalized.includes("advanceret")
  ) {
    return "performance";
  }
  if (
    normalized.includes("build") ||
    normalized.includes("intermediate") ||
    normalized.includes("mellemniveau")
  ) {
    return "build";
  }
  if (
    normalized.includes("base") ||
    normalized.includes("beginner") ||
    normalized.includes("begynder")
  ) {
    return "base";
  }
  return "";
}

function normalizeSessionPlan(plan, name, level) {
  const distanceKm = plan.race_distance_km;
  const durationWeeks = plan.duration_weeks;
  if (
    typeof distanceKm !== "number" ||
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0
  ) {
    throw new Error("race_distance_km skal være et tal større end 0.");
  }
  if (
    !Number.isInteger(durationWeeks) ||
    durationWeeks <= 0 ||
    durationWeeks > 104
  ) {
    throw new Error("duration_weeks skal være et heltal mellem 1 og 104.");
  }
  if (!trainingPlanLevels.includes(level)) {
    throw new Error(
      "Niveauet kan ikke udledes. Angiv level, eller brug beginner, intermediate eller advanced i navnet.",
    );
  }
  if (!Array.isArray(plan.sessions) || plan.sessions.length === 0) {
    throw new Error("sessions skal indeholde mindst ét træningspas.");
  }

  const workoutsByWeek = Array.from({ length: durationWeeks }, () => []);
  for (const session of plan.sessions) {
    if (
      !session ||
      typeof session !== "object" ||
      !Number.isInteger(session.week) ||
      session.week < 1 ||
      session.week > durationWeeks
    ) {
      throw new Error(
        `Hver session skal have et week-tal mellem 1 og ${durationWeeks}.`,
      );
    }
    if (!Number.isInteger(session.day) || session.day < 1 || session.day > 7) {
      throw new Error("Hver session skal have et day-tal mellem 1 og 7.");
    }
    const hasKilometers =
      typeof session.distance_km === "number" &&
      Number.isFinite(session.distance_km) &&
      session.distance_km >= 0;
    const hasDuration =
      typeof session.distance_min === "number" &&
      Number.isFinite(session.distance_min) &&
      session.distance_min >= 0;
    if (
      typeof session.title !== "string" ||
      !session.title.trim() ||
      hasKilometers === hasDuration
    ) {
      throw new Error(
        "Hver session skal have title og præcis én gyldig distance_km eller distance_min.",
      );
    }
    workoutsByWeek[session.week - 1].push({
      day: weekdays[session.day - 1],
      description: session.title.trim(),
      ...(hasKilometers
        ? { distanceKm: session.distance_km }
        : { durationMinutes: session.distance_min }),
    });
  }

  const weeklyKilometers = workoutsByWeek.map((week) =>
    week.reduce((total, workout) => total + (workout.distanceKm ?? 0), 0),
  );
  const weeklyDurationMinutes = workoutsByWeek.map((week) =>
    week.reduce((total, workout) => total + (workout.durationMinutes ?? 0), 0),
  );
  validateWorkoutsByWeek(workoutsByWeek, weeklyKilometers);

  return {
    name,
    description: `${durationWeeks} ugers træningsplan`,
    distanceKm,
    level,
    weeklyKilometers,
    weeklyDurationMinutes,
    workoutsByWeek,
  };
}

export function parseTrainingPlan(contents, fallbackName = "") {
  const plan = JSON.parse(contents);
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
    throw new Error("JSON-filen skal indeholde ét træningsprogram.");
  }

  const name =
    typeof plan.name === "string" && plan.name.trim()
      ? plan.name.trim()
      : fallbackName.replace(/\.json$/i, "");
  if (Array.isArray(plan.sessions)) {
    const level =
      typeof plan.level === "string"
        ? plan.level.toLowerCase()
        : levelFromName(`${name} ${fallbackName}`);
    return normalizeSessionPlan(plan, name, level);
  }

  const distanceKm = plan.distanceKm;
  const level = typeof plan.level === "string" ? plan.level.toLowerCase() : "";
  const weeklyKilometers = plan.weeklyKilometers;
  if (!name) throw new Error("Planen mangler et navn.");
  if (
    typeof distanceKm !== "number" ||
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0
  ) {
    throw new Error("distanceKm skal være et tal større end 0.");
  }
  if (!trainingPlanLevels.includes(level)) {
    throw new Error("level skal være base, build eller performance.");
  }
  if (
    !Array.isArray(weeklyKilometers) ||
    weeklyKilometers.length === 0 ||
    weeklyKilometers.some(
      (kilometers) =>
        typeof kilometers !== "number" ||
        !Number.isFinite(kilometers) ||
        kilometers < 0,
    )
  ) {
    throw new Error(
      "weeklyKilometers skal være en liste med ugentlige kilometer-tal.",
    );
  }
  if (plan.workoutsByWeek !== undefined) {
    validateWorkoutsByWeek(plan.workoutsByWeek, weeklyKilometers);
  }

  return {
    name,
    description:
      typeof plan.description === "string" ? plan.description.trim() : "",
    distanceKm,
    level,
    weeklyKilometers,
    ...(plan.workoutsByWeek === undefined
      ? {}
      : { workoutsByWeek: plan.workoutsByWeek }),
  };
}

export function isStoredTrainingPlan(plan) {
  return (
    plan &&
    typeof plan.id === "string" &&
    typeof plan.name === "string" &&
    Number.isFinite(plan.distanceKm) &&
    plan.distanceKm > 0 &&
    trainingPlanLevels.includes(plan.level) &&
    Array.isArray(plan.weeklyKilometers) &&
    plan.weeklyKilometers.length > 0 &&
    plan.weeklyKilometers.every(
      (kilometers) =>
        typeof kilometers === "number" &&
        Number.isFinite(kilometers) &&
        kilometers >= 0,
    ) &&
    (plan.weeklyDurationMinutes === undefined ||
      (Array.isArray(plan.weeklyDurationMinutes) &&
        plan.weeklyDurationMinutes.length === plan.weeklyKilometers.length &&
        plan.weeklyDurationMinutes.every(
          (minutes) =>
            typeof minutes === "number" &&
            Number.isFinite(minutes) &&
            minutes >= 0,
        ))) &&
    (plan.workoutsByWeek === undefined ||
      (() => {
        try {
          validateWorkoutsByWeek(plan.workoutsByWeek, plan.weeklyKilometers);
          return true;
        } catch {
          return false;
        }
      })())
  );
}

export function getTrainingPlans() {
  const bundledPlans = Object.entries(bundledPlanFiles).map(([path, data]) => {
    const filename = path.split("/").at(-1);
    const plan = parseTrainingPlan(JSON.stringify(data), filename);
    return { ...plan, id: `library:${path}` };
  });
  const storedValue = window.localStorage.getItem(PLAN_STORAGE_KEY);
  const storedPlans = storedValue ? JSON.parse(storedValue) : [];
  if (!Array.isArray(storedPlans) || !storedPlans.every(isStoredTrainingPlan)) {
    throw new Error("Bibliotekets gemte data har et ugyldigt format.");
  }

  const bundledKeys = new Set(
    bundledPlans.map(
      ({ name, distanceKm, level }) => `${name}:${distanceKm}:${level}`,
    ),
  );
  return [
    ...bundledPlans,
    ...storedPlans.filter(
      ({ name, distanceKm, level }) =>
        !bundledKeys.has(`${name}:${distanceKm}:${level}`),
    ),
  ];
}
