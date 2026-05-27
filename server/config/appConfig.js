import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['*'],
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 500
  },
  defaults: {
    latitude: 17.3850,
    longitude: 78.4867,
    timezone: 'Asia/Kolkata',
    locationName: 'Hyderabad, Telangana, India'
  }
};
