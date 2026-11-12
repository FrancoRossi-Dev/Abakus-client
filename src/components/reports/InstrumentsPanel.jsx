import { useState } from 'react';
import DataTable from '../shared/table/DataTable';
import ShareBar from './ShareBar';
import { formatAmount, formatPercent } from '../../utils/format';

// Ordena por nombre (alfabético) o por valor de mercado
const sortInstruments = (instruments, sort) => {
  const factor = sort.direction === 'asc' ? 1 : -1;

  return [...instruments].sort((a, b) => {
    if (sort.key === 'name') {
      return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }) * factor;
    }
    return (a.marketValue - b.marketValue) * factor;
  });
};

// Tabla de instrumentos de la cartera. El orden de la tabla es estado propio de este componente
const InstrumentsPanel = ({ instruments, scopeLabel, selectedBankName }) => {
  const [sort, setSort] = useState({ key: 'marketValue', direction: 'desc' });

  // Clic en la misma columna: invierte el orden. En otra columna: empieza con su orden natural
  const handleSort = (key) => {
    if (sort.key === key) {
      setSort({ key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ key, direction: key === 'name' ? 'asc' : 'desc' });
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Instrumento',
      sortable: true,
      render: (row) => (
        <div className='cell-identity'>
          <span className='cell-identity__primary'>{row.name}</span>
          <span className='cell-identity__secondary'>{row.isin ?? 'Sin ISIN'}</span>
        </div>
      ),
    },
    {
      key: 'marketValue',
      header: 'Valor de mercado (USD)',
      align: 'end',
      sortable: true,
      render: (row) => formatAmount(row.marketValue),
    },
    {
      key: 'percentage',
      header: selectedBankName ? `% en ${selectedBankName}` : '% de la cartera',
      align: 'end',
      render: (row) => (
        <span className='share-cell'>
          <ShareBar value={row.percentage} />
          {formatPercent(row.percentage)}
        </span>
      ),
    },
  ];

  return (
    <section className='panel' aria-labelledby='instruments-title'>
      <div className='panel__toolbar'>
        <div className='panel__heading'>
          <h3 id='instruments-title' className='panel__title'>
            Instrumentos de la cartera
          </h3>
          <p className='panel__count'>
            {scopeLabel} · {instruments.length}{' '}
            {instruments.length === 1 ? 'instrumento' : 'instrumentos'}
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={sortInstruments(instruments, sort)}
        getRowKey={(row) => row.id ?? 'unknown'}
        sort={sort}
        onSort={handleSort}
        itemLabel='instrumentos'
      />
    </section>
  );
};

export default InstrumentsPanel;
