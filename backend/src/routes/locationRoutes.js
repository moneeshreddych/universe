import express from 'express';
import { cacheMiddleware } from '../utils/cache.js';
import { searchLocation } from '../services/locationService.js';

const router = express.Router();

router.get('/search', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query parameter "q" must be at least 2 characters.' });
    }
    const results = await searchLocation(query);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
