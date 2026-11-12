import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowRight } from 'react-icons/fi';
import backend from '../api/backend';
import { getRole } from '../utils/utils';
import { selectUser, setPlan, setUser } from '../features/account/account.slice';
import './Home.css';

const PLAN_NAMES = { base: 'Base', premium: 'Premium' };

const dateFormatter = new Intl.DateTimeFormat('es-UY', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

// Solo se necesita el total de un listado paginado: se pide una página de un elemento
const countOf = (endpoint) =>
  backend.get(endpoint, { params: { limit: 1 } }).then(({ data }) => data.total);

// Cada estadística se resuelve por separado: si una falla, se muestra "—" y el resto sigue
const settle = (results) => results.map((result) => (result.status === 'fulfilled' ? result.value : null));

// El advisor ve el uso de su plan (que también se guarda en Redux) y cuántos managers tiene
const loadAdvisorStats = async (dispatch) => {
  const [plan, managers] = settle(
    await Promise.allSettled([backend.get('/user/me/plan').then(({ data }) => data), countOf('/manager')]),
  );
  if (plan) dispatch(setPlan(plan));

  const limit = plan?.limit ?? null;
  const planName = plan ? (PLAN_NAMES[plan.planTier] ?? plan.planTier) : null;

  return {
    summary:
      plan && limit ?
        `Tenés ${plan.clientsRegistered} de ${limit} clientes disponibles en tu plan ${planName}.`
      : plan ? `Tu plan ${planName} no tiene límite de clientes ni de cuentas.`
      : null,
    stats: [
      {
        to: '/clients',
        label: 'Clientes activos',
        value: plan?.clientsRegistered,
        context: limit ? `de ${limit} en tu plan` : plan ? 'Sin límite' : null,
      },
      {
        to: '/clients',
        label: 'Cuentas bancarias activas',
        value: plan?.used,
        context: limit ? `de ${limit} en tu plan` : plan ? 'Sin límite' : null,
      },
      { to: '/managers', label: 'Managers', value: managers, context: 'Responsables de tus clientes' },
      {
        to: '/upgrade',
        label: 'Plan',
        value: planName,
        context: plan?.planTier === 'premium' ? 'Sin límites' : plan ? 'Ver opciones de plan' : null,
      },
    ],
  };
};

const loadAdminStats = async () => {
  const [advisors, managers, banks, issuers, instruments] = settle(
    await Promise.allSettled([
      countOf('/user/advisors'),
      countOf('/manager'),
      countOf('/bank'),
      countOf('/issuer'),
      countOf('/instrument'),
    ]),
  );

  return {
    summary: advisors != null ? `Hay ${advisors} ${advisors === 1 ? 'firma registrada' : 'firmas registradas'} en Abakus.` : null,
    stats: [
      { to: '/advisors', label: 'Advisors', value: advisors, context: 'Firmas registradas' },
      { to: '/managers', label: 'Managers', value: managers, context: 'De todas las firmas' },
      { to: '/banks', label: 'Bancos', value: banks, context: 'En el catálogo' },
      { to: '/issuers', label: 'Emisores', value: issuers, context: 'En el catálogo' },
      { to: '/instruments', label: 'Instrumentos', value: instruments, context: 'En el catálogo' },
    ],
  };
};

// Indicador que lleva a su sección. Un dato que no llegó se muestra como "—", nunca como 0 (spec §11)
const StatCard = ({ to, label, value, context }) => {
  const isMissing = value === null || value === undefined;
  return (
    <Link to={to} className='metric stat-card'>
      <span className='metric__label'>{label}</span>
      <span className='metric__value'>{isMissing ? '—' : value}</span>
      <span className='metric__context stat-card__context'>
        {isMissing ? 'No disponible' : context}
        <FiArrowRight className='stat-card__arrow' aria-hidden='true' />
      </span>
    </Link>
  );
};

const StatSkeleton = () => (
  <div className='metric skeleton' aria-hidden='true'>
    <span className='skeleton__line skeleton__line--short' />
    <span className='skeleton__line skeleton__line--title' />
    <span className='skeleton__line skeleton__line--short' />
  </div>
);

const Home = () => {
  const role = getRole();
  const isAdmin = role === 'admin';
  const dispatch = useDispatch();

  // El usuario vive en Redux (lo comparten Mi cuenta y Mi plan); si falla, el saludo va sin nombre
  const user = useSelector(selectUser);
  const name = user?.details?.comercialName || user?.username || '';

  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;

    backend
      .get('/user/me')
      .then(({ data: me }) => !ignore && dispatch(setUser(me)))
      .catch(() => {
        // el saludo funciona igual sin nombre
      });

    (isAdmin ? loadAdminStats() : loadAdvisorStats(dispatch)).then((result) => !ignore && setData(result));

    return () => {
      ignore = true;
    };
  }, [dispatch, isAdmin]);

  const today = dateFormatter.format(new Date());
  const skeletonCount = isAdmin ? 5 : 4;

  return (
    <div className='page'>
      <section className='welcome' aria-labelledby='welcome-title'>
        <p className='welcome__date'>{today.charAt(0).toUpperCase() + today.slice(1)}</p>
        <h1 id='welcome-title' className='welcome__title'>
          {name ? `Hola, ${name}` : 'Te damos la bienvenida'}
        </h1>
        <p className='welcome__text'>
          {data?.summary ??
            (isAdmin ?
              'Administrá los catálogos y las firmas que usan Abakus.'
            : 'Tu cartera de clientes, consolidada en un solo lugar.')}
        </p>
      </section>

      <section aria-labelledby='stats-title' aria-busy={!data}>
        <h2 id='stats-title' className='sr-only'>
          Resumen
        </h2>
        <div className='metrics'>
          {data ?
            data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)
          : Array.from({ length: skeletonCount }, (_, index) => <StatSkeleton key={index} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;
