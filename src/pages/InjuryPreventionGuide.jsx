import { Activity, AlertTriangle, Check, Shield, X } from "lucide-react";
import "../styles/injury-prevention.css";

const injuryGuides = [
  {
    name: "Løberknæ (IT-band-syndrom)",
    area: "KNÆ OG LÅR",
    summary: "Irritation på ydersiden af knæet, ofte i forbindelse med gentagen belastning.",
    signs: "Smerte på ydersiden af knæet, som kan komme under løb og blive tydeligere på længere ture eller ned ad bakke.",
    helps: "Skru midlertidigt ned for det, der fremkalder smerterne. Byg løbemængden op gradvist, og styrk hofte og ben.",
    avoid: "At løbe videre gennem tiltagende smerter eller hurtigt genoptage samme mængde og bakker.",
  },
  {
    name: "Skinnebenssmerter (shin splints)",
    area: "UNDERBEN",
    summary: "Belastningsrelaterede smerter langs skinnebenets inderside.",
    signs: "Ømhed langs et længere stykke af skinnebenet, typisk under eller efter løb.",
    helps: "Tilpas løbemængde og underlag, og øg træningen roligt. Styrk læg og fod, når det kan gøres uden smerteforværring.",
    avoid: "At ignorere stærke, meget lokale eller vedvarende smerter; de bør vurderes for andre årsager.",
  },
  {
    name: "Smerter omkring knæskallen",
    area: "KNÆ OG LÅR",
    summary: "Smerter omkring eller bag knæskallen, som kan påvirkes af gentagne knæbøjninger.",
    signs: "Diffus smerte ved løb, trapper, hugsiddende stilling eller efter længere tids siddende position.",
    helps: "Tilpas midlertidigt de aktiviteter, der provokerer, og genopbyg gradvist styrke i lår og hofte.",
    avoid: "At øge både løbemængde, fart og bakker på én gang.",
  },
  {
    name: "Plantarfascia-smerter",
    area: "FOD",
    summary: "Irritation i vævet under foden, ofte omkring hælens forreste del.",
    signs: "Smerter under hælen eller svangen, tit mest mærkbare ved de første skridt efter hvile.",
    helps: "Tilpas den samlede belastning, brug behageligt fodtøj, og genoptag løb gradvist efter symptomniveau.",
    avoid: "Pludseligt at øge løb på hårdt underlag eller fortsætte, hvis smerterne ændrer dit løbemønster.",
  },
  {
    name: "Achillessene-gener",
    area: "ANKEL OG LÆG",
    summary: "Belastningsgener i senen bag anklen, som ofte udvikler sig gradvist.",
    signs: "Stivhed eller ømhed i senen, særligt ved de første skridt eller i starten af løbeturen.",
    helps: "Justér belastningen, og få vejledning til gradvis genoptræning af læg og sene ved vedvarende gener.",
    avoid: "Pludselige spring i bakke-, sprint- eller hoptræning og at presse igennem forværrede smerter.",
  },
  {
    name: "Muskelkramper og fiberskader",
    area: "MUSKLER",
    summary: "Kramper er pludselige, ufrivillige sammentrækninger; fiberskader er en egentlig muskelskade.",
    signs: "Kramper føles som en pludselig stramning. En fiberskade kan give akut smerte, ømhed og nedsat kraft.",
    helps: "Stop eller sænk tempoet ved akut smerte. Genoptag træningen gradvist, når bevægelse føles normal.",
    avoid: "At behandle en pludselig, skarp smerte som en almindelig krampe og straks fortsætte hårdt.",
  },
  {
    name: "Overbelastning af hasemuskler",
    area: "BAGLÅR",
    summary: "Gener i musklerne på bagsiden af låret, ofte efter hurtig eller eksplosiv løbebelastning.",
    signs: "Smerte eller stramhed bag på låret, som kan forværres ved acceleration eller lange skridt.",
    helps: "Sænk belastningen ved smerter, og øg fart og styrke gradvist, når bevægelsen igen føles tryg.",
    avoid: "Maksimale spurter og aggressive stræk, mens området er akut ømt.",
  },
  {
    name: "Hoftebøjer-gener",
    area: "HOFTE",
    summary: "Smerter eller irritation foran hoften, hvor hoftebøjermusklerne arbejder.",
    signs: "Ømhed foran hoften, som kan mærkes ved knæløft, acceleration eller efter længere tids siddende stilling.",
    helps: "Tilpas fart og bakkeløb, og genopbyg hofte- og kropsstyrke gradvist uden at fremprovokere smerter.",
    avoid: "At tvinge hoften i yderstillinger eller fortsætte med tydelig smerte under løb.",
  },
  {
    name: "Stressreaktion og stressfraktur",
    area: "KNOGLE",
    summary: "En knoglereaktion på gentagen belastning, som kræver særlig opmærksomhed.",
    signs: "Ofte et afgrænset ømt punkt, der gør ondt ved belastning; smerterne kan med tiden også mærkes i hvile.",
    helps: "Stop løb ved mistanke, og få en sundhedsfaglig vurdering før du genoptager belastningen.",
    avoid: "At løbe på smerterne eller selv forsøge at træne skaden væk.",
  },
  {
    name: "Ankelinstabilitet og forstuvning",
    area: "ANKEL",
    summary: "Et vrid kan påvirke ledbånd og balance omkring anklen.",
    signs: "Smerte, hævelse eller usikkerhed efter et vrid; gentagne småvrid kan være tegn på nedsat stabilitet.",
    helps: "Efter et vrid: tilpas belastningen, og søg vurdering ved betydelig hævelse, stærke smerter eller problemer med at støtte.",
    avoid: "At vende tilbage til ujævne stier eller hurtige retningsskift, før anklen føles stabil.",
  },
];

function InjuryCard({ injury, index }) {
  return (
    <article className="injury-card">
      <header className="injury-card-heading">
        <div>
          <small>{injury.area} · {String(index + 1).padStart(2, "0")}</small>
          <h3>{injury.name}</h3>
        </div>
        <span className="injury-tag">VEJLEDNING</span>
      </header>
      <p className="injury-summary">{injury.summary}</p>
      <div className="injury-advice injury-signs">
        <strong><AlertTriangle size={13} /> Typiske tegn</strong>
        <p>{injury.signs}</p>
      </div>
      <div className="injury-advice injury-helps">
        <strong><Check size={13} /> Hvad kan hjælpe</strong>
        <p>{injury.helps}</p>
      </div>
      <div className="injury-advice injury-avoid">
        <strong><X size={13} /> Undgå</strong>
        <p>{injury.avoid}</p>
      </div>
    </article>
  );
}

export default function InjuryPreventionGuide() {
  return (
    <div className="injury-guide">
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Hvordan forebygger jeg de mest almindelige løbeskader?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Få et overblik over typiske løbeskader, almindelige tegn og
            fornuftige første skridt, hvis kroppen reagerer på træningen.
          </p>
        </section>
      </div>

      <section className="injury-hero">
        <div className="injury-hero-icon"><Shield size={20} /></div>
        <div>
          <small>HLM LØBEUNIVERSITET</small>
          <h2>Skadeforebyggelse</h2>
          <p>
            Den bedste forebyggelse handler om at tilpasse træningen til din
            erfaring og restitution. Brug denne guide som generel information —
            den kan ikke stille en diagnose eller erstatte individuel rådgivning.
          </p>
        </div>
      </section>

      <div className="injury-stats">
        <article><small>OVERSIGT</small><strong>10</strong><span>typiske skadeområder</span></article>
        <article><small>TRÆNING</small><strong>Gradvis</strong><span>øgning af belastning</span></article>
        <article><small>STYRKE</small><strong>Regelmæssig</strong><span>styrke og balance</span></article>
        <article><small>VIGTIGT</small><strong>Reagér</strong><span>på vedvarende smerter</span></article>
      </div>

      <section className="injury-howto">
        <h2><Activity size={15} /> Sådan bruger du guiden</h2>
        <div>
          <article><b><span>1</span> Lyt til kroppen</b><p>Vær opmærksom på smerter, der tiltager, ændrer dit løb eller bliver ved efter træningen.</p></article>
          <article><b><span>2</span> Tilpas belastningen</b><p>Skru ned, hvis kroppen reagerer. Øg distance, fart og bakker gradvist — ikke alt på én gang.</p></article>
          <article><b><span>3</span> Søg hjælp ved behov</b><p>Få en faglig vurdering ved stærke eller vedvarende smerter og ved mistanke om knogleskade.</p></article>
        </div>
      </section>

      <div className="injury-list-heading">
        <div>
          <small>VIDEN OG FOREBYGGELSE</small>
          <h2>10 almindelige skadeområder</h2>
        </div>
        <span>{injuryGuides.length} GUIDES</span>
      </div>

      <div className="injury-grid">
        {injuryGuides.map((injury, index) => (
          <InjuryCard key={injury.name} injury={injury} index={index} />
        ))}
      </div>

      <p className="injury-disclaimer">
        <strong>Søg faglig hjælp:</strong> Stop løb og få vurdering ved stærke
        eller tiltagende smerter, betydelig hævelse, problemer med at støtte,
        smerter i hvile eller mistanke om stressfraktur. Ved akut alvorlig skade
        skal du søge akut hjælp.
      </p>
    </div>
  );
}
