import { useState } from 'react';
import backend from '../../api/backend';
import PaginatedTable from '../shared/table/PaginatedTable';
import EditButton from '../shared/button/EditButton';
import DeleteButton from '../shared/button/DeleteButton';
import { getRole } from '../../utils/utils';

const baseColumns = [
  { key: 'fullName', header: 'Nombre completo' },
  { key: 'email', header: 'Correo' },
];

// Solo para el admin: un advisor ve únicamente sus managers, la firma sería siempre la misma
const firmColumn = {
  key: 'firm',
  header: 'Firma',
  render: (manager) => manager.advisor?.details?.comercialName ?? '—',
};

const ManagerTable = ({ list, onEdit, onDeleted }) => {
  // si el usuario es administrador, se muestra a que firma pertenecen los managers
  const columns = getRole() === 'admin' ? [...baseColumns, firmColumn] : baseColumns;

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (manager) => {
    const confirmed = window.confirm(`¿Querés eliminar a ${manager.fullName}?`);

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      setDeletingId(manager._id);

      // El token lo agrega el interceptor de backend.js
      await backend.delete(`/manager/${manager._id}`);

      // La página recarga el listado: los items de las páginas siguientes se corren un lugar
      onDeleted();
    } catch (error) {
      setError(error.userMessage || 'No se pudo eliminar el manager.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderActions = (manager, { isLoading }) => {
    const disabled = deletingId !== null || isLoading;

    return (
      <>
        <EditButton onClick={() => onEdit(manager)} disabled={disabled} />

        <DeleteButton onClick={() => handleDelete(manager)} disabled={disabled}>
          {deletingId === manager._id ? 'Eliminando...' : 'Eliminar'}
        </DeleteButton>
      </>
    );
  };

  return (
    <PaginatedTable
      title='Listado de managers'
      actionError={error}
      list={list}
      columns={columns}
      itemLabel='managers'
      renderActions={renderActions}
    />
  );
};

export default ManagerTable;
