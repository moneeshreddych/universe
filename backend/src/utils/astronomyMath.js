import * as Astronomy from 'astronomy-engine';

/**
 * Calculates Julian Date from a JavaScript Date.
 */
export function getJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Calculates the Lahiri (Chitrapaksha) Ayanamsa for a given date.
 * Based on the J2000.0 epoch base of 23°51'21.9" and precession rate.
 */
export function getLahiriAyanamsa(date) {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0
  return 23.856083 + 1.39604167 * T + 0.00030796 * T * T;
}

/**
 * Converts Tropical Longitude to Sidereal Longitude using Lahiri Ayanamsa.
 */
export function getSiderealLongitude(tropicalLongitude, date) {
  const ayanamsa = getLahiriAyanamsa(date);
  return (tropicalLongitude - ayanamsa + 360) % 360;
}

/**
 * Calculates the analytical Mean position of Rahu (Moon's ascending node).
 */
export function getRahuTropicalLongitude(date) {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525;
  // Standard IAU/astronomical formula for Moon's Mean Ascending Node (Omega)
  const lon = 125.044522 - 1934.1362608 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  return (lon % 360 + 360) % 360;
}

/**
 * Detects whether a planet is moving retrograde.
 * Evaluates the derivative of the planet's longitude over a 2-hour window.
 */
export function isPlanetRetrograde(body, date) {
  if (body === 'Sun' || body === 'Moon') {
    return false; // Luminaries are never retrograde
  }
  if (body === 'Rahu' || body === 'Ketu') {
    return true; // Nodes are always retrograde in Mean node calculations
  }

  // Calculate longitude slightly before and after
  const deltaMs = 1 * 60 * 60 * 1000; // 1 hour
  const t1 = new Date(date.getTime() - deltaMs);
  const t2 = new Date(date.getTime() + deltaMs);

  const lon1 = Astronomy.EclipticLongitude(body, t1);
  const lon2 = Astronomy.EclipticLongitude(body, t2);

  let diff = lon2 - lon1;
  // Adjust for 360-degree boundary wrap-around
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;

  return diff < 0;
}
