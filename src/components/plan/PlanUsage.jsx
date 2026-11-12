import { useSelector } from 'react-redux';
import { selectPlan } from '../../features/account/account.slice';
import './PlanUsage.css';

const getPercent = (used, limit) => Math.min(100, Math.round((used / limit) * 100));

// Plan con límite: porcentaje usado + barra. Plan sin límite: solo la cantidad.
const UsageItem = ({ label, used, limit }) => {
  if (limit === null) {
    return (
      <div className='plan-usage__item'>
        <div className='plan-usage__header'>
          <span>{label}</span>
          <span className='plan-usage__value'>{used}</span>
        </div>
        <p className='plan-usage__detail'>Sin límite en tu plan</p>
      </div>
    );
  }

  const percent = getPercent(used, limit);
  const isFull = used >= limit;

  return (
    <div className='plan-usage__item'>
      <div className='plan-usage__header'>
        <span>{label}</span>
        <span className='plan-usage__value'>{percent} %</span>
      </div>
      <div
        className='plan-usage__bar'
        role='progressbar'
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${percent} % usado (${used} de ${limit})`}>
        <div
          className={`plan-usage__bar-fill${isFull ? ' plan-usage__bar-fill--full' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className='plan-usage__detail'>
        {used} de {limit} usados{isFull && ' · Llegaste al límite de tu plan'}
      </p>
    </div>
  );
};

// Informe de uso: lee el plan del estado global (lo carga la página que lo muestra)
const PlanUsage = () => {
  const plan = useSelector(selectPlan);
  if (!plan) return null;

  return (
    <section className='plan-usage' aria-labelledby='plan-usage-title'>
      <h2 id='plan-usage-title'>Uso actual</h2>
      <UsageItem label='Clientes activos' used={plan.clientsRegistered} limit={plan.limit} />
      <UsageItem label='Cuentas bancarias activas' used={plan.used} limit={plan.limit} />
    </section>
  );
};

export default PlanUsage;
