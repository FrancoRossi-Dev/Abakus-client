import { Link } from 'react-router';
import AuthCard from '../components/auth/AuthCard';
import LoginForm from '../components/login/LoginForm';

const Login = () => {
  return (
    <div className='login-page'>
    <AuthCard
      title='Iniciar sesión'
      description='Ingresá con tu usuario y contraseña.'
      footer={
        <>
          ¿Todavía no tenés cuenta? <Link to='/register'>Registrá tu firma</Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
    </div>
  );
};

export default Login;
