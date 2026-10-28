import { useState } from "react";
import { Activity, Check, Clock3, Timer } from "lucide-react";

const workoutTypes = ["Alle", "Rolig tur", "Tempo", "Intervaller", "Løb/konkurrence"];

const warmupPhases = [
  {
    id: "raise",
    number: "01",
    title: "Kom i gang",
    shortTitle: "Kom i gang",
    description: "Hæv puls og temperatur gradvist. Start roligt, så kroppen får en blød overgang til løb.",
    cue: "Start så roligt, at I let kan tale sammen. Opvarmningen skal bygge jer op, ikke trætte jer.",
    exercises: [
      { name: "March på stedet", types: ["Rolig tur", "Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Starter bevægelsen roligt og får fødder, ankler og arme i gang.", instructions: "Marchér afslappet på stedet. Stå højt, brug armene naturligt, og øg rytmen gradvist.", focus: "Rolig rytme · høj kropsholdning · afslappede skuldre", dosage: "30–60 sek." },
      { name: "Let jog på stedet", types: ["Rolig tur", "Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Hæver puls og temperatur uden at kræve meget plads.", instructions: "Jog let på stedet med korte skridt. Hold fødderne tæt på gulvet og overkroppen afslappet.", focus: "Små skridt · let kontakt · rolig vejrtrækning", dosage: "1–2 min." },
      { name: "Progressivt jog", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Bygger gradvist bro fra let bevægelse til dagens højere intensitet.", instructions: "Start meget let og øg rytmen lidt hvert 20.–30. sekund uden at gøre det til et hårdt arbejde.", focus: "Gradvis stigning · afslappet løb · kontrol", dosage: "1–2 min." },
    ],
  },
  {
    id: "activate",
    number: "02",
    title: "Aktivér",
    shortTitle: "Aktivér",
    description: "Væk læg, balder, lår og kropskontrol med enkle bevægelser før hovedpasset.",
    cue: "Søg kontakt og kontrol. Øvelserne er aktivering, ikke et styrkepas.",
    exercises: [
      { name: "Ankelvip og hælløft", types: ["Rolig tur", "Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Aktiverer fod, ankel og læg før løbets gentagne afsæt.", instructions: "Løft roligt op på tæerne, hold kort i toppen, og sænk kontrolleret igen.", focus: "Aktiv fod · fuld hælhøjde · roligt tempo", dosage: "8–12 gentagelser" },
      { name: "Mini squat", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Aktiverer lår og balder gennem en enkel bevægelse.", instructions: "Sæt hoften let tilbage, bøj knæene og rejs dig igen. Brug kun et behageligt bevægeudslag.", focus: "Hele foden · knæretning · kontrol", dosage: "8–10 gentagelser" },
      { name: "Skiftevis knæløft", types: ["Rolig tur", "Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Aktiverer hoftebøjere og træner balance i løbelignende positioner.", instructions: "Stå højt og løft skiftevis knæet til en behagelig højde. Hold kort balancen på standbenet.", focus: "Stabil hofte · tå op · høj krop", dosage: "8–10 pr. side" },
      { name: "Reverse lunge", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Aktiverer lår og balder samtidig med, at hoften bevæges dynamisk.", instructions: "Træd roligt bagud, sænk kroppen kontrolleret, og pres tilbage gennem forreste fod.", focus: "Stabilt knæ · oprejst krop · rolig bevægelse", dosage: "5–6 pr. side" },
      { name: "Glute bridge", types: ["Intervaller", "Løb/konkurrence"], purpose: "Aktiverer balderne før et pas med større krav til kraftudvikling.", instructions: "Lig på ryggen med bøjede knæ. Løft hoften, spænd balderne kort, og sænk roligt.", focus: "Balder · stabilt bækken · roligt tempo", dosage: "8–12 gentagelser" },
    ],
  },
  {
    id: "mobilise",
    number: "03",
    title: "Mobilisér",
    shortTitle: "Mobilisér",
    description: "Bevæg ankel, hofte og ben dynamisk gennem de bevægelser, du skal bruge under løbet.",
    cue: "Bevæg dig dynamisk, men kontrolleret. Pres ikke yderstillingerne.",
    exercises: [
      { name: "Bensving frem og tilbage", types: ["Rolig tur", "Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Gør hoften klar til benets frem- og tilbageføring.", instructions: "Stå med let støtte. Sving ét ben roligt frem og tilbage uden at rotere overkroppen.", focus: "Fri hofte · stabil overkrop · gradvist større bevægelse", dosage: "6–10 pr. side" },
      { name: "Bensving sideværts", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Mobiliserer hoften i sideværts retning og udfordrer standbenets kontrol.", instructions: "Stå med støtte og før benet kontrolleret fra side til side foran kroppen.", focus: "Stabil hofte · blød bevægelse · balance", dosage: "6–10 pr. side" },
      { name: "Åbn og luk hoften", types: ["Rolig tur", "Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Bevæger hoften dynamisk gennem rotation og fleksion.", instructions: "Løft knæet, åbn benet roligt ud til siden, før det tilbage og skift ben.", focus: "Kontrol · stabilt bækken · rolig rytme", dosage: "6–8 pr. side" },
      { name: "Hælløft mod sædet", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Forbereder knæbevægelse og baglår i en løbelignende rytme.", instructions: "Før skiftevis hælen op mod sædet. Hold hofterne stille og øg rytmen gradvist.", focus: "Hæl op · knæ under kroppen · rytme", dosage: "8–10 pr. side" },
      { name: "Walking lunge", types: ["Intervaller", "Løb/konkurrence"], purpose: "Kombinerer dynamisk hoftebevægelse, benstyrke og balance.", instructions: "Tag kontrollerede skridt frem i lunge. Rejs dig helt mellem hvert skridt og hold knæet stabilt.", focus: "Hofte · balance · kontrolleret knæ", dosage: "5–6 pr. side" },
      { name: "Lunge med rotation", types: ["Intervaller", "Løb/konkurrence"], purpose: "Kombinerer dynamisk hoftebevægelse med kontrolleret rotation i overkroppen.", instructions: "Gå ned i en rolig lunge og drej brystkassen let mod det forreste ben. Vend tilbage med kontrol.", focus: "Hofte · brystkasse · stabilt bækken", dosage: "4–6 pr. side" },
    ],
  },
  {
    id: "potentiate",
    number: "04",
    title: "Gør klar til fart",
    shortTitle: "Klar til fart",
    description: "Afslut med korte, hurtigere bevægelser, når dagens hovedpas kræver højere fart.",
    cue: "Stop mens bevægelsen stadig er let og skarp. Det er forberedelse, ikke dagens første interval.",
    exercises: [
      { name: "Hurtige fødder", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Øger skridtfrekvens og neuromuskulær parathed uden stor belastning.", instructions: "Tag meget korte, hurtige skridt på stedet. Hold kroppen høj og skuldrene afslappede.", focus: "Hurtige fødder · korte kontakter · afslappet krop", dosage: "2 × 10–15 sek." },
      { name: "Pogo hops", types: ["Intervaller", "Løb/konkurrence"], purpose: "Aktiverer ankel og læg med korte, fjedrende kontakter.", instructions: "Lav små hop på begge ben. Hold knæbøjningen lille og land let.", focus: "Aktiv ankel · let landing · ens rytme", dosage: "2 × 10–15 sek." },
      { name: "A-March", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Forbereder knæløft, fodplacering og koordination før hurtigere løb.", instructions: "Marchér frem med tydeligt knæløft, aktiv fod og naturlig modsatrettet armføring.", focus: "Knæ frem · tå op · fod ned under kroppen", dosage: "2 × 15–20 m" },
      { name: "A-Skip", types: ["Intervaller", "Løb/konkurrence"], purpose: "Samler rytme, knæløft og fodisætning i en mere dynamisk løbeøvelse.", instructions: "Lav rytmiske skips fremad. Hold bevægelsen let, og sæt foden ned tæt under kroppen.", focus: "Rytme · aktiv fod · afslappede skuldre", dosage: "2 × 15–20 m" },
      { name: "Stigningsløb", types: ["Tempo", "Intervaller", "Løb/konkurrence"], purpose: "Bygger bro fra opvarmning til den højere fart i hovedpasset.", instructions: "Start roligt og øg farten gradvist. Slut hurtigt, men afslappet, og sænk derefter farten kontrolleret.", focus: "Gradvis acceleration · god teknik · afslappet fart", dosage: "2–4 × 15–20 sek." },
      { name: "Kort race-pace segment", types: ["Løb/konkurrence"], purpose: "Lader kroppen mærke den planlagte konkurrenceintensitet kort før start.", instructions: "Løb et kort kontrolleret segment omkring den planlagte indsats. Stop med tydeligt overskud.", focus: "Kendt rytme · kontrol · ikke udmattende", dosage: "1–3 korte segmenter" },
    ],
  },
];

const typeClass = (type) =>
  type === "Rolig tur" ? "beginner" : type === "Tempo" ? "intermediate" : "advanced";

export default function RunningWarmupGuide() {
  const [activeType, setActiveType] = useState("Alle");

  const visiblePhases = warmupPhases
    .map((phase) => ({
      ...phase,
      exercises:
        activeType === "Alle"
          ? phase.exercises
          : phase.exercises.filter((exercise) => exercise.types.includes(activeType)),
    }))
    .filter((phase) => phase.exercises.length > 0);

  const scrollToPhase = (id) => {
    document.getElementById(`warmup-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="running-technique-guide warmup-guide">
      <div className="tools-intro">
        <section>
          <small>GØR KROPPEN KLAR TRIN FOR TRIN</small>
          <h2>Opvarmning tilpasset dagens løbetræning</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Vælg dagens træning og få relevante opvarmningsøvelser fra rolig opstart
            til dynamisk bevægelse og, når det er relevant, højere fart.
          </p>
        </section>
      </div>

      <section className="technique-hero technique-school-hero">
        <div>
          <div className="technique-title">
            <span><Activity size={18} /></span>
            <div>
              <small>HLM LØBEUNIVERSITET</small>
              <h2>Opvarmningsskolen</h2>
            </div>
          </div>
          <p>
            Følg fire enkle faser: kom i gang, aktivér, mobilisér og gør klar til fart.
            Du behøver ikke bruge alle faser før alle løbeture.
          </p>
        </div>
        <div className="technique-hero-rule">
          <strong>Gradvis før specifik</strong>
          <span>Start let, og nærm dig først derefter den intensitet, du skal løbe med.</span>
        </div>
      </section>

      <div className="technique-stats">
        <div><small>OPBYGNING</small><strong>4</strong><span>opvarmningsfaser</span></div>
        <div><small>TRÆNINGSTYPER</small><strong>4</strong><span>fra rolig tur til konkurrence</span></div>
        <div><small>KORT VERSION</small><strong>5</strong><span>minutter kan være nok før let løb</span></div>
        <div><small>FARTPAS</small><strong>5–10</strong><span>min dynamisk forberedelse</span></div>
      </div>

      <section className="technique-warmup technique-method">
        <h2>Den enkle metode</h2>
        <div>
          <article><b><span>1</span> Vælg dagens pas</b><p>Rolig løb kræver mindre end intervaller og konkurrence.</p></article>
          <article><b><span>2</span> Byg gradvist op</b><p>Gå fra let bevægelse til mere løbespecifik aktivitet.</p></article>
          <article><b><span>3</span> Slut skarpt, ikke træt</b><p>De hurtigste elementer skal gøre dig klar til hovedpasset.</p></article>
        </div>
      </section>

      <nav className="technique-navigation" aria-label="Navigation i opvarmningsskolen">
        <div className="technique-navigation-label">
          <small>GÅ DIREKTE TIL</small>
          <strong>Opvarmningsfase</strong>
        </div>
        <div className="technique-phase-links">
          {warmupPhases.map((phase) => (
            <button type="button" key={phase.id} onClick={() => scrollToPhase(phase.id)}>
              <span>{phase.number}</span>{phase.shortTitle}
            </button>
          ))}
        </div>
      </nav>

      <section className="technique-level-filter" aria-labelledby="warmup-type-heading">
        <div>
          <small>TILPAS OPVARMNINGEN</small>
          <h2 id="warmup-type-heading">Hvad skal du løbe?</h2>
          <p>Vælg hovedpasset, så siden viser de opvarmningsøvelser, der passer bedst til formålet.</p>
        </div>
        <div className="technique-level-buttons" role="group" aria-label="Vælg dagens løbetræning">
          {workoutTypes.map((type) => (
            <button
              type="button"
              key={type}
              aria-pressed={activeType === type}
              className={`${activeType === type ? "active" : ""} ${type !== "Alle" ? typeClass(type) : "all"}`}
              onClick={() => setActiveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <div className="technique-phase-list" aria-live="polite">
        {visiblePhases.map((phase) => (
          <section className="technique-phase" id={`warmup-${phase.id}`} key={phase.id}>
            <header className="technique-phase-heading">
              <span>{phase.number}</span>
              <div>
                <small>FASE I OPVARMNINGEN</small>
                <h2>{phase.title}</h2>
                <p>{phase.description}</p>
              </div>
              <aside><strong>Instruktørens cue</strong><p>{phase.cue}</p></aside>
            </header>

            <div className="technique-drill-grid">
              {phase.exercises.map((exercise) => (
                <article className="technique-drill-card" key={`${phase.id}-${exercise.name}`}>
                  <div className="technique-drill-heading">
                    <div><small>{phase.shortTitle.toUpperCase()}</small><h3>{exercise.name}</h3></div>
                    {activeType !== "Alle" && <span className={`technique-level ${typeClass(activeType)}`}>{activeType}</span>}
                  </div>

                  <div className="technique-purpose"><strong>Formål</strong><span>{exercise.purpose}</span></div>
                  <div className="technique-drill-copy"><h4>Sådan gør du</h4><p>{exercise.instructions}</p></div>
                  <dl className="technique-drill-details">
                    <div><dt>Fokus</dt><dd>{exercise.focus}</dd></div>
                    <div><dt>Passer til</dt><dd>{exercise.types.join(" · ")}</dd></div>
                  </dl>
                  <div className="technique-dosage"><Timer size={14} /><span>{exercise.dosage}</span></div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="technique-session">
        <div>
          <small>HURTIGT VALG</small>
          <h2>Tilpas længden til dagens pas</h2>
          <p>Jo højere fart hovedpasset kræver, jo mere relevant bliver den sidste, hurtigere del af opvarmningen.</p>
        </div>
        <ol>
          {[
            ["01", "Rolig tur", "Gradvis opstart kan være nok"],
            ["02", "Tempo", "Tilføj dynamiske bevægelser og stigninger"],
            ["03", "Intervaller", "Brug alle fire faser"],
            ["04", "Løb/konkurrence", "Slut med korte specifikke fartindslag"],
          ].map(([number, name, note]) => (
            <li key={number}><span>{number}</span><div><strong>{name}</strong><small>{note}</small></div></li>
          ))}
        </ol>
      </section>

      <section className="technique-session">
        <div>
          <small>KLAR TIL HOVEDPASSET?</small>
          <h2><Check size={18} /> Stop mens du føler dig klar</h2>
          <p>Opvarmningen skal gøre overgangen til dagens træning mere gradvis. Den skal ikke være et ekstra hårdt træningspas.</p>
        </div>
        <ol>
          {[
            ["01", "Kroppen er i gang", "Puls og temperatur er steget"],
            ["02", "Bevægelserne føles frie", "Ingen tvungne yderstillinger"],
            ["03", "Rytmen er skarp", "Hvis dagens pas kræver fart"],
            ["04", "Du er ikke træt", "Gem arbejdet til hovedpasset"],
          ].map(([number, name, note]) => (
            <li key={number}><span>{number}</span><div><strong>{name}</strong><small>{note}</small></div></li>
          ))}
        </ol>
      </section>

      <p className="technique-disclaimer">
        <strong>Bemærk:</strong> Opvarmning er et værktøj til at forberede kroppen på løbet og højere intensitet,
        ikke en garanti mod skader. Stop eller tilpas ved smerter, svimmelhed eller andet ubehag.
      </p>
    </div>
  );
}
