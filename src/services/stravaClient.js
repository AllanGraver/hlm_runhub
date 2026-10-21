export const STRAVA_API_URL = import.meta.env.VITE_STRAVA_API_URL?.replace(
  /\/$/,
  "",
);
export const STRAVA_DEVICE_KEY = "hlm_runhub.strava.device.v1";

export function getStravaDeviceId() {
  let deviceId = window.localStorage.getItem(STRAVA_DEVICE_KEY);
  if (!deviceId) {
    deviceId = window.crypto.randomUUID();
    window.localStorage.setItem(STRAVA_DEVICE_KEY, deviceId);
  }
  return deviceId;
}

export async function stravaApi(deviceId, path, options = {}) {
  if (!STRAVA_API_URL) {
    throw new Error("Strava Worker-adressen er ikke konfigureret.");
  }
  const headers = new Headers(options.headers);
  headers.set("X-Device-ID", deviceId);
  const response = await fetch(`${STRAVA_API_URL}${path}`, {
    ...options,
    headers,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error ?? "Strava-forbindelsen fejlede.");
  }
  return result;
}
