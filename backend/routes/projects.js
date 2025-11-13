const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { authenticateToken } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// Get all projects for the current user
router.get("/", async (req, res) => {
  try {
    const { status, teamId } = req.query;
    const query = {
      $or: [
        { createdBy: req.user.userId },
        { "collaborators.userId": req.user.userId },
      ],
      isActive: true,
    };

    if (status) {
      query.status = status;
    }

    if (teamId) {
      query.teamId = teamId;
    }

    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .populate("collaborators.userId", "name email")
      .populate("teamId", "name")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Get a single project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("collaborators.userId", "name email")
      .populate("teamId", "name description");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user has access
    const isCollaborator = project.collaborators.some(
      (c) => c.userId._id.toString() === req.user.userId
    );
    const isCreator = project.createdBy._id.toString() === req.user.userId;

    if (!isCollaborator && !isCreator) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// Create a new project
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      status = "planning",
      priority = "medium",
      teamId,
      startDate,
      endDate,
      tags,
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }

    const project = new Project({
      name,
      description,
      status,
      priority,
      teamId: teamId || null,
      createdBy: req.user.userId,
      startDate,
      endDate,
      tags,
      collaborators: [
        {
          userId: req.user.userId,
          role: "owner",
        },
      ],
    });

    await project.save();
    await project.populate("createdBy", "name email");
    await project.populate("collaborators.userId", "name email");
    if (teamId) {
      await project.populate("teamId", "name");
    }

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({ 
        message: Object.values(error.errors).map(e => e.message).join(", ")
      });
    }
    
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Update a project
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is owner or admin
    const collaborator = project.collaborators.find(
      (c) => c.userId.toString() === req.user.userId
    );

    if (!collaborator || (collaborator.role !== "owner" && collaborator.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      progress,
      tags,
    } = req.body;

    if (name) project.name = name;
    if (description) project.description = description;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate !== undefined) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (progress !== undefined) project.progress = progress;
    if (tags) project.tags = tags;

    await project.save();
    await project.populate("createdBy", "name email");
    await project.populate("collaborators.userId", "name email");
    await project.populate("teamId", "name");

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user is owner
    const collaborator = project.collaborators.find(
      (c) => c.userId.toString() === req.user.userId
    );

    if (!collaborator || collaborator.role !== "owner") {
      return res.status(403).json({ message: "Only the owner can delete the project" });
    }

    project.isActive = false;
    await project.save();

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

// Add a collaborator
router.post("/:projectId/collaborators", async (req, res) => {
  try {
    const { userId, role = "member" } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if requester is owner or admin
    const requester = project.collaborators.find(
      (c) => c.userId.toString() === req.user.userId
    );

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user is already a collaborator
    if (project.collaborators.some((c) => c.userId.toString() === userId)) {
      return res.status(400).json({ message: "User is already a collaborator" });
    }

    project.collaborators.push({
      userId,
      role,
    });

    await project.save();
    await project.populate("collaborators.userId", "name email");

    res.json(project);
  } catch (error) {
    console.error("Error adding collaborator:", error);
    res.status(500).json({ message: "Failed to add collaborator" });
  }
});

// Remove a collaborator
router.delete("/:projectId/collaborators/:userId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if requester is owner or admin
    const requester = project.collaborators.find(
      (c) => c.userId.toString() === req.user.userId
    );

    if (!requester || (requester.role !== "owner" && requester.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Cannot remove the owner
    const collaboratorToRemove = project.collaborators.find(
      (c) => c.userId.toString() === req.params.userId
    );
    
    if (collaboratorToRemove && collaboratorToRemove.role === "owner") {
      return res.status(400).json({ message: "Cannot remove the owner" });
    }

    project.collaborators = project.collaborators.filter(
      (c) => c.userId.toString() !== req.params.userId
    );

    await project.save();
    await project.populate("collaborators.userId", "name email");

    res.json(project);
  } catch (error) {
    console.error("Error removing collaborator:", error);
    res.status(500).json({ message: "Failed to remove collaborator" });
  }
});

module.exports = router;
