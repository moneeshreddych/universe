# API Integration Plan

The app is currently static and GitHub Pages compatible. Future APIs should be introduced behind service modules so UI components do not depend on network details.

## NASA Data

Use `src/services/nasaService.js` for NASA endpoints and embed configuration. Add new functions such as:

```js
export async function fetchMissionFeed() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Mission feed failed');
  return response.json();
}
```

## Astronomy Data

Keep deterministic math in `astronomyService.js`. If a remote ephemeris API is added later, expose the same data shape that the UI already expects:

```js
export async function getPlanetPosition(planetName, date) {
  return { name: planetName, longitude: 123.4 };
}
```

## Telugu Panchangam

Keep panchangam logic in `teluguCalendarService.js`. If a verified panchangam provider is added later, create an adapter that returns:

```js
{
  masam,
  paksha,
  tithiDisplay,
  tithiEndDisplay,
  nakshatram,
  vaaram,
  samvatsaram
}
```

## Error Handling

Every service call should:

- Check `response.ok`.
- Throw a readable `Error`.
- Let `main.js` or the owning component decide how to show fallback UI.

## GitHub Pages Notes

GitHub Pages serves static files only. API keys must not be embedded directly in client code unless they are explicitly public browser keys. For private keys, use a serverless proxy outside GitHub Pages.
