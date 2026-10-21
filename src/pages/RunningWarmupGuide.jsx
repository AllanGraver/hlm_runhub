import { Activity, ArrowUpRight, Check, Clock3, Users } from "lucide-react";
import "../styles/running-warmup.css";

const warmupStages = [
  {
    number: "01",
    label: "Kom i gang",
    duration: "2–3 min",
    title: "March og let jog på stedet",
    description:
      "Stå med god plads omkring jer. Start med rolig march, og lad gruppen gradvist gå over i et let jog på stedet.",
    cue: "Lederens cue: “Bliv på jeres plads, og start så roligt, at I let kan snakke sammen.”",
    color: "easy",
  },
  {
    number: "02",
    label: "Gør kroppen klar",
    duration: "4–5 min",
    title: "Dynamiske bevægelser",
    description:
      "Bliv stående på samme plads under alle øvelser. Lav 6–10 rolige gentagelser af hver bevægelse, og skift side hvor det passer.",
    cue: "Hold bevægelserne kontrollerede og lette — ingen skal presse yderstillingen eller flytte sig rundt.",
    color: "dynamic",
  },
  {
    number: "03",
    label: "Byg farten op",
    duration: "1–2 min",
    title: "Hurtige fødder på stedet",
    description:
      "Lav 2–3 korte runder med 10–15 sekunders lette, hurtige skridt på stedet. Hold en rolig pause mellem hver runde.",
    cue: "Det er ikke en sprint. Bliv på din plads, og stop mens bevægelsen stadig føles let og kontrolleret.",
    color: "strides",
  },
];

const dynamicMoves = [
  {
    name: "Ankelvip og hælløft",
    detail: "10 rolige gentagelser: løft op på tæerne, og sænk kontrolleret igen.",
  },
  {
    name: "Bensving",
    detail: "Stå med støtte ved behov. Sving ét ben kontrolleret fremad og bagud 6–8 gange uden at flytte dig.",
  },
  {
    name: "Skiftevis knæløft",
    detail: "Stå højt, og løft skiftevis knæene roligt til en behagelig højde. Lav 8–10 gentagelser pr. side.",
  },
  {
    name: "Hælløft mod sædet",
    detail: "Stå oprejst, og før skiftevis hælen roligt op mod sædet. Hold hofterne stille, og lav 8–10 pr. side.",
  },
  {
    name: "Åbn og luk hoften",
    detail: "Stå på ét ben med støtte ved behov. Løft det andet knæ, åbn benet ud til siden, og før det roligt ind igen. 6–8 pr. side.",
  },
];

export default function RunningWarmupGuide() {
  return (
    <div className="running-warmup">
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Hvordan gør vi os klar til løbeturen sammen?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Brug et kort, fælles program, der går fra rolig bevægelse til
            løbespecifikke øvelser — og til sidst en gradvis åbning af farten.
          </p>
        </section>
      </div>

      <section className="warmup-hero">
        <div className="warmup-hero-icon"><Users size={20} /></div>
        <div>
          <small>HLM LØBEUNIVERSITET · FÆLLES OPVARMNING</small>
          <h2>Opvarmning inden løb</h2>
          <p>
            Her er et enkelt eksempel, du kan guide hele holdet igennem inden
            afgang. Tilpas længde og tempo til dagens træning og gruppen — det
            skal føles gradvist, ikke som en ekstra hård træning.
          </p>
        </div>
        <span className="warmup-total"><Clock3 size={14} /> 7–10 MIN</span>
      </section>

      <div className="warmup-principles">
        <article><strong>Bliv på stedet</strong><span>Hele programmet kan laves samlet</span></article>
        <article><strong>Bevægelse frem for pres</strong><span>Dynamisk og kontrolleret</span></article>
        <article><strong>Til dagens pas</strong><span>Mere opvarmning før fart</span></article>
      </div>

      <section className="warmup-session">
        <div className="warmup-section-heading">
          <div>
            <small>KLAR TIL AT GUIDE HOLDET</small>
            <h2>Et fælles program på 7–10 minutter</h2>
          </div>
          <span>FØLG TRINNENE</span>
        </div>

        <div className="warmup-stages">
          {warmupStages.map((stage) => (
            <article className={`warmup-stage ${stage.color}`} key={stage.number}>
              <div className="warmup-stage-top">
                <span className="warmup-stage-number">{stage.number}</span>
                <span className="warmup-duration"><Clock3 size={12} /> {stage.duration}</span>
              </div>
              <small>{stage.label}</small>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <div className="warmup-coach-cue">{stage.cue}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="warmup-moves">
        <div className="warmup-section-heading">
          <div>
            <small>TRIN 2 · DYNAMISK DEL</small>
            <h2>Øvelser I kan lave samlet</h2>
          </div>
          <span>ALT PÅ STEDET</span>
        </div>
        <div className="warmup-move-list">
          {dynamicMoves.map((move, index) => (
            <article key={move.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{move.name}</strong><p>{move.detail}</p></div>
              <Check size={15} />
            </article>
          ))}
        </div>
        <p className="warmup-group-tip">
          <strong>Sådan organiserer du det:</strong> Stil gruppen med god plads
          mellem hver løber, så alle kan bevæge ben og arme frit. Bliv stående
          samme sted gennem hele opvarmningen, og vis hver øvelse kort, inden
          holdet starter.
        </p>
      </section>

      <section className="warmup-adjustments">
        <article>
          <h3><Activity size={15} /> Før en rolig tur</h3>
          <p>
            En rolig march og et let jog på stedet kan være nok. Hold
            bevægelserne afslappede, og spring de hurtige fødder over, hvis de
            ikke passer til dagens rolige tur.
          </p>
        </article>
        <article>
          <h3><ArrowUpRight size={15} /> Før intervaller eller tempo</h3>
          <p>
            Brug hele programmet, og lav eventuelt en ekstra kort runde med
            hurtige fødder på stedet. Begynd først hovedpasset, når gruppen
            føles klar — ikke forpustet.
          </p>
        </article>
      </section>

      <p className="warmup-note">
        <strong>Husk:</strong> Opvarmning kan gøre overgangen til løb og højere
        fart mere gradvis, men er ikke en garanti mod skader. Stop eller tilpas
        øvelsen, hvis nogen får smerter, svimmelhed eller ubehag. Inspiration:
        {" "}
        <a
          href="https://www.loberlab.dk/artikler/opvarmning-inden-lob"
          target="_blank"
          rel="noreferrer"
        >
          LøberLab: Opvarmning inden løb
        </a>
        .
      </p>
    </div>
  );
}
