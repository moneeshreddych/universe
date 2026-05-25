const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m', // Cyan
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  debug: '\x1b[90m'  // Gray
};

export const logger = {
  info: (msg, ...args) => {
    console.log(`${colors.info}[INFO]${colors.reset} [${new Date().toISOString()}] ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`${colors.warn}[WARN]${colors.reset} [${new Date().toISOString()}] ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`${colors.error}[ERROR]${colors.reset} [${new Date().toISOString()}] ${msg}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colors.debug}[DEBUG]${colors.reset} [${new Date().toISOString()}] ${msg}`, ...args);
    }
  }
};
