---
name: cap-design
description: Identidad visual de Grupo CAP para cualquier sistema interno. Usar SIEMPRE antes de crear o modificar interfaz (páginas, componentes Vue/Blade, tablas, formularios, modales, toasts, correos, PDF, gráficas, estilos CSS o Tailwind, animaciones) y al revisar si una pantalla respeta el manual de marca. Carga la guía de diseño, el recetario de clases y los tokens (colores, fuentes, estados, movimiento).
allowed-tools: Read
---

# Diseño Grupo CAP

Toda interfaz de un sistema de Grupo CAP se ve igual: marco negro, lienzo gris cálido, tarjetas
blancas, Inter para texto, Poppins para títulos y el rojo de marca solo como acento.

## Antes de escribir una línea de UI

1. Lee la guía completa: `${CLAUDE_PLUGIN_ROOT}/design/DESIGN_GUIDE.md`. El «Recetario» trae las
   clases exactas de botones, tabla, badge, campo, modal, vacío, esqueleto, aviso y navegación:
   cópialas tal cual.
2. Toma colores, fuentes y movimiento de `${CLAUDE_PLUGIN_ROOT}/design/tokens.json`. Nunca un hex
   a mano.
3. El proyecto debe tener instalada la carpeta `design/` (normalmente `resources/design/`), con las
   clases `cap-*`, las variables `--cap-*`, `statuses.js`, `chart-colors.js` y `config('design.*')`.
   Si no la tiene, detente y propón al usuario instalarla con el comando del README de
   `${CLAUDE_PLUGIN_ROOT}` (`git clone --depth 1 git@github.com:Moniteck/cap-design-system.git
   /tmp/cap-design-system && bash /tmp/cap-design-system/install.sh`, que configura Tailwind, CSS,
   íconos, config PHP, fuentes y AGENTS.md); no generes interfaz con hex a mano. Si decide no instalarla, copia solo `tokens.css` al proyecto,
   usa `var(--cap-*)` y anótalo como deuda.
4. Antes de crear un componente nuevo, busca uno equivalente en el proyecto.

## Resumen operativo

- Primario negro (invertido a blanco en oscuro), secundario con contorno neutro, destructivo rojo.
  Uno primario por pantalla.
- Alias de rol (`bg-cap-card`, `bg-cap-page`, `bg-cap-card-2`, `border-cap-divider`,
  `bg-cap-head`, `border-cap-input-line`) cambian solos de tema; las clases físicas y los
  `text-gray-*` llevan su `dark:`.
- El rojo nunca es fondo de cabeceras ni barras; el rojo suave nunca lleva texto blanco encima; el
  azul solo como estado `info`.
- Tablas con cabecera `bg-cap-head` en Poppins `text-xs`, enlace en rojo, cifras a la derecha con
  `tabular-nums`, exportar con contorno neutro.
- Badges con `statusBadgeClass()`; gráficas con `chartColors()`.
- Cinco estados: vacío, sin resultados, cargando (esqueleto `animate-cap-pulse`), error, parcial.
- Movimiento solo con `duration-cap-*`, `ease-cap*` y `animate-cap-*`; la salida un escalón más
  corta que la entrada; sin animaciones por sección ni al hacer scroll.
- Confirmaciones destructivas con verbo y objeto, «Cancelar» a la izquierda y foco inicial en él.
- Sin degradados, sin grises azulados, sin mayúsculas espaciadas, sin emojis como íconos, nada
  por debajo de `text-xs`, ningún `z-index` fuera de `z-cap-*`.

## Antes de dar por terminada una pantalla

1. Ninguna clase `bg-/text-/border-` física sin `dark:`, salvo los alias de rol y los pares de
   `statuses.js`.
2. Ningún `#`, `rgb(`, `text-[…px]`, `duration-[`, `duration-300` ni `animate-pulse` en el diff.
3. Existen los cinco estados; hay un solo botón primario; las cabeceras de tabla van en
   `bg-cap-head`.
4. Foco visible con `focus-visible:ring-*` en todo lo interactivo; modales con `role="dialog"`.
5. Revisada en claro y en oscuro.

## Al revisar una pantalla existente

Compara contra la guía y reporta, en este orden: hex a mano, colores fuera de la paleta,
tipografía o tamaños fuera de la escala, botones sin jerarquía, estados que faltan, foco y modo
oscuro rotos, animaciones fuera de los tokens. Propón el cambio concreto con las clases del
recetario.

Si lo que se pide contradice la guía, dilo en una línea y ofrece la alternativa que la cumple.
