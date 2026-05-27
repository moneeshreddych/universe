// Global Calendar & Location State
let currentYear = 2026;
let currentMonth = 5; // May (1-indexed)
let activeDate = new Date('2026-05-15');

// Coordinates: defaults to Hyderabad, India
let lat = 17.3850;
let lon = 78.4867;
let timezone = 'Asia/Kolkata';
let locationName = 'Hyderabad, India';

// Dynamic dictionaries for Telugu script translation
const MASAM_TE = {
  "Chaitra": "చైత్రము (Chaitra)",
  "Vaishakha": "వైశాఖము (Vaishakha)",
  "Jyeshtha": "జ్యేష్ఠము (Jyeshtha)",
  "Ashadha": "ఆషాఢము (Ashadha)",
  "Shravana": "శ్రావణము (Shravana)",
  "Bhadrapada": "భాద్రపదము (Bhadrapada)",
  "Ashvina": "ఆశ్వయుజము (Ashvina)",
  "Kartika": "కార్తీకము (Kartika)",
  "Margashirsha": "మార్గశిరము (Margashirsha)",
  "Pausha": "పుష్యము (Pausha)",
  "Magha": "మాఘము (Magha)",
  "Phalguna": "ఫాల్గుణము (Phalguna)"
};

const SAMVATSARAMS_TE = {
  "Prabhava": "ప్రభవ", "Vibhava": "విభవ", "Shukla": "శుక్ల", "Pramodoota": "ప్రమోదూత", "Prajopti": "ప్రజోత్పత్తి",
  "Angirasa": "ఆంగీరస", "Shrimukha": "శ్రీముఖ", "Bhava": "భావ", "Yuva": "యువ", "Dhatri": "ధాత",
  "Eeshvara": "ఈశ్వర", "Bahudhanya": "బహుధాన్య", "Pramathi": "ప్రమాది", "Vikrama": "విక్రమ", "Vrusha": "వృష",
  "Chitrabhanu": "చిత్రభాను", "Subhanu": "స్వభాను", "Tarana": "తారణ", "Parthiva": "పార్థివ", "Vyaya": "వ్యయ",
  "Sarvajittu": "సర్వజిత్తు", "Sarvadhari": "సర్వధారి", "Virodhi": "విరోధి", "Vikruti": "వికృతి",
  "Khara": "ఖర", "Nandana": "నందన", "Vijaya": "విజయ", "Jaya": "జయ", "Manmatha": "మన్మథ",
  "Durmukhi": "దుర్ముఖి", "Hevilambi": "హేవిలంబి", "Vilambi": "విలంబి", "Vikari": "వికారి", "Sharvari": "శార్వరి",
  "Plava": "ప్లవ", "Shubhakrutu": "శుభకృతు", "Shobhakrutu": "శోభకృతు", "Krodhi": "క్రోధి", "Visvavasu": "విశ్వావసు",
  "Parabhava": "పరాభవ", "Plavanga": "ప్లవంగ", "Keelaka": "కీలక", "Saumya": "సౌమ్య", "Sadharana": "సాధారణ",
  "Virodhikrutu": "విరోధికృతు", "Paridhavi": "పరీధావి", "Pramadicha": "ప్రమాదీచ", "Ananda": "ఆనంద",
  "Rakshasa": "రాక్షస", "Nala": "నల", "Pingala": "పింగళ", "Kalayukti": "కాళయుక్తి", "Siddharthi": "సిద్ధార్థి",
  "Raudri": "రౌద్రి", "Durmati": "దుర్మతి", "Dundubhi": "దుందుభి", "Rudhirodgari": "రుధిరోద్గారి",
  "Raktakshi": "రక్తాక్షి", "Krodhana": "క్రోధన", "Akshaya": "అక్షయ"
};

const TITHIS_TE = {
  "Prathama": "పాడ్యమి (Prathama)", "Dwitiya": "విదియ (Dwitiya)", "Tritiya": "తదియ (Tritiya)",
  "Chaturthi": "చవితి (Chaturthi)", "Panchami": "పంచమి (Panchami)", "Shashti": "షష్ఠి (Shashti)",
  "Saptami": "సప్తమి (Saptami)", "Ashtami": "అష్టమి (Ashtami)", "Navami": "Navami (నవమి)",
  "Dashami": "దశమి (Dashami)", "Ekadashi": "ఏకాదశి (Ekadashi)", "Dwadashi": "ద్వాదశి (Dwadashi)",
  "Trayodashi": "త్రయోదశి (Trayodashi)", "Chaturdashi": "చతుర్దశి (Chaturdashi)",
  "Purnima": "పౌర్ణమి (Purnima)", "Amavasya": "అమావాస్య (Amavasya)"
};

const NAKSHATRAMS_TE = {
  "Ashwini": "అశ్విని", "Bharani": "భరణి", "Krittika": "కృత్తిక", "Rohini": "రోహిణి",
  "Mrigashira": "మృగశిర", "Ardra": "ఆరుద్ర", "Punarvasu": "పునర్వసు", "Pushya": "పుష్యమి",
  "Ashlesha": "ఆశ్లేష", "Magha": "మఖ", "Purva Phalguni": "పూ.ఫల్గుణి", "Uttara Phalguni": "ఉ.ఫల్గుణి",
  "Hasta": "హస్త", "Chitra": "చిత్త", "Swati": "స్వాతి", "Visakha": "విశాఖ",
  "Anuradha": "అనూరాధ", "Jyeshtha": "జ్యేష్ఠ", "Mula": "మూల", "Purva Ashadha": "పూ.షాఢ",
  "Uttara Ashadha": "ఉ.షాఢ", "Shravana": "శ్రవణం", "Dhanishta": "ధనిష్ఠ", "Shatabhisha": "శతభిషం",
  "Purva Bhadrapada": "పూ.భాద్ర", "Uttara Bhadrapada": "ఉ.భాద్ర", "Revati": "రేవతి"
};

const WEEKDAYS_TE = ["ఆదివారం", "సోమవారం", "మంగళవారం", "బుధవారం", "గురువారం", "శుక్రవారం", "శనివారం"];

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup Cosmic Background
  generateStars();

  // 2. Setup Live Clock
  initLiveClock();

  // 3. Init Event Handlers
  setupEventHandlers();

  // 4. Initial Fetch
  triggerFetch();
});

// Helper: Twinkling background stars
function generateStars() {
  const container = document.getElementById("stars-overlay");
  if (!container) return;
  
  const count = 100;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    const size = Math.random() * 2 + 1;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    star.style.animationDuration = `${Math.random() * 4 + 3}s`;
    
    if (Math.random() < 0.2) {
      star.style.background = "#d4af37";
      star.style.boxShadow = "0 0 4px #d4af37";
    }
    fragment.appendChild(star);
  }
  container.appendChild(fragment);
}

// Live Clock with Timezone adjustment
function initLiveClock() {
  const clockEl = document.getElementById("live-clock");
  setInterval(() => {
    try {
      const timeString = new Date().toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      clockEl.textContent = `${timeString} (${timezone.split('/').pop().replace('_', ' ')})`;
    } catch (e) {
      clockEl.textContent = new Date().toLocaleTimeString();
    }
  }, 1000);
}

// Main coordinator for reloading calendar + daily data
function triggerFetch() {
  fetchMonthData();
  fetchDailyData(activeDate);
}

// Format date to local date key string YYYY-MM-DD
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Fetch calendar data for the grid
async function fetchMonthData() {
  const gridContainer = document.getElementById("calendar-days-grid");
  gridContainer.innerHTML = `<div style="grid-column: 1/-1; display:flex; justify-content:center; align-items:center; color:var(--color-gold); font-size:1.2rem; font-family:var(--font-telugu);">గణన జరుగుతోంది... (Calculating Panchangam...)</div>`;

  try {
    const url = `/api/panchangam/month?year=${currentYear}&month=${currentMonth}&lat=${lat}&lon=${lon}&tz=${timezone}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Month Panchangam Calculation Failed");
    
    const data = await response.json();
    renderCalendarGrid(data.days);
    
    // Update headers
    const gregMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("current-month-year-label").textContent = `${gregMonths[currentMonth - 1]} ${currentYear}`;
    
    // Pick the most common Samvatsaram and Masam returned in the grid to display in the main calendar header
    const values = data.days.filter(d => !d.isOutsideMonth);
    if (values.length > 0) {
      const sample = values[Math.floor(values.length / 2)];
      const samvatsaramTe = SAMVATSARAMS_TE[sample.samvatsaram] || sample.samvatsaram;
      const masamTe = MASAM_TE[sample.masam] || sample.masam;
      
      document.getElementById("telugu-year-label").textContent = `శ్రీ ${samvatsaramTe} నామ సంవత్సరము`;
      document.getElementById("telugu-month-label").textContent = `${masamTe} మాసము`;
    }
  } catch (error) {
    console.error("Month calculations error:", error);
    gridContainer.innerHTML = `<div style="grid-column: 1/-1; color:var(--color-red); font-weight:bold; text-align:center; padding: 2rem;">Calculation Error: ${error.message}. Please reload.</div>`;
  }
}

// Render monthly cells
function renderCalendarGrid(days) {
  const gridContainer = document.getElementById("calendar-days-grid");
  gridContainer.innerHTML = "";
  const fragment = document.createDocumentFragment();

  days.forEach(day => {
    const cell = document.createElement("div");
    cell.className = "cal-cell";
    if (day.isOutsideMonth) {
      cell.classList.add("outside-month");
    }

    const cellDateObj = new Date(day.date + 'T12:00:00Z');
    
    // Highlight today (system local date matching timezone)
    const todayStr = formatDateKey(new Date());
    if (day.date === todayStr) {
      cell.classList.add("is-today-cell");
    }

    // Highlight selected day
    const activeStr = formatDateKey(activeDate);
    if (day.date === activeStr) {
      cell.classList.add("active-selected-day");
    }

    // Translate tithi and nakshatram for cell
    const tithiTe = TITHIS_TE[day.tithi] ? TITHIS_TE[day.tithi].split(' ')[0] : day.tithi;
    const nakTe = NAKSHATRAMS_TE[day.nakshatram] || day.nakshatram;

    cell.innerHTML = `
      <div class="cell-header">
        <span class="cell-gregorian">${day.dayOfMonth}</span>
        <span class="cell-tithi-short">${tithiTe}</span>
      </div>
      <div class="cell-body">
        <span class="cell-nakshatra-lbl">${nakTe}</span>
      </div>
      <div class="cell-footer">
        <!-- Dot markers for events -->
        ${day.dayOfWeek === 0 || day.dayOfWeek === 4 ? '<span class="cell-dot ausp"></span>' : ''}
      </div>
    `;

    // Click handler to select date
    if (!day.isOutsideMonth) {
      cell.addEventListener("click", () => {
        // Remove active class from previous cells
        const previousActive = gridContainer.querySelector(".active-selected-day");
        if (previousActive) previousActive.classList.remove("active-selected-day");
        
        cell.classList.add("active-selected-day");
        activeDate = new Date(day.date + 'T12:00:00Z');
        fetchDailyData(activeDate);
      });
    }

    fragment.appendChild(cell);
  });

  gridContainer.appendChild(fragment);
}

// Fetch and display daily panchangam details
async function fetchDailyData(date) {
  const dateStr = formatDateKey(date);
  
  // Update current API link input
  const fullOrigin = window.location.origin;
  const apiLink = `${fullOrigin}/api/panchangam?date=${dateStr}&lat=${lat}&lon=${lon}&tz=${timezone}`;
  document.getElementById("api-endpoint-url").value = apiLink;

  // Visual loading states
  document.getElementById("panch-tithi-ends").textContent = "Recalculating...";
  document.getElementById("panch-nakshatram-ends").textContent = "Recalculating...";

  try {
    const url = `/api/panchangam?date=${dateStr}&lat=${lat}&lon=${lon}&tz=${timezone}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Daily Panchangam failed");
    const data = await response.json();

    // English date header formatting
    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const gregDayLabel = `${daysEn[date.getDay()]}, ${monthsEn[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    document.getElementById("active-date-greg").textContent = gregDayLabel;

    // Telugu day name and samvatsaram
    const dayTe = WEEKDAYS_TE[date.getDay()];
    const samvatsaramTe = SAMVATSARAMS_TE[data.samvatsaram] || data.samvatsaram;
    document.getElementById("active-date-te").textContent = `${dayTe} | శ్రీ ${samvatsaramTe} నామ సంవత్సరము`;

    // Panchangam items
    const tithiTeFull = TITHIS_TE[data.tithi] || data.tithi;
    const nakTeFull = NAKSHATRAMS_TE[data.nakshatram] ? `${NAKSHATRAMS_TE[data.nakshatram]} (Nakshatram)` : data.nakshatram;

    document.getElementById("panch-tithi").textContent = `${data.paksham === "Shukla Paksham" ? "శుక్ల పక్షం" : "కృష్ణ పక్షం"} - ${tithiTeFull}`;
    document.getElementById("panch-tithi-ends").textContent = `Evaluated at sunrise`;
    
    document.getElementById("panch-nakshatram").textContent = nakTeFull;
    document.getElementById("panch-nakshatram-ends").textContent = `Evaluated at sunrise`;
    
    document.getElementById("panch-yogam").textContent = data.yogam;
    document.getElementById("panch-karanam").textContent = data.karanam;

    // Sun/Moon
    document.getElementById("panch-sunrise").textContent = data.sunrise || "--:--";
    document.getElementById("panch-sunset").textContent = data.sunset || "--:--";
    document.getElementById("panch-moonrise").textContent = data.moonrise || "--:--";
    document.getElementById("panch-moonset").textContent = data.moonset || "--:--";

    // Muhurthams
    document.getElementById("panch-abhijit").textContent = data.abhijitMuhurtham || "--:--";
    document.getElementById("panch-rahukalam").textContent = data.rahuKalam || "--:--";
    document.getElementById("panch-yamagandam").textContent = data.yamagandam || "--:--";
    document.getElementById("panch-gulikakalam").textContent = data.gulikaKalam || "--:--";

  } catch (error) {
    console.error("Daily calculation error:", error);
    document.getElementById("panch-tithi").textContent = "Calculation Error";
    document.getElementById("panch-tithi-ends").textContent = error.message;
  }
}

// Setup Event Listeners
function setupEventHandlers() {
  // Navigation Month buttons
  document.getElementById("btn-prev-month").addEventListener("click", () => {
    currentMonth -= 1;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear -= 1;
    }
    activeDate = new Date(currentYear, currentMonth - 1, 1, 12, 0, 0);
    triggerFetch();
  });

  document.getElementById("btn-next-month").addEventListener("click", () => {
    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
    activeDate = new Date(currentYear, currentMonth - 1, 1, 12, 0, 0);
    triggerFetch();
  });

  // Today button
  document.getElementById("btn-go-today").addEventListener("click", () => {
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth() + 1;
    activeDate = today;
    triggerFetch();
  });

  // Copy API endpoint
  document.getElementById("btn-copy-api").addEventListener("click", () => {
    const copyText = document.getElementById("api-endpoint-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value)
      .then(() => {
        const btn = document.getElementById("btn-copy-api");
        btn.textContent = "✓ Copied!";
        setTimeout(() => {
          btn.textContent = "📋 Copy";
        }, 1500);
      })
      .catch(err => {
        console.error("Copy failed: ", err);
      });
  });

  // Search Location Inputs
  const searchInput = document.getElementById("location-search-input");
  const suggestionsBox = document.getElementById("search-suggestions");

  let debounceTimer;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();
    if (query.length < 2) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.classList.add("hidden");
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("Search failed");
        const results = await response.json();
        
        if (results.length === 0) {
          suggestionsBox.innerHTML = `<div style="padding:0.6rem 0.85rem; font-size:0.8rem; color:var(--color-slate-400);">No cities found.</div>`;
        } else {
          suggestionsBox.innerHTML = results.map(loc => `
            <div data-lat="${loc.latitude}" data-lon="${loc.longitude}" data-tz="${loc.timezone}" data-name="${loc.name}, ${loc.country}">
              <strong>${loc.name}</strong>, ${loc.state ? loc.state + ', ' : ''}${loc.country} <span style="font-size:0.7rem; color:var(--color-slate-400); float:right;">(${loc.timezone.split('/').pop()})</span>
            </div>
          `).join("");
        }
        suggestionsBox.classList.remove("hidden");
      } catch (err) {
        console.error("Location search issue:", err);
      }
    }, 300);
  });

  // Click suggestion handler
  suggestionsBox.addEventListener("click", (e) => {
    const item = e.target.closest("div[data-lat]");
    if (!item) return;

    lat = parseFloat(item.getAttribute("data-lat"));
    lon = parseFloat(item.getAttribute("data-lon"));
    timezone = item.getAttribute("data-tz");
    locationName = item.getAttribute("data-name");

    // Update location cards
    document.getElementById("current-location-name").textContent = locationName;
    document.getElementById("current-coords").textContent = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;
    document.getElementById("current-timezone").textContent = timezone;

    // Reset UI
    searchInput.value = "";
    suggestionsBox.innerHTML = "";
    suggestionsBox.classList.add("hidden");

    // Recalculate everything!
    triggerFetch();
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      suggestionsBox.classList.add("hidden");
    }
  });
}
