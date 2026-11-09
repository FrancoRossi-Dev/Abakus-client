import { Circle, Document, G, Link, Page, Path, Svg, Text, View } from '@react-pdf/renderer';
import MarkdownPdf from './MarkdownPdf';
import { COLORS, styles } from './pdfStyles';
import {
  formatAmount,
  formatDateTime,
  formatIsoDate,
  formatPercent,
  formatTime,
  formatUSD,
} from '../../../utils/format';

const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

// Símbolo de Abakus (mismos trazos que components/brand/Logo.jsx), con los colores del spec §3
const LogoMark = ({ size = 18 }) => (
  <Svg viewBox='0 0 86 74.6' style={{ width: size * (86 / 74.6), height: size }}>
    <G stroke={COLORS.blue900} strokeWidth={6} fill='none'>
      <Path d='M10.5 10.5H32C41 10.5 44 16.1 47 21.1C52 29.6 59 34.1 70 35.6' />
      <Path d='M10.5 64.1H32C41 64.1 44 58.5 47 53.5C52 45 59 40.5 70 39' />
    </G>
    <Path d='M10.5 37.3H75.5' stroke={COLORS.green400} strokeWidth={6} fill='none' />
    <Circle cx='10.5' cy='10.5' r='10.5' fill={COLORS.blue900} />
    <Circle cx='10.5' cy='64.1' r='10.5' fill={COLORS.blue900} />
    <Circle cx='75.5' cy='37.3' r='10.5' fill={COLORS.blue900} />
    <Circle cx='10.5' cy='37.3' r='10.5' fill={COLORS.green400} />
  </Svg>
);

/**
 * Tabla genérica: columns = [{ header, width, align?, render(row) }]
 * Las filas no se parten entre páginas y el encabezado se repite en cada una.
 */
const Table = ({ columns, rows, getKey }) => (
  <View style={styles.table}>
    <View style={styles.tableHead} fixed>
      {columns.map((column) => (
        <Text
          key={column.header}
          style={[styles.th, { width: column.width }, column.align === 'end' && styles.end]}>
          {column.header}
        </Text>
      ))}
    </View>
    {rows.map((row, index) => (
      <View
        key={getKey(row, index)}
        style={index === rows.length - 1 ? styles.tableRowLast : styles.tableRow}
        wrap={false}>
        {columns.map((column) => (
          <View key={column.header} style={[styles.td, { width: column.width }]}>
            {column.render(row)}
          </View>
        ))}
      </View>
    ))}
  </View>
);

const Metric = ({ label, value, unit, context }) => (
  <View style={styles.metric}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>
      {unit ? <Text style={styles.metricUnit}>{unit} </Text> : null}
      {value}
    </Text>
    {context && <Text style={styles.metricContext}>{context}</Text>}
  </View>
);

const Section = ({ title, note, children, breakBefore = false }) => (
  <View style={styles.section} break={breakBefore}>
    <Text style={styles.sectionTitle} minPresenceAhead={60}>
      {title}
    </Text>
    {note && <Text style={styles.sectionNote}>{note}</Text>}
    {children}
  </View>
);

const AllocationSection = ({ slices }) => (
  <Section title='Composición por tipo de activo'>
    {/* Barra 100 % segmentada: la misma información que la dona de la página */}
    <View style={styles.stackBar}>
      {slices.map((slice) => (
        <View
          key={slice.type}
          style={{ width: `${slice.percentage}%`, backgroundColor: slice.color }}
        />
      ))}
    </View>
    <Table
      rows={slices}
      getKey={(slice) => slice.type}
      columns={[
        {
          header: 'Tipo',
          width: '50%',
          render: (slice) => (
            <View style={styles.cellRow}>
              <View style={[styles.swatch, { backgroundColor: slice.color }]} />
              <Text>{slice.label}</Text>
            </View>
          ),
        },
        {
          header: 'Valor (USD)',
          width: '30%',
          align: 'end',
          render: (slice) => <Text style={styles.end}>{formatAmount(slice.value)}</Text>,
        },
        {
          header: '%',
          width: '20%',
          align: 'end',
          render: (slice) => <Text style={styles.end}>{formatPercent(slice.percentage)}</Text>,
        },
      ]}
    />
  </Section>
);

const SourceItem = ({ source }) => (
  <View style={styles.source} wrap={false}>
    <Link src={source.url} style={styles.sourceTitle}>
      {source.title || getHostname(source.url)}
    </Link>
    <Link src={source.url} style={styles.sourceUrl}>
      {getHostname(source.url)}
    </Link>
    {source.foundInSearch === false && (
      <Text style={styles.warningTag}>Verificar: no surgió de la búsqueda</Text>
    )}
  </View>
);

const AnalysisSection = ({ entry }) => {
  const { report, generatedAt } = entry;
  const topPositions = report.portfolio?.topPositions ?? [];
  const sources = report.sources ?? [];
  const combinedShare = topPositions.reduce((sum, position) => sum + (position.percentage ?? 0), 0);

  return (
    <Section title='Noticias de la cartera' breakBefore>
      <Text style={styles.aiBadge}>GENERADO CON IA</Text>

      <View style={styles.metaBox}>
        <View>
          <Text style={styles.meta}>Generado</Text>
          <Text style={styles.metaValue}>
            {formatIsoDate(entry.day)} a las {formatTime(generatedAt)}
          </Text>
        </View>
        {report.newsWindow && (
          <View>
            <Text style={styles.meta}>Noticias</Text>
            <Text style={styles.metaValue}>
              Del {formatIsoDate(report.newsWindow.from)} al {formatIsoDate(report.newsWindow.to)}
            </Text>
          </View>
        )}
        {topPositions.length > 0 && (
          <View>
            <Text style={styles.meta}>Alcance</Text>
            <Text style={styles.metaValue}>
              {topPositions.length} posiciones principales · {formatPercent(combinedShare)} de la
              cartera
            </Text>
          </View>
        )}
      </View>

      {topPositions.length > 0 && (
        <View style={styles.chips}>
          {topPositions.map((position) => (
            <Text key={position.id ?? position.isin ?? position.name} style={styles.chip}>
              {position.name} <Text style={styles.muted}>{formatPercent(position.percentage)}</Text>
            </Text>
          ))}
        </View>
      )}

      <MarkdownPdf>{report.analysis}</MarkdownPdf>

      {sources.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.sectionTitle} minPresenceAhead={40}>
            Fuentes citadas ({sources.length})
          </Text>
          {sources.map((source) => (
            <SourceItem key={source.url} source={source} />
          ))}
        </View>
      )}

      <Text style={styles.disclaimer}>
        Texto generado con IA a partir de noticias públicas. Puede contener errores: verificá las
        fuentes antes de compartirlo. No constituye una recomendación de inversión.
      </Text>
    </Section>
  );
};

/**
 * Reporte de cartera de un cliente. data:
 * { client, reportWindow, totalMarketValue, instrumentCount, positionCount,
 *   banks, allocation, instruments, analysis (o null), generatedAt }
 */
const ReportPdf = ({ data }) => {
  const {
    client,
    reportWindow,
    totalMarketValue,
    instrumentCount,
    positionCount,
    banks,
    allocation,
    instruments,
    analysis,
    generatedAt,
  } = data;

  const hasPositions = positionCount > 0;
  const bankShare = (value) => (totalMarketValue ? (value / totalMarketValue) * 100 : 0);

  return (
    <Document
      title={`Reporte de cartera — ${client.commercialName}`}
      author='Abakus'
      subject='Reporte de cartera'
      language='es'>
      <Page size='A4' style={styles.page}>
        {/* Pie fijo en todas las páginas (Text con posición absoluta) */}
        <Text style={styles.footerLine} fixed />
        <Text style={styles.footerText} fixed>
          Abakus · Reporte de {client.commercialName} · Generado el {formatDateTime(generatedAt)} ·
          Importes en USD
        </Text>

        <View style={styles.brand} fixed>
          <LogoMark />
          <Text style={styles.brandName}>Abakus</Text>
          <Text style={styles.docType}>Reporte de cartera</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{client.commercialName}</Text>
          <Text style={styles.subtitle}>
            {client.legalName}
            {reportWindow &&
              ` · Posiciones informadas del ${formatIsoDate(reportWindow.from)} al ${formatIsoDate(reportWindow.to)}`}
          </Text>
        </View>

        {hasPositions ?
          <>
            <View style={styles.metrics}>
              <Metric
                label='Valor consolidado'
                unit='USD'
                value={formatAmount(totalMarketValue)}
                context='Últimas posiciones de cada cuenta'
              />
              <Metric
                label='Instrumentos'
                value={String(instrumentCount)}
                context={`${positionCount} posiciones informadas`}
              />
              <Metric
                label='Bancos'
                value={String(banks.length)}
                context={`Mayor exposición: ${banks[0]?.name ?? '—'}`}
              />
            </View>

            {allocation.length > 0 && <AllocationSection slices={allocation} />}

            <Section title='Valor por banco'>
              <Table
                rows={banks}
                getKey={(bank) => bank.id}
                columns={[
                  { header: 'Banco', width: '50%', render: (bank) => <Text>{bank.name}</Text> },
                  {
                    header: 'Valor (USD)',
                    width: '30%',
                    align: 'end',
                    render: (bank) => <Text style={styles.end}>{formatAmount(bank.marketValue)}</Text>,
                  },
                  {
                    header: '% de la cartera',
                    width: '20%',
                    align: 'end',
                    render: (bank) => (
                      <Text style={styles.end}>{formatPercent(bankShare(bank.marketValue))}</Text>
                    ),
                  },
                ]}
              />
            </Section>

            <Section
              title='Instrumentos de la cartera'
              note={`${instruments.length} ${instruments.length === 1 ? 'instrumento' : 'instrumentos'} · Total ${formatUSD(totalMarketValue)}`}>
              <Table
                rows={instruments}
                getKey={(instrument, index) => instrument.id ?? index}
                columns={[
                  {
                    header: 'Instrumento',
                    width: '52%',
                    render: (instrument) => (
                      <>
                        <Text style={styles.strong}>{instrument.name}</Text>
                        <Text style={styles.meta}>{instrument.isin ?? 'Sin ISIN'}</Text>
                      </>
                    ),
                  },
                  {
                    header: 'Valor (USD)',
                    width: '28%',
                    align: 'end',
                    render: (instrument) => (
                      <Text style={styles.end}>{formatAmount(instrument.marketValue)}</Text>
                    ),
                  },
                  {
                    header: '% de la cartera',
                    width: '20%',
                    align: 'end',
                    render: (instrument) => (
                      <Text style={styles.end}>{formatPercent(instrument.percentage)}</Text>
                    ),
                  },
                ]}
              />
            </Section>
          </>
        : <Text style={styles.muted}>
            Este cliente no tiene posiciones informadas en los últimos 30 días.
          </Text>
        }

        {analysis && <AnalysisSection entry={analysis} />}
      </Page>
    </Document>
  );
};

export default ReportPdf;
