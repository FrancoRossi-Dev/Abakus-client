import './Button.css';

/**
 * Botón con jerarquía del sistema (spec §7).
 *
 * @param {"primary"|"secondary"|"tertiary"} type  jerarquía visual (por compatibilidad se llama `type`)
 * @param {string}    label     texto del botón
 * @param {Component} icon      componente de icono opcional (ej. de react-icons), se muestra antes del texto
 * @param {"button"|"submit"} htmlType  tipo nativo del <button>
 * Cualquier otra prop (onClick, disabled, aria-*) pasa directo al <button>.
 */
const Button = ({
  type = 'primary',
  label,
  icon: Icon,
  htmlType = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={htmlType}
      className={`button button--${type} ${className}`.trim()}
      {...props}>
      {Icon && <Icon aria-hidden='true' className='button__icon' />}
      <span>{label}</span>
    </button>
  );
};

export default Button;
