# Ejemplos de importación de posiciones

Reportes de banco en el formato que acepta "Importar posiciones" (`/clients`). Un reporte trae posiciones de **varios clientes y cuentas**: no se elige cliente antes de subirlo, cada fila se asocia sola al leer el archivo.

Los datos son ficticios y coinciden con los que crea el seed de la API (`Abakus-api/scripts/seed-data.js`): 9 bancos, 10 clientes y una cuenta por cliente en cada banco.

## Formato

La primera fila tiene los encabezados y cada fila siguiente es una posición. El orden de las columnas no importa y las columnas desconocidas (ej. `description`) se ignoran.

| Columna | Obligatoria | Contenido | Campo de la API |
|---|---|---|---|
| `Bank` | sí | Nombre del banco, ej. `UBS` | — (sirve para asociar la cuenta) |
| `numberAccount` | sí | Número de cuenta, ej. `04-240001` | — (sirve para asociar la cuenta) |
| `nameAccount` | sí | Nombre del cliente, ej. `Yuji Itadori` | — (sirve para asociar el cliente) |
| `ISIN` | sí | Código de 12 caracteres, ej. `US0378331005` | `isin` |
| `Quantity` | sí | Número positivo | `quantity` |
| `costPrice` | sí | Número positivo | `purchasePrice` |
| `marketPrice` | no | Número positivo | `currentPrice` |
| `marketValue` | no | Número positivo | `marketValue` |
| `current` | sí | Moneda, ej. `USD` | `currency` |
| `dateOfPurchase` | no* | Fecha | `dateOfPurchase` |
| `dateOfReport` | no** | Fecha | `dateOfReport` |

\* La API exige la fecha de compra. Si la celda viene vacía, se usa la "Fecha de compra predeterminada" del formulario.

\*\* Si no viene, la API usa la fecha de la subida. Los ejemplos no la traen.

## Cómo se asocia cada fila

1. **Cliente**: `nameAccount` contra el nombre comercial o la razón social de los clientes del advisor, sin distinguir mayúsculas, tildes ni espacios de más.
2. **Cuenta**: dentro de ese cliente, la cuenta activa del banco `Bank` con número `numberAccount`.
3. Si un nombre no coincide con ningún cliente, o coincide con más de uno, se avisa y se elige el cliente en un desplegable (o "No importar estas posiciones").
4. Si el cliente coincide pero la cuenta no, se elige una de sus cuentas activas en un desplegable (o "No importar").
5. Lo que se asoció solo se puede corregir con "Cambiar cliente" / "Cambiar".
6. Si una cuenta ya tiene posiciones con la misma fecha de reporte (por ejemplo, el mismo archivo subido dos veces el mismo día), se avisa. No bloquea: subir un archivo repetido duplica sus posiciones.
7. "Importar" se habilita cuando todo está asociado u omitido. Se envía todo en un solo `POST /v1/position`: si la API rechaza alguna fila, no se guarda ninguna y el error indica la fila del Excel.

## Archivos

| Archivo | Contenido | Filas |
|---|---|---|
| `posiciones-morgan-stanley.xlsx` | Yuji Itadori, Megumi Fushiguro, Nobara Kugisaki (10 c/u) | 30 |
| `posiciones-jpm.xlsx` | Satoru Gojo, Tanjiro Kamado, Nezuko Kamado, Zenitsu Agatsuma (8, 8, 7, 7) | 30 |
| `posiciones-stonex.xlsx` | Zenitsu Agatsuma, Maomao, Jinshi | 30 |
| `posiciones-ubs.xlsx` | Hyakkimaru, Yuji Itadori, Megumi Fushiguro, Nobara Kugisaki | 30 |
| `posiciones-ubp.xlsx` | Nobara Kugisaki, Satoru Gojo, Tanjiro Kamado | 30 |
| `posiciones-julius-baer.xlsx` | Nezuko Kamado, Zenitsu Agatsuma, Maomao, Jinshi | 30 |
| `posiciones-edr.xlsx` | Jinshi, Hyakkimaru, Yuji Itadori | 30 |
| `posiciones-lgt.xlsx` | Megumi Fushiguro, Nobara Kugisaki, Satoru Gojo, Tanjiro Kamado | 30 |
| `posiciones-efg.xlsx` | Tanjiro Kamado, Nezuko Kamado, Zenitsu Agatsuma | 30 |
| `posiciones-para-asociar.xlsx` | UBS, para probar la asociación manual (ver abajo) | 12 |
| `posiciones-con-errores.xlsx` | Errores de datos por fila (ver abajo) | 8 |
| `posiciones-todos-los-bancos.xlsm` | Reporte completo de origen (9 bancos × 10 clientes × 10 posiciones); no es para la demo | 900 |

Cada archivo por banco tiene 3 clientes con 10 posiciones o 4 clientes con 8, 8, 7 y 7.

`posiciones-para-asociar.xlsx` tiene 4 clientes de 3 posiciones:

- `Yuji Itadori`: se asocia solo.
- `  megumi FUSHIGURO `: escrito distinto, se asocia solo igual.
- `Gon Freecss`: no existe; pide elegir el cliente (las cuentas son las de `Satoru Gojo`, así que eligiéndolo se asocian solas).
- `Maomao` con la cuenta `04-999999`: el cliente existe pero la cuenta no; pide elegir la cuenta.

`posiciones-con-errores.xlsx`: las filas 2 y 3 son válidas. Después, una falla por fila: sin ISIN (4), ISIN incompleto (5), cantidad negativa (6), sin precio de compra (7), sin moneda (8) y fecha de compra inválida (9). Estos errores se muestran antes de asociar y hay que corregir el archivo.

## Para probarlos

1. En la API, correr el seed (`node scripts/seed-data.js`) y entrar con el advisor que crea.
2. En `/clients`, "Importar posiciones" (no hace falta elegir cliente) y subir un archivo.
3. Revisar la asociación y el resumen por cliente; "Importar N posiciones" las envía.
4. Subir el mismo archivo otra vez el mismo día muestra el aviso de posiciones con la misma fecha de reporte.

El servidor busca cada ISIN en OpenFIGI. Si alguno no se encuentra, la API lo informa por fila.

Los `.xlsx` se generaron desde el `.xlsm` con un script aparte (no forma parte del proyecto); si se cambia el reporte completo, hay que volver a generarlos.
