/**
 * General Utility Functions
 * Common helper functions used throughout the application
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class Utils {
  // Generate random string
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate UUID
  static generateUUID() {
    return crypto.randomUUID();
  }

  // Hash password
  static async hashPassword(password, saltRounds = 12) {
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Generate secure token
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
  }

  // Slugify string (for URLs)
  static slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  }

  // Capitalize first letter
  static capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  // Capitalize words
  static capitalizeWords(text) {
    if (!text) return '';
    return text.replace(/\w\S*/g, txt => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Truncate text
  static truncate(text, length = 100, suffix = '...') {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + suffix;
  }

  // Extract initials from name
  static getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    const score = (
      (password.length >= minLength ? 1 : 0) +
      (hasUpperCase ? 1 : 0) +
      (hasLowerCase ? 1 : 0) +
      (hasNumbers ? 1 : 0) +
      (hasNonalphas ? 1 : 0)
    );

    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';

    return {
      isValid: score >= 3,
      strength,
      score,
      requirements: {
        minLength: password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar: hasNonalphas
      }
    };
  }

  // Generate color from string (for avatars, etc.)
  static generateColorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  // Deep clone object
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Remove sensitive data from object
  static sanitizeUser(user) {
    const sanitized = { ...user };
    delete sanitized.password;
    delete sanitized.resetPasswordToken;
    delete sanitized.resetPasswordExpire;
    delete sanitized.verificationToken;
    return sanitized;
  }

  // Paginate array
  static paginate(array, page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: array.slice(startIndex, endIndex),
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      hasNextPage: endIndex < array.length,
      hasPreviousPage: startIndex > 0
    };
  }

  // Sort array of objects by property
  static sortBy(array, property, direction = 'asc') {
    return array.sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }

  // Group array by property
  static groupBy(array, property) {
    return array.reduce((groups, item) => {
      const group = item[property];
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  }

  // Remove duplicates from array
  static removeDuplicates(array, property = null) {
    if (property) {
      const seen = new Set();
      return array.filter(item => {
        const value = item[property];
        if (seen.has(value)) {
          return false;
        }
        seen.add(value);
        return true;
      });
    }
    return [...new Set(array)];
  }

  // Calculate percentage
  static calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  // Format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension
  static getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Check if value is empty
  static isEmpty(value) {
    return (
      value == null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Generate random number in range
  static randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Pick random element from array
  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Shuffle array
  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Convert object to query string
  static objectToQueryString(obj) {
    return Object.keys(obj)
      .filter(key => obj[key] !== null && obj[key] !== undefined)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
      .join('&');
  }

  // Parse query string to object
  static queryStringToObject(queryString) {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  // Mask sensitive data
  static maskEmail(email) {
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '*'.repeat(username.length - 2);
    return `${maskedUsername}@${domain}`;
  }

  static maskPhoneNumber(phone) {
    return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }

  // Escape HTML
  static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Strip HTML tags
  static stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Generate avatar URL (using a service like Gravatar or local generation)
  static generateAvatarUrl(email, size = 200) {
    const hash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
  }

  // Check if running in development mode
  static isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }

  // Check if running in production mode
  static isProduction() {
    return process.env.NODE_ENV === 'production';
  }

  // Get environment variable with default
  static getEnvVar(name, defaultValue = null) {
    return process.env[name] || defaultValue;
  }

  // Convert string to boolean
  static stringToBoolean(str) {
    return str === 'true' || str === '1' || str === 'yes';
  }

  // Retry function with exponential backoff
  static async retryWithBackoff(func, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await func();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Create success response
  static createSuccessResponse(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  // Create error response
  static createErrorResponse(message, code = null, details = null) {
    return {
      success: false,
      message,
      ...(code && { code }),
      ...(details && { details }),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = Utils;