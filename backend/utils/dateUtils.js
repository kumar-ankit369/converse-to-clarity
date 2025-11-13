/**
 * Date and Time Utilities
 * Helper functions for date/time manipulation and formatting
 */

const moment = require('moment');

class DateUtils {
  // Format date to readable string
  static formatDate(date, format = 'MMMM Do YYYY') {
    return moment(date).format(format);
  }

  // Format date and time
  static formatDateTime(date, format = 'MMMM Do YYYY, h:mm A') {
    return moment(date).format(format);
  }

  // Get relative time (e.g., "2 hours ago")
  static getRelativeTime(date) {
    return moment(date).fromNow();
  }

  // Get time until a future date
  static getTimeUntil(date) {
    return moment(date).fromNow();
  }

  // Check if date is today
  static isToday(date) {
    return moment(date).isSame(moment(), 'day');
  }

  // Check if date is this week
  static isThisWeek(date) {
    return moment(date).isSame(moment(), 'week');
  }

  // Check if date is this month
  static isThisMonth(date) {
    return moment(date).isSame(moment(), 'month');
  }

  // Get start of day
  static getStartOfDay(date = new Date()) {
    return moment(date).startOf('day').toDate();
  }

  // Get end of day
  static getEndOfDay(date = new Date()) {
    return moment(date).endOf('day').toDate();
  }

  // Get start of week
  static getStartOfWeek(date = new Date()) {
    return moment(date).startOf('week').toDate();
  }

  // Get end of week
  static getEndOfWeek(date = new Date()) {
    return moment(date).endOf('week').toDate();
  }

  // Get start of month
  static getStartOfMonth(date = new Date()) {
    return moment(date).startOf('month').toDate();
  }

  // Get end of month
  static getEndOfMonth(date = new Date()) {
    return moment(date).endOf('month').toDate();
  }

  // Add time to date
  static addTime(date, amount, unit = 'days') {
    return moment(date).add(amount, unit).toDate();
  }

  // Subtract time from date
  static subtractTime(date, amount, unit = 'days') {
    return moment(date).subtract(amount, unit).toDate();
  }

  // Get difference between two dates
  static getDifference(date1, date2, unit = 'days') {
    return moment(date1).diff(moment(date2), unit);
  }

  // Check if date is between two dates
  static isBetween(date, startDate, endDate) {
    return moment(date).isBetween(startDate, endDate);
  }

  // Get age from birthdate
  static getAge(birthdate) {
    return moment().diff(moment(birthdate), 'years');
  }

  // Get duration between two dates in human readable format
  static getDurationText(startDate, endDate) {
    const duration = moment.duration(moment(endDate).diff(moment(startDate)));
    
    if (duration.asDays() < 1) {
      return duration.humanize();
    } else if (duration.asDays() < 30) {
      return `${Math.floor(duration.asDays())} days`;
    } else if (duration.asMonths() < 12) {
      return `${Math.floor(duration.asMonths())} months`;
    } else {
      return `${Math.floor(duration.asYears())} years`;
    }
  }

  // Get business days between two dates
  static getBusinessDays(startDate, endDate) {
    const start = moment(startDate);
    const end = moment(endDate);
    let businessDays = 0;

    while (start.isSameOrBefore(end)) {
      if (start.weekday() < 5) { // Monday to Friday
        businessDays++;
      }
      start.add(1, 'day');
    }

    return businessDays;
  }

  // Check if date is weekend
  static isWeekend(date) {
    const dayOfWeek = moment(date).weekday();
    return dayOfWeek === 5 || dayOfWeek === 6; // Saturday or Sunday
  }

  // Get next business day
  static getNextBusinessDay(date = new Date()) {
    let nextDay = moment(date).add(1, 'day');
    
    while (nextDay.weekday() > 4) { // Skip weekends
      nextDay = nextDay.add(1, 'day');
    }
    
    return nextDay.toDate();
  }

  // Get previous business day
  static getPreviousBusinessDay(date = new Date()) {
    let prevDay = moment(date).subtract(1, 'day');
    
    while (prevDay.weekday() > 4) { // Skip weekends
      prevDay = prevDay.subtract(1, 'day');
    }
    
    return prevDay.toDate();
  }

  // Format date for database storage (ISO string)
  static toISOString(date) {
    return moment(date).toISOString();
  }

  // Parse various date formats
  static parseDate(dateString, format = null) {
    if (format) {
      return moment(dateString, format).toDate();
    }
    return moment(dateString).toDate();
  }

  // Validate date
  static isValidDate(date) {
    return moment(date).isValid();
  }

  // Get timezone offset
  static getTimezoneOffset(date = new Date()) {
    return moment(date).utcOffset();
  }

  // Convert to timezone
  static convertToTimezone(date, timezone) {
    return moment(date).tz(timezone).toDate();
  }

  // Get current timestamp
  static getCurrentTimestamp() {
    return moment().unix();
  }

  // Convert timestamp to date
  static timestampToDate(timestamp) {
    return moment.unix(timestamp).toDate();
  }

  // Get date range for common periods
  static getDateRange(period) {
    const now = moment();
    
    switch (period) {
      case 'today':
        return {
          start: now.startOf('day').toDate(),
          end: now.endOf('day').toDate()
        };
      case 'yesterday':
        return {
          start: now.subtract(1, 'day').startOf('day').toDate(),
          end: now.endOf('day').toDate()
        };
      case 'thisWeek':
        return {
          start: now.startOf('week').toDate(),
          end: now.endOf('week').toDate()
        };
      case 'lastWeek':
        return {
          start: now.subtract(1, 'week').startOf('week').toDate(),
          end: now.endOf('week').toDate()
        };
      case 'thisMonth':
        return {
          start: now.startOf('month').toDate(),
          end: now.endOf('month').toDate()
        };
      case 'lastMonth':
        return {
          start: now.subtract(1, 'month').startOf('month').toDate(),
          end: now.endOf('month').toDate()
        };
      case 'thisYear':
        return {
          start: now.startOf('year').toDate(),
          end: now.endOf('year').toDate()
        };
      case 'lastYear':
        return {
          start: now.subtract(1, 'year').startOf('year').toDate(),
          end: now.endOf('year').toDate()
        };
      case 'last30Days':
        return {
          start: now.subtract(30, 'days').startOf('day').toDate(),
          end: now.endOf('day').toDate()
        };
      case 'last90Days':
        return {
          start: now.subtract(90, 'days').startOf('day').toDate(),
          end: now.endOf('day').toDate()
        };
      default:
        return {
          start: now.startOf('day').toDate(),
          end: now.endOf('day').toDate()
        };
    }
  }

  // Calculate project deadline status
  static getDeadlineStatus(endDate) {
    const now = moment();
    const deadline = moment(endDate);
    const daysUntilDeadline = deadline.diff(now, 'days');

    if (daysUntilDeadline < 0) {
      return {
        status: 'overdue',
        daysOverdue: Math.abs(daysUntilDeadline),
        color: 'red',
        message: `Overdue by ${Math.abs(daysUntilDeadline)} days`
      };
    } else if (daysUntilDeadline === 0) {
      return {
        status: 'due_today',
        daysUntilDeadline: 0,
        color: 'orange',
        message: 'Due today'
      };
    } else if (daysUntilDeadline <= 3) {
      return {
        status: 'urgent',
        daysUntilDeadline,
        color: 'red',
        message: `Due in ${daysUntilDeadline} days`
      };
    } else if (daysUntilDeadline <= 7) {
      return {
        status: 'soon',
        daysUntilDeadline,
        color: 'yellow',
        message: `Due in ${daysUntilDeadline} days`
      };
    } else {
      return {
        status: 'on_track',
        daysUntilDeadline,
        color: 'green',
        message: `Due in ${daysUntilDeadline} days`
      };
    }
  }

  // Generate date-based filename
  static generateDateBasedFilename(originalName, extension = '') {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
    return `${cleanName}_${timestamp}${extension}`;
  }

  // Get working hours overlap
  static getWorkingHoursOverlap(timezone1, timezone2, startHour = 9, endHour = 17) {
    // This is a simplified version - in practice, you'd need a more sophisticated timezone library
    const tz1Start = moment().tz(timezone1).hour(startHour).minute(0);
    const tz1End = moment().tz(timezone1).hour(endHour).minute(0);
    const tz2Start = moment().tz(timezone2).hour(startHour).minute(0);
    const tz2End = moment().tz(timezone2).hour(endHour).minute(0);

    // Convert to UTC for comparison
    const utc1Start = tz1Start.utc();
    const utc1End = tz1End.utc();
    const utc2Start = tz2Start.utc();
    const utc2End = tz2End.utc();

    // Find overlap
    const overlapStart = moment.max(utc1Start, utc2Start);
    const overlapEnd = moment.min(utc1End, utc2End);

    if (overlapStart.isBefore(overlapEnd)) {
      return {
        hasOverlap: true,
        start: overlapStart.toDate(),
        end: overlapEnd.toDate(),
        duration: overlapEnd.diff(overlapStart, 'hours')
      };
    }

    return {
      hasOverlap: false,
      duration: 0
    };
  }
}

module.exports = DateUtils;