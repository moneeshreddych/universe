# NASA Mission Control Dashboard

A static NASA-themed mission control dashboard built with HTML, CSS, and vanilla JavaScript ES modules.

## Features

- NASA Eyes embed
- Planetary Positions view
- Telugu Calendar / panchangam view
- Audio controls
- Starfield animation
- Fullscreen mode
- Drawer navigation

## Architecture

The app is split into small frontend modules under `src/`:

- `components/` renders UI and binds DOM events.
- `services/` owns business logic and external/static data access.
- `utils/` stores reusable pure helpers.
- `data/` stores JSON used by the services.
- `styles/` stores layered CSS.
- `config/` stores app-wide configuration.

Read more in [docs/architecture.md](docs/architecture.md).

## Run Locally

Serve the folder from a local web server because ES modules and `fetch()` cannot reliably load JSON from `file://`.

```powershell
py -m http.server 4173 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4173/index.html
```

## GitHub Pages

This project is plain static HTML, CSS, JSON, and JavaScript. It can be hosted directly from the repository root with GitHub Pages.

1. Push this folder to a GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings > Pages**.
4. Set **Source** to **Deploy from a branch**.
5. Select branch **main** and folder **/**.
6. Save.

Your site will publish at:

```text
https://YOUR-USERNAME.github.io/REPOSITORY-NAME/
```
