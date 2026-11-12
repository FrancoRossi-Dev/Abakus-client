import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar } from 'react-icons/fi';
import backend from '../api/backend';
import { selectUser, setUser } from '../features/account/account.slice';
import PageHeader from '../components/shared/page/PageHeader';
import LoadingState from '../components/shared/page/LoadingState';
import ErrorState from '../components/shared/page/ErrorState';
import { formatDateTime } from '../utils/format';

const PLAN_NAMES = { base: 'Base', premium: 'Premium' };

const DETAIL_FIELDS = [
  ['comercialName', 'Nombre comercial'],
  ['legalName', 'Razón social'],
  ['document', 'Documento'],
  ['phone', 'Teléfono'],
  ['contactEmail', 'Correo de contacto'],
  ['address', 'Dirección'],
  ['country', 'País'],
];

// Dato ausente ≠ vacío: se indica explícitamente (spec §11)
const Value = ({ children }) => children || <span className='cell-muted'>Sin dato</span>;

const Accounts = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // Se vuelve a pedir al entrar para mostrar los datos al día (ej. el plan después de un cambio)
  useEffect(() => {
    let ignore = false;
    backend
      .get('/user/me')
      .then(({ data }) => !ignore && dispatch(setUser(data)))
      .catch((err) => !ignore && setError(err.userMessage || 'No se pudieron cargar tus datos.'));
    return () => {
      ignore = true;
    };
  }, [dispatch, reloadKey]);

  const handleRetry = () => {
    setError('');
    setReloadKey((key) => key + 1);
  };

  return (
    <div className='page'>
      <PageHeader title='Mi cuenta' subtitle='Datos de acceso y de tu firma registrados en Abakus.' />

      {!user && !error && <LoadingState label='Cargando tus datos...' />}
      {error && <ErrorState message={error} onRetry={handleRetry} />}

      {user && (
        <>
          <section className='card' aria-labelledby='account-access'>
            <header className='card__header'>
              <h2 id='account-access' className='card__title'>
                Acceso
              </h2>
            </header>
            <dl className='details-list'>
              <div>
                <dt>Usuario</dt>
                <dd>{user.username}</dd>
              </div>
              {user.planTier && (
                <div>
                  <dt>Plan</dt>
                  <dd>
                    {PLAN_NAMES[user.planTier] ?? user.planTier}
                    {user.planTier !== 'premium' && (
                      <Link to='/upgrade' className='details-list__action'>
                        <FiStar aria-hidden='true' /> Ver planes
                      </Link>
                    )}
                  </dd>
                </div>
              )}
              {user.createdAt && (
                <div>
                  <dt>Cuenta creada</dt>
                  <dd>{formatDateTime(user.createdAt)}</dd>
                </div>
              )}
            </dl>
          </section>

          {user.details && (
            <section className='card' aria-labelledby='account-firm'>
              <header className='card__header'>
                <h2 id='account-firm' className='card__title'>
                  Datos de la firma
                </h2>
              </header>
              <dl className='details-list'>
                {DETAIL_FIELDS.map(([key, label]) => (
                  <div key={key}>
                    <dt>{label}</dt>
                    <dd>
                      <Value>{user.details[key]}</Value>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Accounts;
