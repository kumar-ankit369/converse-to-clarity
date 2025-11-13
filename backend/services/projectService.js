/**
 * Project Service
 * Business logic for project operations
 */

const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');
const { Helpers } = require('../utils/helpers');

class ProjectService {
  /**
   * Get all projects with pagination and filtering
   */
  static async getAllProjects(userId, filters = {}, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      // Build query based on user permissions and filters
      let query = {
        $or: [
          { owner: userId },
          { members: userId },
          { visibility: 'public' }
        ]
      };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.search) {
        query.$and = [
          query,
          {
            $or: [
              { title: { $regex: filters.search, $options: 'i' } },
              { description: { $regex: filters.search, $options: 'i' } },
              { tags: { $in: [new RegExp(filters.search, 'i')] } }
            ]
          }
        ];
      }

      if (filters.teamId) {
        query.team = filters.teamId;
      }

      const projects = await Project.find(query)
        .populate('owner', 'username firstName lastName avatar')
        .populate('members', 'username firstName lastName avatar')
        .populate('team', 'name description')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Project.countDocuments(query);

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  /**
   * Get project by ID
   */
  static async getProjectById(projectId, userId) {
    try {
      const project = await Project.findById(projectId)
        .populate('owner', 'username firstName lastName avatar')
        .populate('members', 'username firstName lastName avatar')
        .populate('team', 'name description members')
        .populate('contributions', 'type description createdAt author');

      if (!project) {
        throw new Error('Project not found');
      }

      // Check if user has access to project
      const hasAccess = project.visibility === 'public' ||
        project.owner._id.toString() === userId ||
        project.members.some(member => member._id.toString() === userId) ||
        (project.team && project.team.members.includes(userId));

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      return project;
    } catch (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  /**
   * Create new project
   */
  static async createProject(projectData, ownerId) {
    try {
      const project = new Project({
        ...projectData,
        owner: ownerId,
        members: [ownerId] // Owner is automatically a member
      });

      await project.save();
      
      // Populate the created project
      const populatedProject = await Project.findById(project._id)
        .populate('owner', 'username firstName lastName avatar')
        .populate('members', 'username firstName lastName avatar')
        .populate('team', 'name description');

      return populatedProject;
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  /**
   * Update project
   */
  static async updateProject(projectId, updateData, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Check permissions
      if (project.owner.toString() !== userId) {
        throw new Error('Only project owner can update the project');
      }

      // Update project
      const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate('owner', 'username firstName lastName avatar')
        .populate('members', 'username firstName lastName avatar')
        .populate('team', 'name description');

      return updatedProject;
    } catch (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  /**
   * Delete project
   */
  static async deleteProject(projectId, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Check permissions
      if (project.owner.toString() !== userId) {
        throw new Error('Only project owner can delete the project');
      }

      await Project.findByIdAndDelete(projectId);
      return { message: 'Project deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  /**
   * Add member to project
   */
  static async addMember(projectId, memberEmail, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Check permissions
      if (project.owner.toString() !== userId) {
        throw new Error('Only project owner can add members');
      }

      // Find user by email
      const user = await User.findOne({ email: memberEmail });
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is already a member
      if (project.members.includes(user._id)) {
        throw new Error('User is already a member');
      }

      // Add member
      project.members.push(user._id);
      await project.save();

      const updatedProject = await Project.findById(projectId)
        .populate('members', 'username firstName lastName avatar');

      return updatedProject;
    } catch (error) {
      throw new Error(`Failed to add member: ${error.message}`);
    }
  }

  /**
   * Remove member from project
   */
  static async removeMember(projectId, memberId, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Check permissions
      if (project.owner.toString() !== userId) {
        throw new Error('Only project owner can remove members');
      }

      // Cannot remove owner
      if (project.owner.toString() === memberId) {
        throw new Error('Cannot remove project owner');
      }

      // Remove member
      project.members = project.members.filter(
        member => member.toString() !== memberId
      );
      await project.save();

      const updatedProject = await Project.findById(projectId)
        .populate('members', 'username firstName lastName avatar');

      return updatedProject;
    } catch (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  /**
   * Get project statistics
   */
  static async getProjectStats(projectId, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Check access
      const hasAccess = project.visibility === 'public' ||
        project.owner.toString() === userId ||
        project.members.includes(userId);

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      const stats = {
        totalMembers: project.members.length,
        totalContributions: project.contributions ? project.contributions.length : 0,
        createdDate: project.createdAt,
        lastUpdate: project.updatedAt,
        status: project.status
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get project stats: ${error.message}`);
    }
  }

  /**
   * Get user's projects
   */
  static async getUserProjects(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const query = {
        $or: [
          { owner: userId },
          { members: userId }
        ]
      };

      const projects = await Project.find(query)
        .populate('owner', 'username firstName lastName avatar')
        .populate('team', 'name')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Project.countDocuments(query);

      return {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
    }
  }

  /**
   * Update project status
   */
  static async updateProjectStatus(projectId, status, userId) {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Check permissions
      if (project.owner.toString() !== userId) {
        throw new Error('Only project owner can update status');
      }

      project.status = status;
      project.updatedAt = new Date();
      await project.save();

      return project;
    } catch (error) {
      throw new Error(`Failed to update project status: ${error.message}`);
    }
  }
}

module.exports = ProjectService;