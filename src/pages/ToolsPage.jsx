import { useState } from "react";
import {
  ArrowLeftRight,
  Activity,
  Gauge,
  Timer,
} from "lucide-react";
import PageTitle from "../components/PageTitle";
import InjuryPreventionGuide from "./InjuryPreventionGuide";
import RunChecklistGuide from "./RunChecklistGuide";
import RunnerStrengthGuide from "./RunnerStrengthGuide";
import RunningWarmupGuide from "./RunningWarmupGuide";
import { paceFmt, timeFmt } from "../services/calculations";
import "../styles/tools.css";
import "../styles/pace-converter.css";

const techniqueDrills = [
  {
    name: "Ankling",
    category: "LØBETEKNIK",
    level: "Begynder",
    purpose: "Kort og let kontakt med underlaget.",
    cue: "Hold kroppen høj og anklerne aktive.",
    instructions: "Løb frem med små, hurtige skridt og løft kun fødderne ganske lidt.",
    dosage: "2–3 × 20 m · gå roligt tilbage",
  },
  {
    name: "Høje knæløft",
    category: "KNÆLØFT",
    level: "Begynder",
    purpose: "Rytme, kropsholdning og aktivt knæløft.",
    cue: "Stå højt, og før knæet frem uden at læne dig bagud.",
    instructions: "Løb frem med korte skridt og løft skiftevis knæene til en behagelig højde.",
    dosage: "2–3 × 20 m · gå roligt tilbage",
  },
  {
    name: "Hælspark",
    category: "LØBETEKNIK",
    level: "Begynder",
    purpose: "Afslappet benføring og hurtig rytme.",
    cue: "Hold hofterne fremme og overkroppen rolig.",
    instructions: "Løb let fremad, og lad hælene komme op mod sædet uden at forcere bevægelsen.",
    dosage: "2–3 × 20 m · gå roligt tilbage",
  },
  {
    name: "A-skip",
    category: "KOORDINATION",
    level: "Øvet",
    purpose: "Timing mellem knæløft, fodisæt og armsving.",
    cue: "Find en jævn rytme, og land let under kroppen.",
    instructions: "Lav små, rytmiske hop fremad med skiftevis knæløft og aktivt armsving.",
    dosage: "2–3 × 20 m · gå roligt tilbage",
  },
  {
    name: "Fast feet",
    category: "FODARBEJDE",
    level: "Begynder",
    purpose: "Hurtige, lette skridt og kropskontrol.",
    cue: "Lad skridtene være korte og afslappede.",
    instructions: "Løb på stedet eller let fremad med hurtige fødder og lav bevægelse op og ned.",
    dosage: "2–3 × 10–15 sek. · fuld rolig pause",
  },
  {
    name: "Straight-leg bounds",
    category: "SPÆNDSTIGHED",
    level: "Øvet",
    purpose: "Koordination og elastisk afsæt.",
    cue: "Hold bevægelsen let; knæene skal ikke låses hårdt.",
    instructions: "Bevæg dig frem med næsten strakte ben og små, kontrollerede, elastiske afsæt.",
    dosage: "2 × 20 m · gå tilbage og hvil",
  },
  {
    name: "Skater hops",
    category: "SIDESTABILITET",
    level: "Øvet",
    purpose: "Balance og kontrol fra side til side.",
    cue: "Land blødt, og hold knæet over foden.",
    instructions: "Hop kontrolleret fra side til side, og stabilisér landingen før næste hop.",
    dosage: "2 × 6–8 hop pr. side",
  },
  {
    name: "Lateral bounds",
    category: "SIDEVÆRTS AFSÆT",
    level: "Øvet",
    purpose: "Sideværts kraft og koordination.",
    cue: "Brug en afstand, hvor du stadig lander stabilt.",
    instructions: "Skub fra på ét ben, hop sideværts, og tag imod landingen med kontrol.",
    dosage: "2 × 5–6 hop pr. side",
  },
  {
    name: "Stigningsløb",
    category: "FART OG RYTME",
    level: "Alle niveauer",
    purpose: "Gradvis acceleration med afslappet løbestil.",
    cue: "Byg farten op gradvist; det er ikke en spurt.",
    instructions: "Accelerér jævnt over en kort, flad strækning, og jog eller gå roligt tilbage.",
    dosage: "3–4 × 15–20 sek. · gå/jog tilbage",
  },
  {
    name: "March and glide",
    category: "RYTME OG KOORDINATION",
    level: "Øvet",
    purpose: "Kontrolleret overgang fra march til let løb.",
    cue: "Hold kroppen høj og bevægelsen afslappet.",
    instructions: "March rytmisk med aktive arme, og glid over i nogle få lette løbeskridt.",
    dosage: "2–3 × 20 m · gå roligt tilbage",
  },
];

export function PaceConverter() {
  const [mode, setMode] = useState("pace");
  const [paceMinutes, setPaceMinutes] = useState("5");
  const [paceSeconds, setPaceSeconds] = useState("00");
  const [distanceForTime, setDistanceForTime] = useState("10");
  const [hoursForTime, setHoursForTime] = useState("0");
  const [minutesForTime, setMinutesForTime] = useState("50");
  const [secondsForTime, setSecondsForTime] = useState("0");
  const [distanceForPace, setDistanceForPace] = useState("10");
  const [speedForPace, setSpeedForPace] = useState("12");
  const [speedForDistance, setSpeedForDistance] = useState("12");
  const [minutesForDistance, setMinutesForDistance] = useState("30");

  const parseValue = (value) => Number(String(value).replace(",", "."));
  const paceTotalSeconds = parseValue(paceMinutes) * 60 + parseValue(paceSeconds);
  const paceSecondsPart = parseValue(paceSeconds);
  const paceValid =
    Number.isFinite(paceTotalSeconds) &&
    paceTotalSeconds > 0 &&
    parseValue(paceMinutes) >= 0 &&
    Number.isFinite(paceSecondsPart) &&
    paceSecondsPart >= 0 &&
    paceSecondsPart < 60;
  const paceSpeed = paceValid ? 3600 / paceTotalSeconds : NaN;
  const paceMetersPerSecond = paceSpeed / 3.6;

  const timeDistance = parseValue(distanceForTime);
  const elapsedSeconds =
    parseValue(hoursForTime) * 3600 +
    parseValue(minutesForTime) * 60 +
    parseValue(secondsForTime);
  const timeModeValid =
    Number.isFinite(timeDistance) &&
    timeDistance > 0 &&
    Number.isFinite(elapsedSeconds) &&
    elapsedSeconds > 0 &&
    parseValue(hoursForTime) >= 0 &&
    parseValue(minutesForTime) >= 0 &&
    parseValue(minutesForTime) < 60 &&
    parseValue(secondsForTime) >= 0 &&
    parseValue(secondsForTime) < 60;
  const averageSpeed = timeModeValid ? timeDistance * 3600 / elapsedSeconds : NaN;
  const averagePace = timeModeValid ? elapsedSeconds / timeDistance : NaN;

  const plannedDistance = parseValue(distanceForPace);
  const plannedSpeed = parseValue(speedForPace);
  const durationValid =
    Number.isFinite(plannedDistance) &&
    plannedDistance > 0 &&
    Number.isFinite(plannedSpeed) &&
    plannedSpeed > 0;
  const plannedDuration = durationValid ? plannedDistance / plannedSpeed * 3600 : NaN;
  const plannedPace = durationValid ? 3600 / plannedSpeed : NaN;

  const distanceSpeed = parseValue(speedForDistance);
  const durationMinutes = parseValue(minutesForDistance);
  const distanceModeValid =
    Number.isFinite(distanceSpeed) &&
    distanceSpeed > 0 &&
    Number.isFinite(durationMinutes) &&
    durationMinutes > 0;
  const estimatedDistance = distanceModeValid
    ? distanceSpeed * durationMinutes / 60
    : NaN;
  const estimatedPace = distanceModeValid ? 3600 / distanceSpeed : NaN;

  const modes = [
    ["pace", "Tempo ↔ hastighed"],
    ["time", "Hastighed ud fra løb"],
    ["distance", "Distance på tid"],
  ];

  return (
    <div className="pace-converter">
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Hvordan hænger tempo, hastighed, distance og tid sammen?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Omregn mellem min/km og km/t, beregn gennemsnitsfart fra en løbetur,
            eller find tid og distance til dit næste træningspas.
          </p>
        </section>
      </div>

      <section className="pace-calculator">
        <header className="pace-calculator-heading">
          <div className="pace-calculator-icon"><Gauge size={19} /></div>
          <div>
            <small>HLM LØBEUNIVERSITET · BEREGNER</small>
            <h2>Pace guide</h2>
          </div>
        </header>

        <div className="pace-mode-tabs" role="group" aria-label="Vælg beregning">
          {modes.map(([id, label]) => (
            <button
              type="button"
              aria-pressed={mode === id}
              className={mode === id ? "active" : ""}
              key={id}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "pace" && (
          <div className="pace-calculation-layout">
            <div className="pace-input-panel">
              <h3>Indtast dit løbetempo</h3>
              <p>Skriv minutter og sekunder pr. kilometer.</p>
              <div className="pace-input-row">
                <label>
                  Minutter
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={paceMinutes}
                    onChange={(event) => setPaceMinutes(event.target.value)}
                  />
                </label>
                <span className="pace-time-separator">:</span>
                <label>
                  Sekunder
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="1"
                    value={paceSeconds}
                    onChange={(event) => setPaceSeconds(event.target.value)}
                  />
                </label>
                <span className="pace-unit">min/km</span>
              </div>
              {!paceValid && <p className="pace-validation" role="alert">Indtast et tempo over 0:00, og brug 0–59 sekunder.</p>}
            </div>
            <div className="pace-result-panel">
              <small><ArrowLeftRight size={13} /> SVARER TIL</small>
              <div className="pace-primary-result">
                <strong>{paceValid ? `${paceSpeed.toFixed(2).replace(".", ",")} km/t` : "–"}</strong>
                <span>Hastighed</span>
              </div>
              <div className="pace-secondary-results">
                <div><span>Tempo</span><strong>{paceValid ? `${paceFmt(paceTotalSeconds)} min/km` : "–"}</strong></div>
                <div><span>Meter pr. sekund</span><strong>{paceValid ? `${paceMetersPerSecond.toFixed(2).replace(".", ",")} m/s` : "–"}</strong></div>
              </div>
            </div>
          </div>
        )}

        {mode === "time" && (
          <div className="pace-calculation-layout">
            <div className="pace-input-panel">
              <h3>Indtast distance og løbetid</h3>
              <p>Brug den samlede tid og distance fra din løbetur.</p>
              <div className="pace-input-row">
                <label>
                  Distance
                  <input
                    type="number"
                    min="0.01"
                    step="0.1"
                    value={distanceForTime}
                    onChange={(event) => setDistanceForTime(event.target.value)}
                  />
                </label>
                <span className="pace-unit">km</span>
              </div>
              <div className="pace-input-row pace-time-inputs">
                <label>
                  Timer
                  <input type="number" min="0" step="1" value={hoursForTime} onChange={(event) => setHoursForTime(event.target.value)} />
                </label>
                <label>
                  Minutter
                  <input type="number" min="0" max="59" step="1" value={minutesForTime} onChange={(event) => setMinutesForTime(event.target.value)} />
                </label>
                <label>
                  Sekunder
                  <input type="number" min="0" max="59" step="1" value={secondsForTime} onChange={(event) => setSecondsForTime(event.target.value)} />
                </label>
              </div>
              {!timeModeValid && <p className="pace-validation" role="alert">Indtast en distance og en tid større end 0.</p>}
            </div>
            <div className="pace-result-panel">
              <small><ArrowLeftRight size={13} /> GENNEMSNIT</small>
              <div className="pace-primary-result">
                <strong>{timeModeValid ? `${averageSpeed.toFixed(2).replace(".", ",")} km/t` : "–"}</strong>
                <span>Gennemsnitshastighed</span>
              </div>
              <div className="pace-secondary-results">
                <div><span>Tempo</span><strong>{timeModeValid ? `${paceFmt(averagePace)} min/km` : "–"}</strong></div>
                <div><span>Meter pr. sekund</span><strong>{timeModeValid ? `${(averageSpeed / 3.6).toFixed(2).replace(".", ",")} m/s` : "–"}</strong></div>
              </div>
            </div>
          </div>
        )}

        {mode === "distance" && (
          <div className="pace-calculation-layout">
            <div className="pace-input-panel">
              <h3>Indtast hastighed og tid</h3>
              <p>Se hvor langt du når ved en jævn gennemsnitshastighed.</p>
              <div className="pace-input-row">
                <label>
                  Hastighed
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={speedForDistance}
                    onChange={(event) => setSpeedForDistance(event.target.value)}
                  />
                </label>
                <span className="pace-unit">km/t</span>
              </div>
              <div className="pace-input-row">
                <label>
                  Tid
                  <input
                    type="number"
                    min="0.1"
                    step="1"
                    value={minutesForDistance}
                    onChange={(event) => setMinutesForDistance(event.target.value)}
                  />
                </label>
                <span className="pace-unit">minutter</span>
              </div>
              {!distanceModeValid && <p className="pace-validation" role="alert">Indtast en hastighed og en tid større end 0.</p>}
            </div>
            <div className="pace-result-panel">
              <small><ArrowLeftRight size={13} /> BEREGNET RESULTAT</small>
              <div className="pace-primary-result">
                <strong>{distanceModeValid ? `${estimatedDistance.toFixed(2).replace(".", ",")} km` : "–"}</strong>
                <span>Distance</span>
              </div>
              <div className="pace-secondary-results">
                <div><span>Tempo</span><strong>{distanceModeValid ? `${paceFmt(estimatedPace)} min/km` : "–"}</strong></div>
                <div><span>Meter pr. sekund</span><strong>{distanceModeValid ? `${(distanceSpeed / 3.6).toFixed(2).replace(".", ",")} m/s` : "–"}</strong></div>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="pace-reference">
        <div className="pace-reference-heading">
          <div><small>HURTIGT OVERBLIK</small><h3>Hastighed og tempo</h3></div>
          <span>Ca.-værdier</span>
        </div>
        <div className="pace-reference-table" role="table" aria-label="Omregning mellem hastighed og tempo">
          <div className="pace-reference-row pace-reference-header" role="row">
            <span role="columnheader">Hastighed</span>
            <span role="columnheader">Tempo</span>
            <span role="columnheader">5 km-tid</span>
            <span role="columnheader">10 km-tid</span>
          </div>
          {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((speed) => (
            <div className="pace-reference-row" role="row" key={speed}>
              <strong role="cell">{speed} km/t</strong>
              <span role="cell">{paceFmt(3600 / speed)} min/km</span>
              <span role="cell">{timeFmt(18000 / speed)}</span>
              <span role="cell">{timeFmt(36000 / speed)}</span>
            </div>
          ))}
        </div>
      </section>

      <p className="pace-converter-note">
        Hastigheder og sluttider er gennemsnitlige beregninger uden pauser.
        Faktisk løbetempo påvirkes blandt andet af terræn, vind, temperatur og dagsform.
      </p>
    </div>
  );
}

function ZoneGuide() {
  const zones = [
    {
      zone: "E",
      title: "Let løb",
      effort: "Let · du føler, du kunne fortsætte længe",
      talk: "Du kan tale i hele sætninger uden at hive efter vejret.",
      purpose: "Opbygger den aerobe base og hjælper kroppen med at restituere mellem hårdere pas.",
      example: "Rolig tur, restitutionsløb eller op-/nedjog. Det skal føles tydeligt lettere end M.",
      distinction: "Hvis du kun kan svare med korte sætninger, er det sandsynligvis ikke længere E.",
    },
    {
      zone: "M",
      title: "Maratonpace",
      effort: "Jævnt og kontrolleret · krævende over tid",
      talk: "Du kan sige korte sætninger, men du mærker, at du arbejder.",
      purpose: "Øver en stabil indsats omkring det planlagte maratontempo og evnen til at holde den længe.",
      example: "Længere sammenhængende blokke eller gentagelser, fx 3 × 10 min i planlagt maratonindsats.",
      distinction: "M er et specifikt, bæredygtigt måltempo — langsommere og mere kontrolleret end T.",
    },
    {
      zone: "T",
      title: "Tærskel",
      effort: "Hårdt, men stabilt · “komfortabelt hårdt”",
      talk: "Du kan få nogle få ord frem, men ikke føre en afslappet samtale.",
      purpose: "Træner evnen til at holde en høj, jævn indsats uden at gå tidligt i rødt.",
      example: "Tempoafsnit eller intervaller på flere minutter, fx 3 × 8 min med let jog imellem.",
      distinction: "T føles tydeligt hårdere end M, men skal stadig være kontrolleret og gentageligt — ikke en sprint.",
    },
    {
      zone: "I",
      title: "Interval",
      effort: "Meget hårdt · udføres i afgrænsede arbejdsperioder",
      talk: "Det er svært at tale under selve intervallet; pausen hjælper dig med at gøre næste gentagelse.",
      purpose: "Træner høj aerob kapacitet og evnen til at løbe hurtigt med ensartet kvalitet.",
      example: "Typisk intervaller på cirka 3–5 min med jævne joggepauser, fx 6 × 3 min.",
      distinction: "I er hårdere end T, men gentagelserne skal kunne holdes nogenlunde ens — ikke løbes som sprint.",
    },
    {
      zone: "R",
      title: "Repetition",
      effort: "Hurtigt og afslappet · korte gentagelser med god pause",
      talk: "Gentagelsen er for kort til en samtale; pausen er lang nok til, at du kan løbe næste med god teknik.",
      purpose: "Øver løbeøkonomi, rytme, koordination og hurtige, afslappede skridt.",
      example: "Korte gentagelser, fx 6 × 20 sekunder hurtigt og afslappet med 1–2 min let jog eller gang.",
      distinction: "R er hurtigere end I, men meget kortere. Fokus er kvalitet og teknik — ikke udmattelse.",
    },
  ];

  return (
    <div className="zone-guide">
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Hvad betyder zonerne — og hvordan skal de føles?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Brug beskrivelserne til at forstå formålet og indsatsen bag E, M,
            T, I og R. Tempoet er vejledende; mærk også efter dagsform og
            forhold.
          </p>
        </section>
      </div>

      <section className="zone-guide-hero">
        <div>
          <small>HLM LØBEUNIVERSITET · INTENSITETSGUIDE</small>
          <h2>Zoneforklaring</h2>
          <p>
            Zonerne går fra let og langvarigt arbejde til korte, hurtige
            gentagelser. De er ikke fem faste hastigheder, der passer ens til
            alle — brug dit VDOT-tempo som udgangspunkt, og justér efter
            terræn, vejr og dagsform.
          </p>
        </div>
        <div className="zone-guide-legend" aria-label="Zoner fra let til hurtigt">
          <span className="zone-symbol zone-e">E</span>
          <i />
          <span className="zone-symbol zone-m">M</span>
          <i />
          <span className="zone-symbol zone-t">T</span>
          <i />
          <span className="zone-symbol zone-i">I</span>
          <i />
          <span className="zone-symbol zone-r">R</span>
        </div>
      </section>

      <div className="zone-guide-cards">
        {zones.map((zone) => (
          <article className={`zone-guide-card zone-${zone.zone.toLowerCase()}`} key={zone.zone}>
            <header>
              <span className={`zone-symbol zone-${zone.zone.toLowerCase()}`}>{zone.zone}</span>
              <div>
                <small>ZONE {zone.zone}</small>
                <h3>{zone.title}</h3>
              </div>
            </header>
            <p className="zone-guide-effort">{zone.effort}</p>
            <dl>
              <div><dt>Sådan føles det</dt><dd>{zone.talk}</dd></div>
              <div><dt>Formål</dt><dd>{zone.purpose}</dd></div>
              <div><dt>Typisk pas</dt><dd>{zone.example}</dd></div>
            </dl>
            <p className="zone-guide-distinction"><strong>Forskel:</strong> {zone.distinction}</p>
          </article>
        ))}
      </div>

      <section className="zone-guide-reminder">
        <h3>Husk, når du vælger tempo</h3>
        <p>
          <strong>Roligt betyder roligt:</strong> E skal ikke presses op til M.
          På varme, kuperede eller blæsende dage kan samme indsats føles
          langsommere. På I- og R-pas er pauserne en del af træningen — brug dem,
          så du kan holde kvaliteten.
        </p>
        <p>
          Hvis du vil have personlige tempopejlemærker, kan du indtaste et
          nyligt løbsresultat under VDOT-beregneren.
        </p>
      </section>
    </div>
  );
}

function RunningTechniqueGuide() {
  return (
    <>
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Hvordan løber jeg mere afslappet og med bedre rytme?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Brug korte teknikøvelser til at øve koordination, balance og
            løberytme. De skal føles kontrollerede og må ikke give smerter.
          </p>
        </section>
      </div>

      <section className="technique-hero">
        <div className="technique-title">
          <span><Activity size={18} /></span>
          <div>
            <small>HLM LØBEUNIVERSITET</small>
            <h2>Løbeteknik</h2>
          </div>
        </div>
        <p>
          Løbeteknik handler om at bevæge sig effektivt med en afslappet rytme.
          Brug øvelserne som inspiration før en rolig løbetur — de er ikke en
          garanti mod skader, og du behøver ikke lave dem alle på én gang.
        </p>
      </section>

      <div className="technique-stats">
        <div><small>ØVELSER</small><strong>2–4</strong><span>øvelser pr. session</span></div>
        <div><small>HYPPIGHED</small><strong>1–2</strong><span>gange om ugen</span></div>
        <div><small>VARIGHED</small><strong>10–20 min</strong><span>pr. gang</span></div>
        <div><small>INTENSITET</small><strong>Let</strong><span>god teknik før fart</span></div>
      </div>

      <section className="technique-warmup">
        <h2>Sådan bruger du øvelserne</h2>
        <div>
          <article><b><span>1</span> Vælg 2–4 øvelser</b><p>Start med få øvelser, der passer til dit niveau.</p></article>
          <article><b><span>2</span> Gå roligt i gang</b><p>Lav korte gentagelser og gå tilbage som pause.</p></article>
          <article><b><span>3</span> Byg gradvist op</b><p>Øg kun, når bevægelsen føles sikker og kontrolleret.</p></article>
        </div>
      </section>

      <div className="technique-drill-grid">
        {techniqueDrills.map((drill) => (
          <article className="technique-drill-card" key={drill.name}>
            <div className="technique-drill-heading">
              <div>
                <small>{drill.category}</small>
                <h3>{drill.name}</h3>
              </div>
              <span className={`technique-level ${drill.level === "Øvet" ? "advanced" : ""}`}>
                {drill.level}
              </span>
            </div>
            <div className="technique-purpose">
              <strong>{drill.purpose}</strong>
            </div>
            <p>{drill.instructions}</p>
            <p className="technique-cue"><b>Fokus:</b> {drill.cue}</p>
            <div className="technique-dosage">
              <Timer size={14} />
              <span>{drill.dosage}</span>
            </div>
          </article>
        ))}
      </div>

      <p className="technique-disclaimer">
        <strong>Bemærk:</strong> Begynd roligt, og vælg øvelser efter dit niveau.
        Stop ved smerter, og søg faglig rådgivning ved vedvarende gener.
      </p>
    </>
  );
}

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState("technique");
  const tools = [
    ["technique", "Løbeteknik"],
    ["injury", "Skadeforebyggelse"],
    ["warmup", "Opvarmning"],
    ["strength", "Styrketræning"],
    ["checklist", "Tjekliste"],
    ["zones", "Zoneforklaring"],
  ];

  return (
    <>
      <PageTitle
        eyebrow="HLM"
        title="Værktøjer"
        description="Værktøjer og inspiration til din løbetræning."
      />
      <div className="tabs tools-tabs" aria-label="Vælg værktøj">
        {tools.map(([id, label]) => (
          <button
            type="button"
            className={activeTool === id ? "active" : ""}
            aria-pressed={activeTool === id}
            onClick={() => setActiveTool(id)}
            key={id}
          >
            {label}
          </button>
        ))}
      </div>
      {activeTool === "technique" ? (
        <RunningTechniqueGuide />
      ) : activeTool === "injury" ? (
        <InjuryPreventionGuide />
      ) : activeTool === "warmup" ? (
        <RunningWarmupGuide />
      ) : activeTool === "strength" ? (
        <RunnerStrengthGuide />
      ) : activeTool === "checklist" ? (
        <RunChecklistGuide />
      ) : (
        <ZoneGuide />
      )}
    </>
  );
}
