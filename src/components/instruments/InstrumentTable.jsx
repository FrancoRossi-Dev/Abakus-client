import { useState } from 'react';
import { useDispatch } from 'react-redux';
import backend from '../../api/backend';
import { INSTRUMENT_TYPE_LABELS } from '../../constants/constants';
import PaginatedTable from '../shared/table/PaginatedTable';
import EditButton from '../shared/button/EditButton';
import DeleteButton from '../shared/button/DeleteButton';
import {
  instrumentsActions,
  invalidateInstruments,
  selectInstruments,
} from '../../features/instruments/instruments.slice';

const columns = [
  { key: 'name', header: 'Nombre' },
  {
    key: 'type',
    header: 'Tipo',
    render: (instrument) => INSTRUMENT_TYPE_LABELS[instrument.type] ?? instrument.type ?? '—',
  },
  { key: 'ticker', header: 'Ticker', render: (instrument) => instrument.ticker || '—' },
  { key: 'isin', header: 'ISIN', render: (instrument) => instrument.isin || '—' },
  { key: 'exchCode', header: 'Mercado', render: (instrument) => instrument.exchCode || '—' },
];

const InstrumentTable = ({ onEdit }) => {
  const dispatch = useDispatch();

  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (instrument) => {
    const confirmed = window.confirm(`¿Querés eliminar el instrumento ${instrument.name}?`);

    if (!confirmed) {
      return;
    }

    setError('');

    try {
      setDeletingId(instrument._id);

      // El token lo agrega el interceptor de backend.js
      await backend.delete(`/instrument/${instrument._id}`);

      // Las páginas siguientes se corren un lugar: descarta la caché y recarga la actual
      dispatch(invalidateInstruments());
    } catch (error) {
      setError(error.userMessage || 'No se pudo eliminar el instrumento.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderActions = (instrument, { isLoading }) => {
    const disabled = deletingId !== null || isLoading;

    return (
      <>
        <EditButton onClick={() => onEdit(instrument)} disabled={disabled} />

        <DeleteButton onClick={() => handleDelete(instrument)} disabled={disabled}>
          {deletingId === instrument._id ? 'Eliminando...' : 'Eliminar'}
        </DeleteButton>
      </>
    );
  };

  return (
    <PaginatedTable
      title='Catálogo de instrumentos'
      actionError={error}
      endpoint='/instrument'
      selectState={selectInstruments}
      actions={instrumentsActions}
      pageSize={15}
      columns={columns}
      itemLabel='instrumentos'
      renderActions={renderActions}
    />
  );
};

export default InstrumentTable;
