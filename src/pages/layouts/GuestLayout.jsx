import { Navigate, Outlet } from 'react-router';
import Logo from '../../components/brand/Logo';
import ThemeToggle from '../../components/shared/theme/ThemeToggle';
import { getToken } from '../../utils/utils';
import './GuestLayout.css';

// Layout de las páginas públicas (login / registro): fondo, contenido centrado y marca.
// Es el inverso de AuthWrapper: si ya hay sesión, lleva directo al inicio.
const GuestLayout = () => {
  const isAuth = getToken();

  if (isAuth) {
    return <Navigate to='/' replace />;
  }

  return (
    <div className='guest'>
      <main className='guest__main'>
        <ThemeToggle className='theme-toggle--floating' />
        <Logo className='guest__brand' />
        <Outlet />
      </main>
    </div>
  );
};

export default GuestLayout;
