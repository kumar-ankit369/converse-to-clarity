/**
 * Authentication Service
 * Business logic for user authentication and authorization
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const emailService = require('./emailService');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  // Generate refresh token
  generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Register new user
  async register(userData) {
    try {
      const { email, password, firstName, lastName } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Create new user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password
      });

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);

      // Generate JWT token
      const token = this.generateToken(user._id);

      return {
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Find user and include password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if password is correct
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account has been deactivated');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user._id);

      return {
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: user.isVerified
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout user (in a real app, you might want to blacklist the token)
  async logout(userId) {
    try {
      // In a stateless JWT setup, logout is handled client-side
      // But you might want to update last activity or add to blacklist
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('No user found with this email');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // Send reset email
      await emailService.sendPasswordResetEmail(user.email, resetToken);

      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      throw error;
    }
  }

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      // Hash the token and find user
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Update password
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      // Generate new JWT token
      const jwtToken = this.generateToken(user._id);

      return {
        success: true,
        message: 'Password reset successful',
        token: jwtToken
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        throw new Error('Invalid verification token');
      }

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Refresh JWT token
  async refreshToken(refreshToken) {
    try {
      // In a real implementation, you'd store refresh tokens in database
      // and validate them here
      // For now, this is a placeholder
      return {
        success: true,
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();