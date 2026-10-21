import { useState } from "react";
import { Clock3, RotateCcw, Trophy } from "lucide-react";
import Card from "../components/Card";
import PageTitle from "../components/PageTitle";
import {
  paceFmt,
  prediction,
  timeFmt,
  vdotCalc,
  vdotTrainingPaceRange,
} from "../services/calculations";
import "../styles/vdot.css";

const distances = [
  ["1 mile", 1.60934],
  ["3 km", 3],
  ["5 km", 5],
  ["10 km", 10],
  ["Halvmaraton", 21.0975],
  ["Maraton", 42.195],
];

const trainingZones = [
  {
    zone: "E",
    title: "Roligt tempo",
    description: "Restitution, opvarmning og let aerob træning.",
    range: [0.59, 0.74],
  },
  {
    zone: "M",
    title: "Maratonpace",
    description: "Langvarig, kontrolleret belastning og maratonspecifik træning.",
    range: [0.75, 0.84],
  },
  {
    zone: "T",
    title: "Tærskeltempo",
    description: "Tempo- og tærskelpas, der styrker evnen til at holde høj fart.",
    range: [0.83, 0.88],
  },
  {
    zone: "I",
    title: "Intervaltempo",
    description: "Hårde intervaller på typisk 3–5 minutter med jævne pauser.",
    range: [0.95, 1],
  },
  {
    zone: "R",
    title: "Repetitionstempo",
    description: "Korte, hurtige gentagelser med god pause og fokus på teknik.",
    range: [1.05, 1.15],
  },
];

function formatPaceRange(range) {
  if (!range) return "–";
  const [slow, fast] = range;
  return `${paceFmt(fast)}–${paceFmt(slow)} min/km`;
}

export default function PerformancePage({ vdot, setVdot }) {
  const [km, setKm] = useState(5);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(22);
  const [seconds, setSeconds] = useState(30);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const value = vdotCalc(km, totalSeconds);
  const valid =
    Number.isFinite(value) &&
    value > 0 &&
    hours >= 0 &&
    minutes >= 0 &&
    minutes <= 59 &&
    seconds >= 0 &&
    seconds <= 59 &&
    totalSeconds > 0;
  const score = valid ? value : vdot;
  const racePace = valid ? totalSeconds / km : null;
  const speed = racePace ? (3600 / racePace).toFixed(1).replace(".", ",") : "–";

  function resetResult() {
    setKm(5);
    setHours(0);
    setMinutes(22);
    setSeconds(30);
  }

  return (
    <>
      <PageTitle
        eyebrow="PERFORMANCE"
        title="VDOT-beregner"
        description="Brug et nyligt løbsresultat til at beregne din aktuelle form og finde vejledende træningstempi."
      />

      <div className="vdot-notes">
        <section>
          <h2>Hvad kan resultatet bruges til?</h2>
          <p>
            VDOT giver et praktisk estimat af din aktuelle løbeform og kan
            hjælpe med at vælge passende tempo til træning.
          </p>
        </section>
        <section>
          <h2>Hvad kan den ikke bruges til?</h2>
          <p>
            Det er et estimat — ikke en garanti for en bestemt sluttid. Brug et
            nyligt resultat fra en sammenlignelig distance.
          </p>
        </section>
      </div>

      <div className="vdot-top-grid">
        <Card className="vdot-input-card">
          <div className="vdot-section-heading">
            <span className="vdot-heading-icon"><Clock3 size={17} /></span>
            <div>
              <h2>Dit løbsresultat</h2>
              <p>Angiv din bedste tid fra en nylig distance.</p>
            </div>
          </div>
          <label>
            Distance
            <select value={km} onChange={(event) => setKm(Number(event.target.value))}>
              {distances.map(([name, distance]) => (
                <option value={distance} key={distance}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="vdot-time-fields">
            <legend>Resultat</legend>
            <label>
              Timer
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(event) => setHours(Number(event.target.value))}
              />
            </label>
            <label>
              Minutter
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
              />
            </label>
            <label>
              Sekunder
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(event) => setSeconds(Number(event.target.value))}
              />
            </label>
          </fieldset>
          {!valid && (
            <p className="vdot-error" role="alert">
              Indtast en gyldig tid. Minutter og sekunder skal være mellem 0 og
              59.
            </p>
          )}
          <div className="vdot-input-actions">
            <button
              className="primary"
              type="button"
              disabled={!valid}
              onClick={() => setVdot(value)}
            >
              Gem resultat
            </button>
            <button
              className="vdot-reset"
              type="button"
              onClick={resetResult}
              aria-label="Nulstil løbsresultat"
              title="Nulstil løbsresultat"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </Card>

        <section className="vdot-score-panel" aria-live="polite">
          <div className="vdot-score-label">DIN BEREGNEDE SCORE</div>
          <div className="vdot-score-value">
            {valid ? value.toFixed(1) : "–"}
            <span>VDOT</span>
          </div>
          <div className="vdot-score-note">
            <strong>{valid ? "Din form ud fra resultatet" : "Tjek din tid"}</strong>
            <p>
              {valid
                ? "Brug scoren som et udgangspunkt. Justér tempo efter dagsform og forhold."
                : "Indtast en gyldig løbstid for at beregne VDOT."}
            </p>
          </div>
          <div className="vdot-score-stats">
            <div>
              <small>Tempo på distancen</small>
              <strong>{racePace ? `${paceFmt(racePace)} min/km` : "–"}</strong>
            </div>
            <div>
              <small>Gennemsnitsfart</small>
              <strong>{speed} km/t</strong>
            </div>
            <div>
              <small>Gemt VDOT</small>
              <strong>{vdot.toFixed(1)}</strong>
            </div>
            <div>
              <small>Distance</small>
              <strong>{distances.find(([, distance]) => distance === km)?.[0]}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="vdot-section">
        <div className="vdot-section-heading">
          <span className="vdot-section-mark"><Trophy size={18} /></span>
          <div>
            <h2>Forventede konkurrencetider</h2>
            <p>
              Vejledende tider beregnet ud fra {valid ? value.toFixed(1) : vdot.toFixed(1)} VDOT.
            </p>
          </div>
        </div>
        <div className="vdot-predictions">
          {distances.map(([name, distance]) => (
            <article
              className={distance === km ? "selected" : ""}
              key={distance}
            >
              <small>{name}</small>
              <strong>{timeFmt(prediction(score, distance))}</strong>
              <span>{paceFmt(prediction(score, distance) / distance)} min/km</span>
              {distance === km && <b>DIT RESULTAT</b>}
            </article>
          ))}
        </div>
      </section>

      <section className="vdot-section vdot-training-paces">
        <h2>Dine vejledende træningstempi</h2>
        <p>
          Brug tempoerne som pejlemærker, og tilpas efter terræn, vejr og
          dagsform.
        </p>
        <div className="vdot-zone-list">
          {trainingZones.map((zone) => (
            <article className={`vdot-zone-row zone-${zone.zone.toLowerCase()}`} key={zone.zone}>
              <span className={`zone-symbol zone-${zone.zone.toLowerCase()}`}>
                {zone.zone}
              </span>
              <div>
                <h3>{zone.title}</h3>
                <p>{zone.description}</p>
              </div>
              <strong>
                {zone.zone === "M" && score > 0
                  ? `${paceFmt(prediction(score, 42.195) / 42.195)} min/km`
                  : formatPaceRange(vdotTrainingPaceRange(score, ...zone.range))}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <details className="vdot-method">
        <summary>Sådan læser du resultatet</summary>
        <p>
          VDOT sammenligner løbstid og distance for at anslå din nuværende
          løbeform. Konkurrencetiderne forudsætter tilsvarende træning og
          løbsforhold; de er ikke løfter om et kommende resultat.
        </p>
        <p>
          Træningstempoerne er brede vejledende intervaller. Følg altid
          klubbens konkrete pas, og sæt farten ned eller hold pause, hvis
          kroppen ikke føles klar.
        </p>
      </details>

      <p className="vdot-disclaimer">
        Beregningen er vejledende og tager ikke højde for individuelle forskelle,
        løbsforhold eller dagsform.
      </p>
    </>
  );
}
