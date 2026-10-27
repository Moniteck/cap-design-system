# Instrucciones de diseño para agentes de IA

Este proyecto sigue la identidad visual de Grupo CAP. Antes de crear o modificar cualquier
interfaz (página, componente, tabla, formulario, modal, toast, correo, PDF, gráfica, animación):

1. Lee `DESIGN_GUIDE.md` de esta carpeta y aplícala completa. El «Recetario» trae las clases
   exactas de los componentes comunes: cópialas tal cual.
2. Toma colores, fuentes y movimiento de `tokens.json`. Nunca escribas un hex a mano: clases
   `cap-*` del preset de Tailwind, variables `--cap-*` de `tokens.css` en CSS propio,
   `statusBadgeClass()` de `statuses.js` para badges, `chartColors()` de `chart-colors.js` en
   gráficas y `config('design.brand.red')` en PHP.
3. Botón primario negro (uno por pantalla), secundario con contorno neutro, destructivo rojo. El
   rojo nunca es fondo de cabeceras ni barras. El azul solo como estado `info`.
4. Inter para texto, Poppins para títulos y cabeceras. Tamaños solo de la escala de la guía; nada
   por debajo de `text-xs`.
5. Alias de rol (`bg-cap-card`, `border-cap-divider`, `bg-cap-head`…) cambian solos de tema; toda
   clase de color física lleva su `dark:`. Verifica la pantalla en los dos temas.
6. Diseña los cinco estados (vacío, sin resultados, cargando, error, parcial) y el foco visible.
7. Movimiento solo con `duration-cap-*`, `ease-cap*` y `animate-cap-*`.
8. Antes de crear un componente nuevo, busca si el proyecto ya tiene uno equivalente.

Si algo que te piden contradice la guía, dilo en una línea y propone la alternativa que sí la
cumple. Si la guía no cubre un caso, resuélvelo con los mismos tokens y el mismo criterio
(sobrio, neutro, un solo acento) y anótalo como decisión.
