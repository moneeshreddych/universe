const fs = require('fs');
const content = fs.readFileSync('calendar.js', 'utf8');

const functions = [
  'initCalendar',
  'renderMainCalendar',
  'openPanchangamDetails',
  'setupCalendarEventHandlers'
];

for (const fn of functions) {
  const start = content.indexOf(`function ${fn}`);
  if (start !== -1) {
    console.log(`=== Function: ${fn} ===`);
    // Print the first 1200 characters of the function body
    console.log(content.substring(start, start + 1200));
    console.log('...\n');
  }
}
