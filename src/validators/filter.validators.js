import Joi from 'joi';

// Building blocks for the list filters; each resource adds them to paginationQuerySchema

// Lowercased so ids compare equal to the ones the API returns
export const filterId = (label) =>
  Joi.string().hex().length(24).lowercase().messages({
    'string.hex': `${label} id is not valid.`,
    'string.length': `${label} id is not valid.`,
  });

export const filterText = (label) =>
  Joi.string().trim().max(100).messages({
    'string.empty': `${label} filter cannot be empty.`,
    'string.max': `${label} filter must be at most {#limit} characters long.`,
  });
