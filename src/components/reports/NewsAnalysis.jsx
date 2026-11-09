import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FiAlertTriangle, FiCheckCircle, FiExternalLink, FiRefreshCw, FiZap } from 'react-icons/fi';
import Button from '../shared/button/Button';
import FormAlert from '../shared/form/FormAlert';
import { fetchNewsAnalysis, selectNewsAnalysis } from '../../features/reports/newsAnalysis.slice';
import { formatIsoDate, formatPercent, formatTime } from '../../utils/format';
import './NewsAnalysis.css';

// "https://www.reuters.com/markets/..." → "reuters.com"
const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

// Un link pegado tal cual (autolink) se muestra como el nombre del sitio, no como la URL entera
const MarkdownLink = ({ href, children }) => {
  const text = Array.isArray(children) ? children.join('') : children;
  const isBareUrl = typeof text === 'string' && /^https?:\/\//.test(text);

  return (
    <a href={href} target='_blank' rel='noopener noreferrer' title={href}>
      {isBareUrl ? getHostname(href) : children}
      <FiExternalLink className='markdown__external' aria-label='(se abre en otra pestaña)' />
    </a>
  );
};

// Las tablas anchas se desplazan dentro de su caja en vez de romper la tarjeta
const MarkdownTable = ({ children }) => (
  <div className='markdown__table'>
    <table>{children}</table>
  </div>
);

// El título de la tarjeta es h2: los encabezados del texto bajan un nivel para no competir con él
const MARKDOWN_COMPONENTS = {
  h1: 'h3',
  h2: 'h3',
  h3: 'h4',
  h4: 'h5',
  h5: 'h6',
  a: MarkdownLink,
  table: MarkdownTable,
};

// Fuentes citadas: las que no aparecieron en la búsqueda se marcan para revisarlas
const SourceList = ({ sources }) => (
  <ul className='news-analysis__sources'>
    {sources.map((source) => (
      <li key={source.url} className='news-analysis__source'>
        <a href={source.url} target='_blank' rel='noopener noreferrer'>
          <span className='news-analysis__source-title'>{source.title || getHostname(source.url)}</span>
          <span className='news-analysis__source-host'>
            {getHostname(source.url)}
            <FiExternalLink aria-label='(se abre en otra pestaña)' />
          </span>
        </a>
        {source.foundInSearch === false && (
          <span className='status-tag status-tag--warning'>
            <FiAlertTriangle aria-hidden='true' />
            Verificar: no surgió de la búsqueda
          </span>
        )}
      </li>
    ))}
  </ul>
);

const AnalysisResult = ({ entry }) => {
  const { report, generatedAt } = entry;
  const sources = report.sources ?? [];
  const consulted = report.consultedSources ?? [];
  const topPositions = report.portfolio?.topPositions ?? [];
  const combinedShare = topPositions.reduce((sum, position) => sum + (position.percentage ?? 0), 0);

  return (
    <>
      <dl className='news-analysis__meta'>
        <div>
          <dt>Generado</dt>
          <dd>Hoy a las {formatTime(generatedAt)}</dd>
        </div>
        {report.newsWindow && (
          <div>
            <dt>Noticias</dt>
            <dd>
              Del {formatIsoDate(report.newsWindow.from)} al {formatIsoDate(report.newsWindow.to)}
            </dd>
          </div>
        )}
        {topPositions.length > 0 && (
          <div>
            <dt>Alcance</dt>
            <dd>
              {topPositions.length} posiciones principales · {formatPercent(combinedShare)} de la
              cartera
            </dd>
          </div>
        )}
      </dl>

      {topPositions.length > 0 && (
        <ul className='news-analysis__positions' aria-label='Posiciones analizadas'>
          {topPositions.map((position) => (
            <li key={position.id ?? position.isin ?? position.name} className='news-analysis__position'>
              <span className='news-analysis__position-name'>{position.name}</span>
              <span className='news-analysis__position-share'>
                {formatPercent(position.percentage)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <article className='markdown'>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
          {report.analysis}
        </ReactMarkdown>
      </article>

      {(sources.length > 0 || consulted.length > 0) && (
        <section className='news-analysis__section' aria-labelledby='news-analysis-sources'>
          <h3 id='news-analysis-sources' className='news-analysis__section-title'>
            Fuentes citadas <span className='news-analysis__count'>({sources.length})</span>
          </h3>
          {sources.length > 0 ?
            <SourceList sources={sources} />
          : <p className='news-analysis__muted'>El análisis no cita fuentes concretas.</p>}

          {consulted.length > 0 && (
            <details className='news-analysis__details'>
              <summary>Otras páginas consultadas ({consulted.length})</summary>
              <SourceList sources={consulted} />
            </details>
          )}
        </section>
      )}

      <p className='news-analysis__disclaimer'>
        Texto generado con IA a partir de noticias públicas. Puede contener errores: verificá las
        fuentes antes de compartirlo. No constituye una recomendación de inversión.
      </p>
    </>
  );
};

/**
 * Análisis con IA de las noticias recientes sobre las mayores posiciones del cliente.
 * Se genera a pedido y queda guardado por el resto del día (newsAnalysis.slice).
 */
const NewsAnalysis = ({ clientId, hasPositions }) => {
  const dispatch = useDispatch();
  const entry = useSelector(selectNewsAnalysis(clientId));

  const status = entry?.status ?? 'idle';
  const generate = () => dispatch(fetchNewsAnalysis({ clientId }));

  return (
    <section className='card news-analysis' aria-labelledby='news-analysis-title' aria-busy={status === 'loading'}>
      <header className='card__header'>
        <div className='card__heading'>
          <h2 id='news-analysis-title' className='card__title'>
            Noticias de la cartera
            <span className='status-tag status-tag--info'>
              <FiZap aria-hidden='true' />
              IA
            </span>
          </h2>
          <p className='card__subtitle'>
            Resumen de noticias de los últimos 30 días sobre las posiciones más grandes del
            cliente.
          </p>
        </div>

        {status === 'succeeded' && (
          <span className='status-tag status-tag--success'>
            <FiCheckCircle aria-hidden='true' />
            Actualizado hoy
          </span>
        )}
      </header>

      {status === 'idle' && (
        <div className='news-analysis__intro'>
          <p className='news-analysis__muted'>
            {hasPositions ?
              'El análisis se genera una vez por día para cada cliente y queda disponible hasta mañana. Puede tardar hasta un minuto.'
            : 'Este cliente no tiene posiciones recientes: no hay nada para analizar.'}
          </p>
          <Button
            type='primary'
            icon={FiZap}
            label='Generar análisis'
            onClick={generate}
            disabled={!hasPositions}
          />
        </div>
      )}

      {status === 'loading' && (
        <div className='news-analysis__loading' role='status'>
          <div className='news-analysis__loading-text'>
            <FontAwesomeIcon icon={faSpinner} spin className='page-status__spinner' />
            <span>Buscando noticias y redactando el análisis. Puede tardar hasta un minuto…</span>
          </div>
          <div className='skeleton' aria-hidden='true'>
            <span className='skeleton__line skeleton__line--title' />
            <span className='skeleton__line' />
            <span className='skeleton__line' />
            <span className='skeleton__line skeleton__line--short' />
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className='news-analysis__intro'>
          <FormAlert title='No se pudo generar el análisis'>{entry.error}</FormAlert>
          <Button type='secondary' icon={FiRefreshCw} label='Reintentar' onClick={generate} />
        </div>
      )}

      {status === 'succeeded' && <AnalysisResult entry={entry} />}
    </section>
  );
};

export default NewsAnalysis;
