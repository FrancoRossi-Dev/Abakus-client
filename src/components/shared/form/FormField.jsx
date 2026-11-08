import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './FormField.css';

// Campo de formulario con etiqueta visible, ayuda y error asociados al control (spec §7, §12).
// Recibe directamente el resultado de register() de react-hook-form: en React 19 `ref` llega como prop.
// type="password" agrega un botón para mostrar/ocultar lo escrito.
// as="select" dibuja un <select>; las <option> van como children.
const FormField = ({
  id,
  label,
  as = 'input',
  type = 'text',
  hint,
  error,
  optional = false,
  className = '',
  children,
  ref,
  ...controlProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isSelect = as === 'select';
  const isPassword = !isSelect && type === 'password';

  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const sharedProps = {
    ref,
    id,
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    ...controlProps,
  };

  return (
    <div className={`form-field ${className}`.trim()}>
      <label htmlFor={id} className='form-field__label'>
        {label}
        {optional && <span className='form-field__optional'> (opcional)</span>}
      </label>

      <div className={`form-field__control${isPassword ? ' form-field__control--password' : ''}`}>
        {isSelect ?
          <select {...sharedProps}>{children}</select>
        : <input {...sharedProps} type={isPassword && showPassword ? 'text' : type} />}

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
