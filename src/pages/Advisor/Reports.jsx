import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import backend from "../../api/backend";
import AssetAllocationChart from "../../components/reports/AssetAllocation";
import { setAllocation } from "../../features/reports/reports.slice";
import "./Reports.css";

const numberFormatter = new Intl.NumberFormat("es-UY", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const getAllPages = async (endpoint, signal) => {
  const items = [];
  let page = 1;
  let pages = 1;

  while (page <= pages) {
    const { data } = await backend.get(endpoint, {
      params: { page, limit: 100 },
      signal,
    });

    items.push(...data.data);
    pages = data.pages;
    page++;
  }

  return items;
};

const getPositionBankId = (position, accounts) => {
  const account = accounts.find(
    (item) => item._id === position.bankAccount?.id,
  );

  return account?.bankId ?? "unknown";
};

const groupPositions = (positions, getGroup) => {
  const groups = new Map();

  for (const position of positions) {
    const { key, ...fields } = getGroup(position);
    const group = groups.get(key) ?? { ...fields, marketValue: 0 };

    group.marketValue += position.marketValue;
    groups.set(key, group);
  }

  return [...groups.values()].sort((a, b) => b.marketValue - a.marketValue);
};

const getBankTotals = (positions, accounts, banks) => {
  const bankNamesById = new Map(banks.map((bank) => [bank._id, bank.name]));
  const totals = new Map();

  // El reporte identifica la cuenta. La cuenta del cliente identifica el banco.
  for (const position of positions) {
    const bankId = getPositionBankId(position, accounts);

    const bank = totals.get(bankId) ?? {
      id: bankId,
      name: bankNamesById.get(bankId) ?? "Banco sin identificar",
      marketValue: 0,
    };

    bank.marketValue += position.marketValue;
    totals.set(bankId, bank);
  }

  return [...totals.values()].sort((a, b) => b.marketValue - a.marketValue);
};

const ClientReport = ({ client, banks }) => {
  const clientId = client._id;
  const dispatch = useDispatch();

  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadReport = async () => {
      try {
        const { data } = await backend.get(`/report/client/${clientId}`, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const reportData = data.data;

        // El componente de la torta lee esta parte del reporte desde Redux.
        dispatch(
          setAllocation({
            clientId,
            byInstrumentType: reportData.composition.byInstrumentType,
          }),
        );

        setReport(reportData);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.userMessage || "No se pudo cargar el reporte.");
        }
      }
    };

    loadReport();

    return () => controller.abort();
  }, [clientId, dispatch]);

  const handleAnalysis = async () => {
    setAnalysis("");
    setAnalysisError("");
    setIsAnalyzing(true);

    try {
      const { data } = await backend.get(`/report/client/${clientId}/news`, {
        params: { lang: "es" },
      });

      setAnalysis(data.data.analysis);
    } catch (err) {
      setAnalysisError(err.userMessage || "No se pudo generar el análisis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (error) return <p role="alert">{error}</p>;
  if (!report) return <p>Cargando cartera...</p>;

  const { positions, composition } = report;
  const bankTotals = getBankTotals(positions, client.bankAccounts ?? [], banks);
  const hasPositions = positions.length > 0;

  const accounts = client.bankAccounts ?? [];
  const totalMarketValue = bankTotals.reduce(
    (sum, bank) => sum + bank.marketValue,
    0,
  );

  const positionsForBank = (bankId) =>
    positions.filter(
      (position) => getPositionBankId(position, accounts) === bankId,
    );

  const selectBank = (bankId) => {
    setSelectedBankId(bankId);

    const byInstrumentType =
      bankId === null
        ? composition.byInstrumentType
        : groupPositions(positionsForBank(bankId), (position) => {
            const type = position.instrument?.type ?? "other";
            return { key: type, type };
          });

    dispatch(setAllocation({ clientId, byInstrumentType }));
  };

  const selectedBank = bankTotals.find((bank) => bank.id === selectedBankId);
  const selectedMarketValue = selectedBank?.marketValue ?? totalMarketValue;

  const visibleInstruments =
    selectedBankId === null
      ? composition.byInstrument
      : groupPositions(positionsForBank(selectedBankId), ({ instrument }) => ({
          key: instrument?.id ?? "unknown",
          id: instrument?.id ?? null,
          name: instrument?.name ?? "Instrumento sin identificar",
          isin: instrument?.isin ?? null,
        })).map((instrument) => ({
          ...instrument,
          percentage: selectedMarketValue
            ? (instrument.marketValue / selectedMarketValue) * 100
            : 0,
        }));

  return (
    <div>
      <h2>{report.client.commercialName}</h2>

      {hasPositions ? (
        <>
          <section>
            <h3>Market value por banco</h3>

            <div className="reports__banks">
              {[
                { id: null, name: "TOTAL", marketValue: totalMarketValue },
                ...bankTotals,
              ].map((bank) => (
                <button
                  key={bank.id ?? "total"}
                  type="button"
                  className="reports__bank"
                  aria-pressed={selectedBankId === bank.id}
                  onClick={() => selectBank(bank.id)}
                >
                  <strong>{bank.name}</strong>
                  <span>{numberFormatter.format(bank.marketValue)}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3>Asset allocation</h3>
            <AssetAllocationChart clientId={clientId} />
          </section>

          <section>
            <h3>Instrumentos de la cartera</h3>

            <table>
              <thead>
                <tr>
                  <th scope="col">Instrumento</th>
                  <th scope="col">ISIN</th>
                  <th scope="col">Market value</th>
                  <th scope="col">
                    {selectedBank
                      ? `% en ${selectedBank.name}`
                      : "% de la cartera"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleInstruments.map((instrument) => (
                  <tr key={instrument.id ?? "unknown"}>
                    <td>{instrument.name}</td>
                    <td>{instrument.isin ?? "—"}</td>
                    <td>{numberFormatter.format(instrument.marketValue)}</td>
                    <td>{numberFormatter.format(instrument.percentage)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : (
        <p>Este cliente no tiene posiciones recientes para mostrar.</p>
      )}

      <section>
        <button
          type="button"
          onClick={handleAnalysis}
          disabled={isAnalyzing || !hasPositions}
        >
          {isAnalyzing ? "Generando análisis..." : "Análisis Groq"}
        </button>

        {analysisError && <p role="alert">{analysisError}</p>}
        {analysis && <p className="reports__analysis">{analysis}</p>}
      </section>
    </div>
  );
};

const Reports = () => {
  const [clients, setClients] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadClientsAndBanks = async () => {
      try {
        const [clientList, bankList] = await Promise.all([
          getAllPages("/client", controller.signal),
          getAllPages("/bank", controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setClients(clientList);
        setBanks(bankList);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.userMessage || "No se pudieron cargar los clientes y bancos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadClientsAndBanks();

    return () => controller.abort();
  }, []);

  const selectedClient = clients.find((client) => client._id === selectedId);

  return (
    <div className="page">
      <h1>Reportes</h1>

      {isLoading && <p>Cargando clientes...</p>}
      {error && <p role="alert">{error}</p>}

      {!isLoading && !error && (
        <div className="reports">
          <aside>
            <h2>Clientes</h2>

            {clients.length === 0 ? (
              <p>No hay clientes registrados.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th scope="col">Nombre comercial</th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id}>
                      <td>
                        <button
                          type="button"
                          aria-pressed={selectedId === client._id}
                          onClick={() => setSelectedId(client._id)}
                        >
                          {client.clientDetails.commercialName}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </aside>

          <div className="reports__detail">
            {selectedClient ? (
              <ClientReport
                key={selectedClient._id}
                client={selectedClient}
                banks={banks}
              />
            ) : (
              <p>Seleccioná un cliente para ver su cartera.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
