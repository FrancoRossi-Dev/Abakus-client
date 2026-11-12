// Asociación de las filas de un reporte de banco con los clientes y cuentas del servidor.
// Sin React: recibe datos y devuelve datos, así la lógica se lee (y prueba) aparte del formulario.

import { normalizeText } from './format';

// Valor del desplegable para dejar afuera las filas de un cliente o cuenta
export const SKIP = 'skip';

// Compara sin distinguir mayúsculas, tildes ni espacios de más ("Jose  Pérez" = "josé perez")
export const normalizeName = (text = '') => normalizeText(text).replace(/\s+/g, ' ');

const activeAccounts = (client) => client.bankAccounts.filter((account) => !account.isDeleted);

// Clientes cuyo nombre comercial o razón social coincide con el nombre del reporte.
// Más de uno = nombre ambiguo: no se asocia solo, se elige a mano
export const findClientMatches = (clientName, clients) => {
  const name = normalizeName(clientName);
  if (!name) return [];

  return clients.filter(
    (client) =>
      normalizeName(client.clientDetails.commercialName) === name ||
      normalizeName(client.clientDetails.legalName) === name,
  );
};

// Cuenta activa del cliente en el banco (por nombre) y con el número del reporte
export const matchAccount = (client, bankName, accountNumber, banks) => {
  const bank = banks.find((candidate) => normalizeName(candidate.name) === normalizeName(bankName));
  if (!bank) return null;

  return (
    activeAccounts(client).find(
      (account) => account.bankId === bank._id && account.number.trim() === accountNumber.trim(),
    ) ?? null
  );
};

// Claves de los desplegables. La de la cuenta incluye el cliente: si se cambia el cliente elegido,
// la cuenta elegida antes deja de valer
export const clientKey = (clientName) => normalizeName(clientName);
export const accountKey = (clientId, bankName, accountNumber) =>
  `${clientId}|${normalizeName(bankName)}|${accountNumber.trim()}`;

// Agrupa las filas por cliente del reporte y, dentro de cada uno, por cuenta.
// clientChoices / accountChoices: lo elegido a mano en los desplegables (id o SKIP); pisa la asociación automática.
// status del grupo: 'ok' | 'skipped' | 'unmatchedClient' | 'unmatchedAccount'
export const buildGroups = (importRows, { clients, banks, clientChoices = {}, accountChoices = {} }) => {
  const groupsByKey = new Map();

  importRows.forEach((row) => {
    const key = clientKey(row.clientName);
    if (!groupsByKey.has(key)) {
      groupsByKey.set(key, { key, clientName: row.clientName, rows: [] });
    }
    groupsByKey.get(key).rows.push(row);
  });

  return [...groupsByKey.values()].map((group) => {
    const candidates = findClientMatches(group.clientName, clients);
    const autoClient = candidates.length === 1 ? candidates[0] : null;
    const choice = clientChoices[group.key];
    const isSkipped = choice === SKIP;
    const client =
      isSkipped ? null
      : choice ? (clients.find((candidate) => candidate._id === choice) ?? null)
      : autoClient;

    const accountsByKey = new Map();
    group.rows.forEach((row) => {
      const key = `${normalizeName(row.bankName)}|${row.accountNumber}`;
      if (!accountsByKey.has(key)) {
        accountsByKey.set(key, { bankName: row.bankName, accountNumber: row.accountNumber, rows: [] });
      }
      accountsByKey.get(key).rows.push(row);
    });

    const accounts = [...accountsByKey.values()].map((entry) => {
      if (!client) return { ...entry, key: null, account: null, status: isSkipped ? 'skipped' : 'pending' };

      const key = accountKey(client._id, entry.bankName, entry.accountNumber);
      const accountChoice = accountChoices[key];
      if (accountChoice === SKIP) return { ...entry, key, account: null, status: 'skipped' };

      const account =
        accountChoice ?
          (activeAccounts(client).find((candidate) => candidate._id === accountChoice) ?? null)
        : matchAccount(client, entry.bankName, entry.accountNumber, banks);

      return {
        ...entry,
        key,
        account,
        isAutoMatched: Boolean(account) && !accountChoice,
        status: account ? 'ok' : 'unmatched',
      };
    });

    let status = 'ok';
    if (isSkipped || accounts.every((account) => account.status === 'skipped')) status = 'skipped';
    else if (!client) status = 'unmatchedClient';
    else if (accounts.some((account) => account.status === 'unmatched')) status = 'unmatchedAccount';

    return {
      ...group,
      client,
      // El nombre coincidió solo: no hace falta mostrar el desplegable
      isAutoMatched: Boolean(autoClient) && !choice,
      isAmbiguous: candidates.length > 1,
      accounts,
      status,
    };
  });
};

export const hasUnresolvedGroups = (groups) =>
  groups.some((group) => group.status === 'unmatchedClient' || group.status === 'unmatchedAccount');

// Lista para POST /position: solo las cuentas asociadas. rowNumbers[i] es la fila del Excel de positions[i],
// para traducir los errores que devuelve la API
export const buildPayload = (groups) => {
  const positions = [];
  const rowNumbers = [];

  groups.forEach((group) => {
    if (group.status === 'skipped' || !group.client) return;

    group.accounts.forEach((entry) => {
      if (entry.status !== 'ok') return;

      entry.rows.forEach((row) => {
        positions.push({ ...row.position, clientId: group.client._id, bankAccountId: entry.account._id });
        rowNumbers.push(row.rowNumber);
      });
    });
  });

  return { positions, rowNumbers };
};
