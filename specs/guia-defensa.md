# Guía para la defensa — Abakus (Obligatorio 2, frontend)

En la defensa se va a pedir **mostrar funcionando lo que pide la letra** y **explicar el código** que lo resuelve. Esta guía sigue el orden de la letra. Para cada punto indica:

- **Mostrar:** qué hacer en la app, paso a paso.
- **Código:** dónde está (los links abren el archivo).
- **Explicar:** cómo contarlo en pocas frases.
- **Preguntas probables:** lo que puede preguntar el docente, con una respuesta corta.

Al final hay una sección de puntos débiles conocidos, para responder con honestidad si aparecen.

> En la letra, "documento" es la entidad principal de la base. En Abakus el documento es el **cliente**: es la entidad que tiene el límite de 4 en el plan Base (el backend lo controla en `planLimit.middleware.js`).

---

## 0. Preparación (antes de conectarse)

- [ ] App desplegada en Vercel con el último commit, probada de punta a punta.
- [ ] `npm run dev` funcionando en local, por si falla internet o Vercel.
- [ ] **Cuenta advisor en plan Base con 3 clientes**, para mostrar el límite agregando el cuarto.
- [ ] **Cuenta advisor en plan Premium**, para mostrar la cantidad sin porcentaje.
- [ ] **Cuenta admin**, para los catálogos (bancos, emisores, instrumentos, advisors).
- [ ] Un cliente con posiciones importadas, para que el reporte y la torta tengan datos.
- [ ] Un Excel de ejemplo a mano: [ejemplos-importacion/](ejemplos-importacion/) (ver su `LEEME.md`).
- [ ] Una imagen PNG o JPG de menos de 2 MB, para subir el logo de un cliente.
- [ ] Editor abierto en el proyecto, con esta guía a mano.
- [ ] Los dos integrantes repasaron **todas** las secciones: la defensa es individual en el sentido de que cualquiera puede ser preguntado por cualquier parte.

---

## 1. Arquitectura en un minuto

Conviene arrancar con esto si piden "contanos cómo está organizado el proyecto".

```
src/
├── api/          backend.js (axios + interceptores) y getAllPages.js
├── store/        store.js: configureStore con 3 slices
├── features/     slices de Redux (clients, account, reports/newsAnalysis)
├── pages/        una página por ruta (Clients, Reports, UpgradePlan, Admin/...)
├── components/   piezas de cada página y componentes compartidos (shared/)
├── hooks/        usePaginatedList: listados paginados de los catálogos
├── validators/   esquemas Joi usados por react-hook-form
└── utils/        cálculos sin React (formato, reporte, importación de Excel)
```

**Flujo de datos, igual que en el ejemplo de clase (Clima):**

1. El componente hace el pedido con `backend` (axios).
2. Si el dato lo usan **varias páginas**, se guarda en Redux con `dispatch(setAlgo(data))`.
3. Si lo usa **una sola página**, queda en `useState` local.

**Qué hay en Redux y por qué** ([store.js](../src/store/store.js)):

| Slice | Qué guarda | Quién lo usa |
|---|---|---|
| [clients](../src/features/clients/clients.slice.js) | la cartera de clientes | Clientes, Detalle de cliente, Reportes |
| [account](../src/features/account/account.slice.js) | usuario logueado y uso del plan | Inicio, Mi cuenta, Mi plan, Clientes |
| [newsAnalysis](../src/features/reports/newsAnalysis.slice.js) | análisis con IA por cliente y por día | Reportes (pantalla y PDF) |

Los catálogos del admin (bancos, emisores, etc.) **no** están en Redux: cada uno se usa en una sola página, así que viven en el hook `usePaginatedList` (ver §9.4).

**Stack:** React 19 + Vite, Redux Toolkit, React Router, react-hook-form + Joi, axios, Chart.js (react-chartjs-2), react-toastify. Deploy en Vercel.

---

## 2. RF1 — Registro

**Mostrar**
1. Ir a `/register`.
2. Con el formulario vacío, el botón **Registrarse está deshabilitado** y debajo se explica por qué.
3. Poner contraseñas distintas en "Contraseña" y "Repetir contraseña": aparece el error y el botón sigue deshabilitado.
4. Poner un email inválido: aparece el error en el campo.
5. Registrarse con un usuario que ya existe: el error de la API se muestra **en el campo Usuario**, no en un popup.
6. Registrarse bien: entra directo al Inicio (**auto-login**).

**Código**
- Formulario: [RegisterForm.jsx](../src/components/register/RegisterForm.jsx)
- Reglas: [auth.validators.js](../src/validators/auth.validators.js) (`registerSchema`; repetir contraseña en la línea 78)

**Explicar**
- `useForm({ resolver: joiResolver(registerSchema), mode: 'onTouched' })`: react-hook-form valida cada campo con el esquema Joi y valida al salir del campo.
- `confirmPassword: Joi.string().valid(Joi.ref('password'))`: tiene que ser igual al campo `password`.
- Botón: `disabled={!isValid || isSubmitting}` (línea 214). `isValid` lo calcula react-hook-form con el esquema, así que mientras haya un dato inválido el botón no se puede usar. `isSubmitting` evita el doble envío.
- Errores de la API: `showServerFieldErrors` toma `details` de la respuesta (400 o 409) y usa `setError` de react-hook-form para marcar el campo. Si no corresponde a un campo, se muestra en `FormAlert`, también dentro de la página.
- **Auto-login** (líneas 89–92): la API devuelve `{ token, user }`. Se guarda el token (`setToken`, en localStorage), el usuario va a Redux (`dispatch(setUser(...))`) y se navega a `/`.

**Preguntas probables**
- *¿Por qué validan en el front si el backend ya valida?* La letra lo pide para no sobrecargar el servidor: un dato inválido no llega a hacer el pedido. El backend sigue validando por seguridad.
- *¿Dónde se guarda la sesión?* El token JWT en localStorage ([utils.js](../src/utils/utils.js)). Lo agrega a cada pedido el interceptor de axios (§9.1).
- *¿Por qué `confirmPassword` se manda a la API?* El esquema del backend también lo exige y lo descarta después de validarlo.

---

## 3. RF2 — Login

**Mostrar**
1. En `/login`, con un campo vacío el botón **Ingresar está deshabilitado**.
2. Usuario o contraseña incorrectos: el mensaje de la API aparece en el formulario.
3. Ingresar bien: va al Inicio, con el menú que corresponde al rol.

**Código**: [LoginForm.jsx](../src/components/login/LoginForm.jsx) y `loginSchema` en [auth.validators.js](../src/validators/auth.validators.js).

**Explicar**
- Es el mismo patrón que el registro: `joiResolver(loginSchema)` y `disabled={!isValid || isSubmitting}` (línea 85).
- El esquema pide un largo mínimo, así que el botón se habilita con datos válidos, no solo con campos completos. Es más estricto que lo que pide la letra.
- Si sale bien: `setToken`, `dispatch(setUser(response.data.user))` y `navigate('/')`. Si falla: `setError(error.userMessage)` y el mensaje se muestra en `<FormAlert>`.

**Preguntas probables**
- *¿Cómo sabe la app qué menú mostrar?* `getRole()` lee el `role` del payload del JWT ([utils.js:12](../src/utils/utils.js#L12)): `atob` de la segunda parte del token. Solo decide lo que se ve; quien controla el acceso real es la API.
- *¿Qué pasa si el token vence?* La API responde 401, el interceptor hace logout y manda a `/login` ([backend.js:59](../src/api/backend.js#L59)).

---

## 4. RF3 — Logout

**Mostrar**: "Cerrar sesión" en la barra lateral. Después entrar con otro usuario y mostrar que no aparecen datos del anterior.

**Código**: `handleLogout` en [Layout.jsx:51](../src/pages/layouts/Layout.jsx#L51) y `logout` en [utils.js:25](../src/utils/utils.js#L25).

**Explicar**
1. `logout()` borra el token y la caché del análisis de IA de localStorage.
2. `dispatch(clearAccount())`, `clearClients()` y `clearNewsAnalysis()` devuelven Redux a su estado inicial.
3. `navigate('/login', { replace: true })`: con `replace`, el botón "atrás" no vuelve a la app.

**Pregunta probable**: *¿Por qué limpiar Redux si igual se va a login?* Porque Redux vive en memoria mientras la pestaña está abierta: sin limpiarlo, el próximo usuario vería por un instante la cartera del anterior.

---

## 5. RF4 — Agregar documento (cliente) con límite de plan

**Mostrar**
1. Con la cuenta Base que tiene 3 clientes: **Clientes → Registrar cliente**. El modal valida los campos y deja agregar cuentas bancarias opcionales.
2. Guardar: aparece en la tabla y en Inicio pasa a decir "4 de 4".
3. Ahora **Registrar cliente está deshabilitado** y aparece el aviso "Llegaste al límite de tu plan", con un link a Premium.

**Código**
- Página: [Clients.jsx](../src/pages/Advisor/Clients.jsx). Bloqueo en las líneas 175 y 192.
- Regla: `selectCanAddClient` en [account.slice.js:37](../src/features/account/account.slice.js#L37).
- Formulario: [ClientForm.jsx](../src/components/clients/ClientForm.jsx) (alta y edición) con `createClientSchema` de [client.validators.js](../src/validators/client.validators.js).

**Explicar**
- Al entrar, la página pide `GET /user/me/plan` y guarda en Redux `{ planTier, used, limit, clientsRegistered }`.
- `selectCanAddClient` devuelve `true` si el plan no tiene límite (`limit === null`, Premium) o si `clientsRegistered < limit`.
- El botón usa ese valor: `disabled={!canAddClient}`.
- Después de un alta (y de una baja) se llama a `refreshPlan()`: el uso cambia y el bloqueo se recalcula solo.
- La API del alta devuelve solo el id, por eso después se vuelve a pedir la lista (`getAllPages('/client')`) y se guarda con `dispatch(setClients(...))`.
- `useFieldArray` de react-hook-form arma la lista dinámica de cuentas bancarias del alta.

**Preguntas probables**
- *¿Y si alguien saltea el front?* El backend vuelve a controlar el límite y responde 403. El bloqueo del front es para la experiencia del usuario y para no hacer pedidos que van a fallar.
- *¿Por qué el plan está en Redux?* Lo usan Inicio, Mi plan y Clientes: al pasar a Premium en una página, las otras ya ven el plan nuevo.

---

## 6. RF5 — Documentos: listado, eliminar, editar, filtro

**Mostrar**
1. **Listado** en Clientes: nombre, razón social, país, manager y cuentas activas.
2. **Filtro**: escribir "peru" en el buscador encuentra "Perú" (no distingue tildes ni mayúsculas). Mostrar el contador "2 de 5 clientes" y "Limpiar búsqueda".
3. Ordenar haciendo clic en los encabezados.
4. **Editar** (al costado de Eliminar): abre un modal con los datos y el manager; guardar actualiza la fila.
5. **Eliminar**: pide confirmación y, al confirmar, la fila desaparece. Con un cliente que tiene cuentas activas, la API lo rechaza y se muestra un aviso en español.
6. Hacer clic en el nombre del cliente abre su detalle: cuentas bancarias y logo (§9.3).

**Código**
- Tabla, filtro y orden: [ClientTable.jsx](../src/components/clients/ClientTable.jsx). Filtro en las líneas 46–47; botones en 191–201.
- Baja: `handleDelete` en [Clients.jsx:131](../src/pages/Advisor/Clients.jsx#L131).
- Edición: `editingClient` y el modal con `ClientForm` en [Clients.jsx](../src/pages/Advisor/Clients.jsx).
- Tabla genérica: [DataTable.jsx](../src/components/shared/table/DataTable.jsx).
- `normalizeText`: [format.js](../src/utils/format.js).

**Explicar**
- **Filtro:** `useMemo` arma `visibleRows`: filtra `rows` buscando el término en nombre, razón social, país y manager, y después ordena. `normalizeText` usa `normalize('NFD')`, que separa la letra de su tilde, y borra las tildes con el rango `̀-ͯ`.
- **Eliminar:** `window.confirm`, después `backend.delete('/client/:id')` y, recién cuando la API confirma, `dispatch(clientRemoved(id))`. Si la API responde 409, el mensaje sale de `DELETE_ERRORS`. Mientras borra, `deletingId` deshabilita los botones.
- **Editar:** `setEditingClient(client)` abre el modal. `ClientForm` recibe `client`, así que entra en modo edición y manda `PATCH /client/:id` con `clientDetails` y `managerId`. La respuesta trae el cliente actualizado y se guarda con `dispatch(clientSaved(updated))`, que reemplaza el cliente en la lista.
- `DataTable` es genérica: recibe `columns` (`key`, `header`, `render`) y `renderActions`. La reutilizan todas las tablas.

**Preguntas probables**
- *¿Por qué no se borra de la lista antes de que responda la API?* Si la API rechaza la baja (por ejemplo, porque tiene cuentas activas), la lista mostraría algo falso.
- *¿El filtro llama a la API?* No: se filtra en el navegador sobre los clientes ya cargados en Redux.
- *¿Es una baja física?* No, el backend hace una baja lógica (`isDeleted: true`).

---

## 7. RF6 — Informe de uso y cambio de plan (componentes aparte)

**Mostrar**
1. **Mi plan** con la cuenta Base: "Clientes activos 75 %", barra y "3 de 4 usados". Lo mismo para las cuentas bancarias.
2. **Actualizar a plan Premium**: aparece el aviso de éxito, el informe pasa a mostrar **cantidades** ("Sin límite en tu plan") y el botón se reemplaza por un mensaje.
3. Ir a Clientes: el botón de alta ya está habilitado.

**Código**
- Informe de uso: [PlanUsage.jsx](../src/components/plan/PlanUsage.jsx) (porcentaje en la línea 5; caso sin límite en la 9).
- Cambio de plan: [PlanUpgrade.jsx](../src/components/plan/PlanUpgrade.jsx) (`handleUpgrade` en la línea 22).
- Página que los compone: [UpgradePlan.jsx](../src/pages/Advisor/UpgradePlan.jsx).

**Explicar**
- Son **dos componentes separados**, como pide la letra. Ambos leen el plan de Redux con `useSelector(selectPlan)`.
- `PlanUsage`: si `limit === null` (Premium) muestra la cantidad. Si no, calcula `Math.round(used / limit * 100)` y lo muestra con una barra (`role='progressbar'`, para accesibilidad).
- `PlanUpgrade`: `PATCH /user/me/plan { planTier: 'premium' }`, después `GET /user/me/plan` y `dispatch(setPlan(data))`. Como el plan está en Redux, todas las pantallas que lo leen se actualizan. Si ya es Premium, no ofrece el cambio ("si corresponde").

**Pregunta probable**: *¿Por qué vuelven a pedir el plan después del PATCH?* El PATCH solo confirma el plan nuevo. El uso con el límite actualizado lo devuelve el GET.

---

## 8. RF7 — Gráfico

**Mostrar**: **Reportes**, elegir un cliente con posiciones. Aparece la torta de composición por tipo de activo, con la tabla de montos y porcentajes al lado. Elegir un banco en el filtro: la torta se recalcula solo con ese banco.

**Código**
- Gráfico: [AssetAllocation.jsx](../src/components/reports/AssetAllocation.jsx) (`Doughnut`, `ChartJS.register` en la línea 8).
- Datos: [ClientReport.jsx](../src/components/reports/ClientReport.jsx) (`byInstrumentType` en las líneas 95–96), que los pasa por props a través de [AllocationCard.jsx](../src/components/reports/AllocationCard.jsx).

**Explicar**
- `ClientReport` pide `GET /report/client/:id`. Sin filtro usa la composición que ya calcula la API; con un banco elegido la calcula en el navegador (`getTypesOfPositions` en [reportCalculations.js](../src/utils/reportCalculations.js)).
- `ChartJS.register(ArcElement, Tooltip)` registra solo las piezas que se usan, igual que en el ejemplo de clase con `Bar`.
- `data` tiene `labels` y `datasets`, y `options` tiene el tooltip con formato USD.
- **¿Por qué es relevante?** Es la pregunta típica de un asesor: cómo está distribuida la cartera del cliente entre acciones, bonos, fondos y efectivo.

**Pregunta probable**: *¿Por qué `key={theme}` en el `Doughnut`?* Chart.js dibuja en un canvas y no lee CSS. Al cambiar entre tema claro y oscuro se vuelve a montar para tomar los colores nuevos.

---

## 9. RF8 y RNF — Ruteo, estado global, formularios, deploy

### 9.1 axios: [backend.js](../src/api/backend.js)
- `axios.create({ baseURL })`: una sola instancia para toda la app.
- **Interceptor de request** (línea 9): agrega `Authorization: Bearer <token>` a cada pedido. Por eso ningún componente maneja el token.
- **Interceptor de response** (línea 42):
  - Ante un 401 fuera de las rutas de auth, hace logout y redirige a `/login`.
  - Arma `error.userMessage`, el mensaje listo para mostrar.
  - Reintenta hasta 2 veces los GET que no tuvieron respuesta: la API en Vercel puede tardar en "despertar" en el primer pedido. No reintenta POST, PATCH ni DELETE, porque podrían duplicar datos.

### 9.2 React Router: [App.jsx](../src/App.jsx)
- `GuestLayout` para `/login` y `/register`; `Layout` (barra lateral + `<Outlet />`) para el resto.
- Rutas protegidas con **wrappers anidados**: [AuthWrapper.jsx](../src/pages/wrappers/AuthWrapper.jsx).
  - Sin token: `<Navigate to='/login' />`.
  - Con `allowedRoles` que no incluyen el rol: `/unauthorized`.
  - En otro caso: `<Outlet />`.
- Ejemplo: `/clients`, `/reports` y `/upgrade` solo para `advisor`; `/banks` y `/advisors` solo para `admin`; `/managers` para los dos.
- `useParams` en el detalle de cliente (`/clients/:clientId`) y `useSearchParams` en Reportes (`?cliente=id`): el cliente elegido sobrevive a una recarga.
- `*` muestra NotFound. `vercel.json` reescribe todas las rutas a `/` para que la SPA funcione al recargar en Vercel.

### 9.3 Imágenes: [ClientLogoUpload.jsx](../src/components/clients/ClientLogoUpload.jsx)
- **Mostrar:** en el detalle de un cliente, "Subir imagen" con un PNG. Probar también con un archivo de más de 2 MB o un PDF: el error aparece sin llamar a la API.
- **Explicar:**
  1. Se valida tipo y tamaño en el front, con las mismas reglas que el `multer` del backend.
  2. Se arma un `FormData` con `body.append('image', file)` y se hace `POST /client/:id/uploadImage`.
  3. La API sube la imagen a Cloudinary y devuelve el cliente con `logoURL`, que muestra `ClientAvatar`.

### 9.4 Listados paginados (catálogos): [usePaginatedList.js](../src/hooks/usePaginatedList.js)
- **Mostrar:** en Managers, o como admin en Bancos, cambiar de página; crear, editar y borrar.
- **Explicar:**
  - Un hook propio con `useState` y `useEffect`. Pide `GET endpoint?page&limit` cada vez que cambia `page` o `reloadKey`.
  - La bandera `cancelled` ignora respuestas viejas si se cambia de página rápido.
  - Si la página queda vacía (se borró su último item), pasa a la anterior.
  - Lo usa la página: `const list = usePaginatedList('/manager', 15)`. Se lo pasa a la tabla ([PaginatedTable.jsx](../src/components/shared/table/PaginatedTable.jsx)) y llama a `list.reload()` después de crear, editar o borrar.

### 9.5 Biblioteca de formularios
- Todas los formularios usan **react-hook-form + Joi** (`@hookform/resolvers/joi`), con los esquemas en [validators/](../src/validators/).
- [FormField.jsx](../src/components/shared/form/FormField.jsx) es el campo reutilizable: label, input o select, error y ayuda, con `aria-invalid` y `aria-describedby`.

### 9.6 Deploy
- Vercel conectado al repositorio de GitHub: cada push a `main` despliega.
- `vercel.json` hace el rewrite de la SPA.
- La URL publicada va en el archivo de la entrega.

---

## 10. Funcionalidades extra (aspectos valorados)

Mostrarlas si sobra tiempo o si preguntan qué agregaron. Hay que poder explicar al menos el flujo de cada una.

| Funcionalidad | Qué mostrar | Código |
|---|---|---|
| **Importar posiciones desde Excel** | Clientes → Importar posiciones → subir `posiciones-todos-los-bancos.xlsm` → revisar la asociación → confirmar | [PositionImportForm.jsx](../src/components/positions/PositionImportForm.jsx), [PositionImportExcel.js](../src/utils/PositionImportExcel.js), [PositionImportMatching.js](../src/utils/PositionImportMatching.js) |
| **Análisis de noticias con IA** | Reportes → cliente → "Generar análisis". Queda guardado el resto del día | [NewsAnalysis.jsx](../src/components/reports/NewsAnalysis.jsx), [newsAnalysis.slice.js](../src/features/reports/newsAnalysis.slice.js) |
| **PDF del reporte** | Reportes → "Descargar PDF" | [pdf/](../src/components/reports/pdf/) |
| **Tema claro/oscuro** | Botón arriba a la derecha; recuerda la elección | [theme.js](../src/theme/theme.js) |
| **Panel de admin** | Advisors, bancos, emisores e instrumentos con paginación | [pages/Admin/](../src/pages/Admin/) |
| **Estados de carga, vacío y error** | Skeletons, "Reintentar", mensajes claros | [shared/page/](../src/components/shared/page/) |

**Importación de Excel en 4 pasos:**
1. `readSheet(file)` lee el Excel en el navegador.
2. Se validan las columnas y cada fila con Joi (`importRowsSchema`). Los errores se muestran por fila, sin llamar a la API.
3. `buildGroups` asocia cada fila a un cliente por nombre y a una cuenta por banco y número. Lo que no coincide se elige a mano en desplegables.
4. Un solo `POST /position` con todas las posiciones. La API valida todo antes de guardar, así que no quedan importaciones a medias.

**Análisis con IA:** la llamada es lenta y tiene cupo diario. Por eso:
- Se guarda en Redux por cliente, con estados `loading`, `succeeded` y `failed`.
- `persistNewsAnalysis` lo copia a localStorage con `store.subscribe`, para que sobreviva a una recarga.
- Solo se usa el análisis del día; el de días anteriores se descarta.

---

## 11. Preguntas generales probables

- **¿Qué va en Redux y qué en `useState`?** En Redux, lo que usan varias páginas: clientes, usuario y plan, análisis de IA. En `useState`, lo que usa un solo componente: formularios, modales, carga y error, catálogos.
- **¿Cómo se actualiza Redux?** `createSlice` define los reducers (por ejemplo `setClients`, `clientRemoved`). El componente hace el pedido y despacha la acción con el resultado. Redux Toolkit usa Immer, por eso dentro del reducer se puede "mutar" el `state`.
- **¿Para qué el `ignore` / `cancelled` en los `useEffect`?** Si el componente se desmonta, o cambia el dato pedido antes de que llegue la respuesta, se descarta para no mostrar datos viejos.
- **¿Para qué `reloadKey`?** Es un número que, al incrementarse, vuelve a disparar el `useEffect`. Lo usa el botón "Reintentar".
- **¿Para qué `useMemo` en la tabla de clientes?** Para no recalcular el filtro y el orden en cada render si no cambiaron los clientes, la búsqueda o el orden.
- **¿Por qué `useId`?** Genera ids únicos para asociar `<label htmlFor>` con su `<input>`, aunque el componente aparezca dos veces.
- **¿Cómo manejan los errores?** El interceptor arma `userMessage`; cada componente lo muestra en la página (`FormAlert`, `ErrorState`) o en un toast para las acciones (guardar, borrar).
- **¿Usaron IA?** Sí, Claude Code, citado en el README. Explicar para qué se usó y que todo el código se revisó y se entiende: por eso se simplificó lo que se alejaba de lo visto en clase.

---

## 12. Puntos débiles conocidos (responder con honestidad)

- **Endpoints sin uso en el front:**
  - `POST /bank/:id/uploadImage` (logo del banco).
  - `GET`, `PATCH` y `DELETE /position/:id` (no hay pantalla para editar o borrar una posición individual).
  - Los reportes parciales `/composition`, `/historic`, `/instrument/:id` y `/issuer/:id`: el front usa el reporte completo, que trae esa información junta.
  - Si lo preguntan: reconocerlo y explicar cómo se agregaría con los patrones existentes. El logo se haría igual que `ClientLogoUpload`; la edición de posiciones, con una tabla con `EditButton` y `DeleteButton`.
- **Mensajes de validación en inglés** en algunos formularios: los esquemas Joi del front se copiaron de los del backend, con sus mensajes en inglés.
- **"Agregar cuenta"** no se deshabilita al llegar al límite de cuentas: lo controla el backend, que responde con el error.
- **URL del backend fija** en `backend.js`, en lugar de una variable de entorno.
- **Bundle grande** (aviso de Vite por chunks de más de 500 kB): `@react-pdf` es pesado. Se podría cargar con `import()` dinámico.

---

## 13. Guion sugerido para la demo (8–10 minutos)

| # | Paso | Requisito |
|---|---|---|
| 1 | Registro con contraseña distinta (botón deshabilitado) y después correcto (auto-login) | RF1 |
| 2 | Logout y login con un error, después login con la cuenta Base de 3 clientes | RF2, RF3 |
| 3 | Inicio: indicadores del plan | — |
| 4 | Clientes: buscar, ordenar, editar uno y eliminar otro (incluido el intento con cuentas activas) | RF5 |
| 5 | Registrar clientes hasta el límite y mostrar el bloqueo | RF4 |
| 6 | Mi plan: porcentaje, pasar a Premium y ver la cantidad | RF6 |
| 7 | Detalle de cliente: subir logo y agregar o eliminar una cuenta | Imágenes |
| 8 | Reportes: torta, filtro por banco y PDF | RF7 + extra |
| 9 | Importar Excel | Extra |
| 10 | Login admin: catálogos con paginación | RF8 |

En cada paso, tener listo el archivo del código para abrirlo cuando pregunten "¿dónde está eso?".
