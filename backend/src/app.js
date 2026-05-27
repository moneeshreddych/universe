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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Secure Headers via Helmet
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS) Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like server-to-server, mobile apps, or curl)
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
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
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

// Serve frontend static assets
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Dynamic fallback routing for front-end client
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 7. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    timezone: process.env.TZ || 'Not Specified',
    uptime: process.uptime()
  });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Unhandle error: ${err.message}`, err.stack);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    error: config.env === 'production' ? 'Internal Server Error' : err.message
  });
});

// 9. Startup Listener
app.listen(config.port, () => {
  logger.info(`==================================================`);
  logger.info(` Telugu Panchangam & Astronomy API Backend Launched`);
  logger.info(` Port: ${config.port}`);
  logger.info(` Environment: ${config.env}`);
  logger.info(` Allowed Origins: ${config.allowedOrigins.join(', ')}`);
  logger.info(`==================================================`);
});
