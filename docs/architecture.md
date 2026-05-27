# Frontend Architecture

This app is intentionally lightweight: static HTML, layered CSS, JSON data, and vanilla JavaScript ES modules. The structure keeps the project GitHub Pages compatible while making future API integrations and framework migrations easier.

## Final Folder Tree

```text
/
  index.html
  styles.css
  README.md
  .nojekyll
  public/
    favicon.ico
    assets/
  docs/
    architecture.md
    api-plan.md
  src/
    main.js
    components/
      navbar.js
      planetaryPanel.js
      teluguCalendar.js
      telemetry.js
      audioController.js
      starfield.js
      loader.js
    services/
      nasaService.js
      astronomyService.js
      teluguCalendarService.js
    utils/
      math.js
      date.js
      formatting.js
      constants.js
    data/
      planets.json
      nakshatras.json
      samvatsarams.json
      tithis.json
    styles/
      base.css
      layout.css
      animations.css
      components.css
      theme.css
    config/
      appConfig.js
```

## Why Each Folder Exists

`src/components/` contains UI modules. Components read and update DOM elements, bind events, and call services when they need data. They should not own astronomy formulas or API URLs.

`src/services/` contains business logic and data access. Services calculate planetary positions, Telugu calendar values, or manage NASA embed details. This makes future API integration straightforward.

`src/utils/` contains pure helper functions and constants. These helpers have no DOM dependency and are easy to test or reuse.

`src/data/` contains static JSON data loaded with `fetch()`. This keeps large arrays out of JavaScript modules and prepares the app for future remote API data.

`src/styles/` contains layered CSS. `theme.css` owns design tokens, `base.css` owns resets, `layout.css` owns page structure, `animations.css` owns keyframes, and `components.css` owns reusable UI styles.

`src/config/` contains centralized app settings such as NASA URLs, telemetry settings, starfield settings, and JSON paths.

`public/` is for static assets that should be served unchanged.

`docs/` records architecture and future API plans so the next developer does not need to reverse engineer the app.

## Module Responsibilities

`main.js` composes the app. It creates components, wires view changes, starts telemetry/starfield, and handles top-level errors.

`navbar.js` owns the drawer menu, tab activation, and external link click sounds.

`planetaryPanel.js` loads `planets.json`, asks `astronomyService.js` for longitudes, and renders the planetary cards.

`teluguCalendar.js` owns the Telugu Calendar panel UI and delegates panchangam calculations to `teluguCalendarService.js`.

`telemetry.js` updates UTC/location readouts and provides the console logger.

`audioController.js` owns Web Audio state, ambient hum, sound effects, and UI audio cues.

`starfield.js` owns canvas sizing and animation.

`loader.js` owns iframe loading state transitions.

`nasaService.js` owns NASA Eyes embed URLs and iframe refresh helpers.

`astronomyService.js` owns reusable astronomical calculations.

`teluguCalendarService.js` loads Telugu calendar JSON and calculates masam, tithi, paksham, nakshatram, vaaram, and samvatsaram.

## How Modules Communicate

`main.js` is the mediator. UI components emit user intent through callbacks, and `main.js` decides which view should show.

```js
const navbar = createNavbar({
  onViewChange: handleViewChange,
  audio,
  logger
});
```

Panels are isolated. The planetary panel does not know about the Telugu panel. `main.js` hides and shows panels:

```js
planetaryPanel.hide();
teluguCalendar.show();
teluguCalendar.render();
```

Services stay DOM-free:

```js
const calendar = calculateTeluguCalendar(selectedDate, calendarData);
```

## Starter Code Pattern

Component modules expose a factory:

```js
export function createExampleComponent({ root, logger }) {
  function init() {}
  function render(data) {}
  return { init, render };
}
```

Service modules export pure functions or async data loaders:

```js
export async function loadExampleData() {
  const response = await fetch('./src/data/example.json');
  return response.json();
}
```

Utility modules export small pure helpers:

```js
export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}
```

## React Migration Path

The current modules already separate rendering, state coordination, and business logic. In a future React migration:

- Keep `services/`, `utils/`, `data/`, and `config/`.
- Convert each `components/*.js` file into a React component.
- Move `main.js` orchestration into a root `App` component.
- Keep GitHub Pages deployment using static build output.
