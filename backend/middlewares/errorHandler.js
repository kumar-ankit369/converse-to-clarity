/**
 * Error Handling Middleware
 * Global error handler for the application
 */

const fs = require('fs');
const path = require('path');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
    ...(err.code && { code: err.code })
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.code && { code: err.code })
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// Handle specific MongoDB/Mongoose errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists. Please use another value.`;
  return new AppError(message, 400, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');

// Rate limit error handler
const handleRateLimitError = (err) => {
  return new AppError(
    'Too many requests from this IP, please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
};

// File upload error handler
const handleMulterError = (err) => {
  let message = 'File upload error';
  let code = 'UPLOAD_ERROR';

  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      message = 'File too large';
      code = 'FILE_TOO_LARGE';
      break;
    case 'LIMIT_FILE_COUNT':
      message = 'Too many files';
      code = 'TOO_MANY_FILES';
      break;
    case 'LIMIT_UNEXPECTED_FILE':
      message = 'Unexpected file field';
      code = 'UNEXPECTED_FILE';
      break;
    default:
      message = err.message || 'File upload error';
  }

  return new AppError(message, 400, code);
};

// Log errors to file
const logError = (err, req) => {
  const logDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'error.log');
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      user: req.user ? req.user.id : 'anonymous'
    }
  };

  fs.appendFile(logFile, JSON.stringify(logEntry) + '\n', (writeErr) => {
    if (writeErr) {
      console.error('Failed to write to error log:', writeErr);
    }
  });
};

// Main error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error in production
  if (process.env.NODE_ENV === 'production') {
    logError(err, req);
  }

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (error.name === 'MulterError') error = handleMulterError(error);

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  next(new AppError(message, 404, 'ROUTE_NOT_FOUND'));
};

// Unhandled promise rejection handler
process.on('unhandledRejection', (err, promise) => {
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  
  process.exit(1);
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  process.on(signal, () => {
    console.log(`${signal} received. Shutting down gracefully...`);
    
    // Close server
    if (global.server) {
      global.server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });
};

gracefulShutdown('SIGTERM');
gracefulShutdown('SIGINT');

// Error response helper
const sendError = (res, statusCode, message, code = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    ...(code && { code })
  });
};

// Success response helper
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

// Validation error helper
const sendValidationError = (res, errors) => {
  return res.status(400).json({
    status: 'fail',
    message: 'Validation Error',
    errors
  });
};

module.exports = {
  AppError,
  asyncHandler,
  globalErrorHandler,
  notFound,
  sendError,
  sendSuccess,
  sendValidationError,
  logError
};