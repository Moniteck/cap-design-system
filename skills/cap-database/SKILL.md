---
name: cap-database
description: Estándar de base de datos de Grupo CAP para MySQL y PostgreSQL. Usar SIEMPRE antes de crear o modificar tablas, columnas, índices, llaves foráneas, constraints, migraciones, seeders, modelos Eloquent, vistas, procedimientos o consultas SQL, y al revisar un esquema o una migración existente. Carga la guía con los nombres, tipos de dato, auditoría, borrado lógico, índices y el checklist de revisión.
allowed-tools: Read
---

# Base de datos Grupo CAP

Toda base de datos de un sistema de Grupo CAP se diseña igual: nombres en inglés y `snake_case`,
tablas en plural, `id` `BIGINT` como llave primaria, `{tabla_singular}_id` como foránea, columnas
de auditoría con los nombres que Eloquent espera, borrado lógico con `deleted_at`, y la integridad
declarada en el esquema con llaves foráneas, `NOT NULL`, `UNIQUE` y `CHECK`.

## Antes de tocar el esquema

1. Lee la guía completa: `${CLAUDE_PLUGIN_ROOT}/database/DATABASE_GUIDE.md`. La sección 5 trae el
   tipo de dato de cada dominio y la 16 un ejemplo completo en MySQL, PostgreSQL y migración de
   Laravel: cópialo como plantilla.
2. Si el proyecto tiene `database/DATABASE_GUIDE.md` (lo instala `install.sh` en Laravel), esa es
   la copia que manda; es el mismo archivo.
3. Antes de crear una tabla o columna, busca si el proyecto ya tiene una equivalente, y registra el
   módulo nuevo en `docs/database/modules.md` antes de su primera tabla.

## Resumen operativo

- Identificadores en inglés, `snake_case`, sin prefijos de tipo (`txt_`, `fec_`, `sn_`, `id_`) ni
  `tbl_`; máximo 63 caracteres; sin palabras reservadas.
- Tablas en plural (`customers`), pivotes en singular alfabético (`role_user`), módulo por esquema
  en PostgreSQL (`sales.invoices`) y por prefijo en MySQL (`sales_invoices`).
- PK `id` `BIGINT` autoincremental; FK `customer_id` con constraint `fk_{tabla}_{referenciada}`,
  mismo tipo que la PK, con índice y política `ON DELETE` justificada (`RESTRICT` por defecto,
  `CASCADE` solo en detalles y pivotes).
- Booleanos `is_`/`has_`, fechas con hora `_at` en UTC, solo fecha `_date`. Dinero
  `DECIMAL(19,4)`, nunca `FLOAT`. `VARCHAR` con la longitud de la tabla de dominios, nunca
  `VARCHAR(max)` ni 255 por defecto. Documentos de identidad en `VARCHAR`. Sin `ENUM` nativo ni `BLOB`.
- Auditoría obligatoria: `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`,
  `deleted_by`. Borrado lógico con `deleted_at` (SoftDeletes); `is_active` solo cuando «inactivo»
  es un estado de negocio distinto. Sin columna de «comentario» por fila: el motivo va en
  `core.audit_logs`.
- `NOT NULL` por defecto; `UNIQUE` en identificadores de negocio; `CHECK` en rangos y estados;
  toda constraint e índice con nombre explícito (`pk_`, `fk_`, `uq_`, `ck_`, `ix_{tabla}_{columnas}`).
- Índices en toda FK (explícito en PostgreSQL) y en columnas de filtro u orden reales; nunca solo
  sobre un booleano o `deleted_at` (parcial en PostgreSQL, compuesto en MySQL).
- Valores repetidos en tabla de catálogo con `code` único y estable; `VARCHAR(30)` + `CHECK` cuando
  los define el código.
- Lógica de negocio en la aplicación. Vistas `vw_`, procedimientos `usp_` (nunca `sp_`), funciones
  `fn_`, triggers `trg_` solo para columnas técnicas. Consultas parametrizadas, sin `SELECT *`,
  paginadas y con `with()` contra N+1.
- Todo cambio de esquema es una migración con `down()` probado, nombre descriptivo, constraints
  nombrados y seeders idempotentes; nunca `ALTER TABLE` a mano. Eliminar o renombrar columnas en dos
  despliegues.
- MySQL `utf8mb4_0900_ai_ci`, PostgreSQL `UTF8`; base y conexión en UTC; usuario de aplicación sin
  privilegios DDL.

## Antes de dar por terminada una migración

Corre el checklist de la sección 15 de `DATABASE_GUIDE.md` (nombres, estructura, integridad,
índices, migración, documentación) y confirma que `COMMENT` está en la tabla y en las columnas no
obvias.

## Al revisar un esquema existente

Compara contra la guía y reporta, en este orden: nombres en español o con prefijos de tipo, PK
que no sea `id` `BIGINT`, relaciones sin `FOREIGN KEY`, columnas de auditoría que faltan, tipos
fuera de la tabla de dominios (`FLOAT` en montos, `VARCHAR(max)`, `ENUM`), índices que faltan en
FK o sobran en booleanos, constraints sin nombre, lógica de negocio en triggers. Propón la
migración concreta que lo corrige, en dos despliegues cuando renombra o elimina columnas.

Si lo que se pide contradice la guía, dilo en una línea y ofrece la alternativa que la cumple.
