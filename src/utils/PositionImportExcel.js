// Encabezados que tiene que tener la primera fila del Excel, y el campo de la API al que corresponde cada uno
export const EXCEL_COLUMNS = {
  ISIN: 'isin',
  Cantidad: 'quantity',
  'Precio de compra': 'purchasePrice',
  'Precio actual': 'currentPrice',
  'Valor de mercado': 'marketValue',
  Moneda: 'currency',
  'Fecha de compra': 'dateOfPurchase',
  'Fecha de reporte': 'dateOfReport',
};

// Convierte las filas del Excel en posiciones para la API.
// Los bancos no informan la fecha de compra: si una fila no la trae, se usa defaultPurchaseDate
export const rowsToPositions = (rows, clientId, bankAccountId, defaultPurchaseDate) => {
  // fila uno del reporte son los titulos
  const headers = rows[0];
  // la data
  const dataRows = rows.slice(1);

  const positions = [];

  dataRows.forEach((row) => {
    const position = { clientId, bankAccountId };

    headers.forEach((header, columnIndex) => {
      const field = EXCEL_COLUMNS[header];
      const value = row[columnIndex];

      // Se ignoran las columnas desconocidas y las celdas vacías
      if (field && value !== null && value !== undefined && value !== '') {
        position[field] = value;
      }
    });

    if (!position.dateOfPurchase && defaultPurchaseDate) {
      position.dateOfPurchase = defaultPurchaseDate;
    }

    positions.push(position);
  });

  return positions;
};

// Arma un mensaje por cada error de Joi, indicando la fila del Excel.
// path[0] es el índice de la posición: +2 porque la fila 1 son los encabezados
export const toRowErrors = (validationError) => {
  return validationError.details.map((detail) => {
    const rowNumber = detail.path[0] + 2;
    return `Fila ${rowNumber}: ${detail.message}`;
  });
};

// La API devuelve el detalle por posición como { field: '0.isin', message }:
// el número antes del punto es el índice de la posición
export const apiDetailsToRowErrors = (details) => {
  return details.map((detail) => {
    const index = Number(detail.field.split('.')[0]);
    const rowNumber = index + 2;
    return `Fila ${rowNumber}: ${detail.message}`;
  });
};
