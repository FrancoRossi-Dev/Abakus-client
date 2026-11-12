import backend from '../api/backend';

// Detecta si un archivo de posiciones ya se importó antes: busca cuentas que ya tengan
// posiciones con la misma fecha de reporte. Es solo un aviso, no bloquea la importación.

// Día (AAAA-MM-DD, en UTC como lo guarda la API) de una fecha de reporte
const toReportDay = (value) => new Date(value).toISOString().slice(0, 10);

// Por cada cliente asociado: sus cuentas y los días de reporte de sus filas.
// Si una fila no trae fecha de reporte, la API usa la de la subida: hoy
export const buildReportQueries = (groups) => {
  const today = toReportDay(new Date());

  return groups
    .filter((group) => group.client && group.status !== 'skipped')
    .map((group) => {
      const accounts = group.accounts.filter((entry) => entry.status === 'ok');
      const days = new Set(
        accounts.flatMap((entry) =>
          entry.rows.map((row) =>
            row.position.dateOfReport ? toReportDay(row.position.dateOfReport) : today,
          ),
        ),
      );
      return {
        clientId: group.client._id,
        accountIds: accounts.map((entry) => entry.account._id).sort(),
        days: [...days].sort(),
      };
    })
    .filter((query) => query.accountIds.length > 0);
};

// Devuelve el Set de ids de cuentas que ya tienen posiciones en alguno de esos días.
// GET /position filtra por cliente y rango de fechas; la cuenta y el día exacto se comparan acá
export const findReportedAccounts = async (queries) => {
  const reported = new Set();

  for (const { clientId, accountIds, days } of queries) {
    let page = 1;
    let pages;
    do {
      const response = await backend.get('/position', {
        params: { clientId, from: days[0], to: days[days.length - 1], limit: 100, page },
      });
      response.data.data.forEach((position) => {
        if (accountIds.includes(position.bankAccountId) && days.includes(toReportDay(position.dateOfReport))) {
          reported.add(position.bankAccountId);
        }
      });
      pages = response.data.pages;
      page += 1;
    } while (page <= pages);
  }

  return reported;
};
