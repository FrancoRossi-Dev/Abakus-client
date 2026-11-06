import { NavLink, Outlet, useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import Logo from '../../components/brand/Logo';
import { clearManagers } from '../../features/managers/managers.slice';
import { clearBanks } from '../../features/banks/banks.slice';
import { clearIssuers } from '../../features/issuers/issuers.slice';
import { clearInstruments } from '../../features/instruments/instruments.slice';
import { clearAdvisors } from '../../features/advisors/advisors.slice';
import './Layout.css';
import { getRole, logout } from '../../utils/utils';

// Reads the role from the JWT payload (the API signs { id, role }).
// This only decides what the sidebar shows; the API still enforces access.

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // revisa rol y habilita navegacion dependiendo de lo que diga el token
  const role = getRole();
  const isAdmin = role === 'admin';
  const isAdvisor = role === 'advisor';

  const handleLogout = () => {
    logout();
    // esto es para borrar el cache
    dispatch(clearManagers());
    dispatch(clearBanks());
    dispatch(clearIssuers());
    dispatch(clearInstruments());
    dispatch(clearAdvisors());
    navigate('/login', { replace: true });
  };

  return (
    <div className='layout'>
      <aside className='sidebar'>
        <Logo />
        <nav className='sidebar__nav'>
          <ul>
            <li>
              <NavLink to='/' end>
                Inicio
              </NavLink>
            </li>

            {isAdvisor && (
              <>
                <li>
                  <NavLink to='/clients'>Clientes</NavLink>
                </li>
                <li>
                  <NavLink to='/managers'>Managers</NavLink>
                </li>
                <li>
                  <NavLink to='/positions'>Posiciones</NavLink>
                </li>
                <li>
                  <NavLink to='/account'>Cuenta</NavLink>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                <li>
                  <NavLink to='/managers'>Managers</NavLink>
                </li>
                <li>
                  <NavLink to='/advisors'>Advisors</NavLink>
                </li>
                <li>
                  <NavLink to='/banks'>Bancos</NavLink>
                </li>
                <li>
                  <NavLink to='/issuers'>Emisores</NavLink>
                </li>
                <li>
                  <NavLink to='/instruments'>Instrumentos</NavLink>
                </li>
              </>
            )}

            {(isAdmin || isAdvisor) && (
              <li>
                <NavLink to='/instruments'>Instrumentos</NavLink>
              </li>
            )}
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
