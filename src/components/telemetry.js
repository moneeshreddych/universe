import { APP_CONFIG } from '../config/appConfig.js';
import { formatUtcTimestamp } from '../utils/formatting.js';

export function createTelemetry({ utcElement, locationElement }) {
  let intervalId = null;

  function update() {
    const now = new Date();
    const { baseLatitude, baseLongitude, jitter } = APP_CONFIG.telemetry;
    const lat = (baseLatitude + (Math.random() - 0.5) * jitter).toFixed(4);
    const lon = (baseLongitude + (Math.random() - 0.5) * jitter).toFixed(4);

    if (utcElement) utcElement.textContent = formatUtcTimestamp(now);
    if (locationElement) locationElement.textContent = `${lat}° N, ${lon}° W`;
  }

  function start() {
    update();
    intervalId = setInterval(update, APP_CONFIG.telemetry.refreshMs);
  }

  function stop() {
    if (intervalId) clearInterval(intervalId);
  }

  return { start, stop };
}

export function createLogger() {
  return function log(message, type = 'info') {
    const now = new Date();
    const hrs = String(now.getUTCHours()).padStart(2, '0');
    const mins = String(now.getUTCMinutes()).padStart(2, '0');
    const secs = String(now.getUTCSeconds()).padStart(2, '0');
    console.log(`[${hrs}:${mins}:${secs}] [Telemetry - ${type.toUpperCase()}]: ${message}`);
  };
}
