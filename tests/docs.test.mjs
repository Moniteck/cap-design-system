import { describe, expect, it } from 'vitest';
import { readRepoFile as read } from './helpers/repo-files.mjs';

const guide = read('design/DESIGN_GUIDE.md');
const tokensSource = read('design/tokens.json');

const paletteSection = () => guide.split(/^## Paleta$/m)[1].split(/^## /m)[0];

describe('version 2.0.0', () => {
  it('is declared in plugin.json and tokens.json', () => {
    expect(JSON.parse(read('.claude-plugin/plugin.json')).version).toBe('2.0.0');
    expect(JSON.parse(tokensSource).version).toBe('2.0.0');
  });

  it('starts the changelog with the 2.0.0 entry and a migration guide', () => {
    const changelog = read('CHANGELOG.md');
    expect(changelog).toMatch(/^# Cambios\n\n## 2\.0\.0/);
    expect(changelog).toContain('Migrar desde 1.x');
  });

  it('lists the new stacks in plugin keywords and marketplace tags', () => {
    const keywords = JSON.parse(read('.claude-plugin/plugin.json')).keywords;
    const tags = JSON.parse(read('.claude-plugin/marketplace.json')).plugins[0].tags;
    for (const stack of ['blade', 'react', 'astro']) {
      expect(keywords).toContain(stack);
      expect(tags).toContain(stack);
    }
  });
});

describe('DESIGN_GUIDE.md', () => {
  it('drops the 1.x rules replaced by 2.0', () => {
    expect(guide).not.toContain('#212121');
    expect(guide).not.toContain('nunca una tarjeta de color sólido');
    expect(guide).not.toContain('`rounded-cap-card` (10)');
    expect(guide).not.toMatch(/ítem activo `bg-cap-brand text-white`/);
  });

  it('points to the shell spec', () => {
    expect(guide).toContain('SHELL_SPEC.md');
  });

  it('only lists palette hex values that exist in tokens.json', () => {
    const hexValues = paletteSection().match(/#[0-9A-Fa-f]{6}\b/g);
    expect(hexValues.length).toBeGreaterThan(10);
    const missing = hexValues.filter((hex) => !tokensSource.toUpperCase().includes(hex.toUpperCase()));
    expect(missing).toEqual([]);
  });
});

describe('agent instructions', () => {
  it.each(['design/AGENTS.md', 'skills/cap-design/SKILL.md'])('%s requires the stack component for the shell', (path) => {
    const text = read(path);
    expect(text).toContain('SHELL_SPEC.md');
    expect(text).toContain('<x-cap.');
    expect(text).toContain('sin `rgba(` a mano');
    expect(text).toContain('<1024px');
  });
});
