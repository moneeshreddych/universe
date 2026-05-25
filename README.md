# Deep Space Mission Control & Telugu Panchangam Monorepo

This repository is structured as a clean monorepo containing a static telemetry frontend and a standalone Express.js backend for traditional Hindu Panchangam (Vedic calendar) and astronomical calculations.

## Monorepo Architecture

```
project-root/
├── frontend/                 # Static web client (HTML5, CSS, Vanilla JS ES modules)
│   ├── src/                  # Modules: components, configs, services, telemetry, main.js
│   ├── public/               # Asset icons and static dependencies
│   ├── index.html            # Main GUI entrypoint
│   └── styles.css            # Cyber-neon telemetry panel styles
│
├── backend/                  # REST API server (Node.js, Express, astronomy-engine)
│   ├── src/                  # Routes, controllers, services, mathematical utils, config
│   ├── package.json          # Node configuration & launch script
│   └── README.md             # API docs & calculations guidelines
│
├── docs/                     # General repository architecture sheets
└── README.md                 # Monorepo administration guide (this file)
```

---

## Local Development Setup

To run both services locally:

### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
*The API will start locally at `http://localhost:3000`.*

### 2. Start the Frontend Client
```bash
cd frontend
npx http-server . -p 4173
```
*Open `http://localhost:4173` in your browser to view the Mission Control interface.*

---

## Deployment Guidelines

### 1. Backend: Deploying to Railway

Railway allows you to deploy subdirectory services within a monorepo easily. Follow these steps to deploy **only** the Express API:

1. **Create a Project**: Log in to [Railway.app](https://railway.app/) and create a new project linked to this GitHub repository.
2. **Configure the Service Root Directory**:
   * Navigate to your service settings in the Railway dashboard.
   * Go to **Settings > General > Root Directory**.
   * Set this value to: `backend`.
   * *This tells Railway to ignore the frontend files at the root, look directly inside the `/backend` folder, install packages from `backend/package.json`, and run `npm start`.*
3. **Port Handling**:
   * Our Express server is programmed to bind to `process.env.PORT` automatically.
   * Railway automatically injects the correct `PORT` variable during startup. You do **not** need to manually add a `PORT` environment variable.
4. **Environment Variables**:
   * Under the **Variables** tab, add:
     * `NODE_ENV`: `production`
     * `ALLOWED_ORIGINS`: `https://YOUR_GITHUB_USERNAME.github.io` (your published frontend domain)
5. **Domain Generation**:
   * Go to the **Settings** tab.
   * Under **Networking**, click **Generate Domain** to get a public secure HTTPS endpoint URL (e.g., `https://project-api.up.railway.app`).

---

## 2. Frontend: Deploying to GitHub Pages

The frontend consists of plain static HTML, CSS, and JS. It can be hosted on GitHub Pages:

1. Update the backend API URL inside `frontend/src/config/appConfig.js`:
   ```javascript
   export const APP_CONFIG = {
     apiUrl: 'https://project-api.up.railway.app/api', // Replace with your Railway domain
     ...
   };
   ```
2. Build and push your monorepo branch to GitHub.
3. Deploy the `/frontend` directory using the `gh-pages` helper package:
   ```bash
   # Install gh-pages CLI globally
   npm install -g gh-pages

   # Deploy the frontend folder to the gh-pages branch
   gh-pages -d frontend
   ```
4. Your dashboard will be live at `https://YOUR_GITHUB_USERNAME.github.io/REPOSITORY_NAME/`.
