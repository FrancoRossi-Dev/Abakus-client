// Esqueleto que se muestra mientras carga el reporte: ocupa el mismo lugar que el contenido real
const ReportSkeleton = () => (
  <div className='report' role='status' aria-label='Cargando cartera'>
    <div className='skeleton'>
      <span className='skeleton__line skeleton__line--title' />
      <span className='skeleton__line skeleton__line--short' />
    </div>
    <div className='metrics'>
      {[0, 1, 2].map((item) => (
        <div key={item} className='metric skeleton'>
          <span className='skeleton__line skeleton__line--short' />
          <span className='skeleton__line skeleton__line--title' />
        </div>
      ))}
    </div>
  </div>
);

export default ReportSkeleton;
