import Joi from 'joi';
import { paginationQuerySchema } from './pagination.validators.js';
import { filterText } from './filter.validators.js';

// Lowercased so ids compare equal to the ones the API returns
export const bankParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).lowercase().required().messages({
    'string.hex': 'Bank id is not valid.',
    'string.length': 'Bank id is not valid.',
    'any.required': 'Bank id is required.',
  }),
});

// The logo is not part of the body: it is uploaded through POST /v1/bank/:id/uploadImage

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

export const updateBankSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    'string.base': 'Bank name must be text.',
    'string.empty': 'Bank name cannot be empty.',
    'string.max': 'Bank name must be at most {#limit} characters long.',
  }),
  country: Joi.string().trim().max(60).messages({
    'string.base': 'Country must be text.',
    'string.empty': 'Country cannot be empty.',
    'string.max': 'Country must be at most {#limit} characters long.',
  }),
  region: Joi.string().trim().max(60).messages({
    'string.base': 'Region must be text.',
    'string.empty': 'Region cannot be empty.',
    'string.max': 'Region must be at most {#limit} characters long.',
  }),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update.',
  });

// GET /v1/bank filters
export const bankQuerySchema = paginationQuerySchema.keys({
  country: filterText('Country'),
  region: filterText('Region'),
});
