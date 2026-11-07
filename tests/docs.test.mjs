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

describe('DATABASE_GUIDE.md', () => {
  const databaseGuide = read('database/DATABASE_GUIDE.md');

  it('covers every section of the standard', () => {
    for (const heading of [
      '## 2. Reglas generales de nombres',
      '## 5. Tipos de dato por dominio',
      '## 6. Columnas de auditoría y borrado lógico',
      '## 7. Llaves primarias y foráneas',
      '## 9. Índices',
      '## 12. Migraciones y versionado del esquema',
      '## 15. Checklist de revisión para cada cambio de esquema',
      '## 16. Anexo: ejemplo completo',
    ]) {
      expect(databaseGuide).toContain(heading);
    }
  });

  it('fixes the conventions that replace type prefixes', () => {
    expect(databaseGuide).toContain('`created_at`, `created_by`, `updated_at`, `updated_by`');
    expect(databaseGuide).toContain('`fk_{table}_{referenced_table}`');
    expect(databaseGuide).toContain('`ix_{table}_{columns}`');
    expect(databaseGuide).toContain('DECIMAL(19,4)');
    expect(databaseGuide).toContain('utf8mb4_0900_ai_ci');
  });

  it('shows the example in both engines and as a Laravel migration', () => {
    expect(databaseGuide).toContain('BIGINT GENERATED ALWAYS AS IDENTITY');
    expect(databaseGuide).toContain('BIGINT UNSIGNED NOT NULL AUTO_INCREMENT');
    expect(databaseGuide).toContain("constrained('sales_customers', indexName: 'fk_invoices_customers')");
    expect(databaseGuide).toContain('use SoftDeletes;');
  });

  it('is pointed to by the cap-database skill', () => {
    const skill = read('skills/cap-database/SKILL.md');
    expect(skill).toContain('name: cap-database');
    expect(skill).toContain('${CLAUDE_PLUGIN_ROOT}/database/DATABASE_GUIDE.md');
    expect(skill).toContain('sección 15');
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
