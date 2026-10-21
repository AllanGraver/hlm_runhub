import { useEffect, useState } from "react";
import { Activity, Link2, RefreshCw, Unlink } from "lucide-react";
import "../styles/strava.css";

const STRAVA_API_URL = import.meta.env.VITE_STRAVA_API_URL?.replace(/\/$/, "");
const STRAVA_DEVICE_KEY = "hlm_runhub.strava.device.v1";
const STRAVA_DATA_KEY = "hlm_runhub.strava.data.v1";

function getDeviceId() {
  let deviceId = window.localStorage.getItem(STRAVA_DEVICE_KEY);
  if (!deviceId) {
    deviceId = window.crypto.randomUUID();
    window.localStorage.setItem(STRAVA_DEVICE_KEY, deviceId);
  }
  return deviceId;
}

function readCachedData() {
  try {
    return JSON.parse(window.localStorage.getItem(STRAVA_DATA_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function formatDistance(distanceKm) {
  return `${new Intl.NumberFormat("da-DK", { maximumFractionDigits: 2 }).format(distanceKm)} km`;
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
    : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatPace(activity) {
  if (!activity.distanceKm || !activity.movingTime) return null;
  const secondsPerKm = Math.round(activity.movingTime / activity.distanceKm);
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} /km`;
}

function formatSyncTime(value) {
  return new Intl.DateTimeFormat("da-DK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function StravaConnection({ onActivitiesChange }) {
  const [deviceId] = useState(getDeviceId);
  const [data, setData] = useState(readCachedData);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(Boolean(STRAVA_API_URL));
  const [error, setError] = useState("");
  const activities = Array.isArray(data.activities) ? data.activities : [];

  function saveLocalData(updates) {
    const next = { ...data, ...updates };
    try {
      window.localStorage.setItem(STRAVA_DATA_KEY, JSON.stringify(next));
    } catch {
      setError("Strava-data kunne ikke gemmes lokalt i denne browser.");
    }
    setData(next);
  }

  async function api(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("X-Device-ID", deviceId);
    const response = await fetch(`${STRAVA_API_URL}${path}`, { ...options, headers });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error ?? "Strava-forbindelsen fejlede.");
    return result;
  }

  function applySyncResult(result) {
    if (!Array.isArray(result.activities)) {
      throw new Error("Workerens /api/sync skal returnere alle løbeaktiviteter for at importere træning pr. dato.");
    }
    const updates = {
      connected: true,
      athleteName: result.athleteName ?? data.athleteName ?? "Strava-konto",
      lastSync: new Date().toISOString(),
      activities: result.activities,
    };
    saveLocalData(updates);
    onActivitiesChange(result.activities);
  }

  useEffect(() => {
    let active = true;
    onActivitiesChange(activities);
    const params = new URLSearchParams(window.location.search);
    const callbackError = params.get("strava_error");
    const justConnected = params.get("strava") === "connected";
    if (callbackError) setError(callbackError);
    if (params.has("strava") || callbackError) {
      params.delete("strava");
      params.delete("strava_error");
      const query = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
    }

    if (!STRAVA_API_URL) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    async function initialize() {
      try {
        const status = await api("/api/status");
        if (!active) return;
        setConnected(status.connected);
        if (!status.connected) {
          saveLocalData({ connected: false, activities: [] });
          onActivitiesChange([]);
        } else {
          onActivitiesChange(activities);
          if (justConnected || !data.lastSync) {
            applySyncResult(await api("/api/sync"));
          }
        }
      } catch (reason) {
        if (active) setError(reason.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, []);

  function connect() {
    if (!STRAVA_API_URL) return;
    const url = new URL(`${STRAVA_API_URL}/auth/start`);
    url.searchParams.set("device", deviceId);
    window.location.assign(url.toString());
  }

  async function sync() {
    setLoading(true);
    setError("");
    try {
      applySyncResult(await api("/api/sync"));
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setLoading(true);
    setError("");
    try {
      await api("/api/disconnect", { method: "POST" });
      setConnected(false);
      saveLocalData({
        connected: false,
        athleteName: null,
        lastSync: null,
        activities: [],
      });
      onActivitiesChange([]);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="strava-panel" aria-label="Strava-forbindelse">
      <div className="strava-heading">
        <div className="strava-mark" aria-hidden="true"><Activity size={20} /></div>
        <div>
          <h2>Strava</h2>
          <p>
            {connected
              ? `Forbundet som ${data.athleteName ?? "din Strava-konto"}`
              : "Importér dine løbeaktiviteter"}
          </p>
        </div>
      </div>

      <div className="strava-actions">
        {connected ? (
          <>
            <button type="button" className="strava-button" onClick={sync} disabled={loading}>
              <RefreshCw size={16} /> {loading ? "Synkroniserer..." : "Synkronisér"}
            </button>
            <button type="button" className="strava-icon-button" onClick={disconnect} disabled={loading} aria-label="Afbryd Strava og fjern lokal cache" title="Afbryd Strava">
              <Unlink size={16} />
            </button>
          </>
        ) : (
          <button type="button" className="strava-button" onClick={connect} disabled={loading || !STRAVA_API_URL}>
            <Link2 size={16} /> Forbind Strava
          </button>
        )}
      </div>

      {!STRAVA_API_URL && (
        <p className="strava-setup-note">
          Worker-adresse mangler. Sæt <code>VITE_STRAVA_API_URL</code> til din Cloudflare Worker.
        </p>
      )}
      {error && <p className="strava-error" role="alert">{error}</p>}

      {connected && (
        <>
          <div className="strava-sync-row">
            <span>Sidst synkroniseret</span>
            <strong>{data.lastSync ? formatSyncTime(data.lastSync) : "Aldrig"}</strong>
          </div>
          <p className="strava-data-note">
            Aktivitetscache gemmes kun i denne browser. Stryd-effekt vises, når Strava returnerer effektdata.
          </p>
          <div className="strava-activity-list">
            {activities.map((activity) => (
              <article className="strava-activity" key={activity.id}>
                <div className="strava-activity-main">
                  <strong>{activity.name}</strong>
                  <span>{new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "short" }).format(new Date(activity.startDateLocal))}</span>
                </div>
                <div className="strava-activity-metrics">
                  <strong>{formatDistance(activity.distanceKm)}</strong>
                  <span>{formatDuration(activity.movingTime)}</span>
                  {formatPace(activity) && <span>{formatPace(activity)}</span>}
                  {activity.averageWatts != null && <span>{Math.round(activity.averageWatts)} W snit</span>}
                  {activity.maxWatts != null && <span>{Math.round(activity.maxWatts)} W max</span>}
                  {activity.averageHeartRate != null && <span>{Math.round(activity.averageHeartRate)} bpm snit</span>}
                  {activity.maxHeartRate != null && <span>{Math.round(activity.maxHeartRate)} bpm max</span>}
                  {activity.averageCadence != null && <span>{Math.round(activity.averageCadence)} spm</span>}
                  {activity.elevationGain > 0 && <span>{Math.round(activity.elevationGain)} hm</span>}
                </div>
              </article>
            ))}
            {activities.length === 0 && !loading && (
              <p className="strava-loading">Ingen importerede løbeture. Synkronisér for at hente aktiviteter.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}