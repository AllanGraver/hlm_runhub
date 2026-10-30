import { useEffect, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Link2,
  RefreshCw,
  Unlink,
} from "lucide-react";
import "../styles/strava.css";
import {
  getStravaDeviceId,
  STRAVA_API_URL,
  stravaApi,
} from "../services/stravaClient";
const STRAVA_DATA_KEY = "hlm_runhub.strava.data.v1";
const INITIAL_LOOKBACK_SECONDS = 365 * 24 * 60 * 60;
const SYNC_OVERLAP_SECONDS = 7 * 24 * 60 * 60;
const ACTIVITY_API_VERSION = 3;
const RUN_TYPES = new Set(["Run", "TrailRun", "VirtualRun", "Treadmill"]);

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

function normalizeActivity(activity) {
  return {
    id: String(activity.id),
    name: activity.name ?? "Løbetur",
    sportType: activity.sportType ?? activity.type,
    startDateLocal: activity.startDateLocal,
    distanceKm:
      activity.distanceKm ??
      (Number.isFinite(activity.distanceMeters)
        ? activity.distanceMeters / 1000
        : 0),
    movingTime: activity.movingTimeSeconds ?? 0,
    elapsedTime: activity.elapsedTimeSeconds ?? 0,
    elevationGain: activity.totalElevationGainMeters ?? 0,
    averageWatts: activity.averageWatts,
    maxWatts: activity.maxWatts,
    averageHeartRate: activity.averageHeartRate,
    maxHeartRate: activity.maxHeartRate,
    averageCadence: activity.averageCadence,
  };
}

function isRun(activity) {
  return RUN_TYPES.has(activity.sportType) || RUN_TYPES.has(activity.type);
}

function getStreamSummary(streams) {
  const metrics = [
    ["heartrate", "Puls", "bpm"],
    ["watts", "Effekt", "W"],
    ["cadence", "Kadence", "spm"],
  ];
  return metrics.flatMap(([key, label, unit]) => {
    const values = streams?.[key]?.data?.filter(Number.isFinite) ?? [];
    if (values.length === 0) return [];
    const average = values.reduce((total, value) => total + value, 0) / values.length;
    const maximum = values.reduce((highest, value) => Math.max(highest, value), -Infinity);
    return [{ label, unit, average, maximum }];
  });
}

function formatElapsedTime(seconds) {
  return formatDuration(Math.round(seconds ?? 0));
}

export default function StravaConnection({ onActivitiesChange }) {
  const [deviceId] = useState(getStravaDeviceId);
  const [data, setData] = useState(readCachedData);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(Boolean(STRAVA_API_URL));
  const [error, setError] = useState("");
  const [activityCacheVisible, setActivityCacheVisible] = useState(true);
  const [expandedActivityId, setExpandedActivityId] = useState("");
  const [activityDetails, setActivityDetails] = useState({});
  const [loadingActivityId, setLoadingActivityId] = useState("");
  const [activityDetailErrors, setActivityDetailErrors] = useState({});
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
    return stravaApi(deviceId, path, options);
  }

  async function fetchRunHubData({ fullImport = false } = {}) {
    const athleteResult = await api("/api/runhub/athlete");
    const existingActivities = Array.isArray(data.activities)
      ? data.activities
      : [];
    const lookbackSeconds =
      fullImport || existingActivities.length === 0
        ? INITIAL_LOOKBACK_SECONDS
        : SYNC_OVERLAP_SECONDS;
    const after = Math.floor(Date.now() / 1000) - lookbackSeconds;
    const imported = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await api(
        `/api/runhub/activities?page=${page}&perPage=200&after=${after}`,
      );
      if (!Array.isArray(result.activities)) {
        throw new Error(
          "Workerens /api/runhub/activities returnerede ikke en aktivitetsliste.",
        );
      }
      imported.push(...result.activities.filter(isRun).map(normalizeActivity));
      hasMore = result.hasMore === true && result.activities.length > 0;
      page += 1;
    }

    const athlete = athleteResult.athlete;
    const athleteName = [athlete?.firstname, athlete?.lastname]
      .filter(Boolean)
      .join(" ");

    const activityMap = new Map(
      existingActivities.map((activity) => [String(activity.id), activity]),
    );
    imported.forEach((activity) => {
      activityMap.set(String(activity.id), activity);
    });

    const sortedActivities = [...activityMap.values()].sort(
      (first, second) =>
        new Date(second.startDateLocal).getTime() -
        new Date(first.startDateLocal).getTime(),
    );
    const updates = {
      connected: true,
      athleteName: athleteName || data.athleteName || "Strava-konto",
      lastSync: new Date().toISOString(),
      activityApiVersion: ACTIVITY_API_VERSION,
      activities: sortedActivities,
    };
    saveLocalData(updates);
    onActivitiesChange(sortedActivities);
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
          if (
            justConnected ||
            !data.lastSync ||
            data.activityApiVersion !== ACTIVITY_API_VERSION
          ) {
            await fetchRunHubData({ fullImport: true });
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
    url.searchParams.set("app", "runhub");
    window.location.assign(url.toString());
  }

  async function sync() {
    setLoading(true);
    setError("");
    try {
      await fetchRunHubData();
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
        activityApiVersion: null,
        activities: [],
      });
      onActivitiesChange([]);
      setActivityDetails({});
      setExpandedActivityId("");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActivityDetails(activityId) {
    if (expandedActivityId === activityId) {
      setExpandedActivityId("");
      return;
    }
    setExpandedActivityId(activityId);
    if (activityDetails[activityId]) return;

    setLoadingActivityId(activityId);
    setActivityDetailErrors((current) => {
      const next = { ...current };
      delete next[activityId];
      return next;
    });
    try {
      const [detail, streams, laps, zones] = await Promise.all([
        api(`/api/runhub/activity/${activityId}`),
        api(`/api/runhub/activity/${activityId}/streams`),
        api(`/api/runhub/activity/${activityId}/laps`),
        api(`/api/runhub/activity/${activityId}/zones`),
      ]);
      setActivityDetails((current) => ({
        ...current,
        [activityId]: {
          activity: detail.activity,
          streams: streams.streams,
          laps: laps.laps,
          zones: zones.zones,
        },
      }));
    } catch (reason) {
      setActivityDetailErrors((current) => ({
        ...current,
        [activityId]: reason.message,
      }));
    } finally {
      setLoadingActivityId("");
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
          <div className="strava-cache-controls">
            <strong>Aktivitetscache · {activities.length}</strong>
            <button
              type="button"
              className="strava-cache-toggle"
              aria-expanded={activityCacheVisible}
              onClick={() => setActivityCacheVisible((visible) => !visible)}
            >
              {activityCacheVisible ? (
                <>
                  <ChevronUp size={16} aria-hidden="true" />
                  Skjul aktiviteter
                </>
              ) : (
                <>
                  <ChevronDown size={16} aria-hidden="true" />
                  Vis aktiviteter
                </>
              )}
            </button>
          </div>
          {activityCacheVisible && (
            <div className="strava-activity-list">
              {activities.map((activity) => (
                <article
                  className={`strava-activity${expandedActivityId === activity.id ? " expanded" : ""}`}
                  key={activity.id}
                >
                  <button
                    type="button"
                    className="strava-activity-toggle"
                    onClick={() => toggleActivityDetails(activity.id)}
                    aria-expanded={expandedActivityId === activity.id}
                  >
                    <span className="strava-activity-main">
                      <strong>{activity.name}</strong>
                      <span>{new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "short" }).format(new Date(activity.startDateLocal))}</span>
                    </span>
                    <span className="strava-activity-metrics">
                      <strong>{formatDistance(activity.distanceKm)}</strong>
                      <span>{formatDuration(activity.movingTime)}</span>
                      {formatPace(activity) && <span>{formatPace(activity)}</span>}
                      {activity.averageWatts != null && <span>{Math.round(activity.averageWatts)} W snit</span>}
                      {activity.maxWatts != null && <span>{Math.round(activity.maxWatts)} W max</span>}
                      {activity.averageHeartRate != null && <span>{Math.round(activity.averageHeartRate)} bpm snit</span>}
                      {activity.maxHeartRate != null && <span>{Math.round(activity.maxHeartRate)} bpm max</span>}
                      {activity.averageCadence != null && <span>{Math.round(activity.averageCadence)} spm</span>}
                      {activity.elevationGain > 0 && <span>{Math.round(activity.elevationGain)} hm</span>}
                    </span>
                    {expandedActivityId === activity.id ? (
                      <ChevronUp size={16} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={16} aria-hidden="true" />
                    )}
                  </button>
                  {expandedActivityId === activity.id && (
                    <ActivityDetail
                      detail={activityDetails[activity.id]}
                      error={activityDetailErrors[activity.id]}
                      loading={loadingActivityId === activity.id}
                    />
                  )}
                </article>
              ))}
              {activities.length === 0 && !loading && (
                <p className="strava-loading">Ingen importerede løbeture. Synkronisér for at hente aktiviteter.</p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function ActivityDetail({ detail, error, loading }) {
  if (loading) {
    return <p className="strava-activity-detail-status">Henter detaljer fra Strava...</p>;
  }
  if (error) {
    return <p className="strava-error" role="alert">{error}</p>;
  }
  if (!detail) return null;

  const streamSummary = getStreamSummary(detail.streams);
  const laps = Array.isArray(detail.laps) ? detail.laps : [];
  const zones = Array.isArray(detail.zones) ? detail.zones : [];

  return (
    <div className="strava-activity-detail">
      <h3>Aktivitetsdetaljer</h3>
      {detail.activity.description && <p>{detail.activity.description}</p>}
      {streamSummary.length > 0 && (
        <div className="strava-detail-metrics">
          {streamSummary.map(({ label, unit, average, maximum }) => (
            <span key={label}>
              {label}: {Math.round(average)} {unit} snit · {Math.round(maximum)} {unit} max
            </span>
          ))}
        </div>
      )}
      {laps.length > 0 && (
        <div className="strava-laps">
          <h4>Intervaller og omgange</h4>
          <div>
            <span>Del</span><span>Distance</span><span>Tid</span><span>Tempo</span>
          </div>
          {laps.map((lap, index) => {
            const distanceKm = lap.distance / 1000;
            const pace = distanceKm > 0 ? lap.moving_time / distanceKm : null;
            return (
              <div key={lap.id ?? lap.lap_index ?? index}>
                <span>{lap.name || lap.lap_index || index + 1}</span>
                <span>{formatDistance(distanceKm)}</span>
                <span>{formatElapsedTime(lap.moving_time)}</span>
                <span>
                  {pace
                    ? `${Math.floor(pace / 60)}:${String(Math.round(pace % 60)).padStart(2, "0")} /km`
                    : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {zones.length > 0 && (
        <div className="strava-zones">
          <h4>Intensitetszoner</h4>
          {zones.map((zone, zoneIndex) => (
            <div key={zone.type ?? zoneIndex}>
              <strong>{zone.type === "heartrate" ? "Puls" : zone.type === "power" ? "Effekt" : zone.type || "Zone"}</strong>
              <span>
                {zone.distribution_buckets?.map((bucket, index) => (
                  <span key={`${zone.type}-${index}`}>
                    Z{index + 1}: {formatElapsedTime(bucket.time)}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
      {streamSummary.length === 0 && laps.length === 0 && zones.length === 0 && (
        <p>Strava har ingen ekstra detaljer for denne aktivitet.</p>
      )}
    </div>
  );
}