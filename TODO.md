# TODO — Obligatorio 2 (Frontend)

Requerimientos extraídos de [specs/2026_08_DFS_Obligatorio_2.pdf](specs/2026_08_DFS_Obligatorio_2.pdf). Entre paréntesis, la sección de la letra.

> En la letra, "documento" designa genéricamente a la entidad principal guardada en la base de datos. En Abakus falta definir qué entidad cumple ese rol (ver [README](README.md)).

## Administrativo

- [ ] Inscribirse a la evaluación en Gestión
- [ ] Formar grupo (hasta 2 personas del mismo dictado) y crear el equipo en Gestión
- [ ] Confirmar con el docente el calendario de hitos oficial y registrar aclaraciones a la letra (forman parte de ella)

## Setup técnico (RNF)

- [ ] Instalar y configurar **Redux** para el estado compartido entre componentes
- [ ] Instalar y configurar **React Router** para la navegación entre secciones
- [ ] Instalar una **biblioteca de formularios**
- [ ] Elegir e instalar una biblioteca de gráficos
- [ ] Configurar la URL del backend con una variable de entorno
- [ ] Crear la capa de servicios para consumir la API del Obligatorio 1
- [ ] Definir la entidad "documento" de Abakus según el backend
- [ ] Crear el proyecto en **Vercel** y conectar el repositorio

## Requerimientos funcionales

### 1. Registro

- [ ] Formulario con los datos que pide el registro del backend
- [ ] Campo "repetir contraseña" con validación de coincidencia
- [ ] Botón "registrar" deshabilitado mientras haya datos inválidos
- [ ] Mostrar en la interfaz el error que devuelve la API
- [ ] En caso de éxito, guardar la información del usuario
- [ ] *(Valorado)* Auto-login después del registro

### 2. Login

- [ ] Botón "ingresar" deshabilitado mientras usuario o contraseña estén vacíos
- [ ] En caso de éxito, acceder a la aplicación
- [ ] Mostrar el error en la interfaz
- [ ] Proteger las rutas privadas

### 3. Logout

- [ ] Cerrar la sesión y limpiar el estado y el token, para que otro usuario pueda ingresar

### 4. Agregar documento

- [ ] Formulario de alta con validaciones
- [ ] Permitir el alta solo si la cantidad de documentos del plan lo permite
- [ ] Manejo de imágenes (subida y visualización)

### 5. Documentos

- [ ] 5.1.1 Listado de todos los documentos del usuario
- [ ] 5.1.2 Botón para eliminar al costado de cada documento
- [ ] 5.1.3 Botón de editar junto al de eliminar (edición sencilla, puede ser *inline*)
- [ ] 5.1.4 Uno o más filtros sobre el listado

### 6. Informe de uso

- [ ] 6.1.1 Componente aparte: porcentaje de documentos usados (plan plus, límite 4) o cantidad de documentos (plan premium)
- [ ] 6.1.2 Componente aparte: cambiar a plan premium (si corresponde)

### 7. Gráfico

- [ ] Graficar datos relevantes para la aplicación (por ejemplo, la composición de la cartera)

### 8. Funcionalidades restantes

- [ ] Cubrir **todos los endpoints** del Obligatorio 1
- [ ] Respetar las buenas prácticas de ruteo y estado global

## Aspectos valorados

- [ ] Diseño visual profesional (según la [especificación de diseño](specs/abakus_especificacion_agnostica_diseno_v1.md))
- [ ] Validaciones en el frontend de todos los datos que ingresa el usuario
- [ ] Detalles de realismo: estados de carga, vacío y error, mensajes claros, formato USD
- [ ] Funcionalidades innovadoras, además de las pedidas en la letra

## Entrega

- [ ] Deploy funcionando en Vercel
- [ ] `npm run build` sin errores; `npm run lint` limpio
- [ ] Armar el `.zip` o `.rar` (máximo 40 MB) con:
  - [ ] el build compilado
  - [ ] el código fuente **sin `node_modules`**
  - [ ] un archivo con la URL de la aplicación publicada
  - [ ] los documentos de texto en PDF
- [ ] Citar el uso de IA generativa
- [ ] Subir a Gestión antes del **12/11/2026 a las 21:00**
- [ ] Verificar el e-mail de confirmación de la entrega

## Defensa

- [ ] Que ambos integrantes puedan explicar en profundidad todo el código
- [ ] Asistir (online) el día asignado, entre el 16 y el 19/11/2026. Es obligatoria: no presentarse implica perder todos los puntos.

---

## Calendario de hitos (aproximado)

Plan propuesto desde el 25/10/2026. La letra indica que cada docente fija su propio calendario de hitos: ajustar este plan cuando se publique el oficial.

| # | Fechas | Hito | Entregable verificable |
|---|---|---|---|
| H0 | 25–27/10 | **Setup** | Redux, Router, formularios y conexión a la API; entidad "documento" definida; proyecto en Vercel con un deploy inicial |
| H1 | 28–31/10 | **Autenticación** | Registro (repetir contraseña, auto-login), login, logout y rutas protegidas, con errores visibles |
| H2 | 01–05/11 | **Documentos** | Alta con límite de plan, listado, edición *inline*, eliminación, filtros e imágenes |
| H3 | 06–08/11 | **Plan y reportes** | Informe de uso (porcentaje o cantidad), cambio a premium y gráfico |
| H4 | 09–10/11 | **Cierre funcional** | Todos los endpoints cubiertos, validaciones completas, estados de carga, vacío y error, pulido visual y extras |
| H5 | 11/11 | **Congelamiento** | Deploy final, build, README y citas de IA; zip armado y revisado |
| — | **12/11 (21:00)** | **Entrega** | Subida a Gestión y confirmación por e-mail |
| H6 | 13–15/11 | **Preparación de la defensa** | Recorrido del código entre los dos integrantes |
| — | **16–19/11** | **Defensa** | Online, el día asignado |

Margen: H5 deja un día de colchón antes de la entrega. Si un hito se atrasa, recortar las funcionalidades innovadoras de H4 antes que los requerimientos obligatorios.
