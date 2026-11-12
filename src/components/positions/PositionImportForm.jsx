import { useEffect, useState } from 'react';
import { readSheet } from 'read-excel-file/browser';
import backend from '../../api/backend';
import { importRowsSchema } from '../../validators/positions.validators';
import ImportFileStep from './ImportFileStep';
import ImportReviewStep from './ImportReviewStep';
import {
  apiDetailsToRowErrors,
  findMissingColumns,
  rowsToImportRows,
  toRowErrors,
} from '../../utils/PositionImportExcel';
import { buildGroups, buildPayload, hasUnresolvedGroups } from '../../utils/PositionImportMatching';
import { buildReportQueries, findReportedAccounts } from '../../utils/PositionImportDuplicates';
import './PositionImportForm.css';

// Primero lo que falta asociar, después lo que se importa y al final lo que se deja afuera
const STATUS_ORDER = { unmatchedClient: 0, unmatchedAccount: 1, ok: 2, skipped: 3 };

// Guarda lo elegido en un desplegable. Elegir '' vuelve a la asociación automática
const changeChoice = (choices, key, value) => {
  const next = { ...choices };
  if (value) next[key] = value;
  else delete next[key];
  return next;
};

/*
 * Importación de posiciones en dos pasos:
 *   1. ImportFileStep: se elige el Excel y se valida en el navegador (no llama al servidor).
 *   2. ImportReviewStep: se asocia cada fila a un cliente y una cuenta, y se confirma.
 * Un reporte de banco trae posiciones de varios clientes: cada fila se asocia por el nombre del
 * cliente, el banco y el número de cuenta; lo que no coincide se elige a mano.
 *
 * Este componente guarda todo el estado y las funciones; los pasos solo muestran y avisan.
 */
const PositionImportForm = ({ clients, banks, onSuccess, onCancel }) => {
  const [file, setFile] = useState(null);

  // Opcional: se aplica a las filas del Excel que no traen fecha de compra
  const [defaultPurchaseDate, setDefaultPurchaseDate] = useState('');

  // Cambiar la key del input de archivo lo vuelve a crear vacío (así se "limpia" en React)
  const [fileInputKey, setFileInputKey] = useState(0);

  // null = todavía no se revisó un archivo; si tiene datos, se muestra el paso 2
  const [importRows, setImportRows] = useState(null);

  // Lo elegido a mano en los desplegables: { [clave]: id | SKIP }
  const [clientChoices, setClientChoices] = useState({});
  const [accountChoices, setAccountChoices] = useState({});

  // Cuentas del archivo que ya tienen posiciones con la misma fecha de reporte (solo avisa, no bloquea)
  const [reportedAccountIds, setReportedAccountIds] = useState(new Set());

  // Estados del envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [rowErrors, setRowErrors] = useState([]);

  // ---- Datos calculados en cada render a partir del estado ----
  let groups = [];
  if (importRows) {
    groups = buildGroups(importRows, { clients, banks, clientChoices, accountChoices });
    groups.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }

  const payload = buildPayload(groups);
  const isUnresolved = hasUnresolvedGroups(groups);
  const canReview = file && !isSubmitting;
  const canConfirm = !isUnresolved && payload.positions.length > 0 && !isSubmitting;

  // Como texto, para volver a consultar solo cuando cambian los clientes, cuentas o días asociados
  const reportQueriesKey = JSON.stringify(buildReportQueries(groups));

  // Busca si alguna cuenta ya tiene posiciones del mismo día (posible archivo repetido)
  useEffect(() => {
    const queries = JSON.parse(reportQueriesKey);
    if (queries.length === 0) return;

    let cancelled = false;

    const checkReported = async () => {
      try {
        const reported = await findReportedAccounts(queries);
        if (!cancelled) setReportedAccountIds(reported);
      } catch {
        // Es un aviso de ayuda: si la consulta falla, se importa igual sin él
      }
    };

    checkReported();

    return () => {
      cancelled = true;
    };
  }, [reportQueriesKey]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
  };

  const handleClientChange = (key, value) => {
    setClientChoices(changeChoice(clientChoices, key, value));
  };

  const handleAccountChange = (key, value) => {
    setAccountChoices(changeChoice(accountChoices, key, value));
  };

  // Paso 1: lee y valida el Excel. No llama al servidor.
  const handleReview = async (event) => {
    event.preventDefault();

    setError('');
    setRowErrors([]);
    setIsSubmitting(true);

    try {
      const rows = await readSheet(file);

      if (rows.length < 2) {
        setError(
          'El archivo no tiene posiciones: debe tener una fila de encabezados y al menos una fila de datos.',
        );
        return;
      }

      const missingColumns = findMissingColumns(rows[0]);
      if (missingColumns.length > 0) {
        setError(`Al archivo le faltan columnas obligatorias: ${missingColumns.join(', ')}.`);
        return;
      }

      const parsedRows = rowsToImportRows(rows, defaultPurchaseDate);
      const rowNumbers = parsedRows.map((row) => row.rowNumber);

      // Se valida antes de mostrar el paso 2, para marcar los errores fila por fila
      const validation = importRowsSchema.validate(
        parsedRows.map((row) => row.position),
        { abortEarly: false },
      );

      if (validation.error) {
        setError('El archivo tiene errores. Corregilos y volvé a subirlo.');
        setRowErrors(toRowErrors(validation.error, rowNumbers));
        return;
      }

      // validation.value tiene los datos ya normalizados por Joi (ISIN en mayúsculas, textos sin espacios)
      setImportRows(parsedRows.map((row, index) => ({ ...row, position: validation.value[index] })));
      setClientChoices({});
      setAccountChoices({});
      setReportedAccountIds(new Set());
    } catch {
      setError('No se pudo leer el archivo. Revisá que sea un Excel (.xlsx o .xlsm).');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2, opción Descartar: vuelve al paso 1 sin enviar nada; el archivo se vacía
  const handleDiscard = () => {
    setImportRows(null);
    setFile(null);
    setFileInputKey(fileInputKey + 1);
    setError('');
    setRowErrors([]);
  };

  // Paso 2, opción Confirmar: todas las posiciones van en un solo POST. La API valida todo antes de
  // guardar, así que si algo falla no queda una importación a medias
  const handleConfirm = async () => {
    setError('');
    setRowErrors([]);
    setIsSubmitting(true);

    try {
      // El token lo agrega el interceptor de backend.js
      const response = await backend.post('/position', payload.positions);

      onSuccess({
        count: response.data.positionIDs.length,
        clientCount: new Set(payload.positions.map((position) => position.clientId)).size,
      });
    } catch (err) {
      setError(err.userMessage || 'No se pudieron importar las posiciones.');

      const details = err.response?.data?.details;
      if (details) {
        setRowErrors(apiDetailsToRowErrors(details, payload.rowNumbers));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ya se revisó un archivo: paso 2
  if (importRows) {
    return (
      <ImportReviewStep
        groups={groups}
        positions={payload.positions}
        rowCount={importRows.length}
        reportedAccountIds={reportedAccountIds}
        clients={clients}
        banks={banks}
        clientChoices={clientChoices}
        accountChoices={accountChoices}
        onClientChange={handleClientChange}
        onAccountChange={handleAccountChange}
        isUnresolved={isUnresolved}
        canConfirm={canConfirm}
        isSubmitting={isSubmitting}
        onDiscard={handleDiscard}
        onConfirm={handleConfirm}
        onCancel={onCancel}
        error={error}
        rowErrors={rowErrors}
      />
    );
  }

  // Paso 1
  return (
    <ImportFileStep
      fileInputKey={fileInputKey}
      defaultPurchaseDate={defaultPurchaseDate}
      onFileChange={handleFileChange}
      onDateChange={(event) => setDefaultPurchaseDate(event.target.value)}
      onSubmit={handleReview}
      onCancel={onCancel}
      canReview={canReview}
      isSubmitting={isSubmitting}
      error={error}
      rowErrors={rowErrors}
    />
  );
};

export default PositionImportForm;
