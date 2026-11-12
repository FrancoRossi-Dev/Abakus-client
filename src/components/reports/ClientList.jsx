import { useId, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import ClientAvatar from '../clients/ClientAvatar';
import { normalizeText } from '../../utils/format';

// Lista lateral de clientes con buscador. Al hacer clic en uno, avisa al padre con onSelect
const ClientList = ({ clients, selectedId, onSelect }) => {
  const searchId = useId();
  const [query, setQuery] = useState('');

  const term = normalizeText(query);
  const isFiltered = term !== '';

  // Se busca por nombre comercial o razón social
  const visibleClients = clients.filter(
    (client) =>
      normalizeText(client.clientDetails.commercialName).includes(term) ||
      normalizeText(client.clientDetails.legalName).includes(term),
  );

  return (
    <aside className='panel client-list' aria-labelledby={`${searchId}-title`}>
      <div className='client-list__header'>
        <div className='panel__heading'>
          <h2 id={`${searchId}-title`} className='panel__title'>
            Clientes
          </h2>
          <p className='panel__count' aria-live='polite'>
            {isFiltered ?
              `${visibleClients.length} de ${clients.length}`
            : `${clients.length} ${clients.length === 1 ? 'cliente' : 'clientes'}`}
          </p>
        </div>

        <div className='search-field' role='search'>
          <label htmlFor={searchId} className='sr-only'>
            Buscar clientes
          </label>
          <FiSearch className='search-field__icon' aria-hidden='true' />
          <input
            id={searchId}
            type='search'
            placeholder='Buscar cliente'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
          />
          {isFiltered && (
            <button
              type='button'
              className='search-field__clear'
              onClick={() => setQuery('')}
              aria-label='Limpiar búsqueda'
              title='Limpiar búsqueda'>
              <FiX aria-hidden='true' />
            </button>
          )}
        </div>
      </div>

      {visibleClients.length === 0 ?
        <p className='client-list__empty'>Ningún cliente coincide con «{query.trim()}».</p>
      : <ul className='client-list__items'>
          {visibleClients.map((client) => (
            <li key={client._id}>
              <button
                type='button'
                className='client-list__item'
                aria-current={selectedId === client._id ? 'true' : undefined}
                onClick={() => onSelect(client._id)}>
                <ClientAvatar
                  name={client.clientDetails.commercialName}
                  src={client.clientDetails.logoURL}
                  size='sm'
                />
                <span className='client-list__text'>
                  <span className='client-list__name'>{client.clientDetails.commercialName}</span>
                  <span className='client-list__legal'>{client.clientDetails.legalName}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      }
    </aside>
  );
};

export default ClientList;
