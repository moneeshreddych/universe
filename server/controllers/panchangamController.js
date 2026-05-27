import {
  getPanchangamData,
  getMuhurthams,
  findTithiEnd,
  findNakshatraEnd
} from '../services/panchangamService.js';
import { getFestivalsForYear } from '../services/festivalService.js';
import {
  getLahiriAyanamsa,
  getSiderealLongitude,
  getSunLongitude,
  getMoonLongitude,
  getRahuTropicalLongitude,
  isPlanetRetrograde,
  getMoonriseMoonset,
  getGeocentricLongitude
} from '../services/astronomyService.js';
import {
  formatLocalDate,
  formatLocalTime,
  isValidTimezone,
  localTimeToUtc
} from '../utils/dateUtils.js';
import { searchLocation, lookupTimezone } from '../services/locationService.js';
import { validateCoordinates } from '../utils/coordinateUtils.js';
import { NAKSHATRA_NAMES } from '../data/nakshatras.js';
import { TITHI_NAMES } from '../data/tithis.js';

const RASI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karkataka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanusu', 'Makara', 'Kumbha', 'Meena'
];

// Helper: Parse and validate query parameters asynchronously
async function parseParams(req) {
  let timezone = req.query.timezone || req.query.tz; // support tz or timezone
  let lat = req.query.lat ? parseFloat(req.query.lat) : null;
  let lon = req.query.lon ? parseFloat(req.query.lon) : null;
  const alt = req.query.alt ? parseFloat(req.query.alt) : 0;

  let locationName = null;

  // 1. Resolve location from city search string
  if (req.query.location) {
    const query = req.query.location.trim();
    const results = await searchLocation(query);
    if (results.length === 0) {
      throw new Error(`Location not found: "${query}"`);
    }
    const loc = results[0];
    lat = loc.latitude;
    lon = loc.longitude;
    timezone = loc.timezone;
    locationName = `${loc.name}, ${loc.state ? loc.state + ', ' : ''}${loc.country}`;
  }

  // 2. Set default coordinates (Hyderabad) if not resolved
  if (lat === null || lon === null) {
    lat = 17.3850;
    lon = 78.4867;
    if (!timezone) timezone = 'Asia/Kolkata';
    locationName = 'Hyderabad, Telangana, India';
  } else {
    // Validate coordinates boundaries
    validateCoordinates(lat, lon);
  }

  // 3. Resolve timezone dynamically from coordinates if not specified
  if (!timezone) {
    try {
      timezone = await lookupTimezone(lat, lon);
    } catch (e) {
      timezone = 'Asia/Kolkata'; // fallback
    }
  }

  if (!isValidTimezone(timezone)) {
    throw new Error(`Invalid timezone: "${timezone}"`);
  }

  // 4. Resolve date
  let dateStr = req.query.date;
  let dateObj = new Date();
  if (dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${dateStr}`);
    }
    dateObj = new Date(dateStr + 'T12:00:00Z'); // Noon UTC baseline
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date value: ${dateStr}`);
    }
  } else {
    dateStr = formatLocalDate(dateObj, timezone);
  }

  if (isNaN(alt)) {
    throw new Error(`Elevation (alt) must be a valid number. Got: ${req.query.alt}`);
  }

  // Format a fallback coordinate label if no location name was resolved
  if (!locationName) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    locationName = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
  }

  return { date: dateObj, dateStr, timezone, lat, lon, alt, locationName };
}

/**
 * Controller: GET /api/panchangam
 */
export async function getPanchangam(req, res, next) {
  try {
    const { date, timezone, lat, lon, alt, locationName } = await parseParams(req);
    const data = getPanchangamData(date, timezone, lat, lon, alt);
    
    // Calculate Moonrise and Moonset
    const { moonrise, moonset } = getMoonriseMoonset(date, timezone, lat, lon, alt);

    // Calculate Muhurthams
    const weekdayIndex = data.evalTime.getDay();
    const m = getMuhurthams(data.sunrise, data.sunset, weekdayIndex, timezone);

    res.json({
      date: data.date,
      location: locationName.includes(',') ? locationName.split(',')[0].trim() : locationName,
      timezone: timezone,
      masam: data.masam,
      paksham: data.paksham,
      tithi: data.tithi,
      nakshatram: data.nakshatram,
      nakshatra: data.nakshatram,
      yogam: data.yogam,
      yoga: data.yogam,
      karanam: data.karanam,
      karana: data.karanam,
      vaaram: data.vaaram,
      samvatsaram: data.samvatsaram,
      sunrise: formatLocalTime(data.sunrise, timezone),
      sunset: formatLocalTime(data.sunset, timezone),
      moonrise: formatLocalTime(moonrise, timezone),
      moonset: formatLocalTime(moonset, timezone),
      rahuKalam: m.rahuKalam,
      gulikaKalam: m.gulikaKalam,
      yamagandam: m.yamagandam,
      abhijitMuhurtham: m.abhijit,
      abhijit: m.abhijit,
      locationLabel: `${locationName} (${timezone})`
    });
  } catch (error) {
    console.error('Error in getPanchangam:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Controller: GET /api/grahas
 */
export async function getGrahas(req, res, next) {
  try {
    const { date, timezone } = await parseParams(req);
    const evalTime = localTimeToUtc(formatLocalDate(date, timezone), '12:00', timezone);
    const ayanamsa = getLahiriAyanamsa(evalTime);

    const bodies = [
      { id: 'Sun', name: 'Sun' },
      { id: 'Moon', name: 'Moon' },
      { id: 'Mars', name: 'Mars' },
      { id: 'Mercury', name: 'Mercury' },
      { id: 'Jupiter', name: 'Jupiter' },
      { id: 'Venus', name: 'Venus' },
      { id: 'Saturn', name: 'Saturn' },
      { id: 'Rahu', name: 'Rahu' },
      { id: 'Ketu', name: 'Ketu' }
    ];

    const results = [];
    for (const body of bodies) {
      let tropLong;
      if (body.id === 'Sun') {
        tropLong = getSunLongitude(evalTime);
      } else if (body.id === 'Moon') {
        tropLong = getMoonLongitude(evalTime);
      } else if (body.id === 'Rahu') {
        tropLong = getRahuTropicalLongitude(evalTime);
      } else if (body.id === 'Ketu') {
        tropLong = (getRahuTropicalLongitude(evalTime) + 180) % 360;
      } else {
        tropLong = getGeocentricLongitude(body.id, evalTime);
      }

      const siderealLongitude = (tropLong - ayanamsa + 360) % 360;
      const rasiIndex = Math.floor(siderealLongitude / 30);
      const nakshatraIndex = Math.floor(siderealLongitude / (360 / 27));
      const pada = Math.floor((siderealLongitude % (360 / 27)) / (360 / 108)) + 1;

      results.push({
        name: body.name,
        siderealLongitude: `${siderealLongitude.toFixed(2)} DEG`,
        rasi: RASI_NAMES[rasiIndex],
        nakshatra: `${NAKSHATRA_NAMES[nakshatraIndex]} - Pada ${pada}`,
        retrograde: isPlanetRetrograde(body.id, evalTime)
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error in getGrahas:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Controller: GET /api/tithi
 */
export async function getTithi(req, res, next) {
  try {
    const { date, timezone, lat, lon, alt } = await parseParams(req);
    const tempPanch = getPanchangamData(date, timezone, lat, lon, alt);
    const evalTime = tempPanch.evalTime;

    const sunLong = getSunLongitude(evalTime);
    const moonLong = getMoonLongitude(evalTime);
    const elongation = (moonLong - sunLong + 360) % 360;
    const tithiNumber = Math.floor(elongation / 12) + 1;
    const paksham = tithiNumber <= 15 ? 'Shukla Paksham' : 'Krishna Paksham';
    const tithiIndex = (tithiNumber - 1) % 15;
    const tithiName = tithiNumber === 30 ? 'Amavasya' : TITHI_NAMES[tithiIndex];

    const endUtc = findTithiEnd(evalTime, elongation);

    res.json({
      date: formatLocalDate(date, timezone),
      tithiNumber,
      tithi: tithiName,
      paksham,
      elongation: parseFloat(elongation.toFixed(2)),
      endsAt: endUtc.toISOString()
    });
  } catch (error) {
    console.error('Error in getTithi:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Controller: GET /api/nakshatra
 */
export async function getNakshatra(req, res, next) {
  try {
    const { date, timezone, lat, lon, alt } = await parseParams(req);
    const tempPanch = getPanchangamData(date, timezone, lat, lon, alt);
    const evalTime = tempPanch.evalTime;

    const moonLong = getMoonLongitude(evalTime);
    const ayanamsa = getLahiriAyanamsa(evalTime);
    const moonSidereal = (moonLong - ayanamsa + 360) % 360;

    const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
    const pada = Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1;
    const nakshatraName = NAKSHATRA_NAMES[nakshatraIndex];

    const endUtc = findNakshatraEnd(evalTime, moonSidereal);

    res.json({
      date: formatLocalDate(date, timezone),
      nakshatraNumber: nakshatraIndex + 1,
      nakshatraName,
      pada,
      siderealLongitude: parseFloat(moonSidereal.toFixed(2)),
      endsAt: endUtc.toISOString()
    });
  } catch (error) {
    console.error('Error in getNakshatra:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Controller: GET /api/muhurtham
 */
export async function getMuhurtham(req, res, next) {
  try {
    const { date, timezone, lat, lon, alt } = await parseParams(req);
    const data = getPanchangamData(date, timezone, lat, lon, alt);
    const weekdayIndex = data.evalTime.getDay();

    const m = getMuhurthams(data.sunrise, data.sunset, weekdayIndex, timezone);

    res.json({
      date: data.date,
      timezone,
      rahuKalam: m.rahuKalam,
      gulikaKalam: m.gulikaKalam,
      yamagandam: m.yamagandam,
      abhijit: m.abhijit
    });
  } catch (error) {
    console.error('Error in getMuhurtham:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Controller: GET /api/festivals
 */
export async function getFestivals(req, res, next) {
  try {
    const timezone = req.query.timezone || req.query.tz || 'Asia/Kolkata';
    if (!isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    const yearStr = req.query.year;
    let year = new Date().getFullYear();
    if (yearStr) {
      year = parseInt(yearStr, 10);
      if (isNaN(year) || year < 1900 || year > 2100) {
        throw new Error(`Year must be a number between 1900 and 2100. Got: ${yearStr}`);
      }
    }

    const lat = req.query.lat ? parseFloat(req.query.lat) : 17.3850;
    const lon = req.query.lon ? parseFloat(req.query.lon) : 78.4867;
    const alt = req.query.alt ? parseFloat(req.query.alt) : 0;

    const list = getFestivalsForYear(year, timezone, lat, lon, alt);
    res.json(list);
  } catch (error) {
    console.error('Error in getFestivals:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Controller: GET /api/panchangam/month
 */
export async function getMonthPanchangam(req, res, next) {
  try {
    let year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    let month = req.query.month ? parseInt(req.query.month) : (new Date().getMonth() + 1); // 1-indexed

    if (isNaN(year) || year < 1900 || year > 2100) {
      throw new Error(`Invalid year: ${req.query.year}`);
    }
    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error(`Invalid month: ${req.query.month}`);
    }

    let timezone = req.query.timezone || req.query.tz;
    let lat = req.query.lat ? parseFloat(req.query.lat) : null;
    let lon = req.query.lon ? parseFloat(req.query.lon) : null;
    const alt = req.query.alt ? parseFloat(req.query.alt) : 0;
    
    // Resolve location
    let locationName = null;
    if (req.query.location) {
      const query = req.query.location.trim();
      const results = await searchLocation(query);
      if (results.length > 0) {
        const loc = results[0];
        lat = loc.latitude;
        lon = loc.longitude;
        timezone = loc.timezone;
        locationName = `${loc.name}, ${loc.state ? loc.state + ', ' : ''}${loc.country}`;
      }
    }

    if (lat === null || lon === null) {
      lat = 17.3850;
      lon = 78.4867;
      if (!timezone) timezone = 'Asia/Kolkata';
      locationName = 'Hyderabad, Telangana, India';
    } else {
      validateCoordinates(lat, lon);
    }

    if (!timezone) {
      try {
        timezone = await lookupTimezone(lat, lon);
      } catch (e) {
        timezone = 'Asia/Kolkata';
      }
    }

    if (!isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: "${timezone}"`);
    }

    // Determine grid start: 1st of the month, then rewind to Sunday
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0));
    const startDayOfWeek = firstOfMonth.getUTCDay();
    
    const gridStartDate = new Date(firstOfMonth);
    gridStartDate.setUTCDate(firstOfMonth.getUTCDate() - startDayOfWeek);

    const days = [];
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(gridStartDate);
      currentDate.setUTCDate(gridStartDate.getUTCDate() + i);

      const data = getPanchangamData(currentDate, timezone, lat, lon, alt);
      const dateKey = data.date;
      const isOutsideMonth = currentDate.getUTCMonth() !== (month - 1);

      days.push({
        date: dateKey,
        isOutsideMonth,
        dayOfMonth: currentDate.getUTCDate(),
        dayOfWeek: currentDate.getUTCDay(),
        masam: data.masam,
        paksham: data.paksham,
        tithi: data.tithi,
        nakshatram: data.nakshatram,
        vaaram: data.vaaram,
        samvatsaram: data.samvatsaram,
        sunrise: formatLocalTime(data.sunrise, timezone),
        sunset: formatLocalTime(data.sunset, timezone),
      });
    }

    res.json({
      year,
      month,
      timezone,
      location: locationName.includes(',') ? locationName.split(',')[0].trim() : locationName,
      locationLabel: `${locationName} (${timezone})`,
      lat,
      lon,
      days
    });

  } catch (error) {
    console.error('Error in getMonthPanchangam:', error);
    res.status(400).json({ error: error.message });
  }
}
