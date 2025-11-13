/**
 * User Service
 * Business logic for user operations
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Helpers } = require('../utils/helpers');

class UserService {
  /**
   * Get all users with pagination
   */
  static async getAllUsers(page = 1, limit = 10, search = '') {
    try {
      const skip = (page - 1) * limit;
      
      // Build search query
      const searchQuery = search ? {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      } : {};

      const users = await User.find(searchQuery)
        .select('-password -refreshTokens')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(searchQuery);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId)
        .select('-password -refreshTokens')
        .populate('teams', 'name description')
        .populate('projects', 'title description status');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updateData) {
    try {
      // Remove sensitive fields from update data
      const allowedFields = [
        'firstName', 'lastName', 'bio', 'avatar', 'location',
        'website', 'skills', 'preferences', 'socialLinks'
      ];
      
      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      // Add updated timestamp
      filteredData.updatedAt = new Date();

      const user = await User.findByIdAndUpdate(
        userId,
        filteredData,
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await User.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        updatedAt: new Date()
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      throw new Error(`Failed to change password: ${error.message}`);
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove user from teams and projects
      // This would typically involve updating related collections
      
      await User.findByIdAndDelete(userId);
      return { message: 'User account deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query, currentUserId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const searchQuery = {
        _id: { $ne: currentUserId }, // Exclude current user
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ]
      };

      const users = await User.find(searchQuery)
        .select('username firstName lastName avatar bio')
        .skip(skip)
        .limit(limit)
        .sort({ username: 1 });

      const total = await User.countDocuments(searchQuery);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // This would typically aggregate data from related collections
      const stats = {
        totalProjects: user.projects ? user.projects.length : 0,
        totalTeams: user.teams ? user.teams.length : 0,
        totalContributions: 0, // Would be calculated from contributions
        joinDate: user.createdAt,
        lastActive: user.lastLoginAt || user.updatedAt
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(userId, preferences) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          preferences,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).select('-password -refreshTokens');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`);
    }
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        lastLoginAt: new Date()
      });
    } catch (error) {
      console.error('Failed to update last login:', error.message);
      // Don't throw error for this operation
    }
  }
}

module.exports = UserService;