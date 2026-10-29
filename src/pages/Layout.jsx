import { Outlet } from 'react-router';
import Logo from '../components/brand/Logo';

const Layout = () => {
  return (
    <>
      <header>
        <Logo />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
