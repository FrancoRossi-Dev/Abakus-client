import { useSelector } from "react-redux";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Legend, Tooltip);

const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" },
  },
};

const AssetAllocationChart = ({ clientId }) => {
  const { clientId: reportClientId, byInstrumentType } = useSelector(
    (state) => state.reports
  );

  if (reportClientId !== clientId) return null;

  const totals = { stock: 0, bond: 0, fund: 0, other: 0 };

  for (const item of byInstrumentType) {
    const type = ["stock", "bond", "fund"].includes(item.type)
      ? item.type
      : "other";

    totals[type] += item.marketValue;
  }

  const values = [totals.stock, totals.bond, totals.fund, totals.other];

  if (values.every((value) => value === 0)) {
    return <p>Sin valor de mercado para graficar.</p>;
  }

  const data = {
    labels: ["Equities", "Bonds", "Funds", "Other"],
    datasets: [
      {
        label: "Market value",
        data: values,
        backgroundColor: ["#2563eb", "#0f766e", "#d97706", "#7c3aed"],
      },
    ],
  };

  return (
    <div className="reports__chart">
      <Pie data={data} options={options} />
    </div>
  );
};

export default AssetAllocationChart;