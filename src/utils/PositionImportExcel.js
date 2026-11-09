// Encabezados del reporte del banco (primera fila del Excel) y el campo de la API al que corresponde cada uno
export const EXCEL_COLUMNS = {
  ISIN: 'isin',
  Quantity: 'quantity',
  costPrice: 'purchasePrice',
  marketPrice: 'currentPrice',
  marketValue: 'marketValue',
  current: 'currency',
  dateOfPurchase: 'dateOfPurchase',
  dateOfReport: 'dateOfReport',
};

// Columnas que dicen a qué cliente y cuenta va cada fila; no se envían a la API
export const DESTINATION_COLUMNS = {
  Bank: 'bankName',
  numberAccount: 'accountNumber',
  nameAccount: 'clientName',
};

export const REQUIRED_COLUMNS = ['Bank', 'numberAccount', 'nameAccount', 'ISIN', 'Quantity', 'costPrice', 'current'];
export const OPTIONAL_COLUMNS = ['marketPrice', 'marketValue', 'dateOfPurchase', 'dateOfReport'];

const isEmpty = (value) => value === null || value === undefined || value === '';

// Encabezados obligatorios que no están en la primera fila
export const findMissingColumns = (headers) =>
  REQUIRED_COLUMNS.filter((column) => !headers.includes(column));

// Convierte las filas del Excel en filas de importación: { rowNumber, bankName, accountNumber, clientName, position }.
// position todavía no tiene clientId ni bankAccountId: se asignan al asociar cada fila con un cliente.
// Los bancos no siempre informan la fecha de compra: si una fila no la trae, se usa defaultPurchaseDate
export const rowsToImportRows = (rows, defaultPurchaseDate) => {
  // fila uno del reporte son los titulos
  const headers = rows[0];

  const importRows = [];

  rows.slice(1).forEach((row, index) => {
    // Las filas totalmente vacías (al final de la hoja) no son posiciones
    if (row.every(isEmpty)) return;

    // +2: el índice empieza en 0 y la fila 1 son los encabezados
    const importRow = { rowNumber: index + 2, bankName: '', accountNumber: '', clientName: '', position: {} };

    headers.forEach((header, columnIndex) => {
      const value = row[columnIndex];
      if (isEmpty(value)) return;

      if (DESTINATION_COLUMNS[header]) {
        importRow[DESTINATION_COLUMNS[header]] = String(value).trim();
      } else if (EXCEL_COLUMNS[header]) {
        // Se ignoran las columnas desconocidas (ej. description)
        importRow.position[EXCEL_COLUMNS[header]] = value;
      }
    });

    if (!importRow.position.dateOfPurchase && defaultPurchaseDate) {
      importRow.position.dateOfPurchase = defaultPurchaseDate;
    }

    importRows.push(importRow);
  });

  return importRows;
};

// Arma un mensaje por cada error de Joi, indicando la fila del Excel.
// path[0] es el índice dentro de la lista validada; rowNumbers traduce ese índice a la fila real
export const toRowErrors = (validationError, rowNumbers) =>
  validationError.details.map((detail) => `Fila ${rowNumbers[detail.path[0]]}: ${detail.message}`);

// La API devuelve el detalle por posición como { field: '0.isin', message }:
// el número antes del punto es el índice de la posición en lo que se envió
export const apiDetailsToRowErrors = (details, rowNumbers) =>
  details.map((detail) => {
    const index = Number(detail.field.split('.')[0]);
    return `Fila ${rowNumbers[index] ?? '?'}: ${detail.message}`;
  });
