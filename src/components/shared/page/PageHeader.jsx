/**
 * Encabezado de página: título y descripción a la izquierda, acciones a la derecha (spec §7).
 * La acción principal va última, para que quede en el extremo derecho.
 */
const PageHeader = ({ title, subtitle, actions }) => (
  <header className='page-header'>
    <div className='page-header__text'>
      <h1>{title}</h1>
      {subtitle && <p className='page-header__subtitle'>{subtitle}</p>}
    </div>
    {actions && <div className='page__actions'>{actions}</div>}
  </header>
);

export default PageHeader;
