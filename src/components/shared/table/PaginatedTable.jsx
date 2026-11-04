import DataTable from './DataTable';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';

/**
 * DataTable conectada a un listado paginado del backend, cacheado en un slice
 * creado con createPaginatedSlice.
 *
 * @param {string}   endpoint       ruta del backend (ej. "/manager")
 * @param {Function} selectState    selector del slice: (state) => state.managers
 * @param {object}   actions        acciones del slice (slice.actions)
 * @param {number}   pageSize       items por página
 * @param {Function} renderActions  (row, { isLoading }) => botones de la fila
 * Resto de props: se pasan a DataTable (columns, itemLabel, emptyMessage, getRowKey...).
 */
const PaginatedTable = ({
  endpoint,
  selectState,
  actions,
  pageSize,
  renderActions,
  ...tableProps
}) => {
  const { data, isLoading, error, page, pages, total, goToPage } = usePaginatedResource({
    endpoint,
    selectState,
    actions,
    pageSize,
  });

  return (
    <DataTable
      {...tableProps}
      data={data}
      isLoading={isLoading}
      error={error}
      renderActions={renderActions && ((row) => renderActions(row, { isLoading }))}
      pagination={{ page, pages, total, onPageChange: goToPage }}
    />
  );
};

export default PaginatedTable;
