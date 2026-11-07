# Instrucciones de diseño para agentes de IA

Este proyecto sigue la identidad visual de Grupo CAP: marco de vidrio ahumado flotando sobre un
lienzo piedra, tarjetas blanco hueso, Inter y Poppins, y la escala de rojos de la marca con el rojo
CAP como acento. Antes de crear o modificar cualquier
interfaz (página, componente, tabla, formulario, modal, toast, correo, PDF, gráfica, animación):

1. Lee `DESIGN_GUIDE.md` de esta carpeta y aplícala completa. El «Recetario» trae las clases
   exactas de los componentes comunes: cópialas tal cual.
2. Toma colores, fuentes y movimiento de `tokens.json`. Nunca escribas un hex a mano: clases
   `cap-*` del preset de Tailwind, variables `--cap-*` de `tokens.css` en CSS propio,
   `statusBadgeClass()` de `statuses.js` para badges, `chartColors()` de `chart-colors.js` en
   gráficas y `config('design.brand.red')` en PHP. Única excepción: los logos de terceros de
   `logos/`, con sus colores oficiales.
3. Botones en píldora: primario negro (uno por pantalla), secundario con contorno neutro,
   destructivo rojo. El rojo CAP nunca es fondo de cabeceras ni barras; la única superficie grande
   en color es la tarjeta destacada en vino, una por fila de cifras. El azul solo como estado `info`.
4. Inter para texto, Poppins para títulos y cabeceras. Tamaños solo de la escala de la guía; nada
   por debajo de `text-xs`.
5. Alias de rol (`bg-cap-card`, `border-cap-divider`, `bg-cap-head`…) cambian solos de tema; toda
   clase de color física lleva su `dark:`, salvo las de las recetas, que se copian tal cual.
   Verifica la pantalla en los dos temas.
6. Diseña los cinco estados (vacío, sin resultados, cargando, error, parcial) y el foco visible.
7. Movimiento solo con `duration-cap-*`, `ease-cap*` y `animate-cap-*`. Las vistas suben solas al
   entrar; los tableros llevan `cap-stagger`. Las cargas usan `CapSkeleton` o `<x-cap.skeleton>`.
8. Antes de crear un componente nuevo, busca si el proyecto ya tiene uno equivalente.
9. El marco, el acceso, la confirmación y los toasts se hacen **siempre** con el componente del
   stack (`<x-cap.*>` en Blade, `design/vue/Cap*.vue` en Vue) o, si no hay, siguiendo
   `shell/SHELL_SPEC.md`. Nunca los armes a mano con Tailwind. Los botones son `CapButton` o
   `<x-cap.button>`, y los avisos en línea `CapAlert` o `<x-cap.alert>`. Vidrio solo para lo que flota
   (marco, notificaciones, toasts, tooltips, hoja «Más»); tarjetas, modales e inputs son sólidos.
10. Antes de terminar, corre la lista «Antes de terminar una pantalla» de `DESIGN_GUIDE.md`:
    sin `rgba(` a mano, sin hex, y pantalla revisada a <1024px (vista móvil) y en claro y oscuro.

Si algo que te piden contradice la guía, dilo en una línea y propone la alternativa que sí la
cumple. Si la guía no cubre un caso, resuélvelo con los mismos tokens y el mismo criterio
(sobrio, neutro, un solo acento) y anótalo como decisión.
