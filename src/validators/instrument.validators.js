import Joi from "joi";
import { paginationQuerySchema } from "./pagination.validators.js";
import { filterText } from "./filter.validators.js";
import { INSTRUMENT_TYPES } from "../constants/constants.js";

const INVALID_TYPE_MESSAGE = `Instrument type must be one of: ${INSTRUMENT_TYPES.join(", ")}.`;

const marketText = (label, max) =>
  Joi.string().trim().max(max).messages({
    "string.base": `${label} must be text.`,
    "string.empty": `${label} cannot be empty.`,
    "string.max": `${label} must be at most {#limit} characters long.`,
  });

// OpenFIGI reference data; optional on both create and update, since manual instruments may have none
const marketDataKeys = {
  figi: Joi.string().trim().uppercase().pattern(/^[A-Z0-9]{12}$/).messages({
    "string.base": "FIGI must be text.",
    "string.empty": "FIGI cannot be empty.",
    "string.pattern.base": "FIGI must be a 12-character alphanumeric identifier.",
  }),
  ticker: marketText("Ticker", 20),
  exchCode: marketText("Exchange code", 10).uppercase(),
  securityType: marketText("Security type", 50),
  securityType2: marketText("Security type 2", 50),
};

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

export const updateInstrumentSchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    "string.base": "Instrument name must be text.",
    "string.empty": "Instrument name cannot be empty.",
    "string.max": "Instrument name must be at most {#limit} characters long.",
  }),
  type: Joi.string().valid(...INSTRUMENT_TYPES).messages({
    "any.only": INVALID_TYPE_MESSAGE,
  }),
  issuerId: Joi.string()
    .hex()
    .length(24)
    .lowercase()
    .when("type", {
      // required(): without it the condition also matches when type is not sent (e.g. on updates)
      is: Joi.valid("stock", "bond").required(),
      then: Joi.required(),
    })
    .messages({
      "string.empty": "Issuer ID is required for stock and bond instruments.",
      "string.hex": "Issuer ID is not valid.",
      "string.length": "Issuer ID is not valid.",
      "any.required": "Issuer ID is required for stock and bond instruments.",
    }),

  ...marketDataKeys,
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });

// GET /v1/instrument filters; q searches the name and the ticker
export const instrumentQuerySchema = paginationQuerySchema.keys({
  type: Joi.string().valid(...INSTRUMENT_TYPES).messages({
    "any.only": INVALID_TYPE_MESSAGE,
  }),
  q: filterText("Name"),
  isin: filterText("ISIN").uppercase(),
});
