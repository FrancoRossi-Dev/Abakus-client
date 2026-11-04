import { Link } from 'react-router';
import AuthCard from '../components/auth/AuthCard';
import RegisterForm from '../components/register/RegisterForm';

const Register = () => {
  return (
    <AuthCard
      size='wide'
      title='Crear cuenta'
      description='Registrá tu firma asesora para empezar a usar Abakus.'
      footer={
        <>
          ¿Ya tenés cuenta? <Link to='/login'>Iniciá sesión</Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
};

export default Register;
