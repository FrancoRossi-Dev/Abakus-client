import { useState } from 'react';
import { useDispatch } from 'react-redux';
import backend from '../../api/backend';
import PaginatedTable from '../shared/table/PaginatedTable';
import EditButton from '../shared/button/EditButton';
import DeleteButton from '../shared/button/DeleteButton';
import { getRole } from '../../utils/utils';
import {
  managersActions,
  invalidateManagers,
  selectManagers,
} from '../../features/managers/managers.slice';

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

const ManagerTable = ({ onEdit }) => {
  const dispatch = useDispatch();

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

      const token = localStorage.getItem('abakus-token');

      await backend.delete(`/manager/${manager._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Actualiza solamente si el backend confirmo la baja.
      // Las páginas siguientes se corren un lugar: descarta la caché y
      // recarga la actual para completar el hueco con el siguiente manager
      dispatch(invalidateManagers());
    } catch (error) {
      setError(error.response?.data?.message || 'No se pudo eliminar el manager.');
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
    <div>
      {error && <p role='alert'>{error}</p>}

      <PaginatedTable
        endpoint='/manager'
        selectState={selectManagers}
        actions={managersActions}
        pageSize={15}
        columns={columns}
        itemLabel='managers'
        renderActions={renderActions}
      />
    </div>
  );
};

export default ManagerTable;
