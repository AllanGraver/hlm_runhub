import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import "../styles/run-checklist.css";

const raceTypes = ["5 km", "10 km", "Halvmaraton", "Maraton"];

const checklistGroups = [
  {
    id: "night-before",
    number: "01",
    shortTitle: "Dagen før",
    title: "Dagen før løbet",
    note: "Få styr på det praktiske, så morgenen bliver roligere.",
    items: [
      { id: "kit-ready", label: "Løbetøjet er lagt frem, og startnummeret er klar", priority: "required", races: raceTypes },
      { id: "weather-check", label: "Vejrudsigten er tjekket, og tøjvalget passer til forholdene", priority: "required", races: raceTypes },
      { id: "devices", label: "Løbeur, telefon og eventuelt høretelefoner er opladet", priority: "required", races: raceTypes },
      { id: "breakfast", label: "Jeg ved, hvad jeg spiser og drikker før start", priority: "required", races: raceTypes },
      { id: "travel", label: "Transport, startsted og tidspunkt er planlagt", priority: "required", races: raceTypes },
      { id: "race-info", label: "Jeg har læst løbsinformation, regler og instruktioner", priority: "required", races: raceTypes },
      { id: "alarm", label: "Vækkeuret er sat", priority: "required", races: raceTypes },
      { id: "fuel-ready", label: "Planlagt energi er pakket og klar", priority: "required", races: ["Halvmaraton", "Maraton"] },
      { id: "dropbag-ready", label: "Eventuel taske til målområdet er pakket", priority: "optional", races: ["10 km", "Halvmaraton", "Maraton"] },
      { id: "supporters", label: "Tilskuere kender starttid og aftalt mødested efter løbet", priority: "optional", races: raceTypes },
    ],
  },
  {
    id: "race-morning",
    number: "02",
    shortTitle: "Race morning",
    title: "Inden du tager hjemmefra",
    note: "Lav et sidste hurtigt tjek af de ting, der er svære at erstatte.",
    items: [
      { id: "bib", label: "Startnummer samt sikkerhedsnåle eller nummerbælte", priority: "required", races: raceTypes },
      { id: "race-shoes", label: "Velafprøvede løbesko", priority: "required", races: raceTypes },
      { id: "race-kit", label: "Velafprøvet løbetøj, strømper og undertøj", priority: "required", races: raceTypes },
      { id: "watch", label: "Løbeur og eventuel pulsmåler", priority: "optional", races: raceTypes },
      { id: "phone", label: "Telefon og holder/bælte, hvis jeg løber med den", priority: "optional", races: raceTypes },
      { id: "medication", label: "Nødvendig personlig medicin", priority: "required", races: raceTypes },
      { id: "anti-chafe", label: "Anti-friktionscreme, tape eller plaster efter behov", priority: "optional", races: ["10 km", "Halvmaraton", "Maraton"] },
      { id: "sun", label: "Solcreme, kasket/visor og solbriller efter forholdene", priority: "optional", races: raceTypes },
      { id: "rain", label: "Regnjakke eller poncho, hvis vejrudsigten kræver det", priority: "optional", races: raceTypes },
      { id: "fuel", label: "Gels, chews eller anden planlagt energi", priority: "required", races: ["Halvmaraton", "Maraton"] },
      { id: "hydration", label: "Flaske, soft flask eller sportsdrik, hvis det indgår i planen", priority: "optional", races: ["10 km", "Halvmaraton", "Maraton"] },
    ],
  },
  {
    id: "start-area",
    number: "03",
    shortTitle: "Startområdet",
    title: "Ved startområdet",
    note: "Hold dig varm, rolig og klar til start uden at gøre ventetiden unødigt kompliceret.",
    items: [
      { id: "old-layer", label: "Varmt ekstra lag til ventetiden, hvis forholdene kræver det", priority: "optional", races: raceTypes },
      { id: "start-rain", label: "Poncho eller regnlag til startområdet ved vådt vejr", priority: "optional", races: raceTypes },
      { id: "start-water", label: "Vand og eventuel planlagt energi frem mod start", priority: "optional", races: ["10 km", "Halvmaraton", "Maraton"] },
      { id: "toilet", label: "Toiletbesøg er planlagt i god tid før start", priority: "required", races: raceTypes },
      { id: "warmup", label: "Opvarmning er tilpasset løbsdistancen og intensiteten", priority: "required", races: raceTypes },
      { id: "gps", label: "Løbeuret er klar, og GPS er fundet inden start", priority: "optional", races: raceTypes },
      { id: "start-zone", label: "Jeg ved, hvilken startboks eller startgruppe jeg skal stå i", priority: "required", races: raceTypes },
    ],
  },
  {
    id: "during",
    number: "04",
    shortTitle: "Under løbet",
    title: "Under løbet",
    note: "Hold planen enkel og brug kun strategi, energi og udstyr, du kender.",
    items: [
      { id: "pace-plan", label: "Jeg kender min plan for åbningstempo og indsats", priority: "required", races: raceTypes },
      { id: "fuel-plan", label: "Jeg ved, hvornår jeg tager min planlagte energi", priority: "required", races: ["Halvmaraton", "Maraton"] },
      { id: "drink-plan", label: "Jeg kender min plan for væske og eventuelle depoter", priority: "optional", races: ["10 km", "Halvmaraton", "Maraton"] },
      { id: "headphones", label: "Høretelefoner er tilladt og klar, hvis jeg ønsker at bruge dem", priority: "optional", races: raceTypes },
    ],
  },
  {
    id: "finish",
    number: "05",
    shortTitle: "Efter mål",
    title: "Efter målgang",
    note: "Gør det nemt at få tørt tøj, væske og det praktiske på plads.",
    items: [
      { id: "warm-after", label: "Varmt lag og rent skiftetøj", priority: "optional", races: ["10 km", "Halvmaraton", "Maraton"] },
      { id: "socks-after", label: "Tørre strømper og behagelige sko", priority: "optional", races: ["Halvmaraton", "Maraton"] },
      { id: "wet-bag", label: "Pose til vådt eller svedigt løbetøj", priority: "optional", races: ["Halvmaraton", "Maraton"] },
      { id: "post-fuel", label: "Plan for vand og en velkendt snack efter løbet", priority: "optional", races: raceTypes },
      { id: "hygiene", label: "Håndklæde, vådservietter eller toiletartikler efter behov", priority: "optional", races: ["Halvmaraton", "Maraton"] },
      { id: "first-aid", label: "Plaster eller andre simple førstehjælpsartikler efter behov", priority: "optional", races: ["Halvmaraton", "Maraton"] },
      { id: "payment", label: "Betalingskort eller anden betalingsmulighed", priority: "optional", races: raceTypes },
      { id: "charger", label: "Powerbank eller oplader, hvis telefonen skal bruges bagefter", priority: "optional", races: ["Halvmaraton", "Maraton"] },
      { id: "meet-point", label: "Aftalt mødested med eventuelle tilskuere", priority: "optional", races: raceTypes },
    ],
  },
];

export default function RunChecklistGuide() {
  const [raceType, setRaceType] = useState("Halvmaraton");
  const [checkedItems, setCheckedItems] = useState([]);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [warmupTime, setWarmupTime] = useState("08:25");

  const visibleGroups = useMemo(
    () => checklistGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.races.includes(raceType)),
    })).filter((group) => group.items.length),
    [raceType],
  );

  const visibleItems = visibleGroups.flatMap((group) => group.items);
  const requiredItems = visibleItems.filter((item) => item.priority === "required");
  const optionalItems = visibleItems.filter((item) => item.priority === "optional");
  const requiredChecked = requiredItems.filter((item) => checkedItems.includes(item.id)).length;
  const optionalChecked = optionalItems.filter((item) => checkedItems.includes(item.id)).length;
  const missingRequired = requiredItems.filter((item) => !checkedItems.includes(item.id));
  const progress = requiredItems.length ? Math.round((requiredChecked / requiredItems.length) * 100) : 100;

  function toggleItem(itemId) {
    setCheckedItems((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
  }

  function resetChecklist() { setCheckedItems([]); }
  function markRequiredChecked() {
    setCheckedItems((current) => [...new Set([...current, ...requiredItems.map((item) => item.id)])]);
  }
  function scrollToGroup(id) {
    document.getElementById(`checklist-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="run-checklist">
      <div className="tools-intro">
        <section><small>GØR LØBSDAGEN ENKLERE</small><h2>Har jeg styr på det vigtigste til løbsdagen?</h2></section>
        <section><small>HVAD KAN JEG BRUGE DET TIL?</small><p>Vælg distance, gennemgå de vigtigste punkter i rækkefølge, og brug de valgfrie punkter efter vejr, arrangement og egne vaner.</p></section>
      </div>

      <section className="checklist-hero">
        <span className="checklist-hero-icon"><ClipboardCheck size={20} /></span>
        <div><small>HLM LØBEUNIVERSITET · RACE DAY CENTER</small><h2>Klar til løbsdagen?</h2><p>Fra dagen før til målområdet: fokusér først på det nødvendige, og tilpas derefter resten til dit løb.</p></div>
      </section>

      <section className="checklist-race-selector">
        <div><small>TILPAS DIN CHECKLISTE</small><h2>Hvilket løb skal du løbe?</h2></div>
        <div className="checklist-race-buttons" role="group" aria-label="Vælg løbsdistance">
          {raceTypes.map((type) => <button type="button" key={type} className={raceType === type ? "active" : ""} aria-pressed={raceType === type} onClick={() => setRaceType(type)}>{type}</button>)}
        </div>
      </section>

      <section className="checklist-progress">
        <div className="checklist-progress-top">
          <div><small>DIN STATUS · {raceType.toUpperCase()}</small><strong>{progress}% klar på de vigtige punkter</strong></div>
          <span>{progress}%</span>
        </div>
        <div className="checklist-progress-track" role="progressbar" aria-label="Vigtige punkter klargjort" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
        <div className="checklist-status-grid">
          <article><small>VIGTIGT</small><strong>{requiredChecked}/{requiredItems.length}</strong><span>klargjort</span></article>
          <article><small>EFTER BEHOV</small><strong>{optionalChecked}/{optionalItems.length}</strong><span>valgfrit</span></article>
          <article className={missingRequired.length ? "has-warning" : "is-ready"}><small>MANGLER</small><strong>{missingRequired.length}</strong><span>vigtige punkter</span></article>
        </div>
        {missingRequired.length > 0 && (
          <div className="checklist-missing">
            <AlertTriangle size={16} />
            <span><strong>Det vigtigste, der mangler:</strong> {missingRequired.slice(0, 3).map((item) => item.label).join(" · ")}{missingRequired.length > 3 ? ` · +${missingRequired.length - 3} mere` : ""}</span>
            <button type="button" onClick={() => setShowMissingOnly(true)}>Vis manglende</button>
          </div>
        )}
        <div className="checklist-actions">
          <button type="button" onClick={markRequiredChecked} disabled={requiredChecked === requiredItems.length}><CheckCheck size={14} /> Markér vigtige</button>
          <button type="button" onClick={() => setShowMissingOnly((value) => !value)}>{showMissingOnly ? "Vis alle" : "Kun manglende"}</button>
          <button type="button" onClick={resetChecklist} disabled={checkedItems.length === 0}><RotateCcw size={13} /> Nulstil</button>
        </div>
      </section>

      <nav className="checklist-navigation" aria-label="Navigation i tjeklisten">
        <div><small>GÅ DIREKTE TIL</small><strong>Løbsdagen</strong></div>
        {visibleGroups.map((group) => <button type="button" key={group.id} onClick={() => scrollToGroup(group.id)}><span>{group.number}</span>{group.shortTitle}</button>)}
      </nav>

      <section className="checklist-timeline">
        <div className="checklist-section-heading"><div><small>RACE MORNING</small><h2>Din tidsplan</h2><p>Brug felterne som en enkel huskeseddel til de vigtigste tidspunkter.</p></div><Clock3 size={18} /></div>
        <div className="checklist-time-grid">
          <label>Ankomst til start<input type="time" value={arrivalTime} onChange={(event) => setArrivalTime(event.target.value)} /></label>
          <label>Opvarmning<input type="time" value={warmupTime} onChange={(event) => setWarmupTime(event.target.value)} /></label>
          <label>Start<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
        </div>
      </section>

      <div className="checklist-groups" aria-live="polite">
        {visibleGroups.map((group) => {
          const displayedItems = showMissingOnly ? group.items.filter((item) => !checkedItems.includes(item.id)) : group.items;
          const completedInGroup = group.items.filter((item) => checkedItems.includes(item.id)).length;
          if (!displayedItems.length && showMissingOnly) return null;
          return (
            <section className="checklist-group" id={`checklist-${group.id}`} key={group.id}>
              <header><div className="checklist-group-title"><span>{group.number}</span><div><h3>{group.title}</h3><p>{group.note}</p></div></div><span>{completedInGroup}/{group.items.length}</span></header>
              <div className="checklist-items">
                {displayedItems.map((item) => (
                  <label className={checkedItems.includes(item.id) ? "is-checked" : ""} key={item.id}>
                    <input type="checkbox" checked={checkedItems.includes(item.id)} onChange={() => toggleItem(item.id)} />
                    <span className="checklist-custom-box" aria-hidden="true">{checkedItems.includes(item.id) && <Check size={12} />}</span>
                    <span className="checklist-item-copy">{item.label}<small className={`checklist-priority ${item.priority}`}>{item.priority === "required" ? "Vigtigt" : "Efter behov"}</small></span>
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="checklist-reminder"><ShieldCheck size={15} /><span><strong>Tilpas listen til arrangementet.</strong> Kontrollér arrangørens egne regler for startnummer, høretelefoner, startområde, væske og bag drop. Brug velafprøvet udstyr og energi.</span></p>
      <p className="checklist-source">Inspireret af <a href="https://therunningchannel.com/marathon-kit-check-list/" target="_blank" rel="noreferrer">The Running Channel: Marathon Kit Checklist</a>.</p>
    </div>
  );
}
