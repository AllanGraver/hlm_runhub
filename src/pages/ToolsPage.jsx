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
import "../styles/running-technique.css";
import "../styles/pace-converter.css";

const techniqueLevels = ["Alle", "Begynder", "Øvet", "Avanceret"];

const techniquePhases = [
  {
    id: "fjedring",
    number: "01",
    title: "Fjedring og fodisætning",
    shortTitle: "Fjedring",
    description:
      "Grundlaget for løbeskridtet. Her træner du en aktiv ankel, let landing og kort kontakt med underlaget.",
    cue: "Land let under kroppen, og lad anklen arbejde som en fjeder.",
    drills: [
      {
        name: "Fodledsjog",
        level: "Begynder",
        purpose: "Udvikler aktive ankler, hurtige fødder og en elastisk fodafvikling.",
        instructions:
          "Bevæg dig langsomt frem med meget små skridt. Sæt forfoden i først, lad hælen søge let ned, og løft hurtigt foden igen.",
        focus: "Små skridt · høj krop · landing under hoften",
        mistake: "Undgå at hoppe højt eller løbe stift på tæerne.",
        dosage: "2 × 15–20 m · gå tilbage",
      },
      {
        name: "Små hurtige skridt",
        level: "Begynder",
        purpose: "Træner skridtfrekvens, rytme og kort kontakt med jorden.",
        instructions:
          "Løb fremad med korte, lette skridt. Hold fødderne tæt på jorden og lad tempoet komme fra rytmen, ikke fra lange skridt.",
        focus: "Hurtige fødder · rolige skuldre · korte skridt",
        mistake: "Undgå at læne dig bagud eller række foden frem.",
        dosage: "2 × 15–20 m · gå tilbage",
      },
      {
        name: "Forfodshop",
        level: "Begynder",
        purpose: "Opbygger grundlæggende fjedring i fod, ankel og læg.",
        instructions:
          "Lav små hop på begge ben. Brug anklerne som fjedre, hold knæbøjningen lille, og land så let som muligt.",
        focus: "Lydløs landing · aktiv ankel · ens rytme",
        mistake: "Undgå dybe knæbøjninger og tunge landinger.",
        dosage: "2 × 10–15 sek. · 30 sek. pause",
      },
      {
        name: "Dribbles",
        level: "Øvet",
        purpose: "Forbinder hælopsamling, knæfremføring og fodisætning i en lille løbecirkel.",
        instructions:
          "Løb med små cirkulære benbevægelser. Løft hælen let, før knæet lidt frem, og sæt foden ned under kroppen.",
        focus: "Lille cirkel · hurtig kontakt · afslappet overkrop",
        mistake: "Start ikke med store skridt. Udvid først bevægelsen, når rytmen er stabil.",
        dosage: "2 × 20 m · gå tilbage",
      },
      {
        name: "Enkeltbenshop",
        level: "Avanceret",
        purpose: "Træner elastisk afsæt og kontrol på ét ben.",
        instructions:
          "Hop fremad flere gange på samme ben. Land på midt- eller forfod med let bøjet knæ, og skift derefter ben.",
        focus: "Stabilt knæ · aktiv ankel · hofte over standbenet",
        mistake: "Stop hvis knæet falder indad, eller landingen bliver tung.",
        dosage: "2 × 6 hop pr. ben · god pause",
      },
    ],
  },
  {
    id: "fremfoering",
    number: "02",
    title: "Fremføring af benet",
    shortTitle: "Fremføring",
    description:
      "Her lærer du at få benet effektivt frem efter afsættet uden at miste kropsholdning eller rytme.",
    cue: "Før knæet frem, hold hoften stabil, og sæt foden ned under dig.",
    drills: [
      {
        name: "High Knee March",
        level: "Begynder",
        purpose: "Indlærer knæløft, balance og samspil mellem modsatte arm og ben.",
        instructions:
          "Gå fremad og løft skiftevis et knæ til omtrent hoftehøjde. Hold kort balancen, og sæt foden ned under hoften.",
        focus: "Stå højt · tå op · modsatte arm frem",
        mistake: "Undgå at læne overkroppen bagud eller lade hoften synke.",
        dosage: "2 × 15–20 m · roligt tempo",
      },
      {
        name: "A-March",
        level: "Begynder",
        purpose: "Træner kontrolleret knæløft og korrekt placering af foden.",
        instructions:
          "Marchér frem med tydeligt knæløft. Træk tæerne op mod skinnebenet, og før foden kontrolleret ned under kroppen.",
        focus: "Knæ frem · tå op · fod ned",
        mistake: "Undgå at strække underbenet frem og lande foran kroppen.",
        dosage: "2 × 20 m · gå tilbage",
      },
      {
        name: "Høje knæ",
        level: "Begynder",
        purpose: "Træner hurtig fremføring, rytme og aktiv nedføring af foden.",
        instructions:
          "Løb med korte, hurtige skridt og løft knæene foran kroppen. Tænk især på at føre foden hurtigt ned igen.",
        focus: "Knæ frem · fod ned · aktive arme",
        mistake: "Undgå at jage maksimal knæhøjde eller læne dig bagud.",
        dosage: "2 × 15–20 m · gå tilbage",
      },
      {
        name: "Enkeltbens knæløft",
        level: "Begynder",
        purpose: "Isolerer fremføringen af ét ben og tydeliggør forskelle mellem siderne.",
        instructions:
          "Løb langsomt frem, men løft kun det ene knæ tydeligt. Det andet ben fortsætter med et kort, normalt løbeskridt.",
        focus: "Samme rytme · stabil hofte · lige frem",
        mistake: "Undgå at rotere overkroppen, når det aktive ben løftes.",
        dosage: "2 × 15 m pr. ben · gå tilbage",
      },
      {
        name: "A-Skip",
        level: "Øvet",
        purpose: "Samler knæløft, fodisætning, rytme og armføring.",
        instructions:
          "Lav rytmiske skip fremad. Løft det ene knæ, hold anklen aktiv, og før foden ned under kroppen, inden du skifter ben.",
        focus: "Knæ op · tå op · fod ned · god rytme",
        mistake: "Undgå at hoppe langt frem eller sætte foden foran kroppen.",
        dosage: "2–3 × 20 m · gå tilbage",
      },
      {
        name: "Hurtige A-Skips",
        level: "Øvet",
        purpose: "Øger frekvensen i A-Skip uden at miste den tekniske position.",
        instructions:
          "Udfør A-Skip med mindre hop, lidt lavere knæløft og hurtigere kontakt med jorden.",
        focus: "Lille bevægelse · hurtig rytme · afslappede skuldre",
        mistake: "Øg ikke farten, før almindelig A-Skip er sikker.",
        dosage: "2 × 15–20 m · fuld rolig pause",
      },
      {
        name: "A-Run",
        level: "Øvet",
        purpose: "Overfører A-bevægelsen til et mere løbelignende bevægelsesmønster.",
        instructions:
          "Løb med samme benføring som i A-Skip, men uden det tydelige hop. Før knæet frem og foden hurtigt ned under dig.",
        focus: "Hurtigt knæ frem · kort jordkontakt · normale arme",
        mistake: "Undgå overdrevet knæhøjde og spændinger i overkroppen.",
        dosage: "2 × 20 m · gå tilbage",
      },
      {
        name: "Sprintmarch",
        level: "Avanceret",
        purpose: "Træner kraftfuld fremføring og en stærk, oprejst sprintposition.",
        instructions:
          "Marchér frem med kraftige knæløft og tydelig armføring. Pres standbenet mod jorden, før du skifter side.",
        focus: "Kraft gennem standbenet · knæ frem · stærke arme",
        mistake: "Skynd dig ikke. Kontrollér hver position før næste skridt.",
        dosage: "2 × 15–20 m · gå tilbage",
      },
    ],
  },
  {
    id: "nedfoering",
    number: "03",
    title: "Nedføring og bagudtræk",
    shortTitle: "Bagudtræk",
    description:
      "Denne fase træner, hvordan foden føres ned mod underlaget og skaber fremdrift ved at arbejde bagud.",
    cue: "Sæt ikke foden langt frem. Før den ned og arbejd bagud under kroppen.",
    drills: [
      {
        name: "Strakte ben",
        level: "Øvet",
        purpose: "Fremhæver aktiv nedføring og det bagudrettede træk gennem underlaget.",
        instructions:
          "Løb med næsten strakte ben. Før benet frem fra hoften, sæt foden aktivt ned tæt på kroppen, og træk underlaget bagud.",
        focus: "Bevægelse fra hoften · aktiv fod ned · rank krop",
        mistake: "Undgå at læne dig bagud eller overstride.",
        dosage: "2 × 20 m · gå tilbage",
      },
      {
        name: "B-Skip",
        level: "Avanceret",
        purpose: "Kombinerer knæløft, kontrolleret benstræk og aktivt bagudtræk.",
        instructions:
          "Start som A-Skip. Stræk underbenet kontrolleret frem, før foden ned, og træk den bagud mod underlaget.",
        focus: "Knæ op · ben frem · fod ned og tilbage",
        mistake: "Undgå at sparke hårdt frem eller lande på hælen foran kroppen.",
        dosage: "2 × 15–20 m · god pause",
      },
      {
        name: "Paw-back drill",
        level: "Avanceret",
        purpose: "Isolerer den aktive nedad- og bagudgående bevægelse før fodisætningen.",
        instructions:
          "Løft knæet, og før derefter foden ned og bagud. Forestil dig, at du trækker underlaget bagud lige før kontakten.",
        focus: "Bevægelse fra hoften · aktivt baglår · fod under kroppen",
        mistake: "Undgå at overstrække knæet eller skrabe hårdt i jorden.",
        dosage: "2 × 8 gentagelser pr. ben",
      },
    ],
  },
  {
    id: "haelopsamling",
    number: "04",
    title: "Hælopsamling",
    shortTitle: "Hælopsamling",
    description:
      "Hælopsamlingen gør benets tilbageføring kortere og hjælper dig med at føre benet hurtigt frem til næste skridt.",
    cue: "Træk hælen op under kroppen, ikke langt bagud.",
    drills: [
      {
        name: "Hælspark",
        level: "Begynder",
        purpose: "Træner baglår, hurtig hælopsamling og en let løberytme.",
        instructions:
          "Løb med korte skridt og træk hælen op under kroppen. Lad knæet bevæge sig let frem, så bevægelsen ligner løb.",
        focus: "Hæl op under kroppen · høj krop · hurtig rytme",
        mistake: "Undgå at sparke foden langt bagud eller svaje i ryggen.",
        dosage: "2 × 20 m · gå tilbage",
      },
      {
        name: "Hurtige hælspark",
        level: "Øvet",
        purpose: "Øger frekvensen i benets opsamling og tilbageføring.",
        instructions:
          "Udfør små hælspark med meget hurtig rytme og begrænset bevægelse fremad.",
        focus: "Hurtig hæl op og ned · kort jordkontakt",
        mistake: "Undgå spændte skuldre og knæ, der trækkes bagud.",
        dosage: "2 × 10–15 sek. · god pause",
      },
      {
        name: "C-Skip",
        level: "Avanceret",
        purpose: "Forbinder hælopsamling, knæfremføring og fodisætning i én cirkulær bevægelse.",
        instructions:
          "Træk hælen op under kroppen, før knæet frem, og sæt foden ned under hoften. Fortsæt i en flydende rytme.",
        focus: "Hæl op · knæ frem · fod ned",
        mistake: "Undgå tre stive delbevægelser. Bevægelsen skal være sammenhængende.",
        dosage: "2 × 15–20 m · gå tilbage",
      },
    ],
  },
  {
    id: "fraskub",
    number: "05",
    title: "Fraskub",
    shortTitle: "Fraskub",
    description:
      "Her arbejder du med at omsætte styrke og elasticitet til et hurtigt og kraftfuldt afsæt.",
    cue: "Skab kraft mod jorden, men bevar en stabil hofte og en kontrolleret landing.",
    drills: [
      {
        name: "Gadedrengehop",
        level: "Øvet",
        purpose: "Træner rytmisk afsæt, knæfremføring og samspil mellem arme og ben.",
        instructions:
          "Lav kraftige, rytmiske skip. Pres jorden væk med standbenet, før modsatte knæ frem, og brug armene aktivt.",
        focus: "Kraftigt afsæt · knæ frem · aktiv armføring",
        mistake: "Undgå lange, langsomme hop eller landing langt foran kroppen.",
        dosage: "2 × 20 m · gå tilbage",
      },
      {
        name: "Stigningsløb",
        level: "Øvet",
        purpose: "Samler hele løbebevægelsen i gradvist højere fart.",
        instructions:
          "Start roligt og øg hastigheden jævnt. Slut hurtigt, men afslappet, og sænk derefter farten kontrolleret.",
        focus: "Gradvis acceleration · hurtige arme · afslappet ansigt",
        mistake: "Undgå at sprinte fra første skridt eller spænde i skuldrene.",
        dosage: "3–4 × 15–20 sek. · gå/jog tilbage",
      },
      {
        name: "Løbespring / Bounding",
        level: "Avanceret",
        purpose: "Udvikler kraft, hofteekstension og evnen til at producere høj kraft hurtigt.",
        instructions:
          "Løb frem i lange, kraftfulde spring. Pres jorden væk, før modsatte knæ frem, og brug armene aktivt.",
        focus: "Kraft fremad · stabil hofte · hurtig videre fra landingen",
        mistake: "Undgå at hoppe lodret, overstrække ryggen eller jagte maksimal længde.",
        dosage: "2 × 15–20 m · fuld pause",
      },
      {
        name: "Hinkespring",
        level: "Avanceret",
        purpose: "Træner eksplosivt fraskub og styrke på ét ben.",
        instructions:
          "Lav kontrollerede, kraftige hink fremad på samme ben med aktiv armføring. Skift ben efter serien.",
        focus: "Kraftfuldt afsæt · stabil landing · stærke arme",
        mistake: "Stop hvis kontrol over knæ eller hofte forsvinder.",
        dosage: "2 × 5–6 hink pr. ben · fuld pause",
      },
    ],
  },
  {
    id: "stabilitet",
    number: "06",
    title: "Stabilitet og koordination",
    shortTitle: "Stabilitet",
    description:
      "Stabilitet omkring hofte, knæ og ankel hjælper dig med at holde retning og kontrol gennem hele løbeskridtet.",
    cue: "Knæet følger foden, hoften holdes stabil, og landingen er under kontrol.",
    drills: [
      {
        name: "Sidehop",
        level: "Begynder",
        purpose: "Opbygger grundlæggende kontrol omkring hofte, knæ og ankel.",
        instructions:
          "Bevæg dig sidelæns med små hop. Hold hofte, knæ og fod i samme retning, og land blødt.",
        focus: "Stabil hofte · knæ over fod · blød landing",
        mistake: "Undgå at knæet falder indad, eller kroppen vælter til siden.",
        dosage: "2 × 8 hop i hver retning",
      },
      {
        name: "Side-to-side skip",
        level: "Øvet",
        purpose: "Træner sideværts kontrol, rytme og stabiliserende muskulatur.",
        instructions:
          "Bevæg dig sidelæns med rytmiske hop, hvor fødderne skiftevis samles og skilles.",
        focus: "Let rytme · stabil hofte · se fremad",
        mistake: "Undgå tunge landinger eller at dreje kroppen i bevægelsesretningen.",
        dosage: "2 × 15 m i hver retning",
      },
      {
        name: "Carioca / krydsløb",
        level: "Øvet",
        purpose: "Udvikler koordination, hofterotation og kontrol i sideværts bevægelse.",
        instructions:
          "Bevæg dig sidelæns, og før skiftevis det bagerste ben foran og bagved det andet ben.",
        focus: "Rolig start · bevægelse fra hoften · lette fødder",
        mistake: "Undgå høj fart, før krydsbevægelsen er sikker.",
        dosage: "2 × 15–20 m i hver retning",
      },
      {
        name: "Skøjteløberhop",
        level: "Øvet",
        purpose: "Træner sideværts kraft, balance og kontrol på ét ben.",
        instructions:
          "Spring skråt fra det ene ben til det andet. Land med let bøjet knæ, find balancen, og fortsæt.",
        focus: "Kontrolleret landing · hofte tilbage · balance først",
        mistake: "Undgå at knæet falder indad eller at skynde dig videre.",
        dosage: "2 × 6–8 hop pr. side",
      },
      {
        name: "Eksplosive sidehop på ét ben",
        level: "Avanceret",
        purpose: "Udfordrer reaktiv styrke og stabilitet under højere belastning.",
        instructions:
          "Hop sideværts på ét ben over en kort afstand. Stabiliser hurtigt og fortsæt med samme ben.",
        focus: "Kort kontakt · stabil hofte · præcis landing",
        mistake: "Brug ikke øvelsen, hvis almindelige sidehop ikke kan udføres stabilt.",
        dosage: "2 × 5 hop pr. ben · fuld pause",
      },
    ],
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
  const [activeLevel, setActiveLevel] = useState("Alle");

  const visiblePhases = techniquePhases
    .map((phase) => ({
      ...phase,
      drills:
        activeLevel === "Alle"
          ? phase.drills
          : phase.drills.filter((drill) => drill.level === activeLevel),
    }))
    .filter((phase) => phase.drills.length > 0);

  const scrollToPhase = (phaseId) => {
    document.getElementById(`technique-${phaseId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const levelClass = (level) =>
    level === "Begynder"
      ? "beginner"
      : level === "Øvet"
        ? "intermediate"
        : "advanced";

  return (
    <div className="running-technique-guide">
      <div className="tools-intro">
        <section>
          <small>LÆR LØBESKRIDTET TRIN FOR TRIN</small>
          <h2>Løbeteknik opbygget efter benets bevægelse</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Find den del af løbeskridtet, du vil arbejde med, og vælg øvelser
            efter dit niveau. Start med kontrol, og gå først videre, når
            bevægelsen føles sikker og rytmisk.
          </p>
        </section>
      </div>

      <section className="technique-hero technique-school-hero">
        <div>
          <div className="technique-title">
            <span><Activity size={18} /></span>
            <div>
              <small>HLM LØBEUNIVERSITET</small>
              <h2>Løbeteknikskolen</h2>
            </div>
          </div>
          <p>
            Følg løbeskridtet fra fjedring og fodisætning til fremføring,
            bagudtræk, hælopsamling, fraskub og stabilitet. Du behøver ikke
            træne alle faser på samme dag.
          </p>
        </div>
        <div className="technique-hero-rule">
          <strong>Kvalitet før fart</strong>
          <span>Stop serien, når rytmen eller kontrollen forsvinder.</span>
        </div>
      </section>

      <div className="technique-stats">
        <div><small>OPBYGNING</small><strong>6</strong><span>bevægelsesfaser</span></div>
        <div><small>NIVEAUER</small><strong>3</strong><span>fra begynder til avanceret</span></div>
        <div><small>TEKNIKPAS</small><strong>10–15</strong><span>minutter er tilstrækkeligt</span></div>
        <div><small>DOSERING</small><strong>2–4</strong><span>øvelser pr. session</span></div>
      </div>

      <section className="technique-warmup technique-method">
        <h2>Den enkle metode</h2>
        <div>
          <article>
            <b><span>1</span> Vælg fase</b>
            <p>Find den bevægelse i løbeskridtet, du vil forbedre.</p>
          </article>
          <article>
            <b><span>2</span> Vælg niveau</b>
            <p>Begynd med den letteste øvelse, du kan udføre sikkert.</p>
          </article>
          <article>
            <b><span>3</span> Træn kvalitet</b>
            <p>Brug korte serier, gå tilbage, og gentag med god kontrol.</p>
          </article>
        </div>
      </section>

      <nav className="technique-navigation" aria-label="Navigation i løbeteknikskolen">
        <div className="technique-navigation-label">
          <small>GÅ DIREKTE TIL</small>
          <strong>Bevægelsesfase</strong>
        </div>
        <div className="technique-phase-links">
          {techniquePhases.map((phase) => (
            <button
              type="button"
              key={phase.id}
              onClick={() => scrollToPhase(phase.id)}
            >
              <span>{phase.number}</span>
              {phase.shortTitle}
            </button>
          ))}
        </div>
      </nav>

      <section className="technique-level-filter" aria-labelledby="technique-level-heading">
        <div>
          <small>FILTRÉR ØVELSERNE</small>
          <h2 id="technique-level-heading">Vælg dit niveau</h2>
          <p>Niveauet beskriver øvelsens tekniske krav og belastning, ikke hvor hurtigt du normalt løber.</p>
        </div>
        <div className="technique-level-buttons" role="group" aria-label="Vælg teknikniveau">
          {techniqueLevels.map((level) => (
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
        {visiblePhases.map((phase) => (
          <section
            className="technique-phase"
            id={`technique-${phase.id}`}
            key={phase.id}
          >
            <header className="technique-phase-heading">
              <span>{phase.number}</span>
              <div>
                <small>FASE I LØBESKRIDTET</small>
                <h2>{phase.title}</h2>
                <p>{phase.description}</p>
              </div>
              <aside>
                <strong>Instruktørens cue</strong>
                <p>{phase.cue}</p>
              </aside>
            </header>

            <div className="technique-drill-grid">
              {phase.drills.map((drill) => (
                <article className="technique-drill-card" key={`${phase.id}-${drill.name}`}>
                  <div className="technique-drill-heading">
                    <div>
                      <small>{phase.shortTitle.toUpperCase()}</small>
                      <h3>{drill.name}</h3>
                    </div>
                    <span className={`technique-level ${levelClass(drill.level)}`}>
                      {drill.level}
                    </span>
                  </div>

                  <div className="technique-purpose">
                    <strong>Formål</strong>
                    <span>{drill.purpose}</span>
                  </div>

                  <div className="technique-drill-copy">
                    <h4>Sådan gør du</h4>
                    <p>{drill.instructions}</p>
                  </div>

                  <dl className="technique-drill-details">
                    <div>
                      <dt>Fokus</dt>
                      <dd>{drill.focus}</dd>
                    </div>
                    <div>
                      <dt>Typisk fejl</dt>
                      <dd>{drill.mistake}</dd>
                    </div>
                  </dl>

                  <div className="technique-dosage">
                    <Timer size={14} />
                    <span>{drill.dosage}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="technique-session">
        <div>
          <small>KLAR TIL BRUG</small>
          <h2>Et komplet teknikpas på 10–15 minutter</h2>
          <p>
            Brug passet efter let opvarmning og før intervaller eller en rolig
            løbetur. Udfør én til to serier af hver øvelse.
          </p>
        </div>
        <ol>
          {[
            ["01", "Fodledsjog", "Fjedring"],
            ["02", "Høje knæ", "Fremføring"],
            ["03", "Hælspark", "Hælopsamling"],
            ["04", "A-Skip", "Koordination"],
            ["05", "Strakte ben", "Bagudtræk"],
            ["06", "Carioca", "Stabilitet"],
            ["07", "Stigningsløb", "Samlet løb"],
          ].map(([number, name, phase]) => (
            <li key={name}>
              <span>{number}</span>
              <div><strong>{name}</strong><small>{phase}</small></div>
            </li>
          ))}
        </ol>
      </section>

      <p className="technique-disclaimer">
        <strong>Bemærk:</strong> Varm kroppen op før tekniktræning. Begynd på
        et niveau, hvor du kan holde kontrollen, stop ved smerter, og søg
        faglig rådgivning ved vedvarende gener.
      </p>
    </div>
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
