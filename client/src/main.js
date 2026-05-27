import { STARS_DATA } from './data/stars_data.js';
import { RAASI_DATA } from './data/raasi_data.js';
import { PLANETS_DATA } from './data/planets_data.js';

// Global Calendar State
let calendarData = {};
let activeMasamIndex = 4; // Default Vaisakha masam index
let activePanchangamDate = new Date('2026-05-15'); // Baseline date
let lastRenderedMasamIndex = undefined;
let enabledFilters = {
  festivals: true,
  auspicious: true,
  transits: false
};

// Lunisolar months begin dates (corresponds to TELUGU_MONTH_RANGES)
const TELUGU_MONTH_RANGES = [
  { nameTe: "పుష్యము", nameEn: "Pushya", yearTe: "విశ్వావసు (Vishwavasu)", start: "2025-12-20", end: "2026-01-18" },
  { nameTe: "మాఘము", nameEn: "Magha", yearTe: "విశ్వావసు (Vishwavasu)", start: "2026-01-19", end: "2026-02-17" },
  { nameTe: "ఫాల్గుణము", nameEn: "Phalguna", yearTe: "విశ్వావసు (Vishwavasu)", start: "2026-02-18", end: "2026-03-18" },
  { nameTe: "చైత్రము", nameEn: "Chaitra", yearTe: "పరాభవ (Parabhava)", start: "2026-03-19", end: "2026-04-17" },
  { nameTe: "వైశాఖము", nameEn: "Vaishakha", yearTe: "పరాభవ (Parabhava)", start: "2026-04-18", end: "2026-05-16" },
  { nameTe: "అధిక జ్యేష్ఠము", nameEn: "Adhika Jyeshtha", yearTe: "పరాభవ (Parabhava)", start: "2026-05-17", end: "2026-06-15" },
  { nameTe: "నిజ జ్యేష్ఠము", nameEn: "Nija Jyeshtha", yearTe: "పరాభవ (Parabhava)", start: "2026-06-16", end: "2026-07-14" },
  { nameTe: "ఆషాఢము", nameEn: "Ashadha", yearTe: "పరాభవ (Parabhava)", start: "2026-07-15", end: "2026-08-12" },
  { nameTe: "శ్రావణము", nameEn: "Shravana", yearTe: "పరాభవ (Parabhava)", start: "2026-08-13", end: "2026-09-11" },
  { nameTe: "భాద్రపదము", nameEn: "Bhadrapada", yearTe: "పరాభవ (Parabhava)", start: "2026-09-12", end: "2026-10-11" },
  { nameTe: "ఆశ్వయుజము", nameEn: "Ashvayujamu", yearTe: "పరాభవ (Parabhava)", start: "2026-10-12", end: "2026-11-09" },
  { nameTe: "కార్తీకము", nameEn: "Karthikamu", yearTe: "పరాభవ (Parabhava)", start: "2026-11-10", end: "2026-12-09" },
  { nameTe: "మార్గశిరము", nameEn: "Margashiramu", yearTe: "పరాభవ (Parabhava)", start: "2026-12-10", end: "2027-01-08" }
];

document.addEventListener("DOMContentLoaded", () => {
  generateTwinklingStars();
  initSimulatorControls();
  initHamburgerSidebar();
  initPlanetsSlideshow();
  initNakshatrasGrid();
  initRasisGrid();
  initScrollReveal();

  // Load calendar dynamically from Backend API
  loadCalendarData();
});

// 0. Scroll Reveal Animation Logic
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => observer.observe(el));
}

// 1. Generate Twinkling Stars Background
function generateTwinklingStars() {
  const container = document.getElementById("stars-overlay");
  if (!container) return;
  
  const count = 120;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 1;
    const delay = Math.random() * 6;
    const duration = Math.random() * 4 + 3;
    
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${delay}s`;
    star.style.animationDuration = `${duration}s`;
    
    const tint = Math.random();
    if (tint < 0.15) {
      star.style.background = "#d4af37";
      star.style.boxShadow = "0 0 4px #d4af37";
    } else if (tint < 0.3) {
      star.style.background = "#06b6d4";
      star.style.boxShadow = "0 0 4px #06b6d4";
    } else {
      star.style.background = "#ffffff";
    }
    
    fragment.appendChild(star);
  }
  container.appendChild(fragment);
}

// 2. NASA Eyes scroll lock / interactive mode handler
function initSimulatorControls() {
  const scrollLock = document.getElementById("simulator-scroll-lock");
  const unlockBtn = document.getElementById("unlock-simulator-btn");
  const lockIndicator = document.getElementById("lock-status-indicator");
  const relockBtn = lockIndicator ? lockIndicator.querySelector("button") : null;

  if (unlockBtn && scrollLock) {
    unlockBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      scrollLock.classList.add("unlocked");
      if (lockIndicator) lockIndicator.classList.remove("hidden");
    });
  }

  if (relockBtn && scrollLock) {
    relockBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      scrollLock.classList.remove("unlocked");
      lockIndicator.classList.add("hidden");
    });
  }
}

// 3. Hamburger Sidebar & Navigation Drawer
function initHamburgerSidebar() {
  const hamburger = document.getElementById("hamburger-menu");
  const menuSidebar = document.getElementById("menu-sidebar");
  const closeMenuBtn = document.getElementById("close-menu-sidebar");
  const openCalendarBtn = document.getElementById("open-calendar-from-menu");
  const calendarDrawer = document.getElementById("calendar-drawer");
  const closeCalendarBtn = document.getElementById("close-drawer-desktop");
  
  if (!hamburger || !menuSidebar || !calendarDrawer) return;

  const toggleMenu = () => {
    menuSidebar.classList.toggle("open");
    hamburger.classList.toggle("open");
  };

  const closeMenu = () => {
    menuSidebar.classList.remove("open");
    hamburger.classList.remove("open");
  };

  const openCalendar = () => {
    closeMenu();
    calendarDrawer.classList.add("open");
  };

  const closeCalendar = () => {
    calendarDrawer.classList.remove("open");
  };

  hamburger.addEventListener("click", toggleMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if (openCalendarBtn) openCalendarBtn.addEventListener("click", openCalendar);
  if (closeCalendarBtn) closeCalendarBtn.addEventListener("click", closeCalendar);

  const menuLinks = menuSidebar.querySelectorAll(".menu-link-item");
  menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// 4. 9 Planets and Moon Slideshow Carousel
let currentPlanetSlide = 0;

function initPlanetsSlideshow() {
  const track = document.getElementById("slider-track");
  const dotsContainer = document.getElementById("slider-dots");
  if (!track || !PLANETS_DATA) return;

  track.innerHTML = "";
  if (dotsContainer) dotsContainer.innerHTML = "";

  const trackFragment = document.createDocumentFragment();
  const dotsFragment = document.createDocumentFragment();

  const sphereGradients = {
    sun: "radial-gradient(circle at 30% 30%, #facc15, #f97316 60%, #dc2626 100%)",
    moon: "radial-gradient(circle at 30% 30%, #f1f5f9, #94a3b8 60%, #475569 100%)",
    mercury: "radial-gradient(circle at 30% 30%, #2dd4bf, #059669 60%, #064e3b 100%)",
    venus: "radial-gradient(circle at 30% 30%, #fef08a, #eab308 60%, #854d0e 100%)",
    earth: "radial-gradient(circle at 30% 30%, #3b82f6, #10b981 60%, #1e3a8a 100%)",
    mars: "radial-gradient(circle at 30% 30%, #f87171, #dc2626 60%, #7f1d1d 100%)",
    jupiter: "radial-gradient(circle at 30% 30%, #fbbf24, #d97706 60%, #78350f 100%)",
    saturn: "radial-gradient(circle at 30% 30%, #c084fc, #6b21a8 60%, #1e1b4b 100%)",
    uranus: "radial-gradient(circle at 30% 30%, #22d3ee, #0d9488 60%, #115e59 100%)",
    neptune: "radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8 60%, #0f172a 100%)",
    pluto: "radial-gradient(circle at 30% 30%, #94a3b8, #475569 60%, #1e293b 100%)"
  };

  PLANETS_DATA.forEach((planet, index) => {
    const slide = document.createElement("div");
    slide.className = `slide-item ${index === 0 ? 'active' : ''}`;
    slide.setAttribute("data-slide-index", index);

    const isSaturn = planet.id === "saturn";
    const ringsMarkup = isSaturn ? '<div class="planet-ring-behind"></div>' : '';

    slide.innerHTML = `
      <div class="planet-card glass ${planet.id === 'sun' ? 'glow-gold' : 'glow-cyan'}">
        <div class="planet-visual-column">
          <div class="planet-orbit-line orbit-1"></div>
          <div class="planet-orbit-line orbit-2"></div>
          <div class="planet-sphere-wrap ${isSaturn ? 'has-rings' : ''}">
            ${ringsMarkup}
            <div class="planet-sphere" style="background: ${sphereGradients[planet.id] || '#ffffff'};"></div>
          </div>
        </div>
        <div class="planet-info-column flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs uppercase tracking-widest text-gold-400 font-semibold">${planet.scientific.type}</span>
              <span class="text-3xl">${planet.symbol}</span>
            </div>
            
            <h3 class="text-2xl font-bold text-white font-telugu mb-4">${planet.nameTe} <span class="text-sm font-normal text-slate-400">/ ${planet.nameEn}</span></h3>
            
            <div class="planet-tabs">
              <button class="planet-tab active" data-tab-target="sci-${planet.id}">Astronomical facts</button>
              <button class="planet-tab" data-tab-target="ast-${planet.id}">Vedic Astrology</button>
            </div>

            <div class="tab-content active" id="sci-${planet.id}">
              <table class="w-full text-xs text-slate-300 border-collapse">
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Mean Distance:</td><td class="py-2 text-right">${planet.scientific.distance}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Orbital Period:</td><td class="py-2 text-right">${planet.scientific.period}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Known Moons:</td><td class="py-2 text-right">${planet.scientific.moons}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Diameter:</td><td class="py-2 text-right">${planet.scientific.diameter}</td></tr>
              </table>
              <div class="mt-4 p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl text-[11px] leading-relaxed text-cyan-300">
                <strong>Science Fact:</strong> ${planet.scientific.fact}
              </div>
            </div>

            <div class="tab-content" id="ast-${planet.id}">
              <table class="w-full text-xs text-slate-300 border-collapse">
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Significance:</td><td class="py-2 text-right font-telugu text-gold-300">${planet.astrological.significance}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Ruling Day:</td><td class="py-2 text-right font-telugu">${planet.astrological.rulingDay}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Gemstone:</td><td class="py-2 text-right font-telugu">${planet.astrological.gemstone}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Metal:</td><td class="py-2 text-right font-telugu">${planet.astrological.metal}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Rasis Ruled:</td><td class="py-2 text-right">${planet.astrological.rulingRasis}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Element:</td><td class="py-2 text-right font-telugu">${planet.astrological.element}</td></tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    trackFragment.appendChild(slide);

    if (dotsContainer) {
      const dot = document.createElement("div");
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute("data-index", index);
      dotsFragment.appendChild(dot);
    }
  });

  track.appendChild(trackFragment);
  if (dotsContainer) {
    dotsContainer.appendChild(dotsFragment);
    dotsContainer.addEventListener("click", (e) => {
      const dot = e.target.closest(".slider-dot");
      if (dot) {
        const index = parseInt(dot.getAttribute("data-index"));
        goToPlanetSlide(index);
      }
    });
  }

  track.addEventListener("click", (e) => {
    const btn = e.target.closest(".planet-tab");
    if (btn) {
      const targetId = btn.getAttribute("data-tab-target");
      const parentCard = btn.closest(".planet-card");
      parentCard.querySelectorAll(".planet-tab").forEach(tb => tb.classList.remove("active"));
      btn.classList.add("active");
      parentCard.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
      parentCard.querySelector(`#${targetId}`).classList.add("active");
    }
  });

  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      let nextIndex = currentPlanetSlide - 1;
      if (nextIndex < 0) nextIndex = PLANETS_DATA.length - 1;
      goToPlanetSlide(nextIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      let nextIndex = currentPlanetSlide + 1;
      if (nextIndex >= PLANETS_DATA.length) nextIndex = 0;
      goToPlanetSlide(nextIndex);
    });
  }
}

function goToPlanetSlide(index) {
  const track = document.getElementById("slider-track");
  const slides = track.querySelectorAll(".slide-item");
  const dots = document.querySelectorAll(".slider-dot");
  
  if (index < 0 || index >= slides.length) return;
  currentPlanetSlide = index;

  track.style.transform = `translateX(-${index * 100}%)`;

  slides.forEach((sl, idx) => {
    if (idx === index) sl.classList.add("active");
    else sl.classList.remove("active");
  });

  dots.forEach((dt, idx) => {
    if (idx === index) dt.classList.add("active");
    else dt.classList.remove("active");
  });
}

// 5. 27 Nakshatras Grid
function initNakshatrasGrid() {
  const container = document.getElementById("stars-grid");
  const searchInput = document.getElementById("nakshatra-search");
  
  if (!container || !STARS_DATA) return;

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  STARS_DATA.forEach(star => {
    const card = document.createElement("div");
    card.className = "flip-card";
    card.setAttribute("data-name-en", star.nameEn.toLowerCase());
    card.setAttribute("data-name-te", star.nameTe.toLowerCase());
    card.setAttribute("data-planet", star.planet.toLowerCase());

    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front glass glow-cyan">
          <div class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">Star #${star.id}</div>
          <h4 class="text-lg font-bold text-white font-telugu mb-1">${star.nameTe}</h4>
          <h5 class="text-xs text-slate-400 font-medium mb-3">${star.nameEn}</h5>
          
          <div class="border-t border-slate-800/40 w-full pt-2 mt-auto">
            <span class="text-[10px] text-slate-500 uppercase">Ruling Planet</span>
            <div class="text-xs font-semibold text-slate-300 font-telugu">${star.planet}</div>
          </div>
        </div>
        <div class="flip-card-back glass glow-gold">
          <div class="text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-2">Nakshatram Attributes</div>
          <div class="text-xs text-left text-slate-300 space-y-1.5 w-full flex-grow">
            <div><span class="font-bold text-slate-400">Deity:</span> <span class="font-telugu text-[13px]">${star.deity}</span></div>
            <div><span class="font-bold text-slate-400">Symbol:</span> <span class="font-telugu text-[13px]">${star.symbol}</span></div>
            <div class="leading-relaxed border-t border-slate-800/40 pt-1.5 mt-1.5"><span class="font-bold text-slate-400">Traits:</span> ${star.traits}</div>
          </div>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  container.addEventListener("click", (e) => {
    const card = e.target.closest(".flip-card");
    if (card) card.classList.toggle("flipped");
  });

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        const cards = container.querySelectorAll(".flip-card");

        cards.forEach(card => {
          const nameEn = card.getAttribute("data-name-en");
          const nameTe = card.getAttribute("data-name-te");
          const planet = card.getAttribute("data-planet");

          if (nameEn.includes(query) || nameTe.includes(query) || planet.includes(query)) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      }, 150);
    });
  }
}

// 6. 12 Zodiac Rasis Grid
function initRasisGrid() {
  const container = document.getElementById("rasis-grid");
  if (!container || !RAASI_DATA) return;

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  RAASI_DATA.forEach(rasi => {
    const card = document.createElement("div");
    card.className = `rasi-card glass`;
    card.style.background = `linear-gradient(135deg, rgba(13, 13, 33, 0.7) 0%, rgba(3, 3, 12, 0.9) 100%)`;
    card.style.border = `1px solid rgba(255, 255, 255, 0.08)`;
    card.setAttribute("data-glow", rasi.glowColor || 'rgba(255,255,255,0.05)');

    const emojis = {
      Mesha: "♈", Vrishabha: "♉", Mithuna: "♊", Karka: "♋",
      Simha: "♌", Kanya: "♍", Tula: "♎", Vrishchika: "♏",
      Dhanu: "♐", Makara: "♑", Kumbha: "♒", Meena: "♓"
    };

    card.innerHTML = `
      <div class="rasi-top">
        <div>
          <span class="text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-1">Rasi #${rasi.id}</span>
          <h4 class="text-lg font-bold text-white font-telugu leading-tight mt-0.5">${rasi.nameTe}</h4>
        </div>
        <span class="rasi-symbol">${emojis[rasi.nameEn] || "✨"}</span>
      </div>

      <div class="text-xs text-slate-400 space-y-1 my-3">
        <div><span class="font-bold text-slate-500">Ruling Lord:</span> <span class="font-telugu text-[13px] text-slate-300">${rasi.lordTe} / ${rasi.lordEn}</span></div>
        <div><span class="font-bold text-slate-500">Element:</span> <span class="font-telugu text-slate-300">${rasi.element}</span></div>
        <div><span class="font-bold text-slate-500">Symbol:</span> <span class="font-telugu text-[13px] text-slate-300">${rasi.symbol}</span></div>
      </div>

      <p class="text-[11px] leading-relaxed text-slate-300 border-t border-slate-800/40 pt-2.5 mt-auto">
        ${rasi.traits}
      </p>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  container.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".rasi-card");
    if (card) {
      const glowColor = card.getAttribute("data-glow");
      card.style.boxShadow = `0 8px 30px ${glowColor}`;
      card.style.borderColor = glowColor.replace("0.4", "0.2");
    }
  });

  container.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".rasi-card");
    if (card) {
      card.style.boxShadow = "none";
      card.style.borderColor = "rgba(255, 255, 255, 0.08)";
    }
  });
}

/* ==========================================================================
 * TELEGU CALENDAR ENGINE (API REQUESTS & RENDERS)
 * ========================================================================== */

async function loadCalendarData() {
  try {
    // Relative API call works perfectly on both Railway and local dev proxy
    const response = await fetch('/api/calendar/2026');
    if (!response.ok) throw new Error('API server returned error');
    calendarData = await response.json();
    console.log('Calendar database loaded successfully from API backend.');
    initCalendar();
  } catch (error) {
    console.error('Failed to retrieve calendar details from backend API:', error);
    // Fallback: loading message
    const gridContainer = document.getElementById('main-calendar-grid');
    if (gridContainer) {
      gridContainer.innerHTML = '<div class="text-center text-red-500 py-10">Failed to connect to API server. Please reload.</div>';
    }
  }
}

function getMasamIndexForDate(date) {
  const current = new Date(date);
  current.setHours(0,0,0,0);
  const idx = TELUGU_MONTH_RANGES.findIndex(r => {
    const start = new Date(r.start);
    const end = new Date(r.end);
    return current >= start && current <= end;
  });
  return idx !== -1 ? idx : 4;
}

function initCalendar() {
  activeMasamIndex = getMasamIndexForDate(activePanchangamDate);
  renderMainCalendar();
  updateWidgetsAndDailyView(activePanchangamDate);
  populateFestivalsTab();
  populateMuhurthamsTab();
  setupCalendarEventHandlers();
}

function renderMainCalendar() {
  const gridContainer = document.getElementById('main-calendar-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  const range = TELUGU_MONTH_RANGES[activeMasamIndex];
  const startDate = new Date(range.start);
  const endDate = new Date(range.end);
  const startDayOfWeek = startDate.getDay();
  
  const diffTime = Math.abs(endDate - startDate);
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Prev padding days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(startDate);
    prevDate.setDate(startDate.getDate() - 1 - i);
    fragment.appendChild(createCalendarCell(prevDate, true));
  }

  // Monthly active days
  for (let day = 0; day < totalDays; day++) {
    const dateObj = new Date(startDate);
    dateObj.setDate(startDate.getDate() + day);
    fragment.appendChild(createCalendarCell(dateObj, false));
  }

  // Next padding days
  const totalCellsSoFar = startDayOfWeek + totalDays;
  const remainingCells = 42 - totalCellsSoFar;
  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(endDate);
    nextDate.setDate(endDate.getDate() + day);
    fragment.appendChild(createCalendarCell(nextDate, true));
  }

  gridContainer.appendChild(fragment);

  if (!gridContainer.dataset.listenerAdded) {
    gridContainer.addEventListener('click', (e) => {
      const cell = e.target.closest('.calendar-cell:not(.inactive)');
      if (cell) {
        const dateObj = new Date(cell.getAttribute('data-date'));
        activePanchangamDate = dateObj;
        activeMasamIndex = getMasamIndexForDate(dateObj);
        updateWidgetsAndDailyView(dateObj);
        renderMainCalendar();
      }
    });
    gridContainer.dataset.listenerAdded = 'true';
  }

  // Update text headers
  const monthTitleTe = document.getElementById('month-title-te');
  const monthTitleEn = document.getElementById('month-title-en');
  const gregBadge = document.getElementById('month-gregorian-badge');
  const ayanaBadge = document.getElementById('month-ayana-badge');
  const sidebarYear = document.getElementById('sidebar-year-title');
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (monthTitleTe) monthTitleTe.textContent = `${range.nameTe} మాసము`;
  if (monthTitleEn) monthTitleEn.textContent = `(${range.nameEn} Masam)`;
  
  const rangeStr = `${monthNamesShort[startDate.getMonth()].toUpperCase()} ${startDate.getDate()} - ${monthNamesShort[endDate.getMonth()].toUpperCase()} ${endDate.getDate()}, ${endDate.getFullYear()}`;
  if (gregBadge) gregBadge.textContent = rangeStr;

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

function createCalendarCell(date, isOutsideMonth) {
  const cell = document.createElement('div');
  cell.className = 'calendar-cell';
  
  if (isOutsideMonth) {
    cell.classList.add('inactive');
    return cell;
  }

  cell.setAttribute('data-date', date.toISOString());
  
  // Format local date key
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  
  const details = calendarData[dateKey] || { tithiShortTe: '--', nakshatraNameTe: '--', festival: null };

  if (date.toDateString() === activePanchangamDate.toDateString()) {
    cell.classList.add('active-day');
  }

  if (date.toDateString() === new Date().toDateString()) {
    cell.classList.add('is-today');
  }

  if (details.festival && enabledFilters.festivals) {
    cell.classList.add('has-festival');
  }

  const header = document.createElement('div');
  header.className = 'cell-top';

  const tithiLabel = document.createElement('span');
  tithiLabel.className = 'cell-tithi';
  tithiLabel.textContent = details.tithiShortTe;
  header.appendChild(tithiLabel);

  const gregNum = document.createElement('span');
  gregNum.className = 'cell-gregorian-date';
  gregNum.textContent = date.getDate();
  header.appendChild(gregNum);

  cell.appendChild(header);

  const tithiTime = document.createElement('div');
  tithiTime.className = 'cell-tithi-time';
  tithiTime.textContent = details.tithiEndTime ? `ముగింపు: ${details.tithiEndTime}` : '';
  cell.appendChild(tithiTime);

  const nakLabel = document.createElement('div');
  nakLabel.className = 'cell-nakshatra';
  nakLabel.textContent = details.nakshatraNameTe ? details.nakshatraNameTe.split(' ')[0] : '';
  cell.appendChild(nakLabel);

  const festContainer = document.createElement('div');
  festContainer.className = 'cell-festivals';

  if (details.festival && enabledFilters.festivals) {
    const festPill = document.createElement('span');
    festPill.className = 'fest-pill orange';
    festPill.textContent = details.festival.nameTe;
    festContainer.appendChild(festPill);
  }
  cell.appendChild(festContainer);

  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'cell-dot-indicators';
  if (details.festival) {
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

function triggerElementHighlight(element) {
  if (!element) return;
  element.classList.remove('highlight-fade');
  void element.offsetWidth;
  element.classList.add('highlight-fade');
}

function updateWidgetsAndDailyView(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  
  const telugu = calendarData[dateKey];
  if (!telugu) return;

  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdaysTe = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
  
  const formattedGreg = `${monthsEn[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
  const fullDateEn = `${weekdaysEn[date.getDay()]} | ${weekdaysTe[date.getDay()]}`;

  const widgetDate = document.getElementById('widget-date-greg');
  const widgetTithi = document.getElementById('widget-tithi-val');
  const widgetNak = document.getElementById('widget-nak-val');
  const widgetRasi = document.getElementById('widget-rasi-val');
  const widgetAbhijit = document.getElementById('widget-abhijit-val');
  const widgetAmrita = document.getElementById('widget-amrita-val');
  const widgetRahu = document.getElementById('widget-rahu-val');
  const widgetYama = document.getElementById('widget-yama-val');
  const widgetGulika = document.getElementById('widget-gulika-val');

  const gulikaList = [
    '03:00 PM - 04:30 PM', '01:30 PM - 03:00 PM', '12:00 PM - 01:30 PM',
    '10:30 AM - 12:00 PM', '09:00 AM - 10:30 AM', '07:30 AM - 09:00 AM',
    '06:00 AM - 07:30 AM'
  ];
  const gulika = gulikaList[date.getDay()];

  if (widgetDate) widgetDate.textContent = formattedGreg;
  if (widgetTithi) widgetTithi.textContent = telugu.tithiNameTe;
  if (widgetNak) widgetNak.textContent = telugu.nakshatraNameTe;
  if (widgetRasi) widgetRasi.textContent = `${telugu.rasiTe} (${telugu.rasiEn})`;
  if (widgetAbhijit) widgetAbhijit.textContent = telugu.abhijit;
  if (widgetAmrita) widgetAmrita.textContent = telugu.amritaKalam || '04:20 PM - 05:55 PM';
  if (widgetRahu) widgetRahu.textContent = telugu.rahuKalam;
  if (widgetYama) widgetYama.textContent = telugu.yamagandam;
  if (widgetGulika) widgetGulika.textContent = gulika;

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
  if (dailyDateEn) dailyDateEn.textContent = `${formattedGreg} | ${fullDateEn}`;

  triggerElementHighlight(widgetDate);
  triggerElementHighlight(dailyDateEn);
  triggerElementHighlight(dailyYearTe);
  
  if (dailyTithi) dailyTithi.textContent = `${telugu.pakshamTe} - ${telugu.tithiNameTe}`;
  if (dailyTithiSub) dailyTithiSub.textContent = `ముగింపు: ${telugu.tithiEndTime}`;
  if (dailyNak) dailyNak.textContent = telugu.nakshatraNameTe;
  if (dailyNakSub) dailyNakSub.textContent = `ముగింపు: ${telugu.nakshatraEndTime}`;
  if (dailyRasi) dailyRasi.textContent = `${telugu.rasiTe} (${telugu.rasiEn})`;
  if (dailyRasiDesc) dailyRasiDesc.textContent = `Moon transit in ${telugu.rasiEn} Rasi all day`;
  if (dailyAbhijit) dailyAbhijit.textContent = telugu.abhijit;
  if (dailyAmrita) dailyAmrita.textContent = telugu.amritaKalam || '04:20 PM - 05:55 PM';

  const dailySunrise = document.getElementById('daily-sunrise-val');
  const dailySunset = document.getElementById('daily-sunset-val');
  const dailyMoonrise = document.getElementById('daily-moonrise-val');
  const dailyMoonset = document.getElementById('daily-moonset-val');

  if (dailySunrise) dailySunrise.textContent = '05:48 AM';
  if (dailySunset) dailySunset.textContent = '06:34 PM';
  if (dailyMoonrise) dailyMoonrise.textContent = '02:22 PM';
  if (dailyMoonset) dailyMoonset.textContent = '03:10 AM';

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

function populateFestivalsTab() {
  const container = document.getElementById('festivals-list-view');
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  
  // Sort and filter dates containing festivals
  const festivalDates = Object.keys(calendarData).filter(key => calendarData[key].festival).sort((a,b) => new Date(a) - new Date(b));

  for (const dateKey of festivalDates) {
    const details = calendarData[dateKey];
    const dateObj = new Date(dateKey);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, 2026`;

    const item = document.createElement('div');
    item.className = 'daily-card animate-fade';
    item.style.cursor = 'pointer';
    item.setAttribute('data-date', dateKey);
    item.innerHTML = `
      <span class='card-inner-title'>${formattedDate}</span>
      <h3 class='card-main-val font-telugu' style='font-size: 1.2rem; margin: 0.25rem 0;'>${details.festival.nameTe}</h3>
      <p class='card-sub-val'>${details.festival.nameEn}</p>
    `;

    fragment.appendChild(item);
  }
  container.appendChild(fragment);

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

        const dailyBtn = document.querySelector('[data-view="daily"]');
        if (dailyBtn) dailyBtn.click();
      }
    });
    container.dataset.listenerAdded = 'true';
  }
}

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

function setupCalendarEventHandlers() {
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
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeMasamIndex++;
      if (activeMasamIndex >= TELUGU_MONTH_RANGES.length) {
        activeMasamIndex = 0;
      }
      renderMainCalendar();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const today = new Date();
      activePanchangamDate = today;
      activeMasamIndex = getMasamIndexForDate(today);
      updateWidgetsAndDailyView(today);
      renderMainCalendar();
    });
  }

  const navItems = document.querySelectorAll('.panchangam-nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const widgetsPanel = document.querySelector('.panchangam-widgets');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');

      viewPanels.forEach(panel => panel.classList.remove('active'));
      
      const targetView = item.getAttribute('data-view');
      const targetPanel = document.getElementById(`view-panel-${targetView}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      if (widgetsPanel) {
        if (targetView === 'monthly') {
          widgetsPanel.classList.remove('hidden');
        } else {
          widgetsPanel.classList.add('hidden');
        }
      }
    });
  });
}
