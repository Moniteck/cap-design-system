# Estándar de diseño de base de datos

Reglas para crear y modificar el esquema de cualquier sistema de Grupo CAP, en MySQL 8.0.16+ y
PostgreSQL 15+. Aplica a toda base de datos nueva y a todo cambio de esquema en sistemas
existentes. Este archivo lo instala y sobrescribe el paquete `cap-design-system`: no se edita en el
proyecto; los cambios se proponen en ese repositorio.

## 1. Principios

Resuelven cualquier caso que este documento no cubra:

1. **Todo en inglés.** Tablas, columnas, índices, constraints, vistas, funciones, esquemas y bases
   de datos. Sin excepciones ni mezclas.
2. **Nombres por significado, no por tipo.** El nombre dice qué guarda la columna, no de qué tipo es.
3. **Compatible con Laravel/Eloquent por defecto.** Las convenciones coinciden con las que el ORM
   asume, para no configurar cada modelo a mano.
4. **La base de datos protege la integridad.** Llaves foráneas, `NOT NULL`, `UNIQUE` y `CHECK` se
   declaran en el esquema, no se confían solo a la aplicación.
5. **Todo cambio de esquema es código versionado.** Ninguna modificación manual en producción.
6. **Portable entre MySQL y PostgreSQL.** Se evitan rasgos exclusivos de un motor salvo
   justificación documentada.

Cuando una regla diga «MySQL» o «PostgreSQL» aplica solo a ese motor; el resto aplica a ambos.

## 2. Reglas generales de nombres

Todo identificador se escribe en inglés, en `snake_case` minúsculas, y describe su contenido sin
abreviaturas ni prefijos de tipo.

| Regla | Correcto | Incorrecto |
|---|---|---|
| Inglés | `customers`, `invoice_date` | `clientes`, `fec_factura` |
| `snake_case` minúsculas | `purchase_orders` | `PurchaseOrders`, `PURCHASE_ORDERS` |
| Sin prefijos de tipo ni de objeto | `name`, `is_active`, `users` | `txt_name`, `sn_active`, `tbl_users` |
| Sin abreviaturas | `description`, `quantity` | `desc`, `qty` |
| Sin acentos, espacios ni caracteres especiales | `account_number` | `número cuenta` |
| Sin palabras reservadas | `user_group`, `order_items` | `group`, `order`, `user` (PostgreSQL) |
| Longitud máxima 63 caracteres | `supplier_payment_schedules` | nombres truncados por PostgreSQL |

La longitud de 63 es el límite de PostgreSQL y el más estricto de los dos motores. Una palabra
reservada en un motor se evita en ambos: lista de
[MySQL](https://dev.mysql.com/doc/refman/8.0/en/keywords.html) y de
[PostgreSQL](https://www.postgresql.org/docs/current/sql-keywords-appendix.html).

Prefijos permitidos, únicamente estos:

| Objeto | Patrón | Ejemplo |
|---|---|---|
| Llave primaria | `pk_{table}` | `pk_invoices` |
| Llave foránea | `fk_{table}_{referenced_table}` | `fk_invoices_customers` |
| Índice | `ix_{table}_{columns}` | `ix_invoices_customer_id_invoice_date` |
| Restricción única | `uq_{table}_{columns}` | `uq_users_email` |
| Restricción check | `ck_{table}_{rule}` | `ck_invoices_total_positive` |
| Vista | `vw_{purpose}` | `vw_sales_by_month` |
| Procedimiento | `usp_{action}_{object}` | `usp_close_fiscal_period` |
| Función | `fn_{what_it_returns}` | `fn_working_days` |
| Trigger | `trg_{table}_{timing}_{event}` | `trg_invoices_before_update` |
| Secuencia (PostgreSQL) | `seq_{table}_{column}` | `seq_invoices_number` |

Si un nombre de constraint supera 63 caracteres se recortan los nombres de columna manteniendo el
orden, nunca el prefijo.

## 3. Tablas

Las tablas se nombran en plural, agrupadas por módulo mediante esquema en PostgreSQL y mediante
prefijo corto en MySQL.

1. **Plural, sustantivo.** `customers`, `invoices`, `invoice_items`. Es la convención de Eloquent:
   el modelo `Customer` busca la tabla `customers` sin configuración.
2. **Sin prefijo `tbl_`.** Es redundante: el objeto ya es una tabla.
3. **Agrupación por módulo.**
   - PostgreSQL: un esquema por módulo: `hr.employees`, `sales.customers`, `core.users`. El esquema
     `public` no se usa para tablas de negocio.
   - MySQL: no tiene esquemas dentro de una base, así que se usa un prefijo de módulo de 2 a 5
     letras: `hr_employees`, `sales_customers`, `core_users`. El prefijo se define una vez por
     módulo y se registra (sección 14).
4. **Tablas globales** (usuarios, roles, permisos, parámetros, auditoría) viven en el módulo `core`
   y las consumen todos los demás. Nunca se duplican por módulo.
5. **Tablas pivote** (muchos a muchos sin atributos propios): los dos nombres en singular, en orden
   alfabético, unidos por guion bajo: `role_user`, `permission_role`. Convención de Laravel. Si la
   relación tiene atributos propios (fecha, cantidad, estado) deja de ser pivote y se nombra como
   entidad: `enrollments`, `assignments`.
6. **Cabecera y detalle:** `invoices` e `invoice_items`, `purchase_orders` y
   `purchase_order_items`. El detalle lleva el nombre completo de la cabecera en singular.
7. **Catálogos:** nombre plural del concepto, sin sufijo especial: `invoice_statuses`,
   `product_categories`, `payment_methods`.
8. **Historial:** sufijo `_history` o `_logs`: `price_history`, `login_logs`.
9. **En MySQL toda tabla declara** `ENGINE=InnoDB` y `utf8mb4` (sección 13).

| Concepto | PostgreSQL | MySQL |
|---|---|---|
| Empleados del módulo RRHH | `hr.employees` | `hr_employees` |
| Clientes del módulo ventas | `sales.customers` | `sales_customers` |
| Usuarios globales | `core.users` | `core_users` |
| Detalle de factura | `sales.invoice_items` | `sales_invoice_items` |
| Pivote usuario-rol | `core.role_user` | `core_role_user` |

## 4. Columnas

Una columna se nombra por lo que significa para el negocio, en singular, sin prefijo de tipo.

1. **Llave primaria: `id`.** No `id_customer` ni `customer_id` dentro de su propia tabla.
2. **Llave foránea: `{referenced_table_singular}_id`.** `customer_id`, `category_id`. Así se
   distingue a simple vista la PK (`id`) de las FK (`*_id`).
3. **Dos FK a la misma tabla:** se antepone el rol: `approver_user_id`, `requester_user_id`;
   `origin_warehouse_id`, `destination_warehouse_id`.
4. **Booleanos:** prefijo `is_`, `has_` o `can_`: `is_active`, `has_discount`, `can_login`. Siempre
   `NOT NULL` con `DEFAULT`.
5. **Fechas y horas:** sufijo `_at` cuando guardan fecha y hora (`created_at`, `paid_at`,
   `expires_at`); sufijo `_date` cuando guardan solo fecha (`birth_date`, `due_date`, `invoice_date`).
6. **Cantidades y montos:** nombre del concepto sin prefijo: `quantity`, `unit_price`, `subtotal`,
   `tax_amount`, `total`. Si hay varias monedas, columna `currency_code` al lado.
7. **Códigos de negocio:** `code` para el código interno estable (`PRD-0001`), `number` para
   numeración secuencial visible (`invoice_number`), `external_id` para identificadores de sistemas
   externos.
8. **Texto:** `name`, `description`, `notes`, `address_line_1`. No `txt_name`.
9. **Documentos de identidad:** `national_id` (identidad), `tax_id` (RTN), `passport_number`.
   Siempre `VARCHAR`, nunca numérico: pierden ceros a la izquierda y no se operan.
10. **Contadores y orden:** `sort_order`, `attempt_count`, `view_count`.
11. **JSON:** nombre del contenido, sin prefijo `json_`: `settings`, `metadata`, `request_payload`.

Equivalencias con la notación anterior (prefijos de tipo), que ya no se usa:

| Antes (no usar) | Ahora |
|---|---|
| `id_producto` | `id` |
| `id_categoria` (FK) | `category_id` |
| `txt_nombre_producto` | `name` |
| `cod_producto` | `code` |
| `sn_activo` | `is_active` |
| `fec_registro` | `created_at` |
| `id_usuario_registro` | `created_by` |
| `fec_modificacion` | `updated_at` |
| `id_usuario_modifico` | `updated_by` |
| `txt_comentario` | se elimina; ver sección 6 |
| `monto_factura` | `total` |
| `json_request` | `request_payload` |

## 5. Tipos de dato por dominio

Cada dominio de negocio tiene un tipo fijo; no se elige por columna.

| Dominio | MySQL | PostgreSQL | Notas |
|---|---|---|---|
| Llave primaria | `BIGINT UNSIGNED AUTO_INCREMENT` | `BIGINT GENERATED ALWAYS AS IDENTITY` | Nunca `INT`: se agota en tablas transaccionales. Nunca `SERIAL` en PostgreSQL (obsoleto). |
| Llave foránea | `BIGINT UNSIGNED` | `BIGINT` | Mismo tipo exacto que la PK referenciada. |
| Identificador público (URLs, APIs) | `CHAR(26)` ULID o `CHAR(36)` UUID | `UUID` | Columna adicional `public_id`, única; la PK sigue siendo `BIGINT`. |
| Dinero | `DECIMAL(19,4)` | `NUMERIC(19,4)` | Nunca `FLOAT`/`DOUBLE`. 4 decimales para cálculos; la presentación redondea a 2. |
| Porcentaje | `DECIMAL(7,4)` | `NUMERIC(7,4)` | Se guarda `15.0000`, no `0.15`. |
| Cantidad con decimales | `DECIMAL(15,4)` | `NUMERIC(15,4)` | Inventario, pesos, medidas. |
| Cantidad entera | `INT` | `INTEGER` | Contadores, unidades. |
| Booleano | `TINYINT(1)` | `BOOLEAN` | Siempre `NOT NULL DEFAULT`. |
| Fecha y hora | `DATETIME(3)` | `TIMESTAMPTZ(3)` | Guardada en UTC; la aplicación convierte a `America/Tegucigalpa`. `DATETIME` en MySQL no guarda zona: la aplicación escribe UTC siempre. |
| Solo fecha | `DATE` | `DATE` | Nacimiento, vencimiento, fecha de factura. |
| Solo hora | `TIME` | `TIME` | Horarios. |
| Texto corto | `VARCHAR(n)` | `VARCHAR(n)` | `n` por dominio (tabla abajo). Nunca `VARCHAR(max)` ni `VARCHAR(255)` por defecto. |
| Texto largo | `TEXT` | `TEXT` | Descripciones, notas, contenido editable. No se indexa con B-tree. |
| Código fijo | `CHAR(n)` | `CHAR(n)` | Solo cuando la longitud es siempre exacta: `currency_code CHAR(3)`, `country_code CHAR(2)`. |
| JSON | `JSON` | `JSONB` | Solo para datos sin estructura fija. Lo que se consulta o filtra va en columnas. |
| Enumeración fija del sistema | `VARCHAR(30)` + `CHECK` | `VARCHAR(30)` + `CHECK` | No usar `ENUM` nativo (sección 10). |
| Archivos | `VARCHAR(500)` ruta | `VARCHAR(500)` ruta | El archivo vive en storage; la base guarda ruta, nombre original, tamaño y MIME. Nunca `BLOB`. |
| Dirección IP | `VARCHAR(45)` | `INET` | 45 cubre IPv6. |

Longitudes estándar para `VARCHAR`:

| Columna | Longitud |
|---|---|
| `code` | 30 |
| `name` (persona, producto, catálogo) | 150 |
| `email` | 255 |
| `phone` | 30 |
| `national_id`, `tax_id` | 20 |
| `address_line_1`, `address_line_2` | 255 |
| `city`, `state` | 100 |
| `slug` | 150 |
| `url` | 2048 |
| `password` (hash) | 255 |

Una longitud distinta se justifica en el comentario de la columna.

## 6. Columnas de auditoría y borrado lógico

Toda tabla de negocio lleva estas columnas, con estos nombres exactos, al final de la tabla:

| Columna | Tipo | Nulable | Descripción |
|---|---|---|---|
| `created_at` | fecha y hora | No | Momento de inserción. `DEFAULT CURRENT_TIMESTAMP`. |
| `created_by` | `BIGINT` FK a `core.users` | Sí | Usuario que insertó. Nulo solo en procesos de sistema (seeds, jobs). |
| `updated_at` | fecha y hora | No | Última modificación. La aplicación la actualiza; MySQL puede usar `ON UPDATE CURRENT_TIMESTAMP`. |
| `updated_by` | `BIGINT` FK a `core.users` | Sí | Usuario de la última modificación. |
| `deleted_at` | fecha y hora | Sí | Nulo = registro vigente. Con valor = borrado lógico. |
| `deleted_by` | `BIGINT` FK a `core.users` | Sí | Usuario que borró. |

`created_at`, `updated_at` y `deleted_at` son los nombres que Eloquent maneja solo (timestamps y
`SoftDeletes`).

**Borrado lógico.** Ningún registro de negocio se elimina físicamente. La regla es `deleted_at`, no
`is_active`:

- `deleted_at` registra cuándo y `deleted_by` quién; un booleano no guarda nada de eso.
- `is_active` se usa además, y solo, cuando «inactivo» es un estado de negocio distinto de
  «borrado»: un producto descontinuado que sigue en facturas viejas, un usuario suspendido. Son
  conceptos independientes.
- Toda consulta de aplicación filtra `deleted_at IS NULL`. Eloquent lo hace solo con `SoftDeletes`.
- Los índices `UNIQUE` sobre columnas de negocio deben permitir reutilizar el valor de un registro
  borrado. PostgreSQL: índice único parcial `WHERE deleted_at IS NULL`. MySQL no lo tiene: se
  incluye `deleted_at` en el índice único, o no se reutilizan códigos. Se documenta por tabla.
- Borrado físico solo en tablas de log, caché o staging, y solo por procesos programados de retención.

**Razón del cambio.** No existe una columna de «comentario» por fila: una columna que se
sobreescribe en cada actualización solo conserva la última razón. El historial de cambios con su
motivo va en la tabla de auditoría (sección 10).

Excepciones a las columnas de auditoría, únicamente:

- Tablas pivote puras: solo `created_at`.
- Tablas de log o historial: solo `created_at` y `created_by`; nunca se actualizan ni se borran.
- Catálogos del sistema que se cargan por seed y no edita el usuario: `created_at` y `updated_at`.

## 7. Llaves primarias y foráneas

Toda tabla tiene una llave primaria `id` de tipo `BIGINT`, y toda relación se declara como llave
foránea con constraint, no solo con índice.

**Llave primaria**

1. Columna `id`, `BIGINT` autoincremental, primera columna de la tabla. Constraint `pk_{table}`.
2. Sin llaves primarias naturales (correo, código, identidad): cambian con el tiempo. Esas
   columnas llevan `UNIQUE`.
3. Sin llaves primarias compuestas, salvo en tablas pivote puras: `(role_id, user_id)`.
4. Tablas expuestas por API o URL llevan además `public_id` (ULID/UUID) único, para no revelar el
   conteo secuencial.

**Llaves foráneas**

1. Siempre con constraint `FOREIGN KEY`. Un índice sin constraint no garantiza integridad.
2. Nombre `fk_{table}_{referenced_table}`. Con dos FK a la misma tabla se agrega el rol:
   `fk_invoices_users_approver`.
3. Mismo tipo exacto que la PK referenciada: `BIGINT UNSIGNED` en MySQL, `BIGINT` en PostgreSQL.
4. Toda FK lleva índice (sección 9). MySQL lo crea solo; PostgreSQL no.
5. `NOT NULL` por defecto. Nulable solo cuando la relación es opcional por negocio
   (`parent_category_id`, `approved_by`), y se documenta.

**Política de borrado en cascada**

| Relación | `ON DELETE` | `ON UPDATE` | Ejemplo |
|---|---|---|---|
| Detalle que no existe sin su cabecera | `CASCADE` | `CASCADE` | `invoice_items` respecto a `invoices` |
| Pivote pura | `CASCADE` | `CASCADE` | `role_user` |
| Referencia a catálogo o maestro | `RESTRICT` | `CASCADE` | `invoices.customer_id`, `products.category_id` |
| Auditoría (`created_by`, `updated_by`) | `RESTRICT` | `CASCADE` | nunca se pierde quién hizo qué |
| Relación opcional que puede quedar huérfana | `SET NULL` | `CASCADE` | `employees.manager_id` |

Como el borrado es lógico, `CASCADE` solo actúa en borrados físicos excepcionales; la aplicación
propaga `deleted_at` a los detalles.

## 8. Constraints

La base de datos rechaza datos inválidos por sí misma: `NOT NULL` es el valor por defecto de toda
columna, y las reglas simples se expresan como `UNIQUE` y `CHECK`.

1. **`NOT NULL` por defecto.** Una columna nulable es una decisión explícita que responde a «¿qué
   significa que no haya valor?». Si la respuesta es «vacío» o «cero», no es nulable: lleva
   `DEFAULT ''` o `DEFAULT 0`.
2. **`DEFAULT` en booleanos, contadores, estados y fechas de auditoría.** Nunca se confía en que la
   aplicación los envíe.
3. **`UNIQUE` en toda columna que identifica al registro para el negocio:** `email`, `code`,
   `national_id`, `tax_id`, `invoice_number`. Compuesto cuando la unicidad es por contexto:
   `uq_product_prices_product_id_valid_from`.
4. **`CHECK` para rangos y dominios cerrados:** montos no negativos, porcentajes entre 0 y 100,
   estados dentro de una lista, fecha fin posterior a fecha inicio.
5. **Toda constraint lleva nombre explícito.** Los nombres generados por el motor
   (`invoices_chk_1`, `invoices_customer_id_foreign`) no se aceptan: hacen ilegibles los errores y
   las migraciones. En Laravel se pasa el nombre como argumento de `unique()`, `index()` y
   `constrained()`.

```sql
-- PostgreSQL
ALTER TABLE sales.invoices
    ADD CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number),
    ADD CONSTRAINT ck_invoices_total_non_negative CHECK (total >= 0),
    ADD CONSTRAINT ck_invoices_status CHECK (status IN ('draft', 'issued', 'paid', 'void')),
    ADD CONSTRAINT ck_invoices_due_after_issue CHECK (due_date >= invoice_date);
```

En MySQL la sintaxis es la misma desde 8.0.16; versiones anteriores ignoran `CHECK` en silencio,
por eso es el mínimo soportado.

## 9. Índices

Se indexan las llaves foráneas y las columnas por las que la aplicación filtra, ordena o une; el
resto no, porque cada índice encarece cada escritura.

**Obligatorios**

1. Toda llave foránea. En PostgreSQL hay que crearlo explícitamente; MySQL lo crea con la FK.
2. Toda columna `UNIQUE` (el constraint ya lo crea).
3. `deleted_at` en tablas con borrado lógico, combinado con la columna de filtro principal, no solo.

**Según consulta**

4. Columnas de filtro frecuente en listados: `status`, `invoice_date`, `customer_id`.
5. Columnas de ordenamiento en listados paginados: `created_at`, `invoice_number`.
6. Columnas de búsqueda por texto exacto o prefijo: `code`, `email`, `national_id`.

**Nomenclatura:** `ix_{table}_{column1}_{column2}`, siempre con el nombre de la tabla. En
PostgreSQL el nombre del índice es único por esquema, no por tabla; `ix_customer_id` chocaría.

**Índices compuestos**

- El orden importa: primero la columna de igualdad más selectiva, luego las de rango u orden. Para
  «facturas de un cliente ordenadas por fecha»: `ix_invoices_customer_id_invoice_date`.
- Un índice `(a, b)` sirve a consultas por `a` y por `(a, b)`, pero no por `b` sola. No se crea
  `ix_t_a` si ya existe `ix_t_a_b`.
- Máximo 4 columnas; más indica una consulta mal planteada.

**Booleanos y columnas de baja cardinalidad**

Un índice solo sobre `is_active` o `deleted_at` no sirve: el motor lo descarta porque filtra poco.

- PostgreSQL: índice parcial,
  `CREATE INDEX ix_products_category_id_active ON inventory.products (category_id) WHERE deleted_at IS NULL;`
- MySQL: la columna booleana va como última columna de un índice compuesto con una columna
  selectiva: `ix_products_category_id_is_active`.

**Índices descendentes:** solo cuando la consulta ordena descendente y el índice tiene más de una
columna con direcciones distintas (`ORDER BY customer_id ASC, invoice_date DESC`). Para una sola
columna el motor recorre el índice en ambas direcciones; `DESC` no aporta.

**Texto**

- Columnas `TEXT` no se indexan con B-tree. Búsqueda de contenido: `FULLTEXT` en MySQL, `GIN` con
  `to_tsvector` o `pg_trgm` en PostgreSQL.
- `LIKE '%texto%'` no usa índice B-tree en ningún motor; si la pantalla lo necesita, se usa
  búsqueda de texto completo o trigramas.

**JSON:** en PostgreSQL, índice `GIN` sobre la columna `JSONB` solo si se filtra por su contenido.
En MySQL, columna generada sobre la clave consultada e índice sobre ella.

**Revisión:** antes de agregar un índice a una tabla con más de un millón de filas se adjunta el
plan de ejecución (`EXPLAIN ANALYZE`) de la consulta que lo motiva. Trimestralmente el DBA reporta
índices sin uso (`pg_stat_user_indexes` / `sys.schema_unused_indexes`) para eliminarlos.

## 10. Catálogos, estados y auditoría de cambios

Un valor que se repite en muchas filas vive en una tabla de catálogo referenciada por `id`, nunca
como texto en la tabla maestra.

**Cuándo tabla de catálogo y cuándo `CHECK`**

| Caso | Solución | Ejemplo |
|---|---|---|
| El usuario administra los valores desde una pantalla | Tabla de catálogo | `product_categories`, `payment_methods`, `departments` |
| Los valores tienen atributos propios (color, orden, descripción) | Tabla de catálogo | `invoice_statuses` con `color`, `sort_order` |
| Los valores los define el código y cambian con un despliegue | `VARCHAR(30)` + `CHECK` | `status IN ('draft','issued','paid','void')` |
| Dos valores | Booleano | `is_active` |

El tipo `ENUM` nativo no se usa en ningún motor: agregar un valor exige `ALTER TABLE` bloqueante en
MySQL y en PostgreSQL no se pueden eliminar valores.

**Estructura mínima de una tabla de catálogo**

```sql
CREATE TABLE sales.invoice_statuses (
    id          BIGINT GENERATED ALWAYS AS IDENTITY,
    code        VARCHAR(30)    NOT NULL,
    name        VARCHAR(150)   NOT NULL,
    description TEXT           NULL,
    sort_order  INTEGER        NOT NULL DEFAULT 0,
    is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_invoice_statuses PRIMARY KEY (id),
    CONSTRAINT uq_invoice_statuses_code UNIQUE (code)
);
```

`code` es el identificador estable que usa el código de la aplicación (`'PAID'`), nunca el `id`
numérico ni el `name`, que son editables. Los catálogos del sistema se cargan por seed versionado.

**Tabla de auditoría de cambios**

Una sola tabla global, `core.audit_logs`, registra cada cambio relevante:

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `BIGINT` | PK |
| `table_name` | `VARCHAR(100)` | Tabla afectada, con esquema o prefijo |
| `record_id` | `BIGINT` | `id` del registro afectado |
| `action` | `VARCHAR(10)` + `CHECK` | `insert`, `update`, `delete`, `restore` |
| `old_values` | `JSON`/`JSONB` | Columnas cambiadas con su valor anterior |
| `new_values` | `JSON`/`JSONB` | Columnas cambiadas con su valor nuevo |
| `reason` | `TEXT` nulable | Motivo que escribió el usuario, cuando la pantalla lo pide |
| `user_id` | `BIGINT` FK | Quién |
| `ip_address` | `VARCHAR(45)` | Desde dónde |
| `created_at` | fecha y hora | Cuándo |

Índice `ix_audit_logs_table_name_record_id`. La escribe la aplicación (en Laravel, un observer o
`owen-it/laravel-auditing`), no un trigger, para que capture el usuario real. Las tablas que
requieren historial completo de valores (precios, tipos de cambio, salarios) llevan además su
propia tabla `_history` con `valid_from` y `valid_to`.

## 11. Vistas, procedimientos, funciones y triggers

La lógica de negocio vive en la aplicación (Laravel). La base de datos guarda datos y garantiza su
integridad; los objetos programables se reservan para casos concretos y justificados.

| Necesidad | Dónde | Por qué |
|---|---|---|
| Reglas de negocio, validaciones, flujos | Aplicación | Versionado, pruebas unitarias, un solo lugar |
| Integridad referencial y de dominio | Constraints (sección 8) | El motor lo garantiza sin importar quién escriba |
| Reportes con agregaciones pesadas | Vista o consulta SQL en repositorio | Un `SELECT` explícito es más legible que ORM encadenado |
| Procesos batch sobre millones de filas (cierres, recálculos) | Procedimiento almacenado | Evita mover datos a la aplicación y de vuelta |
| Cálculos reutilizables en SQL (días hábiles, redondeo fiscal) | Función | Un solo cálculo para reportes y procedimientos |
| Auditoría de cambios | Aplicación | Un trigger no conoce al usuario autenticado |

**Vistas**

- `vw_{purpose}`. Solo para consultas de lectura reutilizadas en más de un lugar, o para exponer
  datos a reportería (Power BI, Metabase) sin dar acceso a las tablas.
- Nunca una vista sobre otra vista: el optimizador pierde el plan. Si dos vistas comparten lógica,
  se extrae a una consulta base que ambas copian, o se usa una vista materializada.
- Un `JOIN` dentro de un procedimiento es normal; no se mueve a una vista por regla.
- Vista materializada (PostgreSQL) para reportes que toleran minutos de retraso; se refresca por job.

**Procedimientos almacenados**

- `usp_{action}_{object}`: `usp_close_fiscal_period`, `usp_rebuild_inventory_balances`. No `sp_`:
  en SQL Server es prefijo de sistema y la costumbre se arrastra entre motores.
- Todo procedimiento que escribe lo hace dentro de una transacción con manejo de errores que
  revierte y relanza. Nunca se captura un error para ignorarlo.
- Parámetros con prefijo `p_` (`p_period_id`), variables locales con `v_`, para distinguirlos de
  columnas.
- Sin SQL dinámico por concatenación. Si es imprescindible, `EXECUTE ... USING` (PostgreSQL) o
  `PREPARE` con parámetros (MySQL).
- El código vive en el repositorio y se despliega por migración (sección 12).

```sql
-- PostgreSQL: estructura mínima
CREATE OR REPLACE PROCEDURE sales.usp_close_fiscal_period(p_period_id BIGINT, p_user_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE sales.fiscal_periods
       SET is_closed = TRUE, closed_at = CURRENT_TIMESTAMP, updated_by = p_user_id
     WHERE id = p_period_id AND is_closed = FALSE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Fiscal period % is already closed or does not exist', p_period_id;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;
```

**Funciones**

- `fn_{what_it_returns}`: `fn_working_days`, `fn_round_tax`.
- Deterministas y sin efectos secundarios (`IMMUTABLE` o `STABLE` en PostgreSQL, `DETERMINISTIC`
  en MySQL). Una función nunca escribe datos.
- No se llaman dentro del `WHERE` de consultas sobre tablas grandes: se ejecutan fila por fila e
  impiden usar índices.

**Triggers**

- Prohibidos para lógica de negocio y auditoría. Se permiten solo para columnas derivadas
  técnicas (`updated_at` en PostgreSQL, que no tiene `ON UPDATE CURRENT_TIMESTAMP`) y se
  documentan en el comentario de la tabla.
- `trg_{table}_{timing}_{event}`: `trg_invoices_before_update`.

**Consultas desde la aplicación**

- Siempre parametrizadas (Eloquent y Query Builder lo hacen; `DB::raw` con interpolación de
  variables está prohibido).
- Sin `SELECT *` en código de producción: se listan las columnas.
- Listados siempre paginados; nunca se carga una tabla completa en memoria.
- Problema N+1 controlado con carga anticipada (`with()`).

## 12. Migraciones y versionado del esquema

Todo cambio de esquema es un archivo de migración en el repositorio, revisado en pull request y
aplicado por el pipeline de despliegue. Nadie ejecuta `ALTER TABLE` a mano en producción, incluido
el DBA.

**Herramienta**

- Proyectos Laravel: migraciones nativas (`database/migrations`), con el nombre de cada constraint
  e índice explícito.
- Proyectos sin Laravel: Flyway o Liquibase con scripts SQL versionados. Un solo mecanismo por
  base; nunca se mezclan.

**Reglas**

1. Una migración por cambio lógico, con nombre descriptivo:
   `2026_11_07_143000_create_sales_invoices_table`,
   `2026_11_12_090000_add_approved_by_to_purchase_orders`.
2. Una migración aplicada nunca se edita. Para corregirla se crea otra.
3. Toda migración tiene `down()` funcional, probado en desarrollo antes del PR.
4. Cambios de esquema y cambios de datos van en migraciones separadas. Una migración de datos
   (backfill) es idempotente: se puede ejecutar dos veces sin daño.
5. Catálogos del sistema se cargan con seeders idempotentes (`updateOrCreate` por `code`),
   versionados junto a la migración que crea la tabla.
6. Procedimientos, funciones y vistas se crean y actualizan con migraciones que ejecutan el
   archivo `.sql` correspondiente de `database/sql/`, con `CREATE OR REPLACE`.
7. En tablas con más de un millón de filas, agregar columnas con `DEFAULT`, agregar índices o
   cambiar tipos requiere revisión del DBA y, en MySQL, herramienta en línea
   (`ALGORITHM=INPLACE` o `gh-ost`). En PostgreSQL los índices se crean con
   `CREATE INDEX CONCURRENTLY` fuera de transacción.
8. Renombrar o eliminar columnas se hace en dos despliegues: primero el código deja de usarla,
   después la migración la elimina. Así el despliegue nunca rompe la versión en ejecución.

**Flujo de aprobación**

1. El desarrollador crea la migración y la ejecuta en su entorno local.
2. El PR incluye la migración, el `down()`, los seeders y, si aplica, el plan de ejecución de
   consultas nuevas.
3. Revisión contra el checklist de la sección 15; el DBA revisa cuando hay tablas grandes, índices
   nuevos o procedimientos.
4. El pipeline aplica la migración en pruebas; se validan las pantallas afectadas.
5. El pipeline aplica en producción dentro de la ventana de despliegue, con respaldo previo
   automático.

## 13. Ambientes, seguridad, charset y collation

Cada sistema tiene al menos tres bases separadas, la aplicación se conecta con un usuario de
privilegios mínimos, y toda base nueva se crea en `utf8mb4` o `UTF8` con la collation definida aquí.

**Ambientes**

| Ambiente | Datos | Quién accede | Cambios de esquema |
|---|---|---|---|
| Desarrollo (local) | Seeds + datos sintéticos | Cada desarrollador | Migraciones libres |
| Pruebas / staging | Copia de producción enmascarada | Desarrollo y QA | Solo por pipeline |
| Producción | Reales | Aplicación y DBA | Solo por pipeline con respaldo previo |

El enmascarado sustituye nombres, correos, teléfonos, identidades, RTN y salarios por valores
ficticios. Ningún desarrollador tiene credenciales de producción; el acceso de lectura para
diagnóstico se da por réplica o por usuario de solo lectura temporal.

**Usuarios y privilegios**

| Usuario | Privilegios | Uso |
|---|---|---|
| `{app}_app` | `SELECT, INSERT, UPDATE, DELETE, EXECUTE` sobre sus esquemas | Conexión de la aplicación |
| `{app}_migrator` | DDL sobre sus esquemas | Solo el pipeline de migraciones |
| `{app}_readonly` | `SELECT` | Reportería, BI, diagnóstico |
| `{app}_backup` | Lectura y lock | Respaldos |

Nunca `root`, `postgres` ni superusuario desde la aplicación. Una contraseña por usuario y
ambiente, en el gestor de secretos o en `.env` fuera del repositorio, rotada al menos una vez al
año y cuando sale alguien del equipo.

**Datos sensibles**

- Contraseñas: solo hash (`bcrypt`/`argon2id`), nunca reversible.
- Tokens de API y claves de terceros: cifrados en la aplicación antes de guardar (`Crypt` de
  Laravel) o en el gestor de secretos.
- Datos personales (identidad, salario, salud): marcados `[sensitive]` en el comentario de columna,
  excluidos de logs y de respaldos compartidos con terceros.
- Conexiones por TLS entre aplicación y base en cualquier ambiente que no sea local.

**Charset y collation**

| Motor | Charset | Collation | Razón |
|---|---|---|---|
| MySQL | `utf8mb4` | `utf8mb4_0900_ai_ci` | Unicode completo; comparación sin distinguir mayúsculas ni acentos, que es lo que el usuario espera al buscar |
| PostgreSQL | `UTF8` | `en_US.UTF-8` (o `C.UTF-8`) | Comparaciones distinguen mayúsculas; para búsquedas sin distinción se usa `ILIKE`, `citext` en columnas como `email`, o `lower()` indexado |

Se define al crear la base y no se cambia por tabla ni por columna. `utf8` (3 bytes) en MySQL está
prohibido: trunca caracteres de 4 bytes.

**Zona horaria:** el servidor de base de datos y la conexión de la aplicación operan en UTC. La
aplicación convierte a `America/Tegucigalpa` al presentar.

**Respaldos:** responsabilidad del DBA. Completo diario, incrementales o WAL cada 15 minutos en
producción, retención de 30 días y prueba de restauración mensual documentada. Un respaldo que
nunca se restauró no cuenta como respaldo.

## 14. Documentación del esquema

Cada tabla y cada columna cuyo nombre no lo explique todo lleva un comentario en la propia base, y
cada módulo mantiene un diagrama entidad-relación actualizado en el repositorio.

**Comentarios en la base**

- Toda tabla lleva `COMMENT` con una frase: qué representa y qué módulo la alimenta.
- Toda columna no obvia (`id`, `name` y auditoría se omiten) lleva `COMMENT` con significado,
  unidad y reglas: `'Monto total con impuestos, en la moneda de currency_code'`.
- Las columnas sensibles incluyen `[sensitive]` al inicio del comentario.
- En Laravel: `->comment('...')` en la migración. En PostgreSQL: `COMMENT ON TABLE` /
  `COMMENT ON COLUMN`.

**Diccionario de datos:** se genera desde los comentarios de la base, no se escribe aparte.
Herramienta: `tbls` (Markdown y ER desde la conexión) o SchemaSpy, ejecutada por el pipeline en
cada despliegue y publicada en `docs/database/` del proyecto.

**Diagrama entidad-relación**

- Uno por módulo, más uno global con solo las tablas maestras y sus relaciones.
- Formato versionable: DBML (`dbdiagram.io`) o Mermaid `erDiagram` en el repositorio. No imágenes
  sueltas.
- Se actualiza en el mismo PR que la migración que lo afecta.

**Registro de módulos:** `docs/database/modules.md` del proyecto lista cada módulo, su esquema
(PostgreSQL) o prefijo (MySQL), su responsable y su descripción. Un módulo nuevo se registra ahí
antes de crear su primera tabla. Prefijos reservados para los módulos comunes:

| Módulo | Esquema PostgreSQL | Prefijo MySQL |
|---|---|---|
| Núcleo (usuarios, roles, parámetros, auditoría) | `core` | `core_` |
| Recursos humanos | `hr` | `hr_` |
| Ventas y facturación | `sales` | `sales_` |
| Inventario | `inventory` | `inv_` |
| Finanzas | `finance` | `fin_` |

## 15. Checklist de revisión para cada cambio de esquema

El revisor del pull request marca cada punto; un punto sin cumplir bloquea la aprobación.

**Nombres**

- [ ] Todo identificador está en inglés y en `snake_case`.
- [ ] Tablas en plural, pivotes en singular alfabético, sin prefijo `tbl_`.
- [ ] Columnas sin prefijo de tipo; booleanos con `is_`/`has_`; fechas con `_at`/`_date`.
- [ ] Llave primaria `id`; foráneas `{tabla_singular}_id`.
- [ ] Constraints e índices con nombre explícito según el patrón (`pk_`, `fk_`, `uq_`, `ck_`, `ix_`).
- [ ] Ningún nombre supera 63 caracteres ni es palabra reservada.

**Estructura**

- [ ] `id` es `BIGINT` autoincremental.
- [ ] Columnas de auditoría completas (`created_at`, `created_by`, `updated_at`, `updated_by`,
      `deleted_at`, `deleted_by`).
- [ ] Tipos según la tabla de dominios (dinero `DECIMAL(19,4)`, fechas con hora en UTC, `VARCHAR`
      con longitud estándar).
- [ ] Sin `ENUM` nativo, sin `FLOAT` para montos, sin `BLOB`, sin `VARCHAR(255)` por defecto.
- [ ] Valores repetidos en tabla de catálogo con `code` único, no como texto libre.

**Integridad**

- [ ] Toda relación tiene `FOREIGN KEY` declarada con política `ON DELETE` justificada.
- [ ] Toda columna es `NOT NULL` salvo justificación documentada en el comentario.
- [ ] `UNIQUE` en identificadores de negocio; `CHECK` en rangos y estados.
- [ ] `DEFAULT` en booleanos, contadores y estados.

**Índices**

- [ ] Toda FK tiene índice (explícito en PostgreSQL).
- [ ] Cada índice nuevo responde a una consulta concreta; en tablas grandes se adjunta `EXPLAIN ANALYZE`.
- [ ] Ningún índice solo sobre booleano o `deleted_at`.
- [ ] Ningún índice redundante con uno compuesto existente.

**Migración**

- [ ] Un cambio lógico por migración, con `down()` probado.
- [ ] Seeders idempotentes para catálogos nuevos.
- [ ] Cambios en tablas grandes revisados por el DBA y aplicados en línea.
- [ ] Columnas eliminadas o renombradas en dos despliegues.

**Documentación**

- [ ] `COMMENT` en la tabla y en columnas no obvias; columnas sensibles marcadas.
- [ ] Diagrama ER del módulo actualizado en el mismo PR.
- [ ] Módulo nuevo registrado en `docs/database/modules.md`.

## 16. Anexo: ejemplo completo

Una tabla de facturas con su catálogo de estados, en los dos motores y como migración de Laravel.

**PostgreSQL**

```sql
CREATE SCHEMA IF NOT EXISTS sales;

CREATE TABLE sales.invoice_statuses (
    id          BIGINT GENERATED ALWAYS AS IDENTITY,
    code        VARCHAR(30)    NOT NULL,
    name        VARCHAR(150)   NOT NULL,
    description TEXT           NULL,
    sort_order  INTEGER        NOT NULL DEFAULT 0,
    is_active   BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_invoice_statuses PRIMARY KEY (id),
    CONSTRAINT uq_invoice_statuses_code UNIQUE (code)
);
COMMENT ON TABLE sales.invoice_statuses IS 'Catálogo de estados de factura; lo carga el seeder, no el usuario';

CREATE TABLE sales.invoices (
    id             BIGINT GENERATED ALWAYS AS IDENTITY,
    public_id      UUID           NOT NULL DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(30)    NOT NULL,
    customer_id    BIGINT         NOT NULL,
    status_id      BIGINT         NOT NULL,
    invoice_date   DATE           NOT NULL,
    due_date       DATE           NOT NULL,
    currency_code  CHAR(3)        NOT NULL DEFAULT 'HNL',
    subtotal       NUMERIC(19,4)  NOT NULL DEFAULT 0,
    tax_amount     NUMERIC(19,4)  NOT NULL DEFAULT 0,
    total          NUMERIC(19,4)  NOT NULL DEFAULT 0,
    notes          TEXT           NULL,
    created_at     TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by     BIGINT         NULL,
    updated_at     TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by     BIGINT         NULL,
    deleted_at     TIMESTAMPTZ(3) NULL,
    deleted_by     BIGINT         NULL,
    CONSTRAINT pk_invoices PRIMARY KEY (id),
    CONSTRAINT uq_invoices_public_id UNIQUE (public_id),
    CONSTRAINT fk_invoices_customers        FOREIGN KEY (customer_id) REFERENCES sales.customers (id)        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_invoice_statuses FOREIGN KEY (status_id)   REFERENCES sales.invoice_statuses (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_users_created    FOREIGN KEY (created_by)  REFERENCES core.users (id)             ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_users_updated    FOREIGN KEY (updated_by)  REFERENCES core.users (id)             ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_users_deleted    FOREIGN KEY (deleted_by)  REFERENCES core.users (id)             ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT ck_invoices_amounts_non_negative CHECK (subtotal >= 0 AND tax_amount >= 0 AND total >= 0),
    CONSTRAINT ck_invoices_due_after_issue CHECK (due_date >= invoice_date)
);
COMMENT ON TABLE  sales.invoices IS 'Facturas de venta emitidas a clientes';
COMMENT ON COLUMN sales.invoices.total IS 'Monto total con impuestos, en la moneda de currency_code';

CREATE UNIQUE INDEX uq_invoices_invoice_number ON sales.invoices (invoice_number) WHERE deleted_at IS NULL;
CREATE INDEX ix_invoices_customer_id_invoice_date ON sales.invoices (customer_id, invoice_date);
CREATE INDEX ix_invoices_status_id ON sales.invoices (status_id);
CREATE INDEX ix_invoices_created_by ON sales.invoices (created_by);
CREATE INDEX ix_invoices_updated_by ON sales.invoices (updated_by);
CREATE INDEX ix_invoices_deleted_by ON sales.invoices (deleted_by);
```

**MySQL**

```sql
CREATE TABLE sales_invoice_statuses (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code        VARCHAR(30)     NOT NULL,
    name        VARCHAR(150)    NOT NULL,
    description TEXT            NULL,
    sort_order  INT             NOT NULL DEFAULT 0,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT pk_invoice_statuses PRIMARY KEY (id),
    CONSTRAINT uq_invoice_statuses_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Catálogo de estados de factura; lo carga el seeder, no el usuario';

CREATE TABLE sales_invoices (
    id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id      CHAR(36)        NOT NULL,
    invoice_number VARCHAR(30)     NOT NULL,
    customer_id    BIGINT UNSIGNED NOT NULL,
    status_id      BIGINT UNSIGNED NOT NULL,
    invoice_date   DATE            NOT NULL,
    due_date       DATE            NOT NULL,
    currency_code  CHAR(3)         NOT NULL DEFAULT 'HNL',
    subtotal       DECIMAL(19,4)   NOT NULL DEFAULT 0,
    tax_amount     DECIMAL(19,4)   NOT NULL DEFAULT 0,
    total          DECIMAL(19,4)   NOT NULL DEFAULT 0 COMMENT 'Monto total con impuestos, en la moneda de currency_code',
    notes          TEXT            NULL,
    created_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    created_by     BIGINT UNSIGNED NULL,
    updated_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    updated_by     BIGINT UNSIGNED NULL,
    deleted_at     DATETIME(3)     NULL,
    deleted_by     BIGINT UNSIGNED NULL,
    CONSTRAINT pk_invoices PRIMARY KEY (id),
    CONSTRAINT uq_invoices_public_id UNIQUE (public_id),
    CONSTRAINT uq_invoices_invoice_number UNIQUE (invoice_number),
    CONSTRAINT fk_invoices_customers        FOREIGN KEY (customer_id) REFERENCES sales_customers (id)        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_invoice_statuses FOREIGN KEY (status_id)   REFERENCES sales_invoice_statuses (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_users_created    FOREIGN KEY (created_by)  REFERENCES core_users (id)             ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_users_updated    FOREIGN KEY (updated_by)  REFERENCES core_users (id)             ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_invoices_users_deleted    FOREIGN KEY (deleted_by)  REFERENCES core_users (id)             ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT ck_invoices_amounts_non_negative CHECK (subtotal >= 0 AND tax_amount >= 0 AND total >= 0),
    CONSTRAINT ck_invoices_due_after_issue CHECK (due_date >= invoice_date),
    INDEX ix_invoices_customer_id_invoice_date (customer_id, invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Facturas de venta emitidas a clientes';
```

En MySQL las FK crean su índice automáticamente. Como no hay índices parciales,
`invoice_number` queda único incluso entre registros borrados; la numeración de facturas no se
reutiliza, así que es el comportamiento deseado.

**Migración de Laravel (sirve para ambos motores)**

```php
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales_invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique('uq_invoices_public_id');
            $table->string('invoice_number', 30);
            $table->foreignId('customer_id')
                ->constrained('sales_customers', indexName: 'fk_invoices_customers')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->foreignId('status_id')
                ->constrained('sales_invoice_statuses', indexName: 'fk_invoices_invoice_statuses')
                ->restrictOnDelete()
                ->cascadeOnUpdate();
            $table->date('invoice_date');
            $table->date('due_date');
            $table->char('currency_code', 3)->default('HNL');
            $table->decimal('subtotal', 19, 4)->default(0);
            $table->decimal('tax_amount', 19, 4)->default(0);
            $table->decimal('total', 19, 4)->default(0)
                ->comment('Monto total con impuestos, en la moneda de currency_code');
            $table->text('notes')->nullable();

            $table->timestamps(3);
            $table->foreignId('created_by')->nullable()
                ->constrained('core_users', indexName: 'fk_invoices_users_created')->restrictOnDelete();
            $table->foreignId('updated_by')->nullable()
                ->constrained('core_users', indexName: 'fk_invoices_users_updated')->restrictOnDelete();
            $table->softDeletes('deleted_at', 3);
            $table->foreignId('deleted_by')->nullable()
                ->constrained('core_users', indexName: 'fk_invoices_users_deleted')->restrictOnDelete();

            $table->unique('invoice_number', 'uq_invoices_invoice_number');
            $table->index(['customer_id', 'invoice_date'], 'ix_invoices_customer_id_invoice_date');
            $table->comment('Facturas de venta emitidas a clientes');
        });

        DB::statement('ALTER TABLE sales_invoices ADD CONSTRAINT ck_invoices_amounts_non_negative CHECK (subtotal >= 0 AND tax_amount >= 0 AND total >= 0)');
        DB::statement('ALTER TABLE sales_invoices ADD CONSTRAINT ck_invoices_due_after_issue CHECK (due_date >= invoice_date)');
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_invoices');
    }
};
```

En proyectos sobre PostgreSQL con esquemas, el nombre de tabla en la migración es `sales.invoices`
y el modelo declara `protected $table = 'sales.invoices';`. Los `CHECK` van por `DB::statement`
porque el Schema Builder de Laravel no los genera.

**Modelo Eloquent resultante**

Con estos nombres el modelo no necesita configurar llave primaria, timestamps ni columnas de
borrado lógico:

```php
class Invoice extends Model
{
    use SoftDeletes;

    protected $table = 'sales_invoices';

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(InvoiceStatus::class, 'status_id');
    }
}
```
