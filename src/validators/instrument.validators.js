import Joi from "joi";
import { INSTRUMENT_TYPES } from "../constants/constants.js";

const INVALID_TYPE_MESSAGE = `Instrument type must be one of: ${INSTRUMENT_TYPES.join(", ")}.`;

const marketText = (label, max) =>
  Joi.string().trim().max(max).messages({
    "string.base": `${label} must be text.`,
    "string.empty": `${label} cannot be empty.`,
    "string.max": `${label} must be at most {#limit} characters long.`,
  });

// Alta: la API solo recibe el ISIN y completa el resto con OpenFIGI
export const createInstrumentSchema = Joi.object({
  isin: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/)
    .required()
    .messages({
      'string.base': 'ISIN must be text.',
      'string.empty': 'ISIN is required.',
      'string.pattern.base':
        'ISIN must be a 12-character code such as US0378331005.',
      'any.required': 'ISIN is required.',
    }),
});

// Formulario de edición del instrumento: solo los campos que se corrigen a mano.
// El issuerId lo agrega InstrumentForm desde el instrumento original.
export const editInstrumentFormSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    "string.base": "Instrument name must be text.",
    "string.empty": "Instrument name is required.",
    "string.max": "Instrument name must be at most {#limit} characters long.",
    "any.required": "Instrument name is required.",
  }),
  type: Joi.string().valid(...INSTRUMENT_TYPES).required().messages({
    "any.only": INVALID_TYPE_MESSAGE,
    "any.required": INVALID_TYPE_MESSAGE,
  }),
  ticker: marketText("Ticker", 20).allow(""),
});
