import { useState } from "react";
import { Activity, Clock3, HeartPulse } from "lucide-react";
import Card from "../components/Card";
import { recoveryEngine } from "../services/calculations";

const initialRecovery = {
  duration: 50,
  weeklyDistance: 35,
  intensity: "Rolig aerob tur",
  sleep: 7.5,
  age: 40,
  rpe: 3,
  weather: "Køligt eller mildt",
  elevation: 0,
  nextWorkout: "Rolig løbetur",
};

const intensityLoad = {
  "Rolig aerob tur": 0,
  "Moderat / tempotur": 3,
  "Intervaller": 6,
  "Konkurrence / maksimal indsats": 9,
};

const weatherLoad = {
  "Køligt eller mildt": 0,
  "Varmt": 1,
  "Meget varmt": 3,
};

export default function RecoveryCalculator() {
  const [workout, setWorkout] = useState(initialRecovery);
  const [result, setResult] = useState(null);
  const updateWorkout = (key, value) => {
    setWorkout((current) => ({ ...current, [key]: value }));
    setResult(null);
  };

  function calculateRecovery(event) {
    event.preventDefault();
    setResult({
      ...recoveryEngine(workout),
      workout: { ...workout },
    });
  }

  const recommendedHours = result
    ? result.workout.nextWorkout === "Hårdt pas"
      ? result.beforeHard
      : result.beforeEasy
    : null;

  return (
    <>
      <div className="pacing-notes training-load-notes">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Er jeg klar til næste hårde træningspas?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Få hjælp til at vurdere balancen mellem træning og hvile, så du kan
            vælge den rigtige intensitet på dagen.
          </p>
        </section>
      </div>

      <div className="tool-grid training-load-grid">
        <Card className="training-load-form-card">
          <div className="training-load-heading">
            <span><Activity size={17} /></span>
            <div>
              <h2>Dit løb</h2>
              <p>Fortæl om passet og din aktuelle dagsform.</p>
            </div>
          </div>
          <form onSubmit={calculateRecovery}>
            <div className="training-load-fields">
              <label>
                Varighed (min)
                <input
                  type="number"
                  min="1"
                  required
                  value={workout.duration}
                  onChange={(event) => updateWorkout("duration", Math.max(1, Number(event.target.value)))}
                />
              </label>
              <label>
                Ugentlig mængde (km)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={workout.weeklyDistance}
                  onChange={(event) => updateWorkout("weeklyDistance", Math.max(0, Number(event.target.value)))}
                />
              </label>
            </div>

            <label>
              Intensitet
              <select
                value={workout.intensity}
                onChange={(event) => updateWorkout("intensity", event.target.value)}
              >
                {Object.keys(intensityLoad).map((intensity) => (
                  <option key={intensity}>{intensity}</option>
                ))}
              </select>
            </label>

            <div className="training-load-fields recovery-fields">
              <label>
                Søvn i nat (timer)
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.1"
                  required
                  value={workout.sleep}
                  onChange={(event) => updateWorkout("sleep", Math.min(24, Math.max(0, Number(event.target.value))))}
                />
              </label>
              <label>
                Alder
                <input
                  type="number"
                  min="12"
                  max="100"
                  required
                  value={workout.age}
                  onChange={(event) => updateWorkout("age", Math.min(100, Math.max(12, Number(event.target.value))))}
                />
              </label>
            </div>

            <label className="training-rpe-control">
              Ømhed i benene: {workout.rpe}/10
              <input
                type="range"
                min="1"
                max="10"
                value={workout.rpe}
                onChange={(event) => updateWorkout("rpe", Number(event.target.value))}
              />
              <span><small>Frisk</small><small>Meget øm</small></span>
            </label>

            <div className="training-load-fields recovery-fields">
              <label>
                Varme og fugt
                <select
                  value={workout.weather}
                  onChange={(event) => updateWorkout("weather", event.target.value)}
                >
                  {Object.keys(weatherLoad).map((weather) => (
                    <option key={weather}>{weather}</option>
                  ))}
                </select>
              </label>
              <label>
                Højdemeter (m)
                <input
                  type="number"
                  min="0"
                  value={workout.elevation}
                  onChange={(event) => updateWorkout("elevation", Math.max(0, Number(event.target.value)))}
                />
              </label>
            </div>

            <label>
              Næste planlagte pas
              <select
                value={workout.nextWorkout}
                onChange={(event) => updateWorkout("nextWorkout", event.target.value)}
              >
                <option>Rolig løbetur</option>
                <option>Hårdt pas</option>
              </select>
            </label>

            <button className="primary full" type="submit">
              Beregn restitution
            </button>
          </form>
        </Card>

        <section className="training-load-result recovery-result" aria-live="polite">
          <small className="training-load-result-label">DIN ANBEFALING</small>
          {result ? (
            <>
              <h2 className="recovery-result-title">Restitutionsvindue</h2>
              <div className="recovery-window-values">
                <div><small>Før let løb</small><strong>{result.beforeEasy} timer</strong></div>
                <div><small>Før hårdt pas</small><strong>{result.beforeHard} timer</strong></div>
              </div>
              <div className="training-load-status moderate recovery-message">
                <strong><Clock3 size={15} /> Vent cirka {result.addedHours} timer ekstra før kvalitet</strong>
                <p>
                  {result.workout.nextWorkout === "Hårdt pas"
                    ? `Du har valgt et hårdt pas næste gang. Vent mindst cirka ${recommendedHours} timer, og mærk efter på dagen.`
                    : `Du har valgt en rolig tur næste gang. Vent mindst cirka ${recommendedHours} timer, og vælg roligt tempo.`}
                </p>
              </div>
              <div className="training-load-summary recovery-summary">
                <div><small>Intensitet</small><strong>{result.workout.intensity}</strong></div>
                <div><small>Søvn</small><strong>{result.workout.sleep} t</strong></div>
                <div><small>Ømhed</small><strong>{result.workout.rpe}/10</strong></div>
              </div>
            </>
          ) : (
            <div className="training-load-empty">
              <HeartPulse size={25} />
              <strong>Udfyld dit løb</strong>
              <p>
                Beregn et vejledende restitutionsvindue ud fra belastning,
                søvn og dagsform.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="training-load-how recovery-explanation">
        <h2>Hvad betyder resultatet?</h2>
        <p>
          Restitutionsvinduet er et groft skøn over, hvor længe du bør vente, før
          du udsætter kroppen for den næste betydelige træningsbelastning. Det er
          ikke et frikort til at løbe uanset dagsform.
        </p>
        <div>
          <article><strong>Let løb</strong><p>Bruges som pejlemærke for en rolig tur, hvis benene føles friske.</p></article>
          <article><strong>Hårdt pas</strong><p>Vent længere efter tempo, intervaller, bakker eller konkurrence.</p></article>
          <article><strong>Lyt til kroppen</strong><p>Ved skarp eller vedvarende smerte bør du stoppe og søge faglig rådgivning.</p></article>
        </div>
      </section>

      <p className="training-load-disclaimer">
        <strong>Bemærk:</strong> Beregningen er vejledende og ikke medicinsk
        rådgivning. Tilpas efter træning, dagsform, ubehag og råd fra fagpersoner.
      </p>
    </>
  );
}
