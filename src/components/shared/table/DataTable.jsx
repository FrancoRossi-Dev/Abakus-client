import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import './DataTable.css';

const DataTable = ({
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
          <p>{emptyMessage}</p>
        : <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.header}</th>
                ))}
                {renderActions && <th>Acciones</th>}
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr key={getRowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
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
