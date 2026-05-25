import { MASAM_NAMES } from '../utils/constants.js';
import { daysSinceJ2000 } from '../utils/date.js';
import { normalizeDegrees, toRadians } from '../utils/math.js';

export function getPlanetLongitude(planet, date = new Date()) {
  const epoch = Date.UTC(2026, 0, 1);
  const elapsedDays = (date.getTime() - epoch) / 86400000;
  return normalizeDegrees((elapsedDays / planet.period) * 360);
}

export function getSunLongitude(date) {
  const days = daysSinceJ2000(date);
  const meanLongitude = normalizeDegrees(280.459 + 0.98564736 * days);
  const meanAnomaly = normalizeDegrees(357.529 + 0.98560028 * days);

  return normalizeDegrees(
    meanLongitude +
    1.915 * Math.sin(toRadians(meanAnomaly)) +
    0.020 * Math.sin(toRadians(2 * meanAnomaly))
  );
}

export function getMoonLongitude(date) {
  if (window.Astronomy?.EclipticGeoMoon) {
    return normalizeDegrees(window.Astronomy.EclipticGeoMoon(date).lon);
  }

  const days = daysSinceJ2000(date);
  const meanLongitude = normalizeDegrees(218.316 + 13.176396 * days);
  const moonAnomaly = normalizeDegrees(134.963 + 13.064993 * days);
  const sunAnomaly = normalizeDegrees(357.529 + 0.98560028 * days);
  const elongation = normalizeDegrees(297.850 + 12.190749 * days);
  const argumentLatitude = normalizeDegrees(93.272 + 13.229350 * days);

  return normalizeDegrees(
    meanLongitude +
    6.289 * Math.sin(toRadians(moonAnomaly)) +
    1.274 * Math.sin(toRadians(2 * elongation - moonAnomaly)) +
    0.658 * Math.sin(toRadians(2 * elongation)) +
    0.214 * Math.sin(toRadians(2 * moonAnomaly)) -
    0.186 * Math.sin(toRadians(sunAnomaly)) -
    0.114 * Math.sin(toRadians(2 * argumentLatitude))
  );
}

export function getLahiriAyanamsa(date) {
  const year = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12;
  return 23.85675 + 0.013968 * (year - 2000);
}

export function getSiderealLongitude(tropicalLongitude, date) {
  return normalizeDegrees(tropicalLongitude - getLahiriAyanamsa(date));
}

export function getLunarPhase(date) {
  if (window.Astronomy?.MoonPhase) {
    return normalizeDegrees(window.Astronomy.MoonPhase(date));
  }

  return normalizeDegrees(getMoonLongitude(date) - getSunLongitude(date));
}

function getUnwrappedPhase(date, referencePhase) {
  let phase = getLunarPhase(date);
  while (phase < referencePhase - 2) phase += 360;
  return phase;
}

export function findTithiEnd(date, phaseNow) {
  const tithiProgress = phaseNow % 12;
  const targetPhase = phaseNow + (12 - tithiProgress);
  let low = new Date(date);
  let high = new Date(date.getTime() + 36 * 60 * 60 * 1000);

  while (getUnwrappedPhase(high, phaseNow) < targetPhase) {
    high = new Date(high.getTime() + 12 * 60 * 60 * 1000);
  }

  for (let i = 0; i < 36; i += 1) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    if (getUnwrappedPhase(mid, phaseNow) < targetPhase) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

export function findPreviousNewMoon(date, phaseNow) {
  const estimatedTime = date.getTime() - (phaseNow / 12.19075) * 86400000;
  let low = new Date(estimatedTime - 2 * 86400000);
  let high = new Date(estimatedTime + 2 * 86400000);

  for (let i = 0; i < 44; i += 1) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const phase = getLunarPhase(mid);
    const signedPhase = phase < 180 ? phase : phase - 360;
    if (signedPhase < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

export function getTeluguMasam(newMoonDate) {
  const sunSidereal = getSiderealLongitude(getSunLongitude(newMoonDate), newMoonDate);
  const sunRasi = Math.floor(sunSidereal / 30);
  return MASAM_NAMES[(sunRasi + 1) % 12];
}
