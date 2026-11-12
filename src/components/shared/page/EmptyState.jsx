// Estado vacío: un ícono opcional, un título, un texto y, si hace falta, una acción (children)
const EmptyState = ({ icon: Icon, title, text, compact = false, children }) => (
  <div className={compact ? 'empty-state empty-state--compact' : 'empty-state'}>
    {Icon && <Icon className='empty-state__icon' aria-hidden='true' />}
    <p className='empty-state__title'>{title}</p>
    {text && <p className='empty-state__text'>{text}</p>}
    {children}
  </div>
);

export default EmptyState;
