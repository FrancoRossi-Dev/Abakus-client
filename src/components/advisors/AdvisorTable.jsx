import { useState } from 'react';
import { useDispatch } from 'react-redux';
import backend from '../../api/backend';
import PaginatedTable from '../shared/table/PaginatedTable';
import EditButton from '../shared/button/EditButton';
import DeleteButton from '../shared/button/DeleteButton';
import {
  advisorsActions,
  invalidateAdvisors,
  selectAdvisors,
} from '../../features/advisors/advisors.slice';

const PLAN_LABELS = { base: 'Base', premium: 'Premium' };

const formatDate = (value) => (value ? new Date(value).toLocaleString('es-UY') : '—');

const columns = [
  {
    key: 'comercialName',
    header: 'Nombre comercial',
    render: (advisor) => advisor.details?.comercialName ?? '—',
  },
  {
    key: 'legalName',
    header: 'Razón social',
    render: (advisor) => advisor.details?.legalName ?? '—',
  },
  { key: 'username', header: 'Usuario' },
  {
    key: 'contactEmail',
    header: 'Correo',
    render: (advisor) => advisor.details?.contactEmail ?? '—',
  },
  { key: 'phone', header: 'Teléfono', render: (advisor) => advisor.details?.phone ?? '—' },
  { key: 'country', header: 'País', render: (advisor) => advisor.details?.country || '—' },
  {
    key: 'planTier',
    header: 'Plan',
    render: (advisor) => PLAN_LABELS[advisor.planTier] ?? advisor.planTier,
  },
  {
    key: 'lastConnection',
    header: 'Última conexión',
    render: (advisor) => formatDate(advisor.lastConnection),
  },
];

const AdvisorTable = ({ onEdit }) => {
  const dispatch = useDispatch();

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (advisor) => {
    const name = advisor.details?.comercialName || advisor.username;
    const confirmed = window.confirm(`¿Querés eliminar al advisor ${name}?`);

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      setDeletingId(advisor._id);

      // El token lo agrega el interceptor de backend.js.
      // La API rechaza la baja (409) si el advisor todavía tiene clientes o managers activos.
      await backend.delete(`/user/advisors/${advisor._id}`);

      // Las páginas siguientes se corren un lugar: descarta la caché y recarga la actual
      dispatch(invalidateAdvisors());
    } catch (error) {
      setError(error.userMessage || 'No se pudo eliminar el advisor.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderActions = (advisor, { isLoading }) => {
    const disabled = deletingId !== null || isLoading;

    return (
      <>
        <EditButton onClick={() => onEdit(advisor)} disabled={disabled} />

        <DeleteButton onClick={() => handleDelete(advisor)} disabled={disabled}>
          {deletingId === advisor._id ? 'Eliminando...' : 'Eliminar'}
        </DeleteButton>
      </>
    );
  };

  return (
    <PaginatedTable
      title='Advisors registrados'
      actionError={error}
      endpoint='/user/advisors'
      selectState={selectAdvisors}
      actions={advisorsActions}
      pageSize={15}
      columns={columns}
      itemLabel='advisors'
      renderActions={renderActions}
    />
  );
};

export default AdvisorTable;
