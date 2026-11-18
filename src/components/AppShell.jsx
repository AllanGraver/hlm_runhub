import {
  Activity,
  Bot,
  BookOpen,
  CalendarDays,
  Calculator,
  Footprints,
  Menu,
  Moon,
  Sun,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";
import { teams } from "../data/appData";
import "../styles/branding.css";
import "../styles/page-tabs.css";
import "../styles/theme.css";
import harlevLogo from "../assets/harlev-lob-motion.png";
const nav = [
  ["training", "Træning", Footprints],
  ["calendar", "Kalender", CalendarDays],
  ["race", "Race Center", Trophy],
  ["performance", "Performance", Activity],
  ["guides", "Guides", Calculator],
  ["tools", "Værktøjer", BookOpen],
  ["coach", "AI Coach", Bot],
];
const THEME_STORAGE_KEY = "hlm_runhub_theme";

function getSavedTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

document.documentElement.dataset.theme = getSavedTheme();

export default function AppShell({
  page,
  setPage,
  calendarTeam,
  setCalendarTeam,
  menu,
  setMenu,
  children,
}) {
  const [lightTheme, setLightTheme] = useState(
    () => document.documentElement.dataset.theme === "light",
  );

  function toggleTheme() {
    const nextTheme = lightTheme ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Theme still changes for this session if storage is unavailable.
    }
    setLightTheme(nextTheme === "light");
  }

  return (
    <div>
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <a
            className="brand-logo"
            href="https://harlev-ik.dk/forside/l-b-motion.html"
            target="_blank"
            rel="noreferrer"
            aria-label="Harlev IK Løb & Motion — åbner klubbens hjemmeside"
          >
            <img src={harlevLogo} alt="Harlev Løb & Motion" />
          </a>
          <strong>Løb <span>Sammen</span></strong>
          <small>Harlev Løb &amp; Motion</small>
        </div>
        {nav.map(([id, label, Icon]) => (
          <button
            key={id}
            className={`nav ${page === id ? "active" : ""}`}
            onClick={() => {
              setPage(id);
              setMenu(false);
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </aside>
      <button className="mobile-menu" onClick={() => setMenu(!menu)}>
        {menu ? <X /> : <Menu />}
      </button>
      <main className="main">
        <header className="topbar">
          {page === "calendar" && (
            <label>
              KALENDER FOR
              <select
                value={calendarTeam}
                onChange={(e) => setCalendarTeam(e.target.value)}
              >
                {teams.slice(0, 3).map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          )}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={lightTheme ? "Skift til mørkt tema" : "Skift til lyst tema"}
            title={lightTheme ? "Skift til mørkt tema" : "Skift til lyst tema"}
          >
            {lightTheme ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
            <span>{lightTheme ? "Mørk" : "Lys"}</span>
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}
