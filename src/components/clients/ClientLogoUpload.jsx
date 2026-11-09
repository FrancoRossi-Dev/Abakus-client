import { useId, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FiImage } from 'react-icons/fi';
import backend from '../../api/backend';

// Mismas reglas que la API (multer.middleware.js): se validan antes para no subir algo que va a rechazar
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 2;

const validate = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) return 'La imagen tiene que ser PNG, JPG, WEBP o GIF.';
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `La imagen no puede superar los ${MAX_SIZE_MB} MB.`;
  return null;
};

/**
 * Botón para subir o cambiar la imagen del cliente (la imagen se muestra con ClientAvatar).
 * POST /client/:id/uploadImage (multipart, campo "image") devuelve el cliente actualizado.
 */
const ClientLogoUpload = ({ client, onUploaded }) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const { logoURL } = client.clientDetails;

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    // se limpia para poder volver a elegir el mismo archivo después de un error
    event.target.value = '';
    if (!file) return;

    const invalid = validate(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError('');
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const { data } = await backend.post(`/client/${client._id}/uploadImage`, body);
      onUploaded(data.client);
      toast.success('Imagen actualizada.');
    } catch (err) {
      setError(err.userMessage || 'No se pudo subir la imagen.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='client-logo'>
      <div className='client-logo__body'>
        <input
          ref={inputRef}
          id={inputId}
          type='file'
          accept={IMAGE_TYPES.join(',')}
          className='sr-only'
          onChange={handleChange}
          disabled={isUploading}
          aria-describedby={`${inputId}-hint`}
        />
        <button
          type='button'
          className='button button--secondary client-logo__button'
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          aria-busy={isUploading}>
          <FiImage aria-hidden='true' className='button__icon' />
          <span>
            {isUploading ? 'Subiendo...'
            : logoURL ?
              'Cambiar imagen'
            : 'Subir imagen'}
          </span>
        </button>
        <p id={`${inputId}-hint`} className='client-logo__hint'>
          PNG, JPG, WEBP o GIF, hasta {MAX_SIZE_MB} MB.
        </p>
        {error && (
          <p className='client-logo__error' role='alert'>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ClientLogoUpload;
