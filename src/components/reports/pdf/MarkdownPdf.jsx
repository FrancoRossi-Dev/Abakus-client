import { Link, Text, View } from '@react-pdf/renderer';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { styles } from './pdfStyles';

/*
 * Convierte el markdown del análisis IA a primitivas de react-pdf.
 * Se parsea a AST (mdast) y cada nodo se dibuja con su estilo; un nodo no contemplado
 * se muestra como su texto plano, así nunca se pierde contenido.
 */

const parser = unified().use(remarkParse).use(remarkGfm);

// "https://www.reuters.com/..." → "reuters.com" (igual que en la página)
const getHostname = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const plainText = (node) =>
  node.value ?? (node.children ? node.children.map(plainText).join('') : '');

// El título de la sección es el nivel principal: los encabezados del texto bajan un nivel
const HEADING_STYLES = { 1: styles.mdH3, 2: styles.mdH3, 3: styles.mdH4 };

// --- Nodos en línea (dentro de un <Text>) ---
const renderInline = (node, key) => {
  switch (node.type) {
    case 'text':
      return node.value;
    case 'strong':
      return (
        <Text key={key} style={styles.strong}>
          {node.children.map(renderInline)}
        </Text>
      );
    case 'emphasis':
      return (
        <Text key={key} style={{ fontFamily: 'Helvetica-Oblique' }}>
          {node.children.map(renderInline)}
        </Text>
      );
    case 'delete':
      return (
        <Text key={key} style={{ textDecoration: 'line-through' }}>
          {node.children.map(renderInline)}
        </Text>
      );
    case 'inlineCode':
      return (
        <Text key={key} style={styles.mdCode}>
          {node.value}
        </Text>
      );
    case 'link': {
      const text = plainText(node);
      const isBareUrl = /^https?:\/\//.test(text);
      return (
        <Link key={key} src={node.url} style={styles.mdLink}>
          {isBareUrl ? getHostname(node.url) : node.children.map(renderInline)}
        </Link>
      );
    }
    case 'break':
      return '\n';
    default:
      return plainText(node);
  }
};

// --- Nodos de bloque ---
const renderBlock = (node, key) => {
  switch (node.type) {
    case 'heading':
      return (
        <Text key={key} style={HEADING_STYLES[node.depth] ?? styles.mdH5} minPresenceAhead={40}>
          {node.children.map(renderInline)}
        </Text>
      );

    case 'paragraph':
      return (
        <Text key={key} style={styles.mdParagraph}>
          {node.children.map(renderInline)}
        </Text>
      );

    case 'list':
      return (
        <View key={key} style={styles.mdList}>
          {node.children.map((item, index) => (
            <View key={index} style={styles.mdListItem}>
              <Text style={styles.mdBullet}>
                {node.ordered ? `${(node.start ?? 1) + index}.` : '•'}
              </Text>
              <View style={styles.mdListBody}>
                {item.children.map((child, childIndex) =>
                  // Dentro de una lista el párrafo no lleva margen extra
                  child.type === 'paragraph' ?
                    <Text key={childIndex}>{child.children.map(renderInline)}</Text>
                  : renderBlock(child, childIndex),
                )}
              </View>
            </View>
          ))}
        </View>
      );

    case 'blockquote':
      return (
        <View key={key} style={styles.mdQuote}>
          {node.children.map(renderBlock)}
        </View>
      );

    case 'thematicBreak':
      return <View key={key} style={styles.mdRule} />;

    case 'code':
      return (
        <Text key={key} style={[styles.mdParagraph, styles.mdCode]}>
          {node.value}
        </Text>
      );

    case 'table':
      return (
        <View key={key} style={styles.mdTable}>
          {node.children.map((row, rowIndex) => {
            const isHead = rowIndex === 0;
            const isLast = rowIndex === node.children.length - 1;
            return (
              <View
                key={rowIndex}
                wrap={false}
                style={isHead ? styles.tableHead : isLast ? styles.tableRowLast : styles.tableRow}>
                {row.children.map((cell, cellIndex) => (
                  <Text key={cellIndex} style={[styles.mdTableCell, isHead && styles.strong]}>
                    {cell.children.map(renderInline)}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      );

    case 'html':
      return null;

    default:
      return (
        <Text key={key} style={styles.mdParagraph}>
          {plainText(node)}
        </Text>
      );
  }
};

const MarkdownPdf = ({ children = '' }) => {
  const tree = parser.parse(children);
  return <View>{tree.children.map(renderBlock)}</View>;
};

export default MarkdownPdf;
