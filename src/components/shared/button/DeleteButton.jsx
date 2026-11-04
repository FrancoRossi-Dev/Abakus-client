import { FiTrash2 } from "react-icons/fi";
import ActionButton from "./ActionButton";

/**
 * Botón de eliminar compacto (tacho + texto, en color destructivo).
 * Por defecto dice "Eliminar"; children lo reemplaza (ej. "Eliminando...").
 * Resto de props (onClick, disabled, aria-*) pasa al <button>.
 */
const DeleteButton = ({ children = "Eliminar", ...props }) => (
  <ActionButton icon={FiTrash2} tone="danger" {...props}>
    {children}
  </ActionButton>
);

export default DeleteButton;
