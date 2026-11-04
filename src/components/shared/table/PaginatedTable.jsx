import DataTable from './DataTable';
import { usePaginatedResource } from '../../../hooks/usePaginatedResource';

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
