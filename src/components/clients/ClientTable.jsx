import { useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import DataTable from '../shared/table/DataTable';
import EditButton from '../shared/button/EditButton';
import Button from '../shared/button/Button';
import './ClientTable.css';

const EMPTY_VALUE = '—';

// Cada cliente trae solo el managerId: el nombre se busca en la lista de managers
const buildManagerNames = (managers) =>
  new Map(managers.map((manager) => [manager._id, manager.fullName]));

const countActiveAccounts = (client) =>
  client.bankAccounts.filter((account) => !account.isDeleted).length;

// Búsqueda sin distinguir mayúsculas ni tildes ("Peru" encuentra "Perú")
const normalize = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const compareText = (a, b) => (a || '').localeCompare(b || '', 'es', { sensitivity: 'base' });

// selectedClientId / onSelect (opcionales): resaltan el cliente elegido en la lista
const ClientTable = ({ clients, managers, onCreate, selectedClientId, onSelect }) => {
  const searchId = useId();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'commercialName', direction: 'asc' });

  const managerNames = useMemo(() => buildManagerNames(managers), [managers]);

  // Filas con los valores ya resueltos: así búsqueda y orden usan el dato real, no lo que se muestra
  const rows = useMemo(
    () =>
      clients.map((client) => ({
        _id: client._id,
        commercialName: client.clientDetails.commercialName,
        legalName: client.clientDetails.legalName,
        country: client.clientDetails.country || '',
        manager: managerNames.get(client.managerId) || '',
        accounts: countActiveAccounts(client),
      })),
    [clients, managerNames],
  );

  const visibleRows = useMemo(() => {
    const term = normalize(query);

    const filtered =
      term ?
        rows.filter((row) =>
          [row.commercialName, row.legalName, row.country, row.manager].some((value) =>
            normalize(value).includes(term),
          ),
        )
      : rows;

    const factor = sort.direction === 'asc' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      const result =
        sort.key === 'accounts' ? a.accounts - b.accounts : compareText(a[sort.key], b[sort.key]);
      return result * factor;
    });
  }, [rows, query, sort]);

  // Primer click ordena ascendente; el segundo invierte la dirección
  const handleSort = (key) => {
    setSort((current) =>
      current.key === key ?
        { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: 'asc' },
    );
  };

  const columns = [
    {
      key: 'commercialName',
      header: 'Cliente',
      sortable: true,
      render: (row) => (
        <div className='client-table__identity'>
          <span className='client-table__name'>{row.commercialName}</span>
          <span className='client-table__legal'>{row.legalName}</span>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'País',
      sortable: true,
      render: (row) => row.country || <span className='client-table__empty-value'>{EMPTY_VALUE}</span>,
    },
    {
      key: 'manager',
      header: 'Manager',
      sortable: true,
      render: (row) => row.manager || <span className='client-table__empty-value'>Sin asignar</span>,
    },
    {
      key: 'accounts',
      header: 'Cuentas activas',
      align: 'end',
      sortable: true,
    },
  ];

  // Sin clientes: estado vacío con la acción para empezar (spec §8.7)
  if (clients.length === 0) {
    return (
      <section className='client-table client-table--empty'>
        <div className='empty-state'>
          <h2 className='empty-state__title'>Todavía no registraste clientes</h2>
          <p className='empty-state__text'>
            Registrá tu primer cliente para asociarle cuentas bancarias e importar sus posiciones.
          </p>
          {onCreate && (
            <Button type='primary' icon={FiPlus} label='Registrar cliente' onClick={onCreate} />
          )}
        </div>
      </section>
    );
  }

  const isFiltered = query.trim() !== '';

  const noResults = (
    <div className='empty-state empty-state--compact'>
      <p className='empty-state__title'>Ningún cliente coincide con «{query.trim()}»</p>
      <p className='empty-state__text'>Probá con otro nombre, razón social, país o manager.</p>
      <Button type='secondary' label='Limpiar búsqueda' onClick={() => setQuery('')} />
    </div>
  );

  return (
    <section className='client-table' aria-labelledby={`${searchId}-title`}>
      <div className='client-table__toolbar'>
        <div className='client-table__heading'>
          <h2 id={`${searchId}-title`} className='client-table__title'>
            Cartera de clientes
          </h2>
          <p className='client-table__count' aria-live='polite'>
            {isFiltered ?
              `${visibleRows.length} de ${rows.length} clientes`
            : `${rows.length} ${rows.length === 1 ? 'cliente' : 'clientes'}`}
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
            placeholder='Buscar por nombre, razón social, país o manager'
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

      <DataTable
        columns={columns}
        data={visibleRows}
        sort={sort}
        onSort={handleSort}
        selectedKey={selectedClientId}
        onRowSelect={onSelect && ((row) => onSelect(row._id))}
        renderActions={(row) => (
          <EditButton onClick={() => navigate(`/clients/${row._id}`)}>Gestionar</EditButton>
        )}
        itemLabel='clientes'
        emptyMessage={noResults}
      />
    </section>
  );
};

export default ClientTable;
