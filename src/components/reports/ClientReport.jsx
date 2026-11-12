import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FiBarChart2 } from 'react-icons/fi';
import backend from '../../api/backend';
import ReportSkeleton from './ReportSkeleton';
import ReportHeader from './ReportHeader';
import ReportMetrics from './ReportMetrics';
import BankFilter from './BankFilter';
import AllocationCard from './AllocationCard';
import InstrumentsPanel from './InstrumentsPanel';
import NewsAnalysis from './NewsAnalysis';
import { buildAllocationSlices } from './allocation';
import { downloadReportPdf } from './pdf/downloadReportPdf';
import ErrorState from '../shared/page/ErrorState';
import EmptyState from '../shared/page/EmptyState';
import { selectNewsAnalysis } from '../../features/reports/newsAnalysis.slice';
import {
  getBankTotals,
  getInstrumentsOfPositions,
  getPositionBankId,
  getTypesOfPositions,
} from '../../utils/reportCalculations';

// Reporte de un cliente: pide su cartera al backend y la muestra armada con componentes chicos
const ClientReport = ({ client, banks }) => {
  const clientId = client._id;

  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [selectedBankId, setSelectedBankId] = useState(null); // null = todos los bancos
  const [isExporting, setIsExporting] = useState(false);

  // Cambiarlo vuelve a disparar la carga (botón "Reintentar")
  const [reloadKey, setReloadKey] = useState(0);

  // El PDF incluye el análisis IA solo si ya se generó hoy: exportar nunca llama a la IA
  const analysisEntry = useSelector(selectNewsAnalysis(clientId));
  const analysis = analysisEntry?.status === 'succeeded' ? analysisEntry : null;

  useEffect(() => {
    // Si el usuario cambia de cliente antes de que llegue la respuesta, se ignora
    let cancelled = false;

    const loadReport = async () => {
      try {
        const res = await backend.get(`/report/client/${clientId}`);
        if (cancelled) return;

        setReport(res.data.data);
      } catch (err) {
        if (!cancelled) setError(err.userMessage || 'No se pudo cargar el reporte.');
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [clientId, reloadKey]);

  const handleRetry = () => {
    setError('');
    setReloadKey(reloadKey + 1);
  };

  if (error) {
    return <ErrorState title='No se pudo cargar la cartera' message={error} onRetry={handleRetry} />;
  }

  if (!report) return <ReportSkeleton />;

  // ---- Datos calculados a partir del reporte ----
  const { positions, composition, reportWindow } = report;
  const accounts = client.bankAccounts ?? [];
  const bankTotals = getBankTotals(positions, accounts, banks);
  const totalMarketValue = bankTotals.reduce((sum, bank) => sum + bank.marketValue, 0);
  const hasPositions = positions.length > 0;

  const selectedBank = bankTotals.find((bank) => bank.id === selectedBankId);
  const selectedMarketValue = selectedBank ? selectedBank.marketValue : totalMarketValue;
  const scopeLabel = selectedBank ? selectedBank.name : 'Todos los bancos';

  const positionsOfBank = (bankId) =>
    positions.filter((position) => getPositionBankId(position, accounts) === bankId);

  // Sin filtro se usan los totales que ya calculó la API; con filtro se calculan acá
  const instruments =
    selectedBank ?
      getInstrumentsOfPositions(positionsOfBank(selectedBankId), selectedMarketValue)
    : composition.byInstrument;

  // Composición por tipo de activo para la torta: la de la API, o la del banco elegido
  const byInstrumentType =
    selectedBank ? getTypesOfPositions(positionsOfBank(selectedBankId)) : composition.byInstrumentType;

  // El PDF siempre muestra la cartera completa, no el filtro de banco activo en pantalla
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await downloadReportPdf({
        client: { ...report.client, logoURL: client.clientDetails.logoURL },
        reportWindow,
        totalMarketValue,
        instrumentCount: composition.byInstrument.length,
        positionCount: positions.length,
        banks: bankTotals,
        allocation: buildAllocationSlices(composition.byInstrumentType),
        instruments: composition.byInstrument,
        analysis,
        generatedAt: new Date(),
      });
      toast.success('PDF descargado.');
    } catch {
      toast.error('No se pudo generar el PDF. Probá de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className='report'>
      <ReportHeader
        client={report.client}
        logoURL={client.clientDetails.logoURL}
        reportWindow={reportWindow}
        clientId={clientId}
        isExporting={isExporting}
        hasAnalysis={Boolean(analysis)}
        canDownload={hasPositions || Boolean(analysis)}
        onDownload={handleDownloadPdf}
      />

      {hasPositions ?
        <>
          <ReportMetrics
            totalMarketValue={totalMarketValue}
            instrumentCount={composition.byInstrument.length}
            positionCount={positions.length}
            bankTotals={bankTotals}
          />

          <BankFilter
            bankTotals={bankTotals}
            totalMarketValue={totalMarketValue}
            selectedBankId={selectedBankId}
            onSelect={setSelectedBankId}
          />

          <div className='report__grid'>
            <AllocationCard
              byInstrumentType={byInstrumentType}
              scopeLabel={scopeLabel}
              marketValue={selectedMarketValue}
            />
            <InstrumentsPanel
              instruments={instruments}
              scopeLabel={scopeLabel}
              selectedBankName={selectedBank?.name}
            />
          </div>
        </>
      : <div className='card'>
          <EmptyState
            compact
            icon={FiBarChart2}
            title='Sin posiciones recientes'
            text='Este cliente no tiene posiciones informadas en los últimos 30 días. Importá sus posiciones desde la página de clientes para ver el reporte.'
          />
        </div>
      }

      <NewsAnalysis clientId={clientId} hasPositions={hasPositions} />
    </div>
  );
};

export default ClientReport;
