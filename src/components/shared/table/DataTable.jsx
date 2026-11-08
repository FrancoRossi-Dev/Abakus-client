import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortDown, faSortUp, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './DataTable.css';

const ARIA_SORT = { asc: 'ascending', desc: 'descending' };

// Encabezado de columna. Si la columna es ordenable (column.sortable + onSort),
// el encabezado es un botón y la dirección activa se ve con icono y aria-sort (spec §8.3).
const HeaderCell = ({ column, sort, onSort }) => {
  if (!column.sortable || !onSort) {
    return <th data-align={column.align}>{column.header}</th>;
  }

  const isActive = sort?.key === column.key;
  const direction = isActive ? sort.direction : undefined;
  const icon =
    direction === 'asc' ? faSortUp
    : direction === 'desc' ? faSortDown
    : faSort;

  return (
    <th data-align={column.align} aria-sort={isActive ? ARIA_SORT[direction] : undefined}>
      <button
        type='button'
        className={`data-table__sort${isActive ? ' data-table__sort--active' : ''}`}
        onClick={() => onSort(column.key)}>
        <span>{column.header}</span>
        <FontAwesomeIcon icon={icon} aria-hidden='true' className='data-table__sort-icon' />
      </button>
    </th>
  );
};

// columns: [{ key, header, render?, align?: 'end', sortable? }]
// sort: { key, direction: 'asc' | 'desc' } — el orden de los datos lo resuelve quien usa la tabla
const DataTable = ({
  sort,
  onSort,
  columns,
  data,
  isLoading = false,
  error = '',
  renderActions,
  getRowKey = (row) => row._id,
  pagination,
  itemLabel = 'registros',
  emptyMessage = `No hay ${itemLabel} registrados.`,
}) => {
  const spinner = <FontAwesomeIcon icon={faSpinner} spin className='data-table__spinner' />;
  const loadingText = `Cargando ${itemLabel}...`;

  // Primera carga: todavía no hay ninguna lista para mostrar
  if (data === undefined) {
    return error ?
        <p role='alert'>{error}</p>
      : <div className='data-table__initial' role='status'>
          {spinner}
          <span>{loadingText}</span>
        </div>;
  }

  return (
    <div>
      {error && <p role='alert'>{error}</p>}

      <div className='data-table' aria-busy={isLoading}>
        {isLoading && (
          <div className='data-table__overlay' role='status'>
            {spinner}
            <span className='sr-only'>{loadingText}</span>
          </div>
        )}

        {data.length === 0 ?
          <div className='data-table__empty'>{emptyMessage}</div>
        : <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <HeaderCell key={column.key} column={column} sort={sort} onSort={onSort} />
                ))}
                {renderActions && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr key={getRowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.key} data-align={column.align}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {renderActions && (
                    <td>
                      <div className='data-table__actions'>{renderActions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {pagination && pagination.pages > 1 && (
        <nav aria-label={`Paginación de ${itemLabel}`}>
          <button
            type='button'
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}>
            Anterior
          </button>

          <span>
            Página {pagination.page} de {pagination.pages} ({pagination.total} {itemLabel})
          </span>

          <button
            type='button'
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages || isLoading}>
            Siguiente
          </button>
        </nav>
      )}
    </div>
  );
};

export default DataTable;
