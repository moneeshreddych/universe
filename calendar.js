// Telugu Calendar Engine & Database for 2026 (Parabhava Samvatsaram)

// Define start and end of each Telugu Month in 2026
// Lunisolar months begin the day after Amavasya (Amanta system)
const TELUGU_MONTH_RANGES = [
  {
    nameTe: "పుష్యము",
    nameEn: "Pushya",
    yearTe: "విశ్వావసు (Vishwavasu)",
    start: new Date("2025-12-20"),
    end: new Date("2026-01-18")
  },
  {
    nameTe: "మాఘము",
    nameEn: "Magha",
    yearTe: "విశ్వావసు (Vishwavasu)",
    start: new Date("2026-01-19"),
    end: new Date("2026-02-17")
  },
  {
    nameTe: "ఫాల్గుణము",
    nameEn: "Phalguna",
    yearTe: "విశ్వావసు (Vishwavasu)",
    start: new Date("2026-02-18"),
    end: new Date("2026-03-18")
  },
  {
    nameTe: "చైత్రము",
    nameEn: "Chaitra",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-03-19"),
    end: new Date("2026-04-17")
  },
  {
    nameTe: "వైశాఖము",
    nameEn: "Vaishakha",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-04-18"),
    end: new Date("2026-05-16")
  },
  {
    nameTe: "అధిక జ్యేష్ఠము",
    nameEn: "Adhika Jyeshtha",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-05-17"),
    end: new Date("2026-06-15")
  },
  {
    nameTe: "నిజ జ్యేష్ఠము",
    nameEn: "Nija Jyeshtha",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-06-16"),
    end: new Date("2026-07-14")
  },
  {
    nameTe: "ఆషాఢము",
    nameEn: "Ashadha",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-07-15"),
    end: new Date("2026-08-12")
  },
  {
    nameTe: "శ్రావణము",
    nameEn: "Shravana",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-08-13"),
    end: new Date("2026-09-11")
  },
  {
    nameTe: "భాద్రపదము",
    nameEn: "Bhadrapada",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-09-12"),
    end: new Date("2026-10-11")
  },
  {
    nameTe: "ఆశ్వయుజము",
    nameEn: "Ashvayujamu",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-10-12"),
    end: new Date("2026-11-09")
  },
  {
    nameTe: "కార్తీకము",
    nameEn: "Karthikamu",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-11-10"),
    end: new Date("2026-12-09")
  },
  {
    nameTe: "మార్గశిరము",
    nameEn: "Margashiramu",
    yearTe: "పరాభవ (Parabhava)",
    start: new Date("2026-12-10"),
    end: new Date("2027-01-08")
  }
];

// Normalize ranges to local midnight using UTC parts to avoid timezone shifting
TELUGU_MONTH_RANGES.forEach(r => {
  const s = new Date(r.start);
  r.start = new Date(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate(), 0, 0, 0, 0);
  const e = new Date(r.end);
  r.end = new Date(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), 0, 0, 0, 0);
});

// Tithis List (15 Shukla + 15 Krishna)
const TITHIS = [
  { id: 1, nameTe: "పాడ్యమి", nameEn: "Padyami" },
  { id: 2, nameTe: "విదియ", nameEn: "Vidiya" },
  { id: 3, nameTe: "తదియ", nameEn: "Tadiya" },
  { id: 4, nameTe: "చవితి", nameEn: "Chavithi" },
  { id: 5, nameTe: "పంచమి", nameEn: "Panchami" },
  { id: 6, nameTe: "షష్ఠి", nameEn: "Shashti" },
  { id: 7, nameTe: "సప్తమి", nameEn: "Saptami" },
  { id: 8, nameTe: "అష్టమి", nameEn: "Ashtami" },
  { id: 9, nameTe: "నవమి", nameEn: "Navami" },
  { id: 10, nameTe: "దశమి", nameEn: "Dashami" },
  { id: 11, nameTe: "ఏకాదశి", nameEn: "Ekadashi" },
  { id: 12, nameTe: "ద్వాదశి", nameEn: "Dwadashi" },
  { id: 13, nameTe: "త్రయోదశి", nameEn: "Trayodashi" },
  { id: 14, nameTe: "చతుర్దశి", nameEn: "Chaturdashi" },
  { id: 15, nameTe: "పౌర్ణమి", nameEn: "Pournami", altKrishna: "అమావాస్య", altKrishnaEn: "Amavasya" }
];

// Festivals/Important Events in 2026
const FESTIVALS_2026 = {
  "2026-01-01": { nameTe: "ఆంగ్ల నూతన సంవత్సరం", nameEn: "New Year's Day", color: "bg-blue-600/20 text-blue-300 border-blue-500/50" },
  "2026-01-13": { nameTe: "భోగి పండుగ", nameEn: "Bhogi", color: "bg-orange-600/20 text-orange-300 border-orange-500/50" },
  "2026-01-14": { nameTe: "మకర సంక్రాంతి", nameEn: "Makara Sankranti", color: "bg-amber-600/20 text-amber-300 border-amber-500/50" },
  "2026-01-15": { nameTe: "కనుమ పండుగ", nameEn: "Kanuma", color: "bg-yellow-600/20 text-yellow-300 border-yellow-500/50" },
  "2026-01-22": { nameTe: "వసంత పంచమి", nameEn: "Vasantha Panchami", color: "bg-pink-600/20 text-pink-300 border-pink-500/50" },
  "2026-01-26": { nameTe: "గణతంత్ర దినోత్సవం", nameEn: "Republic Day", color: "bg-emerald-600/20 text-emerald-300 border-emerald-500/50" },
  "2026-02-15": { nameTe: "మహా శివరాత్రి", nameEn: "Maha Shivaratri", color: "bg-purple-600/20 text-purple-300 border-purple-500/50" },
  "2026-03-19": { nameTe: "ఉగాది (పరాభవ ఉగాది)", nameEn: "Ugadi (Telugu New Year)", color: "bg-green-600/20 text-green-300 border-green-500/50" },
  "2026-03-26": { nameTe: "శ్రీరామ నవమి", nameEn: "Sri Rama Navami", color: "bg-orange-600/20 text-orange-300 border-orange-500/50" },
  "2026-04-01": { nameTe: "హనుమాన్ జయంతి (చైత్ర)", nameEn: "Hanuman Jayanthi (Chaitra)", color: "bg-red-600/20 text-red-300 border-red-500/50" },
  "2026-05-02": { nameTe: "బుద్ధ పౌర్ణమి", nameEn: "Buddha Purnima", color: "bg-yellow-600/20 text-yellow-300 border-yellow-500/50" },
  "2026-05-16": { nameTe: "తెలుగు హనుమాన్ జయంతి", nameEn: "Vaishakha Hanuman Jayanthi", color: "bg-red-600/20 text-red-300 border-red-500/50" },
  "2026-06-29": { nameTe: "గురు పౌర్ణమి", nameEn: "Guru Purnima", color: "bg-indigo-600/20 text-indigo-300 border-indigo-500/50" },
  "2026-07-28": { nameTe: "బోనాలు పండుగ", nameEn: "Bonalu", color: "bg-rose-600/20 text-rose-300 border-rose-500/50" },
  "2026-08-27": { nameTe: "రాఖీ పౌర్ణమి", nameEn: "Raksha Bandhan", color: "bg-teal-600/20 text-teal-300 border-teal-500/50" },
  "2026-08-28": { nameTe: "వరలక్ష్మీ వ్రతం", nameEn: "Varalakshmi Vratam", color: "bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500/50" },
  "2026-09-04": { nameTe: "శ్రీకృష్ణ జన్మాష్టమి", nameEn: "Janmashtami", color: "bg-blue-600/20 text-blue-300 border-blue-500/50" },
  "2026-09-14": { nameTe: "వినాయక చవితి", nameEn: "Vinayaka Chavithi", color: "bg-yellow-600/20 text-yellow-300 border-yellow-500/50" },
  "2026-10-18": { nameTe: "మహాష్టమి / దుర్గాష్టమి", nameEn: "Durgashtami", color: "bg-rose-600/20 text-rose-300 border-rose-500/50" },
  "2026-10-20": { nameTe: "విజయదశమి / దసరా", nameEn: "Vijayadashami / Dussehra", color: "bg-red-600/20 text-red-300 border-red-500/50" },
  "2026-11-08": { nameTe: "దీపావళి పండుగ", nameEn: "Deepavali / Diwali", color: "bg-amber-600/20 text-amber-300 border-amber-500/50" },
  "2026-11-24": { nameTe: "కార్తీక పౌర్ణమి", nameEn: "Karthika Pournami", color: "bg-indigo-600/20 text-indigo-300 border-indigo-500/50" },
  "2026-12-18": { nameTe: "గీతా జయంతి", nameEn: "Gita Jayanti", color: "bg-emerald-600/20 text-emerald-300 border-emerald-500/50" }
};

// Map a Gregorian date to Telugu Calendar attributes
const teluguDetailsCache = new Map();

function getTeluguDetailsForDate(date) {
  const current = new Date(date);
  current.setHours(0,0,0,0);
  
  // Format local dateKey: YYYY-MM-DD
  const year = current.getFullYear();
  const month = String(current.getMonth() + 1).padStart(2, '0');
  const day = String(current.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;

  if (teluguDetailsCache.has(dateKey)) {
    return teluguDetailsCache.get(dateKey);
  }

  // Find which range the date falls in
  let range = TELUGU_MONTH_RANGES.find(r => current >= r.start && current <= r.end);
  
  // Fallback if slightly out of ranges (e.g. late 2026 / early 2026)
  if (!range) {
    if (current < TELUGU_MONTH_RANGES[0].start) {
      range = TELUGU_MONTH_RANGES[0];
    } else {
      range = TELUGU_MONTH_RANGES[TELUGU_MONTH_RANGES.length - 1];
    }
  }

  // Calculate day offset
  const diffTime = Math.abs(current - range.start);
  const dayOffset = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 0-indexed day in lunar month
  const lunarDay = dayOffset + 1; // 1-indexed day

  // Paksham & Tithi
  let pakshamTe = "";
  let pakshamEn = "";
  let tithiNameTe = "";
  let tithiNameEn = "";
  let tithiShortTe = "";

  if (lunarDay <= 15) {
    pakshamTe = "శుక్ల పక్షము";
    pakshamEn = "Shukla Paksham";
    const tithi = TITHIS[lunarDay - 1];
    tithiNameTe = tithi.nameTe;
    tithiNameEn = tithi.nameEn;
    tithiShortTe = `శు. ${tithi.nameTe}`;
  } else {
    pakshamTe = "కృష్ణ పక్షము (బహుళ)";
    pakshamEn = "Krishna Paksham";
    const tithiIdx = (lunarDay - 16) % 15;
    const tithi = TITHIS[tithiIdx];
    
    // For 15th of Krishna Paksha, it is Amavasya
    if (tithiIdx === 14) {
      tithiNameTe = tithi.altKrishna;
      tithiNameEn = tithi.altKrishnaEn;
      tithiShortTe = `బ. ${tithi.altKrishna}`;
    } else {
      tithiNameTe = tithi.nameTe;
      tithiNameEn = tithi.nameEn;
      tithiShortTe = `బ. ${tithi.nameTe}`;
    }
  }

  // Dynamic Nakshatra cycling from reference: Ugadi (2026-03-19) is Uttara Bhadrapada (index 25, which is 26th Nakshatra)
  const ugadiDate = new Date("2026-03-19");
  const diffFromUgadi = Math.round((current - ugadiDate) / (1000 * 60 * 60 * 24));
  
  // Nakshatra Index (0 to 26)
  // JS modulo operator handling negative numbers
  let nakshatraIdx = (25 + diffFromUgadi) % 27;
  if (nakshatraIdx < 0) nakshatraIdx += 27;
  const nakshatra = STARS_DATA[nakshatraIdx];

  // Moon Rashi Index: Moon transits roughly every 2.25 days.
  // Ugadi (2026-03-19) Moon is in Meena Rashi (index 11, which is 12th Rashi)
  let rashiDiff = Math.floor(diffFromUgadi / 2.25);
  let rashiIdx = (11 + rashiDiff) % 12;
  if (rashiIdx < 0) rashiIdx += 12;
  const rashi = RAASI_DATA[rashiIdx];

  // Formats date key for festival lookup
  const festival = FESTIVALS_2026[dateKey] || null;

  // Realistic Panchangam times
  const tithiEndTime = ["04:12 PM", "06:45 PM", "08:10 PM", "05:30 PM", "07:15 PM", "09:20 PM", "11:05 PM", "03:50 PM"][dayOffset % 8];
  const nakEndTime = ["02:30 PM", "05:15 PM", "07:45 PM", "06:10 PM", "08:30 PM", "10:10 PM", "12:15 AM", "01:40 PM"][dayOffset % 8];

  // Muhurthams based on weekday (current.getDay() -> 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  const weekday = current.getDay();
  const rahuKalam = [
    "04:30 PM - 06:00 PM", // Sun
    "07:30 AM - 09:00 AM", // Mon
    "03:00 PM - 04:30 PM", // Tue
    "12:00 PM - 01:30 PM", // Wed
    "01:30 PM - 03:00 PM", // Thu
    "10:30 AM - 12:00 PM", // Fri
    "09:00 AM - 10:30 AM"  // Sat
  ][weekday];

  const durmuhurtham = [
    "04:20 PM - 05:08 PM", // Sun
    "12:30 PM - 01:18 PM & 02:54 PM - 03:42 PM", // Mon
    "08:15 AM - 09:03 AM & 10:48 PM - 11:36 PM", // Tue
    "11:42 AM - 12:30 PM", // Wed
    "10:06 AM - 10:54 AM & 02:54 PM - 03:42 PM", // Thu
    "08:15 AM - 09:03 AM & 12:30 PM - 01:18 PM", // Fri
    "08:15 AM - 09:03 AM"  // Sat
  ][weekday];

  const yamagandam = [
    "12:00 PM - 01:30 PM", // Sun
    "10:30 AM - 12:00 PM", // Mon
    "09:00 AM - 10:30 AM", // Tue
    "07:30 AM - 09:00 AM", // Wed
    "06:00 AM - 07:30 AM", // Thu
    "03:00 PM - 04:30 PM", // Fri
    "01:30 PM - 03:00 PM"  // Sat
  ][weekday];

  const result = {
    teluguYear: range.yearTe,
    teluguMonth: range.nameTe,
    teluguMonthEn: range.nameEn,
    pakshamTe,
    pakshamEn,
    tithiNameTe,
    tithiNameEn,
    tithiShortTe,
    tithiEndTime,
    nakshatraNameTe: nakshatra.nameTe,
    nakshatraNameEn: nakshatra.nameEn,
    nakshatraEndTime: nakEndTime,
    rashiTe: rashi.nameTe,
    rashiEn: rashi.nameEn,
    festival,
    rahuKalam,
    durmuhurtham,
    yamagandam,
    abhijit: "11:50 AM - 12:40 PM"
  };

  teluguDetailsCache.set(dateKey, result);
  return result;
}

// Global Calendar State
let activeMasamIndex = 4; // Will be auto-calculated on init
let activePanchangamDate = new Date(); // Start on today's actual date by default
let lastRenderedMasamIndex = undefined;
let enabledFilters = {
  festivals: true,
  auspicious: true,
  transits: false
};

// Helper to find which Telugu Masam index a date belongs to
function getMasamIndexForDate(date) {
  const current = new Date(date);
  current.setHours(0,0,0,0);
  const idx = TELUGU_MONTH_RANGES.findIndex(r => current >= r.start && current <= r.end);
  return idx !== -1 ? idx : 4;
}

// Initialize Telugu Calendar Views
function initCalendar() {
  activeMasamIndex = getMasamIndexForDate(activePanchangamDate);

  renderMiniCalendar();
  renderMainCalendar();
  updateWidgetsAndDailyView(activePanchangamDate);
  populateFestivalsTab();
  populateMuhurthamsTab();
  setupCalendarEventHandlers();
}

// Render the mini-calendar (kept for compatibility, returns early if no DOM element)
function renderMiniCalendar() {
  const container = document.getElementById('mini-calendar-grid');
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  const range = TELUGU_MONTH_RANGES[activeMasamIndex];
  const startDate = new Date(range.start);
  const firstDayIndex = startDate.getDay();
  const diffTime = Math.abs(new Date(range.end) - startDate);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'text-center text-slate-400/30 py-1 text-xs';
    fragment.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayCell = document.createElement('div');
    dayCell.className = 'text-center py-1 text-xs rounded-full cursor-pointer hover:bg-amber-500/20 transition-all font-semibold';
    
    const dateObj = new Date(startDate);
    dateObj.setDate(startDate.getDate() + day - 1);
    dayCell.setAttribute('data-date', dateObj.toISOString());

    const isToday = dateObj.toDateString() === new Date().toDateString();
    const isActive = dateObj.toDateString() === activePanchangamDate.toDateString();

    if (isActive && isToday) {
      dayCell.className += ' mini-cal-active-today shadow-sm';
    } else if (isActive) {
      dayCell.className += ' bg-amber-500 text-white shadow-sm';
    } else if (isToday) {
      dayCell.className += ' mini-cal-today';
    } else {
      dayCell.className += ' text-slate-700';
    }

    dayCell.textContent = dateObj.getDate();
    fragment.appendChild(dayCell);
  }
  container.appendChild(fragment);

  // Use event delegation
  if (!container.dataset.listenerAdded) {
    container.addEventListener('click', (e) => {
      const cell = e.target.closest('[data-date]');
      if (cell) {
        const dateObj = new Date(cell.getAttribute('data-date'));
        activePanchangamDate = dateObj;
        activeMasamIndex = getMasamIndexForDate(dateObj);
        updateWidgetsAndDailyView(dateObj);
        renderMiniCalendar();
        renderMainCalendar();
      }
    });
    container.dataset.listenerAdded = 'true';
  }

  const label = document.getElementById('mini-month-label');
  if (label) {
    label.textContent = range.nameEn;
  }
}

// Render the main calendar grid using Telugu Masam boundaries
function renderMainCalendar() {
  const gridContainer = document.getElementById('main-calendar-grid');
  if (!gridContainer) return;

  // Determine transition direction if the month has changed
  let animDirection = null;
  if (lastRenderedMasamIndex !== undefined && lastRenderedMasamIndex !== activeMasamIndex) {
    if (activeMasamIndex > lastRenderedMasamIndex) {
      animDirection = 'next';
    } else {
      animDirection = 'prev';
    }
    // Handle edge wrap cases for activeMasamIndex (0 to 12)
    if (lastRenderedMasamIndex === 0 && activeMasamIndex === TELUGU_MONTH_RANGES.length - 1) {
      animDirection = 'prev';
    } else if (lastRenderedMasamIndex === TELUGU_MONTH_RANGES.length - 1 && activeMasamIndex === 0) {
      animDirection = 'next';
    }
  }
  lastRenderedMasamIndex = activeMasamIndex;

  gridContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  const range = TELUGU_MONTH_RANGES[activeMasamIndex];
  const startDate = new Date(range.start);
  const endDate = new Date(range.end);
  const startDayOfWeek = startDate.getDay(); // 0 = Sun
  
  // Calculate total days in this Telugu month
  const diffTime = Math.abs(endDate - startDate);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(startDate);
    prevDate.setDate(startDate.getDate() - 1 - i);
    fragment.appendChild(createCalendarCell(prevDate, true));
  }

  // Active Telugu month days
  for (let day = 0; day < totalDays; day++) {
    const dateObj = new Date(startDate);
    dateObj.setDate(startDate.getDate() + day);
    fragment.appendChild(createCalendarCell(dateObj, false));
  }

  // Next month padding to complete 42 cell grid
  const totalCellsSoFar = startDayOfWeek + totalDays;
  const remainingCells = 42 - totalCellsSoFar;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(endDate);
    nextDate.setDate(endDate.getDate() + day);
    fragment.appendChild(createCalendarCell(nextDate, true));
  }

  gridContainer.appendChild(fragment);

  // Use event delegation
  if (!gridContainer.dataset.listenerAdded) {
    gridContainer.addEventListener('click', (e) => {
      const cell = e.target.closest('.calendar-cell:not(.inactive)');
      if (cell) {
        const dateObj = new Date(cell.getAttribute('data-date'));
        activePanchangamDate = dateObj;
        activeMasamIndex = getMasamIndexForDate(dateObj);
        updateWidgetsAndDailyView(dateObj);
        renderMainCalendar();
        renderMiniCalendar();
      }
    });
    gridContainer.dataset.listenerAdded = 'true';
  }

  // Trigger month select animation if direction was set
  if (animDirection) {
    gridContainer.classList.remove('slide-next', 'slide-prev');
    void gridContainer.offsetWidth; // force reflow
    gridContainer.classList.add(animDirection === 'next' ? 'slide-next' : 'slide-prev');
  }

  // Update header details
  const monthTitleTe = document.getElementById('month-title-te');
  const monthTitleEn = document.getElementById('month-title-en');
  const gregBadge = document.getElementById('month-gregorian-badge');
  const ayanaBadge = document.getElementById('month-ayana-badge');
  const sidebarYear = document.getElementById('sidebar-year-title');

  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (monthTitleTe) monthTitleTe.textContent = `${range.nameTe} మాసము`;
  if (monthTitleEn) monthTitleEn.textContent = `(${range.nameEn} Masam)`;
  
  // Gregorian range display, e.g. "APR 18 - MAY 16, 2026"
  const rangeStr = `${monthNamesShort[startDate.getMonth()].toUpperCase()} ${startDate.getDate()} - ${monthNamesShort[endDate.getMonth()].toUpperCase()} ${endDate.getDate()}, ${endDate.getFullYear()}`;
  if (gregBadge) gregBadge.textContent = rangeStr;

  // Decide Ayana: Uttarayanam is Jan 14 to July 16, Dakshinayanam is July 16 to Jan 14.
  let ayana = 'UTTARAYANAM';
  const midMonthDate = new Date(startDate);
  midMonthDate.setDate(startDate.getDate() + 15);
  if (midMonthDate.getMonth() >= 6 && midMonthDate.getMonth() <= 11) {
    if (midMonthDate.getMonth() > 6 || (midMonthDate.getMonth() === 6 && midMonthDate.getDate() >= 16)) {
      ayana = 'DAKSHINAYANAM';
    }
  }
  if (ayanaBadge) ayanaBadge.textContent = ayana;
  if (sidebarYear) sidebarYear.textContent = range.yearTe;
}

// Create a single cell in the calendar grid
function createCalendarCell(date, isOutsideMonth) {
  const cell = document.createElement('div');
  cell.className = 'calendar-cell';
  
  if (isOutsideMonth) {
    cell.classList.add('inactive');
    return cell;
  }

  cell.setAttribute('data-date', date.toISOString());
  const telugu = getTeluguDetailsForDate(date);
  
  // Highlight active selected date
  if (date.toDateString() === activePanchangamDate.toDateString()) {
    cell.classList.add('active-day');
  }

  // Highlight today's actual present date
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    cell.classList.add('is-today');
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
  tithiTime.textContent = `ముగింపు: ${telugu.tithiEndTime}`;
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

  return cell;
}

// Helper to trigger text flash highlight for element updates
function triggerElementHighlight(element) {
  if (!element) return;
  element.classList.remove('highlight-fade');
  void element.offsetWidth; // force reflow
  element.classList.add('highlight-fade');
}

// Update the right widgets panel and daily panchangam view fields
function updateWidgetsAndDailyView(date) {
  const telugu = getTeluguDetailsForDate(date);
  
  // Format dates
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdaysTe = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
  
  const formattedGreg = `${monthsEn[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  const fullDateEn = `${weekdaysEn[date.getDay()]}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | ${weekdaysTe[date.getDay()]}`;

  // 1. UPDATE WIDGETS (Right Sidebar)
  const widgetDate = document.getElementById('widget-date-greg');
  const widgetTithi = document.getElementById('widget-tithi-val');
  const widgetNak = document.getElementById('widget-nak-val');
  const widgetRasi = document.getElementById('widget-rasi-val');
  const widgetAbhijit = document.getElementById('widget-abhijit-val');
  const widgetAmrita = document.getElementById('widget-amrita-val');
  const widgetRahu = document.getElementById('widget-rahu-val');
  const widgetYama = document.getElementById('widget-yama-val');
  const widgetGulika = document.getElementById('widget-gulika-val');

  // Calculate Gulika
  const gulikaList = [
    '03:00 PM - 04:30 PM', // Sun
    '01:30 PM - 03:00 PM', // Mon
    '12:00 PM - 01:30 PM', // Tue
    '10:30 AM - 12:00 PM', // Wed
    '09:00 AM - 10:30 AM', // Thu
    '07:30 AM - 09:00 AM', // Fri
    '06:00 AM - 07:30 AM'  // Sat
  ];
  const gulika = gulikaList[date.getDay()];

  // Calculate Amrita Kalam mock
  const amritaKalam = ['04:20 PM - 05:55 PM', '08:12 PM - 09:44 PM', '11:30 AM - 01:05 PM', '06:15 PM - 07:45 PM', '09:45 AM - 11:20 AM'][date.getDate() % 5];
  telugu.amritaKalam = amritaKalam;

  if (widgetDate) widgetDate.textContent = formattedGreg;
  if (widgetTithi) widgetTithi.textContent = telugu.tithiNameTe;
  if (widgetNak) widgetNak.textContent = telugu.nakshatraNameTe;
  if (widgetRasi) widgetRasi.textContent = `${telugu.rashiTe} (${telugu.rashiEn})`;
  if (widgetAbhijit) widgetAbhijit.textContent = telugu.abhijit;
  if (widgetAmrita) widgetAmrita.textContent = telugu.amritaKalam;
  if (widgetRahu) widgetRahu.textContent = telugu.rahuKalam;
  if (widgetYama) widgetYama.textContent = telugu.yamagandam;
  if (widgetGulika) widgetGulika.textContent = gulika;

  // 2. UPDATE DAILY VIEW (Center Panel)
  const dailyYearTe = document.getElementById('daily-year-te');
  const dailyDateEn = document.getElementById('daily-date-en');
  const dailyTithi = document.getElementById('daily-tithi-val');
  const dailyTithiSub = document.getElementById('daily-tithi-sub');
  const dailyNak = document.getElementById('daily-nak-val');
  const dailyNakSub = document.getElementById('daily-nak-sub');
  const dailyRasi = document.getElementById('daily-rasi-val');
  const dailyRasiDesc = document.getElementById('daily-rasi-desc');
  const dailyAbhijit = document.getElementById('daily-abhijit-val');
  const dailyAmrita = document.getElementById('daily-amrita-val');
  
  if (dailyYearTe) dailyYearTe.textContent = `${telugu.teluguYear} సంవత్సరము - ${telugu.teluguMonth} మాసము`;
  if (dailyDateEn) dailyDateEn.textContent = fullDateEn;

  // Highlight updated date displays
  triggerElementHighlight(widgetDate);
  triggerElementHighlight(dailyDateEn);
  triggerElementHighlight(dailyYearTe);
  if (dailyTithi) dailyTithi.textContent = `${telugu.pakshamTe} - ${telugu.tithiNameTe}`;
  if (dailyTithiSub) dailyTithiSub.textContent = `ముగింపు: ${telugu.tithiEndTime}`;
  if (dailyNak) dailyNak.textContent = telugu.nakshatraNameTe;
  if (dailyNakSub) dailyNakSub.textContent = `ముగింపు: ${telugu.nakshatraEndTime}`;
  if (dailyRasi) dailyRasi.textContent = `${telugu.rashiTe} (${telugu.rashiEn})`;
  if (dailyRasiDesc) dailyRasiDesc.textContent = `Moon transit in ${telugu.rashiEn} Rasi all day`;
  if (dailyAbhijit) dailyAbhijit.textContent = telugu.abhijit;
  if (dailyAmrita) dailyAmrita.textContent = telugu.amritaKalam;

  // Mock Sun & Moon times
  const sunriseList = ['05:46 AM', '05:47 AM', '05:48 AM', '05:49 AM'];
  const sunsetList = ['06:32 PM', '06:33 PM', '06:34 PM', '06:35 PM'];
  const sunrise = sunriseList[date.getDate() % 4];
  const sunset = sunsetList[date.getDate() % 4];
  const moonrise = '02:22 PM';
  const moonset = '03:10 AM';

  const dailySunrise = document.getElementById('daily-sunrise-val');
  const dailySunset = document.getElementById('daily-sunset-val');
  const dailyMoonrise = document.getElementById('daily-moonrise-val');
  const dailyMoonset = document.getElementById('daily-moonset-val');

  if (dailySunrise) dailySunrise.textContent = sunrise;
  if (dailySunset) dailySunset.textContent = sunset;
  if (dailyMoonrise) dailyMoonrise.textContent = moonrise;
  if (dailyMoonset) dailyMoonset.textContent = moonset;

  // 3. WIDGET 5: DAILY VIEW FESTIVALS CARD
  const dailyFestCard = document.getElementById('daily-festivals-widget-card');
  const dailyFestContent = document.getElementById('daily-fest-content');

  if (dailyFestCard && dailyFestContent) {
    if (telugu.festival) {
      dailyFestCard.classList.remove('hidden');
      dailyFestContent.innerHTML = `
        <div style='font-weight: 700; color: #5c1c1c; font-size: 0.95rem;' class='font-telugu'>${telugu.festival.nameTe}</div>
        <div style='font-size: 0.8rem; color: #705948; font-weight: 600;'>${telugu.festival.nameEn}</div>
        <p style='margin-top: 0.25rem; font-size: 0.75rem; color: #4a3629;'>
          This is a highly auspicious festival day. Devotees participate in prayers, temple visits, and traditional rituals mapping to ${telugu.festival.nameEn}.
        </p>
      `;
    } else {
      dailyFestCard.classList.add('hidden');
      dailyFestContent.innerHTML = '';
    }
  }
}

// Populate the Festivals Tab
function populateFestivalsTab() {
  const container = document.getElementById('festivals-list-view');
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  const keys = Object.keys(FESTIVALS_2026).sort((a, b) => new Date(a) - new Date(b));

  for (const dateKey of keys) {
    const fest = FESTIVALS_2026[dateKey];
    const dateObj = new Date(dateKey);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, 2026`;

    const item = document.createElement('div');
    item.className = 'daily-card animate-fade';
    item.style.cursor = 'pointer';
    item.setAttribute('data-date', dateKey);
    item.innerHTML = `
      <span class='card-inner-title'>${formattedDate}</span>
      <h3 class='card-main-val font-telugu' style='font-size: 1.2rem; margin: 0.25rem 0;'>${fest.nameTe}</h3>
      <p class='card-sub-val'>${fest.nameEn}</p>
    `;

    fragment.appendChild(item);
  }
  container.appendChild(fragment);

  // Use event delegation
  if (!container.dataset.listenerAdded) {
    container.addEventListener('click', (e) => {
      const item = e.target.closest('[data-date]');
      if (item) {
        const dateKey = item.getAttribute('data-date');
        const dateObj = new Date(dateKey);
        activePanchangamDate = dateObj;
        activeMasamIndex = getMasamIndexForDate(dateObj);
        updateWidgetsAndDailyView(dateObj);
        renderMainCalendar();
        renderMiniCalendar();

        // Switch view back to daily panchangam view
        const dailyBtn = document.querySelector('[data-view="daily"]');
        if (dailyBtn) dailyBtn.click();
      }
    });
    container.dataset.listenerAdded = 'true';
  }
}

// Populate the Muhurthams Tab
function populateMuhurthamsTab() {
  const container = document.getElementById('muhurthams-list-view');
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  const muhurthams = [
    { type: 'Vivaha (Marriage) Muhurtham', date: 'May 03, 2026', time: '09:15 AM - 10:45 AM', tithi: 'Thadiya', nakshatra: 'Vishakha', details: 'Highly auspicious for weddings. Promotes longevity and prosperity.' },
    { type: 'Griha Pravesha (Housewarming)', date: 'May 16, 2026', time: '08:30 AM - 10:00 AM', tithi: 'Amavasya', nakshatra: 'Krittika', details: 'Auspicious for moving into new homes. Brings peace and positive vibes.' },
    { type: 'Upanayana Muhurtham', date: 'June 25, 2026', time: '07:30 AM - 09:00 AM', tithi: 'Dashami', nakshatra: 'Chitra', details: 'Excellent for educational initiatives, sacred thread ceremony, and study.' },
    { type: 'Akshara Abhyasam (First Learning)', date: 'June 29, 2026', time: '09:00 AM - 10:30 AM', tithi: 'Pournami', nakshatra: 'Moola', details: 'Best timing for initiating children into writing and education.' },
    { type: 'Nava Vyapara (New Business Setup)', date: 'August 28, 2026', time: '10:15 AM - 11:45 AM', tithi: 'Pournami', nakshatra: 'Satabhisham', details: 'Highly auspicious for launching startups and retail shops.' },
    { type: 'Bhumi Puja (Foundation Laying)', date: 'September 14, 2026', time: '08:15 AM - 09:45 AM', tithi: 'Tadiya', nakshatra: 'Hasta', details: 'Best aligned for starting land excavation and foundation stone laying.' }
  ];

  for (const m of muhurthams) {
    const card = document.createElement('div');
    card.className = 'daily-card animate-fade';
    card.style.borderLeft = '4px solid #f59e0b';
    card.innerHTML = `
      <span class='card-inner-title' style='color: #f59e0b; font-weight: 800;'> ${m.type}</span>
      <h3 class='card-main-val' style='font-size: 1.15rem; margin: 0.25rem 0;'>${m.date}</h3>
      <p class='card-sub-val' style='font-weight: 700; color: #5c1c1c;'>🕒 ${m.time}</p>
      <div style='font-size: 0.75rem; color: #705948; margin-top: 0.25rem;'>
        <strong>Tithi:</strong> ${m.tithi} | <strong>Nakshatram:</strong> ${m.nakshatra}
      </div>
      <p style='font-size: 0.75rem; color: #4a3629; margin-top: 0.5rem; line-height: 1.4;'>
        ${m.details}
      </p>
    `;
    fragment.appendChild(card);
  }
  container.appendChild(fragment);
}

// Open detailed modal (keeps compatibility if needed)
function openPanchangamDetails(date) {
  activePanchangamDate = date;
  activeMasamIndex = getMasamIndexForDate(date);
  updateWidgetsAndDailyView(date);
  renderMainCalendar();
  renderMiniCalendar();

  // Highlight and switch to Daily view
  const dailyBtn = document.querySelector('[data-view="daily"]');
  if (dailyBtn) dailyBtn.click();
}

// Setup Event Handlers for Sidebar and month navigation
function setupCalendarEventHandlers() {
  const closeBtn = document.getElementById('close-panchangam-modal');
  const modal = document.getElementById('panchangam-modal');
  
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }

  // Next and Prev month triggers for main calendar
  const prevBtn = document.getElementById('cal-prev-month');
  const nextBtn = document.getElementById('cal-next-month');
  const todayBtn = document.getElementById('cal-today');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeMasamIndex--;
      if (activeMasamIndex < 0) {
        activeMasamIndex = TELUGU_MONTH_RANGES.length - 1;
      }
      renderMainCalendar();
      renderMiniCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeMasamIndex++;
      if (activeMasamIndex >= TELUGU_MONTH_RANGES.length) {
        activeMasamIndex = 0;
      }
      renderMainCalendar();
      renderMiniCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const today = new Date();
      activePanchangamDate = today;
      activeMasamIndex = getMasamIndexForDate(today);
      updateWidgetsAndDailyView(today);
      renderMainCalendar();
      renderMiniCalendar();
    });
  }

  // Navigation Panel Tab Switching
  const navItems = document.querySelectorAll('.panchangam-nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const widgetsPanel = document.querySelector('.panchangam-widgets');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Toggle active states on buttons
      navItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');

      // Hide all panels
      viewPanels.forEach(panel => panel.classList.remove('active'));
      
      // Show targeted panel
      const targetView = item.getAttribute('data-view');
      const targetPanel = document.getElementById(`view-panel-${targetView}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      // Show/Hide widgets sidebar (Only visible on Monthly view)
      if (widgetsPanel) {
        if (targetView === 'monthly') {
          widgetsPanel.classList.remove('hidden');
        } else {
          widgetsPanel.classList.add('hidden');
        }
      }
    });
  });

  // Find Muhurtham Action Button
  const findMuhurthamBtn = document.querySelector('.find-muhurtham-btn');
  if (findMuhurthamBtn) {
    findMuhurthamBtn.addEventListener('click', () => {
      const dailyBtn = document.querySelector('[data-view="muhurtham"]');
      if (dailyBtn) dailyBtn.click();
    });
  }

  // Filter Checkbox Listeners
  const filterFestivals = document.getElementById('filter-festivals');
  const filterAuspicious = document.getElementById('filter-auspicious');

  if (filterFestivals) {
    filterFestivals.addEventListener('change', (e) => {
      enabledFilters.festivals = e.target.checked;
      renderMainCalendar();
    });
  }

  if (filterAuspicious) {
    filterAuspicious.addEventListener('change', (e) => {
      enabledFilters.auspicious = e.target.checked;
      renderMainCalendar();
    });
  }
}
