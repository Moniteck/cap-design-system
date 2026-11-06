import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const TEXT_MINIMUM = 4.5;
const CONTROL_MINIMUM = 3;

function hexToChannels(hex) {
  const digits = hex.replace('#', '');
  return [0, 2, 4].map((start) => parseInt(digits.slice(start, start + 2), 16));
}

function channelsToHex(channels) {
  return `#${channels.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
}

function relativeLuminance(hex) {
  const [red, green, blue] = hexToChannels(hex).map((channel) => {
    const unit = channel / 255;
    return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground, background) {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function compositeOver(tint, alpha, backgroundHex) {
  const tintChannels = tint.split(',').map(Number);
  const backgroundChannels = hexToChannels(backgroundHex);
  return channelsToHex(tintChannels.map((channel, index) => channel * alpha + backgroundChannels[index] * (1 - alpha)));
}

function hexToTint(hex) {
  return hexToChannels(hex).join(',');
}

export function contrastReport({ brand, chrome, dark, glass, blobs }) {
  const glassOverCard = compositeOver(glass.dark.tint, glass.dark.alpha, chrome.card);
  const glassOverDarkCard = compositeOver(glass.darkMode.tint, glass.darkMode.alpha, dark.card);
  const loginBackdrop = compositeOver(hexToTint(brand.red), blobs.login.red, chrome.paper);
  const loginGlass = compositeOver(glass.light.tint, glass.light.alpha, loginBackdrop);

  const pairs = [
    ['onChromeSoft on glass over card', chrome.onChromeSoft, glassOverCard, TEXT_MINIMUM],
    ['onChrome on glass over card', chrome.onChrome, glassOverCard, TEXT_MINIMUM],
    ['onChromeSoft on dark glass over dark card', chrome.onChromeSoft, glassOverDarkCard, TEXT_MINIMUM],
    ['onChrome on dark glass over dark card', chrome.onChrome, glassOverDarkCard, TEXT_MINIMUM],
    ['textSoft on card', chrome.textSoft, chrome.card, TEXT_MINIMUM],
    ['textSoft on paper', chrome.textSoft, chrome.paper, TEXT_MINIMUM],
    ['red on redScale.50', brand.red, brand.redScale['50'], TEXT_MINIMUM],
    ['white on wine', '#FFFFFF', brand.wine, TEXT_MINIMUM],
    ['surface on card', chrome.surface, chrome.card, TEXT_MINIMUM],
    ['dark.textSoft on dark.card', dark.textSoft, dark.card, TEXT_MINIMUM],
    ['redSoft on dark.card', brand.redSoft, dark.card, TEXT_MINIMUM],
    ['textSoft on login glass', chrome.textSoft, loginGlass, TEXT_MINIMUM],
    ['inputLine on card', chrome.inputLine, chrome.card, CONTROL_MINIMUM],
  ];

  return pairs.map(([pair, foreground, background, min]) => {
    const ratio = contrastRatio(foreground, background);
    return { pair, ratio, min, pass: ratio >= min };
  });
}

function printReport(report) {
  for (const { pair, ratio, min, pass } of report) {
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2)}:1 (min ${min})  ${pair}`);
  }
}

const isCli = process.argv[1] === fileURLToPath(import.meta.url);
if (isCli) {
  const tokensPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'design', 'tokens.json');
  const report = contrastReport(JSON.parse(readFileSync(tokensPath, 'utf8')));
  printReport(report);
  process.exit(report.every((row) => row.pass) ? 0 : 1);
}
