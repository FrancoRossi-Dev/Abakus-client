import { useEffect, useId, useMemo, useState } from 'react';
import { readSheet } from 'read-excel-file/browser';
import backend from '../../api/backend';
import { importRowsSchema } from '../../validators/positions.validators';
import ImportClientGroup from './ImportClientGroup';
import FormField from '../shared/form/FormField';
import FormAlert from '../shared/form/FormAlert';
import Button from '../shared/button/Button';
import {
  OPTIONAL_COLUMNS,
  REQUIRED_COLUMNS,
  apiDetailsToRowErrors,
  findMissingColumns,
  rowsToImportRows,
  toRowErrors,
} from '../../utils/PositionImportExcel';
import { buildGroups, buildPayload, hasUnresolvedGroups } from '../../utils/PositionImportMatching';
import './PositionImportForm.css';

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

// Primero lo que falta asociar, después lo que se importa y al final lo que se deja afuera
const STATUS_ORDER = { unmatchedClient: 0, unmatchedAccount: 1, ok: 2, skipped: 3 };

// Día (AAAA-MM-DD, en UTC como lo guarda la API) de una fecha de reporte
const toReportDay = (value) => new Date(value).toISOString().slice(0, 10);

// Por cada cliente asociado: sus cuentas y los días de reporte de sus filas.
// Si una fila no trae fecha de reporte, la API usa la de la subida: hoy
const buildReportQueries = (groups) => {
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

// Cuentas que ya tienen posiciones en alguno de esos días: es probable que el archivo ya se haya importado.
// GET /position filtra por cliente y rango de fechas; la cuenta y el día exacto se comparan acá
const findReportedAccounts = async (queries) => {
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

// Indicador de paso: deja claro dónde está el usuario y cuánto falta
const Steps = ({ current }) => (
  <ol className='import-steps' aria-label='Pasos de la importación'>
    {['Elegir archivo', 'Asociar y confirmar'].map((label, index) => {
      const step = index + 1;
      const state =
        step < current ? 'done'
        : step === current ? 'current'
        : 'pending';

      return (
        <li
          key={label}
          className={`import-steps__item import-steps__item--${state}`}
          aria-current={state === 'current' ? 'step' : undefined}>
          <span className='import-steps__number' aria-hidden='true'>
            {step}
          </span>
          <span>
            <span className='sr-only'>Paso {step} de 2: </span>
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

// Un reporte de banco trae posiciones de varios clientes: cada fila se asocia a un cliente y una cuenta
// por el nombre del cliente, el banco y el número de cuenta; lo que no coincide se elige a mano
const PositionImportForm = ({ clients, banks, onSuccess, onCancel }) => {
  // campos se registan con id de useID para los campos del formulario
  const fileFieldId = useId();
  const purchaseDateFieldId = useId();

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

  // estados de la transaccion
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [rowErrors, setRowErrors] = useState([]);

  const groups = useMemo(() => {
    if (!importRows) return [];
    return buildGroups(importRows, { clients, banks, clientChoices, accountChoices }).sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
    );
  }, [importRows, clients, banks, clientChoices, accountChoices]);

  const payload = useMemo(() => buildPayload(groups), [groups]);
  const isUnresolved = hasUnresolvedGroups(groups);

  // Como texto, para volver a consultar solo cuando cambian los clientes, cuentas o días asociados
  const reportQueriesKey = JSON.stringify(buildReportQueries(groups));

  useEffect(() => {
    const queries = JSON.parse(reportQueriesKey);
    if (queries.length === 0) return undefined;

    let isCurrent = true;
    findReportedAccounts(queries)
      .then((reported) => {
        if (isCurrent) setReportedAccountIds(reported);
      })
      // Es un aviso de ayuda: si la consulta falla, se importa igual sin él
      .catch(() => {});

    return () => {
      isCurrent = false;
    };
  }, [reportQueriesKey]);

  const canReview = file && !isSubmitting;
  const canConfirm = !isUnresolved && payload.positions.length > 0 && !isSubmitting;

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
  };

  // '' vuelve a la asociación automática
  const updateChoice = (setChoices) => (key, value) => {
    setChoices((choices) => {
      const next = { ...choices };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
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
      setImportRows(
        parsedRows.map((row, index) => ({ ...row, position: validation.value[index] })),
      );
      setClientChoices({});
      setAccountChoices({});
      setReportedAccountIds(new Set());
    } catch {
      setError('No se pudo leer el archivo. Revisá que sea un Excel (.xlsx o .xlsm).');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2, opción Descartar: vuelve al formulario sin enviar nada; el archivo se vacía
  const handleDiscard = () => {
    setImportRows(null);
    setFile(null);
    setFileInputKey((key) => key + 1);
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
    } catch (error) {
      setError(error.userMessage || 'No se pudieron importar las posiciones.');

      const details = error.response?.data?.details;
      if (details) {
        setRowErrors(apiDetailsToRowErrors(details, payload.rowNumbers));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error general + detalle por fila, en un solo bloque (causa y acción, spec §7)
  const errorMessages = error && (
    <FormAlert title={error}>
      {rowErrors.length > 0 && (
        <ul>
          {rowErrors.map((rowError) => (
            <li key={rowError}>{rowError}</li>
          ))}
        </ul>
      )}
    </FormAlert>
  );

  // Paso 2: asociación y resumen por cliente de lo que se va a importar
  if (importRows) {
    const accountCount = new Set(payload.positions.map((position) => position.bankAccountId)).size;
    const clientCount = new Set(payload.positions.map((position) => position.clientId)).size;
    const skippedCount = importRows.length - payload.positions.length;
    const reportedCount = new Set(
      payload.positions
        .map((position) => position.bankAccountId)
        .filter((accountId) => reportedAccountIds.has(accountId)),
    ).size;
    const unresolvedCount = groups.filter(
      (group) => group.status === 'unmatchedClient' || group.status === 'unmatchedAccount',
    ).length;

    return (
      <div className='position-import modal-content--wide'>
        <Steps current={2} />

        <dl className='import-summary'>
          <div className='import-summary__item'>
            <dt>Clientes en el archivo</dt>
            <dd>
              <data value={groups.length}>{groups.length}</data>
            </dd>
          </div>
          <div className='import-summary__item'>
            <dt>Clientes a importar</dt>
            <dd>
              <data value={clientCount}>{clientCount}</data>
            </dd>
          </div>
          <div className='import-summary__item'>
            <dt>Cuentas</dt>
            <dd>
              <data value={accountCount}>{accountCount}</data>
            </dd>
          </div>
          <div className='import-summary__item'>
            <dt>Posiciones a importar</dt>
            <dd>
              <data value={payload.positions.length}>{payload.positions.length}</data>
            </dd>
          </div>
          {skippedCount > 0 && (
            <div className='import-summary__item'>
              <dt>Sin importar</dt>
              <dd>
                <data value={skippedCount}>{skippedCount}</data>
              </dd>
            </div>
          )}
        </dl>

        {isUnresolved && (
          <FormAlert tone='warning' title={`Falta asociar ${pluralize(unresolvedCount, 'cliente', 'clientes')}`}>
            Elegí a qué cliente y cuenta van sus posiciones, o marcalas para no importarlas.
          </FormAlert>
        )}

        {reportedCount > 0 && (
          <FormAlert tone='info' title={`${pluralize(reportedCount, 'cuenta ya tiene', 'cuentas ya tienen')} posiciones con la misma fecha de reporte`}>
            Si este archivo ya se importó, esas posiciones se van a duplicar. Revisá las cuentas marcadas
            o dejalas afuera.
          </FormAlert>
        )}

        <div className='import-groups' role='group' aria-label='Posiciones por cliente'>
          {groups.map((group) => (
            <ImportClientGroup
              key={group.key}
              group={group}
              clients={clients}
              banks={banks}
              clientChoices={clientChoices}
              accountChoices={accountChoices}
              reportedAccountIds={reportedAccountIds}
              onClientChange={updateChoice(setClientChoices)}
              onAccountChange={updateChoice(setAccountChoices)}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {errorMessages}

        <div className='modal__actions'>
          <Button
            type='secondary'
            label='Descartar y volver'
            onClick={handleDiscard}
            disabled={isSubmitting}
          />
          <Button
            type='primary'
            label={
              isSubmitting ? 'Importando...' : `Importar ${pluralize(payload.positions.length, 'posición', 'posiciones')}`
            }
            title={isUnresolved ? 'Asociá todos los clientes y cuentas para importar' : undefined}
            onClick={handleConfirm}
            disabled={!canConfirm}
            aria-busy={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // Paso 1: elegir el archivo
  return (
    <form className='position-import' onSubmit={handleReview} noValidate>
      <Steps current={1} />

      <FormField
        key={fileInputKey}
        id={fileFieldId}
        type='file'
        label='Reporte del banco (.xlsx o .xlsm)'
        accept='.xlsx,.xlsm'
        onChange={handleFileChange}
        disabled={isSubmitting}
        hint={
          <>
            Puede traer posiciones de varios clientes y cuentas. La primera fila debe tener los
            encabezados. Obligatorios: <strong>{REQUIRED_COLUMNS.join(', ')}</strong>. Opcionales:{' '}
            {OPTIONAL_COLUMNS.join(', ')}.
          </>
        }
      />

      <FormField
        id={purchaseDateFieldId}
        type='date'
        label='Fecha de compra predeterminada'
        optional
        hint='Se aplica a las filas del Excel que no traen fecha de compra.'
        value={defaultPurchaseDate}
        onChange={(event) => setDefaultPurchaseDate(event.target.value)}
        disabled={isSubmitting}
        className='position-import__date'
      />

      {errorMessages}

      <div className='modal__actions'>
        <Button type='secondary' label='Cancelar' onClick={onCancel} disabled={isSubmitting} />
        <Button
          type='primary'
          htmlType='submit'
          label={isSubmitting ? 'Leyendo archivo...' : 'Revisar archivo'}
          disabled={!canReview}
          aria-busy={isSubmitting}
        />
      </div>
    </form>
  );
};

export default PositionImportForm;
