/**
 * Gets the timezone offset in milliseconds for a specific date and timeZone.
 * Positive for timezones ahead of UTC, negative for timezones behind.
 */
export function getTimezoneOffset(date, timeZone) {
  const tzParts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  }).formatToParts(date);

  const partVal = (type) => parseInt(tzParts.find(p => p.type === type).value, 10);

  const year = partVal('year');
  const month = partVal('month') - 1;
  const day = partVal('day');
  let hour = partVal('hour');
  if (hour === 24) hour = 0; // Handle JS engines that output 24 instead of 0
  const minute = partVal('minute');
  const second = partVal('second');

  const utcDate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  const tzDate = Date.UTC(year, month, day, hour, minute, second);

  return tzDate - utcDate;
}

/**
 * Parses a YYYY-MM-DD date and a local time (HH:MM) in a specific timezone to a UTC Date.
 */
export function localTimeToUtc(dateStr, timeStr, timezone) {
  const utcBase = new Date(`${dateStr}T${timeStr}:00Z`);
  const offset = getTimezoneOffset(utcBase, timezone);
  return new Date(utcBase.getTime() - offset);
}

/**
 * Formats a Date object as YYYY-MM-DD in the given timezone.
 */
export function formatLocalDate(date, timezone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object as HH:mm in the given timezone.
 */
export function formatLocalTime(date, timezone) {
  if (!date) return '--:--';
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return formatter.format(date);
}

/**
 * Validates whether a string is a valid IANA timezone.
 */
export function isValidTimezone(timezone) {
  if (!timezone) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (e) {
    return false;
  }
}
