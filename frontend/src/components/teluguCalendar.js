import { APP_CONFIG } from '../config/appConfig.js';
import { createTeluguCalendar, loadTeluguCalendarData } from '../services/teluguCalendarService.js';

export function createTeluguCalendar({ audio, logger, el }) {
  let selectedDate = new Date();
  let miniCalendarDate = new Date(selectedDate);
  let currentView = localStorage.getItem('panchangamView') || APP_CONFIG.defaultView; // 'month', 'week', 'day'
  let calendarData = null; // Local offline constants
  let festivalsCache = {}; // Year-based festival cache { "2026": [...] }

  // Load locations from localStorage
  let activeLocation = JSON.parse(localStorage.getItem('activeLocation')) || APP_CONFIG.defaultLocation;
  let recents = JSON.parse(localStorage.getItem('teluguRecents')) || [];
  let favorites = JSON.parse(localStorage.getItem('teluguFavorites')) || [];

  // Toggleable layers state
  let layers = JSON.parse(localStorage.getItem('calendarLayers')) || {
    festivals: true,
    muhurthams: true,
    inauspicious: true,
    grahas: true
  };

  // DOM Elements for internal views
  const dom = {
    viewContainer: document.getElementById('main-calendar-view'),
    activeLocationName: document.getElementById('active-location-name'),
    activeLocationTz: document.getElementById('active-location-tz'),
    favoriteStarIcon: document.getElementById('favorite-star-icon'),
    recentsList: document.getElementById('recents-list'),
    favoritesList: document.getElementById('favorites-list'),
    btnToggleFavorite: document.getElementById('btn-toggle-favorite'),
    miniCalendar: document.getElementById('mini-calendar'),
    eventModal: document.getElementById('event-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    btnCloseModal: document.getElementById('btn-close-modal'),
    btnModalOk: document.getElementById('btn-modal-ok'),
    offlineToast: document.getElementById('offline-toast'),
    // Checkboxes
    layerFestivals: document.getElementById('layer-festivals'),
    layerMuhurthams: document.getElementById('layer-muhurthams'),
    layerInauspicious: document.getElementById('layer-inauspicious'),
    layerGrahas: document.getElementById('layer-grahas')
  };

  async function init() {
    try {
      calendarData = await loadTeluguCalendarData();
    } catch (err) {
      console.warn('Failed to load local calendar data:', err);
    }

    // Set initial view selector value
    if (el.selectView) {
      el.selectView.value = currentView;
      el.selectView.addEventListener('change', (e) => {
        audio?.playBeep(950, 0.06);
        currentView = e.target.value;
        localStorage.setItem('panchangamView', currentView);
        render();
      });
    }

    // Connect navigation buttons
    el.btnToday?.addEventListener('click', () => {
      audio?.playBeep(950, 0.06);
      selectedDate = new Date();
      miniCalendarDate = new Date(selectedDate);
      render();
    });

    el.btnPrev?.addEventListener('click', () => {
      audio?.playBeep(950, 0.06);
      adjustDate(-1);
    });

    el.btnNext?.addEventListener('click', () => {
      audio?.playBeep(950, 0.06);
      adjustDate(1);
    });

    // Sidebar Layers checkboxes
    setupLayerCheckboxes();

    // Location search, GPS, badges
    setupLocationControls();

    // Modal listeners
    dom.btnCloseModal?.addEventListener('click', closeModal);
    dom.btnModalOk?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
      if (e.target === dom.eventModal) closeModal();
    });

    // Run initial render
    render();
  }

  function setupLayerCheckboxes() {
    const bindLayer = (checkbox, key) => {
      if (!checkbox) return;
      checkbox.checked = layers[key];
      checkbox.addEventListener('change', (e) => {
        audio?.playBeep(800, 0.05);
        layers[key] = e.target.checked;
        localStorage.setItem('calendarLayers', JSON.stringify(layers));
        render();
      });
    };

    bindLayer(dom.layerFestivals, 'festivals');
    bindLayer(dom.layerMuhurthams, 'muhurthams');
    bindLayer(dom.layerInauspicious, 'inauspicious');
    bindLayer(dom.layerGrahas, 'grahas');
  }

  function setupLocationControls() {
    const searchInput = el.locationSearchInput;
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const autocompleteList = document.getElementById('location-autocomplete-list');
    const gpsBtn = el.btnGpsLocation;

    let debounceTimeout = null;
    searchInput?.addEventListener('input', () => {
      const query = searchInput.value.trim();
      
      if (query.length > 0) {
        clearSearchBtn?.classList.remove('hidden');
      } else {
        clearSearchBtn?.classList.add('hidden');
      }

      clearTimeout(debounceTimeout);
      if (query.length < 2) {
        if (autocompleteList) {
          autocompleteList.innerHTML = '';
          autocompleteList.classList.add('hidden');
        }
        return;
      }

      debounceTimeout = setTimeout(async () => {
        try {
          const response = await fetch(`${APP_CONFIG.apiUrl}/location/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error("Search failed");
          const results = await response.json();
          renderAutocomplete(results);
        } catch (err) {
          console.error(err);
          if (autocompleteList) {
            autocompleteList.innerHTML = `<div class="autocomplete-no-results">Search failed (Server offline)</div>`;
            autocompleteList.classList.remove('hidden');
          }
        }
      }, 300);
    });

    clearSearchBtn?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearSearchBtn?.classList.add('hidden');
      if (autocompleteList) {
        autocompleteList.innerHTML = '';
        autocompleteList.classList.add('hidden');
      }
      audio?.playBeep(700, 0.05);
    });

    document.addEventListener('click', (e) => {
      if (!searchInput?.contains(e.target) && !autocompleteList?.contains(e.target)) {
        autocompleteList?.classList.add('hidden');
      }
    });

    gpsBtn?.addEventListener('click', () => {
      audio?.playBeep(950, 0.06);
      if (!navigator.geolocation) {
        logger?.('Geolocation is not supported by this browser.', 'warn');
        return;
      }

      const gpsIcon = gpsBtn.querySelector('i');
      if (gpsIcon) gpsIcon.classList.add('fa-spin');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (gpsIcon) gpsIcon.classList.remove('fa-spin');
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

          activeLocation = {
            name: `GPS: ${lat.toFixed(4)}°, ${lon.toFixed(4)}°`,
            latitude: lat,
            longitude: lon,
            timezone: localTz
          };

          localStorage.setItem('activeLocation', JSON.stringify(activeLocation));
          addToRecents(activeLocation);
          render();
          logger?.('GPS location loaded.', 'info');
        },
        (error) => {
          if (gpsIcon) gpsIcon.classList.remove('fa-spin');
          logger?.(`GPS lookup failed: ${error.message}`, 'warn');
          audio?.playErrorBeep();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });

    dom.btnToggleFavorite?.addEventListener('click', () => {
      audio?.playBeep(950, 0.06);
      toggleFavorite(activeLocation);
    });

    renderBadges();
    updateFavoriteStar();
  }

  function renderAutocomplete(results) {
    const listEl = document.getElementById('location-autocomplete-list');
    if (!listEl) return;

    if (results.length === 0) {
      listEl.innerHTML = `<div class="autocomplete-no-results">No locations found</div>`;
      listEl.classList.remove('hidden');
      return;
    }

    listEl.innerHTML = results.map((loc, index) => {
      const displayName = `${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}`;
      return `<div class="autocomplete-item" data-index="${index}">${displayName}</div>`;
    }).join('');
    listEl.classList.remove('hidden');

    const items = listEl.querySelectorAll('.autocomplete-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        const selected = results[idx];

        activeLocation = {
          name: selected.name,
          state: selected.state,
          country: selected.country,
          latitude: selected.latitude,
          longitude: selected.longitude,
          timezone: selected.timezone
        };

        localStorage.setItem('activeLocation', JSON.stringify(activeLocation));
        addToRecents(activeLocation);

        const searchInput = el.locationSearchInput;
        if (searchInput) searchInput.value = '';
        const clearSearchBtn = document.getElementById('btn-clear-search');
        if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
        listEl.classList.add('hidden');

        render();
        audio?.playBeep(950, 0.06);
      });
    });
  }

  function renderBadges() {
    const drawBadge = (list, type) => {
      if (list.length === 0) return `<span class="no-badges">None</span>`;
      return list.map((loc, idx) => {
        const isActive = isSameLocation(activeLocation, loc) ? 'active' : '';
        return `
          <span class="badge-item ${isActive}" data-type="${type}" data-index="${idx}">
            ${loc.name}
            <button class="btn-remove-badge" data-type="${type}" data-index="${idx}" type="button" title="Remove"><i class="fa-solid fa-xmark"></i></button>
          </span>
        `;
      }).join('');
    };

    if (dom.recentsList) dom.recentsList.innerHTML = drawBadge(recents, 'recent');
    if (dom.favoritesList) dom.favoritesList.innerHTML = drawBadge(favorites, 'favorite');

    setupBadgeListeners();
  }

  function setupBadgeListeners() {
    const badges = document.querySelectorAll('.badge-item');
    badges.forEach(badge => {
      badge.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-badge')) {
          e.stopPropagation();
          const btn = e.target.closest('.btn-remove-badge');
          const type = btn.getAttribute('data-type');
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          if (type === 'recent') {
            recents.splice(idx, 1);
            localStorage.setItem('teluguRecents', JSON.stringify(recents));
          } else {
            favorites.splice(idx, 1);
            localStorage.setItem('teluguFavorites', JSON.stringify(favorites));
          }
          renderBadges();
          updateFavoriteStar();
          audio?.playBeep(600, 0.05);
          return;
        }

        const type = badge.getAttribute('data-type');
        const idx = parseInt(badge.getAttribute('data-index'), 10);
        const loc = type === 'recent' ? recents[idx] : favorites[idx];

        activeLocation = { ...loc };
        localStorage.setItem('activeLocation', JSON.stringify(activeLocation));

        if (type === 'recent') {
          addToRecents(activeLocation);
        }

        render();
        audio?.playBeep(950, 0.06);
      });
    });
  }

  function updateFavoriteStar() {
    if (!dom.favoriteStarIcon) return;
    const isFav = favorites.some(item => isSameLocation(item, activeLocation));
    if (isFav) {
      dom.favoriteStarIcon.className = 'fa-solid fa-star';
      dom.btnToggleFavorite?.classList.add('active');
    } else {
      dom.favoriteStarIcon.className = 'fa-regular fa-star';
      dom.btnToggleFavorite?.classList.remove('active');
    }
  }

  function isSameLocation(loc1, loc2) {
    if (!loc1 || !loc2) return false;
    if (loc1.name && loc2.name && loc1.name === loc2.name) return true;
    const eps = 0.005;
    return Math.abs(loc1.latitude - loc2.latitude) < eps &&
           Math.abs(loc1.longitude - loc2.longitude) < eps;
  }

  function addToRecents(loc) {
    recents = recents.filter(item => !isSameLocation(item, loc));
    recents.unshift(loc);
    if (recents.length > 4) recents.pop();
    localStorage.setItem('teluguRecents', JSON.stringify(recents));
    renderBadges();
  }

  function toggleFavorite(loc) {
    const idx = favorites.findIndex(item => isSameLocation(item, loc));
    if (idx > -1) {
      favorites.splice(idx, 1);
    } else {
      favorites.push(loc);
    }
    localStorage.setItem('teluguFavorites', JSON.stringify(favorites));
    renderBadges();
    updateFavoriteStar();
  }

  function adjustDate(amount) {
    if (currentView === 'month') {
      selectedDate.setMonth(selectedDate.getMonth() + amount);
    } else if (currentView === 'week') {
      selectedDate.setDate(selectedDate.getDate() + amount * 7);
    } else {
      selectedDate.setDate(selectedDate.getDate() + amount);
    }
    miniCalendarDate = new Date(selectedDate);
    render();
  }

  // Fetch Festivals for the year
  async function fetchFestivals(year) {
    if (festivalsCache[year]) return festivalsCache[year];
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}/festivals?year=${year}&lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&tz=${activeLocation.timezone}`);
      if (!response.ok) throw new Error();
      const list = await response.json();
      festivalsCache[year] = list;
      return list;
    } catch {
      // Offline fallback: empty array for festivals
      return [];
    }
  }

  async function render() {
    // Update active location labels
    if (dom.activeLocationName) dom.activeLocationName.textContent = activeLocation.name;
    if (dom.activeLocationTz) dom.activeLocationTz.textContent = `${activeLocation.timezone} (${activeLocation.latitude.toFixed(2)}°, ${activeLocation.longitude.toFixed(2)}°)`;
    updateFavoriteStar();
    renderBadges();

    // 1. Render Mini Calendar in sidebar
    renderMiniCalendar();

    // 2. Load festivals for active year
    const activeYear = selectedDate.getFullYear();
    const festivalsList = await fetchFestivals(activeYear);

    // 3. Render Main View
    if (currentView === 'month') {
      renderMonthView(festivalsList);
    } else if (currentView === 'week') {
      renderWeekView(festivalsList);
    } else {
      renderDayView(festivalsList);
    }
  }

  // Renders Sidebar compact Month grid
  function renderMiniCalendar() {
    if (!dom.miniCalendar) return;

    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay(); // 0 is Sunday

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const headerHtml = `
      <div class="mini-calendar-header">
        <strong>${monthNames[month]} ${year}</strong>
        <div>
          <button class="mini-nav-btn" id="btn-mini-prev"><i class="fa-solid fa-chevron-left"></i></button>
          <button class="mini-nav-btn" id="btn-mini-next"><i class="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    `;

    const weekHeadersHtml = `
      <div class="mini-calendar-grid">
        <div class="mini-week-header">S</div>
        <div class="mini-week-header">M</div>
        <div class="mini-week-header">T</div>
        <div class="mini-week-header">W</div>
        <div class="mini-week-header">T</div>
        <div class="mini-week-header">F</div>
        <div class="mini-week-header">S</div>
      </div>
    `;

    // Generate days grid
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const daysHtml = [];

    // Prev month days
    for (let i = startingDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const fullDate = new Date(year, month - 1, d);
      daysHtml.push(`<div class="mini-day different-month" data-date="${fullDate.toISOString()}">${d}</div>`);
    }

    // Current month days
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const fullDate = new Date(year, month, d);
      const isToday = fullDate.toDateString() === today.toDateString() ? 'active-today' : '';
      const isSelected = fullDate.toDateString() === selectedDate.toDateString() ? 'active-selected' : '';
      daysHtml.push(`<div class="mini-day ${isToday} ${isSelected}" data-date="${fullDate.toISOString()}">${d}</div>`);
    }

    // Next month days
    const totalCells = daysHtml.length;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const fullDate = new Date(year, month + 1, d);
      daysHtml.push(`<div class="mini-day different-month" data-date="${fullDate.toISOString()}">${d}</div>`);
    }

    dom.miniCalendar.innerHTML = headerHtml + weekHeadersHtml + `
      <div class="mini-calendar-grid">
        ${daysHtml.join('')}
      </div>
    `;

    // Attach listeners
    document.getElementById('btn-mini-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audio?.playBeep(800, 0.05);
      miniCalendarDate.setMonth(miniCalendarDate.getMonth() - 1);
      renderMiniCalendar();
    });

    document.getElementById('btn-mini-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      audio?.playBeep(800, 0.05);
      miniCalendarDate.setMonth(miniCalendarDate.getMonth() + 1);
      renderMiniCalendar();
    });

    dom.miniCalendar.querySelectorAll('.mini-day').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        audio?.playBeep(950, 0.06);
        selectedDate = new Date(dayEl.getAttribute('data-date'));
        miniCalendarDate = new Date(selectedDate);
        render();
      });
    });
  }

  // Renders Monthly Grid (7x6 days)
  function renderMonthView(festivalsList) {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();

    if (el.labelCurrentRange) {
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      el.labelCurrentRange.textContent = `${monthNames[month]} ${year}`;
    }

    // Construct 42 cell list representing the calendar grid
    const totalCells = 42;
    const dayDates = [];
    const gridStart = new Date(year, month, 1 - startOffset);

    for (let i = 0; i < totalCells; i++) {
      dayDates.push(new Date(gridStart.getTime() + i * 24 * 60 * 60 * 1000));
    }

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const headersHtml = weekdays.map(day => `<div class="month-header-cell">${day}</div>`).join('');

    const todayStr = new Date().toDateString();
    const cellsHtml = dayDates.map(cellDate => {
      const isDiffMonth = cellDate.getMonth() !== month ? 'different-month' : '';
      const isToday = cellDate.toDateString() === todayStr ? 'active-today' : '';
      
      // Calculate local approximated Vedic elements for layout speed
      const cal = calculateTeluguCalendar(cellDate, calendarData);

      // Match festivals
      const cellDateStr = cellDate.toISOString().split('T')[0];
      const matches = festivalsList.filter(f => f.date === cellDateStr);

      const festivalBadges = matches.map(f => {
        if (!layers.festivals) return '';
        return `<span class="event-badge festival" title="${f.description}">${f.name}</span>`;
      }).join('');

      // Sankranti badge
      let sankrantiBadge = '';
      if (cal.sankranti && layers.festivals) {
        sankrantiBadge = `<span class="event-badge sankranti"><i class="fa-solid fa-sun"></i> ${cal.sankranti.name}</span>`;
      }

      // Moon Node / Special Day
      let moonBadge = '';
      if (cal.tithiBaseName === 'Amavasya' || cal.tithiBaseName === 'Pournami') {
        const icon = cal.tithiBaseName === 'Amavasya' ? '🌑' : '🌕';
        moonBadge = `<span class="cell-moon-phase" title="${cal.tithiBaseName}">${icon}</span>`;
      } else if (cal.tithiBaseName === 'Ekadasi') {
        moonBadge = `<span class="event-badge ekadashi" title="Ekadashi fasting day">Ekadashi</span>`;
      }

      // Muhurthams indicators
      let subBadgesHtml = '';
      if (layers.muhurthams && (cal.tithiBaseName === 'Pournami' || cal.tithiBaseName === 'Amavasya' || cal.tithiBaseName === 'Ekadasi')) {
        // Just empty
      }

      return `
        <div class="month-day-cell ${isDiffMonth} ${isToday}" data-date="${cellDate.toISOString()}">
          <div class="cell-header">
            <span class="cell-day-num">${cellDate.getDate()}</span>
            <span class="cell-tithi">${cal.tithiBaseName}</span>
            ${moonBadge}
          </div>
          <div class="cell-events-list">
            ${festivalBadges}
            ${sankrantiBadge}
            ${subBadgesHtml}
          </div>
        </div>
      `;
    }).join('');

    dom.viewContainer.innerHTML = `
      <div class="month-view-grid">
        <div class="month-header-row">${headersHtml}</div>
        <div class="month-grid-body">${cellsHtml}</div>
      </div>
    `;

    // Day Click Listeners
    dom.viewContainer.querySelectorAll('.month-day-cell').forEach(cellEl => {
      cellEl.addEventListener('click', () => {
        audio?.playBeep(950, 0.06);
        const clickedDate = new Date(cellEl.getAttribute('data-date'));
        selectedDate = clickedDate;
        openDayDetailsModal(clickedDate);
      });
    });
  }

  // Renders Weekly Scroll of Event Cards
  function renderWeekView(festivalsList) {
    const currentDayOfWeek = selectedDate.getDay();
    const startOfWeek = new Date(selectedDate.getTime() - currentDayOfWeek * 24 * 60 * 60 * 1000);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000));
    }

    if (el.labelCurrentRange) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const start = weekDays[0];
      const end = weekDays[6];
      el.labelCurrentRange.textContent = `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
    }

    const todayStr = new Date().toDateString();
    const columnsHtml = weekDays.map(cellDate => {
      const isToday = cellDate.toDateString() === todayStr ? 'active-today' : '';
      const cal = calculateTeluguCalendar(cellDate, calendarData);

      const cellDateStr = cellDate.toISOString().split('T')[0];
      const matches = festivalsList.filter(f => f.date === cellDateStr);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayHeader = `
        <div class="week-day-header">
          <span class="day-name">${dayNames[cellDate.getDay()]}</span>
          <span class="day-date">${cellDate.getDate()}</span>
        </div>
      `;

      // Build event cards
      const cards = [];

      // Masam & Paksham card
      cards.push(`
        <div class="week-event-card planetary">
          <span class="card-time"><i class="fa-solid fa-moon"></i> LUNAR DAY</span>
          <span class="card-title">${cal.masam} Masam</span>
          <span class="card-desc">${cal.tithiDisplay} (${cal.tithiEndDisplay})</span>
        </div>
      `);

      // Festivals cards
      if (layers.festivals) {
        matches.forEach(f => {
          cards.push(`
            <div class="week-event-card festival">
              <span class="card-time"><i class="fa-solid fa-cake-candles"></i> FESTIVAL</span>
              <span class="card-title">${f.name}</span>
              <span class="card-desc">${f.description}</span>
            </div>
          `);
        });

        if (cal.sankranti) {
          cards.push(`
            <div class="week-event-card festival">
              <span class="card-time"><i class="fa-solid fa-sun"></i> TRANSIT</span>
              <span class="card-title">${cal.sankranti.name}</span>
              <span class="card-desc">Sun enters Rasi at ${cal.sankranti.time}</span>
            </div>
          `);
        }
      }

      // Sunrise & Sunset
      cards.push(`
        <div class="week-event-card planetary">
          <span class="card-time"><i class="fa-solid fa-sun-rising"></i> GRAHAS</span>
          <span class="card-title">Sun Position</span>
          <span class="card-desc">Sunrise: ${cal.sunrise} | Sunset: ${cal.sunset}</span>
        </div>
      `);

      // Muhurthams Layer
      if (layers.muhurthams) {
        cards.push(`
          <div class="week-event-card muhurtham">
            <span class="card-time"><i class="fa-solid fa-circle-check"></i> ABHIJIT MUHURTHAM</span>
            <span class="card-title">Auspicious Slot</span>
            <span class="card-desc">${cal.abhijitMuhurtham}</span>
          </div>
        `);
      }

      // Inauspicious times Layer
      if (layers.inauspicious) {
        // Durmuhurtham
        cards.push(`
          <div class="week-event-card inauspicious">
            <span class="card-time"><i class="fa-solid fa-ban"></i> DURMUHURTHAM</span>
            <span class="card-title">Inauspicious Muhurtham</span>
            <span class="card-desc">${cal.durmuhurtham}</span>
          </div>
        `);

        // Varjyam
        cards.push(`
          <div class="week-event-card inauspicious">
            <span class="card-time"><i class="fa-solid fa-circle-exclamation"></i> VARJYAM</span>
            <span class="card-title">Inauspicious Period</span>
            <span class="card-desc">${cal.varjyam.display}</span>
          </div>
        `);
      }

      return `
        <div class="week-day-column ${isToday}" data-date="${cellDate.toISOString()}">
          ${dayHeader}
          <div class="week-events-list">
            ${cards.join('')}
          </div>
        </div>
      `;
    }).join('');

    dom.viewContainer.innerHTML = `
      <div class="week-view-grid">
        ${columnsHtml}
      </div>
    `;

    // Click Columns to select date and open details
    dom.viewContainer.querySelectorAll('.week-day-column').forEach(colEl => {
      colEl.addEventListener('click', (e) => {
        if (e.target.closest('.week-event-card')) {
          audio?.playBeep(950, 0.06);
          const clickedDate = new Date(colEl.getAttribute('data-date'));
          selectedDate = clickedDate;
          openDayDetailsModal(clickedDate);
        }
      });
    });
  }

  // Renders Day View containing South Indian Kundali SVG
  async function renderDayView(festivalsList) {
    if (el.labelCurrentRange) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      el.labelCurrentRange.textContent = selectedDate.toLocaleDateString('en-US', options);
    }

    // Set panel with loader spinner
    dom.viewContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; gap: 15px; height: 100%;">
        <div class="loader-spinner"></div>
        <div class="loader-text">SYNCHRONIZING WITH ASTRONOMY ENGINE...</div>
      </div>
    `;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const params = `date=${dateStr}&lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&tz=${activeLocation.timezone}`;

    let data = null;
    let grahas = [];
    let isOffline = false;

    try {
      dom.offlineToast?.classList.add('hidden');
      const [panchRes, grahasRes] = await Promise.all([
        fetch(`${APP_CONFIG.apiUrl}/panchangam?${params}`),
        fetch(`${APP_CONFIG.apiUrl}/grahas?${params}`)
      ]);

      if (!panchRes.ok || !grahasRes.ok) throw new Error();

      data = await panchRes.json();
      grahas = await grahasRes.json();
    } catch {
      // Offline fallback
      isOffline = true;
      dom.offlineToast?.classList.remove('hidden');
      data = calculateTeluguCalendar(selectedDate, calendarData);
      
      // Basic mock graha positions for chart rendering offline
      grahas = [
        { name: "Sun", rasi: "Vrishabha", retrograde: false, siderealLongitude: "42.00 DEG" },
        { name: "Moon", rasi: "Mesha", retrograde: false, siderealLongitude: "12.00 DEG" },
        { name: "Mars", rasi: "Simha", retrograde: false, siderealLongitude: "135.00 DEG" },
        { name: "Mercury", rasi: "Mithuna", retrograde: true, siderealLongitude: "72.00 DEG" },
        { name: "Jupiter", rasi: "Meena", retrograde: false, siderealLongitude: "340.00 DEG" },
        { name: "Venus", rasi: "Vrishabha", retrograde: false, siderealLongitude: "52.00 DEG" },
        { name: "Saturn", rasi: "Kumbha", retrograde: false, siderealLongitude: "312.00 DEG" },
        { name: "Rahu", rasi: "Simha", retrograde: true, siderealLongitude: "120.00 DEG" },
        { name: "Ketu", rasi: "Kumbha", retrograde: true, siderealLongitude: "300.00 DEG" }
      ];
    }

    // Render columns
    const chartPanelHtml = `
      <div class="rasi-chart-panel">
        <div class="rasi-chart-wrapper">
          <h3><i class="fa-solid fa-dharmachakra"></i> Graha Gocharam (రాశి చక్రం)</h3>
          <div id="rasi-chart-svg-container">
            ${generateSouthIndianRasiChartSvg(grahas)}
          </div>
        </div>
      </div>
    `;

    // Details panel cards
    const cellDateStr = selectedDate.toISOString().split('T')[0];
    const matches = festivalsList.filter(f => f.date === cellDateStr);
    const activeFestivalsHtml = matches.map(f => `
      <div class="data-item">
        <span class="data-label" style="color: var(--color-accent-red);"><i class="fa-solid fa-cake-candles"></i> FESTIVAL</span>
        <span class="data-value">${f.name}</span>
        <span class="data-desc" style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">${f.description}</span>
      </div>
    `).join('');

    const transitTransitHtml = data.sankranti ? `
      <div class="data-item">
        <span class="data-label" style="color: var(--color-accent-amber);"><i class="fa-solid fa-sun"></i> SANKRANTI TRANSIT</span>
        <span class="data-value">${data.sankranti.name}</span>
        <span class="data-desc" style="font-size: 11px; color: var(--color-text-secondary); margin-top: 2px;">Transit occurred at ${data.sankranti.time}</span>
      </div>
    ` : '';

    const panchangamDetailsHtml = `
      <div class="panchangam-details-panel">
        <!-- 1. Astro Info -->
        <div class="panchangam-card">
          <h3><i class="fa-solid fa-moon"></i> Panchangam Elements (పంచాంగం)</h3>
          <div class="panchangam-data-grid">
            <div class="data-item"><span class="data-label">Samvatsaram</span><span class="data-value">${data.samvatsaram}</span></div>
            <div class="data-item"><span class="data-label">Masam</span><span class="data-value">${data.masam}</span></div>
            <div class="data-item"><span class="data-label">Paksham</span><span class="data-value">${data.paksham || data.paksha}</span></div>
            <div class="data-item"><span class="data-label">Tithi</span><span class="data-value">${data.tithi || data.tithiDisplay}</span></div>
            <div class="data-item"><span class="data-label">Nakshatram</span><span class="data-value">${data.nakshatram}</span></div>
            <div class="data-item"><span class="data-label">Yogam</span><span class="data-value">${data.yogam}</span></div>
            <div class="data-item"><span class="data-label">Karanam</span><span class="data-value">${data.karanam}</span></div>
            <div class="data-item"><span class="data-label">Vaaram</span><span class="data-value">${data.vaaram}</span></div>
          </div>
        </div>

        <!-- 2. Timings Info -->
        <div class="panchangam-card">
          <h3><i class="fa-solid fa-sun-rising"></i> Solar & Lunar Times (సూర్యోదయ/సూర్యాస్తమయాలు)</h3>
          <div class="panchangam-data-grid">
            <div class="data-item"><span class="data-label">Sunrise</span><span class="data-value">${data.sunrise}</span></div>
            <div class="data-item"><span class="data-label">Sunset</span><span class="data-value">${data.sunset}</span></div>
            <div class="data-item"><span class="data-label">Moonrise</span><span class="data-value">${data.moonrise}</span></div>
            <div class="data-item"><span class="data-label">Moonset</span><span class="data-value">${data.moonset}</span></div>
          </div>
        </div>

        <!-- 3. Muhurthams -->
        <div class="panchangam-card">
          <h3><i class="fa-solid fa-business-time"></i> Muhurthams (ముహూర్త సమయాలు)</h3>
          <div class="panchangam-data-grid">
            <div class="data-item"><span class="data-label" style="color: var(--color-accent-green);">Abhijit Muhurtham</span><span class="data-value">${data.abhijitMuhurtham || data.abhijit}</span></div>
            <div class="data-item"><span class="data-label" style="color: var(--color-accent-purple);">Durmuhurtham</span><span class="data-value">${data.durmuhurtham}</span></div>
            <div class="data-item"><span class="data-label" style="color: var(--color-accent-purple);">Varjyam</span><span class="data-value">${data.varjyam.display}</span></div>
            <div class="data-item"><span class="data-label" style="color: var(--color-accent-green);">Amrita Kalam</span><span class="data-value">${data.amritakalam.display}</span></div>
            <div class="data-item"><span class="data-label">Rahu Kalam</span><span class="data-value">${data.rahuKalam}</span></div>
            <div class="data-item"><span class="data-label">Yamagandam</span><span class="data-value">${data.yamagandam}</span></div>
            <div class="data-item"><span class="data-label">Gulika Kalam</span><span class="data-value">${data.gulikaKalam}</span></div>
          </div>
        </div>

        <!-- 4. Festivals / Transits -->
        ${matches.length > 0 || data.sankranti ? `
          <div class="panchangam-card">
            <h3><i class="fa-solid fa-circle-nodes"></i> Events & Transits (పండుగలు)</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${activeFestivalsHtml}
              ${transitTransitHtml}
            </div>
          </div>
        ` : ''}

        <!-- 5. Graha details -->
        <div class="panchangam-card">
          <h3><i class="fa-solid fa-chart-pie"></i> Planetary Longitudes (గ్రహస్థితులు)</h3>
          <table class="grahas-table">
            <thead>
              <tr>
                <th>Planet</th>
                <th>Longitude</th>
                <th>Rasi</th>
                <th>Nakshatra</th>
              </tr>
            </thead>
            <tbody>
              ${grahas.map(g => `
                <tr class="${g.retrograde ? 'retrograde' : ''}">
                  <td><strong>${g.name}</strong> ${g.retrograde ? '(R)' : ''}</td>
                  <td>${g.siderealLongitude}</td>
                  <td>${g.rasi}</td>
                  <td>${g.nakshatra || '--'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    dom.viewContainer.innerHTML = `
      <div class="day-view-container">
        ${chartPanelHtml}
        ${panchangamDetailsHtml}
      </div>
    `;
  }

  // Helper: Generates SVG markup for the South Indian Rasi Chart grid (fixed sign positions)
  function generateSouthIndianRasiChartSvg(grahas) {
    const RASI_NAMES = [
      'Mesha', 'Vrishabha', 'Mithuna', 'Karkataka',
      'Simha', 'Kanya', 'Tula', 'Vrischika',
      'Dhanusu', 'Makara', 'Kumbha', 'Meena'
    ];

    // Build lists of planets in each Rasi
    const rasiMap = Array.from({ length: 12 }, () => []);
    grahas.forEach(g => {
      const idx = RASI_NAMES.indexOf(g.rasi);
      if (idx > -1) {
        rasiMap[idx].push(g);
      }
    });

    // Outer boxes mapped to their SVG coordinates (Row Col)
    // 0: Meena (Row 0, Col 0) -> x=0, y=0
    // 1: Mesha (Row 0, Col 1) -> x=90, y=0
    // 2: Vrishabha (Row 0, Col 2) -> x=180, y=0
    // 3: Mithuna (Row 0, Col 3) -> x=270, y=0
    // 4: Karkataka (Row 1, Col 3) -> x=270, y=90
    // 5: Simha (Row 2, Col 3) -> x=270, y=180
    // 6: Kanya (Row 3, Col 3) -> x=270, y=270
    // 7: Tula (Row 3, Col 2) -> x=180, y=270
    // 8: Vrischika (Row 3, Col 1) -> x=90, y=270
    // 9: Dhanusu (Row 3, Col 0) -> x=0, y=270
    // 10: Makara (Row 2, Col 0) -> x=0, y=180
    // 11: Kumbha (Row 1, Col 0) -> x=0, y=90
    const coords = [
      { rasi: "Mesha", x: 90, y: 0, label: "Mesha (మేషం)" },
      { rasi: "Vrishabha", x: 180, y: 0, label: "Vrishabha (వృషభం)" },
      { rasi: "Mithuna", x: 270, y: 0, label: "Mithuna (మిథునం)" },
      { rasi: "Karkataka", x: 270, y: 90, label: "Karkataka (కర్కాటకం)" },
      { rasi: "Simha", x: 270, y: 180, label: "Simha (సింహం)" },
      { rasi: "Kanya", x: 270, y: 270, label: "Kanya (కన్య)" },
      { rasi: "Tula", x: 180, y: 270, label: "Tula (తుల)" },
      { rasi: "Vrischika", x: 90, y: 270, label: "Vrischika (వృశ్చికం)" },
      { rasi: "Dhanusu", x: 0, y: 270, label: "Dhanusu (ధనుస్సు)" },
      { rasi: "Makara", x: 0, y: 180, label: "Makara (మకరం)" },
      { rasi: "Kumbha", x: 0, y: 90, label: "Kumbha (కుంభం)" },
      { rasi: "Meena", x: 0, y: 0, label: "Meena (మీనం)" }
    ];

    // Map sign index to coord array index:
    // RASI_NAMES: Mesha(0), Vrishabha(1), Mithuna(2), Karkataka(3), Simha(4), Kanya(5), Tula(6), Vrischika(7), Dhanusu(8), Makara(9), Kumbha(10), Meena(11)
    const signCoordMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    let svgBoxes = coords.map((c, i) => {
      // Get planets in this Rasi
      const rasiIndex = RASI_NAMES.indexOf(c.rasi);
      const planets = rasiMap[rasiIndex] || [];
      const planTexts = planets.map((p, pIdx) => {
        const pY = c.y + 35 + pIdx * 15;
        const pX = c.x + 45;
        const isRetro = p.retrograde ? 'retro' : '';
        const isLuminary = (p.name === 'Sun' || p.name === 'Moon') ? 'luminary' : '';
        const classNames = `graha-label ${isRetro} ${isLuminary}`.trim();
        return `<text x="${pX}" y="${pY}" text-anchor="middle" class="${classNames}">${p.name.substring(0, 3)}</text>`;
      }).join('');

      return `
        <!-- Box for ${c.rasi} -->
        <rect x="${c.x}" y="${c.y}" width="90" height="90" />
        <text x="${c.x + 8}" y="${c.y + 15}" class="rasi-label">${c.label.split(' ')[0]}</text>
        ${planTexts}
      `;
    }).join('');

    return `
      <svg viewBox="0 0 360 360" class="kundali-svg">
        <!-- Main background perimeter -->
        <rect x="0" y="0" width="360" height="360" fill="none" stroke="none" />
        
        <!-- Outer perimeter boxes -->
        ${svgBoxes}
        
        <!-- Center merged block -->
        <rect x="90" y="90" width="180" height="180" />
        <text x="180" y="170" text-anchor="middle" fill="var(--color-text-secondary)" font-size="14" font-weight="600">రాశి చక్రం</text>
        <text x="180" y="195" text-anchor="middle" fill="var(--color-text-light)" font-size="11" font-weight="500">GRAHA GOCHARAM</text>
      </svg>
    `;
  }

  // Opens the Day Details Popup Modal
  async function openDayDetailsModal(date) {
    if (!dom.eventModal) return;

    dom.modalTitle.textContent = `Syncing details...`;
    dom.modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; gap: 10px;">
        <div class="loader-spinner" style="width: 32px; height: 32px;"></div>
        <div class="loader-text" style="font-size: 10px;">LOADING...</div>
      </div>
    `;

    dom.eventModal.classList.remove('hidden');

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const params = `date=${dateStr}&lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&tz=${activeLocation.timezone}`;

    let data = null;
    try {
      const response = await fetch(`${APP_CONFIG.apiUrl}/panchangam?${params}`);
      if (!response.ok) throw new Error();
      data = await response.json();
    } catch {
      // offline fallback
      data = calculateTeluguCalendar(date, calendarData);
    }

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dom.modalTitle.textContent = date.toLocaleDateString('en-US', options);

    dom.modalBody.innerHTML = `
      <div class="modal-field"><span class="field-name">Samvatsaram</span><span class="field-val">${data.samvatsaram}</span></div>
      <div class="modal-field"><span class="field-name">Masam</span><span class="field-val">${data.masam}</span></div>
      <div class="modal-field"><span class="field-name">Paksham</span><span class="field-val">${data.paksham || data.paksha}</span></div>
      <div class="modal-field"><span class="field-name">Tithi</span><span class="field-val">${data.tithi || data.tithiDisplay}</span></div>
      <div class="modal-field"><span class="field-name">Nakshatram</span><span class="field-val">${data.nakshatram}</span></div>
      <div class="modal-field"><span class="field-name">Yogam</span><span class="field-val">${data.yogam}</span></div>
      <div class="modal-field"><span class="field-name">Karanam</span><span class="field-val">${data.karanam}</span></div>
      <div class="modal-field"><span class="field-name">Vaaram</span><span class="field-val">${data.vaaram}</span></div>
      <div class="modal-field"><span class="field-name">Sunrise</span><span class="field-val">${data.sunrise}</span></div>
      <div class="modal-field"><span class="field-name">Sunset</span><span class="field-val">${data.sunset}</span></div>
      <div class="modal-field"><span class="field-name">Abhijit Muhurtham</span><span class="field-val" style="color: var(--color-accent-green); font-weight: 600;">${data.abhijitMuhurtham || data.abhijit}</span></div>
      <div class="modal-field"><span class="field-name">Durmuhurtham</span><span class="field-val" style="color: var(--color-accent-red);">${data.durmuhurtham}</span></div>
      <div class="modal-field"><span class="field-name">Varjyam</span><span class="field-val" style="color: var(--color-accent-red);">${data.varjyam.display}</span></div>
      <div class="modal-field"><span class="field-name">Amrita Kalam</span><span class="field-val" style="color: var(--color-accent-green);">${data.amritakalam.display}</span></div>
      <div class="modal-field"><span class="field-name">Rahu Kalam</span><span class="field-val">${data.rahuKalam}</span></div>
      <div class="modal-field"><span class="field-name">Yamagandam</span><span class="field-val">${data.yamagandam}</span></div>
      <div class="modal-field"><span class="field-name">Gulika Kalam</span><span class="field-val">${data.gulikaKalam}</span></div>
    `;
  }

  function closeModal() {
    audio?.playBeep(800, 0.05);
    dom.eventModal?.classList.add('hidden');
  }

  return { init, render };
}
