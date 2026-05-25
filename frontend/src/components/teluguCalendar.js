import { APP_CONFIG } from '../config/appConfig.js';
import { createDateFromInput, toDatetimeLocalValue } from '../utils/date.js';
import { renderKeyValueCard } from '../utils/formatting.js';
import {
  calculateTeluguCalendar,
  loadTeluguCalendarData
} from '../services/teluguCalendarService.js';

export function createTeluguCalendar({
  panel,
  dateInput,
  todayButton,
  titleElement,
  subtitleElement,
  tithiElement,
  tithiEndElement,
  gridElement,
  audio,
  logger
}) {
  let selectedDate = new Date();
  let calendarData = null;

  // Load locations from localStorage
  let activeLocation = JSON.parse(localStorage.getItem('activeLocation')) || {
    name: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    latitude: 17.3850,
    longitude: 78.4867,
    timezone: 'Asia/Kolkata'
  };

  let recents = JSON.parse(localStorage.getItem('teluguRecents')) || [];
  let favorites = JSON.parse(localStorage.getItem('teluguFavorites')) || [];

  async function init() {
    try {
      calendarData = await loadTeluguCalendarData();
    } catch (err) {
      console.warn('Failed to load local calendar data for offline fallback:', err);
    }

    // Connect date control listeners
    dateInput?.addEventListener('change', () => {
      render(createDateFromInput(dateInput.value));
      audio?.playBeep(950, 0.06);
    });

    todayButton?.addEventListener('click', () => {
      render(new Date());
      audio?.playBeep(950, 0.06);
    });

    // Resolve location UI elements
    const searchInput = document.getElementById('location-search-input');
    const clearSearchBtn = document.getElementById('btn-clear-search');
    const autocompleteList = document.getElementById('location-autocomplete-list');
    const gpsBtn = document.getElementById('btn-gps-location');
    const favoriteBtn = document.getElementById('btn-toggle-favorite');

    // Autocomplete Input Handler (300ms Debounce)
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

    // Clear search button
    clearSearchBtn?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearSearchBtn?.classList.add('hidden');
      if (autocompleteList) {
        autocompleteList.innerHTML = '';
        autocompleteList.classList.add('hidden');
      }
      audio?.playBeep(700, 0.05);
    });

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput?.contains(e.target) && !autocompleteList?.contains(e.target)) {
        autocompleteList?.classList.add('hidden');
      }
    });

    // GPS locating functionality
    gpsBtn?.addEventListener('click', () => {
      audio?.playBeep(950, 0.06);
      if (!navigator.geolocation) {
        logger?.('Geolocation is not supported by this browser.', 'warn');
        return;
      }

      const gpsIcon = gpsBtn.querySelector('i');
      if (gpsIcon) {
        gpsIcon.classList.add('fa-spin');
      }

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
          logger?.('GPS location coordinates loaded.', 'info');
        },
        (error) => {
          if (gpsIcon) gpsIcon.classList.remove('fa-spin');
          logger?.(`Geolocation lookup failed: ${error.message}`, 'warn');
          audio?.playErrorBeep?.();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });

    // Favorite button click
    favoriteBtn?.addEventListener('click', () => {
      toggleFavorite(activeLocation);
      audio?.playBeep(950, 0.06);
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

    // Attach click listeners to autocomplete entries
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

        // Reset search field
        const searchInput = document.getElementById('location-search-input');
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
    const recentsList = document.getElementById('recents-list');
    const favoritesList = document.getElementById('favorites-list');

    if (recentsList) {
      if (recents.length === 0) {
        recentsList.innerHTML = `<span class="no-badges">None</span>`;
      } else {
        recentsList.innerHTML = recents.map((loc, idx) => {
          const isActive = isSameLocation(activeLocation, loc) ? 'active' : '';
          return `
            <span class="badge-item ${isActive}" data-type="recent" data-index="${idx}">
              ${loc.name}
              <button class="btn-remove-badge" data-type="recent" data-index="${idx}" type="button" title="Remove"><i class="fa-solid fa-xmark"></i></button>
            </span>
          `;
        }).join('');
      }
    }

    if (favoritesList) {
      if (favorites.length === 0) {
        favoritesList.innerHTML = `<span class="no-badges">None</span>`;
      } else {
        favoritesList.innerHTML = favorites.map((loc, idx) => {
          const isActive = isSameLocation(activeLocation, loc) ? 'active' : '';
          return `
            <span class="badge-item ${isActive}" data-type="favorite" data-index="${idx}">
              ${loc.name}
              <button class="btn-remove-badge" data-type="favorite" data-index="${idx}" type="button" title="Remove"><i class="fa-solid fa-xmark"></i></button>
            </span>
          `;
        }).join('');
      }
    }

    setupBadgeEventListeners();
  }

  function setupBadgeEventListeners() {
    const badges = document.querySelectorAll('.badge-item');
    badges.forEach(badge => {
      badge.addEventListener('click', (e) => {
        // If the click is inside a remove button, delete the badge
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

        // Otherwise select the location represented by the badge
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
    const favoriteBtn = document.getElementById('btn-toggle-favorite');
    const starIcon = document.getElementById('favorite-star-icon');
    if (!favoriteBtn || !starIcon) return;

    const isFav = favorites.some(item => isSameLocation(item, activeLocation));
    if (isFav) {
      favoriteBtn.classList.add('active');
      starIcon.className = 'fa-solid fa-star';
    } else {
      favoriteBtn.classList.remove('active');
      starIcon.className = 'fa-regular fa-star';
    }
  }

  function isSameLocation(loc1, loc2) {
    if (!loc1 || !loc2) return false;
    if (loc1.name && loc2.name && loc1.name === loc2.name) {
      return true;
    }
    const eps = 0.005;
    return Math.abs(loc1.latitude - loc2.latitude) < eps &&
           Math.abs(loc1.longitude - loc2.longitude) < eps;
  }

  function addToRecents(loc) {
    recents = recents.filter(item => !isSameLocation(item, loc));
    recents.unshift(loc);
    if (recents.length > 4) {
      recents.pop();
    }
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

  async function render(date = selectedDate) {
    selectedDate = new Date(date);
    if (dateInput) dateInput.value = toDatetimeLocalValue(selectedDate);

    // Show custom neon loading spinner
    gridElement.innerHTML = `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; gap: 15px;">
        <div class="loader-spinner"></div>
        <div class="loader-text">SYNCHRONIZING WITH ASTRONOMY ENGINE...</div>
      </div>
    `;

    // Clear any existing fallback warning label
    const existingWarning = panel.querySelector('.fallback-warning');
    if (existingWarning) {
      existingWarning.remove();
    }

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const params = `date=${dateStr}&lat=${activeLocation.latitude}&lon=${activeLocation.longitude}&tz=${activeLocation.timezone}`;

    try {
      const [panchRes, tithiRes, nakshatraRes] = await Promise.all([
        fetch(`${APP_CONFIG.apiUrl}/panchangam?${params}`),
        fetch(`${APP_CONFIG.apiUrl}/tithi?${params}`),
        fetch(`${APP_CONFIG.apiUrl}/nakshatra?${params}`)
      ]);

      if (!panchRes.ok) throw new Error("Panchangam API call failed.");

      const panchData = await panchRes.json();

      let tithiEndStr = "Ends: --";
      if (tithiRes.ok) {
        const tithiData = await tithiRes.json();
        if (tithiData.endsAt) {
          const endDate = new Date(tithiData.endsAt);
          const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: activeLocation.timezone };
          tithiEndStr = `Ends: ${endDate.toLocaleTimeString([], options)}`;
        }
      }

      let nakshatraEndStr = "";
      if (nakshatraRes.ok) {
        const nakshatraData = await nakshatraRes.json();
        if (nakshatraData.endsAt) {
          const endDate = new Date(nakshatraData.endsAt);
          const options = { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: activeLocation.timezone };
          nakshatraEndStr = ` (Ends: ${endDate.toLocaleTimeString([], options)})`;
        }
      }

      titleElement.textContent = `${panchData.masam} - ${panchData.tithi}`;
      subtitleElement.textContent = `${panchData.samvatsaram} Samvatsaram / ${panchData.locationLabel}`;
      
      tithiElement.textContent = `${panchData.paksham} ${panchData.tithi}`;
      tithiEndElement.textContent = tithiEndStr;

      const cards = [
        ['Masam', panchData.masam],
        ['Paksham', panchData.paksham],
        ['Nakshatram', `${panchData.nakshatram}${nakshatraEndStr}`],
        ['Vaaram', panchData.vaaram],
        ['Samvatsaram', panchData.samvatsaram],
        ['Sunrise', panchData.sunrise],
        ['Sunset', panchData.sunset],
        ['Moonrise', panchData.moonrise],
        ['Moonset', panchData.moonset],
        ['Yogam', panchData.yogam],
        ['Karanam', panchData.karanam],
        ['Rahu Kalam', panchData.rahuKalam],
        ['Gulika Kalam', panchData.gulikaKalam],
        ['Yamagandam', panchData.yamagandam],
        ['Abhijit Muhurtham', panchData.abhijitMuhurtham]
      ];

      gridElement.innerHTML = cards
        .map(([label, value]) => renderKeyValueCard(label, value || '--:--'))
        .join('');

      renderBadges();
      updateFavoriteStar();
      logger?.('Telugu panchangam synchronized with location backend.', 'info');
    } catch (error) {
      console.warn('Panchangam API fetch failed. Falling back to client-side calculations.', error);

      // Inject fallback warning banner
      const warningEl = document.createElement('div');
      warningEl.className = 'fallback-warning';
      warningEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <span>Offline Mode: Backend server unreachable. Displaying local approximations.</span>`;
      
      const summaryEl = panel.querySelector('.telugu-summary');
      if (summaryEl) {
        panel.insertBefore(warningEl, summaryEl);
      }

      if (!calendarData) {
        gridElement.innerHTML = `<div class="autocomplete-no-results">Failed to sync: Backend offline and local data not loaded.</div>`;
        return;
      }

      // Local offline engine computation fallback
      const calendar = calculateTeluguCalendar(selectedDate, calendarData);

      titleElement.textContent = `${calendar.masam} - ${calendar.tithiBaseName}`;
      subtitleElement.textContent = `${calendar.samvatsaram} Samvatsaram / ${calendar.locationLabel} (Local approximation)`;
      tithiElement.textContent = calendar.tithiDisplay;
      tithiEndElement.textContent = calendar.tithiEndDisplay;

      const cards = [
        ['Masam', calendar.masam],
        ['Paksham', calendar.paksha],
        ['Tithi Number', `${calendar.tithiNumber} / 30`],
        ['Nakshatram', calendar.nakshatram],
        ['Vaaram', calendar.vaaram],
        ['Samvatsaram', calendar.samvatsaram],
        ['Moon Longitude', calendar.moonLongitude],
        ['Sun Longitude', calendar.sunLongitude]
      ];

      gridElement.innerHTML = cards
        .map(([label, value]) => renderKeyValueCard(label, value))
        .join('');

      renderBadges();
      updateFavoriteStar();
      logger?.('Telugu panchangam rendered using client-side fallback engine.', 'warn');
    }
  }

  function show() {
    panel?.classList.remove('hidden');
  }

  function hide() {
    panel?.classList.add('hidden');
  }

  return { init, render, show, hide };
}
