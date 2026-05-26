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

const SANKRANTI_NAMES = [
  "Mesha Sankranti", "Vrishabha Sankranti", "Mithuna Sankranti", "Karkataka Sankranti",
  "Simha Sankranti", "Kanya Sankranti", "Tula Sankranti", "Vrischika Sankranti",
  "Dhanusu Sankranti", "Makara Sankranti", "Kumbha Sankranti", "Meena Sankranti"
];

const VARJYAM_OFFSETS = [
  50, 24, 30, 40, 14, 11, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30
];

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

// Helper: Find Nakshatra start time (bisection search)
export function findNakshatraStart(date, currentLong) {
  const currentIndex = Math.floor(currentLong / 13.333333);
  const targetLong = currentIndex * 13.333333;

  let low = new Date(date.getTime() - 36 * 60 * 60 * 1000);
  let high = new Date(date);

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

// Helper: Get Varjyam and Amrita Kalam intervals
export function getVarjyamAndAmritaKalam(evalTime, moonSidereal) {
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
  const startUtc = findNakshatraStart(evalTime, moonSidereal);
  const endUtc = findNakshatraEnd(evalTime, moonSidereal);
  const duration = endUtc.getTime() - startUtc.getTime();

  const ghatiOffset = VARJYAM_OFFSETS[nakshatraIndex];

  // Varjyam lasts 4 ghatis (1/15th of Nakshatra length)
  const varjyamStart = new Date(startUtc.getTime() + (ghatiOffset / 60) * duration);
  const varjyamEnd = new Date(varjyamStart.getTime() + (4 / 60) * duration);

  // Amrita Kalam starts 42 ghatis after Varjyam start (modular 60 ghatis)
  const amritaGhatiOffset = (ghatiOffset + 42) % 60;
  const amritaStart = new Date(startUtc.getTime() + (amritaGhatiOffset / 60) * duration);
  const amritaEnd = new Date(amritaStart.getTime() + (4 / 60) * duration);

  return {
    varjyam: { start: varjyamStart, end: varjyamEnd },
    amritakalam: { start: amritaStart, end: amritaEnd }
  };
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
  let probe = new Date(Date.UTC(year, 2, 31, 6));

  for (let i = 0; i < 45; i += 1) {
    const phase = getLunarPhase(probe);
    const newMoon = findPreviousNewMoon(probe, phase);
    if (getTeluguMasam(newMoon) === MASAM_NAMES[0] && newMoon.getUTCMonth() >= 1 && newMoon.getUTCMonth() <= 3) {
      return new Date(newMoon.getTime() + 12 * 60 * 60 * 1000);
    }
    probe = new Date(probe.getTime() + 86400000);
  }

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

// Helper: Get Moon Phase Details
function getMoonPhaseDetails(elongation) {
  const fraction = (1 - Math.cos(elongation * Math.PI / 180)) / 2;
  let name = "";
  if (elongation === 0 || elongation === 360) {
    name = "New Moon";
  } else if (elongation > 0 && elongation < 90) {
    name = "Waxing Crescent";
  } else if (elongation === 90) {
    name = "First Quarter";
  } else if (elongation > 90 && elongation < 180) {
    name = "Waxing Gibbous";
  } else if (elongation === 180) {
    name = "Full Moon";
  } else if (elongation > 180 && elongation < 270) {
    name = "Waning Gibbous";
  } else if (elongation === 270) {
    name = "Third Quarter";
  } else if (elongation > 270 && elongation < 360) {
    name = "Waning Crescent";
  }
  return {
    fraction: parseFloat((fraction * 100).toFixed(1)),
    name,
    isWaxing: elongation < 180
  };
}

// Helper: Find Sun transit (Sankranti) using bisection
export function findSunTransit(startUtc, endUtc, startRasi) {
  let low = new Date(startUtc);
  let high = new Date(endUtc);

  for (let i = 0; i < 30; i += 1) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const sunLong = getSunLongitude(mid);
    const sunSidereal = getSiderealLongitude(sunLong, mid);
    const midRasi = Math.floor(sunSidereal / 30);

    if (midRasi === startRasi) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

// Helper: Calculate Durmuhurthams
export function calculateDurmuhurthams(sunrise, sunset, weekdayIndex, timezone) {
  if (!sunrise || !sunset) return [];

  const riseMs = sunrise.getTime();
  const setMs = sunset.getTime();
  const dayLength = setMs - riseMs;
  const partLength = dayLength / 15;

  const getWindow = (partIndex) => {
    const start = new Date(riseMs + (partIndex - 1) * partLength);
    const end = new Date(riseMs + partIndex * partLength);
    return {
      start,
      end,
      display: `${formatLocalTime(start, timezone)} - ${formatLocalTime(end, timezone)}`
    };
  };

  const durmuhurthams = [];

  switch (weekdayIndex) {
    case 0: // Sunday
      durmuhurthams.push(getWindow(14));
      break;
    case 1: // Monday
      durmuhurthams.push(getWindow(9));
      durmuhurthams.push(getWindow(12));
      break;
    case 2: // Tuesday
      durmuhurthams.push(getWindow(3));
      durmuhurthams.push(getWindow(7));
      break;
    case 3: // Wednesday
      durmuhurthams.push(getWindow(8));
      break;
    case 4: // Thursday
      durmuhurthams.push(getWindow(6));
      break;
    case 5: // Friday
      durmuhurthams.push(getWindow(4));
      durmuhurthams.push(getWindow(9));
      break;
    case 6: // Saturday
      durmuhurthams.push(getWindow(1));
      durmuhurthams.push(getWindow(2));
      break;
  }

  return durmuhurthams;
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

  // Calculate new astrological elements
  const durmuhurthams = calculateDurmuhurthams(sunrise, sunset, evalTime.getDay(), timezone);
  const { varjyam, amritakalam } = getVarjyamAndAmritaKalam(evalTime, moonSidereal);
  const moonPhase = getMoonPhaseDetails(phase);

  // Sankranti check (over active calendar day, sunrise to sunrise next day)
  const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const nextSunriseSunset = getSunriseSunset(nextDay, timezone, lat, lon, alt);
  const nextSunrise = nextSunriseSunset.sunrise || new Date(evalTime.getTime() + 24 * 60 * 60 * 1000);

  const sunLongNext = getSunLongitude(nextSunrise);
  const sunSiderealNext = getSiderealLongitude(sunLongNext, nextSunrise);
  const rasiStart = Math.floor(sunSidereal / 30);
  const rasiEnd = Math.floor(sunSiderealNext / 30);

  let sankranti = null;
  if (rasiStart !== rasiEnd) {
    const transitTime = findSunTransit(evalTime, nextSunrise, rasiStart);
    const targetRasi = rasiEnd;
    sankranti = {
      name: `${SANKRANTI_NAMES[targetRasi]}`,
      time: formatLocalTime(transitTime, timezone),
      date: formatLocalDate(transitTime, timezone)
    };
  }

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
    sunset,
    durmuhurthams,
    varjyam,
    amritakalam,
    moonPhase,
    sankranti
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
