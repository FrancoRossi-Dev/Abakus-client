import Joi from 'joi';

export const createBankSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    'string.base': 'Bank name must be text.',
    'string.empty': 'Bank name is required.',
    'string.max': 'Bank name must be at most {#limit} characters long.',
    'any.required': 'Bank name is required.',
  }),
  country: Joi.string().trim().max(60).required().messages({
    'string.base': 'Country must be text.',
    'string.empty': 'Country is required.',
    'string.max': 'Country must be at most {#limit} characters long.',
    'any.required': 'Country is required.',
  }),
  region: Joi.string().trim().max(60).required().messages({
    'string.base': 'Region must be text.',
    'string.empty': 'Region is required.',
    'string.max': 'Region must be at most {#limit} characters long.',
    'any.required': 'Region is required.',
  }),
});
