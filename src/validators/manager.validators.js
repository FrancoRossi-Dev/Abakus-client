import Joi from 'joi';

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
});
