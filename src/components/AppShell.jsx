import {
  Activity,
  BookOpen,
  CalendarDays,
  Calculator,
  Footprints,
  Menu,
  Trophy,
  X,
} from "lucide-react";
import { teams } from "../data/appData";
import "../styles/branding.css";
import "../styles/page-tabs.css";
import harlevLogo from "../assets/harlev-lob-motion.png";
const nav = [
  ["training", "Træning", Footprints],
  ["calendar", "Kalender", CalendarDays],
  ["race", "Race Center", Trophy],
  ["performance", "Performance", Activity],
  ["guides", "Guides", Calculator],
  ["tools", "Værktøjer", BookOpen],
];
export default function AppShell({
  page,
  setPage,
  calendarTeam,
  setCalendarTeam,
  menu,
  setMenu,
  children,
}) {
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
        </header>
        {children}
      </main>
    </div>
  );
}
