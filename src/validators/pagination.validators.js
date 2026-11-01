import Joi from 'joi';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/constants.js';

// Query strings arrive as text; Joi converts "2" to 2 before the checks run
export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(DEFAULT_PAGE).messages({
    'number.base': 'Page must be a number.',
    'number.integer': 'Page must be a whole number.',
    'number.min': 'Page must be at least {#limit}.',
  }),
  limit: Joi.number().integer().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE).messages({
    'number.base': 'Limit must be a number.',
    'number.integer': 'Limit must be a whole number.',
    'number.min': 'Limit must be at least {#limit}.',
    'number.max': 'Limit must be at most {#limit}.',
  }),
}).messages({
  'object.unknown': '{#key} is not a supported query parameter.',
});
