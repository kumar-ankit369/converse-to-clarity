/**
 * Middlewares Index
 * Central export point for all middleware modules
 */

const auth = require('./auth');
const authorization = require('./authorization');
const validation = require('./validation');
const rateLimiter = require('./rateLimiter');
const upload = require('./upload');
const errorHandler = require('./errorHandler');

module.exports = {
  // Authentication & Authorization
  ...auth,
  ...authorization,
  
  // Validation
  ...validation,
  
  // Rate Limiting
  ...rateLimiter,
  
  // File Upload
  upload: upload.upload,
  profileUpload: upload.profileUpload,
  documentUpload: upload.documentUpload,
  chatUpload: upload.chatUpload,
  imageUpload: upload.imageUpload,
  handleUploadError: upload.handleUploadError,
  validateFileType: upload.validateFileType,
  processUploadedFiles: upload.processUploadedFiles,
  
  // Error Handling
  ...errorHandler
};