import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../../components/shared/page/PageHeader';
import LoadingState from '../../components/shared/page/LoadingState';
import ErrorState from '../../components/shared/page/ErrorState';
import PlanUsage from '../../components/plan/PlanUsage';
import PlanUpgrade from '../../components/plan/PlanUpgrade';
import backend from '../../api/backend';
import { selectPlan, setPlan } from '../../features/account/account.slice';
import './UpgradePlan.css';

const PLAN_NAMES = { base: 'Base', premium: 'Premium' };

// Tabla comercial: el límite del plan base lo devuelve la API (limit), el resto es fijo
const getFeatures = (baseLimit) => [
  { label: 'Clientes activos', base: `Hasta ${baseLimit}`, premium: 'Ilimitados' },
  { label: 'Cuentas bancarias activas', base: `Hasta ${baseLimit}`, premium: 'Ilimitadas' },
  { label: 'Gestión de posiciones', base: true, premium: true },
  { label: 'Reportes de cartera', base: true, premium: true },
  { label: 'Crecimiento sin restricciones', base: false, premium: true },
];

const renderValue = (value) => {
  if (value === true) return <span className='upgrade-plan__yes' aria-label='Incluido'>✓</span>;
  if (value === false) return <span className='upgrade-plan__no' aria-label='No incluido'>—</span>;
  return value;
};

const UpgradePlan = () => {
  const dispatch = useDispatch();
  const plan = useSelector(selectPlan);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Siempre se pide de nuevo: el uso cambia al registrar o borrar clientes y cuentas
  useEffect(() => {
    let ignore = false;
    backend
      .get('/user/me/plan')
      .then(({ data }) => !ignore && dispatch(setPlan(data)))
      .catch((err) => !ignore && setError(err.userMessage || 'No se pudo cargar tu plan.'));
    return () => {
      ignore = true;
    };
  }, [dispatch, reloadKey]);

  const handleRetry = () => {
    setError('');
    setReloadKey((key) => key + 1);
  };

  // Si ya había un plan cargado (de otra página) se muestra mientras se actualiza
  if (!plan && !error) {
    return (
      <div className='page'>
        <LoadingState label='Cargando tu plan...' />
      </div>
    );
  }
  if (!plan) {
    return (
      <div className='page'>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  const isPremium = plan.planTier === 'premium';
  // si ya es premium la API manda limit null; para la tabla se muestra el límite base por defecto
  const features = getFeatures(plan.limit ?? 4);

  return (
    <div className='page upgrade-plan'>
      <PageHeader
        title={`Mi plan: ${PLAN_NAMES[plan.planTier] ?? plan.planTier}`}
        subtitle='Revisá cuánto usás de tu plan y compará lo que incluye cada uno.'
      />

      <PlanUsage />

      <section className='upgrade-plan__card'>
        <h2>Compará los planes</h2>
        <table className='upgrade-plan__table'>
          <thead>
            <tr>
              <th scope='col'>Característica</th>
              <th scope='col' className={!isPremium ? 'upgrade-plan__current' : undefined}>
                Base {!isPremium && <span className='upgrade-plan__badge'>Actual</span>}
              </th>
              <th scope='col' className={isPremium ? 'upgrade-plan__current' : undefined}>
                Premium {isPremium && <span className='upgrade-plan__badge'>Actual</span>}
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.label}>
                <th scope='row'>{feature.label}</th>
                <td>{renderValue(feature.base)}</td>
                <td>{renderValue(feature.premium)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <PlanUpgrade />
    </div>
  );
};

export default UpgradePlan;
