/**
 * Notification Utilities
 * Helper functions for managing notifications and real-time updates
 */

const { EventEmitter } = require('events');

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.notifications = new Map(); // Store notifications by user ID
    this.connections = new Map(); // Store WebSocket connections
  }

  // Notification types
  static TYPES = {
    PROJECT_INVITATION: 'project_invitation',
    TEAM_INVITATION: 'team_invitation',
    MESSAGE: 'message',
    CONTRIBUTION_REVIEW: 'contribution_review',
    PROJECT_UPDATE: 'project_update',
    DEADLINE_REMINDER: 'deadline_reminder',
    MILESTONE_COMPLETED: 'milestone_completed',
    USER_MENTION: 'user_mention',
    SYSTEM_ANNOUNCEMENT: 'system_announcement'
  };

  // Priority levels
  static PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  };

  // Create a new notification
  createNotification(userId, type, data, priority = NotificationService.PRIORITY.MEDIUM) {
    const notification = {
      id: this.generateNotificationId(),
      userId,
      type,
      title: this.generateTitle(type, data),
      message: this.generateMessage(type, data),
      data,
      priority,
      read: false,
      createdAt: new Date(),
      expiresAt: this.getExpirationDate(type)
    };

    // Store notification
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }
    this.notifications.get(userId).push(notification);

    // Emit event for real-time updates
    this.emit('notification', { userId, notification });

    // Send real-time notification if user is connected
    this.sendRealTimeNotification(userId, notification);

    return notification;
  }

  // Generate notification ID
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate notification title based on type
  generateTitle(type, data) {
    switch (type) {
      case NotificationService.TYPES.PROJECT_INVITATION:
        return `Project Invitation: ${data.projectTitle}`;
      case NotificationService.TYPES.TEAM_INVITATION:
        return `Team Invitation: ${data.teamName}`;
      case NotificationService.TYPES.MESSAGE:
        return `New Message from ${data.senderName}`;
      case NotificationService.TYPES.CONTRIBUTION_REVIEW:
        return `Contribution Review: ${data.contributionTitle}`;
      case NotificationService.TYPES.PROJECT_UPDATE:
        return `Project Update: ${data.projectTitle}`;
      case NotificationService.TYPES.DEADLINE_REMINDER:
        return `Deadline Reminder: ${data.projectTitle}`;
      case NotificationService.TYPES.MILESTONE_COMPLETED:
        return `Milestone Completed: ${data.milestoneTitle}`;
      case NotificationService.TYPES.USER_MENTION:
        return `You were mentioned by ${data.mentionedBy}`;
      case NotificationService.TYPES.SYSTEM_ANNOUNCEMENT:
        return data.title || 'System Announcement';
      default:
        return 'New Notification';
    }
  }

  // Generate notification message based on type
  generateMessage(type, data) {
    switch (type) {
      case NotificationService.TYPES.PROJECT_INVITATION:
        return `${data.inviterName} has invited you to join the project "${data.projectTitle}".`;
      case NotificationService.TYPES.TEAM_INVITATION:
        return `${data.inviterName} has invited you to join the team "${data.teamName}".`;
      case NotificationService.TYPES.MESSAGE:
        return `${data.senderName} sent you a message in ${data.context}.`;
      case NotificationService.TYPES.CONTRIBUTION_REVIEW:
        return `Your contribution "${data.contributionTitle}" has been ${data.status}.`;
      case NotificationService.TYPES.PROJECT_UPDATE:
        return `The project "${data.projectTitle}" has been updated: ${data.updateMessage}`;
      case NotificationService.TYPES.DEADLINE_REMINDER:
        return `The project "${data.projectTitle}" is due in ${data.daysUntilDeadline} days.`;
      case NotificationService.TYPES.MILESTONE_COMPLETED:
        return `The milestone "${data.milestoneTitle}" in project "${data.projectTitle}" has been completed.`;
      case NotificationService.TYPES.USER_MENTION:
        return `${data.mentionedBy} mentioned you in ${data.context}: "${data.message}"`;
      case NotificationService.TYPES.SYSTEM_ANNOUNCEMENT:
        return data.message || 'Please check the latest system updates.';
      default:
        return 'You have a new notification.';
    }
  }

  // Get expiration date for notification
  getExpirationDate(type) {
    const now = new Date();
    switch (type) {
      case NotificationService.TYPES.PROJECT_INVITATION:
      case NotificationService.TYPES.TEAM_INVITATION:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      case NotificationService.TYPES.DEADLINE_REMINDER:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case NotificationService.TYPES.SYSTEM_ANNOUNCEMENT:
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
      default:
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    }
  }

  // Get notifications for a user
  getUserNotifications(userId, options = {}) {
    const userNotifications = this.notifications.get(userId) || [];
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    let filteredNotifications = userNotifications.filter(notif => 
      !this.isExpired(notif) && (!unreadOnly || !notif.read)
    );

    // Sort by creation date (newest first)
    filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);

    return {
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      unreadCount: userNotifications.filter(notif => !notif.read && !this.isExpired(notif)).length
    };
  }

  // Mark notification as read
  markAsRead(userId, notificationId) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(notif => notif.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date();
        this.emit('notificationRead', { userId, notificationId });
        return true;
      }
    }
    return false;
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const unreadNotifications = userNotifications.filter(notif => !notif.read);
      unreadNotifications.forEach(notif => {
        notif.read = true;
        notif.readAt = new Date();
      });
      this.emit('allNotificationsRead', { userId, count: unreadNotifications.length });
      return unreadNotifications.length;
    }
    return 0;
  }

  // Delete notification
  deleteNotification(userId, notificationId) {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const index = userNotifications.findIndex(notif => notif.id === notificationId);
      if (index !== -1) {
        userNotifications.splice(index, 1);
        this.emit('notificationDeleted', { userId, notificationId });
        return true;
      }
    }
    return false;
  }

  // Clear expired notifications
  clearExpiredNotifications() {
    for (const [userId, notifications] of this.notifications.entries()) {
      const validNotifications = notifications.filter(notif => !this.isExpired(notif));
      this.notifications.set(userId, validNotifications);
    }
  }

  // Check if notification is expired
  isExpired(notification) {
    return new Date() > new Date(notification.expiresAt);
  }

  // Send real-time notification via WebSocket
  sendRealTimeNotification(userId, notification) {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === 1) { // WebSocket.OPEN
      connection.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  }

  // Register WebSocket connection
  registerConnection(userId, connection) {
    this.connections.set(userId, connection);
    
    // Send initial unread count
    const { unreadCount } = this.getUserNotifications(userId, { unreadOnly: true });
    connection.send(JSON.stringify({
      type: 'unread_count',
      data: { count: unreadCount }
    }));

    // Handle connection close
    connection.on('close', () => {
      this.connections.delete(userId);
    });
  }

  // Broadcast notification to multiple users
  broadcastNotification(userIds, type, data, priority = NotificationService.PRIORITY.MEDIUM) {
    const notifications = userIds.map(userId => 
      this.createNotification(userId, type, data, priority)
    );
    return notifications;
  }

  // Create batch notifications for project/team updates
  notifyProjectMembers(projectId, memberIds, type, data) {
    return this.broadcastNotification(memberIds, type, {
      ...data,
      projectId,
      context: 'project'
    });
  }

  notifyTeamMembers(teamId, memberIds, type, data) {
    return this.broadcastNotification(memberIds, type, {
      ...data,
      teamId,
      context: 'team'
    });
  }

  // Schedule deadline reminders
  scheduleDeadlineReminders(projects) {
    projects.forEach(project => {
      const daysUntilDeadline = Math.ceil(
        (new Date(project.timeline.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
        const memberIds = project.collaborators.map(collab => collab.user.toString());
        this.notifyProjectMembers(
          project._id,
          memberIds,
          NotificationService.TYPES.DEADLINE_REMINDER,
          {
            projectTitle: project.title,
            daysUntilDeadline,
            deadline: project.timeline.endDate
          },
          daysUntilDeadline <= 3 ? NotificationService.PRIORITY.HIGH : NotificationService.PRIORITY.MEDIUM
        );
      }
    });
  }

  // Get notification preferences for user
  getNotificationPreferences(userId) {
    // This would typically come from a database
    return {
      email: true,
      push: true,
      inApp: true,
      types: {
        [NotificationService.TYPES.PROJECT_INVITATION]: true,
        [NotificationService.TYPES.TEAM_INVITATION]: true,
        [NotificationService.TYPES.MESSAGE]: true,
        [NotificationService.TYPES.CONTRIBUTION_REVIEW]: true,
        [NotificationService.TYPES.PROJECT_UPDATE]: true,
        [NotificationService.TYPES.DEADLINE_REMINDER]: true,
        [NotificationService.TYPES.MILESTONE_COMPLETED]: true,
        [NotificationService.TYPES.USER_MENTION]: true,
        [NotificationService.TYPES.SYSTEM_ANNOUNCEMENT]: true
      }
    };
  }

  // Update notification preferences
  updateNotificationPreferences(userId, preferences) {
    // This would typically update a database
    this.emit('preferencesUpdated', { userId, preferences });
    return preferences;
  }

  // Get notification statistics
  getNotificationStats(userId) {
    const userNotifications = this.notifications.get(userId) || [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: userNotifications.length,
      unread: userNotifications.filter(notif => !notif.read && !this.isExpired(notif)).length,
      today: userNotifications.filter(notif => new Date(notif.createdAt) > oneDayAgo).length,
      thisWeek: userNotifications.filter(notif => new Date(notif.createdAt) > oneWeekAgo).length,
      byType: userNotifications.reduce((acc, notif) => {
        acc[notif.type] = (acc[notif.type] || 0) + 1;
        return acc;
      }, {}),
      byPriority: userNotifications.reduce((acc, notif) => {
        acc[notif.priority] = (acc[notif.priority] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Start cleanup interval for expired notifications
setInterval(() => {
  notificationService.clearExpiredNotifications();
}, 60 * 60 * 1000); // Every hour

module.exports = notificationService;