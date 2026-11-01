import Joi from 'joi';

export const createIssuerSchema = Joi.object({
  commercialName: Joi.string().trim().max(100).required().messages({
    'string.base': 'Commercial name must be text.',
    'string.empty': 'Commercial name is required.',
    'string.max': 'Commercial name must be at most {#limit} characters long.',
    'any.required': 'Commercial name is required.',
  }),

  legalName: Joi.string().trim().max(100).required().messages({
    'string.base': 'Legal name must be text.',
    'string.empty': 'Legal name is required.',
    'string.max': 'Legal name must be at most {#limit} characters long.',
    'any.required': 'Legal name is required.',
  }),

  address: Joi.string().trim().max(200).empty('').optional().messages({
    'string.base': 'Address must be text.',
    'string.max': 'Address must be at most {#limit} characters long.',
  }),

  country: Joi.string().trim().max(100).empty('').optional().messages({
    'string.base': 'Country must be text.',
    'string.max': 'Country must be at most {#limit} characters long.',
  }),
});

export const updateIssuerSchema = Joi.object({
  commercialName: Joi.string().trim().max(100).messages({
    'string.base': 'Commercial name must be text.',
    'string.empty': 'Commercial name cannot be empty.',
    'string.max': 'Commercial name must be at most {#limit} characters long.',
  }),

  legalName: Joi.string().trim().max(100).messages({
    'string.base': 'Legal name must be text.',
    'string.empty': 'Legal name cannot be empty.',
    'string.max': 'Legal name must be at most {#limit} characters long.',
  }),

  address: Joi.string().trim().max(200).empty('').messages({
    'string.base': 'Address must be text.',
    'string.max': 'Address must be at most {#limit} characters long.',
  }),

  country: Joi.string().trim().max(100).empty('').messages({
    'string.base': 'Country must be text.',
    'string.max': 'Country must be at most {#limit} characters long.',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update.',
  });
