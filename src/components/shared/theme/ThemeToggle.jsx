import { FiMoon, FiSun } from 'react-icons/fi';
import { toggleTheme, useTheme } from '../../../theme/theme';
import './ThemeToggle.css';

/**
 * Interruptor de tema: sol a la izquierda, luna a la derecha, y un indicador que se desliza
 * hacia el modo activo. Es un switch accesible: el lector anuncia "Modo oscuro, activado/desactivado".
 */
const ThemeToggle = ({ className = '' }) => {
  const isDark = useTheme() === 'dark';

  return (
    <button
      type='button'
      role='switch'
      aria-checked={isDark}
      aria-label='Modo oscuro'
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}>
      <span className='theme-toggle__thumb' aria-hidden='true' />
      <FiSun className='theme-toggle__icon theme-toggle__icon--sun' aria-hidden='true' />
      <FiMoon className='theme-toggle__icon theme-toggle__icon--moon' aria-hidden='true' />
    </button>
  );
};

export default ThemeToggle;
