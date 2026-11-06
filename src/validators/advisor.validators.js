import Joi from 'joi';
import { advisorDetailsSchema, password, username } from './auth.validators.js';

export const PLAN_TIERS = ['base', 'premium'];

const planTier = Joi.string()
  .valid(...PLAN_TIERS)
  .required()
  .messages({
    'any.only': 'Plan tier must be base or premium.',
    'any.required': 'Plan tier is required.',
  });

const passwordRule = password.pattern(/\S/).messages({
  'string.pattern.base': 'Password cannot be only spaces.',
});

// Alta desde el panel de admin: el admin define la contraseña inicial
export const createAdvisorFormSchema = Joi.object({
  username,
  password: passwordRule,
  details: advisorDetailsSchema,
  planTier,
});

// Edición: la contraseña vacía significa "no cambiarla"
export const editAdvisorFormSchema = Joi.object({
  username,
  password: passwordRule.optional().allow(''),
  details: advisorDetailsSchema,
  planTier,
});
