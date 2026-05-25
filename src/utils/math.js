export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

export function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
