# Cambios

## 1.2.0 · 2026-10-28

Pantalla de acceso: sección nueva en la guía (panel de marca a la izquierda, tarjeta del formulario a la derecha, versión de celular) con recetas de botón de proveedor, divisor con texto, campo con ícono y ver contraseña, y panel de marca; receta de botón de ícono; nivel tipográfico «Titular de portada»; ver contraseña documentado en «Formularios». `design/logos/`: logos oficiales de Microsoft y Google a color, única excepción a la paleta. `install.sh`: no duplica la línea de la guía en un `CLAUDE.md` que solo incluye `@AGENTS.md`.

## 1.1.0 · 2026-10-27

`install.sh`: instalación y actualización con un solo comando (copia `design/`, preset de Tailwind, imports de CSS e íconos, `config/design.php`, fuentes y modo oscuro en el layout, línea para el agente). Idempotente; lista lo que no puede resolver solo.

## 1.0.1 · 2026-10-27

`chart-colors.js`: detecta la clase `dark` tanto en `<html>` como en `<body>` (el ERP SYM la pone en `<body>`).

## 1.0.0 · 2026-10-26

Primera versión: tokens (colores, fuentes, estados, movimiento), guía de diseño, preset de
Tailwind, variables CSS, `design.php`, helpers `statuses.js` y `chart-colors.js`, skill de Claude
Code `cap-design`.
