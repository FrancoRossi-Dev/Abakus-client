import ImportSteps from './ImportSteps';
import ImportSummary from './ImportSummary';
import ImportErrors from './ImportErrors';
import ImportClientGroup from './ImportClientGroup';
import FormAlert from '../shared/form/FormAlert';
import Button from '../shared/button/Button';

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

// Cantidad de valores distintos (ej. cuántas cuentas diferentes hay entre las posiciones)
const countDistinct = (values) => new Set(values).size;

// Paso 2 de la importación: asociar clientes y cuentas, ver el resumen y confirmar.
// No guarda estado propio: todo llega por props desde PositionImportForm
const ImportReviewStep = ({
  groups,
  positions,
  rowCount,
  reportedAccountIds,
  clients,
  banks,
  clientChoices,
  accountChoices,
  onClientChange,
  onAccountChange,
  isUnresolved,
  canConfirm,
  isSubmitting,
  onDiscard,
  onConfirm,
  onCancel,
  error,
  rowErrors,
}) => {
  const accountIds = positions.map((position) => position.bankAccountId);

  const clientCount = countDistinct(positions.map((position) => position.clientId));
  const accountCount = countDistinct(accountIds);
  const reportedCount = countDistinct(accountIds.filter((id) => reportedAccountIds.has(id)));
  const unresolvedCount = groups.filter(
    (group) => group.status === 'unmatchedClient' || group.status === 'unmatchedAccount',
  ).length;

  return (
    <div className='position-import modal-content--wide'>
      <ImportSteps current={2} />

      <ImportSummary
        fileClientCount={groups.length}
        clientCount={clientCount}
        accountCount={accountCount}
        positionCount={positions.length}
        skippedCount={rowCount - positions.length}
      />

      {isUnresolved && (
        <FormAlert tone='warning' title={`Falta asociar ${pluralize(unresolvedCount, 'cliente', 'clientes')}`}>
          Elegí a qué cliente y cuenta van sus posiciones, o marcalas para no importarlas.
        </FormAlert>
      )}

      {reportedCount > 0 && (
        <FormAlert
          tone='info'
          title={`${pluralize(reportedCount, 'cuenta ya tiene', 'cuentas ya tienen')} posiciones con la misma fecha de reporte`}>
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
            onClientChange={onClientChange}
            onAccountChange={onAccountChange}
            disabled={isSubmitting}
          />
        ))}
      </div>

      <ImportErrors error={error} rowErrors={rowErrors} />

      <div className='modal__actions'>
        {/* Cancelar cierra sin importar nada; Volver deja elegir otro archivo */}
        <Button type='tertiary' label='Cancelar' onClick={onCancel} disabled={isSubmitting} />
        <Button type='secondary' label='Descartar y volver' onClick={onDiscard} disabled={isSubmitting} />
        <Button
          type='primary'
          label={
            isSubmitting ? 'Importando...' : `Importar ${pluralize(positions.length, 'posición', 'posiciones')}`
          }
          title={isUnresolved ? 'Asociá todos los clientes y cuentas para importar' : undefined}
          onClick={onConfirm}
          disabled={!canConfirm}
          aria-busy={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ImportReviewStep;
