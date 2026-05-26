import { APP_CONFIG } from './config/appConfig.js';
import { createAudioController } from './components/audioController.js';
import { createStarfield } from './components/starfield.js';
import { createTeluguCalendar } from './components/teluguCalendar.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Simple Logger
  const logger = (msg, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${msg}`);
  };

  // Instantiate audio controller
  const audio = createAudioController({ logger });
  
  // DOM Elements
  const el = {
    btnSidebarToggle: document.getElementById('btn-sidebar-toggle'),
    calendarSidebar: document.getElementById('calendar-sidebar'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    selectView: document.getElementById('select-view'),
    btnToday: document.getElementById('btn-today'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    labelCurrentRange: document.getElementById('label-current-range'),
    locationSearchInput: document.getElementById('location-search-input'),
    btnGpsLocation: document.getElementById('btn-gps-location'),
    btnAmbientAudio: document.getElementById('btn-ambient-audio'),
    btnSoundEffects: document.getElementById('btn-sound-effects'),
    starfieldCanvas: document.getElementById('starfield-canvas')
  };

  // 1. Initialize Starfield (runs only on canvas, animated when in cosmic-theme)
  let starfield = null;
  if (el.starfieldCanvas) {
    starfield = createStarfield(el.starfieldCanvas);
    starfield.start();
  }

  // 2. Audio Bindings
  if (el.btnAmbientAudio) {
    audio.bindAmbientButton(el.btnAmbientAudio);
  }
  if (el.btnSoundEffects) {
    audio.bindSfxButton(el.btnSoundEffects);
  }

  // 3. Theme Toggle Logic (Cycle: Light -> Dark -> Cosmic)
  let activeTheme = localStorage.getItem('panchangamTheme') || 'light';
  applyTheme(activeTheme);

  el.btnThemeToggle?.addEventListener('click', () => {
    audio.playBeep(950, 0.08);
    if (activeTheme === 'light') {
      activeTheme = 'dark';
    } else if (activeTheme === 'dark') {
      activeTheme = 'cosmic';
    } else {
      activeTheme = 'light';
    }
    localStorage.setItem('panchangamTheme', activeTheme);
    applyTheme(activeTheme);
  });

  function applyTheme(theme) {
    document.body.className = '';
    const scanlines = document.getElementById('scanlines-overlay');
    
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      if (scanlines) scanlines.classList.add('hidden');
    } else if (theme === 'cosmic') {
      document.body.classList.add('cosmic-theme');
      if (scanlines) scanlines.classList.remove('hidden');
    } else {
      if (scanlines) scanlines.classList.add('hidden');
    }
    logger(`Theme changed to: ${theme}`, 'action');
  }

  // 4. Sidebar Toggle Logic
  let sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (sidebarCollapsed) {
    el.calendarSidebar?.classList.add('collapsed');
  }

  el.btnSidebarToggle?.addEventListener('click', () => {
    audio.playBeep(800, 0.05);
    sidebarCollapsed = !sidebarCollapsed;
    el.calendarSidebar?.classList.toggle('collapsed', sidebarCollapsed);
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  });

  // 5. Initialize Telugu Calendar component
  const teluguCalendar = createTeluguCalendar({
    audio,
    logger,
    el: {
      selectView: el.selectView,
      btnToday: el.btnToday,
      btnPrev: el.btnPrev,
      btnNext: el.btnNext,
      labelCurrentRange: el.labelCurrentRange,
      locationSearchInput: el.locationSearchInput,
      btnGpsLocation: el.btnGpsLocation
    }
  });

  try {
    await teluguCalendar.init();
    logger('Panchangam systems online and active.', 'info');
  } catch (err) {
    console.error('System bootstrap failed', err);
    logger('System bootstrap encountered a critical error.', 'warn');
  }
});
