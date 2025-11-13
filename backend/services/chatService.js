/**
 * Chat Service
 * Business logic for chat-related operations
 */

const Chat = require('../models/Chat');

class ChatService {
  // Get chat messages for a project or team
  async getChatMessages(filters = {}) {
    try {
      const { projectId, teamId, limit = 50, offset = 0 } = filters;
      
      const query = {};
      if (projectId) query.projectId = projectId;
      if (teamId) query.teamId = teamId;

      const messages = await Chat.find(query)
        .populate('sender', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return {
        success: true,
        data: messages,
        total: await Chat.countDocuments(query)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send a new message
  async sendMessage(messageData) {
    try {
      const { senderId, content, projectId, teamId, messageType = 'text' } = messageData;

      const newMessage = new Chat({
        sender: senderId,
        content,
        projectId,
        teamId,
        messageType,
        createdAt: new Date()
      });

      const savedMessage = await newMessage.save();
      const populatedMessage = await Chat.findById(savedMessage._id)
        .populate('sender', 'name email avatar');

      return {
        success: true,
        data: populatedMessage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update/edit a message
  async updateMessage(messageId, userId, updateData) {
    try {
      const { content } = updateData;

      const message = await Chat.findById(messageId);
      if (!message) {
        return {
          success: false,
          error: 'Message not found'
        };
      }

      // Check if user is the sender
      if (message.sender.toString() !== userId) {
        return {
          success: false,
          error: 'Unauthorized to update this message'
        };
      }

      message.content = content;
      message.updatedAt = new Date();
      message.isEdited = true;

      const updatedMessage = await message.save();
      const populatedMessage = await Chat.findById(updatedMessage._id)
        .populate('sender', 'name email avatar');

      return {
        success: true,
        data: populatedMessage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete a message
  async deleteMessage(messageId, userId) {
    try {
      const message = await Chat.findById(messageId);
      if (!message) {
        return {
          success: false,
          error: 'Message not found'
        };
      }

      // Check if user is the sender
      if (message.sender.toString() !== userId) {
        return {
          success: false,
          error: 'Unauthorized to delete this message'
        };
      }

      await Chat.findByIdAndDelete(messageId);

      return {
        success: true,
        message: 'Message deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mark message as read by user
  async markMessageAsRead(messageId, userId) {
    try {
      const message = await Chat.findById(messageId);
      if (!message) {
        return {
          success: false,
          error: 'Message not found'
        };
      }

      // Add user to readBy array if not already present
      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        await message.save();
      }

      return {
        success: true,
        message: 'Message marked as read'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get unread message count for user
  async getUnreadCount(userId, filters = {}) {
    try {
      const { projectId, teamId } = filters;
      
      const query = {
        sender: { $ne: userId }, // Exclude messages sent by the user
        readBy: { $nin: [userId] } // Messages not read by the user
      };

      if (projectId) query.projectId = projectId;
      if (teamId) query.teamId = teamId;

      const unreadCount = await Chat.countDocuments(query);

      return {
        success: true,
        data: { unreadCount }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get chat statistics
  async getChatStats(filters = {}) {
    try {
      const { projectId, teamId, startDate, endDate } = filters;
      
      const query = {};
      if (projectId) query.projectId = projectId;
      if (teamId) query.teamId = teamId;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const totalMessages = await Chat.countDocuments(query);
      const uniqueSenders = await Chat.distinct('sender', query);

      return {
        success: true,
        data: {
          totalMessages,
          uniqueSenders: uniqueSenders.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ChatService();