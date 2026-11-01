import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),

  password: Joi.string().min(6).max(30).required(),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Las contraseñas no coinciden.",
    }),

  details: Joi.object({
    comercialName: Joi.string().trim().max(100).required(),
    legalName: Joi.string().trim().max(100).required(),
    document: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),

    contactEmail: Joi.string()
      .trim()
      .email({ tlds: { allow: false } })
      .required(),

    address: Joi.string().trim().max(200).allow(""),
    country: Joi.string().trim().max(60).allow(""),
  }).required(),
});