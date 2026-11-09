import { useSelector } from 'react-redux';
import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatAmount, formatPercent, formatUSD } from '../../utils/format';
import { buildAllocationSlices } from './allocation';
import { readToken, useTheme } from '../../theme/theme';
import './AssetAllocation.css';

ChartJS.register(ArcElement, Tooltip);

const AssetAllocationChart = ({ clientId }) => {
  const { clientId: reportClientId, byInstrumentType } = useSelector((state) => state.reports);
  // Chart.js dibuja en canvas y no lee CSS: re-renderiza al cambiar de tema para tomar los colores nuevos
  const theme = useTheme();

  if (reportClientId !== clientId) return null;

  // Solo las categorías con valor: una porción vacía no aporta y ensucia la leyenda
  const slices = buildAllocationSlices(byInstrumentType);

  if (slices.length === 0) {
    return <p className='allocation__empty'>No hay valor de mercado para graficar.</p>;
  }

  const data = {
    labels: slices.map((slice) => slice.label),
    datasets: [
      {
        data: slices.map((slice) => slice.value),
        backgroundColor: slices.map((slice) => slice.color),
        // separación de 2 px del color de la superficie entre porciones (sigue al tema)
        borderColor: readToken('--color-surface') || '#ffffff',
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '62%',
    plugins: {
      // la leyenda es la tabla de al lado: nombres, importes y porcentajes legibles
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) =>
            ` ${formatUSD(context.parsed)} (${formatPercent(slices[context.dataIndex].percentage)})`,
        },
      },
    },
  };

  return (
    <div className='allocation'>
      <div className='allocation__chart'>
        <Doughnut
          key={theme}
          data={data}
          options={options}
          role='img'
          aria-label={`Composición por tipo de activo: ${slices
            .map((slice) => `${slice.label} ${formatPercent(slice.percentage)}`)
            .join(', ')}`}
        />
      </div>

      <table className='allocation__legend'>
        <caption className='sr-only'>Composición por tipo de activo</caption>
        <thead>
          <tr>
            <th scope='col'>Tipo</th>
            <th scope='col' data-align='end'>
              USD
            </th>
            <th scope='col' data-align='end'>
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.type}>
              <th scope='row'>
                <span
                  className='allocation__swatch'
                  style={{ background: slice.color }}
                  aria-hidden='true'
                />
                {slice.label}
              </th>
              <td data-align='end'>{formatAmount(slice.value)}</td>
              <td data-align='end'>{formatPercent(slice.percentage)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetAllocationChart;
