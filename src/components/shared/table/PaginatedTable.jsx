import DataTable from './DataTable';
import FormAlert from '../form/FormAlert';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';

/**
 * Tabla paginada dentro de un panel con encabezado: qué muestra y cuántos registros tiene (spec §8.1).
 *
 * @param {string} title        título del panel (ej. "Catálogo de bancos")
 * @param {string} actionError  error de una acción sobre las filas (ej. al eliminar)
 */
const PaginatedTable = ({
  endpoint,
  selectState,
  actions,
  pageSize,
  renderActions,
  title,
  actionError,
  itemLabel = 'registros',
  ...tableProps
}) => {
  const { data, isLoading, error, page, pages, total, goToPage } = usePaginatedResource({
    endpoint,
    selectState,
    actions,
    pageSize,
  });

  const hasCount = data !== undefined && !error;

  return (
    <section className='panel'>
      {title && (
        <div className='panel__toolbar'>
          <div className='panel__heading'>
            <h2 className='panel__title'>{title}</h2>
            <p className='panel__count' aria-live='polite'>
              {hasCount ? `${total} ${itemLabel}` : ' '}
            </p>
          </div>
        </div>
      )}

      {actionError && <FormAlert>{actionError}</FormAlert>}

      <DataTable
        {...tableProps}
        itemLabel={itemLabel}
        data={data}
        isLoading={isLoading}
        error={error}
        renderActions={renderActions && ((row) => renderActions(row, { isLoading }))}
        pagination={{ page, pages, total, onPageChange: goToPage }}
      />
    </section>
  );
};

export default PaginatedTable;
