import { APP_CONFIG } from '../config/appConfig.js';
import { getPlanetLongitude } from '../services/astronomyService.js';
import { formatUtcTimestamp } from '../utils/formatting.js';

async function loadPlanets() {
  const response = await fetch(APP_CONFIG.dataPaths.planets);
  if (!response.ok) {
    throw new Error(`Unable to load planet data: ${response.status}`);
  }
  return response.json();
}

function renderPlanetCard(planet, longitude) {
  return `
    <article class="planet-card">
      <div class="planet-orbit">
        <span class="planet-marker" style="transform: rotate(${longitude.toFixed(2)}deg) translateX(34px);"></span>
      </div>
      <div class="planet-readout">
        <h3>${planet.name}</h3>
        <dl>
          <div>
            <dt>ECL LONG</dt>
            <dd>${longitude.toFixed(1)} DEG</dd>
          </div>
          <div>
            <dt>MEAN DIST</dt>
            <dd>${planet.distance}</dd>
          </div>
          <div>
            <dt>TRACK</dt>
            <dd>${planet.signal}</dd>
          </div>
        </dl>
      </div>
    </article>
  `;
}

export function createPlanetaryPanel({ panel, grid, timestamp }) {
  let planets = [];

  async function init() {
    planets = await loadPlanets();
  }

  async function render(date = new Date()) {
    if (!planets.length) {
      await init();
    }

    timestamp.textContent = formatUtcTimestamp(date);
    grid.innerHTML = planets
      .map((planet) => renderPlanetCard(planet, getPlanetLongitude(planet, date)))
      .join('');
  }

  function show() {
    panel?.classList.remove('hidden');
  }

  function hide() {
    panel?.classList.add('hidden');
  }

  return { init, render, show, hide };
}
