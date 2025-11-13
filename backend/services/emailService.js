/**
 * Email Service
 * Business logic for sending emails (notifications, verification, etc.)
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    // Configuration for different email providers
    if (process.env.EMAIL_PROVIDER === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else if (process.env.EMAIL_PROVIDER === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } else {
      // Default SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  // Send verification email
  async sendVerificationEmail(email, verificationToken) {
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: this.getVerificationEmailTemplate(verificationUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Password Reset Request',
        html: this.getPasswordResetEmailTemplate(resetUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Send project invitation email
  async sendProjectInvitationEmail(email, projectTitle, inviterName, invitationLink) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: `Invitation to join project: ${projectTitle}`,
        html: this.getProjectInvitationTemplate(projectTitle, inviterName, invitationLink)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Project invitation email sent:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending project invitation email:', error);
      throw error;
    }
  }

  // Send team invitation email
  async sendTeamInvitationEmail(email, teamName, inviterName, invitationLink) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: `Invitation to join team: ${teamName}`,
        html: this.getTeamInvitationTemplate(teamName, inviterName, invitationLink)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Team invitation email sent:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending team invitation email:', error);
      throw error;
    }
  }

  // Send notification email
  async sendNotificationEmail(email, subject, message, actionUrl = null) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: subject,
        html: this.getNotificationEmailTemplate(subject, message, actionUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Notification email sent:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending notification email:', error);
      throw error;
    }
  }

  // Send weekly digest email
  async sendWeeklyDigestEmail(email, userName, digestData) {
    try {
      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Your Weekly Project Digest',
        html: this.getWeeklyDigestTemplate(userName, digestData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Weekly digest email sent:', result.messageId);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending weekly digest email:', error);
      throw error;
    }
  }

  // Email Templates

  getVerificationEmailTemplate(verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.APP_NAME || 'Project Manager'}</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
            <a href="${verificationUrl}" class="button">Verify Email</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Manager'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Click the button below to create a new password.</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>This link will expire in 10 minutes for security reasons.</p>
          </div>
          <div class="footer">
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Manager'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getProjectInvitationTemplate(projectTitle, inviterName, invitationLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Invitation</h1>
          </div>
          <div class="content">
            <h2>You're Invited to Join a Project!</h2>
            <p><strong>${inviterName}</strong> has invited you to collaborate on the project: <strong>${projectTitle}</strong></p>
            <p>Join the project to start collaborating and contributing to this exciting opportunity!</p>
            <a href="${invitationLink}" class="button">Join Project</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${invitationLink}">${invitationLink}</a></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Manager'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getTeamInvitationTemplate(teamName, inviterName, invitationLink) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6f42c1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #6f42c1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Team Invitation</h1>
          </div>
          <div class="content">
            <h2>Join Our Team!</h2>
            <p><strong>${inviterName}</strong> has invited you to join the team: <strong>${teamName}</strong></p>
            <p>Become part of our collaborative team and work together on amazing projects!</p>
            <a href="${invitationLink}" class="button">Join Team</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${invitationLink}">${invitationLink}</a></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Manager'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getNotificationEmailTemplate(subject, message, actionUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #17a2b8; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${subject}</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Manager'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWeeklyDigestTemplate(userName, digestData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Digest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #fd7e14; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .stat-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #fd7e14; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Weekly Digest</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Here's what happened in your projects this week:</p>
            
            <div class="stat-box">
              <h3>📊 Your Activity</h3>
              <p>Contributions: ${digestData.contributions || 0}</p>
              <p>Messages: ${digestData.messages || 0}</p>
              <p>Projects: ${digestData.activeProjects || 0}</p>
            </div>
            
            <div class="stat-box">
              <h3>🎯 Project Updates</h3>
              <p>${digestData.projectUpdates || 'No major updates this week'}</p>
            </div>
            
            <div class="stat-box">
              <h3>🤝 Team Activity</h3>
              <p>${digestData.teamActivity || 'Your teams have been collaborating on various projects'}</p>
            </div>
          </div>
          <div class="footer">
            <p>Keep up the great work!</p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'Project Manager'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email configuration
  async testEmailConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return { success: true, message: 'Email service is configured correctly' };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();