import { mondayTrainingPlans, weeklyTrainingPlans } from "./trainingPlans";
import { hold1WeekdayPlans } from "./hold1WeekdayPlans";

export function getWorkoutForDate(date, team) {
  const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const hold1Workout =
    team === "Hold 1" ? hold1WeekdayPlans[dateKey] : undefined;
  if (hold1Workout) return hold1Workout;

  const mondayWorkout = mondayTrainingPlans[dateKey]?.[team];
  if (mondayWorkout) return mondayWorkout;

  return (
    weeklyTrainingPlans[team].find(({ weekday }) => weekday === date.getDay()) ?? {
      zone: null,
      distance: 0,
      duration: 0,
      name: date.getDay() === 1 ? "Selvtræning" : "Hvile",
    }
  );
}

export function hasScheduledWorkout(workout) {
  return (
    workout.distance > 0 ||
    workout.duration > 0 ||
    Boolean(workout.zone) ||
    !["Hvile", "Selvtræning"].includes(workout.name)
  );
}
