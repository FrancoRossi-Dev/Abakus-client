import { Link } from 'react-router';
import Logo from '../../components/brand/Logo';
import ThemeToggle from '../../components/shared/theme/ThemeToggle';
import { getToken } from '../../utils/utils';
import '../../components/shared/button/Button.css';

// Sin sesión: se ofrece ingresar. Con sesión pero sin permiso: volver al inicio.
const Unauthorized = () => {
  const hasSession = Boolean(getToken());

  return (
    <main className='standalone'>
      <ThemeToggle className='theme-toggle--floating' />
      <div className='standalone__card'>
        <Logo />
        <div className='standalone__text'>
          <span className='standalone__code'>Acceso restringido</span>
          <h1>No tenés acceso a esta sección</h1>
          <p>
            {hasSession ?
              'Tu usuario no tiene permisos para ver este contenido.'
            : 'Ingresá con tu cuenta para ver este contenido.'}
          </p>
        </div>
        <Link to={hasSession ? '/' : '/login'} className='button button--primary'>
          {hasSession ? 'Ir al inicio' : 'Ingresar'}
        </Link>
      </div>
    </main>
  );
};

export default Unauthorized;
