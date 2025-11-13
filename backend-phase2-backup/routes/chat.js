const express = require("express");
const router = express.Router();
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const { authenticateToken } = require("../middleware/auth");
const socketHelper = require('../socket');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all channels for the current user
router.get("/channels", async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [
        { createdBy: req.user.userId },
        { "members.userId": req.user.userId },
        { type: "public" },
      ],
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("members.userId", "name email")
      .populate("teamId", "name")
      .populate("projectId", "name")
      .sort({ lastMessageAt: -1 });

    res.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ message: "Failed to fetch channels" });
  }
});

// Get a single channel by ID
router.get("/channels/:id", async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email")
      .populate("teamId", "name")
      .populate("projectId", "name");

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user has access
    const isMember = channel.members.some(
      (m) => m.userId._id.toString() === req.user.userId
    );
    const isCreator = channel.createdBy._id.toString() === req.user.userId;
    const isPublic = channel.type === "public";

    if (!isMember && !isCreator && !isPublic) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(channel);
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).json({ message: "Failed to fetch channel" });
  }
});

// Create a new channel
router.post("/channels", async (req, res) => {
  try {
    const { name, description, type = "public", teamId, projectId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    const channel = new Channel({
      name,
      description,
      type,
      teamId: teamId || null,
      projectId: projectId || null,
      createdBy: req.user.userId,
      members: [
        {
          userId: req.user.userId,
          role: "admin",
        },
      ],
    });

    await channel.save();
    await channel.populate("createdBy", "name email");
    await channel.populate("members.userId", "name email");
    if (teamId) await channel.populate("teamId", "name");
    if (projectId) await channel.populate("projectId", "name");

    res.status(201).json(channel);
  } catch (error) {
    console.error("Error creating channel:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: Object.values(error.errors).map(e => e.message).join(", ")
      });
    }
    
    res.status(500).json({ message: "Failed to create channel" });
  }
});

// Get messages for a channel
router.get("/channels/:channelId/messages", async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user has access
    const isMember = channel.members.some(
      (m) => m.userId.toString() === req.user.userId
    );
    const isCreator = channel.createdBy.toString() === req.user.userId;
    const isPublic = channel.type === "public";

    if (!isMember && !isCreator && !isPublic) {
      return res.status(403).json({ message: "Access denied" });
    }

    const query = {
      channelId: req.params.channelId,
      isDeleted: false,
      parentId: null, // Only get top-level messages
    };

    if (before) {
      query._id = { $lt: before };
    }

    const messages = await Message.find(query)
      .populate("userId", "name email")
      .populate("reactions.userId", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/channels/:channelId/messages", async (req, res) => {
  try {
    const { content, parentId, attachments } = req.body;
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user has access
    const isMember = channel.members.some(
      (m) => m.userId.toString() === req.user.userId
    );
    const isCreator = channel.createdBy.toString() === req.user.userId;
    const isPublic = channel.type === "public";

    if (!isMember && !isCreator && !isPublic) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = new Message({
      channelId: req.params.channelId,
      content,
      userId: req.user.userId,
      parentId: parentId || null,
      attachments: attachments || [],
    });

    await message.save();
    await message.populate("userId", "name email");

    // Update channel's lastMessageAt
    channel.lastMessageAt = new Date();
    await channel.save();

    // Emit real-time event to channel room and team/project rooms
    try {
      const io = socketHelper.getIO();
      io.to(`channel_${req.params.channelId}`).emit('message:created', message);
      if (channel.teamId) io.to(`team_${channel.teamId.toString()}`).emit('channel:message', message);
      if (channel.projectId) io.to(`project_${channel.projectId.toString()}`).emit('channel:message', message);
      // Notify individual members directly as well
      channel.members.forEach(m => {
        io.to(`user_${m.userId.toString()}`).emit('message:notification', { channelId: req.params.channelId, message });
      });
    } catch (err) {
      // Socket not initialized or emit failed - ignore
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: Object.values(error.errors).map(e => e.message).join(", ")
      });
    }
    
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Update a message
router.put("/channels/:channelId/messages/:messageId", async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
    await message.populate("userId", "name email");

    // Emit update
    try {
      const io = socketHelper.getIO();
      io.to(`channel_${message.channelId.toString()}`).emit('message:updated', message);
    } catch (err) {}

    res.json(message);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ message: "Failed to update message" });
  }
});

// Delete a message
router.delete("/channels/:channelId/messages/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    message.isDeleted = true;
    message.content = "This message has been deleted";
    await message.save();

    try {
      const io = socketHelper.getIO();
      io.to(`channel_${message.channelId.toString()}`).emit('message:deleted', { id: message._id.toString() });
    } catch (err) {}

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

// Add a reaction to a message
router.post("/channels/:channelId/messages/:messageId/reactions", async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r) => r.userId.toString() === req.user.userId && r.emoji === emoji
    );

    if (existingReaction) {
      return res.status(400).json({ message: "Already reacted with this emoji" });
    }

    message.reactions.push({
      emoji,
      userId: req.user.userId,
    });

    await message.save();
    await message.populate("reactions.userId", "name");

    try {
      const io = socketHelper.getIO();
      io.to(`channel_${message.channelId.toString()}`).emit('reaction:added', { messageId: message._id.toString(), reaction: message.reactions[message.reactions.length-1] });
    } catch (err) {}

    res.json(message);
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ message: "Failed to add reaction" });
  }
});

// Remove a reaction from a message
router.delete("/channels/:channelId/messages/:messageId/reactions/:emoji", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.reactions = message.reactions.filter(
      (r) => !(r.userId.toString() === req.user.userId && r.emoji === req.params.emoji)
    );

    await message.save();
    await message.populate("reactions.userId", "name");

    try {
      const io = socketHelper.getIO();
      io.to(`channel_${message.channelId.toString()}`).emit('reaction:removed', { messageId: message._id.toString(), emoji: req.params.emoji });
    } catch (err) {}

    res.json(message);
  } catch (error) {
    console.error("Error removing reaction:", error);
    res.status(500).json({ message: "Failed to remove reaction" });
  }
});

// Get thread messages (replies to a message)
router.get("/channels/:channelId/messages/:parentId/thread", async (req, res) => {
  try {
    const messages = await Message.find({
      parentId: req.params.parentId,
      isDeleted: false,
    })
      .populate("userId", "name email")
      .populate("reactions.userId", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    res.status(500).json({ message: "Failed to fetch thread messages" });
  }
});

// Upload file (placeholder - would need multer or similar)
router.post("/channels/:channelId/upload", async (req, res) => {
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  // ensure upload folder exists
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
      cb(null, unique);
    }
  });

  const upload = multer({ storage }).single('file');

  upload(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ message: 'File upload failed' });
    }

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const file = req.file;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    // Return file metadata only; the client will create a message that references the attachment
    res.status(201).json({ file: { url: fileUrl, name: file.originalname, mimeType: file.mimetype, size: file.size } });
  });
});

module.exports = router;
