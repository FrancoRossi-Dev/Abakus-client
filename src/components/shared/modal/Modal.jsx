import { useEffect, useId, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import './Modal.css';

// size: "md" (predeterminado, formularios cortos) | "lg" (formularios en dos columnas) | "xl" (tablas)
const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) dialogRef.current?.showModal();
  }, [isOpen]);

  if (!isOpen) return null;

  // El click en el overlay llega con target = <dialog>; dentro del panel, no.
  const handleClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  // Escape: evita que el navegador lo cierre solo, así el estado queda en manos del padre.
  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal--${size}`}
      aria-labelledby={title ? titleId : undefined}
      onClick={handleClick}
      onCancel={handleCancel}>
      <div className='modal__panel'>
        <header className='modal__header'>
          {title && (
            <h2 id={titleId} className='modal__title'>
              {title}
            </h2>
          )}

          <button type='button' className='modal__close' onClick={onClose} aria-label='Cerrar'>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        <div className='modal__body'>{children}</div>
      </div>
    </dialog>
  );
};

export default Modal;
