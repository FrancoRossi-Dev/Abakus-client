// Cálculos del reporte de cartera. Son funciones comunes de JavaScript (sin React):
// reciben datos y devuelven datos, así los componentes solo se ocupan de mostrar.


// El reporte identifica la cuenta de cada posición. La cuenta del cliente identifica el banco.
export const getPositionBankId = (position, accounts) => {
  const account = accounts.find((item) => item._id === position.bankAccount?.id);
  return account?.bankId ?? 'unknown';
};

// Agrupa posiciones y suma su valor de mercado. getGroup devuelve la clave del grupo y sus datos
export const groupPositions = (positions, getGroup) => {
  const groups = new Map();

  for (const position of positions) {
    const { key, ...fields } = getGroup(position);
    const group = groups.get(key) ?? { ...fields, marketValue: 0 };

    group.marketValue += position.marketValue;
    groups.set(key, group);
  }

  return [...groups.values()].sort((a, b) => b.marketValue - a.marketValue);
};

// Total de la cartera en cada banco, de mayor a menor
export const getBankTotals = (positions, accounts, banks) => {
  const bankNamesById = new Map(banks.map((bank) => [bank._id, bank.name]));
  const totals = new Map();

  for (const position of positions) {
    const bankId = getPositionBankId(position, accounts);

    const bank = totals.get(bankId) ?? {
      id: bankId,
      name: bankNamesById.get(bankId) ?? 'Banco sin identificar',
      marketValue: 0,
    };

    bank.marketValue += position.marketValue;
    totals.set(bankId, bank);
  }

  return [...totals.values()].sort((a, b) => b.marketValue - a.marketValue);
};

// Composición por tipo de activo de las posiciones de un banco
export const getTypesOfPositions = (positions) =>
  groupPositions(positions, (position) => {
    const type = position.instrument?.type ?? 'other';
    return { key: type, type };
  });

// Instrumentos de las posiciones de un banco, con su porcentaje sobre el total de ese banco
export const getInstrumentsOfPositions = (positions, totalValue) =>
  groupPositions(positions, ({ instrument }) => ({
    key: instrument?.id ?? 'unknown',
    id: instrument?.id ?? null,
    name: instrument?.name ?? 'Instrumento sin identificar',
    isin: instrument?.isin ?? null,
  })).map((instrument) => ({
    ...instrument,
    percentage: totalValue ? (instrument.marketValue / totalValue) * 100 : 0,
  }));
