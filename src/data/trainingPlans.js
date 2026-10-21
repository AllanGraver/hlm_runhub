export const trainingTeams = ["Hold 1", "Hold 2", "Hold 3"];

export const weeklyTrainingPlans = {
  "Hold 1": [
    { weekday: 3, zone: "E", distance: 5, name: "Rolig tur" },
    { weekday: 6, zone: "E", distance: 7, name: "Lang, rolig tur" },
  ],
  "Hold 2": [
    { weekday: 3, zone: "I", distance: 9, name: "Intervaller" },
    { weekday: 6, zone: "E", distance: 6, name: "Rolig tur" },
  ],
  "Hold 3": [
    { weekday: 3, zone: "T", distance: 8, name: "Tempotur" },
    { weekday: 6, zone: "M", distance: 10, name: "Maratonpace" },
  ],
};

const mondayRows = [
  ["2026-07-06", ["Hvile"], ["Gang", 3], ["Restitutionsløb", 5]],
  ["2026-07-13", ["Hvile"], ["Gang", 3], ["Restitutionsløb", 5]],
  ["2026-07-20", ["Hvile"], ["Gang", 3], ["Restitutionsløb", 5]],
  ["2026-07-27", ["Hvile"], ["Gang", 3], ["Restitutionsløb", 5]],
  ["2026-08-03", ["Hvile"], ["Gang", 3], ["Restitutionsløb (E)", 5]],
  ["2026-08-10", ["Hvile"], ["Gang", 3], ["Restitutionsløb (E)", 5]],
  ["2026-08-17", ["Hvile"], ["Gang", 3], ["Restitutionsløb (E)", 5]],
  ["2026-08-24", ["Gang", 20], ["Gang", 4], ["Restitutionsløb (E)", 6]],
  ["2026-08-31", ["Gang", 30], ["Gang", 3], ["Intervalløb (M-AE1)", 6]],
  ["2026-09-07", ["Gang", 30], ["Gang", 3], ["Intervalløb (M-AE1)", 6]],
  ["2026-09-14", ["Gang", 30], ["Løb / Gå", 3], ["Intervalløb (M-AE3)", 8]],
  ["2026-09-21", ["Gang", 30], ["Løb / Gå", 4], ["Intervalløb (M-AE1)", 8]],
  ["2026-09-28", ["Gang", 30], ["Løb / Gå", 4], ["Intervalløb (M-AE1)", 8]],
  ["2026-10-05", ["Gang", 30], ["Løb / Gå", 4], ["Intervalløb (M-AE3)", 6]],
  ["2026-10-12", ["Gang", 30], ["Restitutionsløb (E)", 5], ["Intervalløb (M-AE1)", 6]],
  ["2026-10-19", ["Gang", 30], ["Restitutionsløb (E)", 5], ["Intervalløb (M-AE2)", 8]],
  ["2026-10-26", ["Gang", 30], ["Restitutionsløb (E)", 5], ["Intervalløb (M-AE2)", 8]],
  ["2026-11-02", ["Gang", 30], ["Restitutionsløb (E)", 5], ["Intervalløb (M-AE3)", 9]],
  ["2026-11-09", ["Gang", 30], ["Restitutionsløb", 5], ["Intervalløb (M-AE1)", 10]],
  ["2026-11-16", ["Gang", 30], ["Restitutionsløb", 5], ["Intervalløb (M-AE2)", 10]],
  ["2026-11-23", ["Gang", 30], ["Restitutionsløb", 5], ["Intervalløb (M-AE2)", 8]],
  ["2026-11-30", ["Gang", 30], ["Restitutionsløb", 5], ["Intervalløb (M-AE3)", 8]],
  ["2026-12-07", ["Gang", 30], ["Restitutionsløb", 5], ["Intervalløb (M-AE2)", 10]],
  ["2026-12-14", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 8]],
  ["2026-12-21", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 5]],
  ["2026-12-28", ["Gang", 30], ["Restitutionsløb", 3], ["Restitutionsløb", 5]],
  ["2027-01-04", ["Gang", 30], ["Restitutionsløb"], ["Restitutionsløb", 5]],
  ["2027-01-11", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 5]],
  ["2027-01-18", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 5]],
  ["2027-01-25", ["Gang", 30], ["Selvtræning", 5], ["Selvtræning", 5]],
  ["2027-02-01", ["Gang", 30], ["Selvtræning", 5], ["Selvtræning", 5]],
  ["2027-02-08", ["Gang", 30], ["Selvtræning", 5], ["Selvtræning", 5]],
  ["2027-02-15", ["Gang", 30], ["Selvtræning", 5], ["Selvtræning", 5]],
  ["2027-02-22", ["Restitutionsløb", 30], ["Selvtræning", 3], ["Selvtræning", 7]],
  ["2027-03-01", ["Gang", 30], ["Gang", 3], ["Restitutionsløb", 6]],
  ["2027-03-08", ["Hvile", 30], ["Gang", 3], ["Restitutionsløb", 6]],
  ["2027-03-15", ["Gang", 30], ["Gang", 3], ["Restitutionsløb", 8]],
  ["2027-03-22", ["Gang", 30], ["Løb / Gå", 3], ["Restitutionsløb", 8]],
  ["2027-03-29", ["Gang", 30], ["Løb / Gå", 4], ["Restitutionsløb", 7]],
  ["2027-04-05", ["Gang", 30], ["Løb / Gå", 4], ["Restitutionsløb", 6]],
  ["2027-04-12", ["Gang", 30], ["Løb / Gå", 4], ["Restitutionsløb", 8]],
  ["2027-04-19", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 8]],
  ["2027-04-26", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 5]],
  ["2027-05-03", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 10]],
  ["2027-05-10", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 12]],
  ["2027-05-17", ["Gang", 30], ["Restitutionsløb", 5], ["Selvtræning", 10]],
  ["2027-05-24", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 10]],
  ["2027-05-31", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 5]],
  ["2027-06-07", ["Gang", 30], ["Restitutionsløb", 5], ["Restitutionsløb", 8]],
  ["2027-06-14", ["Gang", 30], ["Restitutionsløb", 5], ["Selvtræning", 5]],
  ["2027-06-21", ["Gang"], ["Selvtræning", 5], ["Selvtræning", 5]],
  ["2027-06-28", ["Gang"], ["Selvtræning", 5], ["Selvtræning", 5]],
];

function getMondayZone(name) {
  if (name.startsWith("Restitutionsløb")) return "E";
  if (name.startsWith("Intervalløb")) return "I";
  if (name === "Løb / Gå" || name === "Selvtræning") return "E";
  return null;
}

export const mondayTrainingPlans = Object.fromEntries(
  mondayRows.map(([date, ...teamWorkouts]) => [
    date,
    Object.fromEntries(
      trainingTeams.map((team, index) => {
        const [name, amount] = teamWorkouts[index];
        const isWalkingPlan = index === 0;
        return [
          team,
          {
            name,
            zone: getMondayZone(name),
            distance: isWalkingPlan ? 0 : Number(amount) || 0,
            duration: isWalkingPlan && name !== "Hvile" ? Number(amount) || 0 : 0,
          },
        ];
      }),
    ),
  ]),
);