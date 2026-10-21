import { useState } from "react";
import AppShell from "./components/AppShell";
import WorkoutDetail from "./components/WorkoutDetail";
import TrainingPage from "./pages/TrainingPage";
import CalendarPage from "./pages/CalendarPage";
import RaceCenterPage from "./pages/RaceCenterPage";
import PerformancePage from "./pages/PerformancePage";
import GuidesPage from "./pages/GuidesPage";
import ToolsPage from "./pages/ToolsPage";
import { RaceProvider } from "./context/RaceContext";

function loadVdot() {
  const savedValue = window.localStorage.getItem("hlm_runhub_vdot");
  const value = Number(savedValue);
  return Number.isFinite(value) && value > 0
    ? { value, saved: true }
    : { value: 42, saved: false };
}

export default function App() {
  const [page, setPage] = useState("training"),
    [calendarTeam, setCalendarTeam] = useState("Hold 2"),
    [menu, setMenu] = useState(false),
    [detail, setDetail] = useState(false),
    [activeWorkout, setActiveWorkout] = useState(null),
    [vdotState, setVdotState] = useState(loadVdot);
  const vdot = vdotState.value;
  const saveVdot = (value) => {
    window.localStorage.setItem("hlm_runhub_vdot", String(value));
    setVdotState({ value, saved: true });
  };
  const openVdotCalculator = () => {
    setDetail(false);
    setPage("performance");
  };
  const openWorkout = (workout, team) => {
    setActiveWorkout(workout ? { workout, team } : null);
    setDetail(true);
  };
  const content =
    page === "training" ? (
      <TrainingPage
        openWorkout={openWorkout}
        calendarTeam={calendarTeam}
      />
    ) : page === "calendar" ? (
      <CalendarPage
        team={calendarTeam}
        openWorkout={openWorkout}
      />
    ) : page === "race" ? (
      <RaceCenterPage
        calendarTeam={calendarTeam}
        setCalendarTeam={setCalendarTeam}
      />
    ) : page === "performance" ? (
      <PerformancePage vdot={vdot} setVdot={saveVdot} />
    ) : page === "guides" ? (
      <GuidesPage />
    ) : (
      <ToolsPage />
    );
  return (
    <RaceProvider>
      <AppShell
        page={page}
        setPage={setPage}
        calendarTeam={calendarTeam}
        setCalendarTeam={setCalendarTeam}
        menu={menu}
        setMenu={setMenu}
      >
        {content}
      </AppShell>
      {detail && (
        <WorkoutDetail
          close={() => setDetail(false)}
          workout={activeWorkout?.workout}
          team={activeWorkout?.team}
          vdot={vdot}
          hasSavedVdot={vdotState.saved}
          openVdotCalculator={openVdotCalculator}
        />
      )}
    </RaceProvider>
  );
}
