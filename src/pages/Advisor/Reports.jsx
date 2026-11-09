import { useEffect, useId, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'react-toastify';
import { FiBarChart2, FiDownload, FiSearch, FiUsers, FiX } from 'react-icons/fi';
import backend from '../../api/backend';
import AssetAllocationChart from '../../components/reports/AssetAllocation';
import NewsAnalysis from '../../components/reports/NewsAnalysis';
import { buildAllocationSlices } from '../../components/reports/allocation';
import { downloadReportPdf } from '../../components/reports/pdf/downloadReportPdf';
import Button from '../../components/shared/button/Button';
import DataTable from '../../components/shared/table/DataTable';
import { selectNewsAnalysis } from '../../features/reports/newsAnalysis.slice';
import PageHeader from '../../components/shared/page/PageHeader';
import LoadingState from '../../components/shared/page/LoadingState';
import ErrorState from '../../components/shared/page/ErrorState';
import { setAllocation } from '../../features/reports/reports.slice';
import { formatAmount, formatIsoDate, formatPercent, formatUSD } from '../../utils/format';
import './Reports.css';

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

// Búsqueda sin distinguir mayúsculas ni tildes
const normalize = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const getPositionBankId = (position, accounts) => {
  const account = accounts.find((item) => item._id === position.bankAccount?.id);
  return account?.bankId ?? 'unknown';
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
      name: bankNamesById.get(bankId) ?? 'Banco sin identificar',
      marketValue: 0,
    };

    bank.marketValue += position.marketValue;
    totals.set(bankId, bank);
  }

  return [...totals.values()].sort((a, b) => b.marketValue - a.marketValue);
};

// Barra de participación: refuerza visualmente el porcentaje, que siempre se muestra en texto
const ShareBar = ({ value }) => (
  <span className='share-bar' aria-hidden='true'>
    <span className='share-bar__fill' style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </span>
);

const ReportSkeleton = () => (
  <div className='report' role='status' aria-label='Cargando cartera'>
    <div className='skeleton'>
      <span className='skeleton__line skeleton__line--title' />
      <span className='skeleton__line skeleton__line--short' />
    </div>
    <div className='metrics'>
      {[0, 1, 2].map((item) => (
        <div key={item} className='metric skeleton'>
          <span className='skeleton__line skeleton__line--short' />
          <span className='skeleton__line skeleton__line--title' />
        </div>
      ))}
    </div>
  </div>
);

const ClientReport = ({ client, banks }) => {
  const clientId = client._id;
  const dispatch = useDispatch();

  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [sort, setSort] = useState({ key: 'marketValue', direction: 'desc' });
  const [isExporting, setIsExporting] = useState(false);

  // El PDF incluye el análisis IA solo si ya se generó hoy: exportar nunca llama a la IA
  const analysisEntry = useSelector(selectNewsAnalysis(clientId));
  const analysis = analysisEntry?.status === 'succeeded' ? analysisEntry : null;

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
          setError(err.userMessage || 'No se pudo cargar el reporte.');
        }
      }
    };

    loadReport();

    return () => controller.abort();
  }, [clientId, dispatch, reloadKey]);

  const handleRetry = () => {
    setError('');
    setReloadKey((key) => key + 1);
  };

  if (error) {
    return (
      <ErrorState title='No se pudo cargar la cartera' message={error} onRetry={handleRetry} />
    );
  }
  if (!report) return <ReportSkeleton />;

  const { positions, composition, reportWindow } = report;
  const accounts = client.bankAccounts ?? [];
  const bankTotals = getBankTotals(positions, accounts, banks);
  const hasPositions = positions.length > 0;
  const totalMarketValue = bankTotals.reduce((sum, bank) => sum + bank.marketValue, 0);

  const positionsForBank = (bankId) =>
    positions.filter((position) => getPositionBankId(position, accounts) === bankId);

  const selectBank = (bankId) => {
    setSelectedBankId(bankId);

    const byInstrumentType =
      bankId === null ?
        composition.byInstrumentType
      : groupPositions(positionsForBank(bankId), (position) => {
          const type = position.instrument?.type ?? 'other';
          return { key: type, type };
        });

    dispatch(setAllocation({ clientId, byInstrumentType }));
  };

  const selectedBank = bankTotals.find((bank) => bank.id === selectedBankId);
  const selectedMarketValue = selectedBank?.marketValue ?? totalMarketValue;

  const instruments =
    selectedBankId === null ?
      composition.byInstrument
    : groupPositions(positionsForBank(selectedBankId), ({ instrument }) => ({
        key: instrument?.id ?? 'unknown',
        id: instrument?.id ?? null,
        name: instrument?.name ?? 'Instrumento sin identificar',
        isin: instrument?.isin ?? null,
      })).map((instrument) => ({
        ...instrument,
        percentage: selectedMarketValue ? (instrument.marketValue / selectedMarketValue) * 100 : 0,
      }));

  const factor = sort.direction === 'asc' ? 1 : -1;
  const sortedInstruments = [...instruments].sort((a, b) =>
    sort.key === 'name' ?
      (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }) * factor
    : (a.marketValue - b.marketValue) * factor,
  );

  const handleSort = (key) =>
    setSort((current) =>
      current.key === key ?
        { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: key === 'name' ? 'asc' : 'desc' },
    );

  const scopeLabel = selectedBank ? selectedBank.name : 'Todos los bancos';

  // El PDF siempre muestra la cartera completa, no el filtro de banco activo en pantalla
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      await downloadReportPdf({
        client: report.client,
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

  const instrumentColumns = [
    {
      key: 'name',
      header: 'Instrumento',
      sortable: true,
      render: (row) => (
        <div className='cell-identity'>
          <span className='cell-identity__primary'>{row.name}</span>
          <span className='cell-identity__secondary'>{row.isin ?? 'Sin ISIN'}</span>
        </div>
      ),
    },
    {
      key: 'marketValue',
      header: 'Valor de mercado (USD)',
      align: 'end',
      sortable: true,
      render: (row) => formatAmount(row.marketValue),
    },
    {
      key: 'percentage',
      header: selectedBank ? `% en ${selectedBank.name}` : '% de la cartera',
      align: 'end',
      render: (row) => (
        <span className='share-cell'>
          <ShareBar value={row.percentage} />
          {formatPercent(row.percentage)}
        </span>
      ),
    },
  ];

  return (
    <div className='report'>
      <header className='report__header'>
        <div className='page-header__text'>
          <h2 className='report__title'>{report.client.commercialName}</h2>
          <p className='page-header__subtitle'>
            {report.client.legalName}
            {reportWindow && (
              <>
                {' · '}Posiciones informadas del {formatIsoDate(reportWindow.from)} al{' '}
                {formatIsoDate(reportWindow.to)}
              </>
            )}
          </p>
        </div>
        <div className='page__actions'>
          <Link to={`/clients/${clientId}`} className='button button--tertiary'>
            Gestionar cliente
          </Link>
          <Button
            type='secondary'
            icon={FiDownload}
            label={isExporting ? 'Generando PDF…' : 'Descargar PDF'}
            title={
              analysis ?
                'Incluye la cartera y el análisis de noticias de hoy'
              : 'Incluye la cartera. Generá el análisis de noticias para sumarlo al PDF'
            }
            onClick={handleDownloadPdf}
            disabled={isExporting || (!hasPositions && !analysis)}
            aria-busy={isExporting}
          />
        </div>
      </header>

      {hasPositions ?
        <>
          <dl className='metrics'>
            <div className='metric'>
              <dt className='metric__label'>Valor consolidado</dt>
              <dd className='metric__value'>
                <span className='metric__unit'>USD</span>
                {formatAmount(totalMarketValue)}
              </dd>
              <dd className='metric__context'>Últimas posiciones de cada cuenta</dd>
            </div>
            <div className='metric'>
              <dt className='metric__label'>Instrumentos</dt>
              <dd className='metric__value'>{composition.byInstrument.length}</dd>
              <dd className='metric__context'>{positions.length} posiciones informadas</dd>
            </div>
            <div className='metric'>
              <dt className='metric__label'>Bancos</dt>
              <dd className='metric__value'>{bankTotals.length}</dd>
              <dd className='metric__context'>
                Mayor exposición: {bankTotals[0]?.name ?? '—'}
              </dd>
            </div>
          </dl>

          <section className='bank-filter' aria-labelledby='bank-filter-title'>
            <h3 id='bank-filter-title' className='bank-filter__title'>
              Ver por banco
            </h3>
            <div className='bank-filter__options'>
              {[{ id: null, name: 'Todos los bancos', marketValue: totalMarketValue }, ...bankTotals].map(
                (bank) => {
                  const isActive = selectedBankId === bank.id;
                  return (
                    <button
                      key={bank.id ?? 'total'}
                      type='button'
                      className='bank-filter__option'
                      aria-pressed={isActive}
                      onClick={() => selectBank(bank.id)}>
                      <span className='bank-filter__name'>{bank.name}</span>
                      <span className='bank-filter__value'>{formatUSD(bank.marketValue)}</span>
                      {bank.id !== null && (
                        <span className='bank-filter__share'>
                          {formatPercent(
                            totalMarketValue ? (bank.marketValue / totalMarketValue) * 100 : 0,
                          )}
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </section>

          <div className='report__grid'>
            <section className='card' aria-labelledby='allocation-title'>
              <header className='card__header'>
                <div className='card__heading'>
                  <h3 id='allocation-title' className='card__title'>
                    Composición por tipo de activo
                  </h3>
                  <p className='card__subtitle'>
                    {scopeLabel} · {formatUSD(selectedMarketValue)}
                  </p>
                </div>
              </header>
              <AssetAllocationChart clientId={clientId} />
            </section>

            <section className='panel' aria-labelledby='instruments-title'>
              <div className='panel__toolbar'>
                <div className='panel__heading'>
                  <h3 id='instruments-title' className='panel__title'>
                    Instrumentos de la cartera
                  </h3>
                  <p className='panel__count'>
                    {scopeLabel} · {instruments.length}{' '}
                    {instruments.length === 1 ? 'instrumento' : 'instrumentos'}
                  </p>
                </div>
              </div>
              <DataTable
                columns={instrumentColumns}
                data={sortedInstruments}
                getRowKey={(row) => row.id ?? 'unknown'}
                sort={sort}
                onSort={handleSort}
                itemLabel='instrumentos'
              />
            </section>
          </div>
        </>
      : <div className='card'>
          <div className='empty-state empty-state--compact'>
            <FiBarChart2 className='empty-state__icon' aria-hidden='true' />
            <p className='empty-state__title'>Sin posiciones recientes</p>
            <p className='empty-state__text'>
              Este cliente no tiene posiciones informadas en los últimos 30 días. Importá sus
              posiciones desde la página de clientes para ver el reporte.
            </p>
          </div>
        </div>
      }

      <NewsAnalysis clientId={clientId} hasPositions={hasPositions} />
    </div>
  );
};

const ClientList = ({ clients, selectedId, onSelect }) => {
  const searchId = useId();
  const [query, setQuery] = useState('');

  const visibleClients = useMemo(() => {
    const term = normalize(query);
    if (!term) return clients;
    return clients.filter((client) =>
      [client.clientDetails.commercialName, client.clientDetails.legalName].some((value) =>
        normalize(value).includes(term),
      ),
    );
  }, [clients, query]);

  const isFiltered = query.trim() !== '';

  return (
    <aside className='panel client-list' aria-labelledby={`${searchId}-title`}>
      <div className='client-list__header'>
        <div className='panel__heading'>
          <h2 id={`${searchId}-title`} className='panel__title'>
            Clientes
          </h2>
          <p className='panel__count' aria-live='polite'>
            {isFiltered ?
              `${visibleClients.length} de ${clients.length}`
            : `${clients.length} ${clients.length === 1 ? 'cliente' : 'clientes'}`}
          </p>
        </div>

        <div className='search-field' role='search'>
          <label htmlFor={searchId} className='sr-only'>
            Buscar clientes
          </label>
          <FiSearch className='search-field__icon' aria-hidden='true' />
          <input
            id={searchId}
            type='search'
            placeholder='Buscar cliente'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Escape' && setQuery('')}
          />
          {isFiltered && (
            <button
              type='button'
              className='search-field__clear'
              onClick={() => setQuery('')}
              aria-label='Limpiar búsqueda'
              title='Limpiar búsqueda'>
              <FiX aria-hidden='true' />
            </button>
          )}
        </div>
      </div>

      {visibleClients.length === 0 ?
        <p className='client-list__empty'>Ningún cliente coincide con «{query.trim()}».</p>
      : <ul className='client-list__items'>
          {visibleClients.map((client) => (
            <li key={client._id}>
              <button
                type='button'
                className='client-list__item'
                aria-current={selectedId === client._id ? 'true' : undefined}
                onClick={() => onSelect(client._id)}>
                <span className='client-list__name'>{client.clientDetails.commercialName}</span>
                <span className='client-list__legal'>{client.clientDetails.legalName}</span>
              </button>
            </li>
          ))}
        </ul>
      }
    </aside>
  );
};

const Reports = () => {
  const [clients, setClients] = useState([]);
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  // El cliente elegido vive en la URL: se conserva al recargar o volver atrás (spec §8.6)
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('cliente') ?? '';

  useEffect(() => {
    const controller = new AbortController();

    const loadClientsAndBanks = async () => {
      try {
        const [clientList, bankList] = await Promise.all([
          getAllPages('/client', controller.signal),
          getAllPages('/bank', controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setClients(clientList);
        setBanks(bankList);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.userMessage || 'No se pudieron cargar los clientes y bancos.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadClientsAndBanks();

    return () => controller.abort();
  }, [reloadKey]);

  const handleRetry = () => {
    setError('');
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const selectClient = (clientId) => setSearchParams({ cliente: clientId });

  const selectedClient = clients.find((client) => client._id === selectedId);

  return (
    <div className='page'>
      <PageHeader
        title='Reportes'
        subtitle='Consultá la composición de la cartera de cada cliente y las noticias que pueden afectarla.'
      />

      {isLoading && <LoadingState label='Cargando clientes...' />}
      {!isLoading && error && <ErrorState message={error} onRetry={handleRetry} />}

      {!isLoading && !error && clients.length === 0 && (
        <div className='card'>
          <div className='empty-state'>
            <FiUsers className='empty-state__icon' aria-hidden='true' />
            <p className='empty-state__title'>Todavía no tenés clientes</p>
            <p className='empty-state__text'>
              Registrá un cliente e importá sus posiciones para ver sus reportes.
            </p>
            <Link to='/clients' className='button button--primary'>
              Ir a clientes
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !error && clients.length > 0 && (
        <div className='reports'>
          <ClientList clients={clients} selectedId={selectedId} onSelect={selectClient} />

          <div className='reports__detail'>
            {selectedClient ?
              <ClientReport key={selectedClient._id} client={selectedClient} banks={banks} />
            : <div className='card'>
                <div className='empty-state'>
                  <FiBarChart2 className='empty-state__icon' aria-hidden='true' />
                  <p className='empty-state__title'>Elegí un cliente</p>
                  <p className='empty-state__text'>
                    Seleccioná un cliente de la lista para ver su cartera, su composición y el
                    análisis de noticias.
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
