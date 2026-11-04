import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './FormField.css';

// Campo de formulario con etiqueta visible, ayuda y error asociados al input (spec §7, §12).
// Recibe directamente el resultado de register() de react-hook-form: en React 19 `ref` llega como prop.
// type="password" agrega un botón para mostrar/ocultar lo escrito.
const FormField = ({
  id,
  label,
  type = 'text',
  hint,
  error,
  optional = false,
  ref,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className='form-field'>
      <label htmlFor={id} className='form-field__label'>
        {label}
        {optional && <span className='form-field__optional'> (opcional)</span>}
      </label>

      <div className={`form-field__control${isPassword ? ' form-field__control--password' : ''}`}>
        <input
          ref={ref}
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />

        {isPassword && (
          <button
            type='button'
            className='form-field__toggle'
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label='Mostrar contraseña'
            aria-pressed={showPassword}
            aria-controls={id}
            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        )}
      </div>

      {hint && (
        <p id={hintId} className='form-field__hint'>
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className='form-field__error'>
          <FontAwesomeIcon icon={faCircleExclamation} aria-hidden='true' />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;
