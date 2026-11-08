// PATCH /client/:clientId recibe la lista COMPLETA de cuentas: las guardadas van con su _id
// (y sin cambiar banco ni número), las nuevas sin _id, y las bajas con isDeleted: true.
// La API devuelve createdAt/updatedAt en cada cuenta, que Joi rechaza: se envían solo estos campos.
export const toAccountPayload = ({ _id, bankId, number, accountName, currency, isDeleted }) => ({
  _id,
  bankId,
  number,
  accountName,
  currency,
  isDeleted: Boolean(isDeleted),
});

export const EMPTY_ACCOUNT = {
  bankId: '',
  number: '',
  accountName: '',
  currency: '',
};
