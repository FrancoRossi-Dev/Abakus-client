import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleExclamation,
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import './FormField.css';

const ICONS = {
  error: faCircleExclamation,
  warning: faTriangleExclamation,
  info: faCircleInfo,
};

// Mensaje a nivel formulario (ej. error del servidor), dentro de la página, sin ventanas emergentes.
// La gravedad se comunica con texto + icono, no solo con color (spec §3, §12).
// tone: "error" (predeterminado) | "warning" | "info". Solo los errores interrumpen al lector de pantalla.
const FormAlert = ({ tone = 'error', title, children }) => {
  if (!children && !title) return null;

  return (
    <div className={`form-alert form-alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <FontAwesomeIcon icon={ICONS[tone]} aria-hidden='true' className='form-alert__icon' />
      <div className='form-alert__content'>
        {title && <p className='form-alert__title'>{title}</p>}
        {typeof children === 'string' ? <p>{children}</p> : children || null}
      </div>
    </div>
  );
};

export default FormAlert;
