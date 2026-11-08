# Ejemplos de importación de posiciones

Archivos `.xlsx` en el formato que acepta el formulario "Importar posiciones desde Excel" (`/clients`).
Se generaron a partir del extracto real `../FONDOS_UNICO_ANONIMIZADO FINAL.xlsx`, hoja `POSICIONES UBS`, sección "Positions at portfolio level".

## Formato

La primera fila tiene los encabezados y cada fila siguiente es una posición. Cada archivo corresponde a **una cuenta**.

| Columna | Obligatoria | Contenido | Sale de (extracto UBS) |
|---|---|---|---|
| ISIN | sí | Código de 12 caracteres, ej. `US0378331005` | `ISIN` |
| Cantidad | sí | Número positivo | `Number/Amt.` |
| Precio de compra | sí | Número positivo | `Cost price` |
| Precio actual | no | Número positivo | `Market price` |
| Valor de mercado | no | Número positivo | `Market value` |
| Moneda | sí | Código, ej. `USD` | `Ccy.` |
| Fecha de compra | no* | Fecha | — (el banco no la informa) |
| Fecha de reporte | no | Fecha | `Valuation date` |

\* La API exige la fecha de compra. Si la columna viene vacía, se usa la fecha que se carga en el campo "Fecha de compra" del formulario.

## Archivos

| Archivo | Cuenta UBS | Posiciones | Monedas |
|---|---|---|---|
| `posiciones-0663-00588579.xlsx` | 0663 00588579 | 3 | USD |
| `posiciones-0663-00766250.xlsx` | 0663 00766250 | 12 | USD |
| `posiciones-0755-00949475.xlsx` | 0755 00949475 | 35 | USD, EUR |
| `posiciones-con-errores.xlsx` | (varias) | 8 | — |

`posiciones-con-errores.xlsx` sirve para probar los errores por fila. Las filas 2 y 3 son válidas. El resto son filas reales que la API rechaza: dos sin ISIN (depósitos y opciones), dos con cantidad negativa (posiciones cortas) y dos sin precio de compra.

## Para probarlos

1. Tener un cliente con una cuenta activa en el banco UBS. El número de la cuenta no tiene que coincidir, porque la cuenta se elige en el formulario, pero conviene usar el de la tabla.
2. En `/clients`, hacer click en "Importar posiciones desde Excel" y elegir el cliente, el banco, la cuenta, el archivo y la fecha de compra.
3. "Revisar" muestra la vista previa y "Confirmar importación" envía las posiciones.

El servidor busca cada ISIN en OpenFIGI. Si alguno no se encuentra, la API lo informa por fila.
