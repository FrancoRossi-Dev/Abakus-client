import AssetAllocationChart from './AssetAllocation';
import { formatUSD } from '../../utils/format';

// Tarjeta con la torta de composición por tipo de activo.
const AllocationCard = ({ byInstrumentType, scopeLabel, marketValue }) => (
  <section className='card' aria-labelledby='allocation-title'>
    <header className='card__header'>
      <div className='card__heading'>
        <h3 id='allocation-title' className='card__title'>
          Composición por tipo de activo
        </h3>
        <p className='card__subtitle'>
          {scopeLabel} · {formatUSD(marketValue)}
        </p>
      </div>
    </header>
    <AssetAllocationChart byInstrumentType={byInstrumentType} />
  </section>
);

export default AllocationCard;
