import { useState } from "react";
import { Activity, Gauge, Target } from "lucide-react";
import Card from "../components/Card";
import PageTitle from "../components/PageTitle";
import RecoveryCalculator from "./RecoveryCalculator";
import WeatherGuide from "./WeatherGuide";
import { PaceConverter } from "./ToolsPage";
import "../styles/guides.css";

const initialWorkout = {
  activity: "Løb",
  duration: 45,
  distance: 7,
  rpe: 5,
  weekDistance: 25,
  monthDistance: 90,
};

const guideCards = [
  ["Opvarmning", "Sådan bliver kroppen klar."],
  ["Intervaller", "Styr intensitet og pauser."],
  ["Halvmaraton", "Pacing og energi til 21,1 km."],
  ["Maraton", "Langsigtet løbsstrategi."],
  ["Energi", "Test produkter i træning."],
];

function getLoadStatus(points) {
  if (points < 150) {
    return {
      title: "Let belastning",
      message: "En let belastning. Giv kroppen plads til restitution.",
      className: "light",
    };
  }
  if (points < 300) {
    return {
      title: "Moderat belastning",
      message: "En normal træningsbelastning. Sørg for at følge op med passende restitution.",
      className: "moderate",
    };
  }
  return {
    title: "Høj belastning",
    message: "Et hårdt pas. Planlæg restitution, og undgå at stable flere hårde pas tæt.",
    className: "high",
  };
}

function getVolumeStatus(ratio) {
  if (ratio === null) {
    return {
      title: "Mangler historik",
      message: "Indtast distance for de seneste 30 dage for at sammenligne mængden.",
    };
  }
  if (ratio < 0.8) {
    return {
      title: "Lavere end gennemsnittet",
      message: "Den seneste uge ligger under dit gennemsnit for den seneste måned.",
    };
  }
  if (ratio <= 1.3) {
    return {
      title: "Moderat stigning",
      message: "Mængden ligger tæt på dit seneste gennemsnit. Fortsæt gradvist.",
    };
  }
  return {
    title: "Stor stigning",
    message: "Ugens mængde er tydeligt højere end gennemsnittet. Overvej en roligere progression.",
  };
}

export default function GuidesPage() {
  const [activeCalculator, setActiveCalculator] = useState("load");
  const [workout, setWorkout] = useState(initialWorkout);
  const [result, setResult] = useState(null);
  const updateWorkout = (key, value) => {
    setWorkout((current) => ({ ...current, [key]: value }));
    setResult(null);
  };
  const points = workout.duration * workout.rpe;
  const status = getLoadStatus(points);
  const weeklyAverage = workout.monthDistance * 7 / 30;
  const volumeRatio = weeklyAverage > 0
    ? workout.weekDistance / weeklyAverage
    : null;
  const volumeStatus = getVolumeStatus(volumeRatio);
  const volumeIncrease = volumeRatio === null
    ? null
    : (volumeRatio - 1) * 100;

  function calculateLoad(event) {
    event.preventDefault();
    setResult({
      points,
      status,
      weekDistance: workout.weekDistance,
      monthDistance: workout.monthDistance,
      volumeRatio,
      volumeStatus,
      volumeIncrease,
      activity: workout.activity,
      duration: workout.duration,
      rpe: workout.rpe,
    });
  }

  const displayedResult = result;

  return (
    <>
      <PageTitle
        eyebrow="VIDEN"
        title="Guides"
        description="Værktøjer og korte forklaringer til træning og løbsforberedelse."
      />

      <div className="tabs guide-calculator-tabs" aria-label="Guideberegner">
        <button
          type="button"
          className={activeCalculator === "load" ? "active" : ""}
          aria-pressed={activeCalculator === "load"}
          onClick={() => setActiveCalculator("load")}
        >
          Træningsguide
        </button>
        <button
          type="button"
          className={activeCalculator === "recovery" ? "active" : ""}
          aria-pressed={activeCalculator === "recovery"}
          onClick={() => setActiveCalculator("recovery")}
        >
          Restitutionsguide
        </button>
        <button
          type="button"
          className={activeCalculator === "weather" ? "active" : ""}
          aria-pressed={activeCalculator === "weather"}
          onClick={() => setActiveCalculator("weather")}
        >
          Vejrguide
        </button>
        <button
          type="button"
          className={activeCalculator === "pace" ? "active" : ""}
          aria-pressed={activeCalculator === "pace"}
          onClick={() => setActiveCalculator("pace")}
        >
          Pace guide
        </button>
      </div>

      <div className="guide-calculator-content" hidden={activeCalculator !== "load"}>
          <div className="pacing-notes training-load-notes">
            <section>
              <small>HVILKET RESULTAT FÅR JEG?</small>
              <h2>Træner jeg for hårdt eller for lidt?</h2>
            </section>
            <section>
              <small>HVAD KAN JEG BRUGE DET TIL?</small>
              <p>
                Få et overblik over din samlede belastning, så du kan skabe
                progression uden at øge risikoen for overbelastning unødigt.
              </p>
            </section>
          </div>
          <div className="tool-grid training-load-grid">
        <Card className="training-load-form-card">
          <div className="training-load-heading">
            <span><Activity size={17} /></span>
            <div>
              <h2>Dit træningspas</h2>
              <p>Angiv hvor længe og hvor hårdt passet føltes.</p>
            </div>
          </div>
          <form onSubmit={calculateLoad}>
            <label>
              Aktivitet
              <select
                value={workout.activity}
                onChange={(event) => updateWorkout("activity", event.target.value)}
              >
                {["Løb", "Intervaller", "Lang tur", "Cykling", "Svømning", "Styrketræning", "Andet"].map((activity) => (
                  <option key={activity}>{activity}</option>
                ))}
              </select>
            </label>

            <div className="training-load-fields">
              <label>
                Varighed (min)
                <input
                  type="number"
                  min="1"
                  value={workout.duration}
                  onChange={(event) => updateWorkout("duration", Math.max(1, Number(event.target.value)))}
                />
              </label>
              <label>
                Distance (km)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={workout.distance}
                  onChange={(event) => updateWorkout("distance", Math.max(0, Number(event.target.value)))}
                />
              </label>
            </div>

            <label className="training-rpe-control">
              Oplevet anstrengelse (RPE): {workout.rpe}/10
              <input
                type="range"
                min="1"
                max="10"
                value={workout.rpe}
                onChange={(event) => updateWorkout("rpe", Number(event.target.value))}
              />
              <span><small>Meget let</small><small>Maksimal indsats</small></span>
            </label>

            <div className="training-rpe-hint">
              RPE er din egen vurdering af, hvor hårdt passet føltes. En rolig tur
              kan være 2–4, et hårdt intervalpas 7–9.
            </div>

            <div className="training-load-volume">
              <div>
                <h3>Træningsmængde</h3>
                <p>Indtast løbemængde for at sammenligne de seneste perioder.</p>
              </div>
              <div className="training-load-fields">
                <label>
                  Seneste 7 dage (km)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={workout.weekDistance}
                    onChange={(event) => updateWorkout("weekDistance", Math.max(0, Number(event.target.value)))}
                  />
                </label>
                <label>
                  Seneste 30 dage (km)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={workout.monthDistance}
                    onChange={(event) => updateWorkout("monthDistance", Math.max(0, Number(event.target.value)))}
                  />
                </label>
              </div>
            </div>

            <button className="primary full" type="submit">
              Beregn belastning
            </button>
          </form>
        </Card>

        <section className="training-load-result" aria-live="polite">
          <small className="training-load-result-label">DIN TRÆNINGSBELASTNING</small>
          {displayedResult ? (
            <>
              <div className="training-load-score">
                {displayedResult.points}
                <span>point</span>
              </div>
              <div className={`training-load-status ${displayedResult.status.className}`}>
                <strong>{displayedResult.status.title}</strong>
                <p>{displayedResult.status.message}</p>
              </div>
              <div className="training-load-summary">
                <div><small>Aktivitet</small><strong>{displayedResult.activity}</strong></div>
                <div><small>Tid</small><strong>{displayedResult.duration} min</strong></div>
                <div><small>RPE</small><strong>{displayedResult.rpe}/10</strong></div>
              </div>
              <div className="training-volume-result">
                <div className="training-volume-title">
                  <Target size={17} />
                  <strong>Din træningsmængde</strong>
                </div>
                <p>
                  {displayedResult.weekDistance} km de seneste 7 dage ·{" "}
                  {displayedResult.monthDistance} km de seneste 30 dage
                </p>
                <strong className="training-volume-status">{displayedResult.volumeStatus.title}</strong>
                <p>
                  {displayedResult.volumeRatio === null
                    ? displayedResult.volumeStatus.message
                    : `${displayedResult.volumeRatio.toFixed(2).replace(".", ",")}× af dit gennemsnitlige ugevolumen de seneste 30 dage (${displayedResult.volumeIncrease >= 0 ? "+" : ""}${Math.round(displayedResult.volumeIncrease)}%).`}
                </p>
                <small>
                  {displayedResult.volumeStatus.message} Sammenligningen er
                  vejledende og bygger på de tal, du har indtastet.
                </small>
              </div>
            </>
          ) : (
            <div className="training-load-empty">
              <Gauge size={25} />
              <strong>Klar til at beregne</strong>
              <p>
                Udfyld træningspasset, og beregn belastningspoint og
                træningsmængde.
              </p>
            </div>
          )}
        </section>
          </div>

          <section className="training-load-how">
            <h2>Sådan bruger du resultatet</h2>
            <p>
              Belastningspoint beregnes som varighed ganget med oplevet anstrengelse
              (RPE). Brug tallet til at sammenligne dine egne pas over tid. Et enkelt
              højt tal er ikke et problem, men flere hårde pas i træk kræver ekstra
              restitution.
            </p>
            <div>
              <article><strong>Under 150</strong><p>Let pas eller restitution.</p></article>
              <article><strong>150–299</strong><p>Moderat, normal træning.</p></article>
              <article><strong>300+</strong><p>Hårdt pas, planlæg hvile.</p></article>
            </div>
          </section>

          <p className="training-load-disclaimer">
            <strong>Bemærk:</strong> Beregningen er vejledende og må ikke stå alene.
            Tilpas træningen efter erfaring, dagsform, ubehag og råd.
          </p>
      </div>
      <div className="guide-calculator-content" hidden={activeCalculator !== "recovery"}>
        <RecoveryCalculator />
      </div>
      {activeCalculator === "weather" && <WeatherGuide />}
      {activeCalculator === "pace" && <PaceConverter />}

      {activeCalculator !== "weather" && activeCalculator !== "pace" && (
        <section className="guide-library">
          <h2>Flere guides</h2>
          <div className="cards">
            {guideCards.map(([title, description]) => (
              <Card key={title}><h2>{title}</h2><p>{description}</p></Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
