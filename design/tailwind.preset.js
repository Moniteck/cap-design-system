// Preset de Tailwind con la identidad Grupo CAP. En tailwind.config.js del proyecto:
//   import cap from './resources/design/tailwind.preset.js';
//   export default { presets: [cap], content: [...] };
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
import tokens from './tokens.json' with { type: 'json' };

const { brand, chrome, fonts, status } = tokens;

/** @type {Partial<import('tailwindcss').Config>} */
export default {
    // Modo oscuro por clase `dark` (en <html> o <body>), nunca por preferencia del sistema.
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: [fonts.text, ...defaultTheme.fontFamily.sans],
                display: [fonts.display, ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Los grises de Tailwind (gray, slate, zinc) son fríos y tiñen de azul el modo
                // oscuro al lado del marco #212121; los tres se unifican en la escala neutra.
                gray: colors.neutral,
                slate: colors.neutral,
                zinc: colors.neutral,
                cap: {
                    brand: brand.red,
                    'brand-hover': brand.redHover,
                    'brand-soft': brand.redSoft,
                    'brand-gray': brand.gray,
                    chrome: chrome.surface,
                    rail: chrome.rail,
                    raised: chrome.raised,
                    line: chrome.line,
                    canvas: chrome.canvas,
                    paper: chrome.paper,
                    'paper-line': chrome.paperLine,
                    status: status.light,
                    'status-dark': status.dark,
                },
            },
        },
    },
};
