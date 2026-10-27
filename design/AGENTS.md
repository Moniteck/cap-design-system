# Instrucciones de diseño para agentes de IA

Este proyecto sigue la identidad visual de Grupo CAP. Antes de crear o modificar cualquier
interfaz (página, componente, correo, PDF):

1. Lee `DESIGN_GUIDE.md` de esta carpeta y aplícala completa: paleta, tipografía, estructura,
   componentes, tres estados (vacío, cargando, error) y modo oscuro.
2. Toma los colores y fuentes de `tokens.json`. Nunca escribas un hex a mano: usa las clases
   `cap-*` del preset de Tailwind, las variables `--cap-*` de `tokens.css` en CSS propio,
   `import tokens from '.../tokens.json'` en gráficas y `config('design.brand.red')` en PHP.
3. Botón primario negro, secundario con contorno, destructivo rojo. El rojo nunca es fondo de
   cabeceras ni barras. El azul solo como estado `info`.
4. Inter para texto, Poppins para títulos y cabeceras. Nada por debajo de 11 px.
5. Toda clase de color con su variante `dark:`; verifica la pantalla en los dos temas.
6. Antes de crear un componente nuevo, busca si el proyecto ya tiene uno equivalente.

Si algo que te piden contradice la guía, dilo en una línea y propone la alternativa que sí la
cumple. Si la guía no cubre un caso, resuélvelo con los mismos tokens y el mismo criterio
(sobrio, neutro, un solo acento) y anótalo como decisión.
