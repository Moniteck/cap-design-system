// Paleta de gráficas desde tokens.json. Uso: import { chartColors } from '@/../design/chart-colors.js';
// Recalcular al cambiar de tema (las gráficas en canvas no leen variables CSS).
import tokens from './tokens.json';

export function chartColors(isDark = document.documentElement.classList.contains('dark')) {
    const { brand, chrome, status } = tokens;

    return {
        // series[0] es la principal; máximo cuatro series por gráfica.
        series: isDark
            ? [brand.redSoft, chrome.paper, brand.gray, chrome.line]
            : [brand.red, chrome.surface, brand.gray, chrome.paperLine],
        status: status[isDark ? 'dark' : 'light'],
        text: isDark ? brand.gray : '#616161',
        grid: isDark ? chrome.line : chrome.paperLine,
    };
}
