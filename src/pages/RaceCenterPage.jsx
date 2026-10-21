import { useState } from "react";
import PageTitle from "../components/PageTitle";
import RaceSummary from "../components/RaceSummary";
import PacingPlan from "./PacingPlan";
import EnergyPlan from "./EnergyPlan";
import RaceGoalsPage from "./RaceGoalsPage";
import { useRace } from "../context/RaceContext";
import "../styles/race-center.css";
import "../styles/race-goals.css";

export default function RaceCenterPage({ calendarTeam, setCalendarTeam }) {
  const [tab, setTab] = useState("pacing");
  const { race, updateRace } = useRace();

  return (
    <>
      <PageTitle
        eyebrow="RACE CENTER"
        title={
          tab === "pacing"
            ? "Pacing Plan"
            : tab === "energy"
              ? "Energy Plan"
              : "Mine race-mål"
        }
        description={
          tab === "goals"
            ? "Gem dit konkurrencemål, og sammenlign din plan med klubbens."
            : undefined
        }
      />
      <div className="tabs race-center-tabs">
        <button
          className={tab === "pacing" ? "active" : ""}
          onClick={() => setTab("pacing")}
        >
          Pacing Plan
        </button>
        <button
          className={tab === "energy" ? "active" : ""}
          onClick={() => setTab("energy")}
        >
          Energy Plan
        </button>
        <button
          className={tab === "goals" ? "active" : ""}
          onClick={() => setTab("goals")}
        >
          Mine race-mål
        </button>
      </div>
      {tab === "pacing" && (
        <div className="pacing-notes">
          <section>
            <small>HVILKET RESULTAT FÅR JEG?</small>
            <h2>Hvordan fordeler jeg kræfterne i løbet?</h2>
          </section>
          <section>
            <small>HVAD KAN JEG BRUGE DET TIL?</small>
            <p>
              Du får hjælp til at vælge en realistisk åbning, holde den rigtige
              fart og disponere kræfterne hele vejen til mål.
            </p>
          </section>
        </div>
      )}
      {tab === "energy" && (
        <div className="pacing-notes">
          <section>
            <small>HVILKET RESULTAT FÅR JEG?</small>
            <h2>Hvor meget energi, væske og salt bør jeg indtage?</h2>
          </section>
          <section>
            <small>HVAD KAN JEG BRUGE DET TIL?</small>
            <p>
              Du får en konkret plan for indtag under længere løb, så du kan
              øve strategien i træningen og møde konkurrencen bedre forberedt.
            </p>
          </section>
        </div>
      )}
      {tab !== "goals" && <RaceSummary race={race} />}
      {tab === "pacing" ? (
        <PacingPlan race={race} updateRace={updateRace} />
      ) : tab === "energy" ? (
        <EnergyPlan race={race} updateRace={updateRace} />
      ) : (
        <RaceGoalsPage
          calendarTeam={calendarTeam}
          setCalendarTeam={setCalendarTeam}
        />
      )}
    </>
  );
}
