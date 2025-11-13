/**
 * File Upload Middleware
 * Handles file uploads with validation and storage
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/profiles',
    'uploads/projects', 
    'uploads/teams',
    'uploads/documents',
    'uploads/chat',
    'uploads/temp'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

// Initialize upload directories
ensureUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on request
    if (req.route.path.includes('/profile')) {
      uploadPath += 'profiles/';
    } else if (req.route.path.includes('/projects')) {
      uploadPath += 'projects/';
    } else if (req.route.path.includes('/teams')) {
      uploadPath += 'teams/';
    } else if (req.route.path.includes('/chat')) {
      uploadPath += 'chat/';
    } else if (req.route.path.includes('/documents')) {
      uploadPath += 'documents/';
    } else {
      uploadPath += 'temp/';
    }

    const fullPath = path.join(__dirname, '..', uploadPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const hash = crypto.createHash('md5').update(file.originalname + uniqueSuffix).digest('hex');
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    cb(null, `${name}-${hash}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ],
    archives: [
      'application/zip',
      'application/x-rar-compressed',
      'application/x-tar',
      'application/gzip'
    ],
    code: [
      'text/plain',
      'application/javascript',
      'text/html',
      'text/css',
      'application/json'
    ]
  };

  const allAllowedTypes = [
    ...allowedTypes.images,
    ...allowedTypes.documents,
    ...allowedTypes.archives,
    ...allowedTypes.code
  ];

  // Check if file type is allowed
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// File size limits (in bytes)
const fileSizeLimits = {
  profile: 5 * 1024 * 1024, // 5MB for profile pictures
  document: 50 * 1024 * 1024, // 50MB for documents
  chat: 25 * 1024 * 1024, // 25MB for chat attachments
  default: 10 * 1024 * 1024 // 10MB default
};

// Get file size limit based on request type
const getFileSizeLimit = (req) => {
  if (req.route.path.includes('/profile')) {
    return fileSizeLimits.profile;
  } else if (req.route.path.includes('/documents')) {
    return fileSizeLimits.document;
  } else if (req.route.path.includes('/chat')) {
    return fileSizeLimits.chat;
  }
  return fileSizeLimits.default;
};

// Create multer instance with dynamic limits
const createUpload = (options = {}) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: options.fileSize || fileSizeLimits.default,
      files: options.maxFiles || 10,
      fields: options.maxFields || 20
    },
    ...options
  });
};

// Default upload instance
const upload = createUpload();

// Specialized upload configurations
const profileUpload = createUpload({
  fileSize: fileSizeLimits.profile,
  maxFiles: 1
});

const documentUpload = createUpload({
  fileSize: fileSizeLimits.document,
  maxFiles: 5
});

const chatUpload = createUpload({
  fileSize: fileSizeLimits.chat,
  maxFiles: 1
});

// Image-only upload
const imageUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Please choose a smaller file.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Please select fewer files.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field. Please check your form.';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many form parts.';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long.';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long.';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields.';
        break;
      default:
        message = error.message || 'File upload error';
    }

    return res.status(400).json({
      error: 'Upload Error',
      message: message,
      code: error.code
    });
  }

  if (error.message) {
    return res.status(400).json({
      error: 'Upload Error',
      message: error.message
    });
  }

  next(error);
};

// File validation middleware
const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          filename: file.originalname
        });
      }
    }

    next();
  };
};

// File processing middleware (for images)
const processUploadedFiles = (req, res, next) => {
  if (req.file) {
    req.file.url = `/uploads/${path.relative(path.join(__dirname, '..', 'uploads'), req.file.path)}`;
  }

  if (req.files) {
    req.files.forEach(file => {
      file.url = `/uploads/${path.relative(path.join(__dirname, '..', 'uploads'), file.path)}`;
    });
  }

  next();
};

// Clean up temporary files
const cleanupTempFiles = (files) => {
  const filesToClean = Array.isArray(files) ? files : [files];
  
  filesToClean.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error('Error deleting temp file:', err);
        }
      });
    }
  });
};

// Delete file helper
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlink(fullPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve(); // File doesn't exist, consider it deleted
    }
  });
};

// Get file info
const getFileInfo = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const stats = fs.statSync(fullPath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    extension: path.extname(fullPath),
    name: path.basename(fullPath)
  };
};

module.exports = {
  upload,
  profileUpload,
  documentUpload,
  chatUpload,
  imageUpload,
  createUpload,
  handleUploadError,
  validateFileType,
  processUploadedFiles,
  cleanupTempFiles,
  deleteFile,
  getFileInfo,
  ensureUploadDirs
};