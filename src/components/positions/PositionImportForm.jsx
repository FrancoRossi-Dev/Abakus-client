import { useId, useState } from 'react';
import { readSheet } from 'read-excel-file/browser';
import backend from '../../api/backend';
import { createPositionsSchema } from '../../validators/positions.validators';
import PositionPreview from './PositionPreview';
import FormField from '../shared/form/FormField';
import FormAlert from '../shared/form/FormAlert';
import Button from '../shared/button/Button';
import {
  EXCEL_COLUMNS,
  apiDetailsToRowErrors,
  rowsToPositions,
  toRowErrors,
} from '../../utils/PositionImportExcel';
import './PositionImportForm.css';

const OPTIONAL_COLUMNS = ['Precio actual', 'Valor de mercado', 'Fecha de compra', 'Fecha de reporte'];
const REQUIRED_COLUMNS = Object.keys(EXCEL_COLUMNS).filter(
  (column) => !OPTIONAL_COLUMNS.includes(column),
);

// Indicador de paso: deja claro dónde está el usuario y cuánto falta
const Steps = ({ current }) => (
  <ol className='import-steps' aria-label='Pasos de la importación'>
    {['Elegir cuenta y archivo', 'Revisar y confirmar'].map((label, index) => {
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

// client: el cliente ya elegido en la lista de la página; acá solo se elige banco, cuenta y archivo
const PositionImportForm = ({ client, banks, onSuccess, onCancel }) => {
  // campos se registan con id de useID para los campos del formulario
  const bankFieldId = useId();
  const accountFieldId = useId();
  const fileFieldId = useId();
  const purchaseDateFieldId = useId();

  // estados de los seletores y el archivo subido
  const clientId = client._id;
  const [bankId, setBankId] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [file, setFile] = useState(null);

  // Opcional: se aplica a las filas del Excel que no traen fecha de compra
  const [defaultPurchaseDate, setDefaultPurchaseDate] = useState('');

  // Cambiar la key del input de archivo lo vuelve a crear vacío (así se "limpia" en React)
  const [fileInputKey, setFileInputKey] = useState(0);

  // null = todavía no se revisó un archivo; si tiene datos, se muestra la vista previa
  const [previewPositions, setPreviewPositions] = useState(null);

  // estados de la transaccion
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [rowErrors, setRowErrors] = useState([]);

  // Cuentas activas del cliente en el banco elegido
  const accounts =
    bankId ?
      client.bankAccounts.filter((account) => account.bankId === bankId && !account.isDeleted)
    : [];

  const selectedAccount = accounts.find((account) => account._id === bankAccountId);
  const selectedBank = banks.find((bank) => bank._id === bankId);

  const canReview = bankId && bankAccountId && file && !isSubmitting;
  const hasNoAccounts = bankId && accounts.length === 0;

  // Al cambiar el banco, la cuenta elegida deja de valer
  const handleBankChange = (event) => {
    setBankId(event.target.value);
    setBankAccountId('');
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0] || null);
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

      const positions = rowsToPositions(rows, clientId, bankAccountId, defaultPurchaseDate);

      // Se valida antes de mostrar la vista previa, para marcar los errores fila por fila
      const validation = createPositionsSchema.validate(positions, { abortEarly: false });

      if (validation.error) {
        setError('El archivo tiene errores. Corregilos y volvé a subirlo.');
        setRowErrors(toRowErrors(validation.error));
        return;
      }

      // validation.value tiene los datos ya normalizados por Joi (ISIN en mayúsculas, textos sin espacios)
      setPreviewPositions(validation.value);
    } catch {
      setError('No se pudo leer el archivo. Revisá que sea un Excel (.xlsx).');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2, opción Descartar: vuelve al formulario sin enviar nada.
  // Se mantienen cliente, banco y cuenta; el archivo se vacía.
  const handleDiscard = () => {
    setPreviewPositions(null);
    setFile(null);
    setFileInputKey((key) => key + 1);
    setError('');
    setRowErrors([]);
  };

  // Paso 2, opción Confirmar: recién acá se envían las posiciones al servidor
  const handleConfirm = async () => {
    setError('');
    setRowErrors([]);
    setIsSubmitting(true);

    try {
      // El token lo agrega el interceptor de backend.js
      const response = await backend.post('/position', previewPositions);

      onSuccess({ count: response.data.positionIDs.length });
    } catch (error) {
      setError(error.userMessage || 'No se pudieron importar las posiciones.');

      const details = error.response?.data?.details;
      if (details) {
        setRowErrors(apiDetailsToRowErrors(details));
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

  // Paso 2: vista previa de lo que se va a importar
  if (previewPositions) {
    return (
      <div className='position-import modal-content--wide'>
        <Steps current={2} />

        {/* Resumen del destino: se confirma qué se importa y dónde */}
        <dl className='import-summary'>
          <div className='import-summary__item'>
            <dt>Cliente</dt>
            <dd>{client.clientDetails.commercialName}</dd>
          </div>
          <div className='import-summary__item'>
            <dt>Cuenta</dt>
            <dd>
              {selectedAccount.accountName} · {selectedBank?.name} ({selectedAccount.number})
            </dd>
          </div>
          <div className='import-summary__item'>
            <dt>Posiciones</dt>
            <dd>
              <data value={previewPositions.length}>{previewPositions.length}</data>
            </dd>
          </div>
        </dl>

        <PositionPreview positions={previewPositions} />

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
              isSubmitting ? 'Importando...' : `Importar ${previewPositions.length} posiciones`
            }
            onClick={handleConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          />
        </div>
      </div>
    );
  }

  // Paso 1: elegir cliente, banco, cuenta y archivo
  return (
    <form className='position-import' onSubmit={handleReview} noValidate>
      <Steps current={1} />

      {/* El cliente se eligió en la lista: acá solo se muestra */}
      <dl className='import-summary'>
        <div className='import-summary__item'>
          <dt>Cliente</dt>
          <dd>{client.clientDetails.commercialName}</dd>
        </div>
      </dl>

      <div className='position-import__row'>
        <FormField
          as='select'
          id={bankFieldId}
          label='Banco'
          value={bankId}
          onChange={handleBankChange}
          disabled={isSubmitting}>
          <option value=''>Elegí un banco</option>
          {banks.map((bank) => (
            <option key={bank._id} value={bank._id}>
              {bank.name}
            </option>
          ))}
        </FormField>

        <FormField
          as='select'
          id={accountFieldId}
          label='Cuenta'
          hint={!bankId ? 'Elegí primero el banco.' : undefined}
          value={bankAccountId}
          onChange={(event) => setBankAccountId(event.target.value)}
          disabled={isSubmitting || accounts.length === 0}>
          <option value=''>Elegí una cuenta</option>
          {accounts.map((account) => (
            <option key={account._id} value={account._id}>
              {account.accountName} ({account.number}, {account.currency})
            </option>
          ))}
        </FormField>
      </div>

      {hasNoAccounts && (
        <FormAlert tone='warning'>
          El cliente no tiene cuentas activas en este banco. Elegí otro banco o agregale una cuenta.
        </FormAlert>
      )}

      <FormField
        key={fileInputKey}
        id={fileFieldId}
        type='file'
        label='Archivo Excel (.xlsx)'
        accept='.xlsx'
        onChange={handleFileChange}
        disabled={isSubmitting}
        hint={
          <>
            La primera fila debe tener los encabezados. Obligatorios:{' '}
            <strong>{REQUIRED_COLUMNS.join(', ')}</strong>. Opcionales: {OPTIONAL_COLUMNS.join(', ')}.
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
