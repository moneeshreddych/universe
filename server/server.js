import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import calendarRouter from './routes/calendar.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Security Headers via Helmet
// Note: We adjust Content Security Policy (CSP) to allow NASA iframes and Google fonts.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        iframeSrc: ["'self'", "https://eyes.nasa.gov"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:", "https://*"],
        connectSrc: ["'self'", "https://*"]
      }
    }
  })
);

// 2. Enable CORS
app.use(cors());

// 3. Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. API Route Registration
app.use('/api/calendar', calendarRouter);

// 5. Serve Vite static assets
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// 6. Health Check Endpoint (required for Railway deployment status checks)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 7. Wildcard Fallback routing to support SPA (redirects all client routes to Vite's index.html)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// 8. Start Server
app.listen(PORT, () => {
  console.log('============================================');
  console.log(` Universe API Backend Listening on Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('============================================');
});
