import { Link } from 'react-router';
import Logo from '../../components/brand/Logo';
import ThemeToggle from '../../components/shared/theme/ThemeToggle';
import '../../components/shared/button/Button.css';

const NotFound = () => (
  <main className='standalone'>
      <ThemeToggle className='theme-toggle--floating' />
    <div className='standalone__card'>
      <Logo />
      <div className='standalone__text'>
        <span className='standalone__code'>Error 404</span>
        <h1>No encontramos esta página</h1>
        <p>Puede que la dirección esté mal escrita o que la página ya no exista.</p>
      </div>
      <Link to='/' className='button button--primary'>
        Ir al inicio
      </Link>
    </div>
  </main>
);

export default NotFound;
