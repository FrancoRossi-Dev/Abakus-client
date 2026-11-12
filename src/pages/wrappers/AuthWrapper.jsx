import { Navigate, Outlet, useLocation } from 'react-router';
import { getToken, getRole } from '../../utils/utils';

const AuthWrapper = ({allowedRoles}) => {
  const isAuth = getToken();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }
  if (allowedRoles && !allowedRoles.includes(getRole())) {
  return <Navigate to='/unauthorized' replace />;
  }

  return <Outlet />;
};

export default AuthWrapper;
