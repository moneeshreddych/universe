const fs = require('fs');
const path = require('path');

// Read source files
const starsContent = fs.readFileSync(path.join(__dirname, 'frontend', 'stars_data.js'), 'utf8');
const raasiContent = fs.readFileSync(path.join(__dirname, 'frontend', 'raasi_data.js'), 'utf8');
const calendarContent = fs.readFileSync(path.join(__dirname, 'frontend', 'calendar.js'), 'utf8');

// Combine contents to execute in node context
const code = `
${starsContent}
${raasiContent}
${calendarContent}

module.exports = { getTeluguDetailsForDate, TELUGU_MONTH_RANGES, FESTIVALS_2026 };
`;

// Write temporary file
const tempFilePath = path.join(__dirname, 'temp_combined_calendar.cjs');
fs.writeFileSync(tempFilePath, code, 'utf8');

// Require the combined file to run calculations
const { getTeluguDetailsForDate } = require(tempFilePath);

// Create directory structures
const publicApiDir = path.join(__dirname, 'frontend', 'public', 'api');
const datesDir = path.join(publicApiDir, 'dates');

if (!fs.existsSync(publicApiDir)) {
  fs.mkdirSync(publicApiDir, { recursive: true });
}
if (!fs.existsSync(datesDir)) {
  fs.mkdirSync(datesDir, { recursive: true });
}

// Generate daily details for the entire year 2026
const startDate = new Date('2026-01-01');
const endDate = new Date('2026-12-31');
const allDates = {};

console.log('Generating calendar API files...');

for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateKey = d.toISOString().split('T')[0];
  // Calculate details
  const details = getTeluguDetailsForDate(new Date(d));
  allDates[dateKey] = details;
  
  // Write individual day API endpoint
  fs.writeFileSync(
    path.join(datesDir, `${dateKey}.json`), 
    JSON.stringify(details, null, 2), 
    'utf8'
  );
}

// Write the combined annual API endpoint
fs.writeFileSync(
  path.join(publicApiDir, 'calendar_2026.json'), 
  JSON.stringify(allDates, null, 2), 
  'utf8'
);

// Clean up the temporary combined file
fs.unlinkSync(tempFilePath);

console.log('API endpoints successfully generated!');
console.log(' - Combined Year: frontend/public/api/calendar_2026.json');
console.log(' - Individual Dates: frontend/public/api/dates/2026-MM-DD.json (365 files)');
