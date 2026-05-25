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
    locationLabel: APP_CONFIG.teluguCalendar.locationLabel
  };
}
