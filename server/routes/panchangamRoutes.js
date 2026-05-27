import express from 'express';
import { cacheMiddleware } from '../utils/cache.js';
import {
  getPanchangam,
  getMonthPanchangam,
  getGrahas,
  getTithi,
  getNakshatra,
  getMuhurtham,
  getFestivals
} from '../controllers/panchangamController.js';

const router = express.Router();

const shortCache = cacheMiddleware(3600); // 1 hour cache
const longCache = cacheMiddleware(86400); // 24 hour cache

router.get('/panchangam', shortCache, getPanchangam);
router.get('/panchangam/month', shortCache, getMonthPanchangam);
router.get('/grahas', shortCache, getGrahas);
router.get('/tithi', shortCache, getTithi);
router.get('/nakshatra', shortCache, getNakshatra);
router.get('/muhurtham', shortCache, getMuhurtham);
router.get('/festivals', longCache, getFestivals);

export default router;
