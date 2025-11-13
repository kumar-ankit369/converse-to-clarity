const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user.fullProfile);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile", details: err.message });
  }
});

// Update user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, profile } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (name) user.name = name;
    if (profile) {
      user.profile = { ...user.profile, ...profile };
    }
    
    await user.save();
    
    res.json({ 
      message: "Profile updated successfully", 
      user: user.fullProfile 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
});

// Update user preferences
router.patch("/preferences", authMiddleware, async (req, res) => {
  try {
    const preferences = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        "profile.preferences": preferences 
      },
      { new: true }
    ).select("-password");
    
    res.json({ 
      message: "Preferences updated successfully", 
      preferences: user.profile.preferences 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update preferences", details: err.message });
  }
});

// Get user statistics
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("stats");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user.stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", details: err.message });
  }
});

// Update last active timestamp
router.patch("/activity", authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      "stats.lastActive": new Date()
    });
    
    res.json({ message: "Activity updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update activity", details: err.message });
  }
});

// Get team members (users in same conversations)
router.get("/team", authMiddleware, async (req, res) => {
  try {
    const Conversation = require("../models/Conversation");
    
    const userConversations = await Conversation.find({ 
      participants: req.user.id 
    }).populate("participants", "name email profile.avatar profile.department stats");
    
    const teamMembers = new Map();
    
    userConversations.forEach(conv => {
      conv.participants.forEach(participant => {
        if (participant._id.toString() !== req.user.id) {
          teamMembers.set(participant._id.toString(), {
            id: participant._id,
            name: participant.name,
            email: participant.email,
            avatar: participant.profile?.avatar,
            department: participant.profile?.department,
            stats: participant.stats
          });
        }
      });
    });
    
    res.json(Array.from(teamMembers.values()));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch team members", details: err.message });
  }
});

// Search users by name or email (for invites)
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.json([]);

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ],
    })
      .select('name email profile.avatar')
      .limit(20);

    const result = users.map(u => ({ id: u._id, name: u.name, email: u.email, avatar: u.profile?.avatar }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search users', details: err.message });
  }
});

module.exports = router;
