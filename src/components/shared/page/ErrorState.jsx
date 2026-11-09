import { FiRefreshCw } from 'react-icons/fi';
import FormAlert from '../form/FormAlert';
import Button from '../button/Button';

// Error a nivel página o sección: qué pasó, la causa y la acción para resolverlo (spec §7)
const ErrorState = ({ title = 'No se pudo cargar la página', message, onRetry }) => (
  <div className='page-error'>
    <FormAlert title={title}>{message}</FormAlert>
    {onRetry && <Button type='secondary' icon={FiRefreshCw} label='Reintentar' onClick={onRetry} />}
  </div>
);

export default ErrorState;
