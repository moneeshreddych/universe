import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import panchangamRoutes from './routes/panchangamRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import { logger } from './utils/logger.js';
import { config } from './config/appConfig.js';

const app = express();
const PORT = config.port;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Secure Headers via Helmet with customized Content Security Policy (CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://*"]
      }
    }
  })
);

// 2. Cross-Origin Resource Sharing (CORS) Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn(`Blocked request from unauthorized origin: ${origin}`);
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. JSON Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 5. Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl || req.url} - IP: ${req.ip}`);
  next();
});

// 6. API Route Registration
app.use('/api', panchangamRoutes);
app.use('/api/location', locationRoutes);

// 7. Serve Vite static assets
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// 8. Health Check Endpoint (required for Railway deployment status checks)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ || 'Not Specified',
    uptime: process.uptime()
  });
});

// 9. Wildcard Fallback routing to support SPA (redirects all client routes to Vite's index.html)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 10. Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, err.stack);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    error: config.env === 'production' ? 'Internal Server Error' : err.message
  });
});

// 11. Start Server
app.listen(PORT, () => {
  logger.info('==================================================');
  logger.info(` Telugu Panchangam & Astronomy API Backend Launched`);
  logger.info(` Port: ${PORT}`);
  logger.info(` Environment: ${config.env}`);
  logger.info(` Allowed Origins: ${config.allowedOrigins.join(', ')}`);
  logger.info('==================================================');
});
