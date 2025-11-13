/**
 * Authorization Middleware
 * Checks user permissions for specific resources (projects, teams, etc.)
 */

const { Project, Team, Chat, Contribution } = require('../models');

// Check project permissions
const checkProjectPermission = (action) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.id || req.params.projectId || req.query.projectId;
      const userId = req.user.id;

      if (!projectId) {
        return res.status(400).json({ 
          error: 'Project ID is required.' 
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ 
          error: 'Project not found.' 
        });
      }

      // Check if user is project owner
      if (project.owner.toString() === userId) {
        return next(); // Owner has all permissions
      }

      // Check if user is a collaborator
      const collaborator = project.collaborators.find(
        collab => collab.user.toString() === userId
      );

      if (!collaborator) {
        return res.status(403).json({ 
          error: 'Access denied. You are not a member of this project.' 
        });
      }

      // Check specific permissions based on action
      const hasPermission = checkUserPermission(collaborator, action);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: `Access denied. You don't have permission to ${action} this project.` 
        });
      }

      // Add project and user role to request for further use
      req.project = project;
      req.userRole = collaborator.role;
      req.userPermissions = collaborator.permissions;

      next();
    } catch (error) {
      console.error('Project permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during permission check.' 
      });
    }
  };
};

// Check team permissions
const checkTeamPermission = (action) => {
  return async (req, res, next) => {
    try {
      const teamId = req.params.id || req.params.teamId || req.query.teamId;
      const userId = req.user.id;

      if (!teamId) {
        return res.status(400).json({ 
          error: 'Team ID is required.' 
        });
      }

      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ 
          error: 'Team not found.' 
        });
      }

      // Check if user is team lead
      if (team.teamLead.toString() === userId) {
        return next(); // Team lead has all permissions
      }

      // Check if user is a team member
      const member = team.members.find(
        member => member.user.toString() === userId
      );

      if (!member) {
        // For public teams, allow viewing
        if (action === 'view' && team.visibility === 'Public') {
          req.team = team;
          req.userRole = 'Viewer';
          return next();
        }
        
        return res.status(403).json({ 
          error: 'Access denied. You are not a member of this team.' 
        });
      }

      // Check specific permissions based on action and role
      const hasPermission = checkTeamRolePermission(member.role, action);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: `Access denied. You don't have permission to ${action} this team.` 
        });
      }

      // Add team and user role to request
      req.team = team;
      req.userRole = member.role;

      next();
    } catch (error) {
      console.error('Team permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during permission check.' 
      });
    }
  };
};

// Check chat permissions
const checkChatPermission = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { projectId, teamId } = req.query;
      const messageId = req.params.messageId;

      // If checking message-specific permissions
      if (messageId) {
        const message = await Chat.findById(messageId);
        if (!message) {
          return res.status(404).json({ error: 'Message not found.' });
        }

        // Check if user can access the chat context (project/team)
        if (message.project) {
          req.query.projectId = message.project.toString();
          return checkProjectPermission('view')(req, res, () => {
            // Additional message-specific checks
            if ((action === 'edit' || action === 'delete') && 
                message.sender.toString() !== userId && 
                req.userRole !== 'Admin') {
              return res.status(403).json({ 
                error: 'You can only edit/delete your own messages.' 
              });
            }
            next();
          });
        }

        if (message.team) {
          req.query.teamId = message.team.toString();
          return checkTeamPermission('view')(req, res, () => {
            if ((action === 'edit' || action === 'delete') && 
                message.sender.toString() !== userId && 
                req.userRole !== 'Admin' && req.userRole !== 'Lead') {
              return res.status(403).json({ 
                error: 'You can only edit/delete your own messages.' 
              });
            }
            next();
          });
        }
      }

      // Check project or team access for general chat actions
      if (projectId) {
        return checkProjectPermission('view')(req, res, next);
      }

      if (teamId) {
        return checkTeamPermission('view')(req, res, next);
      }

      res.status(400).json({ 
        error: 'Project ID or Team ID is required for chat access.' 
      });
    } catch (error) {
      console.error('Chat permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during permission check.' 
      });
    }
  };
};

// Check contribution permissions
const checkContributionPermission = (action) => {
  return async (req, res, next) => {
    try {
      const contributionId = req.params.id;
      const userId = req.user.id;

      if (!contributionId) {
        return res.status(400).json({ 
          error: 'Contribution ID is required.' 
        });
      }

      const contribution = await Contribution.findById(contributionId)
        .populate('project');

      if (!contribution) {
        return res.status(404).json({ 
          error: 'Contribution not found.' 
        });
      }

      // Check if user is the contribution owner
      if (contribution.user.toString() === userId) {
        req.contribution = contribution;
        return next();
      }

      // Check project permissions for non-owners
      req.params.projectId = contribution.project._id;
      return checkProjectPermission('view')(req, res, () => {
        // Additional contribution-specific checks
        if ((action === 'edit' || action === 'delete') && 
            req.userRole !== 'Admin' && req.userRole !== 'Maintainer') {
          return res.status(403).json({ 
            error: 'Only contribution owner or project admins can modify contributions.' 
          });
        }
        
        req.contribution = contribution;
        next();
      });
    } catch (error) {
      console.error('Contribution permission check error:', error);
      res.status(500).json({ 
        error: 'Internal server error during permission check.' 
      });
    }
  };
};

// Helper function to check user permissions for projects
function checkUserPermission(collaborator, action) {
  const { role, permissions } = collaborator;

  // Admin role has all permissions
  if (role === 'Admin') return true;

  // Role-based permissions
  const rolePermissions = {
    'Maintainer': ['view', 'edit', 'invite', 'manage'],
    'Contributor': ['view', 'edit'],
    'Viewer': ['view']
  };

  if (rolePermissions[role] && rolePermissions[role].includes(action)) {
    return true;
  }

  // Check specific permissions object
  const permissionMap = {
    'view': true, // Everyone can view if they're a collaborator
    'edit': permissions.canEdit,
    'delete': permissions.canDelete,
    'invite': permissions.canInvite,
    'manage': permissions.canManage
  };

  return permissionMap[action] || false;
}

// Helper function to check team role permissions
function checkTeamRolePermission(role, action) {
  const rolePermissions = {
    'Lead': ['view', 'edit', 'delete', 'manage', 'invite'],
    'Admin': ['view', 'edit', 'manage', 'invite'],
    'Member': ['view']
  };

  return rolePermissions[role] && rolePermissions[role].includes(action);
}

// Owner only middleware (for resources like projects, teams)
const ownerOnly = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;

      let resource;
      if (resourceType === 'project') {
        resource = await Project.findById(resourceId);
      } else if (resourceType === 'team') {
        resource = await Team.findById(resourceId);
      }

      if (!resource) {
        return res.status(404).json({ 
          error: `${resourceType} not found.` 
        });
      }

      const ownerField = resourceType === 'team' ? 'teamLead' : 'owner';
      if (resource[ownerField].toString() !== userId) {
        return res.status(403).json({ 
          error: `Access denied. Only the ${resourceType} owner can perform this action.` 
        });
      }

      req[resourceType] = resource;
      next();
    } catch (error) {
      console.error(`${resourceType} owner check error:`, error);
      res.status(500).json({ 
        error: 'Internal server error during ownership check.' 
      });
    }
  };
};

module.exports = {
  checkProjectPermission,
  checkTeamPermission,
  checkChatPermission,
  checkContributionPermission,
  ownerOnly
};