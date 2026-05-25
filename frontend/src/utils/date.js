export function daysSinceJ2000(date) {
  return (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
}

export function toDatetimeLocalValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function createDateFromInput(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
