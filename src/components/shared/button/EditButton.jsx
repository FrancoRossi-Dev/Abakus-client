import { FiEdit2 } from "react-icons/fi";
import ActionButton from "./ActionButton";

/**
 * Botón de editar compacto (lápiz + texto).
 * Por defecto dice "Editar"; children lo reemplaza.
 * Resto de props (onClick, disabled, aria-*) pasa al <button>.
 */
const EditButton = ({ children = "Editar", ...props }) => (
  <ActionButton icon={FiEdit2} {...props}>
    {children}
  </ActionButton>
);

export default EditButton;
