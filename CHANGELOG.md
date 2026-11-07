# Cambios

## 2.0.0 · 2026-11-05

Cambio mayor: reemplaza reglas de la 1.x (ver «Migrar desde 1.x»).

**Nuevo**

- Marco flotante de vidrio ahumado sobre un lienzo piedra con manchones: sidebar colapsable (panel de 236 px o riel de 66 px, con el estado recordado), header sticky, vista móvil con barra superior, tabbar de hasta 4 destinos más «Más», hoja «Más» y botón flotante. Hace scroll la ventana.
- `design/shell.css` (CSS plano `.cap-*`, único para todos los stacks), `design/shell.js` y `shell-auto.js` (comportamiento sin framework), `design/shell/SHELL_SPEC.md` (especificación agnóstica con HTML de referencia, y las guías «Portar a React» y «Portar a Astro»).
- Componentes listos: Vue (`design/vue/Cap*.vue`, `<script setup>`) y Blade (`<x-cap.*>`): layout, sidebar, header, tabbar, hoja «Más», notificaciones, toasts, confirmación, aviso en línea, botón y acceso.
- Sidebar en riel que se asoma con hover o teclado: flota a 236 px sin mover el contenido ni cambiar la preferencia; la flecha lo deja fijo. `bindSidebarPeek` en `shell/js/collapse.js`.
- Movimiento del contenido en `shell/css/motion.css`: las vistas suben solas al entrar a `.cap-shell__content`, `cap-stagger` escalona los tableros, y hay salida suave en notificaciones y respuesta al presionar botones.
- Esqueletos con barrido: `CapSkeleton` y `<x-cap.skeleton>` con variantes `table`, `stats` y `line`, y clase `.cap-skeleton`.
- Pantalla de acceso nueva: foto de faena (la provee cada sistema), tarjeta de vidrio blanco con el formulario abierto y Microsoft y Google lado a lado.
- Paleta 2.0 cálida (piedra, blanco hueso, marco `#1E1B1A`) y escala de rojos `cap-red-50` a `cap-red-800` (vino, rojo CAP, rojo medio, rosado, tinte); tokens de vidrio, manchones, radios (`rounded-cap-control|card|shell|sheet`) y sombras; `cap-text-soft`.
- Regla del vidrio: vidrio para lo que flota, sólido para lo que se lee o se decide.
- Recetas nuevas: tarjeta de cifra (normal, destacada, de alerta), tarjeta de lista móvil, chips de filtro, contadores en mosaico, barra de acciones, selector, paginación, menú `⋮`, datos de un registro, historial y página de error. `chartColors()` usa colores de marca en un orden validado para daltonismo.
- Un solo buscador por pantalla: el sidebar ya no trae «Buscar» y el atajo ⌘K se muestra en el header.
- `install.sh`: soporta Laravel (Blade y Vue), React y Astro con el mismo comando; copia los componentes y los logos, importa `tokens.css` y `shell.css`, y aborta sin tocar nada si una carpeta de destino no es del paquete.
- `install.sh` con Tailwind 4: crea `tailwind.config.js` si falta y agrega `@config` a la hoja global. Busca también `resources/views/layouts/app.blade.php`. Deja los imports en orden tokens, shell, íconos. En Laravel quita la fuente por defecto (`--font-sans` e Instrument Sans) y deja el script de tema antes de cualquier CSS.
- Blade conectado sin editar `components/cap`: `logout-action`, `mark-read-action`, `href` por notificación, `search-href`, `back-href`, `topbar-search` y slot `topbarActions`. Filtro de notificaciones y estado «ingresando» por atributos `data-cap-*`.
- Vue: `linkProp` para vue-router (`to`), `backHref`, `topbarSearch`, evento `search` y slot `topbar-actions`. Requiere Vue 3.5 o superior.
- Estándar de base de datos `database/DATABASE_GUIDE.md` para MySQL y PostgreSQL (nombres en inglés, tipos por dominio, auditoría, borrado lógico, llaves, índices, catálogos, migraciones, seguridad, documentación y checklist de revisión) con ejemplo completo. En Laravel el instalador lo copia a `database/DATABASE_GUIDE.md` y agrega su línea a `AGENTS.md`. Skill `cap-database` en el plugin.

**Migrar desde 1.x**

Vuelve a correr el comando de instalación y revisa estas reglas, que ya no valen:

| 1.x | 2.0 |
|---|---|
| Marco negro pegado a los bordes | Marco de vidrio flotante, con 12 px de aire y esquinas de 24 px |
| Ítem activo del menú en rojo sólido (`bg-cap-brand text-white`) | Píldora de vidrio con filo rojo de 3 px; es el componente, no una clase |
| Nunca una tarjeta de color sólido | Permitida la tarjeta destacada en vino, una por fila de cifras |
| Sin degradados | Salvo los manchones del lienzo detrás del marco |
| `rounded-cap-card` de 10 px, modales de 12 px | Tarjeta de 20 px, marco y modales de 24 px, controles de 14 px, botones en píldora |
| Paleta neutra: `#212121`, `#F3F2F1`, `#FFFFFF` | Paleta cálida: `#1E1B1A`, `#F1EDE9`, `#FFFDFB`; el rojo CAP `#B12530` no cambia |
| Pantalla de acceso con panel de marca negro | Foto de faena y tarjeta de vidrio blanco: usar `<x-cap.login>` o `CapLogin` |
| Navegación, toasts y confirmación armados con las clases del recetario | Siempre el componente del stack o `SHELL_SPEC.md` |
| `chartColors()` con negro y grises | Escala de rojos y topo |

Los toasts, los avisos y las confirmaciones conservan sus reglas de comportamiento (tiempos, foco, vocabulario); solo cambia el aspecto. El instalador sobrescribe `resources/design/` (o `src/design/`) en cada corrida: no lo edites.

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
