import { useState } from "react";
import {
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
  0: ["Klart", Sun],
  1: ["Næsten klart", Sun],
  2: ["Letskyet", CloudSun],
  3: ["Overskyet", Cloud],
  45: ["Tåge", Cloud],
  48: ["Diset", Cloud],
  51: ["Let støvregn", CloudDrizzle],
  53: ["Støvregn", CloudDrizzle],
  55: ["Kraftig støvregn", CloudDrizzle],
  56: ["Underafkølet støvregn", CloudDrizzle],
  57: ["Kraftig underafkølet støvregn", CloudDrizzle],
  61: ["Let regn", CloudRain],
  63: ["Regn", CloudRain],
  65: ["Kraftig regn", CloudRain],
  66: ["Underafkølet regn", CloudRain],
  67: ["Kraftig underafkølet regn", CloudRain],
  71: ["Let sne", Cloud],
  73: ["Sne", Cloud],
  75: ["Kraftig sne", Cloud],
  77: ["Snekorn", Cloud],
  80: ["Regnbyger", CloudRain],
  81: ["Byger", CloudRain],
  82: ["Kraftige byger", CloudRain],
  85: ["Snebyger", Cloud],
  86: ["Kraftige snebyger", Cloud],
  95: ["Tordenvejr", CloudRain],
  96: ["Torden og hagl", CloudRain],
  99: ["Kraftigt tordenvejr", CloudRain],
};

function describeWeather(code) {
  return weatherDescriptions[code] ?? ["Ukendt vejr", Cloud];
}

function getClothingAdvice(apparentTemperature, windSpeed, rainProbability, uvIndex, weatherCode) {
  let title;
  let clothing;
  let note;
  let avoid;

  if (apparentTemperature >= 25) {
    title = "Varmt løbevejr";
    clothing = [
      "Luftig singlet eller let teknisk T-shirt og shorts",
      "Kasket eller skygge til hovedet",
      "Solbeskyttelse på udsat hud",
    ];
    note = "Start roligt, søg skygge, og medbring væske på længere ture.";
    avoid = "Undgå at løbe hårdt midt på dagen eller tage for mange lag på.";
  } else if (apparentTemperature >= 18) {
    title = "Lunt løbevejr";
    clothing = [
      "Kortærmet teknisk T-shirt og shorts",
      "Let løbejakke kan være rar i blæst eller regn",
      "Kasket og solcreme ved stærk sol",
    ];
    note = "Du må gerne føle dig en smule kølig, når du starter.";
    avoid = "Undgå bomuld og en varm jakke, som holder på sveden.";
  } else if (apparentTemperature >= 12) {
    title = "Behageligt løbevejr";
    clothing = [
      "Kortærmet løbetrøje eller en tynd langærmet trøje",
      "Løbeshorts eller lette tights",
      "Tyndt ekstra lag, hvis du let bliver kold",
    ];
    note = "Vælg lag, du kan åbne eller tage af, når kroppen bliver varm.";
    avoid = "Undgå at klæde dig, så du allerede føler dig varm inden start.";
  } else if (apparentTemperature >= 7) {
    title = "Køligt løbevejr";
    clothing = [
      "Langærmet teknisk trøje eller let lag-på-lag",
      "Lange tights eller shorts med lette benvarmere",
      "Tynde handsker, hvis hænderne bliver kolde",
    ];
    note = "Et let, åndbart yderlag kan hjælpe i blæst.";
    avoid = "Undgå en tung, tæt jakke, der gør dig overophedet.";
  } else if (apparentTemperature >= 1) {
    title = "Koldt løbevejr";
    clothing = [
      "Svedtransporterende baselayer og isolerende mellemlag",
      "Lange tights samt handsker og pandebånd eller hue",
      "Vindafvisende lag på udsatte strækninger",
    ];
    note = "Hold dig varm før start, og brug reflekser i mørke.";
    avoid = "Undgå bomuld inderst og blottet hud i kold vind.";
  } else {
    title = "Meget koldt løbevejr";
    clothing = [
      "Flere lette lag med et vindafvisende yderlag",
      "Varme handsker, hue eller pandebånd og halsedisse",
      "Varme tights og sko med godt greb",
    ];
    note = "Vær ekstra opmærksom på glatte veje og vindafkøling.";
    avoid = "Undgå at løbe alene på glatte stræk eller ignorere følelsesløs hud.";
  }

  const weatherNotes = [];
  if (windSpeed >= 30) {
    weatherNotes.push("Blæst: vælg et vindafvisende lag, især på udsatte stræk.");
  } else if (windSpeed >= 20) {
    weatherNotes.push("Let blæst: et tyndt yderlag kan føles rart.");
  }
  if (
    rainProbability >= 50 ||
    weatherCode >= 51 && weatherCode <= 67 ||
    weatherCode >= 80 && weatherCode <= 82
  ) {
    weatherNotes.push("Regn: brug en let skal, kasket med skygge og tøj, der tørrer hurtigt.");
  }
  if (weatherCode >= 71 && weatherCode <= 77 || weatherCode >= 85 && weatherCode <= 86) {
    weatherNotes.push("Sne: vær opmærksom på glatte stier, og vælg sko med godt greb.");
  }
  if (uvIndex >= 6) {
    weatherNotes.push("Højt UV-indeks: brug solcreme, og søg skygge hvor det er muligt.");
  }
  if (weatherCode >= 95) {
    weatherNotes.push("Torden i prognosen: udsæt løbeturen, hvis der er risiko for torden undervejs.");
  }

  return { title, clothing, note, avoid, weatherNotes };
}

function formatHour(time) {
  return time.slice(11, 16);
}

function formatUpdateTime(time) {
  return new Intl.DateTimeFormat("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(time));
}

async function fetchWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m",
    daily: "uv_index_max",
    forecast_days: "2",
    timezone: "auto",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new Error("Vejrdata kunne ikke hentes lige nu. Prøv igen om lidt.");
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.reason || "Vejrdata kunne ikke hentes for denne placering.");
  }
  if (!data.current || !data.hourly || !data.daily) {
    throw new Error("Vejrudbyderen returnerede ikke de forventede vejrdata.");
  }

  const firstFutureHour = data.hourly.time.findIndex(
    (time) => time > data.current.time,
  );
  const hourly = data.hourly.time
    .slice(firstFutureHour < 0 ? 0 : firstFutureHour, (firstFutureHour < 0 ? 0 : firstFutureHour) + 6)
    .map((time, offset) => {
      const index = (firstFutureHour < 0 ? 0 : firstFutureHour) + offset;
      return {
        time,
        temperature: data.hourly.temperature_2m[index],
        precipitationProbability: data.hourly.precipitation_probability[index],
        weatherCode: data.hourly.weather_code[index],
        windSpeed: data.hourly.wind_speed_10m[index],
      };
    });
  const currentHourIndex = Math.max(
    0,
    data.hourly.time.findIndex((time) => time.slice(0, 13) === data.current.time.slice(0, 13)),
  );

  return {
    current: data.current,
    hourly,
    uvIndex: data.daily.uv_index_max?.[0] ?? null,
    currentPrecipitationProbability:
      data.hourly.precipitation_probability[currentHourIndex] ?? 0,
  };
}

function getLocationLabel(location) {
  return [location.name, location.admin1, location.country]
    .filter((part, index, parts) => part && parts.indexOf(part) === index)
    .join(", ");
}

export default function WeatherGuide() {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function selectLocation(nextLocation) {
    setLoading(true);
    setError("");
    setLocations([]);
    setLocation(nextLocation);
    setWeather(null);
    try {
      const result = await fetchWeather(nextLocation);
      setWeather(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Der opstod en fejl ved hentning af vejrdata.");
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }

  async function searchLocation(event) {
    event.preventDefault();
    const search = query.trim();
    if (search.length < 2) {
      setError("Skriv mindst to bogstaver for at søge efter en by.");
      return;
    }
    setLoading(true);
    setError("");
    setLocations([]);
    setWeather(null);
    try {
      const params = new URLSearchParams({
        name: search,
        count: "5",
        language: "da",
        format: "json",
      });
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
      if (!response.ok) {
        throw new Error("Stedet kunne ikke søges frem. Prøv igen om lidt.");
      }
      const data = await response.json();
      if (!data.results?.length) {
        throw new Error("Vi fandt ingen steder med det navn. Prøv et andet bynavn.");
      }
      if (data.results.length === 1) {
        const [result] = data.results;
        await selectLocation(result);
      } else {
        setLocations(data.results);
        setLoading(false);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Der opstod en fejl ved søgning efter stedet.");
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Din browser understøtter ikke positionsbestemmelse. Søg i stedet efter en by.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await selectLocation({
          name: "Din placering",
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (positionError) => {
        const message = positionError.code === positionError.PERMISSION_DENIED
          ? "Adgang til din placering blev afvist. Tillad placering i browseren, eller søg efter en by."
          : "Din placering kunne ikke findes. Prøv igen, eller søg efter en by.";
        setError(message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }

  const conditions = weather
    ? describeWeather(weather.current.weather_code)
    : ["Vejret vises her", CloudSun];
  const WeatherIcon = conditions[1];
  const advice = weather
    ? getClothingAdvice(
        weather.current.apparent_temperature,
        weather.current.wind_speed_10m,
        weather.currentPrecipitationProbability,
        weather.uvIndex ?? 0,
        weather.current.weather_code,
      )
    : null;

  return (
    <div className="weather-guide">
      <div className="tools-intro">
        <section>
          <small>HVILKET RESULTAT FÅR JEG?</small>
          <h2>Hvordan skal jeg klæde mig på til min løbetur?</h2>
        </section>
        <section>
          <small>HVAD KAN JEG BRUGE DET TIL?</small>
          <p>
            Få et hurtigt overblik over det aktuelle vejr, vind og regn, så du
            kan vælge den rigtige løbebeklædning og undgå at blive for varm
            eller for kold.
          </p>
        </section>
      </div>

      <section className="weather-toolbar">
        <div>
          <small>VÆRKTØJSKASSE</small>
          <h2>Vejrguide</h2>
        </div>
        <form onSubmit={searchLocation} className="weather-search">
          <label className="weather-search-field">
            <MapPin size={16} />
            <input
              aria-label="Søg efter by"
              placeholder="Søg by eller sted"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" aria-label="Søg" disabled={loading}>
              <Search size={16} />
            </button>
          </label>
          <button
            className="weather-location-button"
            type="button"
            onClick={useCurrentLocation}
            disabled={loading}
            aria-label="Brug min aktuelle placering"
            title="Brug min aktuelle placering"
          >
            <LocateFixed size={17} />
          </button>
        </form>
      </section>

      {locations.length > 0 && (
        <div className="weather-location-results" role="group" aria-label="Vælg placering">
          <strong>Vælg det rigtige sted</strong>
          {locations.map((result) => (
            <button
              type="button"
              key={`${result.id}-${result.latitude}-${result.longitude}`}
              onClick={() => selectLocation(result)}
            >
              <MapPin size={15} />
              {getLocationLabel(result)}
            </button>
          ))}
        </div>
      )}
      {error && <p className="weather-error" role="alert">{error}</p>}
      {loading && <p className="weather-loading" role="status">Henter vejret…</p>}

      <div className="weather-main-grid">
        <section className="weather-current-card">
          <div className="weather-current-head">
            <div>
              <small>Aktuelt vejr{location ? ` · ${getLocationLabel(location)}` : ""}</small>
              <h2>{weather ? `${Math.round(weather.current.temperature_2m)}°C` : "—"}</h2>
            </div>
            <WeatherIcon size={30} />
          </div>
          <p className="weather-condition"><WeatherIcon size={15} />{weather ? conditions[0] : "Søg efter en by for at se vejret"}</p>
          <div className="weather-current-stats">
            <div><small><Thermometer size={13} /> Føles som</small><strong>{weather ? `${Math.round(weather.current.apparent_temperature)}°C` : "—"}</strong></div>
            <div><small><Wind size={13} /> Vind</small><strong>{weather ? `${Math.round(weather.current.wind_speed_10m)} km/t` : "—"}</strong></div>
            <div><small><CloudRain size={13} /> Regn</small><strong>{weather ? `${weather.currentPrecipitationProbability}%` : "—"}</strong></div>
          </div>
          {!weather && !loading && <p className="weather-empty-hint">Søg efter din by, eller brug placeringsknappen for en lokal anbefaling.</p>}
        </section>

        <section className="weather-clothing-card">
          <small><Shirt size={14} /> LØBE-PÅKLÆDNING</small>
          <h2>{advice?.title ?? "Vælg en placering"}</h2>
          {advice ? (
            <>
              <ul>
                {advice.clothing.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="weather-advice-note">{advice.note}</p>
              {advice.weatherNotes.length > 0 && (
                <div className="weather-extra-notes">
                  {advice.weatherNotes.map((note) => <p key={note}>{note}</p>)}
                </div>
              )}
              <p className="weather-avoid"><strong>Undgå:</strong> {advice.avoid}</p>
            </>
          ) : (
            <p>Søg på din by eller brug din aktuelle placering for at få tøjforslag ud fra vejrforholdene.</p>
          )}
        </section>
      </div>

      <div className="weather-secondary-grid">
        <section className="weather-overview-card">
          <h2>Oversigt</h2>
          <div><span><Droplets size={14} /> Luftfugtighed</span><strong>{weather ? `${weather.current.relative_humidity_2m}%` : "—"}</strong></div>
          <div><span><Sun size={14} /> UV-indeks</span><strong>{weather?.uvIndex ?? "—"}</strong></div>
          <div><span><Clock3 size={14} /> Sidste opdatering</span><strong>{weather ? formatUpdateTime(weather.current.time) : "—"}</strong></div>
        </section>
        <section className="weather-hourly-card">
          <div className="weather-hourly-heading"><h2>Næste timer</h2><small>Lokalt vejr</small></div>
          {weather ? (
            <div className="weather-hourly-list">
              {weather.hourly.map((hour) => {
                const [description, HourIcon] = describeWeather(hour.weatherCode);
                return (
                  <article key={hour.time} title={description}>
                    <small>{formatHour(hour.time)}</small>
                    <HourIcon size={17} />
                    <strong>{Math.round(hour.temperature)}°</strong>
                    <span>{hour.precipitationProbability}% regn</span>
                    <span>{Math.round(hour.windSpeed)} km/t</span>
                  </article>
                );
              })}
            </div>
          ) : (
            <p>Prognosen for de næste timer vises, når du har valgt en placering.</p>
          )}
        </section>
      </div>

      <section className="weather-running-mode">
        <div className="weather-running-mode-heading">
          <h2>Til din løbetur</h2>
          <span>VEJRKLAR</span>
        </div>
        <div>
          <article><small>Løb</small><strong>{weather ? advice?.title : "Tjek vejret inden afgang"}</strong></article>
          <article><small>Vind</small><strong>{weather && weather.current.wind_speed_10m >= 25 ? "Vælg et vindafvisende lag" : "Klæd dig efter føles-temperaturen"}</strong></article>
          <article><small>Regn</small><strong>{weather && weather.currentPrecipitationProbability >= 50 ? "Medbring let regnbeskyttelse" : "Et let ekstra lag kan være nok"}</strong></article>
        </div>
      </section>

      <p className="weather-attribution">
        Vejrdata fra <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>.
        Søgte steder og placeringskoordinater sendes til Open-Meteo for at hente vejret.
      </p>
    </div>
  );
}
