import { Activity, Check, Clock3, Dumbbell, ShieldCheck } from "lucide-react";
import "../styles/runner-strength.css";

const strengthSessions = [
  {
    label: "PAS A",
    title: "Styrke og stabilitet",
    focus: "Ben, hofte og læg",
    exercises: [
      {
        name: "Squat til stol",
        dose: "2–3 × 8–10",
        instruction: "Sæt dig kontrolleret mod en stol, og rejs dig ved at presse gennem hele foden.",
        easier: "Brug en højere stol, eller hold let fast i et gelænder.",
      },
      {
        name: "Glute bridge",
        dose: "2–3 × 10–12",
        instruction: "Lig på ryggen med bøjede knæ. Løft hoften, spænd balderne, og sænk roligt.",
        easier: "Løft hoften kortere vej, hvis det føles mere behageligt.",
      },
      {
        name: "Hælløft",
        dose: "2–3 × 10–12",
        instruction: "Stå stabilt, løft hælene roligt, og sænk dem langsomt igen.",
        easier: "Brug begge ben og støt let med en hånd mod væggen.",
      },
      {
        name: "Bird dog",
        dose: "2–3 × 6–8 pr. side",
        instruction: "Stå på alle fire. Stræk modsatte arm og ben, hold kroppen rolig, og skift side.",
        easier: "Bevæg kun én arm eller ét ben ad gangen.",
      },
    ],
  },
  {
    label: "PAS B",
    title: "Ensidig styrke og balance",
    focus: "Lår, bagkæde og ankel",
    exercises: [
      {
        name: "Split squat med støtte",
        dose: "2–3 × 6–8 pr. side",
        instruction: "Stå forskudt, hold let ved støtte, og bøj begge knæ i en kort, kontrolleret bevægelse.",
        easier: "Gør bevægelsen mindre, eller brug en stol som støtte.",
      },
      {
        name: "Hoftehængsel",
        dose: "2–3 × 8–10",
        instruction: "Stå med bløde knæ. Skub hoften bagud med ret ryg, og kom op igen ved at spænde balderne.",
        easier: "Øv bevægelsen uden vægt og med hænderne på hofterne.",
      },
      {
        name: "Etbens hælløft",
        dose: "2–3 × 6–10 pr. side",
        instruction: "Stå på ét ben med støtte ved behov. Løft og sænk hælen roligt gennem et behageligt bevægeudslag.",
        easier: "Hold begge fødder i gulvet og fordel arbejdet på begge ben.",
      },
      {
        name: "Etbensbalance",
        dose: "2 × 20–30 sek. pr. side",
        instruction: "Stå højt på ét ben og hold balancen uden at spænde unødigt i skuldrene.",
        easier: "Stå tæt ved en væg, så du kan støtte med en finger.",
      },
    ],
  },
];

function StrengthExercise({ exercise, index }) {
  return (
    <article className="strength-exercise">
      <div className="strength-exercise-heading">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <h4>{exercise.name}</h4>
        <strong>{exercise.dose}</strong>
      </div>
      <p>{exercise.instruction}</p>
      <small><Check size={12} /> Tilpasning: {exercise.easier}</small>
    </article>
  );
}

export default function RunnerStrengthGuide() {
  return (
    <div className="runner-strength">
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Hvordan kan styrketræning støtte min løbetræning?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Få et overskueligt udgangspunkt med grundøvelser for ben, hofte,
            læg og kropskontrol, som kan bygges gradvist ind i løbeugen.
          </p>
        </section>
      </div>

      <section className="strength-hero">
        <div className="strength-hero-icon"><Dumbbell size={20} /></div>
        <div>
          <small>HLM LØBEUNIVERSITET · STYRKE</small>
          <h2>Styrketræning for løbere</h2>
          <p>
            Styrke kan supplere løbetræningen med bedre kapacitet til at
            håndtere belastning. Start på et niveau, hvor du kan bevæge dig
            kontrolleret, og giv kroppen tid til at vænne sig til nye øvelser.
          </p>
        </div>
      </section>

      <div className="strength-stats">
        <article><small>FORSLAG</small><strong>2 pas</strong><span>skift mellem A og B</span></article>
        <article><small>VARIGHED</small><strong>20–30 min</strong><span>inkl. korte pauser</span></article>
        <article><small>START</small><strong>2 sæt</strong><span>pr. øvelse</span></article>
        <article><small>FOKUS</small><strong>Kontrol</strong><span>før tungere belastning</span></article>
      </div>

      <section className="strength-guidance">
        <h3><Activity size={15} /> Sådan bruger du programmet</h3>
        <div>
          <p><b>1. Start roligt</b><span>Begynd med 2 sæt og let modstand. Afslut sættet med overskud.</span></p>
          <p><b>2. Skift mellem A og B</b><span>Fordel pas hen over ugen med tid til restitution — undgå at presse dem ind før hårde løb.</span></p>
          <p><b>3. Øg gradvist</b><span>Når teknikken er stabil, kan du først lægge gentagelser til og senere øge modstanden lidt.</span></p>
        </div>
      </section>

      <div className="strength-plan-heading">
        <div>
          <small>TO ENKLE HELKROPSPAS</small>
          <h2>Vælg det pas, der passer til dagen</h2>
        </div>
        <span><Clock3 size={12} /> 20–30 MIN</span>
      </div>

      <div className="strength-session-grid">
        {strengthSessions.map((session) => (
          <section className="strength-session" key={session.label}>
            <header>
              <span>{session.label}</span>
              <div><h3>{session.title}</h3><small>{session.focus}</small></div>
            </header>
            <div className="strength-exercise-list">
              {session.exercises.map((exercise, index) => (
                <StrengthExercise
                  key={exercise.name}
                  exercise={exercise}
                  index={index}
                />
              ))}
            </div>
            <p className="strength-rest">
              Hold cirka 60–120 sekunders pause efter hvert sæt — længere hvis
              du har brug for at få kontrollen og vejrtrækningen tilbage.
            </p>
          </section>
        ))}
      </div>

      <section className="strength-safety">
        <h3><ShieldCheck size={15} /> Sikker og realistisk progression</h3>
        <ul>
          <li>Lav øvelserne roligt og med en bevægelse, du kan kontrollere.</li>
          <li>Begynd uden ekstra vægt. Tilføj først belastning, når øvelsen føles sikker.</li>
          <li>Undgå at øge vægt, sæt og gentagelser på samme tid.</li>
          <li>Stop ved skarp smerte eller ubehag, og søg individuel vejledning ved vedvarende gener.</li>
        </ul>
      </section>

      <p className="strength-note">
        Dette er generel træningsinspiration — ikke en individuel plan eller
        behandling. Har du en skade, sygdom eller er usikker på teknikken, så
        tal med en relevant fagperson, før du går i gang. Inspiration:
        {" "}
        <a
          href="https://www.loberlab.dk/artikler/styrketraening-for-lobere"
          target="_blank"
          rel="noreferrer"
        >
          LøberLab: Styrketræning for løbere
        </a>
        .
      </p>
    </div>
  );
}
