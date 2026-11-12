import { formatAmount } from '../../utils/format';

// Las tres cifras principales de la cartera
const ReportMetrics = ({ totalMarketValue, instrumentCount, positionCount, bankTotals }) => (
  <dl className='metrics'>
    <div className='metric'>
      <dt className='metric__label'>Valor consolidado</dt>
      <dd className='metric__value'>
        <span className='metric__unit'>USD</span>
        {formatAmount(totalMarketValue)}
      </dd>
      <dd className='metric__context'>Últimas posiciones de cada cuenta</dd>
    </div>

    <div className='metric'>
      <dt className='metric__label'>Instrumentos</dt>
      <dd className='metric__value'>{instrumentCount}</dd>
      <dd className='metric__context'>{positionCount} posiciones informadas</dd>
    </div>

    <div className='metric'>
      <dt className='metric__label'>Bancos</dt>
      <dd className='metric__value'>{bankTotals.length}</dd>
      {/* bankTotals viene ordenado de mayor a menor: el primero es el de mayor exposición */}
      <dd className='metric__context'>Mayor exposición: {bankTotals[0]?.name ?? '—'}</dd>
    </div>
  </dl>
);

export default ReportMetrics;
