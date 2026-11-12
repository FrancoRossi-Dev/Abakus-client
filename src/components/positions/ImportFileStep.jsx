import { useId } from 'react';
import ImportSteps from './ImportSteps';
import ImportErrors from './ImportErrors';
import FormField from '../shared/form/FormField';
import Button from '../shared/button/Button';
import { OPTIONAL_COLUMNS, REQUIRED_COLUMNS } from '../../utils/PositionImportExcel';

// Paso 1 de la importación: elegir el Excel y, opcionalmente, una fecha de compra.
// No guarda estado propio: los valores y las acciones llegan por props desde PositionImportForm
const ImportFileStep = ({
  fileInputKey,
  defaultPurchaseDate,
  onFileChange,
  onDateChange,
  onSubmit,
  onCancel,
  canReview,
  isSubmitting,
  error,
  rowErrors,
}) => {
  const fileFieldId = useId();
  const purchaseDateFieldId = useId();

  return (
    <form className='position-import' onSubmit={onSubmit} noValidate>
      <ImportSteps current={1} />

      {/* Cambiar la key vuelve a crear el input vacío: así se "limpia" un input de archivo */}
      <FormField
        key={fileInputKey}
        id={fileFieldId}
        type='file'
        label='Reporte del banco (.xlsx o .xlsm)'
        accept='.xlsx,.xlsm'
        onChange={onFileChange}
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
        onChange={onDateChange}
        disabled={isSubmitting}
        className='position-import__date'
      />

      <ImportErrors error={error} rowErrors={rowErrors} />

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

export default ImportFileStep;
