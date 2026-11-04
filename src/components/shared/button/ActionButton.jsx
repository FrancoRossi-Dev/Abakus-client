import "./ActionButton.css";

/**
 * Botón de acción compacto (icono + texto, sin fondo ni borde), pensado para
 * filas de tabla y lugares con poca altura. Base de EditButton y DeleteButton.
 *
 * @param {Component} icon      componente de icono (ej. de react-icons)
 * @param {"default"|"danger"} tone  color de la acción (por defecto default)
 * @param {string}    className clases extra
 * @param {node}      children  texto del botón
 * Cualquier otra prop (onClick, disabled, aria-*) pasa directo al <button>.
 */
const ActionButton = ({
  icon: Icon,
  tone = "default",
  className = "",
  children,
  ...props
}) => (
  <button
    type="button"
    className={`action-button action-button--${tone} ${className}`.trim()}
    {...props}
  >
    {Icon && <Icon className="action-button__icon" aria-hidden="true" />}
    <span>{children}</span>
  </button>
);

export default ActionButton;
