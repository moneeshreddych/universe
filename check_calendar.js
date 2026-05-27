const fs = require('fs');
const content = fs.readFileSync('calendar.js', 'utf8');

const regex = /function\s+(\w+)\s*\(/g;
let match;
const functions = [];
while ((match = regex.exec(content)) !== null) {
  functions.push(match[1]);
}
console.log('Defined functions in calendar.js:', functions);

// Check if specific tabs or elements are wired up
console.log("Includes renderMainCalendar:", content.includes('renderMainCalendar'));
console.log("Includes renderDailyPanchangam:", content.includes('renderDailyPanchangam'));
console.log("Includes initCalendar:", content.includes('initCalendar'));
console.log("Includes active-day:", content.includes('active-day'));
console.log("Includes view-panel:", content.includes('view-panel'));
console.log("Includes tab switching:", content.includes('tab') || content.includes('click'));
