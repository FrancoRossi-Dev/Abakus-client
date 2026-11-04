import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { registerSchema } from '../../validators/auth.validators';
import backend from '../../api/backend';
import FormField from '../shared/form/FormField';
import FormAlert from '../shared/form/FormAlert';
import '../shared/button/Button.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const formId = useId();
  const hintId = `${formId}-submit-hint`;
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: joiResolver(registerSchema),
    // Muestra el error recién al salir del campo y lo retira apenas se corrige
    mode: 'onTouched',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      details: {
        comercialName: '',
        legalName: '',
        document: '',
        phone: '',
        contactEmail: '',
        address: '',
        country: '',
      },
    },
  });

  // Lleva los errores de la API al campo que corresponde, para que se vean al lado del dato.
  // - 400: details = [{ field: 'details.contactEmail', message }] (mismos nombres que el form)
  // - 409: details = { username } o { email } (usuario o correo ya registrados)
  // Devuelve true si marcó al menos un campo.
  const showServerFieldErrors = (details, message) => {
    if (Array.isArray(details)) {
      details.forEach(({ field, message: fieldMessage }) =>
        setFieldError(field, { type: 'server', message: fieldMessage })
      );
      return details.length > 0;
    }

    if (details?.username) {
      setFieldError('username', { type: 'server', message });
      return true;
    }

    if (details?.email) {
      setFieldError('details.contactEmail', { type: 'server', message });
      return true;
    }

    return false;
  };

  const handleRegister = async (data) => {
    setError('');

    const { address, country, ...requiredDetails } = data.details;

    const body = {
      ...data,
      details: {
        ...requiredDetails,
        ...(address ? { address } : {}),
        ...(country ? { country } : {}),
      },
    };

    try {
      const response = await backend.post('/auth/register', body);

      localStorage.setItem('abakus-token', response.data.token);

      navigate('/');
    } catch (error) {
      const { message, details } = error.response?.data ?? {};
      const marked = showServerFieldErrors(details, message);

      setError(
        marked
          ? 'Revisá los campos marcados.'
          : message || 'No se pudo crear la cuenta. Intentá de nuevo en unos minutos.'
      );
    }
  };

  const fieldId = (name) => `${formId}-${name}`;
  const showSubmitHint = !isValid && !isSubmitting;

  return (
    <form className='auth-form' onSubmit={handleSubmit(handleRegister)} noValidate>
      <fieldset className='auth-form__section'>
        <legend className='auth-form__legend'>Datos de acceso</legend>

        <FormField
          id={fieldId('username')}
          label='Usuario'
          hint='Entre 3 y 30 caracteres.'
          autoComplete='username'
          autoCapitalize='none'
          spellCheck={false}
          error={errors.username?.message}
          {...register('username')}
        />

        <FormField
          id={fieldId('password')}
          label='Contraseña'
          type='password'
          hint='Entre 6 y 30 caracteres.'
          autoComplete='new-password'
          error={errors.password?.message}
          {...register('password')}
        />

        <FormField
          id={fieldId('confirmPassword')}
          label='Repetir contraseña'
          type='password'
          autoComplete='new-password'
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </fieldset>

      <fieldset className='auth-form__section'>
        <legend className='auth-form__legend'>Datos de la firma</legend>

        <FormField
          id={fieldId('comercialName')}
          label='Nombre comercial'
          autoComplete='organization'
          error={errors.details?.comercialName?.message}
          {...register('details.comercialName')}
        />

        <FormField
          id={fieldId('legalName')}
          label='Razón social'
          error={errors.details?.legalName?.message}
          {...register('details.legalName')}
        />

        <FormField
          id={fieldId('document')}
          label='Documento'
          autoComplete='off'
          error={errors.details?.document?.message}
          {...register('details.document')}
        />

        <FormField
          id={fieldId('phone')}
          label='Teléfono'
          type='tel'
          autoComplete='tel'
          error={errors.details?.phone?.message}
          {...register('details.phone')}
        />

        <FormField
          id={fieldId('contactEmail')}
          label='Correo de contacto'
          type='email'
          autoComplete='email'
          spellCheck={false}
          error={errors.details?.contactEmail?.message}
          {...register('details.contactEmail')}
        />

        <FormField
          id={fieldId('address')}
          label='Dirección'
          optional
          autoComplete='street-address'
          error={errors.details?.address?.message}
          {...register('details.address')}
        />

        <FormField
          id={fieldId('country')}
          label='País'
          optional
          autoComplete='country-name'
          error={errors.details?.country?.message}
          {...register('details.country')}
        />
      </fieldset>

      <FormAlert>{error}</FormAlert>

      <div className='auth-form__actions'>
        <button
          type='submit'
          className='button button--primary auth-form__submit'
          disabled={!isValid || isSubmitting}
          aria-busy={isSubmitting || undefined}
          aria-describedby={showSubmitHint ? hintId : undefined}
        >
          {isSubmitting ? 'Creando cuenta…' : 'Registrarse'}
        </button>

        {showSubmitHint && (
          <p id={hintId} className='auth-form__submit-hint'>
            Completá los campos obligatorios para crear la cuenta.
          </p>
        )}
      </div>
    </form>
  );
};

export default RegisterForm;
