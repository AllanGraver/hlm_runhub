import { useMemo, useState } from "react";
import {
  Check,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSun,
  Clock3,
  Droplets,
  LocateFixed,
  MapPin,
  Search,
  Shirt,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";

const weatherDescriptions = {
  0: ["Klart", Sun], 1: ["Næsten klart", Sun], 2: ["Letskyet", CloudSun],
  3: ["Overskyet", Cloud], 45: ["Tåge", Cloud], 48: ["Diset", Cloud],
  51: ["Let støvregn", CloudDrizzle], 53: ["Støvregn", CloudDrizzle],
  55: ["Kraftig støvregn", CloudDrizzle], 56: ["Underafkølet støvregn", CloudDrizzle],
  57: ["Kraftig underafkølet støvregn", CloudDrizzle], 61: ["Let regn", CloudRain],
  63: ["Regn", CloudRain], 65: ["Kraftig regn", CloudRain],
  66: ["Underafkølet regn", CloudRain], 67: ["Kraftig underafkølet regn", CloudRain],
  71: ["Let sne", Cloud], 73: ["Sne", Cloud], 75: ["Kraftig sne", Cloud],
  77: ["Snekorn", Cloud], 80: ["Regnbyger", CloudRain], 81: ["Byger", CloudRain],
  82: ["Kraftige byger", CloudRain], 85: ["Snebyger", Cloud],
  86: ["Kraftige snebyger", Cloud], 95: ["Tordenvejr", CloudRain],
  96: ["Torden og hagl", CloudRain], 99: ["Kraftigt tordenvejr", CloudRain],
};

const workoutTypes = ["Rolig tur", "Lang tur", "Tempo", "Intervaller", "Løb"];
const temperaturePreferences = [
  ["cold", "Fryser let"], ["normal", "Normal"], ["warm", "Får hurtigt varmt"],
];
const durations = [30, 45, 60, 90, 120];

function describeWeather(code) {
  return weatherDescriptions[code] ?? ["Ukendt vejr", Cloud];
}

function isRain(code) {
  return (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
}
function isSnow(code) {
  return (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
}
function isThunder(code) { return code >= 95; }

function getRunningOutfit({
  apparentTemperature,
  windSpeed,
  rainProbability,
  uvIndex,
  weatherCode,
  workoutType,
  temperaturePreference,
  duration,
}) {
  const personalAdjustment = { cold: -3, normal: 0, warm: 3 }[temperaturePreference] ?? 0;
  const workoutAdjustment = {
    "Rolig tur": 0, "Lang tur": 1, Tempo: 2, Intervaller: 3, Løb: 3,
  }[workoutType] ?? 0;
  const clothingTemperature = apparentTemperature + personalAdjustment + workoutAdjustment;
  const rainy = rainProbability >= 50 || isRain(weatherCode);
  const snowy = isSnow(weatherCode);
  const windy = windSpeed >= 20;
  const veryWindy = windSpeed >= 30;

  let title = "Mildt løbevejr";
  let comfort = "Gode forhold";
  let head = "Intet nødvendigt";
  let upperBody = "Kortærmet teknisk T-shirt";
  let lowerBody = "Shorts";
  let hands = "Intet nødvendigt";
  let feet = "Tekniske løbestrømper og velafprøvede sko";
  let baseLayer = "Kortærmet teknisk T-shirt";
  let warmLayer = "Ikke nødvendigt";

  if (clothingTemperature >= 25) {
    title = "Varmt løbevejr";
    head = "Kasket eller visor";
    upperBody = "Let singlet eller meget let T-shirt";
    lowerBody = "Lette shorts";
    comfort = "Varmt";
  } else if (clothingTemperature >= 18) {
    title = "Lunt løbevejr";
    head = uvIndex >= 3 ? "Kasket eller visor efter behov" : "Intet nødvendigt";
    upperBody = "Kortærmet teknisk T-shirt";
    lowerBody = "Shorts";
  } else if (clothingTemperature >= 12) {
    title = "Mildt løbevejr";
    upperBody = "Kortærmet T-shirt eller tynd langærmet trøje";
    lowerBody = "Shorts eller lette tights";
    baseLayer = "Kortærmet teknisk T-shirt";
  } else if (clothingTemperature >= 7) {
    title = "Køligt løbevejr";
    head = "Tyndt pandebånd efter behov";
    upperBody = "Tynd langærmet teknisk trøje";
    lowerBody = "Lette lange tights";
    hands = "Tynde handsker efter behov";
    baseLayer = "Tynd langærmet teknisk trøje";
  } else if (clothingTemperature >= 1) {
    title = "Koldt løbevejr";
    head = "Pandebånd eller tynd hue";
    upperBody = "Svedtransporterende baselayer og let mellemlag";
    lowerBody = "Lange tights";
    hands = "Tynde løbehandsker";
    baseLayer = "Svedtransporterende baselayer";
    warmLayer = "Let isolerende mellemlag";
    comfort = "Kræver tilpasning";
  } else {
    title = "Meget koldt løbevejr";
    head = "Varm hue eller pandebånd og halsedisse";
    upperBody = "Baselayer og isolerende mellemlag";
    lowerBody = "Varme eller vindtætte tights";
    hands = "Varme løbehandsker";
    feet = "Varme løbestrømper og sko med godt greb";
    baseLayer = "Varmt svedtransporterende baselayer";
    warmLayer = "Isolerende mellemlag";
    comfort = "Kræver ekstra omtanke";
  }

  let protectionLayer = "Ikke nødvendigt";
  if (veryWindy) protectionLayer = "Let vindjakke";
  else if (windy) protectionLayer = "Let vindvest eller vindafvisende front";
  if (rainy) protectionLayer = clothingTemperature <= 7 ? "Let vandafvisende løbejakke" : "Meget let regnskal efter behov";
  if (snowy) protectionLayer = "Vind- og vandafvisende yderlag";

  const reasons = [
    { label: "Temperatur", text: `Føles som ${Math.round(apparentTemperature)} °C. Din personlige og træningsmæssige justering giver en påklædningstemperatur omkring ${Math.round(clothingTemperature)} °C.` },
    { label: "Vind", text: veryWindy ? `${Math.round(windSpeed)} km/t gør et vindafvisende yderlag vigtigt.` : windy ? `${Math.round(windSpeed)} km/t gør let vindbeskyttelse relevant.` : `${Math.round(windSpeed)} km/t kræver normalt ikke et særligt vindlag.` },
    { label: "Regn", text: rainy ? `${Math.round(rainProbability)} % regnrisiko eller regn i prognosen. Vælg hurtigttørrende materialer og let beskyttelse.` : `${Math.round(rainProbability)} % regnrisiko. Ekstra regnbeskyttelse er normalt ikke nødvendig.` },
    { label: "Din træning", text: ["Tempo", "Intervaller", "Løb"].includes(workoutType) ? `${workoutType} giver høj varmeproduktion, så outfittet er justeret lettere.` : `${workoutType} giver moderat varmeproduktion.` },
  ];

  const protection = [];
  if (windy) protection.push("Vindbeskyttelse");
  if (rainy) protection.push("Regnbeskyttelse");
  if (uvIndex >= 3) protection.push("Solbeskyttelse");
  if (snowy) protection.push("Sko med godt greb");

  let alert = "Du må gerne være lidt kølig de første minutter. Justér lagene, hvis du hurtigt bliver varm.";
  if (duration >= 90) alert = "På en længere tur er justerbare lag vigtigere, fordi forholdene kan ændre sig undervejs.";
  if (isThunder(weatherCode)) {
    comfort = "Udsæt turen";
    alert = "Der er torden i prognosen. Udsæt turen eller vælg en sikker indendørs løsning.";
  }

  return {
    title, comfort, head, upperBody, lowerBody, hands, feet,
    baseLayer, warmLayer, protectionLayer, protection, reasons, alert,
    clothingTemperature,
  };
}

function formatHour(time) { return time.slice(11, 16); }
function formatUpdateTime(time) {
  return new Intl.DateTimeFormat("da-DK", { hour: "2-digit", minute: "2-digit" }).format(new Date(time));
}
function getLocationLabel(location) {
  return [location.name, location.admin1, location.country]
    .filter((part, index, parts) => part && parts.indexOf(part) === index).join(", ");
}
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
function getRunWindow(hourly, startTime, duration) {
  if (!hourly.length) return [];
  const start = timeToMinutes(startTime);
  const end = start + duration;
  return hourly.filter((item) => {
    const minute = timeToMinutes(formatHour(item.time));
    const adjusted = minute < start - 720 ? minute + 1440 : minute;
    return adjusted >= start && adjusted <= end;
  });
}

async function fetchWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude), longitude: String(location.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m",
    daily: "uv_index_max", forecast_days: "2", timezone: "auto",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error("Vejrdata kunne ikke hentes lige nu. Prøv igen om lidt.");
  const data = await response.json();
  if (data.error) throw new Error(data.reason || "Vejrdata kunne ikke hentes for denne placering.");
  if (!data.current || !data.hourly || !data.daily) throw new Error("Vejrudbyderen returnerede ikke de forventede vejrdata.");

  const currentHourIndex = Math.max(0, data.hourly.time.findIndex((time) => time.slice(0, 13) === data.current.time.slice(0, 13)));
  const hourly = data.hourly.time.slice(currentHourIndex, currentHourIndex + 18).map((time, offset) => {
    const index = currentHourIndex + offset;
    return {
      time,
      temperature: data.hourly.temperature_2m[index],
      apparentTemperature: data.hourly.apparent_temperature[index],
      precipitationProbability: data.hourly.precipitation_probability[index],
      weatherCode: data.hourly.weather_code[index],
      windSpeed: data.hourly.wind_speed_10m[index],
    };
  });

  return {
    current: data.current,
    hourly,
    uvIndex: data.daily.uv_index_max?.[0] ?? 0,
    currentPrecipitationProbability: data.hourly.precipitation_probability[currentHourIndex] ?? 0,
  };
}

export default function WeatherGuide() {
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workoutType, setWorkoutType] = useState("Rolig tur");
  const [temperaturePreference, setTemperaturePreference] = useState("normal");
  const [startTime, setStartTime] = useState(defaultTime);
  const [duration, setDuration] = useState(60);
  const [outfitShift, setOutfitShift] = useState(0);

  async function selectLocation(nextLocation) {
    setLoading(true); setError(""); setLocations([]); setLocation(nextLocation); setWeather(null);
    try { setWeather(await fetchWeather(nextLocation)); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Der opstod en fejl ved hentning af vejrdata."); setLocation(null); }
    finally { setLoading(false); }
  }

  async function searchLocation(event) {
    event.preventDefault();
    const search = query.trim();
    if (search.length < 2) { setError("Skriv mindst to bogstaver for at søge efter en by."); return; }
    setLoading(true); setError(""); setLocations([]); setWeather(null);
    try {
      const params = new URLSearchParams({ name: search, count: "5", language: "da", format: "json" });
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
      if (!response.ok) throw new Error("Stedet kunne ikke søges frem. Prøv igen om lidt.");
      const data = await response.json();
      if (!data.results?.length) throw new Error("Vi fandt ingen steder med det navn. Prøv et andet bynavn.");
      if (data.results.length === 1) await selectLocation(data.results[0]);
      else { setLocations(data.results); setLoading(false); }
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Der opstod en fejl ved søgning efter stedet."); setLoading(false); }
  }

  function useCurrentLocation() {
    setError("");
    if (!navigator.geolocation) { setError("Din browser understøtter ikke positionsbestemmelse. Søg i stedet efter en by."); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => selectLocation({ name: "Din placering", latitude: coords.latitude, longitude: coords.longitude }),
      (positionError) => { setError(positionError.code === positionError.PERMISSION_DENIED ? "Adgang til din placering blev afvist. Tillad placering, eller søg efter en by." : "Din placering kunne ikke findes. Prøv igen, eller søg efter en by."); setLoading(false); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  function runNow() {
    const date = new Date();
    setStartTime(`${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`);
    setDuration(45); setWorkoutType("Rolig tur");
  }

  const runWindow = useMemo(() => weather ? getRunWindow(weather.hourly, startTime, duration) : [], [weather, startTime, duration]);
  const runWeather = useMemo(() => {
    if (!weather) return null;
    const source = runWindow.length ? runWindow : [{
      apparentTemperature: weather.current.apparent_temperature,
      windSpeed: weather.current.wind_speed_10m,
      precipitationProbability: weather.currentPrecipitationProbability,
      weatherCode: weather.current.weather_code,
      temperature: weather.current.temperature_2m,
    }];
    return {
      apparentTemperature: Math.min(...source.map((item) => item.apparentTemperature)),
      windSpeed: Math.max(...source.map((item) => item.windSpeed)),
      rainProbability: Math.max(...source.map((item) => item.precipitationProbability)),
      weatherCode: source.reduce((worst, item) => Math.max(worst, item.weatherCode), 0),
      minTemperature: Math.min(...source.map((item) => item.temperature)),
      maxTemperature: Math.max(...source.map((item) => item.temperature)),
    };
  }, [weather, runWindow]);

  const advice = runWeather ? getRunningOutfit({
    apparentTemperature: runWeather.apparentTemperature + outfitShift,
    windSpeed: runWeather.windSpeed,
    rainProbability: runWeather.rainProbability,
    uvIndex: weather.uvIndex,
    weatherCode: runWeather.weatherCode,
    workoutType, temperaturePreference, duration,
  }) : null;

  const endMinutes = timeToMinutes(startTime) + duration;
  const endTime = `${String(Math.floor(endMinutes / 60) % 24).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  return (
    <div className="weather-guide">
      <div className="tools-intro">
        <section><small>DIT OUTFIT ER HOVEDSVARET</small><h2>Hvad skal jeg løbe i?</h2></section>
        <section><small>HVAD KAN JEG BRUGE DET TIL?</small><p>Få en personlig anbefaling baseret på vejret under selve turen, træningstype, varighed og hvor varmt du normalt får det.</p></section>
      </div>

      <section className="weather-toolbar">
        <div><small>HLM LØBEUNIVERSITET</small><h2>Løbevejr</h2></div>
        <form onSubmit={searchLocation} className="weather-search">
          <label className="weather-search-field"><MapPin size={16} /><input aria-label="Søg efter by" placeholder="Søg by eller sted" value={query} onChange={(event) => setQuery(event.target.value)} /><button type="submit" aria-label="Søg" disabled={loading}><Search size={16} /></button></label>
          <button className="weather-location-button" type="button" onClick={useCurrentLocation} disabled={loading} aria-label="Brug min aktuelle placering"><LocateFixed size={17} /></button>
        </form>
      </section>

      {locations.length > 0 && <div className="weather-location-results"><strong>Vælg det rigtige sted</strong>{locations.map((result) => <button type="button" key={`${result.id}-${result.latitude}`} onClick={() => selectLocation(result)}><MapPin size={15} />{getLocationLabel(result)}</button>)}</div>}
      {error && <p className="weather-error" role="alert">{error}</p>}
      {loading && <p className="weather-loading" role="status">Henter vejret…</p>}

      <section className="weather-run-settings">
        <div className="weather-setting-heading"><div><small>MIN LØBETUR</small><h2>Tilpas anbefalingen</h2></div><button type="button" onClick={runNow}><Clock3 size={14} /> Jeg løber nu</button></div>
        <div className="weather-workout-buttons" role="group" aria-label="Vælg træningstype">{workoutTypes.map((type) => <button type="button" key={type} className={workoutType === type ? "active" : ""} onClick={() => setWorkoutType(type)}>{type}</button>)}</div>
        <div className="weather-settings-grid">
          <label>Starttid<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label>
          <label>Varighed<select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>{durations.map((value) => <option key={value} value={value}>{value} min</option>)}</select></label>
        </div>
        <div className="weather-preference"><span>Hvordan oplever du temperaturen?</span><div>{temperaturePreferences.map(([value, label]) => <button type="button" key={value} className={temperaturePreference === value ? "active" : ""} onClick={() => setTemperaturePreference(value)}>{label}</button>)}</div></div>
      </section>

      {weather && advice ? (
        <>
          <section className="weather-outfit-summary">
            <div className="weather-outfit-heading"><div><small>ANBEFALET TIL DIN TUR</small><h2>{advice.title} · {workoutType.toLowerCase()}</h2><p>{getLocationLabel(location)} · {startTime}–{endTime}</p></div><span className={advice.comfort === "Udsæt turen" ? "danger" : ""}>{advice.comfort}</span></div>
            <div className="weather-outfit-grid">
              {[["Hoved", advice.head], ["Overkrop", advice.upperBody], ["Ben", advice.lowerBody], ["Hænder", advice.hands], ["Fødder", advice.feet]].map(([area, item]) => <article key={area}><small>{area}</small><strong>{item}</strong></article>)}
            </div>
            <div className="weather-outfit-adjust"><span>Hvordan lyder anbefalingen?</span><div><button type="button" onClick={() => setOutfitShift((value) => Math.max(-6, value - 2))}>🥶 For koldt</button><button type="button" className={outfitShift === 0 ? "active" : ""} onClick={() => setOutfitShift(0)}><Check size={13} /> Passer</button><button type="button" onClick={() => setOutfitShift((value) => Math.min(6, value + 2))}>🥵 For varmt</button></div></div>
          </section>

          <div className="weather-main-grid">
            <section className="weather-clothing-card">
              <small><Shirt size={14} /> LAG-PÅ-LAG</small><h2>Varme og beskyttelse</h2>
              <div className="weather-layer-list"><article><small>LAG 1 · BASIS</small><strong>{advice.baseLayer}</strong></article><article><small>LAG 2 · VARME</small><strong>{advice.warmLayer}</strong></article><article><small>LAG 3 · BESKYTTELSE</small><strong>{advice.protectionLayer}</strong></article></div>
              {advice.protection.length > 0 && <p className="weather-advice-note">Ekstra fokus: {advice.protection.join(" · ")}</p>}
              <p className="weather-avoid"><strong>Praktisk råd:</strong> {advice.alert}</p>
            </section>

            <section className="weather-reason-card">
              <small>HVORFOR DETTE OUTFIT?</small><h2>Sådan påvirker forholdene valget</h2>
              <div className="weather-reason-list">{advice.reasons.map((reason) => <article key={reason.label}><strong>{reason.label}</strong><p>{reason.text}</p></article>)}</div>
            </section>
          </div>

          <section className="weather-run-window">
            <div className="weather-hourly-heading"><div><small>VEJRET UNDER DIN TUR</small><h2>{startTime}–{endTime}</h2></div><span>{runWindow.length || 1} prognosepunkter</span></div>
            <div className="weather-run-window-stats">
              <article><small>Temperatur</small><strong>{Math.round(runWeather.minTemperature)}–{Math.round(runWeather.maxTemperature)} °C</strong></article>
              <article><small>Føles som, lavest</small><strong>{Math.round(runWeather.apparentTemperature)} °C</strong></article>
              <article><small>Maks. vind</small><strong>{Math.round(runWeather.windSpeed)} km/t</strong></article>
              <article><small>Maks. regnrisiko</small><strong>{Math.round(runWeather.rainProbability)} %</strong></article>
            </div>
            <div className="weather-hourly-list">{weather.hourly.slice(0, 8).map((hour) => { const [, HourIcon] = describeWeather(hour.weatherCode); const selected = runWindow.some((item) => item.time === hour.time); return <article className={selected ? "is-selected" : ""} key={hour.time}><small>{formatHour(hour.time)}</small><HourIcon size={17} /><strong>{Math.round(hour.temperature)}°</strong><span>{hour.precipitationProbability}% regn</span><span>{Math.round(hour.windSpeed)} km/t</span></article>; })}</div>
          </section>
        </>
      ) : (
        <section className="weather-empty-state"><CloudSun size={34} /><h2>Find vejret og få dit outfit</h2><p>Søg efter en by eller brug din aktuelle placering. Vælg derefter træningstype, starttid og varighed.</p></section>
      )}

      {weather && <div className="weather-secondary-grid"><section className="weather-overview-card"><h2>Aktuelt vejr</h2><div><span><Thermometer size={14} /> Temperatur</span><strong>{Math.round(weather.current.temperature_2m)} °C</strong></div><div><span><Droplets size={14} /> Luftfugtighed</span><strong>{weather.current.relative_humidity_2m}%</strong></div><div><span><Wind size={14} /> Vind</span><strong>{Math.round(weather.current.wind_speed_10m)} km/t</strong></div><div><span><Sun size={14} /> UV-indeks</span><strong>{weather.uvIndex}</strong></div><div><span><Clock3 size={14} /> Opdateret</span><strong>{formatUpdateTime(weather.current.time)}</strong></div></section></div>}

      <p className="weather-attribution">Vejrdata fra <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>. Anbefalingen er generel og bør tilpasses din erfaring, rute og lokale forhold.</p>
    </div>
  );
}
