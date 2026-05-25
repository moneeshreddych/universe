import { APP_CONFIG, VIEW_IDS } from './config/appConfig.js';
import { createAudioController } from './components/audioController.js';
import { createLoader } from './components/loader.js';
import { createNavbar } from './components/navbar.js';
import { createPlanetaryPanel } from './components/planetaryPanel.js';
import { createStarfield } from './components/starfield.js';
import { createTeluguCalendar } from './components/teluguCalendar.js';
import { createLogger, createTelemetry } from './components/telemetry.js';
import {
  ensureNasaIframeSource,
  getNasaEyesEmbedUrl,
  reloadNasaIframe
} from './services/nasaService.js';

function getElements() {
  return {
    iframe: document.getElementById('nasa-eyes-iframe'),
    iframeLoader: document.getElementById('iframe-loader'),
    viewportTitle: document.getElementById('current-viewport-name'),
    btnRefresh: document.getElementById('btn-refresh'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    btnAmbientAudio: document.getElementById('btn-ambient-audio'),
    btnSoundEffects: document.getElementById('btn-sound-effects'),
    telemetryUtc: document.getElementById('telemetry-utc'),
    telemetryLocation: document.getElementById('telemetry-location'),
    btnHamburgerMenu: document.getElementById('btn-hamburger-menu'),
    hamburgerDrawer: document.getElementById('hamburger-drawer'),
    btnCloseDrawer: document.getElementById('btn-close-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    drawerTabs: Array.from(document.querySelectorAll('.drawer-tab')),
    externalLinks: Array.from(document.querySelectorAll('.drawer-links a:not(.drawer-tab)')),
    starfieldCanvas: document.getElementById('starfield-canvas'),
    iframeContainer: document.getElementById('iframe-container'),
    planetaryPanel: document.getElementById('planetary-panel'),
    planetaryGrid: document.getElementById('planetary-grid'),
    planetaryTimestamp: document.getElementById('planetary-timestamp'),
    teluguPanel: document.getElementById('telugu-calendar-panel'),
    teluguDateInput: document.getElementById('telugu-date-input'),
    btnTeluguToday: document.getElementById('btn-telugu-today'),
    teluguDateTitle: document.getElementById('telugu-date-title'),
    teluguDateSubtitle: document.getElementById('telugu-date-subtitle'),
    teluguTithiTitle: document.getElementById('telugu-tithi-title'),
    teluguTithiEnd: document.getElementById('telugu-tithi-end'),
    teluguGrid: document.getElementById('telugu-grid')
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  const el = getElements();
  const logger = createLogger();
  const audio = createAudioController({ logger });
  const loader = createLoader(el.iframeLoader, el.iframe);
  const telemetry = createTelemetry({
    utcElement: el.telemetryUtc,
    locationElement: el.telemetryLocation
  });
  const starfield = createStarfield(el.starfieldCanvas);
  const planetaryPanel = createPlanetaryPanel({
    panel: el.planetaryPanel,
    grid: el.planetaryGrid,
    timestamp: el.planetaryTimestamp
  });
  const teluguCalendar = createTeluguCalendar({
    panel: el.teluguPanel,
    dateInput: el.teluguDateInput,
    todayButton: el.btnTeluguToday,
    titleElement: el.teluguDateTitle,
    subtitleElement: el.teluguDateSubtitle,
    tithiElement: el.teluguTithiTitle,
    tithiEndElement: el.teluguTithiEnd,
    gridElement: el.teluguGrid,
    audio,
    logger
  });

  let activeView = APP_CONFIG.defaultView;

  async function showSolarSystem() {
    activeView = VIEW_IDS.solarSystem;
    navbar.setActiveTab(activeView);
    el.viewportTitle.textContent = 'Solar System';
    planetaryPanel.hide();
    teluguCalendar.hide();
    el.iframe.classList.remove('hidden');
    ensureNasaIframeSource(el.iframe);
    logger('Solar System viewport restored.', 'action');
  }

  async function showPlanetaryPositions() {
    activeView = VIEW_IDS.planetaryPositions;
    navbar.setActiveTab(activeView);
    el.viewportTitle.textContent = 'Planetary Positions';
    el.iframe.classList.add('hidden');
    loader.hide();
    teluguCalendar.hide();
    planetaryPanel.show();
    await planetaryPanel.render();
    logger('Planetary position grid synchronized.', 'action');
  }

  async function showTeluguCalendar() {
    activeView = VIEW_IDS.teluguCalendar;
    navbar.setActiveTab(activeView);
    el.viewportTitle.textContent = 'Telugu Calendar';
    el.iframe.classList.add('hidden');
    loader.hide();
    planetaryPanel.hide();
    teluguCalendar.show();
    teluguCalendar.render();
  }

  async function handleViewChange(viewName) {
    try {
      if (viewName === VIEW_IDS.planetaryPositions) {
        await showPlanetaryPositions();
      } else if (viewName === VIEW_IDS.teluguCalendar) {
        await showTeluguCalendar();
      } else {
        await showSolarSystem();
      }
    } catch (error) {
      console.error(error);
      logger(`View switch failed: ${error.message}`, 'warn');
    }
  }

  const navbar = createNavbar({
    menuButton: el.btnHamburgerMenu,
    closeButton: el.btnCloseDrawer,
    drawer: el.hamburgerDrawer,
    backdrop: el.drawerBackdrop,
    tabs: el.drawerTabs,
    externalLinks: el.externalLinks,
    audio,
    logger,
    onViewChange: handleViewChange
  });

  try {
    logger('Booting dashboard systems... Kernel v9.42-NASA', 'info');
    el.iframe.src = getNasaEyesEmbedUrl();
    await Promise.all([planetaryPanel.init(), teluguCalendar.init()]);

    starfield.start();
    telemetry.start();
    audio.bindAmbientButton(el.btnAmbientAudio);
    audio.bindSfxButton(el.btnSoundEffects);
    navbar.init();
    navbar.setActiveTab(activeView);

    el.iframe.addEventListener('load', () => {
      if (activeView !== VIEW_IDS.solarSystem) return;
      loader.hide();
      logger('Telemetry link locked. Displaying visualization deck.', 'info');
      audio.playBeep(950, 0.1);
    });

    el.btnRefresh.addEventListener('click', async () => {
      audio.playBeep(700, 0.08);
      if (activeView === VIEW_IDS.planetaryPositions) {
        await planetaryPanel.render();
        logger('Refreshing planetary position calculations...', 'action');
        return;
      }
      if (activeView === VIEW_IDS.teluguCalendar) {
        teluguCalendar.render();
        logger('Refreshing Telugu panchangam calculations...', 'action');
        return;
      }
      loader.show();
      reloadNasaIframe(el.iframe);
      logger('Refreshing active telemetry link...', 'action');
    });

    el.btnFullscreen.addEventListener('click', async () => {
      audio.playBeep(850, 0.08);
      try {
        if (!document.fullscreenElement) {
          await el.iframeContainer.requestFullscreen();
          logger('Viewport expanded to IMAX telemetry screen.', 'info');
        } else {
          await document.exitFullscreen();
        }
      } catch (error) {
        audio.playErrorBeep();
        logger(`IMAX viewport expansion failed: ${error.message}`, 'warn');
      }
    });

    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        logger('Viewport returned to nominal grid sizing.', 'info');
      }
    });

    logger('Establishing secure handshake with JPL Telemetry server.', 'action');
    setTimeout(() => logger('Handshake verified. Remote telemetry sync enabled.', 'info'), 800);
    setTimeout(() => logger('Solar System visualization rendering starting...', 'action'), 1200);
    logger('Telemetry system connection stable.', 'info');
  } catch (error) {
    console.error(error);
    logger(`Application startup failed: ${error.message}`, 'warn');
  }
});
