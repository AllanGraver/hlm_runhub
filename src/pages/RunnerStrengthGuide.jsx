import { useState } from "react";
import { Dumbbell, ShieldCheck, Timer } from "lucide-react";

const strengthLevels = ["Alle", "Begynder", "Øvet", "Avanceret"];

const strengthSessions = [
  {
    id: "pas-a",
    number: "A",
    title: "Styrke og stabilitet",
    shortTitle: "PAS A",
    description:
      "Et grundpas for ben, hofte, læg og kropskontrol. Vælg én variant fra hvert bevægelsesmønster.",
    cue: "Arbejd roligt og kontrolleret. Øg først belastningen, når bevægelsen er stabil.",
    exercises: [
      {
        movement: "Squat",
        name: "Squat til stol",
        level: "Begynder",
        purpose: "Opbygger grundstyrke og indlærer en stabil squatbevægelse.",
        instructions:
          "Sæt dig kontrolleret mod en stol, og rejs dig ved at presse gennem hele foden.",
        focus: "Kontrol · knæretning · hele foden",
        progression: "Næste trin: Goblet squat",
        dosage: "2 × 8–10 · kropsvægt",
      },
      {
        movement: "Squat",
        name: "Goblet squat",
        level: "Øvet",
        purpose: "Øger belastningen på lår og hofte uden at gøre bevægelsen unødigt kompleks.",
        instructions:
          "Hold en håndvægt eller kettlebell foran kroppen. Sænk dig kontrolleret, og pres op gennem hele foden.",
        focus: "Stabilitet · dybde · progressiv belastning",
        progression: "Næste trin: Tung squat",
        dosage: "3 × 6–8 · moderat belastning",
      },
      {
        movement: "Squat",
        name: "Tung squat",
        level: "Avanceret",
        purpose: "Udvikler høj styrke i lår og hofte med en velkendt squatvariant.",
        instructions:
          "Brug en squatvariant, du mestrer, og arbejd tungt uden at miste bevægelseskvalitet.",
        focus: "Høj belastning · stabil position · kontrol",
        progression: "Øg belastningen gradvist, når alle gentagelser er stabile.",
        dosage: "3–4 × 4–6 · tung belastning",
      },
      {
        movement: "Hofte",
        name: "Glute bridge",
        level: "Begynder",
        purpose: "Styrker balder og indlærer kontrolleret hofteekstension.",
        instructions:
          "Lig på ryggen med bøjede knæ. Løft hoften, spænd balderne, og sænk roligt.",
        focus: "Balder · bækkenkontrol · roligt tempo",
        progression: "Næste trin: Etbens glute bridge",
        dosage: "2 × 10–12 · kropsvægt",
      },
      {
        movement: "Hofte",
        name: "Etbens glute bridge",
        level: "Øvet",
        purpose: "Udvikler ensidig hoftestyrke og kontrol omkring bækkenet.",
        instructions:
          "Hold bækkenet stabilt, løft hoften med ét ben, og undgå at rotere i kroppen.",
        focus: "Ensidig styrke · hoftekontrol · stabilt bækken",
        progression: "Næste trin: Belastet hip thrust",
        dosage: "3 × 8–10 pr. side",
      },
      {
        movement: "Hofte",
        name: "Belastet hip thrust",
        level: "Avanceret",
        purpose: "Udvikler høj kraft i balder og bagkæde.",
        instructions:
          "Arbejd gennem et kontrolleret bevægeudslag, og afslut løftet med balderne frem for lænden.",
        focus: "Høj kraft · bagkæde · hofteekstension",
        progression: "Øg belastningen gradvist uden at forkorte bevægelsen.",
        dosage: "3–4 × 5–8 · tung belastning",
      },
      {
        movement: "Læg",
        name: "Hælløft med begge ben",
        level: "Begynder",
        purpose: "Opbygger grundstyrke omkring ankel og læg.",
        instructions:
          "Stå stabilt, løft hælene roligt, og sænk dem langsomt tilbage.",
        focus: "Fuldt bevægeudslag · roligt tempo · balance",
        progression: "Næste trin: Etbens hælløft",
        dosage: "2 × 10–12 · kropsvægt",
      },
      {
        movement: "Læg",
        name: "Etbens hælløft",
        level: "Øvet",
        purpose: "Udvikler ensidig lægstyrke og stabilitet omkring anklen.",
        instructions:
          "Stå på ét ben med let støtte ved behov. Løft højt, og sænk langsomt.",
        focus: "Ensidig styrke · stabil ankel · fuld højde",
        progression: "Næste trin: Belastet etbens hælløft",
        dosage: "3 × 8–12 pr. side",
      },
      {
        movement: "Læg",
        name: "Belastet etbens hælløft",
        level: "Avanceret",
        purpose: "Øger læggens kapacitet til at håndtere høj ensidig belastning.",
        instructions:
          "Tilføj vægt, men bevar samme løftehøjde og kontrol gennem alle gentagelser.",
        focus: "Høj belastning · ankelstivhed · kontrol",
        progression: "Øg vægten i små trin, når bevægeudslaget er stabilt.",
        dosage: "3–4 × 6–8 pr. side",
      },
      {
        movement: "Kropskontrol",
        name: "Bird dog",
        level: "Begynder",
        purpose: "Træner kontrol omkring bækken og kropsstamme under bevægelse.",
        instructions:
          "Stå på alle fire. Stræk modsatte arm og ben uden at rotere i kroppen.",
        focus: "Stabilitet · roligt tempo · bækkenkontrol",
        progression: "Næste trin: Bird dog med pause",
        dosage: "2 × 6–8 pr. side",
      },
      {
        movement: "Kropskontrol",
        name: "Bird dog med pause",
        level: "Øvet",
        purpose: "Øger kravet til kontrol ved at forlænge tiden i yderpositionen.",
        instructions:
          "Hold yderpositionen 2–3 sekunder, og bevar bækken og ryg helt rolige.",
        focus: "Tid under spænding · balance · kontrol",
        progression: "Næste trin: Anti-rotation med modstand",
        dosage: "3 × 6–8 pr. side",
      },
      {
        movement: "Kropskontrol",
        name: "Anti-rotation med modstand",
        level: "Avanceret",
        purpose: "Styrker kropsstammens evne til at modstå rotation og overføre kraft.",
        instructions:
          "Modstå trækket fra en elastik eller kabel, og hold bækken og brystkasse stabile.",
        focus: "Kropsstamme · kraftoverførsel · stabilitet",
        progression: "Øg modstanden uden at kroppen drejer.",
        dosage: "3 × 6–10 pr. side",
      },
    ],
  },
  {
    id: "pas-b",
    number: "B",
    title: "Ensidig styrke og balance",
    shortTitle: "PAS B",
    description:
      "Et supplerende pas med ensidig benstyrke, bagkæde, ankel og dynamisk kontrol.",
    cue: "Hold hoften stabil, og lad kvaliteten bestemme bevægeudslag og belastning.",
    exercises: [
      {
        movement: "Split squat",
        name: "Split squat med støtte",
        level: "Begynder",
        purpose: "Opbygger ensidig benstyrke med hjælp til balancen.",
        instructions:
          "Stå forskudt, hold let ved støtte, og bøj begge knæ i en kontrolleret bevægelse.",
        focus: "Balance · knækontrol · roligt tempo",
        progression: "Næste trin: Split squat uden støtte",
        dosage: "2 × 6–8 pr. side",
      },
      {
        movement: "Split squat",
        name: "Split squat",
        level: "Øvet",
        purpose: "Udvikler ensidig styrke og stabilitet uden ekstern støtte.",
        instructions:
          "Hold overkroppen stabil, mens begge knæ bøjes, og pres op gennem forreste fod.",
        focus: "Ensidig styrke · stabil hofte · knæretning",
        progression: "Næste trin: Bulgarian split squat",
        dosage: "3 × 6–8 pr. side",
      },
      {
        movement: "Split squat",
        name: "Bulgarian split squat",
        level: "Avanceret",
        purpose: "Skaber høj ensidig belastning på lår og hofte.",
        instructions:
          "Placér bageste fod hævet, og arbejd kontrolleret gennem forreste ben.",
        focus: "Høj ensidig belastning · stabilitet · kontrol",
        progression: "Øg belastningen gradvist, før du øger bevægeudslaget.",
        dosage: "3 × 5–8 pr. side",
      },
      {
        movement: "Hoftehængsel",
        name: "Hoftehængsel",
        level: "Begynder",
        purpose: "Indlærer bevægelsen, der belaster baglår og balder med stabil ryg.",
        instructions:
          "Stå med bløde knæ. Skub hoften bagud med neutral ryg, og kom op ved at spænde balderne.",
        focus: "Hofte tilbage · stabil ryg · balance",
        progression: "Næste trin: Romanian deadlift",
        dosage: "2 × 8–10 · uden vægt",
      },
      {
        movement: "Hoftehængsel",
        name: "Romanian deadlift",
        level: "Øvet",
        purpose: "Styrker baglår, balder og hofteekstension med ekstern belastning.",
        instructions:
          "Hold vægten tæt på kroppen, og sænk, indtil du mærker tydelig spænding i baglårene.",
        focus: "Bagkæde · hoftekontrol · vægt tæt på kroppen",
        progression: "Næste trin: Tung Romanian deadlift",
        dosage: "3 × 6–8 · moderat belastning",
      },
      {
        movement: "Hoftehængsel",
        name: "Tung Romanian deadlift",
        level: "Avanceret",
        purpose: "Udvikler høj styrke i bagkæden med et kontrolleret hoftehængsel.",
        instructions:
          "Arbejd tungt med et bevægeudslag, hvor ryg og bækken kan holdes stabile.",
        focus: "Høj styrke · bagkæde · stabil position",
        progression: "Øg belastningen gradvist, mens tempo og position bevares.",
        dosage: "3–4 × 4–6 · tung belastning",
      },
      {
        movement: "Balance",
        name: "Etbensbalance",
        level: "Begynder",
        purpose: "Opbygger kontrol omkring fod, ankel, knæ og hofte.",
        instructions:
          "Stå højt på ét ben, og hold balancen med afslappede skuldre.",
        focus: "Fod · ankel · hoftekontrol",
        progression: "Næste trin: Dynamisk etbensbalance",
        dosage: "2 × 20–30 sek. pr. side",
      },
      {
        movement: "Balance",
        name: "Dynamisk etbensbalance",
        level: "Øvet",
        purpose: "Udfordrer balancen, mens den frie del af kroppen bevæger sig.",
        instructions:
          "Stå på ét ben, og bevæg det frie ben eller overkroppen uden at miste kontrollen.",
        focus: "Dynamisk balance · stabil hofte · rolig fod",
        progression: "Næste trin: Pogo hops",
        dosage: "2–3 × 6–8 pr. side",
      },
      {
        movement: "Spændstighed",
        name: "Pogo hops",
        level: "Avanceret",
        purpose: "Træner reaktiv ankelstyrke og korte, fjedrende kontakter med underlaget.",
        instructions:
          "Lav små, lette hop med kort kontakt mod underlaget og en stabil kropsposition.",
        focus: "Spændstighed · aktiv ankel · let landing",
        progression: "Øg først varigheden, når landingerne forbliver lette.",
        dosage: "2–3 × 10–20 sek.",
      },
    ],
  },
];

const levelClass = (level) =>
  level === "Begynder"
    ? "beginner"
    : level === "Øvet"
      ? "intermediate"
      : "advanced";

export default function RunnerStrengthGuide() {
  const [activeLevel, setActiveLevel] = useState("Begynder");

  const visibleSessions = strengthSessions
    .map((session) => ({
      ...session,
      exercises:
        activeLevel === "Alle"
          ? session.exercises
          : session.exercises.filter((exercise) => exercise.level === activeLevel),
    }))
    .filter((session) => session.exercises.length > 0);

  const scrollToSession = (sessionId) => {
    document.getElementById(`strength-${sessionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="running-technique-guide strength-guide">
      <div className="tools-intro">
        <section>
          <small>BYG STYRKE TRIN FOR TRIN</small>
          <h2>Styrketræning opbygget efter bevægelse og niveau</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Vælg dit niveau, og se hvordan de samme bevægelser kan udvikles fra
            en enkel grundøvelse til mere belastende styrketræning.
          </p>
        </section>
      </div>

      <section className="technique-hero technique-school-hero">
        <div>
          <div className="technique-title">
            <span><Dumbbell size={18} /></span>
            <div>
              <small>HLM LØBEUNIVERSITET</small>
              <h2>Styrkeskolen for løbere</h2>
            </div>
          </div>
          <p>
            Byg styrke i ben, hofte, læg og kropsstamme. Du behøver ikke træne
            alle varianter. Vælg én øvelse fra hvert bevægelsesmønster på dit niveau.
          </p>
        </div>
        <div className="technique-hero-rule">
          <strong>Kontrol før belastning</strong>
          <span>Stig først i niveau, når bevægelsen er stabil gennem hele sættet.</span>
        </div>
      </section>

      <div className="technique-stats">
        <div><small>OPBYGNING</small><strong>2</strong><span>styrkepas</span></div>
        <div><small>NIVEAUER</small><strong>3</strong><span>fra begynder til avanceret</span></div>
        <div><small>VARIGHED</small><strong>20–30</strong><span>minutter pr. pas</span></div>
        <div><small>DOSERING</small><strong>4</strong><span>øvelser pr. pas</span></div>
      </div>

      <section className="technique-warmup technique-method">
        <h2>Den enkle metode</h2>
        <div>
          <article>
            <b><span>1</span> Vælg niveau</b>
            <p>Start med den letteste variant, du kan udføre sikkert.</p>
          </article>
          <article>
            <b><span>2</span> Skift mellem A og B</b>
            <p>Fordel passene over ugen med plads til løbetræningen.</p>
          </article>
          <article>
            <b><span>3</span> Øg én ting</b>
            <p>Øg gentagelser, belastning eller sværhedsgrad, ikke alt samtidig.</p>
          </article>
        </div>
      </section>

      <nav className="technique-navigation" aria-label="Navigation i styrkeskolen">
        <div className="technique-navigation-label">
          <small>GÅ DIREKTE TIL</small>
          <strong>Styrkepas</strong>
        </div>
        <div className="technique-phase-links">
          {strengthSessions.map((session, index) => (
            <button
              type="button"
              key={session.id}
              onClick={() => scrollToSession(session.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {session.shortTitle}
            </button>
          ))}
          <button type="button" onClick={() => scrollToSession("progression")}>
            <span>03</span>
            Progression
          </button>
          <button type="button" onClick={() => scrollToSession("safety")}>
            <span>04</span>
            Sikkerhed
          </button>
        </div>
      </nav>

      <section className="technique-level-filter" aria-labelledby="strength-level-heading">
        <div>
          <small>FILTRÉR ØVELSERNE</small>
          <h2 id="strength-level-heading">Vælg dit niveau</h2>
          <p>
            Niveauet beskriver øvelsens krav og belastning, ikke hvor hurtigt du normalt løber.
          </p>
        </div>
        <div className="technique-level-buttons" role="group" aria-label="Vælg styrkeniveau">
          {strengthLevels.map((level) => (
            <button
              type="button"
              key={level}
              aria-pressed={activeLevel === level}
              className={`${activeLevel === level ? "active" : ""} ${level !== "Alle" ? levelClass(level) : "all"}`}
              onClick={() => setActiveLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      <div className="technique-phase-list" aria-live="polite">
        {visibleSessions.map((session) => (
          <section
            className="technique-phase"
            id={`strength-${session.id}`}
            key={session.id}
          >
            <header className="technique-phase-heading">
              <span>{session.number}</span>
              <div>
                <small>STYRKEPAS FOR LØBERE</small>
                <h2>{session.title}</h2>
                <p>{session.description}</p>
              </div>
              <aside>
                <strong>Instruktørens cue</strong>
                <p>{session.cue}</p>
              </aside>
            </header>

            <div className="technique-drill-grid">
              {session.exercises.map((exercise) => (
                <article
                  className="technique-drill-card"
                  key={`${session.id}-${exercise.movement}-${exercise.name}`}
                >
                  <div className="technique-drill-heading">
                    <div>
                      <small>{exercise.movement.toUpperCase()}</small>
                      <h3>{exercise.name}</h3>
                    </div>
                    <span className={`technique-level ${levelClass(exercise.level)}`}>
                      {exercise.level}
                    </span>
                  </div>

                  <div className="technique-purpose">
                    <strong>Formål</strong>
                    <span>{exercise.purpose}</span>
                  </div>

                  <div className="technique-drill-copy">
                    <h4>Sådan gør du</h4>
                    <p>{exercise.instructions}</p>
                  </div>

                  <dl className="technique-drill-details">
                    <div>
                      <dt>Fokus</dt>
                      <dd>{exercise.focus}</dd>
                    </div>
                    <div>
                      <dt>{exercise.level === "Avanceret" ? "Videre progression" : "Næste niveau"}</dt>
                      <dd>{exercise.progression}</dd>
                    </div>
                  </dl>

                  <div className="technique-dosage">
                    <Timer size={14} />
                    <span>{exercise.dosage}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="technique-session" id="strength-progression">
        <div>
          <small>DIN VEJ VIDERE</small>
          <h2>Sådan stiger du niveau</h2>
          <p>
            Gå først videre, når du gennemfører alle planlagte gentagelser med
            stabil teknik og lidt overskud. Ændr kun én belastningsfaktor ad gangen.
          </p>
        </div>
        <ol>
          {[
            ["01", "Lær bevægelsen", "Begynder"],
            ["02", "Ram toppen af intervallet", "Stabile gentagelser"],
            ["03", "Tilføj lidt belastning", "Samme gode teknik"],
            ["04", "Vælg næste variant", "Øvet"],
            ["05", "Byg højere styrke", "Avanceret"],
          ].map(([number, name, phase]) => (
            <li key={number}>
              <span>{number}</span>
              <div><strong>{name}</strong><small>{phase}</small></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="technique-session" id="strength-safety">
        <div>
          <small>SIKKER OG REALISTISK PROGRESSION</small>
          <h2><ShieldCheck size={18} /> Bevar kvaliteten</h2>
          <p>
            Placér styrketræningen, så den ikke unødigt reducerer kvaliteten i
            ugens vigtigste løbepas. Stop ved skarp smerte eller vedvarende ubehag.
          </p>
        </div>
        <ol>
          {[
            ["01", "Kontrolleret bevægelse", "Teknik før vægt"],
            ["02", "Én ændring ad gangen", "Vægt, sæt eller reps"],
            ["03", "Plads til restitution", "Mellem hårde pas"],
            ["04", "Reagér på smerte", "Søg faglig vurdering"],
          ].map(([number, name, phase]) => (
            <li key={number}>
              <span>{number}</span>
              <div><strong>{name}</strong><small>{phase}</small></div>
            </li>
          ))}
        </ol>
      </section>

      <p className="technique-disclaimer">
        <strong>Bemærk:</strong> Dette er generel træningsinspiration og ikke en
        individuel plan eller behandling. Har du en skade, sygdom eller er
        usikker på teknikken, så tal med en relevant fagperson, før du går i gang.
      </p>
    </div>
  );
}
