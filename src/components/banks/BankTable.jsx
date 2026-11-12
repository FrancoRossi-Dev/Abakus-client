import { useState } from 'react';
import backend from '../../api/backend';
import PaginatedTable from '../shared/table/PaginatedTable';
import EditButton from '../shared/button/EditButton';
import DeleteButton from '../shared/button/DeleteButton';

const columns = [
  {
    key: 'logo',
    header: 'Logo',
    render: (bank) => (bank.logoURL ? <img src={bank.logoURL} alt={bank.name} width={32} /> : '—'),
  },
  { key: 'name', header: 'Nombre' },
  { key: 'country', header: 'País' },
  { key: 'region', header: 'Región' },
];

const BankTable = ({ list, onEdit, onDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (bank) => {
    const confirmed = window.confirm(`¿Querés eliminar el banco ${bank.name}?`);

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      setDeletingId(bank._id);

      // El token lo agrega el interceptor de backend.js
      await backend.delete(`/bank/${bank._id}`);

      // La página recarga el listado: los items de las páginas siguientes se corren un lugar
      onDeleted();
    } catch (error) {
      setError(error.userMessage || 'No se pudo eliminar el banco.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderActions = (bank, { isLoading }) => {
    const disabled = deletingId !== null || isLoading;

    return (
      <>
        <EditButton onClick={() => onEdit(bank)} disabled={disabled} />

        <DeleteButton onClick={() => handleDelete(bank)} disabled={disabled}>
          {deletingId === bank._id ? 'Eliminando...' : 'Eliminar'}
        </DeleteButton>
      </>
    );
  };

  return (
    <PaginatedTable
      title='Catálogo de bancos'
      actionError={error}
      list={list}
      columns={columns}
      itemLabel='bancos'
      renderActions={renderActions}
    />
  );
};

export default BankTable;
