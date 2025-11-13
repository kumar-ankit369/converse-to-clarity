/**
 * Request Validation Middleware
 * Validates incoming request data using Joi schemas
 */

const Joi = require('joi');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace the original data with validated data
    req[property] = value;
    next();
  };
};

// Auth validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  lastName: Joi.string().trim().min(2).max(50).required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  email: Joi.string().email().lowercase().required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'Password is required'
    }),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  bio: Joi.string().max(500).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  newPassword: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'any.required': 'New password is required'
    })
});

// User validation schemas
const userUpdateSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  bio: Joi.string().max(500).optional().allow(''),
  skills: Joi.array().items(Joi.string().trim()).optional(),
  experience: Joi.string().valid('Beginner', 'Intermediate', 'Advanced', 'Expert').optional()
});

const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string().min(6).max(128).required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'any.required': 'New password is required'
    })
});

// Project validation schemas
const projectSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required()
    .messages({
      'string.min': 'Project title must be at least 3 characters long',
      'string.max': 'Project title cannot exceed 200 characters',
      'any.required': 'Project title is required'
    }),
  description: Joi.string().trim().min(10).max(2000).required()
    .messages({
      'string.min': 'Project description must be at least 10 characters long',
      'string.max': 'Project description cannot exceed 2000 characters',
      'any.required': 'Project description is required'
    }),
  category: Joi.string().valid(
    'Web Development', 'Mobile App', 'Data Science', 'AI/ML', 
    'DevOps', 'Design', 'Research', 'Other'
  ).required()
    .messages({
      'any.only': 'Please select a valid project category',
      'any.required': 'Project category is required'
    }),
  technologies: Joi.array().items(Joi.string().trim()).min(1).required()
    .messages({
      'array.min': 'At least one technology must be specified',
      'any.required': 'Technologies are required'
    }),
  timeline: Joi.object({
    startDate: Joi.date().min('now').required()
      .messages({
        'date.min': 'Start date cannot be in the past',
        'any.required': 'Start date is required'
      }),
    endDate: Joi.date().greater(Joi.ref('startDate')).required()
      .messages({
        'date.greater': 'End date must be after start date',
        'any.required': 'End date is required'
      }),
    milestones: Joi.array().items(Joi.object({
      title: Joi.string().trim().required(),
      description: Joi.string().trim().optional(),
      dueDate: Joi.date().required()
    })).optional()
  }).required(),
  visibility: Joi.string().valid('Public', 'Private', 'Team').optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  repository: Joi.object({
    url: Joi.string().uri().optional(),
    platform: Joi.string().valid('GitHub', 'GitLab', 'Bitbucket', 'Other').optional(),
    isPrivate: Joi.boolean().optional()
  }).optional()
});

const projectUpdateSchema = projectSchema.fork(
  ['title', 'description', 'category', 'technologies', 'timeline'], 
  (schema) => schema.optional()
);

// Team validation schemas
const teamSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required()
    .messages({
      'string.min': 'Team name must be at least 3 characters long',
      'string.max': 'Team name cannot exceed 100 characters',
      'any.required': 'Team name is required'
    }),
  description: Joi.string().trim().max(1000).optional().allow(''),
  visibility: Joi.string().valid('Public', 'Private', 'Invite-Only').optional(),
  maxMembers: Joi.number().integer().min(2).max(50).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional()
});

const teamUpdateSchema = teamSchema.fork(['name'], (schema) => schema.optional());

// Chat validation schemas
const messageSchema = Joi.object({
  content: Joi.string().trim().min(1).max(1000).required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message content is required'
    }),
  projectId: Joi.string().optional(),
  teamId: Joi.string().optional(),
  messageType: Joi.string().valid('text', 'file', 'image').optional(),
  replyTo: Joi.string().optional()
}).xor('projectId', 'teamId')
  .messages({
    'object.xor': 'Message must be sent to either a project or team, not both'
  });

// Contribution validation schemas
const contributionSchema = Joi.object({
  project: Joi.string().required()
    .messages({
      'any.required': 'Project ID is required'
    }),
  contributionType: Joi.string().valid(
    'Code', 'Documentation', 'Design', 'Testing', 'Review', 
    'Bug Fix', 'Feature', 'Research', 'Other'
  ).required()
    .messages({
      'any.only': 'Please select a valid contribution type',
      'any.required': 'Contribution type is required'
    }),
  title: Joi.string().trim().min(3).max(200).required()
    .messages({
      'string.min': 'Contribution title must be at least 3 characters long',
      'string.max': 'Contribution title cannot exceed 200 characters',
      'any.required': 'Contribution title is required'
    }),
  description: Joi.string().trim().max(1000).optional().allow(''),
  effort: Joi.string().valid('Trivial', 'Minor', 'Major', 'Epic').optional(),
  estimatedHours: Joi.number().min(0).optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  commitHash: Joi.string().trim().optional(),
  pullRequestUrl: Joi.string().uri().optional()
});

// Recommendation validation schemas
const recommendationPreferencesSchema = Joi.object({
  skillsOfInterest: Joi.array().items(Joi.string().trim()).optional(),
  preferredProjectTypes: Joi.array().items(Joi.string().trim()).optional(),
  collaborationPreferences: Joi.object({
    teamSize: Joi.string().valid('Small', 'Medium', 'Large').optional(),
    projectDuration: Joi.string().valid('Short', 'Medium', 'Long').optional(),
    communicationStyle: Joi.string().valid('Formal', 'Casual', 'Mixed').optional()
  }).optional(),
  notificationPreferences: Joi.object({
    emailNotifications: Joi.boolean().optional(),
    projectRecommendations: Joi.boolean().optional(),
    teamInvitations: Joi.boolean().optional()
  }).optional()
});

// Export validation middleware functions
const validateRegister = validate(registerSchema);
const validateLogin = validate(loginSchema);
const validateForgotPassword = validate(forgotPasswordSchema);
const validateResetPassword = validate(resetPasswordSchema);
const validateUserUpdate = validate(userUpdateSchema);
const validatePasswordChange = validate(passwordChangeSchema);
const validateProject = validate(projectSchema);
const validateProjectUpdate = validate(projectUpdateSchema);
const validateTeam = validate(teamSchema);
const validateTeamUpdate = validate(teamUpdateSchema);
const validateMessage = validate(messageSchema);
const validateContribution = validate(contributionSchema);
const validateRecommendationPreferences = validate(recommendationPreferencesSchema);

// Pagination validation
const validatePagination = validate(Joi.object({
  page: Joi.number().integer().min(1).optional().default(1),
  limit: Joi.number().integer().min(1).max(100).optional().default(10),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').optional().default('desc')
}), 'query');

// ID parameter validation
const validateId = validate(Joi.object({
  id: Joi.string().hex().length(24).required()
    .messages({
      'string.hex': 'Invalid ID format',
      'string.length': 'Invalid ID format',
      'any.required': 'ID is required'
    })
}), 'params');

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUserUpdate,
  validatePasswordChange,
  validateProject,
  validateProjectUpdate,
  validateTeam,
  validateTeamUpdate,
  validateMessage,
  validateContribution,
  validateRecommendationPreferences,
  validatePagination,
  validateId
};