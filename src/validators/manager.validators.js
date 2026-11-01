import Joi from 'joi';

// Lowercased so ids compare equal to the ones the API returns
export const managerParamsSchema = Joi.object({
  managerId: Joi.string().hex().length(24).lowercase().required().messages({
    'string.hex': 'Manager id is not valid.',
    'string.length': 'Manager id is not valid.',
    'any.required': 'Manager id is required.',
  }),
});

export const createManagerSchema = Joi.object({
  fullName: Joi.string().trim().max(100).required().messages({
    'string.base': 'Full name must be text.',
    'string.empty': 'Full name is required.',
    'string.max': 'Full name must be at most {#limit} characters long.',
    'any.required': 'Full name is required.',
  }),

  email: Joi.string().email({ tlds: { allow: false } }).trim().max(100).required().messages({
    'string.base': 'Email must be text.',
    'string.empty': 'Email is required.',
    'string.email': 'Email must be a valid email address.',
    'string.max': 'Email must be at most {#limit} characters long.',
    'any.required': 'Email is required.',
  }),

  // Taken from the token for advisors; only an admin sends it
  advisorId: Joi.string().hex().length(24).lowercase().messages({
    'string.empty': 'Advisor cannot be empty.',
    'string.hex': 'Advisor id is not valid.',
    'string.length': 'Advisor id is not valid.',
  }),
});

export const updateManagerSchema = Joi.object({
  fullName: Joi.string().trim().max(100).messages({
    'string.base': 'Full name must be text.',
    'string.empty': 'Full name cannot be empty.',
    'string.max': 'Full name must be at most {#limit} characters long.',
  }),

  email: Joi.string().email({ tlds: { allow: false } }).trim().max(100).messages({
    'string.base': 'Email must be text.',
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Email must be a valid email address.',
    'string.max': 'Email must be at most {#limit} characters long.',
  }),

  advisorId: Joi.string().hex().length(24).lowercase().messages({
    'string.empty': 'Advisor cannot be empty.',
    'string.hex': 'Advisor id is not valid.',
    'string.length': 'Advisor id is not valid.',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update.',
  });
