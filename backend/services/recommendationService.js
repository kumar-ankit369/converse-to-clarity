/**
 * Recommendation Service
 * Business logic for generating user and project recommendations
 */

const { User, Project, Team, Contribution } = require('../models');

class RecommendationService {
  // Get team member recommendations for a project
  async getTeamRecommendations(projectId, requesterUserId) {
    try {
      const project = await Project.findById(projectId)
        .populate('collaborators.user', 'firstName lastName skills experience')
        .populate('owner', 'firstName lastName skills experience');

      if (!project) {
        throw new Error('Project not found');
      }

      // Get project requirements (technologies, skills needed)
      const requiredSkills = project.technologies || [];
      const projectCategory = project.category;

      // Find users with matching skills
      const potentialMembers = await User.find({
        _id: { $nin: project.collaborators.map(c => c.user._id) }, // Exclude current collaborators
        isActive: true,
        skills: { $in: requiredSkills }
      }).select('firstName lastName skills experience bio');

      // Score users based on skill match and experience
      const scoredRecommendations = potentialMembers.map(user => {
        let score = 0;
        
        // Skill matching score
        const matchingSkills = user.skills.filter(skill => 
          requiredSkills.includes(skill)
        );
        score += matchingSkills.length * 10;

        // Experience level bonus
        const experienceBonus = {
          'Beginner': 1,
          'Intermediate': 2,
          'Advanced': 3,
          'Expert': 4
        };
        score += experienceBonus[user.experience] || 0;

        // Get user's contribution history for additional scoring
        // This would require async operation, simplified for now
        
        return {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            skills: user.skills,
            experience: user.experience,
            bio: user.bio
          },
          score,
          matchingSkills,
          reasons: this.generateRecommendationReasons(user, project, matchingSkills)
        };
      });

      // Sort by score and return top recommendations
      const recommendations = scoredRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return {
        success: true,
        recommendations,
        projectInfo: {
          title: project.title,
          category: project.category,
          technologies: project.technologies
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get project recommendations for a user
  async getProjectRecommendations(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Find projects that match user's skills and interests
      const projects = await Project.find({
        isActive: true,
        visibility: { $in: ['Public', 'Team'] },
        'collaborators.user': { $ne: userId }, // Exclude projects user is already part of
        $or: [
          { technologies: { $in: user.skills } },
          { category: { $in: this.getCategoriesFromSkills(user.skills) } }
        ]
      })
      .populate('owner', 'firstName lastName')
      .populate('team', 'name')
      .limit(20);

      // Score projects based on user compatibility
      const scoredProjects = projects.map(project => {
        let score = 0;

        // Skill matching score
        const matchingTechnologies = project.technologies.filter(tech => 
          user.skills.includes(tech)
        );
        score += matchingTechnologies.length * 15;

        // Project status bonus (prefer active projects)
        if (project.status === 'In Progress') score += 10;
        if (project.status === 'Planning') score += 5;

        // Team size consideration (prefer projects with smaller teams)
        const teamSize = project.collaborators.length;
        if (teamSize < 5) score += 5;

        return {
          project: {
            id: project._id,
            title: project.title,
            description: project.description.substring(0, 200) + '...',
            category: project.category,
            technologies: project.technologies,
            status: project.status,
            owner: project.owner,
            team: project.team,
            collaboratorCount: project.collaborators.length
          },
          score,
          matchingTechnologies,
          reasons: this.generateProjectRecommendationReasons(project, user, matchingTechnologies)
        };
      });

      const recommendations = scoredProjects
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      return {
        success: true,
        recommendations,
        userSkills: user.skills
      };
    } catch (error) {
      throw error;
    }
  }

  // Get skill-based recommendations
  async getSkillRecommendations(skills) {
    try {
      // Find related skills and technologies
      const relatedSkills = this.getRelatedSkills(skills);
      
      // Find users with complementary skills
      const usersWithSkills = await User.find({
        skills: { $in: relatedSkills },
        isActive: true
      })
      .select('firstName lastName skills experience')
      .limit(20);

      // Find projects using these skills
      const projectsWithSkills = await Project.find({
        technologies: { $in: relatedSkills },
        isActive: true,
        visibility: 'Public'
      })
      .populate('owner', 'firstName lastName')
      .select('title description category technologies status')
      .limit(15);

      return {
        success: true,
        relatedSkills,
        recommendedUsers: usersWithSkills,
        recommendedProjects: projectsWithSkills,
        skillInsights: this.generateSkillInsights(skills)
      };
    } catch (error) {
      throw error;
    }
  }

  // Get collaboration recommendations
  async getCollaborationRecommendations(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Find users who have worked on similar projects
      const userContributions = await Contribution.find({ user: userId })
        .populate('project', 'technologies category');

      const projectTechnologies = userContributions
        .map(contrib => contrib.project.technologies)
        .flat();

      const collaborators = await User.find({
        _id: { $ne: userId },
        skills: { $in: projectTechnologies },
        isActive: true
      })
      .select('firstName lastName skills experience')
      .limit(15);

      // Find potential mentors (users with advanced skills)
      const potentialMentors = await User.find({
        _id: { $ne: userId },
        skills: { $in: user.skills },
        experience: { $in: ['Advanced', 'Expert'] },
        isActive: true
      })
      .select('firstName lastName skills experience bio')
      .limit(10);

      return {
        success: true,
        recommendedCollaborators: collaborators,
        potentialMentors: potentialMentors,
        insights: {
          commonTechnologies: this.getMostCommonSkills(projectTechnologies),
          collaborationOpportunities: this.getCollaborationOpportunities(user.skills)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Generate recommendation reasons
  generateRecommendationReasons(user, project, matchingSkills) {
    const reasons = [];
    
    if (matchingSkills.length > 0) {
      reasons.push(`Has ${matchingSkills.length} matching skills: ${matchingSkills.join(', ')}`);
    }
    
    if (user.experience === 'Expert' || user.experience === 'Advanced') {
      reasons.push(`${user.experience} level experience`);
    }
    
    return reasons;
  }

  // Generate project recommendation reasons
  generateProjectRecommendationReasons(project, user, matchingTechnologies) {
    const reasons = [];
    
    if (matchingTechnologies.length > 0) {
      reasons.push(`Uses ${matchingTechnologies.length} of your skills: ${matchingTechnologies.join(', ')}`);
    }
    
    if (project.status === 'In Progress') {
      reasons.push('Actively being developed');
    }
    
    if (project.collaborators.length < 5) {
      reasons.push('Small team - great opportunity to make impact');
    }
    
    return reasons;
  }

  // Get related skills based on technology stacks
  getRelatedSkills(skills) {
    const skillMap = {
      'JavaScript': ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
      'React': ['JavaScript', 'Redux', 'Next.js', 'TypeScript'],
      'Python': ['Django', 'Flask', 'FastAPI', 'NumPy', 'Pandas'],
      'Java': ['Spring', 'Maven', 'Gradle', 'JUnit'],
      // Add more skill relationships
    };

    const relatedSkills = new Set(skills);
    skills.forEach(skill => {
      if (skillMap[skill]) {
        skillMap[skill].forEach(related => relatedSkills.add(related));
      }
    });

    return Array.from(relatedSkills);
  }

  // Get categories from skills
  getCategoriesFromSkills(skills) {
    const categoryMap = {
      'React': 'Web Development',
      'JavaScript': 'Web Development',
      'Python': 'Data Science',
      'Machine Learning': 'AI/ML',
      // Add more mappings
    };

    const categories = skills
      .map(skill => categoryMap[skill])
      .filter(category => category);

    return [...new Set(categories)];
  }

  // Generate skill insights
  generateSkillInsights(skills) {
    return {
      trending: skills.filter(skill => ['React', 'Python', 'TypeScript'].includes(skill)),
      emerging: ['Rust', 'Go', 'Kubernetes'],
      complementary: this.getComplementarySkills(skills)
    };
  }

  // Get complementary skills
  getComplementarySkills(skills) {
    const complementaryMap = {
      'Frontend': ['Backend', 'Database', 'DevOps'],
      'Backend': ['Frontend', 'Database', 'Testing'],
      'Design': ['Frontend', 'User Research', 'Prototyping']
    };

    // Simplified logic - in a real app, this would be more sophisticated
    return ['Testing', 'DevOps', 'Documentation'];
  }

  // Get most common skills
  getMostCommonSkills(technologies) {
    const skillCount = {};
    technologies.forEach(tech => {
      skillCount[tech] = (skillCount[tech] || 0) + 1;
    });

    return Object.entries(skillCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));
  }

  // Get collaboration opportunities
  getCollaborationOpportunities(skills) {
    return [
      'Open source projects',
      'Hackathons',
      'Code reviews',
      'Mentoring programs'
    ];
  }
}

module.exports = new RecommendationService();