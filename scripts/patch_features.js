const fs = require('fs');

// 1. PATCH CALENDAR.JS
let js = fs.readFileSync('calendar.js', 'utf8');

// Replace createCalendarCell
const oldCellStart = js.indexOf('function createCalendarCell(');
const oldCellEnd = js.indexOf('function updateWidgetsAndDailyView(', oldCellStart);

if (oldCellStart !== -1 && oldCellEnd !== -1) {
  const before = js.substring(0, oldCellStart);
  const after = js.substring(oldCellEnd);

  const newCellFn = `function createCalendarCell(date, isOutsideMonth) {
  const cell = document.createElement('div');
  cell.className = 'calendar-cell';
  
  if (isOutsideMonth) {
    cell.classList.add('inactive');
    return cell;
  }

  const telugu = getTeluguDetailsForDate(date);
  
  // Highlight active selected date
  if (date.toDateString() === activePanchangamDate.toDateString()) {
    cell.classList.add('active-day');
  }

  if (telugu.festival && enabledFilters.festivals) {
    cell.classList.add('has-festival');
  }

  // Cell Header (Gregorian date number & short Tithi)
  const header = document.createElement('div');
  header.className = 'cell-top';

  const tithiLabel = document.createElement('span');
  tithiLabel.className = 'cell-tithi';
  tithiLabel.textContent = telugu.tithiShortTe;
  header.appendChild(tithiLabel);

  const gregNum = document.createElement('span');
  gregNum.className = 'cell-gregorian-date';
  gregNum.textContent = date.getDate();
  header.appendChild(gregNum);

  cell.appendChild(header);

  // Tithi end time in cell
  const tithiTime = document.createElement('div');
  tithiTime.className = 'cell-tithi-time';
  tithiTime.textContent = \`Ends: \${telugu.tithiEndTime}\`;
  cell.appendChild(tithiTime);

  // Cell Body: Nakshatra
  const nakLabel = document.createElement('div');
  nakLabel.className = 'cell-nakshatra';
  nakLabel.textContent = telugu.nakshatraNameTe.split(' ')[0]; // First word of Nakshatra name
  cell.appendChild(nakLabel);

  // Cell Festivals list
  const festContainer = document.createElement('div');
  festContainer.className = 'cell-festivals';

  if (telugu.festival && enabledFilters.festivals) {
    const festPill = document.createElement('span');
    festPill.className = 'fest-pill orange';
    festPill.textContent = telugu.festival.nameTe;
    festContainer.appendChild(festPill);
  }
  cell.appendChild(festContainer);

  // Dot indicators
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'cell-dot-indicators';
  if (telugu.festival) {
    const dot = document.createElement('span');
    dot.className = 'dot dot-fest';
    dotsContainer.appendChild(dot);
  }
  const isAuspicious = ['Sunday', 'Thursday', 'Friday'].includes(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]);
  if (isAuspicious) {
    const dot = document.createElement('span');
    dot.className = 'dot dot-auspicious';
    dotsContainer.appendChild(dot);
  }
  cell.appendChild(dotsContainer);

  // Click Handler
  cell.addEventListener('click', () => {
    activePanchangamDate = date;
    activeMasamIndex = getMasamIndexForDate(date);
    updateWidgetsAndDailyView(date);
    renderMainCalendar();
    renderMiniCalendar();
  });

  return cell;
}

`;
  js = before + newCellFn + after;
}

// Add animation triggers in setupCalendarEventHandlers and define animation helper
const animHelper = `
// Helper to trigger month transition animations on grid
function triggerGridAnimation(direction) {
  const grid = document.getElementById('main-calendar-grid');
  if (!grid) return;
  grid.classList.remove('slide-next', 'slide-prev');
  void grid.offsetWidth; // Force reflow to restart animation
  grid.classList.add(direction === 'next' ? 'slide-next' : 'slide-prev');
}
`;

// Insert helper
const idxOfInit = js.indexOf('function initCalendar()');
if (idxOfInit !== -1) {
  js = js.substring(0, idxOfInit) + animHelper + js.substring(idxOfInit);
}

// Update prev/next triggers to trigger animation
js = js.replace("prevBtn.addEventListener('click', () => {\n      activeMasamIndex--;", "prevBtn.addEventListener('click', () => {\n      activeMasamIndex--;\n      triggerGridAnimation('prev');");
js = js.replace("nextBtn.addEventListener('click', () => {\n      activeMasamIndex++;", "nextBtn.addEventListener('click', () => {\n      activeMasamIndex++;\n      triggerGridAnimation('next');");

fs.writeFileSync('calendar.js', js, 'utf8');
console.log('Successfully updated calendar.js!');

// 2. PATCH STYLE.CSS
let css = fs.readFileSync('style.css', 'utf8');

// Find inactive cell class styling and replace it
const oldInactiveStyle = `.calendar-cell.inactive {
  background-color: #f9f9f5;
  color: #bcaaa4;
}`;
const newInactiveStyle = `.calendar-cell.inactive {
  background-color: transparent;
  pointer-events: none;
  border-right: 1px solid #fdfcf0; /* blend border into background */
  border-bottom: 1px solid #fdfcf0;
}`;

if (css.includes(oldInactiveStyle)) {
  css = css.replace(oldInactiveStyle, newInactiveStyle);
} else {
  // Try replacement for different spacing
  css = css.replace(/\.calendar-cell\.inactive\s*\{[^}]*\}/g, newInactiveStyle);
}

// Append new features to style.css
const newStyles = `
/* --- New Premium Calendar Features --- */

.cell-tithi-time {
  font-size: 0.65rem;
  font-weight: 700;
  color: #b91c1c;
  opacity: 0.85;
  margin-top: 0.15rem;
  text-align: left;
}

/* Pulsing date number circle for selected active cell */
.calendar-cell.active-day .cell-gregorian-date {
  background-color: #f59e0b;
  color: #ffffff !important;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);
  animation: pulse-select 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes pulse-select {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

/* Month selecting slide transition animations */
@keyframes slide-left-fade {
  from { opacity: 0; transform: translateX(18px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-right-fade {
  from { opacity: 0; transform: translateX(-18px); }
  to { opacity: 1; transform: translateX(0); }
}

.panchangam-dates-grid.slide-next {
  animation: slide-left-fade 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}

.panchangam-dates-grid.slide-prev {
  animation: slide-right-fade 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}
`;

css += newStyles;
fs.writeFileSync('style.css', css, 'utf8');
console.log('Successfully updated style.css!');
