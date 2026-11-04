import './AuthCard.css';

// Tarjeta de las páginas públicas: título, descripción, contenido (formulario)
// y, debajo, el enlace para cambiar de pantalla.
// size: 'narrow' para formularios cortos, 'wide' para formularios largos.
const AuthCard = ({ title, description, footer, size = 'narrow', children }) => {
  return (
    <div className={`auth-card auth-card--${size}`}>
      <section className='auth-card__panel' aria-labelledby='auth-card-title'>
        <header className='auth-card__header'>
          <h1 id='auth-card-title' className='auth-card__title'>
            {title}
          </h1>
          {description && <p className='auth-card__description'>{description}</p>}
        </header>

        {children}
      </section>

      {footer && <p className='auth-card__footer'>{footer}</p>}
    </div>
  );
};

export default AuthCard;
