require('dotenv').config();

const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,

  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/collabproject',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  JWT_ISSUER: process.env.JWT_ISSUER || 'collabproject',
  JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'collabproject-users',

  // Email Configuration
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@collabproject.com',

  // SendGrid (alternative email service)
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',

  // File Upload Configuration
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  
  // Authentication Rate Limiting
  AUTH_RATE_LIMIT_WINDOW_MS: process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  AUTH_RATE_LIMIT_MAX_REQUESTS: process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 5,

  // Session Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000, // 24 hours

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  PASSWORD_MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,

  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: parseInt(process.env.MAX_PAGE_SIZE) || 100,

  // Cache Configuration
  CACHE_TTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log',

  // External APIs
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // WebSocket Configuration
  WS_PORT: process.env.WS_PORT || 3001,
  WS_HEARTBEAT_INTERVAL: process.env.WS_HEARTBEAT_INTERVAL || 30000,

  // Analytics
  ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED === 'true',
  ANALYTICS_TRACKING_ID: process.env.ANALYTICS_TRACKING_ID || '',

  // Feature Flags
  FEATURES: {
    REAL_TIME_CHAT: process.env.FEATURE_REAL_TIME_CHAT !== 'false',
    FILE_UPLOADS: process.env.FEATURE_FILE_UPLOADS !== 'false',
    EMAIL_NOTIFICATIONS: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',
    ANALYTICS: process.env.FEATURE_ANALYTICS !== 'false',
    RECOMMENDATIONS: process.env.FEATURE_RECOMMENDATIONS !== 'false'
  }
};

// Validation
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

if (config.NODE_ENV === 'production') {
  requiredEnvVars.forEach(envVar => {
    if (!config[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  });
}

module.exports = config;