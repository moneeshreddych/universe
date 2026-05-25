export const APP_CONFIG = {
  appName: 'NASA Mission Control Dashboard',
  apiUrl: 'http://localhost:3000/api',
  defaultView: 'solar-system',
  nasaEyesUrl: 'https://eyes.nasa.gov/apps/solar-system/#/home?embed=true',
  externalLinks: {
    nasaEyes: 'https://eyes.nasa.gov/',
    jpl: 'https://www.jpl.nasa.gov/'
  },
  telemetry: {
    baseLatitude: 34.2012,
    baseLongitude: -118.1714,
    jitter: 0.0002,
    refreshMs: 1000
  },
  starfield: {
    count: 100,
    minSpeed: 0.02,
    maxSpeed: 0.1
  },
  teluguCalendar: {
    locationLabel: 'Hyderabad IST',
    timeZone: 'Asia/Kolkata'
  },
  dataPaths: {
    planets: './src/data/planets.json',
    nakshatras: './src/data/nakshatras.json',
    samvatsarams: './src/data/samvatsarams.json',
    tithis: './src/data/tithis.json'
  }
};

export const VIEW_IDS = {
  solarSystem: 'solar-system',
  planetaryPositions: 'planetary-positions',
  teluguCalendar: 'telugu-calendar'
};
