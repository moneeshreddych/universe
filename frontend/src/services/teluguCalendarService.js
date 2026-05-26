import { APP_CONFIG } from '../config/appConfig.js';
import { MASAM_NAMES, WEEKDAY_NAMES } from '../utils/constants.js';
import { formatIst } from '../utils/formatting.js';
import {
  findPreviousNewMoon,
  findTithiEnd,
  getLunarPhase,
  getMoonLongitude,
  getSiderealLongitude,
  getSunLongitude,
  getTeluguMasam
} from './astronomyService.js';

const SANKRANTI_NAMES = [
  "Mesha Sankranti", "Vrishabha Sankranti", "Mithuna Sankranti", "Karkataka Sankranti",
  "Simha Sankranti", "Kanya Sankranti", "Tula Sankranti", "Vrischika Sankranti",
  "Dhanusu Sankranti", "Makara Sankranti", "Kumbha Sankranti", "Meena Sankranti"
];

const VARJYAM_OFFSETS = [
  50, 24, 30, 40, 14, 11, 30, 20, 32, 30, 20, 18, 21, 20, 14, 14, 10, 14, 56, 24, 20, 10, 10, 18, 16, 24, 30
];

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }
  return response.json();
}

export async function loadTeluguCalendarData() {
  const { tithis, nakshatras, samvatsarams } = APP_CONFIG.dataPaths;
  const [tithiNames, nakshatraNames, samvatsaraNames] = await Promise.all([
    loadJson(tithis),
    loadJson(nakshatras),
    loadJson(samvatsarams)
  ]);

  return { tithiNames, nakshatraNames, samvatsaraNames };
}

function getUgadiDate(year) {
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

function getSamvatsaram(date, samvatsaraNames) {
  let teluguYear = date.getFullYear();
  if (date < getUgadiDate(teluguYear)) {
    teluguYear -= 1;
  }
  return samvatsaraNames[((teluguYear - 1987) % 60 + 60) % 60];
}

// Client Fallback: find Nakshatra start using binary search
function findNakshatraStart(date, currentLong) {
  const currentIndex = Math.floor(currentLong / 13.333333);
  const targetLong = currentIndex * 13.333333;

  let low = new Date(date.getTime() - 36 * 60 * 60 * 1000);
  let high = new Date(date);

  for (let i = 0; i < 30; i += 1) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const midLong = getSiderealLongitude(getMoonLongitude(mid), mid);

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

// Client Fallback: find Nakshatra end using binary search
function findNakshatraEnd(date, currentLong) {
  const currentIndex = Math.floor(currentLong / 13.333333);
  const targetLong = (currentIndex + 1) * 13.333333;

  let low = new Date(date);
  let high = new Date(date.getTime() + 36 * 60 * 60 * 1000);

  for (let i = 0; i < 30; i += 1) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const midLong = getSiderealLongitude(getMoonLongitude(mid), mid);

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

// Client Fallback: calculate Varjyam & Amrita Kalam
function getVarjyamAndAmritaKalam(evalTime, moonSidereal) {
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
  const startUtc = findNakshatraStart(evalTime, moonSidereal);
  const endUtc = findNakshatraEnd(evalTime, moonSidereal);
  const duration = endUtc.getTime() - startUtc.getTime();

  const ghatiOffset = VARJYAM_OFFSETS[nakshatraIndex];

  const varjyamStart = new Date(startUtc.getTime() + (ghatiOffset / 60) * duration);
  const varjyamEnd = new Date(varjyamStart.getTime() + (4 / 60) * duration);

  const amritaGhatiOffset = (ghatiOffset + 42) % 60;
  const amritaStart = new Date(startUtc.getTime() + (amritaGhatiOffset / 60) * duration);
  const amritaEnd = new Date(amritaStart.getTime() + (4 / 60) * duration);

  return {
    varjyam: { start: varjyamStart, end: varjyamEnd },
    amritakalam: { start: amritaStart, end: amritaEnd }
  };
}

// Client Fallback: calculate Durmuhurthams (approximating 06:00 to 18:00 local time)
function calculateDurmuhurthams(date, weekdayIndex) {
  // Approximate local sunrise as 6:00 AM and sunset as 6:00 PM
  const rise = new Date(date);
  rise.setHours(6, 0, 0, 0);
  const set = new Date(date);
  set.setHours(18, 0, 0, 0);

  const riseMs = rise.getTime();
  const setMs = set.getTime();
  const dayLength = setMs - riseMs;
  const partLength = dayLength / 15;

  const getWindowDisplay = (partIndex) => {
    const start = new Date(riseMs + (partIndex - 1) * partLength);
    const end = new Date(riseMs + partIndex * partLength);
    const formatTime = (d) => {
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };
    return {
      start,
      end,
      display: `${formatTime(start)} - ${formatTime(end)}`
    };
  };

  const durmuhurthams = [];

  switch (weekdayIndex) {
    case 0:
      durmuhurthams.push(getWindowDisplay(14));
      break;
    case 1:
      durmuhurthams.push(getWindowDisplay(9));
      durmuhurthams.push(getWindowDisplay(12));
      break;
    case 2:
      durmuhurthams.push(getWindowDisplay(3));
      durmuhurthams.push(getWindowDisplay(7));
      break;
    case 3:
      durmuhurthams.push(getWindowDisplay(8));
      break;
    case 4:
      durmuhurthams.push(getWindowDisplay(6));
      break;
    case 5:
      durmuhurthams.push(getWindowDisplay(4));
      durmuhurthams.push(getWindowDisplay(9));
      break;
    case 6:
      durmuhurthams.push(getWindowDisplay(1));
      durmuhurthams.push(getWindowDisplay(2));
      break;
  }

  return durmuhurthams;
}

// Client Fallback: get Moon Phase details
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

export function calculateTeluguCalendar(date, data) {
  const selectedDate = new Date(date);
  const phase = getLunarPhase(selectedDate);
  const tithiNumber = Math.floor(phase / 12) + 1;
  const paksha = tithiNumber <= 15 ? 'Shukla Paksham' : 'Krishna Paksham';
  const tithiBaseName = tithiNumber === 30 ? 'Amavasya' : data.tithiNames[(tithiNumber - 1) % 15];
  const previousNewMoon = findPreviousNewMoon(selectedDate, phase);
  const masam = getTeluguMasam(previousNewMoon);
  const tithiEndDate = findTithiEnd(selectedDate, phase);
  const moonSidereal = getSiderealLongitude(getMoonLongitude(selectedDate), selectedDate);
  const sunSidereal = getSiderealLongitude(getSunLongitude(selectedDate), selectedDate);
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
  const nakshatraPada = Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1;
  const samvatsaram = getSamvatsaram(selectedDate, data.samvatsaraNames);

  // Local approximations
  const durmuhurthams = calculateDurmuhurthams(selectedDate, selectedDate.getDay());
  const { varjyam, amritakalam } = getVarjyamAndAmritaKalam(selectedDate, moonSidereal);
  const moonPhase = getMoonPhaseDetails(phase);

  // Sankranti check
  const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
  const sunSiderealNext = getSiderealLongitude(getSunLongitude(nextDay), nextDay);
  const rasiStart = Math.floor(sunSidereal / 30);
  const rasiEnd = Math.floor(sunSiderealNext / 30);
  
  let sankranti = null;
  if (rasiStart !== rasiEnd) {
    sankranti = {
      name: `${SANKRANTI_NAMES[rasiEnd]}`,
      time: "Approx. Day Time",
      date: selectedDate.toISOString().split('T')[0]
    };
  }

  const formatTimeStr = (d) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  return {
    date: selectedDate,
    masam,
    paksha,
    tithiNumber,
    tithiBaseName,
    tithiDisplay: `${paksha} ${tithiBaseName}`,
    tithiEndDisplay: `Ends: ${formatIst(tithiEndDate)}`,
    nakshatram: `${data.nakshatraNames[nakshatraIndex]} - Pada ${nakshatraPada}`,
    vaaram: WEEKDAY_NAMES[selectedDate.getDay()],
    samvatsaram,
    moonLongitude: `${moonSidereal.toFixed(2)} DEG sidereal`,
    sunLongitude: `${sunSidereal.toFixed(2)} DEG sidereal`,
    locationLabel: APP_CONFIG.teluguCalendar.locationLabel,
    durmuhurthams: durmuhurthams.map(dm => ({
      start: dm.start.toISOString(),
      end: dm.end.toISOString(),
      display: dm.display
    })),
    durmuhurtham: durmuhurthams.map(dm => dm.display).join(', '),
    varjyam: {
      start: varjyam.start.toISOString(),
      end: varjyam.end.toISOString(),
      display: `${formatTimeStr(varjyam.start)} - ${formatTimeStr(varjyam.end)}`
    },
    amritakalam: {
      start: amritakalam.start.toISOString(),
      end: amritakalam.end.toISOString(),
      display: `${formatTimeStr(amritakalam.start)} - ${formatTimeStr(amritakalam.end)}`
    },
    moonPhase,
    sankranti,
    // Add default values for daily timings in offline mode
    sunrise: "06:00",
    sunset: "18:00",
    moonrise: "--:--",
    moonset: "--:--",
    yogam: "Siddhi (Approx.)",
    karanam: "Balava (Approx.)",
    rahuKalam: "Approximate",
    yamagandam: "Approximate",
    gulikaKalam: "Approximate",
    abhijitMuhurtham: "11:36 - 12:24"
  };
}
