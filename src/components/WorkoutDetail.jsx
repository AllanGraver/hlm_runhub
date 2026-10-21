import { X } from "lucide-react";
import { paceFmt, timeFmt, vdotTrainingPaceRange } from "../services/calculations";
import "../styles/workout-detail.css";

const zoneGuidance = {
  E: {
    label: "Let løb",
    focus: "Byg udholdenhed i et roligt tempo, hvor du kan føre en samtale.",
    remember: "Start roligt, og hold et jævnt, afslappet tempo hele vejen.",
    avoid: "Undgå at gøre turen til en tempotur eller jagte andres fart.",
    example: "Løb roligt den planlagte distance. Hvis du skal løbe/gå, så følg passets angivne intervaller.",
  },
  M: {
    label: "Maratonpace",
    focus: "Øv et stabilt, kontrolleret tempo, du kan holde over længere tid.",
    remember: "Find rytmen gradvist, og hold indsatsen jævn gennem passet.",
    avoid: "Undgå at åbne for hurtigt eller løbe hurtigere end det aftalte pace.",
    example: "Varm op roligt, løb fx 3 × 10 minutter i kontrolleret maratonpace med 2 minutters let jog imellem, og jog af.",
  },
  T: {
    label: "Tærskel",
    focus: "Træn et vedvarende, krævende men kontrolleret tempo.",
    remember: "Hold igen fra start; indsatsen skal føles hård, men stabil og gentagelig.",
    avoid: "Undgå sprint og at presse så hårdt, at tempoet falder markant undervejs.",
    example: "Varm op roligt, løb fx 3 × 8 minutter i tærskelindsats med 2 minutters let jog imellem, og jog af.",
  },
  I: {
    label: "Intervaller",
    focus: "Arbejd med fart i afgrænsede intervaller, og hold kvaliteten ens fra start til slut.",
    remember: "Følg trænerens intervaller og pauser; start første interval kontrolleret.",
    avoid: "Undgå at sprinte første interval eller springe pauserne over.",
    example: "Hvis du træner alene: varm op 10–15 minutter, løb fx 6 × 3 minutter i kontrolleret intervalindsats med 2 minutters let jog, og jog af 10 minutter.",
  },
  R: {
    label: "Repetition",
    focus: "Træn korte, hurtige og afslappede gentagelser med god løbeteknik.",
    remember: "Lad pauserne være lange nok til, at du kan løbe næste gentagelse med god kvalitet.",
    avoid: "Undgå at gøre gentagelserne til en lang, udmattende spurt.",
    example: "Varm op 10–15 minutter, løb fx 6 × 20 sekunder hurtigt og afslappet med 1–2 minutters gang eller let jog, og jog af.",
  },
};

const unzonedGuidance = {
  Gang: {
    label: "Gang",
    focus: "Bevæg dig i et behageligt tempo, og brug turen som let aktivitet.",
    remember: "Følg den planlagte varighed. Hold pauser efter behov.",
    avoid: "Du behøver ikke løbe eller øge tempoet for at få noget ud af passet.",
    example: "Gå fx 30 minutter i et tempo, hvor du stadig kan tale ubesværet.",
  },
  "Løb / Gå": {
    label: "Løb / Gå",
    focus: "Veksle mellem løb og gang som beskrevet i det konkrete pas.",
    remember: "Brug gangpauserne som planlagt, også selvom du føler dig frisk.",
    avoid: "Undgå at løbe hurtigere eller springe gangpauser over for at forkorte passet.",
    example: "Følg løbe-/gangintervallerne i træningsbeskrivelsen, og hold den angivne samlede varighed.",
  },
};

const zoneFractions = {
  E: [0.59, 0.74],
  M: [0.75, 0.84],
  T: [0.83, 0.88],
  I: [0.95, 1],
  R: [1.05, 1.15],
};

function getGuidance(workout) {
  if (workout?.zone && zoneGuidance[workout.zone]) {
    return zoneGuidance[workout.zone];
  }
  return unzonedGuidance[workout?.name] ?? {
    label: "Selvtræning",
    focus: "Hold træningen på et niveau, hvor du kan gennemføre den med god kontrol.",
    remember: "Brug træningsbeskrivelsen som udgangspunkt, og tilpas efter dagsformen.",
    avoid: "Undgå at kompensere for et misset pas ved pludselig at øge mængden eller intensiteten.",
    example: "Vælg en rolig, velkendt tur, der passer til den planlagte varighed eller distance.",
  };
}

function formatPaceEstimate(range) {
  if (!range) return null;
  const [slowPace, fastPace] = range;
  return `${paceFmt(fastPace)}–${paceFmt(slowPace)} min/km`;
}

function formatSpeedEstimate(range) {
  if (!range) return null;
  const [slowPace, fastPace] = range;
  const slowSpeed = (3600 / slowPace).toFixed(1).replace(".", ",");
  const fastSpeed = (3600 / fastPace).toFixed(1).replace(".", ",");
  return `${slowSpeed}–${fastSpeed} km/t`;
}

function getDurationEstimate(workout, paceRange) {
  if (workout?.duration > 0) {
    return `${workout.duration} min (planlagt varighed)`;
  }
  if (workout?.distance > 0 && paceRange) {
    const [slowPace, fastPace] = paceRange;
    const fastestFinish = workout.distance * fastPace;
    const slowestFinish = workout.distance * slowPace;
    return `${timeFmt(fastestFinish)}–${timeFmt(slowestFinish)}`;
  }
  return null;
}

export default function WorkoutDetail({
  close,
  workout,
  team,
  vdot,
  hasSavedVdot,
  openVdotCalculator,
}) {
  const title = workout?.name ?? "Intervaller";
  const guidance = getGuidance(workout);
  const zoneFraction = workout?.zone ? zoneFractions[workout.zone] : null;
  const paceRange =
    hasSavedVdot && zoneFraction
      ? vdotTrainingPaceRange(vdot, ...zoneFraction)
      : null;
  const durationEstimate = getDurationEstimate(workout, paceRange);
  const workoutDetails = [
    team,
    workout?.distance > 0 && `${workout.distance} km`,
    workout?.duration > 0 && `${workout.duration} min`,
    workout?.zone && `Zone ${workout.zone}`,
  ].filter(Boolean).join(" · ");
  const soloExample = workout?.instructions
    ? `Følg passet fra arket: ${workout.instructions}`
    : guidance.example;

  return (
    <div className="overlay workout-detail-overlay" onClick={close}>
      <article
        className="workout-detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <span>TRÆNINGSOVERSIGT</span>
          <button type="button" onClick={close} aria-label="Luk træning">
            <X />
          </button>
        </header>
        <main>
          <div className="workout-detail-heading">
            {workout?.zone && (
              <span
                className={`zone-symbol zone-${workout.zone.toLowerCase()}`}
                aria-label={`Zone ${workout.zone}`}
              >
                {workout.zone}
              </span>
            )}
            <div>
              <small>{guidance.label}</small>
              <h1 id="workout-detail-title">{title}</h1>
            </div>
          </div>
          {workoutDetails && <p className="workout-detail-meta">{workoutDetails}</p>}

          <section className="workout-estimate" aria-live="polite">
            <h2>Estimat ud fra din VDOT</h2>
            {hasSavedVdot ? (
              <>
                <div className="workout-estimate-grid">
                  <div>
                    <small>Estimeret varighed</small>
                    <strong>
                      {durationEstimate ??
                        (workout?.name === "Hvile"
                          ? "Hviledag"
                          : "Afhænger af det konkrete pas")}
                    </strong>
                  </div>
                  <div>
                    <small>Vejledende løbetempo</small>
                    <strong>
                      {paceRange
                        ? formatPaceEstimate(paceRange)
                        : workout?.name === "Gang"
                          ? "Ikke relevant for gang"
                          : "Intet løbetempo angivet"}
                    </strong>
                  </div>
                  <div>
                    <small>Vejledende hastighed</small>
                    <strong>
                      {paceRange
                        ? formatSpeedEstimate(paceRange)
                        : workout?.name === "Gang"
                          ? "Behageligt gangtempo"
                          : "Kan ikke beregnes for dette pas"}
                    </strong>
                  </div>
                </div>
                {paceRange && workout?.duration > 0 && (
                  <p className="workout-estimate-note">
                    Tempoet gælder løbeintervallerne. Den samlede varighed
                    følger træningsplanen og inkluderer pauser.
                  </p>
                )}
                {paceRange && workout?.distance > 0 && (
                  <p className="workout-estimate-note">
                    Varigheden er beregnet ud fra distancen og et jævnt tempo i
                    zonens vejledende interval.
                  </p>
                )}
                <p className="workout-estimate-note">
                  VDOT {vdot.toFixed(1)} · Estimatet er vejledende og bør
                  tilpasses dagsform og forhold.
                </p>
              </>
            ) : (
              <div className="workout-vdot-reminder">
                <p>
                  Gem din VDOT i beregneren for at se et personligt estimat af
                  tempo og træningsvarighed.
                </p>
                <button
                  className="primary"
                  type="button"
                  onClick={openVdotCalculator}
                >
                  Beregn og gem VDOT
                </button>
              </div>
            )}
          </section>

          <section className="workout-guidance">
            <h2>Fokus</h2>
            <p>{guidance.focus}</p>
          </section>
          <section className="workout-guidance">
            <h2>Husk</h2>
            <p>{guidance.remember}</p>
          </section>
          <section className="workout-guidance">
            <h2>Undgå</h2>
            <p>{guidance.avoid}</p>
          </section>
          <section className="workout-guidance workout-solo-example">
            <h2>Hvis du træner på egen hånd</h2>
            <p>{soloExample}</p>
            <small>
              Eksemplet er et forslag til en individuel tur. Følg altid klubbens
              konkrete pas, når du deltager i fællestræningen.
            </small>
          </section>
        </main>
      </article>
    </div>
  );
}
