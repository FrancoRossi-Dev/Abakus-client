# Abakus — Especificación agnóstica de diseño

**Versión:** 1.0 · **Fecha:** 19 de octubre de 2026  
**Naturaleza:** documento de criterios para evaluar el resultado visual y de experiencia de usuario.  
**Alcance:** marca, interfaz, visualización financiera, componentes, interacción y accesibilidad.  
**No prescribe:** tecnología, framework, librerías, estructura de archivos, metodología de estilos ni arquitectura de software.

> **Cómo leer este documento:** **Confirmado** indica una decisión expresa del producto. **Referencia propuesta** indica un valor orientativo todavía revisable. **Pendiente** indica una definición que no debe presentarse como resuelta. El resultado debe respetar las decisiones confirmadas y preservar la coherencia de las propuestas hasta que sean sustituidas formalmente.

## 1. Producto y objetivo de experiencia

**Confirmado.** Abakus es una aplicación para **asesores financieros y gestores patrimoniales** que permite administrar una cartera de clientes, asociar cuentas bancarias a cada cliente, consolidar inversiones y consultar reportes relacionados.

El producto debe transmitir control, claridad y confianza. La información relevante debe ser fácil de localizar, comparar y comprender. No debe aparentar que garantiza rendimiento financiero ni ofrecer funcionalidades de asesoramiento no definidas.

**Confirmado:** la interfaz tiene un modelo **híbrido**: indicadores y visualizaciones para comprender; tablas para operar. La **densidad es equilibrada**: suficiente información simultánea, sin sacrificar legibilidad ni jerarquía visual.

## 2. Identidad y personalidad

**Confirmado:** concepto rector **Convergencia inteligente**: múltiples fuentes financieras integradas en una visión unificada, ordenada y comprensible.

**Confirmado:** escritura de marca **Abakus**, con inicial mayúscula.

### Ejes de personalidad confirmados

La escala va de 0 (primer atributo) a 100 (segundo):

| Eje | Posición |
|---|---:|
| Tradicional / Innovadora | 66 |
| Institucional / Cercana | 35 |
| Sobria / Expresiva | 26 |
| Simple / Sofisticada | 40 |
| Estable / Dinámica | 25 |

**Resultado esperado:** identidad profesional, serena, sistemática, confiable y actual, sin gestos exageradamente futuristas, promocionales o lúdicos. El lenguaje verbal debe ser directo, preciso y sobrio.

~~**Confirmado:** se pospone el logotipo. En exploraciones anteriores resultaron más relevantes las alternativas identificadas como **1 y 3**. Evitar asumir como solución la composición de un monograma «A» seguido del nombre «Abakus», por su posible redundancia. No inventar un logotipo definitivo.~~

**Propuesta final de logo:** documentada en la planilla `Abakus Brand Identity Board.png` (símbolo de tres nodos que convergen en uno, con el trazo central como acento). Recursos de referencia: `logo.png` y `favicon.png`. La planilla sirve de índice de uso:

- **Versiones:** principal horizontal, horizontal compacta, vertical y símbolo solo.
- **Significado:** múltiples fuentes → convergencia (acento verde) → una visión unificada.
- **Reducción:** el símbolo se valida en 48, 32, 24 y 16 px (mínimo 16 px).
- **Monocromo:** variantes en un solo color.
- **Fondos:** blanco, fondo general claro y azul profundo (versión invertida).
- **Zona de respeto:** margen libre alrededor del logotipo, con un módulo «A» como unidad.

**Reglas de implementación:** el logo usa los colores de la §3 (azul profundo `#102A48` y verde `#2CB99A` como acento gráfico), no los que aparecen en los PNG de referencia. **Pendiente:** la tipografía definitiva del logotipo (la planilla muestra una sans geométrica distinta de Inter) y la medida exacta de la zona de respeto.

**Propuesta:** lenguaje gráfico con modularidad, convergencia y síntesis; geometría controlada y poca ornamentación. Evitar flechas de crecimiento evidentes, gráficos ascendentes genéricos, escudos bancarios, efectos brillantes y estética especulativa.

## 3. Color

**Confirmado:** los **azules** dominan la identidad y el **verde** funciona como acento. Los fondos y superficies deben permitir lectura cómoda y dar protagonismo a los datos. El acento verde debe ser intencional y contenido, no un segundo color dominante indiscriminado.

### Referencia cromática propuesta (no definitiva)

| Función visual | Referencia |
|---|---|
| Azul profundo institucional | `#102A48` |
| Azul principal de navegación/acción | `#173D63` |
| Azul secundario | `#276895` |
| Verde acento de mayor contraste | `#087F69` |
| Verde acento complementario | `#2CB99A` |
| Verde de superficie suave | `#DDF5EE` |
| Fondo general claro | `#F3F6F9` |
| Superficie principal | `#FFFFFF` |
| Borde neutro | `#E2E8EF` |
| Texto principal | `#14283C` |
| Texto secundario | `#526477` |

### Estados semánticos: referencia propuesta

- Éxito o confirmación: `#087F69`.
- Advertencia: `#A15C00`.
- Error: `#B42318`.
- Información: `#12618B`.

**Reglas del resultado:** el color semántico debe transmitir su significado junto con texto, signo o iconografía. El verde de marca no debe confundirse automáticamente con rentabilidad positiva; una variación patrimonial favorable y una operación completada son conceptos diferentes. Las combinaciones de texto y fondo deben verificar contraste suficiente.

## 4. Tipografía y números

**Referencia propuesta:** familia sans serif **Inter**, o una alternativa de legibilidad y carácter equivalente. No está aprobada como decisión final.

| Rol | Tamaño / interlineado de referencia |
|---|---|
| Indicador destacado | 32 / 40 px |
| Título principal | 24 / 32 px |
| Título de sección | 20 / 28 px |
| Subtítulo | 16 / 24 px |
| Texto principal de interfaz | 14 / 22 px |
| Texto de lectura | 16 / 24 px |
| Metadatos y ayudas | 12 / 16 px |

**Reglas del resultado:** diferenciar títulos, subtítulos, cuerpo y metadatos con una jerarquía consistente. Las cifras de importes y porcentajes deben alinearse visualmente con números tabulares. En columnas de datos, los importes deben quedar alineados a la derecha. Evitar texto pequeño para información operativa esencial.

## 5. Espaciado, superficies y densidad

**Confirmado:** densidad visual equilibrada; presentación ordenada con espacios suficientes, sin tarjetas innecesarias ni exceso de separadores.

**Referencias propuestas, sujetas a revisión en contextos reales:**

- Ritmo de espaciado de 4 px, con intervalos habituales de 8, 12, 16, 24 y 32 px.
- Separación entre secciones principales: 24–32 px.
- Espaciado interior de tarjetas: 20–24 px.
- Esquinas moderadamente redondeadas: controles ~6 px, tarjetas ~10 px, paneles ~12 px.
- Altura usual de controles: ~40 px, sin perjuicio de áreas de interacción táctiles accesibles.
- Filas de tablas: cómoda ~52 px (predeterminada); compacta ~40 px; amplia ~64 px.
- Preferir divisiones sutiles a sombras decorativas pronunciadas.

**Resultado esperado:** las pantallas deben conservar una jerarquía estable y una densidad visual comparable. La variante compacta no debe comprometer comprensión ni accesibilidad.

## 6. Navegación y organización de pantallas

### Vistas principales previstas

**Dashboard general.** Debe permitir identificar patrimonio gestionado, cantidad de clientes y cuentas, estado de consolidación, alertas operativas y actividad relevante. Los indicadores han de distinguir valores disponibles de valores pendientes o parciales.

**Gestión de clientes.** Debe priorizar búsqueda, filtrado, ordenamiento y acceso al detalle. En superficies amplias, el formato tabular es preferible a una grilla de tarjetas para tareas operativas frecuentes.

**Detalle de cartera.** Debe presentar una visión general del cliente y su patrimonio, cuentas relacionadas, posiciones de inversión y acceso a reportes. Resumen, posiciones, cuentas, movimientos y reportes son secciones posibles; su disponibilidad real depende de los requisitos funcionales.

**Referencia propuesta:** navegación principal persistente en pantallas amplias y adaptación clara a espacios reducidos. Ninguna pantalla debe depender de ver simultáneamente todas las columnas para resultar utilizable.

## 7. Componentes visuales comunes

Los elementos con la misma función deben mantener apariencia y respuesta coherentes en todas las vistas.

| Componente | Resultado esperado |
|---|---|
| Botones | Jerarquía clara entre acción principal, secundaria y destructiva; estados distinguibles. |
| Campos y selectores | Etiquetas visibles, ayudas comprensibles, errores asociados al campo. |
| Tarjetas | Agrupación significativa; títulos y contenidos con jerarquía clara. |
| Etiquetas de estado | Texto legible y significado inequívoco; no depender solo del color. |
| Pestañas | Estado activo evidente, navegación entendible. |
| Filtros | Criterios activos visibles y fáciles de retirar. |
| Mensajes y alertas | Gravedad, causa y posible acción diferenciadas. |
| Diálogos y paneles | Contexto y salida clara, sin pérdida accidental del trabajo. |

Estados relevantes: **predeterminado, hover, foco, activo, seleccionado, deshabilitado, cargando, vacío, sin resultados y error**. No todos aplican a todos los componentes, pero donde correspondan deben ser reconocibles y consistentes.

## 8. Tablas: patrón general

**Confirmado:** tablas operativas para clientes, cuentas y posiciones. Las tablas con muchas columnas deben ofrecer **vistas predefinidas y personalizables**.

**Reglas del resultado:**

1. Mostrar qué información representa la tabla y cuántos registros o resultados contiene.
2. Encabezados legibles; columnas numéricas alineadas a la derecha.
3. Ordenamiento con dirección visible; fechas e importes ordenados por su valor real, no por apariencia textual.
4. Búsqueda y filtros claros; poder eliminar un filtro sin restablecer todos.
5. Distinguir **seleccionar** registros de **abrir o inspeccionar** un registro.
6. Preservar la selección, filtros y contexto de manera predecible al consultar detalles o cambiar páginas.
7. Ofrecer un estado explícito cuando no hay datos, cuando no hay coincidencias y cuando ocurre un error.
8. Informar cuando los datos son antiguos, incompletos o parciales.
9. Permitir consultar columnas secundarias sin sacrificar la lectura de las principales.
10. Mantener el uso accesible por teclado y con ayudas textuales para estados e iconos.

### Densidades de tabla (propuestas)

| Variante | Referencia | Uso |
|---|---:|---|
| Compacta | ~40 px por fila | Grandes volúmenes, usuarios expertos |
| Cómoda | ~52 px por fila | **Predeterminada** |
| Amplia | ~64 px por fila | Registros con información secundaria |

### Vistas predefinidas y personales

**Confirmado:** el usuario puede elegir vistas predefinidas y personalizarlas.

**Comportamiento propuesto:**

- Una vista del sistema ofrece un punto de partida reconocible y recuperable.
- Una vista personal puede guardar selección y orden de columnas, criterios de ordenamiento, filtros persistentes y densidad.
- Los cambios no guardados deben diferenciarse claramente de una configuración guardada.
- Restaurar una vista debe recuperar su configuración anterior.
- El identificador principal del registro debe permanecer visible.
- Una columna añadida no debe volver inusable la tabla; deben existir opciones claras para reordenar y ocultar columnas.
- Las vistas personales y su persistencia definitiva son una funcionalidad a confirmar; no presentar como entregada una capacidad no implementada.

## 9. Tablas de dominio

### 9.1 Clientes

**Columnas propuestas:** cliente e identificador, patrimonio consolidado (USD), cantidad de cuentas, última actualización, estado de consolidación y acciones.

**Comportamiento esperado:** localizar rápidamente clientes; distinguir registros y estados de sus carteras; acceder a su detalle sin confundir la apertura con la selección múltiple.

### 9.2 Cuentas

**Columnas propuestas:** institución, cuenta identificada de forma parcialmente oculta, saldo o valoración (USD), referencia temporal, estado y acciones.

**Comportamiento esperado:** identificar información vigente y cuentas pendientes, con error o desactualizadas. No sustituir datos ausentes por ceros; no ocultar silenciosamente cuentas excluidas del consolidado.

**Pendiente:** el origen de los datos (manual, importado o conectado) y los mecanismos de actualización.

### 9.3 Posiciones de inversión

**Vistas propuestas:**

- **Resumen:** instrumento, clase de activo, valor en USD y participación de cartera.
- **Composición:** instrumento, clase de activo, institución, valor y peso porcentual.
- **Rendimiento:** instrumento, valor y métricas de variación/rendimiento **solo si existe una metodología validada**.

**Comportamiento esperado:** comparar valores, pesos y composición sin sobrecargar una misma tabla. La consulta de información detallada debe preservar el contexto de trabajo.

**Pendiente:** métodos de valuación, rentabilidad, flujos y series históricas. No representar variación patrimonial como rentabilidad demostrada.

## 10. Componentes financieros y dashboards

| Componente conceptual | Resultado esperado |
|---|---|
| Indicador principal (MetricCard) | Métrica, unidad, contexto temporal y, si corresponde, estado o variación. |
| Resumen de cartera (PortfolioSummary) | Valor consolidado en USD, fecha de referencia y alcance de la consolidación. |
| Composición de activos (AssetAllocation) | Categorías identificables, participación relativa e importes coherentes con el total. |
| Evolución temporal (TimeSeriesChart) | Ejes, fechas, unidades, período y explicaciones suficientes para no inducir a error. |
| Valor monetario (MoneyValue) | Presentación monetaria coherente, con formato y estados ausentes diferenciados. |
| Indicador de variación (VariationIndicator) | Signo, magnitud y período; nunca solo color. |
| Estado de consolidación | Diferenciar completa, parcial, pendiente, desactualizada y error según proceda. |
| Vigencia de datos | Mostrar cuándo fueron valuados, actualizados o sincronizados, sin confundir eventos. |

**Regla esencial:** los gráficos deben ampliar la comprensión, no decorar. Los datos de ejemplo, cuando se utilicen, deben estar identificados como ficticios y guardar consistencia entre tarjetas, tablas, totales y gráficos.

## 11. Moneda y formato financiero

**Confirmado:** **USD es la única moneda utilizada para presentar información en Abakus**. No mostrar selectores de moneda, comparadores de divisas ni flujos de conversión como capacidades definidas.

**Referencia de formato (propuesta):** `USD 1.284.650,00`, con punto de miles, coma decimal y dos decimales para importes habituales. En una tabla cuyo encabezado ya indique USD, se puede abreviar el prefijo por fila.

- Distinguir importes monetarios, cantidades de instrumentos, precios unitarios y porcentajes; pueden requerir diferente precisión visible.
- La presentación con menos decimales no debe alterar el dato subyacente.
- Los valores negativos deben mostrar signo explícito.
- Los totales deben indicar claramente su alcance, fecha y posibles exclusiones.
- Distinguir **0**, **dato no disponible**, **no aplicable**, **pendiente** y **error**.

**Pendiente:** aclarar si las fuentes originales ya están expresadas en USD o si se reciben valores previamente convertidos. Esta especificación no asume mecanismos de conversión.

## 12. Accesibilidad y confianza

**Objetivo propuesto:** WCAG 2.2 nivel AA para las interfaces aplicables.

**Condiciones del resultado:**

- Texto normal con contraste de al menos **4,5:1** y texto grande al menos **3:1**, según criterios aplicables.
- Indicadores visuales de foco claramente perceptibles.
- Acciones y navegación accesibles mediante teclado.
- Estados y variaciones comprensibles sin depender únicamente de colores.
- Campos con etiquetas, instrucciones y mensajes de error comprensibles.
- Gráficos con datos o descripciones alternativas adecuadas.
- Controles táctiles con tamaño y separación apropiados para su uso.
- Cifras con unidades y signos; fechas con significado explícito.
- Identificadores bancarios sensibles parcialmente ocultos cuando corresponda.
- Cambios de contenido que no provoquen desorientación o pérdida involuntaria del contexto.

## 13. Adaptación a diferentes tamaños

**Referencia propuesta:** priorizar uso en escritorio, pero conservar una experiencia utilizable en pantallas reducidas.

- La jerarquía de información debe mantenerse, aunque cambie su distribución.
- Las tarjetas pueden reorganizarse, pero no omitir métricas esenciales arbitrariamente.
- Las tablas pueden priorizar columnas, permitir desplazamiento o abrir detalles; nunca truncar información crítica sin una forma de consultarla.
- Los controles, filtros y acciones esenciales deben seguir siendo accesibles.
- No exigir interacciones exclusivas de mouse.

No hay breakpoints ni diseños móviles definitivos aprobados.

## 14. Límites de interpretación

Este documento **no autoriza a dar por decidido**:

- La tipografía del logotipo ni variantes del logo fuera de la planilla `Abakus Brand Identity Board.png`.
- La aprobación final de los colores HEX, familia tipográfica o dimensiones propuestas.
- Un tema oscuro.
- Funcionalidades de integración bancaria concretas o sincronización automática.
- Algoritmos y metodologías de rentabilidad o valoración.
- Modelo definitivo de permisos, operaciones masivas o exportación.
- Contenido exacto de los reportes.
- Comportamientos no tratados que puedan alterar la lógica financiera.

Ante una definición ausente, mantener una solución visual neutra y consistente y registrar el punto como pendiente; **no convertir supuestos en decisiones de producto**.

## 15. Criterios de evaluación del resultado

Una propuesta visual o interfaz se considera alineada con Abakus si:

- [ ] Refleja una marca profesional, sobria, confiable y contemporánea.
- [ ] Mantiene el azul predominante y el verde como acento contenido.
- [ ] Presenta jerarquía clara, densidad equilibrada y componentes consistentes.
- [ ] Usa indicadores visuales para síntesis y tablas para operación.
- [ ] Expresa importes en USD de forma coherente.
- [ ] Ofrece vistas de tabla predefinidas y personalizables cuando corresponda.
- [ ] Permite identificar filtros, ordenamientos y estados de selección.
- [ ] Distingue datos completos, parciales, antiguos, ausentes y erróneos.
- [ ] No confunde variación patrimonial con rentabilidad.
- [ ] Cumple las condiciones de accesibilidad aplicables.
- [ ] Evita incorporar branding o funcionalidades no aprobadas como si fueran definitivas.
- [ ] Mantiene sentido y utilidad en diferentes tamaños de pantalla.

---

**Estado del documento:** especificación agnóstica utilizable como referencia de resultado. Los valores marcados como *referencia propuesta* pueden ajustarse tras validación; las decisiones *confirmadas* permanecen vigentes hasta una revisión explícita.
