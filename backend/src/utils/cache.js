import { logger } from './logger.js';

const cache = new Map();

/**
 * Express middleware for simple memory caching.
 * @param {number} durationSeconds - Cache duration in seconds (default: 3600 / 1 hour)
 */
export function cacheMiddleware(durationSeconds = 3600) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      const now = Date.now();
      if (now < cachedResponse.expiration) {
        logger.debug(`Cache hit for key: ${key}`);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('Content-Type', 'application/json');
        return res.send(cachedResponse.data);
      } else {
        // Cache expired
        cache.delete(key);
      }
    }

    // Override res.send to capture response
    const originalSend = res.send;
    res.send = function (body) {
      // Only cache successful JSON responses
      if (res.statusCode === 200) {
        cache.set(key, {
          data: body,
          expiration: Date.now() + durationSeconds * 1000
        });
      }
      res.setHeader('X-Cache', 'MISS');
      return originalSend.apply(res, arguments);
    };

    next();
  };
}

/**
 * Clears the cache.
 */
export function clearCache() {
  cache.clear();
  logger.info('Cache cleared');
}
