import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import "../styles/runner-strength.css";

const levels = {
  all: { label: "Alle" },
  beginner: { label: "Begynder" },
  intermediate: { label: "Øvet" },
  advanced: { label: "Avanceret" },
};

const strengthSessions = [
  {
    id: "a",
    label: "PAS A",
    title: "Styrke og stabilitet",
    focus: "Ben, hofte og læg",
    cue: "Arbejd roligt og kontrolleret. Øg først belastningen, når bevægelsen er stabil.",
    progressions: [
      {
        movement: "Squat",
        purpose: "Opbyg styrke i lår og hofte med en stabil squatbevægelse.",
        exercises: {
          beginner: {
            name: "Squat til stol",
            dose: "2 × 8–10",
            load: "Kropsvægt",
            instruction: "Sæt dig kontrolleret mod en stol, og rejs dig ved at presse gennem hele foden.",
            focus: "Kontrol · knæretning · hele foden",
            next: "Goblet squat",
          },
          intermediate: {
            name: "Goblet squat",
            dose: "3 × 6–8",
            load: "Moderat belastning",
            instruction: "Hold en håndvægt eller kettlebell foran kroppen. Sænk dig kontrolleret og pres op gennem hele foden.",
            focus: "Stabilitet · dybde · belastning",
            next: "Tung squat",
          },
          advanced: {
            name: "Tung squat",
            dose: "3–4 × 4–6",
            load: "Tung belastning",
            instruction: "Brug en squatvariant, du mestrer, og arbejd tungt uden at miste bevægelseskvalitet.",
            focus: "Styrke · stabil position · kontrol",
            next: "Øg belastningen gradvist",
          },
        },
      },
      {
        movement: "Hofte",
        purpose: "Styrk balder og bagkæde, så hoften kan bidrage effektivt i løbeskridtet.",
        exercises: {
          beginner: {
            name: "Glute bridge",
            dose: "2 × 10–12",
            load: "Kropsvægt",
            instruction: "Lig på ryggen med bøjede knæ. Løft hoften, spænd balderne og sænk roligt.",
            focus: "Balder · bækkenkontrol · roligt tempo",
            next: "Etbens glute bridge",
          },
          intermediate: {
            name: "Etbens glute bridge",
            dose: "3 × 8–10 pr. side",
            load: "Kropsvægt / let vægt",
            instruction: "Hold bækkenet stabilt, løft hoften med ét ben og undgå at rotere i kroppen.",
            focus: "Ensidig styrke · hoftekontrol",
            next: "Belastet hip thrust",
          },
          advanced: {
            name: "Belastet hip thrust",
            dose: "3–4 × 5–8",
            load: "Tung belastning",
            instruction: "Arbejd gennem et kontrolleret bevægeudslag og afslut løftet med balderne, ikke lænden.",
            focus: "Høj kraft · bagkæde · hofteekstension",
            next: "Øg belastningen gradvist",
          },
        },
      },
      {
        movement: "Læg",
        purpose: "Opbyg styrke omkring ankel og læg til afsæt og gentagen belastning.",
        exercises: {
          beginner: {
            name: "Hælløft med begge ben",
            dose: "2 × 10–12",
            load: "Kropsvægt",
            instruction: "Stå stabilt, løft hælene roligt og sænk dem langsomt tilbage.",
            focus: "Fuldt bevægeudslag · kontrol",
            next: "Etbens hælløft",
          },
          intermediate: {
            name: "Etbens hælløft",
            dose: "3 × 8–12 pr. side",
            load: "Kropsvægt",
            instruction: "Stå på ét ben med let støtte ved behov. Løft højt og sænk langsomt.",
            focus: "Ensidig lægstyrke · stabil ankel",
            next: "Belastet etbens hælløft",
          },
          advanced: {
            name: "Belastet etbens hælløft",
            dose: "3–4 × 6–8 pr. side",
            load: "Ekstra vægt",
            instruction: "Tilføj belastning, men bevar samme højde og kontrol gennem alle gentagelser.",
            focus: "Høj belastning · ankelstivhed · kontrol",
            next: "Øg belastningen gradvist",
          },
        },
      },
      {
        movement: "Kropskontrol",
        purpose: "Styrk kontrollen omkring bækken og kropsstamme under bevægelse.",
        exercises: {
          beginner: {
            name: "Bird dog",
            dose: "2 × 6–8 pr. side",
            load: "Kropsvægt",
            instruction: "Stå på alle fire. Stræk modsatte arm og ben uden at rotere i kroppen.",
            focus: "Stabilitet · roligt tempo · bækkenkontrol",
            next: "Bird dog med pause",
          },
          intermediate: {
            name: "Bird dog med pause",
            dose: "3 × 6–8 pr. side",
            load: "Langsomt tempo",
            instruction: "Hold yderpositionen 2–3 sekunder og bevar bækken og ryg helt rolige.",
            focus: "Tid under spænding · kontrol",
            next: "Anti-rotation",
          },
          advanced: {
            name: "Anti-rotation med modstand",
            dose: "3 × 6–10 pr. side",
            load: "Elastik / kabel",
            instruction: "Modstå rotation fra en elastik eller kabel og hold bækken og brystkasse stabile.",
            focus: "Kropsstamme · kraftoverførsel · stabilitet",
            next: "Øg modstanden gradvist",
          },
        },
      },
    ],
  },
  {
    id: "b",
    label: "PAS B",
    title: "Ensidig styrke og balance",
    focus: "Lår, bagkæde og ankel",
    cue: "Hold hoften stabil og lad kvaliteten bestemme bevægeudslaget og belastningen.",
    progressions: [
      {
        movement: "Split squat",
        purpose: "Byg ensidig benstyrke og kontrol i en position, der stiller krav til hvert ben for sig.",
        exercises: {
          beginner: {
            name: "Split squat med støtte",
            dose: "2 × 6–8 pr. side",
            load: "Kropsvægt",
            instruction: "Stå forskudt, hold let ved støtte og bøj begge knæ i en kontrolleret bevægelse.",
            focus: "Balance · knækontrol · bevægeudslag",
            next: "Split squat uden støtte",
          },
          intermediate: {
            name: "Split squat",
            dose: "3 × 6–8 pr. side",
            load: "Kropsvægt / håndvægte",
            instruction: "Arbejd uden støtte og hold overkroppen stabil, mens begge knæ bøjes.",
            focus: "Ensidig styrke · stabilitet",
            next: "Bulgarian split squat",
          },
          advanced: {
            name: "Bulgarian split squat",
            dose: "3 × 5–8 pr. side",
            load: "Moderat / tung belastning",
            instruction: "Placér bageste fod hævet og arbejd kontrolleret gennem forreste ben.",
            focus: "Høj ensidig belastning · kontrol",
            next: "Øg belastningen gradvist",
          },
        },
      },
      {
        movement: "Hoftehængsel",
        purpose: "Styrk baglår, balder og hofteekstension med et kontrolleret hoftehængsel.",
        exercises: {
          beginner: {
            name: "Hoftehængsel",
            dose: "2 × 8–10",
            load: "Kropsvægt",
            instruction: "Stå med bløde knæ. Skub hoften bagud med neutral ryg og kom op ved at spænde balderne.",
            focus: "Hofte tilbage · stabil ryg · kontrol",
            next: "Romanian deadlift",
          },
          intermediate: {
            name: "Romanian deadlift",
            dose: "3 × 6–8",
            load: "Håndvægte / kettlebell",
            instruction: "Hold vægten tæt på kroppen og sænk, indtil du mærker tydelig spænding i baglårene.",
            focus: "Bagkæde · hoftekontrol · belastning",
            next: "Tung Romanian deadlift",
          },
          advanced: {
            name: "Tung Romanian deadlift",
            dose: "3–4 × 4–6",
            load: "Tung belastning",
            instruction: "Arbejd tungt med et bevægeudslag, hvor ryg og bækken kan holdes stabile.",
            focus: "Høj styrke · bagkæde · kontrol",
            next: "Øg belastningen gradvist",
          },
        },
      },
      {
        movement: "Læg",
        purpose: "Styrk læg og ankel ensidigt og gør øvelsen gradvist mere belastende.",
        exercises: {
          beginner: {
            name: "Hælløft med støtte",
            dose: "2 × 10–12",
            load: "Begge ben",
            instruction: "Brug begge ben og let støtte, mens hælene løftes og sænkes kontrolleret.",
            focus: "Kontrol · bevægeudslag",
            next: "Etbens hælløft",
          },
          intermediate: {
            name: "Etbens hælløft",
            dose: "3 × 8–12 pr. side",
            load: "Kropsvægt",
            instruction: "Udfør hele bevægelsen på ét ben og brug kun let støtte til balancen.",
            focus: "Ensidig styrke · stabil ankel",
            next: "Etbens hælløft med vægt",
          },
          advanced: {
            name: "Etbens hælløft med vægt",
            dose: "3–4 × 6–8 pr. side",
            load: "Tung belastning",
            instruction: "Tilføj vægt og bevar et tydeligt, kontrolleret bevægeudslag.",
            focus: "Høj lægstyrke · kontrol",
            next: "Øg belastningen gradvist",
          },
        },
      },
      {
        movement: "Balance og spændstighed",
        purpose: "Udvikl fra statisk balance til mere dynamisk og løbespecifik kontrol.",
        exercises: {
          beginner: {
            name: "Etbensbalance",
            dose: "2 × 20–30 sek. pr. side",
            load: "Kropsvægt",
            instruction: "Stå højt på ét ben og hold balancen med afslappede skuldre.",
            focus: "Fod · ankel · hoftekontrol",
            next: "Dynamisk etbensbalance",
          },
          intermediate: {
            name: "Dynamisk etbensbalance",
            dose: "2–3 × 6–8 pr. side",
            load: "Kropsvægt",
            instruction: "Stå på ét ben og bevæg det frie ben eller overkroppen uden at miste kontrollen.",
            focus: "Dynamisk balance · hoftekontrol",
            next: "Pogo hops",
          },
          advanced: {
            name: "Pogo hops",
            dose: "2–3 × 10–20 sek.",
            load: "Fjedrende hop",
            instruction: "Lav små, lette hop med kort kontakt mod underlaget og stabil kropsposition.",
            focus: "Spændstighed · ankel · korte kontakter",
            next: "Øg først varighed eller kvalitet",
          },
        },
      },
    ],
  },
];

const levelOrder = ["beginner", "intermediate", "advanced"];

function LevelPill({ level }) {
  return <span className={`strength-level strength-level--${level}`}>{levels[level].label}</span>;
}

function ExerciseCard({ movement, purpose, level, exercise }) {
  return (
    <article className="strength-exercise-card">
      <div className="strength-exercise-topline">
        <small>{movement.toUpperCase()}</small>
        <LevelPill level={level} />
      </div>

      <h4>{exercise.name}</h4>

      <div className="strength-purpose">
        <small>FORMÅL</small>
        <p>{purpose}</p>
      </div>

      <div className="strength-card-section">
        <b>Sådan gør du</b>
        <p>{exercise.instruction}</p>
      </div>

      <div className="strength-card-section">
        <b>Fokus</b>
        <p>{exercise.focus}</p>
      </div>

      <div className="strength-card-section">
        <b>{level === "advanced" ? "Progression" : "Næste niveau"}</b>
        <p>{exercise.next}</p>
      </div>

      <footer>
        <span><Dumbbell size={12} /> {exercise.dose}</span>
        <span>{exercise.load}</span>
      </footer>
    </article>
  );
}

function SessionSection({ session, selectedLevel }) {
  const visibleLevels = selectedLevel === "all" ? levelOrder : [selectedLevel];

  return (
    <section className="strength-session-section" id={`strength-pass-${session.id}`}>
      <header className="strength-phase-header">
        <div className="strength-phase-number">{session.id.toUpperCase()}</div>
        <div>
          <small>{session.label} · STYRKETRÆNING</small>
          <h2>{session.title}</h2>
          <p>{session.focus}</p>
        </div>
        <aside>
          <b>Instruktørens cue</b>
          <p>{session.cue}</p>
        </aside>
      </header>

      <div className="strength-card-grid">
        {session.progressions.flatMap((progression) =>
          visibleLevels.map((level) => (
            <ExerciseCard
              key={`${session.id}-${progression.movement}-${level}`}
              movement={progression.movement}
              purpose={progression.purpose}
              level={level}
              exercise={progression.exercises[level]}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function RunnerStrengthGuide() {
  const [selectedLevel, setSelectedLevel] = useState("beginner");

  const selectedLabel = useMemo(
    () => levels[selectedLevel]?.label ?? levels.beginner.label,
    [selectedLevel]
  );

  return (
    <div className="runner-strength">
      <div className="tools-intro">
        <section>
          <small>BYG STYRKE TRIN FOR TRIN</small>
          <h2>Styrketræning opbygget efter niveau</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Find dit niveau og se, hvordan de samme bevægelser kan udvikles fra
            en enkel grundøvelse til mere belastende styrketræning.
          </p>
        </section>
      </div>

      <section className="strength-hero">
        <div className="strength-hero-main">
          <div className="strength-hero-icon"><Dumbbell size={20} /></div>
          <div>
            <small>HLM LØBEUNIVERSITET · STYRKE</small>
            <h2>Styrkeskolen for løbere</h2>
            <p>
              Byg ben, hofte, læg og kropskontrol gradvist. Vælg det niveau,
              hvor du kan arbejde sikkert og kontrolleret, og brug næste niveau
              som en tydelig vej videre.
            </p>
          </div>
        </div>
        <aside className="strength-hero-tip">
          <b>Kontrol før belastning</b>
          <p>Stig først i niveau, når bevægelsen er stabil gennem hele sættet.</p>
        </aside>
      </section>

      <div className="strength-stats">
        <article><small>FORSLAG</small><strong>2 pas</strong><span>skift mellem A og B</span></article>
        <article><small>NIVEAUER</small><strong>3</strong><span>fra begynder til avanceret</span></article>
        <article><small>VARIGHED</small><strong>20–30 min</strong><span>pr. træningspas</span></article>
        <article><small>FOKUS</small><strong>Kontrol</strong><span>før mere belastning</span></article>
      </div>

      <section className="strength-method">
        <h3>Den enkle metode</h3>
        <div>
          <article><span>1</span><p><b>Vælg niveau</b><small>Start dér, hvor alle gentagelser kan udføres sikkert.</small></p></article>
          <article><span>2</span><p><b>Træn PAS A og B</b><small>Fordel de to pas over ugen med plads til løbetræningen.</small></p></article>
          <article><span>3</span><p><b>Byg videre</b><small>Øg gradvist gentagelser, belastning eller øvelsesniveau.</small></p></article>
        </div>
      </section>

      <nav className="strength-jump-nav" aria-label="Genveje til styrkeguiden">
        <strong>GÅ DIREKTE TIL <span>Træningen</span></strong>
        <a href="#strength-pass-a"><span>01</span>PAS A</a>
        <a href="#strength-pass-b"><span>02</span>PAS B</a>
        <a href="#strength-progression"><span>03</span>Progression</a>
        <a href="#strength-safety"><span>04</span>Sikkerhed</a>
      </nav>

      <section className="strength-level-filter">
        <div>
          <small>FILTRÉR ØVELSERNE</small>
          <h2>Vælg dit niveau</h2>
          <p>Niveauet beskriver øvelsens krav og belastning, ikke hvor hurtig du normalt løber.</p>
        </div>
        <div className="strength-level-buttons" role="group" aria-label="Vælg styrkeniveau">
          {Object.entries(levels).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={selectedLevel === key ? "is-active" : ""}
              aria-pressed={selectedLevel === key}
              onClick={() => setSelectedLevel(key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <div className="strength-current-level" aria-live="polite">
        <Activity size={14} /> Viser: <b>{selectedLabel}</b>
      </div>

      {strengthSessions.map((session) => (
        <SessionSection
          key={session.id}
          session={session}
          selectedLevel={selectedLevel}
        />
      ))}

      <section className="strength-progression" id="strength-progression">
        <div className="strength-section-heading">
          <small>DIN VEJ VIDERE</small>
          <h2>Fra teknik til mere belastning</h2>
          <p>Du behøver ikke gøre alt sværere på én gang. Brug én progression ad gangen.</p>
        </div>

        <div className="strength-progression-flow">
          <article>
            <span>01</span>
            <LevelPill level="beginner" />
            <h3>Lær</h3>
            <p>Find bevægelsen og gennemfør sættene med god kontrol.</p>
          </article>
          <ChevronRight className="strength-flow-arrow" />
          <article>
            <span>02</span>
            <LevelPill level="intermediate" />
            <h3>Belast</h3>
            <p>Tilføj modstand eller vælg den næste variant, når teknikken er stabil.</p>
          </article>
          <ChevronRight className="strength-flow-arrow" />
          <article>
            <span>03</span>
            <LevelPill level="advanced" />
            <h3>Udvikl</h3>
            <p>Arbejd med højere belastning eller mere dynamiske krav uden at miste kvalitet.</p>
          </article>
        </div>

        <div className="strength-ready-box">
          <div><TrendingUp size={18} /></div>
          <section>
            <small>KLAR TIL NÆSTE NIVEAU?</small>
            <h3>Brug kvalitet som adgangsbillet</h3>
            <p>Overvej næste niveau, når du kan gennemføre det nuværende med stabil teknik og tydeligt overskud.</p>
          </section>
          <ul>
            <li><Check size={13} /> Alle planlagte gentagelser er kontrollerede</li>
            <li><Check size={13} /> Teknikken ændrer sig ikke markant sidst i sættet</li>
            <li><Check size={13} /> Du kan øge én ting ad gangen</li>
          </ul>
        </div>
      </section>

      <section className="strength-safety" id="strength-safety">
        <h3><ShieldCheck size={15} /> Sikker og realistisk progression</h3>
        <ul>
          <li>Start med et bevægeudslag og en belastning, du kan kontrollere.</li>
          <li>Øg ikke vægt, sæt, gentagelser og sværhedsgrad på samme tid.</li>
          <li>Placér de hårdeste styrkepas, så de ikke unødigt kompromitterer kvaliteten i dine vigtigste løbepas.</li>
          <li>Stop ved skarp smerte eller vedvarende ubehag og få individuel faglig vurdering ved behov.</li>
        </ul>
      </section>

      <p className="strength-note">
        Dette er generel træningsinspiration og ikke en individuel plan eller behandling.
        Har du en skade, sygdom eller er usikker på teknikken, så tal med en relevant
        fagperson, før du går i gang. Inspiration:{" "}
        <a
          href="https://www.loberlab.dk/artikler/styrketraening-for-lobere"
          target="_blank"
          rel="noreferrer"
        >
          LøberLab: Styrketræning for løbere
        </a>.
      </p>
    </div>
  );
}
