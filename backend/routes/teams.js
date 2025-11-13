const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const { authenticateToken } = require("../middleware/auth");
const socketHelper = require('../socket');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all teams for the current user
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { createdBy: req.user.userId },
        { "members.userId": req.user.userId },
      ],
      isActive: true,
    })
      .populate("createdBy", "name email")
      .populate("members.userId", "name email")
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
});

// Get a single team by ID
router.get("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("members.userId", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is a member or creator
    const isMember = team.members.some(
      (m) => m.userId._id.toString() === req.user.userId
    );
    const isCreator = team.createdBy._id.toString() === req.user.userId;

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ message: "Failed to fetch team" });
  }
});

// Create a new team
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }

    const team = new Team({
      name,
      description,
      createdBy: req.user.userId,
      members: [
        {
          userId: req.user.userId,
          role: "owner",
        },
      ],
    });

    await team.save();
    await team.populate("createdBy", "name email");
    await team.populate("members.userId", "name email");

    // Emit team created event to members (owner) and team room
    try {
      const io = socketHelper.getIO();
      io.to(`team_${team._id.toString()}`).emit('team:created', team);
      io.to(`user_${req.user.userId}`).emit('team:invited', team);
    } catch (err) {}

    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: Object.values(error.errors).map(e => e.message).join(", ")
      });
    }
    
    res.status(500).json({ message: "Failed to create team" });
  }
});

// Update a team
router.put("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is owner or admin
    const member = team.members.find(
      (m) => m.userId.toString() === req.user.userId
    );

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, description, avatar } = req.body;

    if (name) team.name = name;
    if (description) team.description = description;
    if (avatar !== undefined) team.avatar = avatar;

    await team.save();
    await team.populate("createdBy", "name email");
    await team.populate("members.userId", "name email");

    try {
      const io = socketHelper.getIO();
      io.to(`team_${team._id.toString()}`).emit('team:updated', team);
    } catch (err) {}

    res.json(team);
  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ message: "Failed to update team" });
  }
});

// Delete a team
router.delete("/:id", async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if user is owner
    const member = team.members.find(
      (m) => m.userId.toString() === req.user.userId
    );

    if (!member || member.role !== "owner") {
      return res.status(403).json({ message: "Only the owner can delete the team" });
    }

    team.isActive = false;
    await team.save();

    try {
      const io = socketHelper.getIO();
      io.to(`team_${team._id.toString()}`).emit('team:deleted', { id: team._id.toString() });
    } catch (err) {}

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    res.status(500).json({ message: "Failed to delete team" });
  }
});

// Add a team member
router.post("/:teamId/members", async (req, res) => {
  try {
    const { userId, role = "member" } = req.body;
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if requester is owner or admin
    const requester = team.members.find(
      (m) => m.userId.toString() === req.user.userId
    );

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user is already a member
    if (team.members.some((m) => m.userId.toString() === userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    team.members.push({
      userId,
      role,
    });

    await team.save();
    await team.populate("members.userId", "name email");

    try {
      const io = socketHelper.getIO();
      io.to(`team_${team._id.toString()}`).emit('team:member:added', { teamId: team._id.toString(), member: team.members[team.members.length-1] });
      io.to(`user_${userId}`).emit('team:invited', { teamId: team._id.toString(), member: team.members[team.members.length-1] });
    } catch (err) {}

    res.json(team);
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).json({ message: "Failed to add team member" });
  }
});

// Update team member role
router.put("/:teamId/members/:memberId/role", async (req, res) => {
  try {
    const { role } = req.body;
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if requester is owner
    const requester = team.members.find(
      (m) => m.userId.toString() === req.user.userId
    );

    if (!requester || requester.role !== "owner") {
      return res.status(403).json({ message: "Only the owner can change roles" });
    }

    // Find and update the member
    const member = team.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.role = role;
    await team.save();
    await team.populate("members.userId", "name email");

    try {
      const io = socketHelper.getIO();
      io.to(`team_${team._id.toString()}`).emit('team:member:roleChanged', { teamId: team._id.toString(), memberId: member._id.toString(), role });
      io.to(`user_${member.userId.toString()}`).emit('team:roleChanged', { teamId: team._id.toString(), role });
    } catch (err) {}

    res.json(team);
  } catch (error) {
    console.error("Error updating member role:", error);
    res.status(500).json({ message: "Failed to update member role" });
  }
});

// Transfer ownership to another member
router.post("/:teamId/transfer-owner", async (req, res) => {
  try {
    const { newOwnerId } = req.body;
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if requester is current owner
    const requester = team.members.find((m) => m.userId.toString() === req.user.userId);
    if (!requester || requester.role !== 'owner') {
      return res.status(403).json({ message: 'Only the owner can transfer ownership' });
    }

    // Find the member that will become the new owner
    const newOwnerMember = team.members.find((m) => m.userId.toString() === newOwnerId);
    if (!newOwnerMember) {
      return res.status(400).json({ message: 'New owner must be an existing team member' });
    }

    // Perform transfer: demote old owner to admin, promote new owner
    requester.role = 'admin';
    newOwnerMember.role = 'owner';

    // Optionally update createdBy to reflect new owner
    team.createdBy = newOwnerId;

    await team.save();
    await team.populate('members.userId', 'name email');

    try {
      const io = socketHelper.getIO();
      io.to(`team_${team._id.toString()}`).emit('team:owner:transferred', { teamId: team._id.toString(), oldOwnerId: req.user.userId, newOwnerId });
      io.to(`user_${newOwnerId}`).emit('team:roleChanged', { teamId: team._id.toString(), role: 'owner' });
      io.to(`user_${req.user.userId}`).emit('team:roleChanged', { teamId: team._id.toString(), role: 'admin' });
    } catch (err) {}

    res.json(team);
  } catch (error) {
    console.error('Error transferring ownership:', error);
    res.status(500).json({ message: 'Failed to transfer ownership' });
  }
});

// Remove a team member
router.delete("/:teamId/members/:memberId", async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Check if requester is owner or admin
    const requester = team.members.find(
      (m) => m.userId.toString() === req.user.userId
    );

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Cannot remove the owner
    const memberToRemove = team.members.id(req.params.memberId);
    if (memberToRemove && memberToRemove.role === "owner") {
      return res.status(400).json({ message: "Cannot remove the owner" });
    }

    team.members.pull(req.params.memberId);
    await team.save();
    await team.populate("members.userId", "name email");

    try {
      const io = socketHelper.getIO();
      io.to(`team_${team._id.toString()}`).emit('team:member:removed', { teamId: team._id.toString(), memberId: req.params.memberId });
    } catch (err) {}

    res.json(team);
  } catch (error) {
    console.error("Error removing team member:", error);
    res.status(500).json({ message: "Failed to remove team member" });
  }
});

module.exports = router;
