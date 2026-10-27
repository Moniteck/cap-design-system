// Preset de Tailwind con la identidad Grupo CAP. En tailwind.config.js del proyecto:
//   import cap from './resources/design/tailwind.preset.js';
//   export default { presets: [cap], content: [...] };
import colors from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';
import tokens from './tokens.json' with { type: 'json' };

const { brand, chrome, fonts, status, motion } = tokens;

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
                    // Alias de rol: cambian solos con el tema vía tokens.css (no admiten `/opacidad`).
                    page: 'var(--cap-page)',
                    card: 'var(--cap-card)',
                    'card-2': 'var(--cap-card-2)',
                    divider: 'var(--cap-divider)',
                    head: 'var(--cap-head)',
                    'input-line': 'var(--cap-input-line)',
                    status: status.light,
                    'status-dark': status.dark,
                },
            },
            borderRadius: {
                'cap-card': '10px',
            },
            fontSize: {
                // Tablas en densidad compacta: 13/18. Único tamaño fuera de la escala de Tailwind.
                'cap-dense': ['13px', '18px'],
            },
            zIndex: {
                'cap-header': '30',
                'cap-sidebar': '40',
                'cap-dropdown': '50',
                'cap-drawer': '60',
                'cap-modal': '70',
                'cap-toast': '80',
            },
            // Movimiento: `duration-cap-base ease-cap` en transiciones; `animate-cap-rise-in` al montar.
            transitionDuration: {
                'cap-fast': motion.duration.fast,
                'cap-base': motion.duration.base,
                'cap-slow': motion.duration.slow,
            },
            transitionTimingFunction: {
                cap: motion.easing.standard,
                'cap-enter': motion.easing.enter,
                'cap-exit': motion.easing.exit,
            },
            keyframes: {
                'cap-fade-in': { from: { opacity: '0' } },
                'cap-rise-in': { from: { opacity: '0', transform: 'translateY(8px)' } },
                'cap-pulse': { '50%': { opacity: '0.45' } },
            },
            animation: {
                'cap-fade-in': `cap-fade-in ${motion.duration.base} ${motion.easing.enter} both`,
                'cap-rise-in': `cap-rise-in ${motion.duration.base} ${motion.easing.enter} both`,
                'cap-pulse': 'cap-pulse 1.6s ease-in-out infinite',
            },
        },
    },
};
