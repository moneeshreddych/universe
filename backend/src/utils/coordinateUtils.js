export function isValidLatitude(lat) {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon) {
  return typeof lon === 'number' && !isNaN(lon) && lon >= -180 && lon <= 180;
}

export function validateCoordinates(lat, lon) {
  if (!isValidLatitude(lat)) {
    throw new Error(`Invalid latitude: ${lat}. Must be a valid number between -90 and 90.`);
  }
  if (!isValidLongitude(lon)) {
    throw new Error(`Invalid longitude: ${lon}. Must be a valid number between -180 and 180.`);
  }
}
