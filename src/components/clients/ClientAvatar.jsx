import { useState } from 'react';
import './ClientAvatar.css';

// "Café del Sur S.A." → "CS": primeras letras de las dos primeras palabras significativas
const getInitials = (name = '') => {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 || /\p{N}/u.test(word));
  return (
    words
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'
  );
};

/**
 * Imagen del cliente (logo subido a Cloudinary) o, si no tiene o no carga, sus iniciales.
 * Es decorativa: el nombre del cliente siempre está escrito al lado.
 *
 * @param {string} name     nombre comercial (para las iniciales)
 * @param {string} src      clientDetails.logoURL
 * @param {"sm"|"md"|"lg"} size
 */
const ClientAvatar = ({ name, src, size = 'md', className = '' }) => {
  // Se recuerda qué URL falló: si cambia la imagen (nueva subida), se vuelve a intentar
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;

  return (
    <span className={`client-avatar client-avatar--${size} ${className}`.trim()} aria-hidden='true'>
      {showImage ?
        <img src={src} alt='' loading='lazy' onError={() => setFailedSrc(src)} />
      : <span className='client-avatar__initials'>{getInitials(name)}</span>}
    </span>
  );
};

export default ClientAvatar;
