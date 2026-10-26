# Abakus — Cliente web

Frontend de **Abakus**, una aplicación para **asesores financieros y gestores patrimoniales** que permite administrar una cartera de clientes, asociar cuentas bancarias a cada cliente, consolidar inversiones y consultar reportes.

Proyecto del **Obligatorio 2** de *Desarrollo Full Stack integrado con IA* (Facultad de Ingeniería, Universidad ORT Uruguay, 2026). Este repositorio contiene el frontend, que consume la API desarrollada en el Obligatorio 1.

> Estado: **en desarrollo inicial**. Hoy el proyecto tiene el scaffold de React + Vite, la base visual y el logo integrado. Las funcionalidades están planificadas en [TODO.md](TODO.md).

## Producto

- **Concepto rector:** *Convergencia inteligente*: múltiples fuentes financieras integradas en una visión unificada, ordenada y comprensible.
- **Modelo de interfaz híbrido:** indicadores y gráficos para comprender; tablas para operar.
- **Moneda:** toda la información se presenta en **USD**. No hay selector de moneda ni conversión.
- **Alcance:** la aplicación no garantiza rendimientos ni ofrece asesoramiento financiero.

### Vistas previstas

| Vista | Propósito |
|---|---|
| Dashboard general | Patrimonio gestionado, cantidad de clientes y cuentas, estado de consolidación, alertas y actividad. |
| Gestión de clientes | Búsqueda, filtrado, ordenamiento y acceso al detalle, en formato tabla. |
| Detalle de cartera | Resumen del cliente, cuentas asociadas, posiciones de inversión y reportes. |

### Funcionalidades requeridas (Obligatorio 2)

- Registro con repetición de contraseña y auto-login; login y logout.
- Alta, listado, edición *inline*, eliminación y filtro de documentos, respetando el límite de documentos del plan.
- Informe de uso: porcentaje usado (plan **plus**, límite de 4) o cantidad total (plan **premium**).
- Cambio a plan premium.
- Gráfico con datos relevantes.
- Uso de todos los endpoints del Obligatorio 1, incluido el manejo de imágenes.
- Validaciones en el frontend antes de llamar a la API.

> **Pendiente:** definir qué entidad de Abakus cumple el rol de "documento" de la letra (por ejemplo, clientes de la cartera). La definición depende del modelo implementado en el backend del Obligatorio 1.

## Stack

| Área | Tecnología | Estado |
|---|---|---|
| UI | React 19 | Instalado |
| Build / dev server | Vite 8 | Instalado |
| Lint | ESLint 10 (hooks + react-refresh) | Instalado |
| Estado global | Redux (requerido por la letra) | Pendiente |
| Ruteo | React Router (requerido por la letra) | Pendiente |
| Formularios | Biblioteca de formularios (requerido por la letra) | Pendiente |
| Gráficos | A definir | Pendiente |
| Deploy | Vercel (requerido por la letra) | Pendiente |

## Puesta en marcha

Requisitos: Node.js y npm.

```bash
npm install
npm run dev       # servidor de desarrollo con HMR
npm run build     # build de producción en dist/
npm run preview   # sirve el build localmente
npm run lint      # análisis estático
```

> **Pendiente:** configurar la URL del backend mediante una variable de entorno (por ejemplo, `VITE_API_URL` en `.env.local`) cuando se integre la API.

## Estructura

```
├── public/              # recursos estáticos (favicon)
├── specs/               # especificaciones del proyecto
│   ├── abakus_especificacion_agnostica_diseno_v1.md   # criterios de diseño y UX
│   ├── Abakus Brand Identity Board.png                # planilla de marca (índice de uso del logo)
│   ├── logo.png / favicon.png                         # recursos de referencia de marca
│   └── 2026_08_DFS_Obligatorio_2.pdf                  # letra del obligatorio
├── src/
│   ├── components/
│   │   └── Logo.jsx     # logo de Abakus (versiones horizontal, vertical y símbolo)
│   ├── App.jsx
│   └── main.jsx
└── TODO.md              # requerimientos y calendario de hitos
```

## Especificaciones

- **Diseño y experiencia de usuario:** [specs/abakus_especificacion_agnostica_diseno_v1.md](specs/abakus_especificacion_agnostica_diseno_v1.md). Separa decisiones **confirmadas** de **referencias propuestas** y **pendientes**.
- **Marca:** [specs/Abakus Brand Identity Board.png](specs/Abakus%20Brand%20Identity%20Board.png).
- **Letra del obligatorio:** [specs/2026_08_DFS_Obligatorio_2.pdf](specs/2026_08_DFS_Obligatorio_2.pdf).

## Entrega

- **Fecha límite:** 12/11/2026, 21:00, en gestion.ort.edu.uy. Un único `.zip` o `.rar` de hasta 40 MB.
- **Contenido:** el build compilado, el código fuente **sin `node_modules`** y un archivo con la URL de la aplicación publicada en Vercel.
- **Defensa:** online y obligatoria, entre el 16 y el 19/11/2026.

## Uso de IA generativa

Según las pautas del curso, se citan las herramientas de IA utilizadas y la forma en que se usaron. Todo el código generado debe revisarse y comprenderse en profundidad antes de incorporarlo.

- **Claude Code (Anthropic):** asistencia en la base visual a partir de la especificación de diseño, el componente de logo, este README y la planificación de [TODO.md](TODO.md).
