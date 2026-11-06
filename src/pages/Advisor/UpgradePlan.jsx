import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import backend from '../../api/backend';
import '../../components/shared/button/Button.css';
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

const UsageBar = ({ label, used, limit }) => {
  const percent = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className='upgrade-plan__usage'>
      <div className='upgrade-plan__usage-header'>
        <span>{label}</span>
        <span>{limit ? `${used} / ${limit}` : `${used} (sin límite)`}</span>
      </div>
      {limit && (
        <div
          className='upgrade-plan__bar'
          role='progressbar'
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}>
          <div
            className={`upgrade-plan__bar-fill${used >= limit ? ' upgrade-plan__bar-fill--full' : ''}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
};

const UpgradePlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  // devuelve { planTier, used, limit, clientsRegistered }
  const fetchPlan = () =>
    backend
      .get('/user/me/plan')
      .then(({ data }) => {
        setPlan(data);
        setError('');
      })
      .catch((err) => setError(err.userMessage || 'No se pudo cargar tu plan.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    let ignore = false;
    backend
      .get('/user/me/plan')
      .then(({ data }) => !ignore && setPlan(data))
      .catch((err) => !ignore && setError(err.userMessage || 'No se pudo cargar tu plan.'))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, []);

  const upgradePlan = async () => {
    setUpgrading(true);
    try {
      await backend.patch('/user/me/plan', { planTier: 'premium' });
      toast.success('¡Listo! Ya estás en el plan Premium.');
      // vuelve a pedir el uso para que el límite quede actualizado
      await fetchPlan();
    } catch (err) {
      toast.error(err.userMessage || 'No se pudo actualizar el plan.');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div className='page'><p>Cargando plan...</p></div>;
  if (error) return <div className='page'><p role='alert'>{error}</p></div>;

  const isPremium = plan.planTier === 'premium';
  // si ya es premium la API manda limit null; para la tabla se muestra el límite base por defecto
  const baseLimit = plan.limit ?? 4;
  const features = getFeatures(baseLimit);

  return (
    <div className='page upgrade-plan'>
      <h1>Mi plan: {PLAN_NAMES[plan.planTier] ?? plan.planTier}</h1>

      <section className='upgrade-plan__card'>
        <h2>Uso actual</h2>
        <UsageBar label='Clientes activos' used={plan.clientsRegistered} limit={plan.limit} />
        <UsageBar label='Cuentas bancarias activas' used={plan.used} limit={plan.limit} />
      </section>

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

      {isPremium ? (
        <p className='upgrade-plan__done'>Ya tenés el plan Premium: no hay límites en tu cuenta.</p>
      ) : (
        <button
          type='button'
          className='button button--primary'
          onClick={upgradePlan}
          disabled={upgrading}>
          {upgrading ? 'Actualizando...' : 'Actualizar a plan premium'}
        </button>
      )}
    </div>
  );
};

export default UpgradePlan;
