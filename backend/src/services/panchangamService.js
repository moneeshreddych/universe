import { TITHI_NAMES } from '../data/tithis.js';
import { NAKSHATRA_NAMES } from '../data/nakshatras.js';
import { SAMVATSARA_NAMES } from '../data/samvatsarams.js';
import { WEEKDAY_NAMES, MASAM_NAMES, YOGA_NAMES, KARANA_REPEATING, MASAM_MAP } from '../data/constants.js';
import {
  getSunLongitude,
  getMoonLongitude,
  getLahiriAyanamsa,
  getSiderealLongitude,
  getSunriseSunset
} from './astronomyService.js';
import { formatLocalTime, localTimeToUtc, formatLocalDate } from '../utils/dateUtils.js';
import * as Astronomy from 'astronomy-engine';

// Helper: Calculate Moon/Sun separation (lunar phase)
function getLunarPhase(date) {
  const sunLong = getSunLongitude(date);
  const moonLong = getMoonLongitude(date);
  return (moonLong - sunLong + 360) % 360;
}

// Helper: Unwrapped phase for binary search
function getUnwrappedPhase(date, referencePhase) {
  let phase = getLunarPhase(date);
  while (phase < referencePhase - 2) phase += 360;
  return phase;
}

// Helper: Moon sidereal longitude
function getMoonSiderealLongitude(date) {
  const moonLong = getMoonLongitude(date);
  const ayanamsa = getLahiriAyanamsa(date);
  return (moonLong - ayanamsa + 360) % 360;
}

// Helper: Find previous new moon (bisection search)
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

// Helper: Find Tithi end time (bisection search)
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

// Helper: Find Nakshatra end time (bisection search)
export function findNakshatraEnd(date, currentLong) {
  const currentIndex = Math.floor(currentLong / 13.333333);
  const targetLong = (currentIndex + 1) * 13.333333;

  let low = new Date(date);
  let high = new Date(date.getTime() + 36 * 60 * 60 * 1000);

  for (let i = 0; i < 36; i += 1) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const midLong = getMoonSiderealLongitude(mid);

    let diff = midLong - targetLong;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;

    if (diff < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

// Helper: Get Telugu lunar month name
export function getTeluguMasam(newMoonDate) {
  const sunLong = getSunLongitude(newMoonDate);
  const sunSidereal = getSiderealLongitude(sunLong, newMoonDate);
  const sunRasi = Math.floor(sunSidereal / 30);
  return MASAM_NAMES[(sunRasi + 1) % 12];
}

// Helper: Find Ugadi date to determine Samvatsara year transitions
export function getUgadiDate(year) {
  // Probe starting late March (UTC 6:00 AM)
  let probe = new Date(Date.UTC(year, 2, 31, 6));

  for (let i = 0; i < 45; i += 1) {
    const phase = getLunarPhase(probe);
    const newMoon = findPreviousNewMoon(probe, phase);
    if (getTeluguMasam(newMoon) === MASAM_NAMES[0] && newMoon.getUTCMonth() >= 1 && newMoon.getUTCMonth() <= 3) {
      return new Date(newMoon.getTime() + 12 * 60 * 60 * 1000);
    }
    probe = new Date(probe.getTime() + 86400000);
  }

  // Fallback
  return new Date(Date.UTC(year, 2, 22, 0));
}

// Helper: Determine Samvatsaram name
export function getSamvatsaram(date) {
  let teluguYear = date.getFullYear();
  if (date < getUgadiDate(teluguYear)) {
    teluguYear -= 1;
  }
  return SAMVATSARA_NAMES[((teluguYear - 1987) % 60 + 60) % 60];
}

// Helper: Get Karana name
function getKaranaName(k) {
  if (k === 0) return "Kimstughna";
  if (k === 57) return "Shakuni";
  if (k === 58) return "Chatushpada";
  if (k === 59) return "Naga";
  return KARANA_REPEATING[(k - 1) % 7];
}

/**
 * Calculates the complete Panchangam elements for a local calendar day.
 */
export function getPanchangamData(date, timezone, lat, lon, alt = 0) {
  // Determine sunrise and sunset for evaluating elements
  const { sunrise, sunset } = getSunriseSunset(date, timezone, lat, lon, alt);
  
  // Astrologically, the day's attributes are evaluated at sunrise.
  // Fallback to 06:00 local time if sunrise is not available.
  const evalTime = sunrise || localTimeToUtc(formatLocalDate(date, timezone), '06:00', timezone);

  const phase = getLunarPhase(evalTime);
  const tithiNumber = Math.floor(phase / 12) + 1;
  const paksham = tithiNumber <= 15 ? 'Shukla Paksham' : 'Krishna Paksham';
  const tithiIndex = (tithiNumber - 1) % 15;
  const tithiBaseName = tithiNumber === 30 ? 'Amavasya' : TITHI_NAMES[tithiIndex];

  const previousNewMoon = findPreviousNewMoon(evalTime, phase);
  const masamRaw = getTeluguMasam(previousNewMoon);
  const masam = MASAM_MAP[masamRaw] || masamRaw;

  const moonLong = getMoonLongitude(evalTime);
  const moonSidereal = getSiderealLongitude(moonLong, evalTime);
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
  const nakshatram = NAKSHATRA_NAMES[nakshatraIndex];

  const sunLong = getSunLongitude(evalTime);
  const sunSidereal = getSiderealLongitude(sunLong, evalTime);
  const yogaLong = (sunSidereal + moonSidereal) % 360;
  const yogaIndex = Math.floor(yogaLong / (360 / 27));
  const yogam = YOGA_NAMES[yogaIndex];

  const karanaIndex = Math.floor(phase / 6);
  const karanam = getKaranaName(karanaIndex);

  const samvatsaram = getSamvatsaram(evalTime);
  const vaaram = WEEKDAY_NAMES[evalTime.getDay()];

  return {
    date: formatLocalDate(date, timezone),
    masam,
    paksham,
    tithi: tithiBaseName,
    nakshatram,
    yogam,
    karanam,
    vaaram,
    samvatsaram,
    evalTime,
    sunrise,
    sunset
  };
}

/**
 * Calculates Muhurthams based on Sunrise, Sunset, and Day of Week.
 */
export function getMuhurthams(sunrise, sunset, weekdayIndex, timezone) {
  if (!sunrise || !sunset) {
    return {
      rahuKalam: { start: '--:--', end: '--:--' },
      gulikaKalam: { start: '--:--', end: '--:--' },
      yamagandam: { start: '--:--', end: '--:--' },
      abhijit: { start: '--:--', end: '--:--' }
    };
  }

  const riseMs = sunrise.getTime();
  const setMs = sunset.getTime();
  const dayLength = setMs - riseMs;
  const partLength = dayLength / 8;

  const getWindow = (partIndex) => {
    const start = new Date(riseMs + (partIndex - 1) * partLength);
    const end = new Date(riseMs + partIndex * partLength);
    return `${formatLocalTime(start, timezone)} - ${formatLocalTime(end, timezone)}`;
  };

  const RAHU_KALAM_PARTS = [8, 2, 7, 5, 6, 4, 3];
  const YAMAGANDAM_PARTS = [5, 4, 3, 2, 1, 7, 6];
  const GULIKA_KALAM_PARTS = [7, 6, 5, 4, 3, 2, 1];

  const rahuPart = RAHU_KALAM_PARTS[weekdayIndex];
  const yamaPart = YAMAGANDAM_PARTS[weekdayIndex];
  const gulikaPart = GULIKA_KALAM_PARTS[weekdayIndex];

  // Abhijit Muhurtham is the 8th of 15 equal parts of the day
  const mLength = dayLength / 15;
  const abhijitStart = new Date(riseMs + 7 * mLength);
  const abhijitEnd = new Date(riseMs + 8 * mLength);

  return {
    rahuKalam: getWindow(rahuPart),
    yamagandam: getWindow(yamaPart),
    gulikaKalam: getWindow(gulikaPart),
    abhijit: `${formatLocalTime(abhijitStart, timezone)} - ${formatLocalTime(abhijitEnd, timezone)}`
  };
}
