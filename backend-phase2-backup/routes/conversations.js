const express = require("express");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all conversations for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    const filter = { participants: req.user.id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const conversations = await Conversation.find(filter)
      .populate("participants", "name email profile.avatar")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Conversation.countDocuments(filter);
    
    res.json({
      conversations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversations", details: err.message });
  }
});

// Get conversation by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("participants", "name email profile.avatar")
      .populate("messages.sender", "name profile.avatar");
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    // Check if user is participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch conversation", details: err.message });
  }
});

// Create new conversation
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, participants, initialMessage } = req.body;
    
    const conversation = new Conversation({
      title,
      participants: [...participants, req.user.id],
      messages: initialMessage ? [{
        sender: req.user.id,
        content: initialMessage,
        timestamp: new Date()
      }] : []
    });
    
    await conversation.save();
    await conversation.populate("participants", "name email profile.avatar");
    
    res.status(201).json({ message: "Conversation created successfully", conversation });
  } catch (err) {
    res.status(500).json({ error: "Failed to create conversation", details: err.message });
  }
});

// Add message to conversation
router.post("/:id/messages", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // AI Analysis simulation (replace with actual AI service)
    const aiAnalysis = {
      sentiment: {
        score: Math.random() * 2 - 1, // Random sentiment for demo
        label: Math.random() > 0.5 ? "positive" : Math.random() > 0.5 ? "neutral" : "negative"
      },
      clarity: {
        score: Math.floor(Math.random() * 40) + 60, // Random clarity score 60-100
        issues: []
      }
    };
    
    conversation.messages.push({
      sender: req.user.id,
      content,
      timestamp: new Date(),
      ...aiAnalysis
    });
    
    // Update conversation metrics
    conversation.metrics.totalMessages = conversation.messages.length;
    conversation.metrics.averageSentiment = conversation.messages.reduce((acc, msg) => acc + msg.sentiment.score, 0) / conversation.messages.length;
    conversation.metrics.clarityScore = conversation.messages.reduce((acc, msg) => acc + msg.clarity.score, 0) / conversation.messages.length;
    
    await conversation.save();
    
    res.json({ message: "Message added successfully", conversation });
  } catch (err) {
    res.status(500).json({ error: "Failed to add message", details: err.message });
  }
});

// Get conversation metrics
router.get("/:id/metrics", authMiddleware, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    // Check if user is participant
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    res.json(conversation.metrics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch metrics", details: err.message });
  }
});

// Update conversation status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    
    res.json({ message: "Status updated successfully", conversation });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

module.exports = router;
