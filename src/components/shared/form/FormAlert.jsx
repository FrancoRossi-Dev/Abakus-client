import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import './FormField.css';

// Mensaje a nivel formulario (ej. error del servidor), dentro de la página, sin ventanas emergentes.
// La gravedad se comunica con texto + icono, no solo con color (spec §3, §12).
const FormAlert = ({ children }) => {
  if (!children) return null;

  return (
    <div className='form-alert form-alert--error' role='alert'>
      <FontAwesomeIcon icon={faCircleExclamation} aria-hidden='true' className='form-alert__icon' />
      <p>{children}</p>
    </div>
  );
};

export default FormAlert;
