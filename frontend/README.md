# NASA Mission Control Dashboard - Frontend Client

This directory contains the static, client-side application of the NASA Mission Control Dashboard and Telugu Panchangam client. It is designed to be hosted statically (e.g. on GitHub Pages) and query calculations from a separate API backend.

## Structure
* `index.html`: Main dashboard template.
* `styles.css`: Telemetry panel configurations.
* `src/`: Client logic split into modules (components, services, utils, main.js).
* `public/`: Static assets such as the favicon and control icons.

## API Handshake Configuration
The backend server URL is configured inside [src/config/appConfig.js](src/config/appConfig.js):
```javascript
export const APP_CONFIG = {
  // Point this to your live Railway API deployment or localhost for local testing
  apiUrl: 'http://localhost:3000/api', 
  ...
};
```

## Running Locally
Because this project utilizes ES Modules and browser `fetch()` APIs, it must be served using a local HTTP server:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Serve using Node's `http-server`:
   ```bash
   npx http-server . -p 4173
   ```
3. Open `http://localhost:4173` in your browser.

## Deploying to GitHub Pages
Since the frontend is a plain static website (HTML, CSS, JS), it can be deployed directly to GitHub Pages:

1. Push your repository to GitHub.
2. In the repository settings, go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Select the **main** branch.
5. In the folder dropdown, select **/** (root). 
   *Note: Since this is in a monorepo under `/frontend`, you can either set up a GitHub Action to deploy only the `frontend/` folder, or use a tool like `gh-pages` to publish the directory.*

To deploy easily using the `gh-pages` npm package:
```bash
# Install gh-pages
npm install -g gh-pages

# Publish the folder
gh-pages -d frontend
```
Your frontend will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.
