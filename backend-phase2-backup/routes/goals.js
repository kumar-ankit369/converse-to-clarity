const express = require("express");
const Goal = require("../models/Goal");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Get all goals for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = { 
      $or: [
        { owner: req.user.id },
        { team: req.user.id }
      ]
    };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const goals = await Goal.find(filter)
      .populate("owner", "name email")
      .populate("team", "name email")
      .sort({ deadline: 1 });
    
    // Calculate progress for each goal
    goals.forEach(goal => {
      goal.progress = goal.calculateProgress();
    });
    
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch goals", details: err.message });
  }
});

// Get goal by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate("owner", "name email")
      .populate("team", "name email");
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    // Check if user has access
    const hasAccess = goal.owner._id.toString() === req.user.id || 
                     goal.team.some(member => member._id.toString() === req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    goal.progress = goal.calculateProgress();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch goal", details: err.message });
  }
});

// Create new goal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      owner: req.user.id
    };
    
    const goal = new Goal(goalData);
    await goal.save();
    await goal.populate("owner", "name email");
    
    res.status(201).json({ message: "Goal created successfully", goal });
  } catch (err) {
    res.status(500).json({ error: "Failed to create goal", details: err.message });
  }
});

// Update goal
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    // Check if user is owner
    if (goal.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only goal owner can update" });
    }
    
    Object.assign(goal, req.body);
    goal.progress = goal.calculateProgress();
    
    await goal.save();
    await goal.populate("owner", "name email");
    await goal.populate("team", "name email");
    
    res.json({ message: "Goal updated successfully", goal });
  } catch (err) {
    res.status(500).json({ error: "Failed to update goal", details: err.message });
  }
});

// Update goal progress
router.patch("/:id/progress", authMiddleware, async (req, res) => {
  try {
    const { current } = req.body;
    
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { 
        "targetMetric.current": current,
        progress: Math.min(100, (current / goal.targetMetric.target) * 100)
      },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    res.json({ message: "Progress updated successfully", goal });
  } catch (err) {
    res.status(500).json({ error: "Failed to update progress", details: err.message });
  }
});

// Add milestone to goal
router.post("/:id/milestones", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    // Check if user is owner or team member
    const hasAccess = goal.owner.toString() === req.user.id || 
                     goal.team.includes(req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    goal.milestones.push(req.body);
    await goal.save();
    
    res.json({ message: "Milestone added successfully", goal });
  } catch (err) {
    res.status(500).json({ error: "Failed to add milestone", details: err.message });
  }
});

// Complete milestone
router.patch("/:id/milestones/:milestoneId/complete", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: "Milestone not found" });
    }
    
    milestone.completed = true;
    milestone.completedAt = new Date();
    
    await goal.save();
    
    res.json({ message: "Milestone completed successfully", goal });
  } catch (err) {
    res.status(500).json({ error: "Failed to complete milestone", details: err.message });
  }
});

// Delete goal
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    // Check if user is owner
    if (goal.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only goal owner can delete" });
    }
    
    await Goal.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete goal", details: err.message });
  }
});

module.exports = router;
