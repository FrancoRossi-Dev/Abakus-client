import { formatPercent, formatUSD } from '../../utils/format';

// Un botón por banco (más "Todos los bancos") para filtrar el reporte.
// No guarda estado: el banco elegido lo maneja el padre y llega por props
const BankFilter = ({ bankTotals, totalMarketValue, selectedBankId, onSelect }) => {
  // id null = todos los bancos
  const options = [{ id: null, name: 'Todos los bancos', marketValue: totalMarketValue }, ...bankTotals];

  return (
    <section className='bank-filter' aria-labelledby='bank-filter-title'>
      <h3 id='bank-filter-title' className='bank-filter__title'>
        Ver por banco
      </h3>

      <div className='bank-filter__options'>
        {options.map((bank) => (
          <button
            key={bank.id ?? 'total'}
            type='button'
            className='bank-filter__option'
            aria-pressed={selectedBankId === bank.id}
            onClick={() => onSelect(bank.id)}>
            <span className='bank-filter__name'>{bank.name}</span>
            <span className='bank-filter__value'>{formatUSD(bank.marketValue)}</span>
            {bank.id !== null && (
              <span className='bank-filter__share'>
                {formatPercent(totalMarketValue ? (bank.marketValue / totalMarketValue) * 100 : 0)}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
};

export default BankFilter;
