import { useState } from 'react';
import { useDispatch } from 'react-redux';
import backend from '../../api/backend';
import PaginatedTable from '../shared/table/PaginatedTable';
import EditButton from '../shared/button/EditButton';
import DeleteButton from '../shared/button/DeleteButton';
import {
  issuersActions,
  invalidateIssuers,
  selectIssuers,
} from '../../features/issuers/issuers.slice';

const columns = [
  { key: 'commercialName', header: 'Nombre comercial' },
  { key: 'legalName', header: 'Razón social' },
  { key: 'country', header: 'País', render: (issuer) => issuer.country || '—' },
  { key: 'address', header: 'Dirección', render: (issuer) => issuer.address || '—' },
];

const IssuerTable = ({ onEdit }) => {
  const dispatch = useDispatch();

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (issuer) => {
    const confirmed = window.confirm(`¿Querés eliminar el emisor ${issuer.commercialName}?`);

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      setDeletingId(issuer._id);

      // El token lo agrega el interceptor de backend.js
      await backend.delete(`/issuer/${issuer._id}`);

      // Las páginas siguientes se corren un lugar: descarta la caché y recarga la actual
      dispatch(invalidateIssuers());
    } catch (error) {
      setError(error.userMessage || 'No se pudo eliminar el emisor.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderActions = (issuer, { isLoading }) => {
    const disabled = deletingId !== null || isLoading;

    return (
      <>
        <EditButton onClick={() => onEdit(issuer)} disabled={disabled} />

        <DeleteButton onClick={() => handleDelete(issuer)} disabled={disabled}>
          {deletingId === issuer._id ? 'Eliminando...' : 'Eliminar'}
        </DeleteButton>
      </>
    );
  };

  return (
    <div>
      {error && <p role='alert'>{error}</p>}

      <PaginatedTable
        endpoint='/issuer'
        selectState={selectIssuers}
        actions={issuersActions}
        pageSize={15}
        columns={columns}
        itemLabel='emisores'
        renderActions={renderActions}
      />
    </div>
  );
};

export default IssuerTable;
