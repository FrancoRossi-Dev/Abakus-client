import DataTable from '../shared/table/DataTable';
import './PositionPreview.css';

const EMPTY_VALUE = '—';

// Formato es-UY (punto de miles, coma decimal). Solo cambia cómo se ve: el dato enviado no se redondea.
const quantityFormat = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 6 });
const priceFormat = new Intl.NumberFormat('es-UY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});
const amountFormat = new Intl.NumberFormat('es-UY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Los campos opcionales que no vienen en el Excel se muestran con un guion (≠ 0, spec §11)
const showNumber = (format) => (value) => {
  if (value === undefined || value === null || value === '') {
    return <span className='position-preview__empty'>{EMPTY_VALUE}</span>;
  }

  return format.format(value);
};

const showDate = (value) => {
  if (!value) {
    return <span className='position-preview__empty'>{EMPTY_VALUE}</span>;
  }

  return new Date(value).toLocaleDateString('es-UY');
};

const columns = [
  { key: 'rowNumber', header: 'Fila', align: 'end' },
  { key: 'isin', header: 'ISIN', render: (row) => <code>{row.isin}</code> },
  {
    key: 'quantity',
    header: 'Cantidad',
    align: 'end',
    render: (row) => showNumber(quantityFormat)(row.quantity),
  },
  {
    key: 'purchasePrice',
    header: 'Precio de compra',
    align: 'end',
    render: (row) => showNumber(priceFormat)(row.purchasePrice),
  },
  {
    key: 'currentPrice',
    header: 'Precio actual',
    align: 'end',
    render: (row) => showNumber(priceFormat)(row.currentPrice),
  },
  {
    key: 'marketValue',
    header: 'Valor de mercado',
    align: 'end',
    render: (row) => showNumber(amountFormat)(row.marketValue),
  },
  { key: 'currency', header: 'Moneda' },
  { key: 'dateOfPurchase', header: 'Fecha de compra', render: (row) => showDate(row.dateOfPurchase) },
  { key: 'dateOfReport', header: 'Fecha de reporte', render: (row) => showDate(row.dateOfReport) },
];

// Muestra las posiciones leídas del Excel antes de enviarlas al servidor.
// Todavía no tienen _id: cada una trae rowNumber, su fila en el Excel
const PositionPreview = ({ positions }) => {
  return (
    <div className='position-preview' data-density='compact'>
      <DataTable
        columns={columns}
        data={positions}
        getRowKey={(row) => row.rowNumber}
        itemLabel='posiciones'
      />
    </div>
  );
};

export default PositionPreview;
