import Joi from "joi";
import { paginationQuerySchema } from "./pagination.validators.js";
import { filterId, filterText } from "./filter.validators.js";
import { INSTRUMENT_TYPES } from "../constants/constants.js";

// Lowercased so ids compare equal to the ones the API returns
export const positionParamsSchema = Joi.object({
  positionId: Joi.string().hex().length(24).lowercase().required().messages({
    "string.hex": "Position id is not valid.",
    "string.length": "Position id is not valid.",
    "any.required": "Position id is required.",
  }),
});

export const createPositionSchema = Joi.object({
  clientId: Joi.string().hex().length(24).lowercase().required().messages({
    "string.base": "Client ID must be text.",
    "string.empty": "Client ID is required.",
    "string.hex": "Client ID is not valid.",
    "string.length": "Client ID is not valid.",
    "any.required": "Client ID is required.",
  }),

  bankAccountId: Joi.string().hex().length(24).lowercase().required().messages({
    "string.base": "Bank account ID must be text.",
    "string.empty": "Bank account ID is required.",
    "string.hex": "Bank account ID is not valid.",
    "string.length": "Bank account ID is not valid.",
    "any.required": "Bank account ID is required.",
  }),

  issuerId: Joi.string().hex().length(24).lowercase().empty("").optional().messages({
    "string.base": "Issuer ID must be text.",
    "string.hex": "Issuer ID is not valid.",
    "string.length": "Issuer ID is not valid.",
  }),

  // Bank imports identify the security by ISIN; manual and cash positions by instrumentId
  instrumentId: Joi.string().hex().length(24).lowercase().empty("").messages({
    "string.base": "Instrument ID must be text.",
    "string.hex": "Instrument ID is not valid.",
    "string.length": "Instrument ID is not valid.",
  }),

  isin: Joi.string().trim().uppercase().pattern(/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/).empty("").messages({
    "string.base": "ISIN must be text.",
    "string.pattern.base": "ISIN must be a 12-character code such as US0378331005.",
  }),

  quantity: Joi.number().positive().required().messages({
    "number.base": "Quantity must be a number.",
    "number.positive": "Quantity must be a positive number.",
    "any.required": "Quantity is required.",
  }),

  purchasePrice: Joi.number().positive().required().messages({
    "number.base": "Purchase price must be a number.",
    "number.positive": "Purchase price must be a positive number.",
    "any.required": "Purchase price is required.",
  }),

  currentPrice: Joi.number().positive().empty("").optional().messages({
    "number.base": "Current price must be a number.",
    "number.positive": "Current price must be a positive number.",
  }),

  // As reported by the bank statement; when omitted it is calculated from quantity and price
  marketValue: Joi.number().positive().empty("").optional().messages({
    "number.base": "Market value must be a number.",
    "number.positive": "Market value must be a positive number.",
  }),

  currency: Joi.string().trim().required().messages({
    "string.base": "Currency must be text.",
    "string.empty": "Currency is required.",
    "any.required": "Currency is required.",
  }),

  dateOfPurchase: Joi.date().required().messages({
    "date.base": "Date of purchase must be a valid date.",
    "any.required": "Date of purchase is required.",
  }),

  dateOfReport: Joi.date().empty("").optional().messages({
    "date.base": "Date of report must be a valid date.",
  }),
})
  .xor("instrumentId", "isin")
  .messages({
    "object.missing": "Each position must identify its instrument by either an instrument ID or an ISIN.",
    "object.xor": "Each position must identify its instrument by an instrument ID or an ISIN, not both.",
  });

// Positions are always created in bulk: the body is a list with at least one position
export const createPositionsSchema = Joi.array().items(createPositionSchema).min(1).required().messages({
  "array.base": "Positions must be sent as a list.",
  "array.min": "At least one position is required.",
  "any.required": "At least one position is required.",
});

// Importación desde Excel: los datos de cada fila se validan antes de saber a qué cliente y cuenta van.
// clientId y bankAccountId se agregan al asociar la fila, y los vuelve a validar la API al confirmar
export const importRowSchema = createPositionSchema.fork(["clientId", "bankAccountId"], (schema) =>
  schema.optional(),
);

export const importRowsSchema = Joi.array().items(importRowSchema).min(1).required().messages({
  "array.min": "The file has no positions.",
});

export const updatePositionSchema = Joi.object({
  // Moving a position is checked by the API against the requester's clients
  clientId: Joi.string().hex().length(24).lowercase().messages({
    "string.base": "Client ID must be text.",
    "string.hex": "Client ID is not valid.",
    "string.length": "Client ID is not valid.",
  }),

  bankAccountId: Joi.string().hex().length(24).lowercase().messages({
    "string.base": "Bank account ID must be text.",
    "string.hex": "Bank account ID is not valid.",
    "string.length": "Bank account ID is not valid.",
  }),

  issuerId: Joi.string().hex().length(24).lowercase().messages({
    "string.base": "Issuer ID must be text.",
    "string.hex": "Issuer ID is not valid.",
    "string.length": "Issuer ID is not valid.",
  }),

  instrumentId: Joi.string().hex().length(24).lowercase().messages({
    "string.base": "Instrument ID must be text.",
    "string.hex": "Instrument ID is not valid.",
    "string.length": "Instrument ID is not valid.",
  }),

  quantity: Joi.number().positive().messages({
    "number.base": "Quantity must be a number.",
    "number.positive": "Quantity must be a positive number.",
  }),

  purchasePrice: Joi.number().positive().messages({
    "number.base": "Purchase price must be a number.",
    "number.positive": "Purchase price must be a positive number.",
  }),

  currentPrice: Joi.number().positive().messages({
    "number.base": "Current price must be a number.",
    "number.positive": "Current price must be a positive number.",
  }),

  marketValue: Joi.number().positive().messages({
    "number.base": "Market value must be a number.",
    "number.positive": "Market value must be a positive number.",
  }),

  currency: Joi.string().trim().messages({
    "string.base": "Currency must be text.",
    "string.empty": "Currency cannot be empty.",
  }),

  dateOfPurchase: Joi.date().messages({
    "date.base": "Date of purchase must be a valid date.",
  }),

  dateOfReport: Joi.date().messages({
    "date.base": "Date of report must be a valid date.",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });

// GET /v1/position filters; from and to bound dateOfReport, both inclusive
export const positionQuerySchema = paginationQuerySchema.keys({
  type: Joi.string().valid(...INSTRUMENT_TYPES).messages({
    "any.only": `Instrument type must be one of: ${INSTRUMENT_TYPES.join(", ")}.`,
  }),
  clientId: filterId("Client"),
  instrumentId: filterId("Instrument"),
  currency: filterText("Currency"),
  from: Joi.date().iso().messages({
    "date.base": "From must be a date.",
    "date.format": "From must be an ISO date (YYYY-MM-DD).",
  }),
  // Only compared with from when from is sent; on its own, to is just an upper bound
  to: Joi.date().iso().when("from", { is: Joi.exist(), then: Joi.date().min(Joi.ref("from")) }).messages({
    "date.base": "To must be a date.",
    "date.format": "To must be an ISO date (YYYY-MM-DD).",
    "date.min": "To must be on or after from.",
  }),
});
