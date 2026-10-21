export const trainingIntensityFactors = {
  easy: 1,
  moderate: 1.2,
  hard: 1.5,
  long: 1.25,
  competition: 1.7,
};

export function getTrainingIntensity(workout) {
  const name = workout.name.toLocaleLowerCase("da");
  if (/konkurrence|competition|race|løbskonkurrence/.test(name)) {
    return { label: "Konkurrence", factor: trainingIntensityFactors.competition };
  }
  if (/langtur|lang,|lang rolig|long run/.test(name)) {
    return { label: "Langtur", factor: trainingIntensityFactors.long };
  }
  if (/interval|hård|hard/.test(name) || workout.zone === "I") {
    return { label: "Hård", factor: trainingIntensityFactors.hard };
  }
  if (/moderat|tempo|maratonpace|marathon pace/.test(name) || workout.zone === "T" || workout.zone === "M") {
    return { label: "Moderat", factor: trainingIntensityFactors.moderate };
  }
  return { label: "Rolig", factor: trainingIntensityFactors.easy };
}

export function estimateWorkoutLoad(workout) {
  if (workout.distance > 0) {
    return workout.distance * getTrainingIntensity(workout).factor;
  }
  return workout.duration > 0 ? null : 0;
}
