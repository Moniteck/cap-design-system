---
name: cap-design
description: Identidad visual de Grupo CAP para cualquier sistema interno. Usar SIEMPRE antes de crear o modificar interfaz (páginas, componentes Vue/Blade, tablas, formularios, modales, correos, PDF, gráficas, estilos CSS o Tailwind) y al revisar si una pantalla respeta el manual de marca. Carga la guía de diseño y los tokens (colores, fuentes, estados).
allowed-tools: Read
---

# Diseño Grupo CAP

Toda interfaz de un sistema de Grupo CAP se ve igual: marco negro, lienzo gris cálido, tarjetas
blancas, Inter para texto, Poppins para títulos y el rojo de marca solo como acento.

## Antes de escribir una línea de UI

1. Lee la guía completa: `${CLAUDE_PLUGIN_ROOT}/design/DESIGN_GUIDE.md`.
2. Toma colores y fuentes de `${CLAUDE_PLUGIN_ROOT}/design/tokens.json`. Nunca un hex a mano.
3. Si el proyecto ya tiene instalada la carpeta `design/` (normalmente `resources/design/`),
   usa sus clases `cap-*`, sus variables `--cap-*` y su `config('design.*')`. Si no la tiene,
   propón instalarla con `npx degit moniteck/cap-design-system/design resources/design` y, mientras
   tanto, aplica los valores del `tokens.json` del plugin.
4. Antes de crear un componente nuevo, busca uno equivalente en el proyecto.

## Resumen operativo

- Primario negro (invertido a blanco en oscuro), secundario con contorno, destructivo rojo.
- El rojo nunca es fondo de cabeceras ni barras; el azul solo como estado `info`.
- Tablas con cabecera negra en Poppins 600, enlace en rojo, exportar con contorno neutro.
- Tres estados siempre: vacío, cargando, error.
- Modo oscuro obligatorio: cada clase de color con su `dark:`; revisar los dos temas.
- Sin degradados, sin grises azulados, sin mayúsculas espaciadas, sin emojis como íconos, nada
  por debajo de 11 px.

## Al revisar una pantalla existente

Compara contra la guía y reporta, en este orden: hex a mano, colores fuera de la paleta,
tipografía distinta, botones sin jerarquía, estados que faltan, modo oscuro roto. Propón el
cambio concreto con las clases o variables correctas.

Si lo que se pide contradice la guía, dilo en una línea y ofrece la alternativa que la cumple.
