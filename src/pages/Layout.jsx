import { NavLink, Outlet, useNavigate } from 'react-router';
import Logo from '../components/brand/Logo';
import './Layout.css';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/clients', label: 'Clientes' },
  { to: '/account', label: 'Cuenta' },
  { to: '/managers', label: 'Managers' },
  // Planned pages
  { to: '/banks', label: 'Bancos' },
  { to: '/issuers', label: 'Emisores' },
  { to: '/instruments', label: 'Instrumentos' },
  { to: '/positions', label: 'Posiciones' },
];

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('abakus-token');
    navigate('/login', { replace: true });
  };

  return (
    <div className='layout'>
      <aside className='sidebar'>
        <Logo />
        <nav className='sidebar__nav'>
          <ul>
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <button type='button' onClick={handleLogout}>
          Cerrar sesión
        </button>
      </aside>
      <main className='layout__main'>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
