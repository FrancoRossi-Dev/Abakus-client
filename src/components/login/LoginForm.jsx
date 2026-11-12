import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { loginSchema } from '../../validators/auth.validators';
import backend from '../../api/backend';
import { setToken } from '../../utils/utils';
import { setUser } from '../../features/account/account.slice';
import FormField from '../shared/form/FormField';
import FormAlert from '../shared/form/FormAlert';
import '../shared/button/Button.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formId = useId();
  const hintId = `${formId}-submit-hint`;
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(loginSchema),
    // Muestra el error recién al salir del campo y lo retira apenas se corrige
    mode: 'onTouched',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleLogin = async (data) => {
    setError('');

    try {
      const response = await backend.post('/auth/login', data);

      setToken(response.data.token);
      dispatch(setUser(response.data.user));
      navigate('/');
    } catch (error) {
      setError(
        error.userMessage ||
          'No fue posible iniciar sesión. Intentá de nuevo en unos minutos.'
      );
    }
  };

  // Spec: el botón queda desactivado mientras falten datos; explicamos por qué
  const showSubmitHint = !isValid && !isSubmitting;

  return (
    <form className='auth-form' onSubmit={handleSubmit(handleLogin)} noValidate>
      <div className='auth-form__fields'>
        <FormField
          id={`${formId}-username`}
          label='Usuario'
          autoComplete='username'
          autoCapitalize='none'
          spellCheck={false}
          autoFocus
          error={errors.username?.message}
          {...register('username')}
        />

        <FormField
          id={`${formId}-password`}
          label='Contraseña'
          type='password'
          autoComplete='current-password'
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <FormAlert>{error}</FormAlert>

      <div className='auth-form__actions'>
        <button
          type='submit'
          className='button button--primary auth-form__submit'
          disabled={!isValid || isSubmitting}
          aria-busy={isSubmitting || undefined}
          aria-describedby={showSubmitHint ? hintId : undefined}
        >
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </button>

        {showSubmitHint && (
          <p id={hintId} className='auth-form__submit-hint'>
            Completá usuario y contraseña para continuar.
          </p>
        )}
      </div>
    </form>
  );
};

export default LoginForm;
