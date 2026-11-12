import Joi from "joi";

export const createClientSchema = Joi.object({
  clientDetails: Joi.object({
    commercialName: Joi.string().trim().max(100).required().messages({
      "string.base": "Commercial name must be text.",
      "string.empty": "Commercial name is required.",
      "string.max": "Commercial name must be at most {#limit} characters long.",
      "any.required": "Commercial name is required.",
    }),

    legalName: Joi.string().trim().max(100).required().messages({
      "string.base": "Legal name must be text.",
      "string.empty": "Legal name is required.",
      "string.max": "Legal name must be at most {#limit} characters long.",
      "any.required": "Legal name is required.",
    }),

    address: Joi.string().trim().max(200).empty("").optional(),

    country: Joi.string().trim().max(100).empty("").optional(),
  }).required(),

  managerId: Joi.string().hex().length(24).lowercase().required().messages({
    "string.empty": "Manager is required.",
    "string.hex": "Manager id is not valid.",
    "string.length": "Manager id is not valid.",
    "any.required": "Manager is required.",
  }),

  bankAccounts: Joi.array()
    .items(
      Joi.object({
        bankId: Joi.string().hex().length(24).lowercase().required().messages({
          "string.empty": "Bank ID is required.",
          "string.hex": "Bank ID is not valid.",
          "string.length": "Bank ID is not valid.",
          "any.required": "Bank ID is required.",
        }),
        number: Joi.string().trim().required().messages({
          "string.empty": "Bank account number is required.",
          "any.required": "Bank account number is required.",
        }),
        accountName: Joi.string().trim().required().messages({
          "string.empty": "Bank account name is required.",
          "any.required": "Bank account name is required.",
        }),
        currency: Joi.string().trim().required().messages({
          "string.empty": "Currency is required.",
          "any.required": "Currency is required.",
        }),
        isDeleted: Joi.boolean().default(false)
      }),
    )
    .default([]),
});

// Cuenta nueva para un cliente existente (BankAccountForm). Se envía con PATCH /client/:id
// junto con las cuentas que ya tenía
export const addBankAccountSchema = Joi.object({
  bankId: Joi.string().hex().length(24).lowercase().required().messages({
    "string.empty": "Bank ID is required.",
    "string.hex": "Bank ID is not valid.",
    "string.length": "Bank ID is not valid.",
    "any.required": "Bank ID is required.",
  }),
  number: Joi.string().trim().required().messages({
    "string.empty": "Bank account number is required.",
    "any.required": "Bank account number is required.",
  }),
  accountName: Joi.string().trim().required().messages({
    "string.empty": "Bank account name is required.",
    "any.required": "Bank account name is required.",
  }),
  currency: Joi.string().trim().required().messages({
    "string.empty": "Currency is required.",
    "any.required": "Currency is required.",
  }),
});

export const updateClientSchema = Joi.object({
  clientDetails: Joi.object({
    commercialName: Joi.string().trim().max(100).messages({
      "string.base": "Commercial name must be text.",
      "string.empty": "Commercial name cannot be empty.",
      "string.max": "Commercial name must be at most {#limit} characters long.",
    }),

    legalName: Joi.string().trim().max(100).messages({
      "string.base": "Legal name must be text.",
      "string.empty": "Legal name cannot be empty.",
      "string.max": "Legal name must be at most {#limit} characters long.",
    }),

    address: Joi.string().trim().max(200).empty("").optional(),

    country: Joi.string().trim().max(100).empty("").optional(),
  })
    .min(1)
    .messages({
      "object.min": "At least one client detail must be provided for update.",
    }),

  managerId: Joi.string().hex().length(24).lowercase().messages({
    "string.empty": "Manager cannot be empty.",
    "string.hex": "Manager id is not valid.",
    "string.length": "Manager id is not valid.",
  }),

  // La lista completa: las cuentas guardadas van con su _id y las nuevas sin él
  bankAccounts: Joi.array().items(
    Joi.object({
      _id: Joi.string().hex().length(24).lowercase().messages({
        "string.hex": "Bank account id is not valid.",
        "string.length": "Bank account id is not valid.",
      }),
      bankId: Joi.string().hex().length(24).lowercase().required().messages({
        "string.empty": "Bank ID is required.",
        "string.hex": "Bank ID is not valid.",
        "string.length": "Bank ID is not valid.",
        "any.required": "Bank ID is required.",
      }),
      number: Joi.string().trim().required().messages({
        "string.empty": "Bank account number is required.",
        "any.required": "Bank account number is required.",
      }),
      accountName: Joi.string().trim().required().messages({
        "string.empty": "Bank account name is required.",
        "any.required": "Bank account name is required.",
      }),
      currency: Joi.string().trim().required().messages({
        "string.empty": "Currency is required.",
        "any.required": "Currency is required.",
      }),
      isDeleted: Joi.boolean().default(false)
    }),
  )
    .unique("_id", { ignoreUndefined: true })
    .messages({ "array.unique": "Each bank account can only be listed once." }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update.",
  });
