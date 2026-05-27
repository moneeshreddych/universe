# Standalone Telugu Panchangam & Hindu Astronomy API

This is a production-grade, highly precise, standalone REST API service that calculates the traditional Hindu/Telugu calendar (Panchangam) and planetary coordinates (Grahas). It is built with Node.js, Express.js, and ES modules, and utilizes the high-precision `astronomy-engine` for orbital mechanics combined with Chitrapaksha Lahiri Ayanamsa for sidereal zodiac conversions.

## Features
* **Modular Architecture**: Separate directories for routes, controllers, services, database constants, and utilities.
* **Modern Stack**: Node.js, Express, ES modules, native Timezone formatting via `Intl` API.
* **Production-Ready Security**: Enabled CORS, rate limiting, and secure HTTP headers via `helmet`.
* **High Performance**: Built-in memory cache middleware caching daily results to avoid redundant calculations.
* **Location-Aware**: Sunrise, sunset, and Muhurtham calculations accept coordinates (`lat`, `lon`, `alt`) and local `timezone` parameters (defaulting to Hyderabad, India).
* **Vedic Panchangam Standards**: Panchangam elements (Tithi, Nakshatra, Yoga, Karana, Samvatsara) are calculated dynamically at the local **sunrise** time.
* **Annual Festival Scanner**: Dynamic rules-based scanner detecting dates of holidays like Ugadi, Shivaratri, Deepavali, and Varalakshmi Vratam for any given year.

---

## Getting Started

### Prerequisites
* Node.js v18.0.0 or higher.
* npm or yarn.

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   *Modify the port and allowed origins in `.env` as needed.*

### Local Development
To launch the server locally with auto-reload (Node.js native watcher):
```bash
npm run dev
```
The server will start by default at `http://localhost:3000`.

### Production Execution
To start in production mode:
```bash
npm start
```

---

## API Endpoints

### 1. Panchangam
Returns the full Panchangam for a specific day.
* **Endpoint**: `GET /api/panchangam`
* **Query Parameters**:
  * `date`: (Optional) `YYYY-MM-DD` (defaults to today's date in target timezone).
  * `timezone`: (Optional) IANA timezone, e.g. `Asia/Kolkata` (default: `Asia/Kolkata`).
  * `lat`: (Optional) Latitude in degrees (default: `17.3850` - Hyderabad).
  * `lon`: (Optional) Longitude in degrees (default: `78.4867` - Hyderabad).
  * `alt`: (Optional) Elevation in meters (default: `0`).

#### Example Request
```http
GET /api/panchangam?date=2026-05-25&timezone=Asia/Kolkata
```

#### Example Response
```json
{
  "date": "2026-05-25",
  "masam": "Vaishakham",
  "paksham": "Shukla Paksham",
  "tithi": "Ekadashi",
  "nakshatram": "Rohini",
  "yogam": "Siddhi",
  "karanam": "Balava",
  "vaaram": "Somavaram",
  "samvatsaram": "Vishvavasu",
  "sunrise": "05:42",
  "sunset": "18:29",
  "moonrise": "15:10",
  "moonset": "02:41"
}
```

---

### 2. Planetary Coordinates (Grahas)
Returns the sidereal longitude, Rasi, Nakshatra, and retrograde state for the 9 planets.
* **Endpoint**: `GET /api/grahas`
* **Query Parameters**: Same as `/api/panchangam` (evaluates at local noon).

#### Example Request
```http
GET /api/grahas?date=2026-05-25
```

#### Example Response
```json
[
  {
    "name": "Sun",
    "siderealLongitude": "40.35 DEG",
    "rasi": "Vrishabha",
    "nakshatra": "Krittika - Pada 4",
    "retrograde": false
  },
  {
    "name": "Moon",
    "siderealLongitude": "44.92 DEG",
    "rasi": "Vrishabha",
    "nakshatra": "Rohini - Pada 2",
    "retrograde": false
  },
  {
    "name": "Mars",
    "siderealLongitude": "15.22 DEG",
    "rasi": "Mesha",
    "nakshatra": "Bharani - Pada 1",
    "retrograde": false
  },
  {
    "name": "Rahu",
    "siderealLongitude": "320.15 DEG",
    "rasi": "Kumbha",
    "nakshatra": "Shatabhisha - Pada 4",
    "retrograde": true
  },
  {
    "name": "Ketu",
    "siderealLongitude": "140.15 DEG",
    "rasi": "Simha",
    "nakshatra": "Pubba - Pada 3",
    "retrograde": true
  }
]
```

---

### 3. Tithi Details
Returns Tithi elongation degree and exact transition/end times.
* **Endpoint**: `GET /api/tithi`
* **Query Parameters**: Same as `/api/panchangam`.

#### Example Request
```http
GET /api/tithi?date=2026-05-25
```

#### Example Response
```json
{
  "date": "2026-05-25",
  "tithiNumber": 11,
  "tithi": "Ekadasi",
  "paksham": "Shukla Paksham",
  "elongation": 126.43,
  "endsAt": "2026-05-25T14:30:15.112Z"
}
```

---

### 4. Nakshatra Details
Returns Nakshatra details, moon position, and exact end timings.
* **Endpoint**: `GET /api/nakshatra`
* **Query Parameters**: Same as `/api/panchangam`.

#### Example Request
```http
GET /api/nakshatra?date=2026-05-25
```

#### Example Response
```json
{
  "date": "2026-05-25",
  "nakshatraNumber": 4,
  "nakshatraName": "Rohini",
  "pada": 2,
  "siderealLongitude": 44.92,
  "endsAt": "2026-05-25T16:15:22.009Z"
}
```

---

### 5. Muhurtham Times
Returns local times for key daily Muhurthams.
* **Endpoint**: `GET /api/muhurtham`
* **Query Parameters**: Same as `/api/panchangam`.

#### Example Request
```http
GET /api/muhurtham?date=2026-05-25&timezone=Asia/Kolkata
```

#### Example Response
```json
{
  "date": "2026-05-25",
  "timezone": "Asia/Kolkata",
  "rahuKalam": "15:10 - 16:47",
  "gulikaKalam": "11:57 - 13:34",
  "yamagandam": "09:03 - 10:40",
  "abhijit": "11:41 - 12:29"
}
```

---

### 6. Festival Calendar (Year Scan)
Scans the entire year dynamically and returns all major festival dates.
* **Endpoint**: `GET /api/festivals`
* **Query Parameters**:
  * `year`: (Optional) Year to scan between 1900 and 2100 (default: current year).
  * `timezone`, `lat`, `lon`, `alt`: Same as above.

#### Example Request
```http
GET /api/festivals?year=2026
```

#### Example Response
```json
[
  {
    "date": "2026-01-14",
    "name": "Bhogi / Makara Sankranti",
    "description": "Sun transits into Makara Rasi (Capricorn)"
  },
  {
    "date": "2026-02-15",
    "name": "Maha Shivaratri",
    "description": "The Great Night of Lord Shiva"
  },
  {
    "date": "2026-03-19",
    "name": "Ugadi",
    "description": "Telugu New Year"
  },
  {
    "date": "2026-03-27",
    "name": "Sri Rama Navami",
    "description": "Birth anniversary of Lord Sri Rama"
  }
]
```

---

## Frontend Integration

Here is how your static GitHub Pages application (using Vanilla JS / ES modules) can connect to this deployed API:

```javascript
// config/appConfig.js
export const API_BASE_URL = 'https://my-panchangam-api.onrender.com/api';

// services/panchangamService.js
export async function fetchPanchangam(dateStr, timezone = 'Asia/Kolkata') {
  try {
    const url = `${API_BASE_URL}/panchangam?date=${dateStr}&timezone=${timezone}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to sync with Panchangam API, using fallback:', error);
    return null;
  }
}
```

---

## Deployment Instructions

### 1. Deploying to Render
1. Create a free account at [Render](https://render.com/).
2. Click **New > Web Service** and connect your GitHub repository.
3. Set the following settings:
   * **Root Directory**: `backend` (if in a monorepo, otherwise blank)
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. In **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `PORT`: `10000` (Render binds automatically, but good to declare)
   * `ALLOWED_ORIGINS`: `https://YOUR_GITHUB_USERNAME.github.io`
5. Deploy. Render will provide a URL like `https://xxx.onrender.com`.

### 2. Deploying to Railway
1. Create an account on [Railway.app](https://railway.app/).
2. Click **New Project > Deploy from GitHub** and select your repository.
3. Railway automatically detects `package.json` and start scripts.
4. Set variables under **Variables** tab:
   * `NODE_ENV`: `production`
   * `ALLOWED_ORIGINS`: `https://YOUR_GITHUB_USERNAME.github.io`
5. Railway compiles and exposes a public HTTPS endpoint automatically.

### 3. Deploying to Vercel
To deploy this as an Express API on Vercel:
1. Create a `vercel.json` in the `backend/` directory:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "src/app.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "src/app.js" }
     ]
   }
   ```
2. Install Vercel CLI (`npm i -g vercel`) and run `vercel` inside `backend/`.
3. Set the environment variables in the Vercel dashboard.

### 4. VPS (Virtual Private Server) Deployment
Using Ubuntu, Nginx, and PM2:
1. SSH into your server, clone the repo, and run `npm install`.
2. Install PM2 globally: `npm install -g pm2`
3. Start the application:
   ```bash
   pm2 start src/app.js --name "panchangam-api"
   ```
4. Set up an Nginx reverse proxy block:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
5. Apply SSL certificate using certbot (`sudo certbot --nginx`).
