// Paleta de gráficas desde tokens.json. Uso: import { chartColors } from '@/../design/chart-colors.js';
// Recalcular al cambiar de tema (las gráficas en canvas no leen variables CSS).
import tokens from './tokens.json';

const darkModeActive = () => document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');

export function chartColors(isDark = darkModeActive()) {
    const { brand, chrome, dark, status } = tokens;

    return {
        // series[0] es la principal; máximo cuatro series por gráfica.
        series: isDark
            ? [brand.redSoft, brand.redScale['200'], brand.taupe, dark.divider]
            : [brand.wine, brand.red, brand.redScale['400'], brand.taupe],
        status: status[isDark ? 'dark' : 'light'],
        text: isDark ? dark.textSoft : chrome.textSoft,
        grid: isDark ? dark.divider : chrome.paperLine,
    };
}
