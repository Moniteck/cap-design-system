import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readRepoFile as read } from './helpers/repo-files.mjs';

const spec = read('design/shell/SHELL_SPEC.md');

const moduleSources = () =>
  readdirSync(resolve(process.cwd(), 'design/shell/js'))
    .filter((file) => file.endsWith('.js'))
    .map((file) => read(`design/shell/js/${file}`));

const uniqueMatches = (source, pattern) => [...new Set(source.match(pattern) ?? [])];

const declaredLayoutProps = () => {
  const block = read('design/vue/CapAppLayout.vue').match(/defineProps\(\{([\s\S]*?)\n\}\);/)[1];
  return [...block.matchAll(/^ {2}(\w+):/gm)].map((match) => match[1]);
};

describe('SHELL_SPEC.md', () => {
  const attributesInShell = uniqueMatches(read('design/shell.js'), /data-cap-[a-z-]+/g);
  const attributesInModules = uniqueMatches(moduleSources().join('\n'), /data-cap-[a-z-]+/g);

  it.each(attributesInShell)('mentions %s from shell.js', (attribute) => {
    expect(spec).toContain(attribute);
  });

  it.each(attributesInModules)('mentions %s from shell/js modules', (attribute) => {
    expect(spec).toContain(attribute);
  });

  it.each(declaredLayoutProps())('mentions the CapAppLayout prop %s', (prop) => {
    expect(spec).toContain(prop);
  });

  it('has the porting guides', () => {
    expect(spec).toMatch(/^## Portar a React$/m);
    expect(spec).toMatch(/^## Portar a Astro$/m);
  });

  it('documents the storage key', () => {
    expect(spec).toContain('cap-shell:sidebar-collapsed');
  });
});
