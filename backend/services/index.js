/**
 * Services Index
 * Central export point for all service modules
 */

const authService = require('./authService');
const recommendationService = require('./recommendationService');
const analyticsService = require('./analyticsService');
const emailService = require('./emailService');

module.exports = {
  authService,
  recommendationService,
  analyticsService,
  emailService
};