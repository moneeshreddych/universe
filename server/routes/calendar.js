import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load calendar dataset
const calendarDataPath = path.join(__dirname, '../data/calendar_2026.json');
let calendarData = {};

try {
  const fileContent = fs.readFileSync(calendarDataPath, 'utf8');
  calendarData = JSON.parse(fileContent);
} catch (error) {
  console.error('Failed to load calendar dataset:', error);
}

/**
 * @route   GET /api/calendar/2026
 * @desc    Get the full pre-computed Telugu calendar details for 2026
 */
router.get('/2026', (req, res) => {
  res.json(calendarData);
});

/**
 * @route   GET /api/calendar/day/:date
 * @desc    Get details for a specific date in YYYY-MM-DD format
 */
router.get('/day/:date', (req, res) => {
  const { date } = req.params;
  
  // Format validation (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
  }

  const dateDetails = calendarData[date];
  if (!dateDetails) {
    return res.status(404).json({ error: `Panchangam details not found for date: ${date}` });
  }

  res.json(dateDetails);
});

/* ==========================================
 * FUTURE-READY API PLACEMENTS (Astrology, NASA & Astronomy)
 * ========================================== */

/**
 * @route   GET /api/astronomy/planetary-positions
 * @desc    Placeholder for future live heliocentric/geocentric planetary coordinate calculations
 */
router.get('/astronomy/planetary-positions', (req, res) => {
  res.json({
    status: 'future_ready',
    message: 'Integration with astronomy-engine for real-time planet coordinates is scheduled for v2.0.',
    coordinates: {
      Sun: { longitude: '62.43 DEG', rasi: 'Vrishabha' },
      Moon: { longitude: '124.50 DEG', rasi: 'Simha' },
      Mars: { longitude: '35.12 DEG', rasi: 'Mesha' }
    }
  });
});

/**
 * @route   GET /api/astrology/tithi-calc
 * @desc    Placeholder for live dynamic tithi and nakshatra calculations based on coordinates
 */
router.get('/astrology/tithi-calc', (req, res) => {
  res.json({
    status: 'future_ready',
    message: 'Dynamic Hindu Panchangam calculations using geocentric coordinates.',
    formula: 'Tithi = (Moon_Longitude - Sun_Longitude) / 12'
  });
});

/**
 * @route   GET /api/nasa/apod
 * @desc    Placeholder for proxying NASA Astronomy Picture of the Day (APOD) API
 */
router.get('/nasa/apod', (req, res) => {
  res.json({
    status: 'future_ready',
    message: 'APOD integration endpoint to fetch cosmic images dynamically.'
  });
});

export default router;
