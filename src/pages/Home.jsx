import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiLayers,
  FiStar,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import { MdOutlineAccountBalance } from 'react-icons/md';
import backend from '../api/backend';
import PageHeader from '../components/shared/page/PageHeader';
import { getRole } from '../utils/utils';
import './Home.css';

// Accesos directos por rol: qué se puede hacer en cada sección, en una línea
const SHORTCUTS = {
  advisor: [
    {
      to: '/clients',
      icon: FiUsers,
      title: 'Clientes',
      text: 'Registrá clientes, sus cuentas e importá posiciones.',
    },
    {
      to: '/reports',
      icon: FiBarChart2,
      title: 'Reportes',
      text: 'Composición de cada cartera y noticias que pueden afectarla.',
    },
    {
      to: '/managers',
      icon: FiUserCheck,
      title: 'Managers',
      text: 'Administrá los responsables de tus clientes.',
    },
    {
      to: '/upgrade',
      icon: FiStar,
      title: 'Mi plan',
      text: 'Consultá tu uso y los límites de tu plan.',
    },
  ],
  admin: [
    {
      to: '/advisors',
      icon: FiBriefcase,
      title: 'Advisors',
      text: 'Altas, bajas y planes de las firmas registradas.',
    },
    {
      to: '/banks',
      icon: MdOutlineAccountBalance,
      title: 'Bancos',
      text: 'Catálogo de bancos disponibles para las cuentas.',
    },
    {
      to: '/issuers',
      icon: FiLayers,
      title: 'Emisores',
      text: 'Catálogo de emisores de instrumentos.',
    },
    {
      to: '/instruments',
      icon: FiBarChart2,
      title: 'Instrumentos',
      text: 'Catálogo de instrumentos identificados por ISIN.',
    },
    {
      to: '/managers',
      icon: FiUserCheck,
      title: 'Managers',
      text: 'Managers de todas las firmas.',
    },
  ],
};

const Home = () => {
  const role = getRole();
  const [name, setName] = useState('');

  useEffect(() => {
    let ignore = false;
    backend
      .get('/user/me')
      .then(({ data }) => !ignore && setName(data.details?.comercialName || data.username || ''))
      .catch(() => {
        // el saludo es opcional: sin nombre la página sigue siendo útil
      });
    return () => {
      ignore = true;
    };
  }, []);

  const shortcuts = SHORTCUTS[role] ?? [];

  return (
    <div className='page'>
      <PageHeader
        title={name ? `Hola, ${name}` : 'Inicio'}
        subtitle={
          role === 'admin' ?
            'Administrá los catálogos y las firmas que usan Abakus.'
          : 'Tu cartera de clientes, consolidada en un solo lugar.'
        }
      />

      <nav aria-label='Accesos directos'>
        <ul className='shortcuts'>
          {shortcuts.map(({ to, icon: Icon, title, text }) => (
            <li key={to}>
              <Link to={to} className='shortcut'>
                <Icon className='shortcut__icon' aria-hidden='true' />
                <span className='shortcut__body'>
                  <span className='shortcut__title'>{title}</span>
                  <span className='shortcut__text'>{text}</span>
                </span>
                <FiArrowRight className='shortcut__arrow' aria-hidden='true' />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Home;
