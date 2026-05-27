import * as Astronomy from 'astronomy-engine';
import { localTimeToUtc, formatLocalDate } from '../utils/dateUtils.js';
import {
  getLahiriAyanamsa,
  getSiderealLongitude,
  getRahuTropicalLongitude,
  isPlanetRetrograde
} from '../utils/astronomyMath.js';

// Re-export utility math functions for services that consume them
export {
  getLahiriAyanamsa,
  getSiderealLongitude,
  getRahuTropicalLongitude,
  isPlanetRetrograde
};

/**
 * Calculates geocentric ecliptic longitude for any body.
 */
export function getGeocentricLongitude(body, date) {
  const geoVec = Astronomy.GeoVector(body, date, true);
  const ecliptic = Astronomy.Ecliptic(geoVec);
  return ecliptic.elon;
}

/**
 * Returns geocentric ecliptic longitude of the Sun.
 */
export function getSunLongitude(date) {
  return getGeocentricLongitude('Sun', date);
}

/**
 * Returns geocentric ecliptic longitude of the Moon.
 */
export function getMoonLongitude(date) {
  return getGeocentricLongitude('Moon', date);
}

/**
 * Computes Sunrise and Sunset for a given local date and timezone at specified coordinates.
 */
export function getSunriseSunset(date, timezone, lat, lon, alt = 0) {
  const observer = new Astronomy.Observer(lat, lon, alt);
  const startOfDayLocal = formatLocalDate(date, timezone);
  const startOfDayUtc = localTimeToUtc(startOfDayLocal, '00:00', timezone);

  // Search over 1.5 days to find the rise/set times occurring during this local calendar day
  const riseTime = Astronomy.SearchRiseSet('Sun', observer, 1, startOfDayUtc, 1.5);
  const setTime = Astronomy.SearchRiseSet('Sun', observer, -1, startOfDayUtc, 1.5);

  return {
    sunrise: riseTime ? riseTime.date : null,
    sunset: setTime ? setTime.date : null
  };
}

/**
 * Computes Moonrise and Moonset for a given local date and timezone at specified coordinates.
 */
export function getMoonriseMoonset(date, timezone, lat, lon, alt = 0) {
  const observer = new Astronomy.Observer(lat, lon, alt);
  const startOfDayLocal = formatLocalDate(date, timezone);
  const startOfDayUtc = localTimeToUtc(startOfDayLocal, '00:00', timezone);

  const riseTime = Astronomy.SearchRiseSet('Moon', observer, 1, startOfDayUtc, 1.5);
  const setTime = Astronomy.SearchRiseSet('Moon', observer, -1, startOfDayUtc, 1.5);

  return {
    moonrise: riseTime ? riseTime.date : null,
    moonset: setTime ? setTime.date : null
  };
}
