import Joi from 'joi';

const textMessages = (label, reason) => ({
  'string.base': `${label} must be text.`,
  'string.empty': `${label} is required ${reason}.`,
  'string.min': `${label} must be at least {#limit} characters long.`,
  'string.max': `${label} must be at most {#limit} characters long.`,
  'any.required': `${label} is required ${reason}.`,
});

const usernameMessages = textMessages('Username', 'to identify your advisor account');
const passwordMessages = textMessages('Password', 'to secure your account');

// Exportados para el formulario de advisors del admin (advisor.validators.js)
export const username = Joi.string().trim().min(3).max(30).required().messages(usernameMessages);
export const password = Joi.string().min(6).max(30).required().messages(passwordMessages);

export const advisorDetailsSchema = Joi.object({
  comercialName: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages(textMessages('Commercial name', 'to present your advisory firm')),

  legalName: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages(textMessages('Legal name', 'to register your advisory firm')),

  address: Joi.string()
    .trim()
    .max(200)
    .empty('')
    .messages(textMessages('Address', 'when provided')),

  country: Joi.string()
    .trim()
    .max(60)
    .empty('')
    .messages(textMessages('Country', 'when provided')),

  document: Joi.string()
    .trim()
    .required()
    .messages(textMessages('Document', 'to register your advisory firm')),

  phone: Joi.string()
    .trim()
    .required()
    .messages(textMessages('Phone', 'to contact your advisory firm')),

  contactEmail: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      ...textMessages('Contact email', 'to contact your advisory firm'),
      'string.email': 'Contact email must be a valid address.',
    }),
})
  .required()
  .messages({
    'object.base': 'Advisor details must be an object.',
    'any.required':
      'Advisor details are required to register your advisory firm.',
  });

export const loginSchema = Joi.object({ username, password });

// Joi rechaza las claves que no están en el esquema (ej. role o planTier): no se pueden elegir al registrarse
export const registerSchema = Joi.object({
  username,
  password: password.pattern(/\S/).messages({
    'string.pattern.base': 'Password cannot be only spaces.',
  }),
  // Se envía igual: la API también lo exige y lo descarta después de validarlo
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Password confirmation does not match the password.',
    'string.empty': 'Please confirm your password.',
    'any.required': 'Please confirm your password.',
  }),
  details: advisorDetailsSchema,
});
