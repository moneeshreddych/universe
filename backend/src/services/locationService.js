/**
 * Searches a location by name using the free, keyless Open-Meteo Geocoding API.
 */
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TeluguPanchangamAPI/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo Geocoding API returned status ${response.status}`);
    }

    const data = await response.json();
    if (!data.results) {
      return [];
    }

    return data.results.map(item => ({
      name: item.name,
      state: item.admin1 || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'Asia/Kolkata'
    }));
  } catch (error) {
    console.error('Error in searchLocation:', error);
    throw error;
  }
}

/**
 * Automatically looks up the local IANA timezone for a given set of coordinates.
 */
export async function lookupTimezone(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TeluguPanchangamAPI/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo Forecast API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.timezone || 'Asia/Kolkata';
  } catch (error) {
    console.error('Error in lookupTimezone:', error);
    throw error;
  }
}
