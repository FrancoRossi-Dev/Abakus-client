import { useId } from 'react';
import FormField from '../shared/form/FormField';
import FormAlert from '../shared/form/FormAlert';
import PositionPreview from './PositionPreview';
import { SKIP } from '../../utils/PositionImportMatching';

const STATUS_LABELS = {
  ok: 'Listo',
  skipped: 'No se importa',
  unmatchedClient: 'Falta asociar el cliente',
  unmatchedAccount: 'Falta asociar una cuenta',
};

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

const compareNames = (a, b) =>
  a.clientDetails.commercialName.localeCompare(b.clientDetails.commercialName, 'es', {
    sensitivity: 'base',
  });

// Una cuenta del reporte: muestra a qué cuenta del cliente va, o un desplegable si no coincidió sola
const AccountRow = ({ entry, client, banks, accountChoice, onAccountChange, disabled }) => {
  const fieldId = useId();
  const bankNames = new Map(banks.map((bank) => [bank._id, bank.name]));
  const accountLabel = (account) =>
    `${account.accountName} · ${bankNames.get(account.bankId) ?? 'Banco desconocido'} (${account.number})`;

  const reportLabel = `${entry.bankName || 'Sin banco'} · ${entry.accountNumber || 'sin número'}`;
  const showSelect = entry.status === 'unmatched' || Boolean(accountChoice);

  return (
    <li className='import-group__account'>
      {showSelect ?
        <FormField
          as='select'
          id={fieldId}
          label={`Cuenta para ${reportLabel} (${pluralize(entry.rows.length, 'posición', 'posiciones')})`}
          hint={
            entry.status === 'unmatched' ?
              'Esta cuenta no coincide con ninguna cuenta activa del cliente.'
            : undefined
          }
          value={accountChoice ?? ''}
          onChange={(event) => onAccountChange(entry.key, event.target.value)}
          disabled={disabled}>
          <option value=''>Elegí una cuenta</option>
          {client.bankAccounts
            .filter((account) => !account.isDeleted)
            .map((account) => (
              <option key={account._id} value={account._id}>
                {accountLabel(account)}
              </option>
            ))}
          <option value={SKIP}>No importar estas posiciones</option>
        </FormField>
      : <p>
          {reportLabel} → <strong>{accountLabel(entry.account)}</strong> (
          {pluralize(entry.rows.length, 'posición', 'posiciones')})
        </p>
      }
    </li>
  );
};

// Las posiciones de un cliente del reporte: a qué cliente y cuentas del servidor van, y su vista previa
const ImportClientGroup = ({
  group,
  clients,
  banks,
  clientChoices,
  accountChoices,
  onClientChange,
  onAccountChange,
  disabled,
}) => {
  const clientFieldId = useId();
  const isUnresolved = group.status === 'unmatchedClient' || group.status === 'unmatchedAccount';
  const rows = group.rows.map((row) => ({ ...row.position, rowNumber: row.rowNumber }));

  return (
    <section
      className={`import-group import-group--${group.status}`}
      aria-labelledby={`${clientFieldId}-title`}>
      <header className='import-group__header'>
        <h3 id={`${clientFieldId}-title`} className='import-group__title'>
          {group.clientName || 'Sin nombre de cliente'}
          {group.client && group.client.clientDetails.commercialName !== group.clientName && (
            <span className='import-group__target'> → {group.client.clientDetails.commercialName}</span>
          )}
        </h3>
        <span className='import-group__status'>{STATUS_LABELS[group.status]}</span>
        <span className='import-group__count'>
          {pluralize(group.rows.length, 'posición', 'posiciones')}
        </span>
      </header>

      {group.status === 'unmatchedClient' && (
        <FormAlert tone='warning'>
          «{group.clientName}» no coincide con ningún cliente. Elegí a qué cliente van sus posiciones o
          dejalas afuera.
        </FormAlert>
      )}

      {!group.isAutoMatched && (
        <FormField
          as='select'
          id={clientFieldId}
          label='Cliente'
          value={clientChoices[group.key] ?? ''}
          onChange={(event) => onClientChange(group.key, event.target.value)}
          disabled={disabled}
          className='import-group__client'>
          <option value=''>Elegí un cliente</option>
          {[...clients].sort(compareNames).map((client) => (
            <option key={client._id} value={client._id}>
              {client.clientDetails.commercialName}
            </option>
          ))}
          <option value={SKIP}>No importar estas posiciones</option>
        </FormField>
      )}

      {group.client && (
        <ul className='import-group__accounts'>
          {group.accounts.map((entry) => (
            <AccountRow
              key={entry.key}
              entry={entry}
              client={group.client}
              banks={banks}
              accountChoice={accountChoices[entry.key]}
              onAccountChange={onAccountChange}
              disabled={disabled}
            />
          ))}
        </ul>
      )}

      {/* Las posiciones se abren solas si falta asociar algo; si no, quedan a un click */}
      <details className='import-group__details' open={isUnresolved}>
        <summary>Ver posiciones</summary>
        <PositionPreview positions={rows} />
      </details>
    </section>
  );
};

export default ImportClientGroup;
