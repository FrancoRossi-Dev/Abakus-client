import Joi from "joi";

// Datos de una posición, con las mismas reglas que valida la API en POST /position
const positionSchema = Joi.object({
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

  // El Excel del banco identifica el instrumento por ISIN; la API también acepta instrumentId
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

  // El valor que informa el banco; si no viene, la API lo calcula con cantidad y precio
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

// Importación desde Excel: los datos de cada fila se validan antes de saber a qué cliente y cuenta van.
// clientId y bankAccountId se agregan al asociar la fila, y los vuelve a validar la API al confirmar
const importRowSchema = positionSchema.fork(["clientId", "bankAccountId"], (schema) =>
  schema.optional(),
);

export const importRowsSchema = Joi.array().items(importRowSchema).min(1).required().messages({
  "array.min": "The file has no positions.",
});
