import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

// Estado de carga a nivel página o sección, anunciado al lector de pantalla
const LoadingState = ({ label = 'Cargando...' }) => (
  <div className='page-status' role='status'>
    <FontAwesomeIcon icon={faSpinner} spin className='page-status__spinner' />
    <span>{label}</span>
  </div>
);

export default LoadingState;
