/**
 * Analytics Service
 * Business logic for generating analytics and insights
 */

const { User, Project, Team, Contribution, Chat } = require('../models');

class AnalyticsService {
  // Get user analytics
  async getUserAnalytics(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's projects
      const userProjects = await Project.find({
        $or: [
          { owner: userId },
          { 'collaborators.user': userId }
        ]
      });

      // Get user's contributions
      const userContributions = await Contribution.find({ user: userId });

      // Get user's team memberships
      const userTeams = await Team.find({ 'members.user': userId });

      // Calculate metrics
      const analytics = {
        projectStats: {
          totalProjects: userProjects.length,
          ownedProjects: userProjects.filter(p => p.owner.toString() === userId).length,
          collaboratedProjects: userProjects.filter(p => p.owner.toString() !== userId).length,
          completedProjects: userProjects.filter(p => p.status === 'Completed').length,
          activeProjects: userProjects.filter(p => p.status === 'In Progress').length
        },
        contributionStats: {
          totalContributions: userContributions.length,
          codeContributions: userContributions.filter(c => c.contributionType === 'Code').length,
          documentationContributions: userContributions.filter(c => c.contributionType === 'Documentation').length,
          avgContributionsPerMonth: this.calculateMonthlyAverage(userContributions),
          totalLinesChanged: userContributions.reduce((sum, c) => sum + c.totalLinesChanged, 0)
        },
        teamStats: {
          totalTeams: userTeams.length,
          leadershipRoles: userTeams.filter(t => 
            t.members.find(m => m.user.toString() === userId && m.role === 'Lead')
          ).length
        },
        skillProgress: await this.calculateSkillProgress(userId),
        activityTimeline: await this.getActivityTimeline(userId)
      };

      return {
        success: true,
        analytics
      };
    } catch (error) {
      throw error;
    }
  }

  // Get project analytics
  async getProjectAnalytics(projectId) {
    try {
      const project = await Project.findById(projectId)
        .populate('collaborators.user', 'firstName lastName')
        .populate('owner', 'firstName lastName');

      if (!project) {
        throw new Error('Project not found');
      }

      // Get project contributions
      const projectContributions = await Contribution.find({ project: projectId });

      // Get project chat messages
      const projectMessages = await Chat.find({ project: projectId });

      // Calculate project metrics
      const analytics = {
        projectInfo: {
          title: project.title,
          status: project.status,
          startDate: project.timeline.startDate,
          endDate: project.timeline.endDate,
          progress: project.progress
        },
        teamMetrics: {
          totalCollaborators: project.collaborators.length,
          activeCollaborators: await this.getActiveCollaborators(projectId),
          collaboratorRoles: this.getCollaboratorRoleDistribution(project.collaborators)
        },
        contributionMetrics: {
          totalContributions: projectContributions.length,
          contributionsByType: this.getContributionsByType(projectContributions),
          contributionTrend: await this.getContributionTrend(projectId),
          topContributors: await this.getTopContributors(projectId)
        },
        communicationMetrics: {
          totalMessages: projectMessages.length,
          messagesByWeek: this.getMessagesByWeek(projectMessages),
          mostActiveMembers: this.getMostActiveMembers(projectMessages)
        },
        timelineMetrics: {
          daysRemaining: project.remainingDays,
          milestoneProgress: this.getMilestoneProgress(project.timeline.milestones),
          estimatedCompletion: this.estimateCompletion(project, projectContributions)
        }
      };

      return {
        success: true,
        analytics
      };
    } catch (error) {
      throw error;
    }
  }

  // Get team analytics
  async getTeamAnalytics(teamId) {
    try {
      const team = await Team.findById(teamId)
        .populate('members.user', 'firstName lastName skills')
        .populate('projects');

      if (!team) {
        throw new Error('Team not found');
      }

      // Get team project contributions
      const teamProjectIds = team.projects.map(p => p._id);
      const teamContributions = await Contribution.find({ 
        project: { $in: teamProjectIds } 
      });

      const analytics = {
        teamInfo: {
          name: team.name,
          memberCount: team.memberCount,
          projectCount: team.projectCount
        },
        memberMetrics: {
          skillDistribution: this.getSkillDistribution(team.members),
          experienceDistribution: this.getExperienceDistribution(team.members),
          roleDistribution: this.getRoleDistribution(team.members)
        },
        projectMetrics: {
          activeProjects: team.projects.filter(p => p.status === 'In Progress').length,
          completedProjects: team.projects.filter(p => p.status === 'Completed').length,
          projectsByCategory: this.getProjectsByCategory(team.projects)
        },
        performanceMetrics: {
          totalContributions: teamContributions.length,
          averageContributionsPerMember: teamContributions.length / team.memberCount,
          teamVelocity: this.calculateTeamVelocity(teamContributions),
          collaborationScore: await this.calculateCollaborationScore(teamId)
        },
        trendAnalysis: {
          growthTrend: await this.getTeamGrowthTrend(teamId),
          activityTrend: await this.getTeamActivityTrend(teamId)
        }
      };

      return {
        success: true,
        analytics
      };
    } catch (error) {
      throw error;
    }
  }

  // Get platform-wide analytics (admin only)
  async getPlatformAnalytics() {
    try {
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalProjects = await Project.countDocuments({ isActive: true });
      const totalTeams = await Team.countDocuments({ isActive: true });
      const totalContributions = await Contribution.countDocuments();

      const analytics = {
        userMetrics: {
          totalUsers,
          newUsersThisMonth: await this.getNewUsersThisMonth(),
          activeUsersThisWeek: await this.getActiveUsersThisWeek(),
          userGrowthTrend: await this.getUserGrowthTrend()
        },
        projectMetrics: {
          totalProjects,
          activeProjects: await Project.countDocuments({ 
            status: 'In Progress', 
            isActive: true 
          }),
          completedProjects: await Project.countDocuments({ 
            status: 'Completed' 
          }),
          projectsByCategory: await this.getProjectsByCategoryStats()
        },
        teamMetrics: {
          totalTeams,
          averageTeamSize: await this.getAverageTeamSize(),
          teamActivityStats: await this.getTeamActivityStats()
        },
        contributionMetrics: {
          totalContributions,
          contributionsThisMonth: await this.getContributionsThisMonth(),
          topTechnologies: await this.getTopTechnologies(),
          contributionTrends: await this.getContributionTrends()
        },
        engagementMetrics: {
          dailyActiveUsers: await this.getDailyActiveUsers(),
          userRetentionRate: await this.getUserRetentionRate(),
          featureUsageStats: await this.getFeatureUsageStats()
        }
      };

      return {
        success: true,
        analytics
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper methods

  calculateMonthlyAverage(contributions) {
    if (contributions.length === 0) return 0;
    
    const months = new Set();
    contributions.forEach(contrib => {
      const month = contrib.createdAt.getMonth() + '-' + contrib.createdAt.getFullYear();
      months.add(month);
    });
    
    return contributions.length / months.size;
  }

  async calculateSkillProgress(userId) {
    // This would analyze user's contribution history to track skill development
    // Simplified implementation
    const contributions = await Contribution.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const skillFrequency = {};
    contributions.forEach(contrib => {
      contrib.tags.forEach(tag => {
        skillFrequency[tag] = (skillFrequency[tag] || 0) + 1;
      });
    });

    return Object.entries(skillFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));
  }

  async getActivityTimeline(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const contributions = await Contribution.find({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const timeline = {};
    contributions.forEach(contrib => {
      const date = contrib.createdAt.toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });

    return timeline;
  }

  async getActiveCollaborators(projectId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeContributors = await Contribution.distinct('user', {
      project: projectId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    return activeContributors.length;
  }

  getCollaboratorRoleDistribution(collaborators) {
    const distribution = {};
    collaborators.forEach(collab => {
      distribution[collab.role] = (distribution[collab.role] || 0) + 1;
    });
    return distribution;
  }

  getContributionsByType(contributions) {
    const byType = {};
    contributions.forEach(contrib => {
      byType[contrib.contributionType] = (byType[contrib.contributionType] || 0) + 1;
    });
    return byType;
  }

  async getContributionTrend(projectId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const contributions = await Contribution.find({
      project: projectId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const trend = {};
    contributions.forEach(contrib => {
      const week = this.getWeekNumber(contrib.createdAt);
      trend[week] = (trend[week] || 0) + 1;
    });

    return trend;
  }

  async getTopContributors(projectId) {
    const contributions = await Contribution.aggregate([
      { $match: { project: projectId } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    return contributions.map(c => ({
      user: c.user[0],
      contributionCount: c.count
    }));
  }

  getMessagesByWeek(messages) {
    const byWeek = {};
    messages.forEach(msg => {
      const week = this.getWeekNumber(msg.createdAt);
      byWeek[week] = (byWeek[week] || 0) + 1;
    });
    return byWeek;
  }

  getMostActiveMembers(messages) {
    const memberActivity = {};
    messages.forEach(msg => {
      const userId = msg.sender.toString();
      memberActivity[userId] = (memberActivity[userId] || 0) + 1;
    });

    return Object.entries(memberActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  }

  getMilestoneProgress(milestones) {
    if (!milestones || milestones.length === 0) return { completed: 0, total: 0 };
    
    const completed = milestones.filter(m => m.completed).length;
    return {
      completed,
      total: milestones.length,
      percentage: (completed / milestones.length) * 100
    };
  }

  estimateCompletion(project, contributions) {
    // Simplified estimation based on current progress and contribution rate
    const currentProgress = project.progress;
    const remainingProgress = 100 - currentProgress;
    
    if (remainingProgress === 0) return project.timeline.endDate;
    
    // Calculate average weekly progress based on contributions
    const weeklyContributions = contributions.length / 4; // Assume 4 weeks of data
    const estimatedWeeksToComplete = remainingProgress / (weeklyContributions * 2); // Rough estimation
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (estimatedWeeksToComplete * 7));
    
    return estimatedDate;
  }

  getWeekNumber(date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil(days / 7);
  }

  // Additional helper methods for platform analytics would be implemented here
  async getNewUsersThisMonth() { /* Implementation */ return 0; }
  async getActiveUsersThisWeek() { /* Implementation */ return 0; }
  async getUserGrowthTrend() { /* Implementation */ return []; }
  async getProjectsByCategoryStats() { /* Implementation */ return {}; }
  async getAverageTeamSize() { /* Implementation */ return 0; }
  async getTeamActivityStats() { /* Implementation */ return {}; }
  async getContributionsThisMonth() { /* Implementation */ return 0; }
  async getTopTechnologies() { /* Implementation */ return []; }
  async getContributionTrends() { /* Implementation */ return {}; }
  async getDailyActiveUsers() { /* Implementation */ return 0; }
  async getUserRetentionRate() { /* Implementation */ return 0; }
  async getFeatureUsageStats() { /* Implementation */ return {}; }

  getSkillDistribution(members) {
    const skills = {};
    members.forEach(member => {
      member.user.skills.forEach(skill => {
        skills[skill] = (skills[skill] || 0) + 1;
      });
    });
    return skills;
  }

  getExperienceDistribution(members) {
    const experience = {};
    members.forEach(member => {
      const level = member.user.experience;
      experience[level] = (experience[level] || 0) + 1;
    });
    return experience;
  }

  getRoleDistribution(members) {
    const roles = {};
    members.forEach(member => {
      roles[member.role] = (roles[member.role] || 0) + 1;
    });
    return roles;
  }

  getProjectsByCategory(projects) {
    const categories = {};
    projects.forEach(project => {
      categories[project.category] = (categories[project.category] || 0) + 1;
    });
    return categories;
  }

  calculateTeamVelocity(contributions) {
    // Calculate team's contribution velocity over time
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentContributions = contributions.filter(c => 
      c.createdAt >= thirtyDaysAgo
    );
    
    return recentContributions.length / 30; // Contributions per day
  }

  async calculateCollaborationScore(teamId) {
    // Calculate how well team members collaborate based on various metrics
    // This is a simplified implementation
    return Math.floor(Math.random() * 100); // Placeholder
  }

  async getTeamGrowthTrend(teamId) {
    // Implementation for team growth over time
    return {}; // Placeholder
  }

  async getTeamActivityTrend(teamId) {
    // Implementation for team activity trends
    return {}; // Placeholder
  }
}

module.exports = new AnalyticsService();