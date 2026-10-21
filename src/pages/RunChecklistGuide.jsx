import { useState } from "react";
import {
  Check,
  CheckCheck,
  ClipboardCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import "../styles/run-checklist.css";

const checklistGroups = [
  {
    id: "race-kit",
    title: "Løbetøj fra top til tå",
    note: "Vælg velafprøvet udstyr, der passer til vejret.",
    items: [
      ["cap", "Kasket, visor, pandebånd eller buff efter behov"],
      ["sunglasses", "Solbriller, hvis jeg plejer at løbe med dem"],
      ["rain", "Let regnjakke eller poncho, hvis vejrudsigten kræver det"],
      ["top", "Velafprøvet løbetrøje eller singlet"],
      ["bra", "Sports-bh og løbeundertøj, som jeg kender"],
      ["sleeves", "Ærmer eller handsker, hvis det bliver køligt"],
      ["bottoms", "Løbeshorts eller tights, der ikke gnaver"],
      ["race-socks", "Løbestrømper — eventuelt et ekstra par"],
      ["compression", "Kompressionsstrømper eller sleeves, hvis jeg plejer at bruge dem"],
      ["race-shoes", "Velafprøvede løbesko"],
      ["bib", "Startnummer samt sikkerhedsnåle eller nummerbælte"],
    ],
  },
  {
    id: "accessories",
    title: "Tilbehør og energi",
    note: "Medbring kun det, du har planlagt at bruge.",
    items: [
      ["watch", "Løbeur og eventuel pulsmåler"],
      ["charging", "Ur, telefon og høretelefoner er opladet"],
      ["phone", "Telefon og løbebælte eller telefonholder, hvis jeg skal have den med"],
      ["headphones", "Høretelefoner, hvis jeg ønsker dem og løbet tillader det"],
      ["fuel", "Planlagte gels, chews eller anden energi"],
      ["electrolytes", "Elektrolytter eller sportsdrik, hvis det indgår i min plan"],
      ["bottle", "Flaske eller soft flask, hvis jeg selv skal bære væske"],
      ["chafe", "Anti-friktionscreme og eventuel brystvortebeskytter eller plaster"],
      ["sun", "Solcreme og læbepomade med SPF ved behov"],
      ["personal", "Nødvendig personlig medicin og eventuelle personlige hygiejneprodukter"],
    ],
  },
  {
    id: "start",
    title: "Til ventetiden ved start",
    note: "Gør ventetiden behagelig — og følg arrangørens regler.",
    items: [
      ["old-layer", "Et varmt ekstra lag, som jeg kan undvære ved start"],
      ["rain-start", "Poncho eller regnlag ved vådt vejr"],
      ["sit", "Noget at sidde på, hvis der er lang ventetid og det er tilladt"],
      ["spare-shoes", "Ekstra sokker eller sko, hvis det er vådt, og jeg har brug for dem"],
      ["start-water", "Vand eller planlagt energi frem mod start"],
    ],
  },
  {
    id: "drop-bag",
    title: "Taske til målområdet",
    note: "Tjek om arrangementet tilbyder taskedepot og hvilke regler der gælder.",
    items: [
      ["warm-after", "Varmt lag og rent skiftetøj"],
      ["shoes-after", "Rene sokker og behagelige sko"],
      ["hygiene", "Håndklæde og de toiletartikler, jeg får brug for"],
      ["bag-plastic", "Pose til vådt eller svedigt løbetøj"],
      ["post-fuel", "Vand og en velkendt snack til efter løbet"],
      ["payment", "Betalingskort eller lidt kontanter, hvis relevant"],
      ["charger", "Powerbank eller oplader, hvis jeg skal bruge telefonen bagefter"],
    ],
  },
  {
    id: "night-before",
    title: "Aftenen før løbet",
    note: "Få styr på det praktiske, så morgenen bliver roligere.",
    items: [
      ["kit-ready", "Løbetøjet er lagt frem, og startnummeret er klar"],
      ["fuel-ready", "Planlagt energi og eventuel taske er pakket"],
      ["weather-check", "Vejrudsigten er tjekket, og tøjvalget passer til forholdene"],
      ["breakfast", "Jeg ved, hvad jeg spiser og drikker før start"],
      ["travel", "Transport, startsted og tidspunkt er planlagt"],
      ["race-info", "Jeg har læst løbsinformation, regler og instruktioner"],
      ["supporters", "Eventuelle tilskuere ved, hvor og hvornår vi mødes"],
      ["alarm", "Vækkeuret er sat, og mine enheder er opladet"],
    ],
  },
];

const allItems = checklistGroups.flatMap((group) => group.items);

export default function RunChecklistGuide() {
  const [checkedItems, setCheckedItems] = useState([]);
  const progress = allItems.length
    ? Math.round((checkedItems.length / allItems.length) * 100)
    : 0;

  function toggleItem(itemId) {
    setCheckedItems((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  }

  function resetChecklist() {
    setCheckedItems([]);
  }

  function markAllChecked() {
    setCheckedItems(allItems.map(([id]) => id));
  }

  return (
    <div className="run-checklist">
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Har jeg styr på mit udstyr til løbsdagen?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Brug listen til at forberede et motionsløb eller en længere
            løbetur. Vælg de punkter, der passer til løbet, vejret og dine vaner.
          </p>
        </section>
      </div>

      <section className="checklist-hero">
        <span className="checklist-hero-icon"><ClipboardCheck size={20} /></span>
        <div>
          <small>HLM LØBEUNIVERSITET · HUSKELISTE</small>
          <h2>Klar til løbsdagen?</h2>
          <p>
            Gennemgå udstyret fra top til tå, og husk både ventetid før start
            og det, du gerne vil have efter målgang.
          </p>
        </div>
      </section>

      <section className="checklist-progress">
        <div className="checklist-progress-top">
          <div>
            <small>DIN KLARGØRING</small>
            <strong>{checkedItems.length} af {allItems.length} punkter tjekket</strong>
          </div>
          <span>{progress}%</span>
        </div>
        <div
          className="checklist-progress-track"
          role="progressbar"
          aria-label="Tjeklistens fremgang"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="checklist-actions">
          <button type="button" onClick={markAllChecked} disabled={progress === 100}>
            <CheckCheck size={14} /> Markér alle
          </button>
          <button type="button" onClick={resetChecklist} disabled={checkedItems.length === 0}>
            <RotateCcw size={13} /> Nulstil
          </button>
        </div>
      </section>

      <div className="checklist-groups">
        {checklistGroups.map((group) => {
          const completedInGroup = group.items.filter(([id]) =>
            checkedItems.includes(id),
          ).length;
          return (
            <section className="checklist-group" key={group.id}>
              <header>
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.note}</p>
                </div>
                <span>{completedInGroup}/{group.items.length}</span>
              </header>
              <div className="checklist-items">
                {group.items.map(([id, label]) => (
                  <label
                    className={checkedItems.includes(id) ? "is-checked" : ""}
                    key={id}
                  >
                    <input
                      type="checkbox"
                      checked={checkedItems.includes(id)}
                      onChange={() => toggleItem(id)}
                    />
                    <span className="checklist-custom-box" aria-hidden="true">
                      {checkedItems.includes(id) && <Check size={12} />}
                    </span>
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="checklist-reminder">
        <ShieldCheck size={15} />
        <span>
          <strong>Tilpas listen til løbet.</strong> Ikke alt er nødvendigt for
          alle løbere. Kontrollér regler for startnummer, startområde og
          taskedepot hos arrangøren, og brug kun energi og udstyr, du kender.
        </span>
      </p>

      <p className="checklist-source">
        Inspireret af{" "}
        <a
          href="https://therunningchannel.com/marathon-kit-check-list/"
          target="_blank"
          rel="noreferrer"
        >
          The Running Channel: Marathon Kit Checklist
        </a>
        .
      </p>
    </div>
  );
}
