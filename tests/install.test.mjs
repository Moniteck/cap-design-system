import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const projectsToClean = [];

afterAll(() => projectsToClean.forEach((directory) => rmSync(directory, { recursive: true, force: true })));

function createProject(files, directoryPrefix = 'cap-install-') {
  const project = mkdtempSync(join(tmpdir(), directoryPrefix));
  projectsToClean.push(project);
  for (const [relativePath, content] of Object.entries(files)) {
    mkdirSync(dirname(join(project, relativePath)), { recursive: true });
    writeFileSync(join(project, relativePath), content);
  }
  return project;
}

function runInstaller(project, { installScript = join(repoRoot, 'install.sh'), env = { CAP_DESIGN_SRC: repoRoot } } = {}) {
  const result = spawnSync('bash', [installScript], {
    cwd: project,
    encoding: 'utf8',
    env: { ...process.env, CAP_DESIGN_SRC: '', ...env, CAP_SKIP_NPM: '1' },
  });
  return { status: result.status, output: result.stdout + result.stderr };
}

function read(project, relativePath) {
  return readFileSync(join(project, relativePath), 'utf8');
}

function occurrences(text, fragment) {
  return text.split(fragment).length - 1;
}

const themeScript = "document.documentElement.classList.toggle('dark'";
const esmTailwindConfig = "import forms from '@tailwindcss/forms';\n\nexport default {\n    content: [\n        './resources/views/**/*.blade.php',\n    ],\n    plugins: [forms],\n};\n";

const laravelFiles = {
  artisan: '',
  'package.json': JSON.stringify({ devDependencies: { vue: '^3.5.0' } }),
  'tailwind.config.js': esmTailwindConfig,
  'resources/css/app.css': '@tailwind base;\n',
  'resources/js/app.js': "import './bootstrap';\n",
  'resources/views/app.blade.php': '<html>\n<head>\n</head>\n<body></body>\n</html>\n',
};

const reactFiles = {
  'package.json': JSON.stringify({ dependencies: { react: '^19.0.0' }, devDependencies: { vite: '^6.0.0' } }),
  'index.html': '<html>\n<head>\n</head>\n<body></body>\n</html>\n',
  'src/index.css': 'body { margin: 0; }\n',
};

const astroFiles = {
  'package.json': JSON.stringify({ dependencies: { astro: '^5.0.0' } }),
  'src/layouts/Layout.astro': '<html>\n<head>\n</head>\n<body>\n<slot />\n</body>\n</html>\n',
  'src/styles/global.css': 'body { margin: 0; }\n',
};

describe('laravel', () => {
  test('removes the default Laravel font from css and vite config', () => {
    const project = createProject({
      ...laravelFiles,
      'resources/css/app.css': "@import 'tailwindcss';\n\n@theme {\n    --font-sans: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',\n        'Segoe UI Symbol', 'Noto Color Emoji';\n}\n",
      'vite.config.js': "import { defineConfig } from 'vite';\nimport laravel from 'laravel-vite-plugin';\nimport { bunny } from 'laravel-vite-plugin/fonts';\n\nexport default defineConfig({\n    plugins: [\n        laravel({\n            refresh: true,\n            fonts: [\n                bunny('Instrument Sans', {\n                    weights: [400, 500, 600],\n                }),\n            ],\n        }),\n    ],\n});\n",
    });
    const { status } = runInstaller(project);

    expect(status).toBe(0);
    const css = read(project, 'resources/css/app.css');
    expect(css).not.toContain('--font-sans');
    expect(css).not.toContain('@theme');
    const vite = read(project, 'vite.config.js');
    expect(vite).not.toContain('Instrument Sans');
    expect(vite).not.toContain('bunny');
    expect(vite).toContain('refresh: true,\n        }),');
  });

  test('keeps other theme values and lists a vite font it cannot remove as pending', () => {
    const project = createProject({
      ...laravelFiles,
      'resources/css/app.css': "@theme {\n    --font-sans: 'Instrument Sans';\n    --color-extra: red;\n}\n",
      'vite.config.js': "fonts: [bunny('Figtree'), bunny('Instrument Sans')],\n",
    });
    const { output } = runInstaller(project);

    expect(read(project, 'resources/css/app.css')).toContain('--color-extra: red;');
    expect(output).toContain('quita a mano la fuente Instrument Sans');
  });

  test.each([
    ['@vite', "    @vite(['resources/js/app.js'])\n"],
    ['a conditional around @vite', "    @if (true)\n        @vite(['resources/js/app.js'])\n    @endif\n"],
    ['a stylesheet link', '    <link rel="stylesheet" href="/app.css">\n'],
  ])('puts the theme script after the charset and before %s', (_name, styleLoader) => {
    const project = createProject({
      ...laravelFiles,
      'resources/views/app.blade.php': `<html>\n<head>\n    <meta charset="utf-8">\n${styleLoader}</head>\n<body></body>\n</html>\n`,
    });
    runInstaller(project);

    const layout = read(project, 'resources/views/app.blade.php');
    expect(layout.indexOf('localStorage.theme')).toBeGreaterThan(layout.indexOf('charset'));
    expect(layout.indexOf('localStorage.theme')).toBeLessThan(layout.indexOf(styleLoader.trim()));
  });

  test('copies design, components and logos and patches project files', () => {
    const project = createProject(laravelFiles);
    const { status, output } = runInstaller(project);

    expect(status).toBe(0);
    expect(existsSync(join(project, 'resources/design/shell.css'))).toBe(true);
    expect(existsSync(join(project, 'resources/views/components/cap/app-layout.blade.php'))).toBe(true);
    expect(existsSync(join(project, 'public/cap/logos/google.svg'))).toBe(true);
    expect(existsSync(join(project, 'config/design.php'))).toBe(true);
    expect(existsSync(join(project, 'tests'))).toBe(false);
    expect(existsSync(join(project, 'resources/design/package.json'))).toBe(false);
    expect(read(project, 'resources/css/app.css')).toContain("@import '../design/tokens.css';");
    expect(read(project, 'resources/css/app.css')).toContain("@import '../design/shell.css';");
    expect(read(project, 'resources/js/app.js')).toContain("import '../design/shell-auto.js';");
    expect(read(project, 'resources/views/app.blade.php')).toContain("config('design.fonts.webfont')");
    expect(read(project, 'tailwind.config.js')).toContain("./resources/design/tailwind.preset.js");
    expect(output).toContain('laravel');
    expect(output).toContain('<x-cap.app-layout>');
    expect(output).toContain('CapAppLayout');
  });

  test('running twice leaves every line exactly once', () => {
    const project = createProject(laravelFiles);
    runInstaller(project);
    runInstaller(project);

    const css = read(project, 'resources/css/app.css');
    expect(occurrences(css, 'design/tokens.css')).toBe(1);
    expect(occurrences(css, 'design/shell.css')).toBe(1);
    expect(occurrences(css, 'materialdesignicons')).toBe(1);
    expect(occurrences(read(project, 'resources/js/app.js'), 'shell-auto.js')).toBe(1);
    expect(occurrences(read(project, 'resources/views/app.blade.php'), themeScript)).toBe(1);
    expect(occurrences(read(project, 'tailwind.config.js'), 'tailwind.preset.js')).toBe(1);
    expect(occurrences(read(project, 'tailwind.config.js'), 'presets: [cap]')).toBe(1);
    expect(occurrences(read(project, 'AGENTS.md'), 'resources/design/AGENTS.md')).toBe(1);
  });

  test('upgrades a project that has 1.x installed', () => {
    const project = createProject({
      ...laravelFiles,
      'tailwind.config.js': "import cap from './resources/design/tailwind.preset.js';\n\nexport default {\n    presets: [cap],\n    content: [\n        './resources/design/**/*.js',\n    ],\n};\n",
      'resources/css/app.css': "@import '@mdi/font/css/materialdesignicons.min.css';\n@import '../design/tokens.css';\n@tailwind base;\n",
      'resources/views/app.blade.php': "<html>\n<head>\n<link href=\"https://fonts.bunny.net/css?family={{ config('design.fonts.webfont') }}\">\n</head>\n</html>\n",
      'AGENTS.md': 'Sigue `resources/design/AGENTS.md` y `resources/design/DESIGN_GUIDE.md` en toda interfaz.\n',
    });
    const { status } = runInstaller(project);

    const css = read(project, 'resources/css/app.css');
    expect(status).toBe(0);
    expect(occurrences(css, 'design/tokens.css')).toBe(1);
    expect(occurrences(css, 'materialdesignicons')).toBe(1);
    expect(css).toContain("@import '../design/shell.css';");
    expect(occurrences(read(project, 'resources/views/app.blade.php'), 'fonts.bunny.net')).toBe(1);
    expect(occurrences(read(project, 'AGENTS.md'), 'resources/design/AGENTS.md')).toBe(1);
    expect(occurrences(read(project, 'tailwind.config.js'), 'presets: [cap]')).toBe(1);
  });

  test('lists a CommonJS tailwind config as pending with the laravel preset path', () => {
    const project = createProject({ ...laravelFiles, 'tailwind.config.js': 'module.exports = { content: [] };\n' });
    const { output } = runInstaller(project);

    expect(output).toContain("require('./resources/design/tailwind.preset.js')");
  });
});

describe('react', () => {
  test('copies design into src and patches css and html only', () => {
    const project = createProject(reactFiles);
    const { status, output } = runInstaller(project);

    expect(status).toBe(0);
    expect(existsSync(join(project, 'src/design'))).toBe(true);
    expect(read(project, 'src/index.css')).toContain("@import './design/tokens.css';");
    expect(read(project, 'src/index.css')).toContain("@import './design/shell.css';");
    expect(read(project, 'index.html')).toContain(themeScript);
    expect(read(project, 'index.html')).toContain('fonts.bunny.net/css?family=inter:400,500,600,700|poppins:500,600,700');
    expect(existsSync(join(project, 'config'))).toBe(false);
    expect(existsSync(join(project, 'resources'))).toBe(false);
    expect(output).toContain('Portar a React');
  });

  test('running twice leaves every line exactly once', () => {
    const project = createProject(reactFiles);
    runInstaller(project);
    runInstaller(project);

    const css = read(project, 'src/index.css');
    expect(occurrences(css, 'design/tokens.css')).toBe(1);
    expect(occurrences(css, 'design/shell.css')).toBe(1);
    expect(occurrences(read(project, 'index.html'), themeScript)).toBe(1);
    expect(occurrences(read(project, 'AGENTS.md'), 'src/design/AGENTS.md')).toBe(1);
  });

  test('works when the project path contains spaces', () => {
    const project = createProject(reactFiles, 'cap install spaces-');
    const { status } = runInstaller(project);

    expect(status).toBe(0);
    expect(read(project, 'src/index.css')).toContain("@import './design/shell.css';");
  });

  test('lists a Next.js app layout as pending', () => {
    const project = createProject({ ...reactFiles, 'app/layout.tsx': 'export default function Layout() {}\n' });
    const { output } = runInstaller(project);

    expect(output).toContain('app/layout.tsx');
  });
});

describe('astro', () => {
  test('imports css and patches the layout', () => {
    const project = createProject(astroFiles);
    const { status } = runInstaller(project);

    const layout = read(project, 'src/layouts/Layout.astro');
    expect(status).toBe(0);
    expect(read(project, 'src/styles/global.css')).toContain("@import '../design/shell.css';");
    expect(layout).toContain(themeScript);
    expect(layout).toContain('<script is:inline>');
    expect(layout).toContain("import '../design/shell-auto.js';");
  });

  test('running twice leaves every line exactly once', () => {
    const project = createProject(astroFiles);
    runInstaller(project);
    runInstaller(project);

    const layout = read(project, 'src/layouts/Layout.astro');
    expect(occurrences(layout, themeScript)).toBe(1);
    expect(occurrences(layout, 'shell-auto.js')).toBe(1);
    expect(occurrences(read(project, 'src/styles/global.css'), 'design/tokens.css')).toBe(1);
  });
});

describe('import order', () => {
  test('a new install leaves tokens, shell and icons in that order', () => {
    const project = createProject(reactFiles);
    runInstaller(project);

    const css = read(project, 'src/index.css');
    expect(css.indexOf('design/tokens.css')).toBeLessThan(css.indexOf('design/shell.css'));
    expect(css.indexOf('design/shell.css')).toBeLessThan(css.indexOf('materialdesignicons'));
  });
});

describe('tailwind 4', () => {
  const tailwind4Css = "@import 'tailwindcss';\n\n@source '../views';\n";
  const tailwind4Package = (dependencies) => JSON.stringify({ devDependencies: { tailwindcss: '^4.0.0', ...dependencies } });
  const { 'tailwind.config.js': unusedConfig, ...laravelWithoutConfig } = laravelFiles;
  const stacks = [
    ['laravel', { ...laravelWithoutConfig, 'package.json': tailwind4Package({ vue: '^3.5.0' }), 'resources/css/app.css': tailwind4Css }, 'resources/css/app.css', '../../tailwind.config.js', './resources/design'],
    ['react', { ...reactFiles, 'package.json': JSON.stringify({ dependencies: { react: '^19.0.0' }, devDependencies: { tailwindcss: '^4.1.0' } }), 'src/index.css': "@import 'tailwindcss';\n" }, 'src/index.css', '../tailwind.config.js', './src/design'],
    ['astro', { ...astroFiles, 'src/styles/global.css': '@import "tailwindcss";\n' }, 'src/styles/global.css', '../../tailwind.config.js', './src/design'],
  ];

  test.each(stacks)('%s: creates the config and links it after the imports', (stack, files, cssPath, configPath, designPath) => {
    const project = createProject(files);
    const { status } = runInstaller(project);

    const css = read(project, cssPath);
    const config = read(project, 'tailwind.config.js');
    expect(status).toBe(0);
    expect(config).toContain(`import cap from '${designPath}/tailwind.preset.js';`);
    expect(config).toContain('presets: [cap]');
    expect(config).toContain(stack === 'laravel' ? `'${designPath}/**/*.{js,vue}'` : `'${designPath}/**/*.js'`);
    expect(css).toContain(`@config '${configPath}';`);
    expect(css.indexOf('@config')).toBeGreaterThan(css.lastIndexOf('@import'));
  });

  test.each(stacks)('%s: running twice changes nothing', (stack, files, cssPath) => {
    const project = createProject(files);
    runInstaller(project);
    const css = read(project, cssPath);
    const config = read(project, 'tailwind.config.js');
    runInstaller(project);

    expect(read(project, cssPath)).toBe(css);
    expect(read(project, 'tailwind.config.js')).toBe(config);
    expect(occurrences(css, '@config')).toBe(1);
  });

  test('detects tailwind 4 from the stylesheet alone', () => {
    const project = createProject({ ...reactFiles, 'src/index.css': "@import 'tailwindcss';\n" });
    runInstaller(project);

    expect(existsSync(join(project, 'tailwind.config.js'))).toBe(true);
    expect(read(project, 'src/index.css')).toContain("@config '../tailwind.config.js';");
  });

  test('patches an existing config instead of replacing it', () => {
    const project = createProject({ ...laravelFiles, 'package.json': tailwind4Package(), 'resources/css/app.css': tailwind4Css });
    runInstaller(project);

    expect(read(project, 'tailwind.config.js')).toContain("import forms from '@tailwindcss/forms';");
    expect(read(project, 'tailwind.config.js')).toContain('presets: [cap]');
    expect(read(project, 'resources/css/app.css')).toContain("@config '../../tailwind.config.js';");
  });

  test('keeps a @config that points elsewhere and lists it as pending', () => {
    const css = "@import 'tailwindcss';\n@config '../../tw.config.js';\n";
    const project = createProject({ ...laravelFiles, 'package.json': tailwind4Package(), 'resources/css/app.css': css });
    const { output } = runInstaller(project);

    expect(occurrences(read(project, 'resources/css/app.css'), '@config')).toBe(1);
    expect(output).toContain('otro @config');
  });

  test('does not touch tailwind 3 projects', () => {
    const project = createProject(laravelFiles);
    runInstaller(project);

    expect(read(project, 'resources/css/app.css')).not.toContain('@config');
  });

  test('does not treat tailwind 3 with a tailwindcss/base import as tailwind 4', () => {
    const project = createProject({
      ...laravelFiles,
      'package.json': JSON.stringify({ devDependencies: { tailwindcss: '^3.4.0', vue: '^3.5.0' } }),
      'resources/css/app.css': "@import 'tailwindcss/base';\n",
    });
    runInstaller(project);

    expect(read(project, 'resources/css/app.css')).not.toContain('@config');
  });
});

describe('laravel root layout', () => {
  const { 'resources/views/app.blade.php': unusedLayout, ...filesWithoutLayout } = laravelFiles;

  test('patches resources/views/layouts/app.blade.php when it is the root layout', () => {
    const project = createProject({ ...filesWithoutLayout, 'resources/views/layouts/app.blade.php': '<html>\n<head>\n</head>\n</html>\n' });
    runInstaller(project);

    expect(read(project, 'resources/views/layouts/app.blade.php')).toContain("config('design.fonts.webfont')");
  });

  test('without a root layout the pending item says what to paste and where', () => {
    const { output } = runInstaller(createProject(filesWithoutLayout));

    expect(output).toContain('README › Fuentes y modo oscuro');
    expect(output).toContain('<head>');
    expect(output).not.toContain('No hay resources/views/app.blade.php');
  });
});

describe('head snippet', () => {
  const bunnyLink = '<link href="https://fonts.bunny.net/css?family=figtree:400" rel="stylesheet">';

  test('keeps the font links of a React project', () => {
    const project = createProject({ ...reactFiles, 'index.html': `<html>\n<head>\n    ${bunnyLink}\n</head>\n</html>\n` });
    runInstaller(project);

    expect(read(project, 'index.html')).toContain(bunnyLink);
  });

  test('keeps the font links of an Astro layout', () => {
    const project = createProject({ ...astroFiles, 'src/layouts/Layout.astro': `<html>\n<head>\n    ${bunnyLink}\n</head>\n<body>\n</body>\n</html>\n` });
    runInstaller(project);

    expect(read(project, 'src/layouts/Layout.astro')).toContain(bunnyLink);
  });

  test('replaces the font links of a Blade layout', () => {
    const project = createProject({ ...laravelFiles, 'resources/views/app.blade.php': `<html>\n<head>\n    ${bunnyLink}\n</head>\n</html>\n` });
    runInstaller(project);

    expect(read(project, 'resources/views/app.blade.php')).not.toContain(bunnyLink);
  });

  test('the theme script survives a blocked localStorage', () => {
    const project = createProject(reactFiles);
    runInstaller(project);

    const [, script] = read(project, 'index.html').match(/<script>([\s\S]*?)<\/script>/);
    const toggle = vi.fn();
    const blockedWindow = { get localStorage() { throw new Error('blocked'); } };
    const run = new Function('window', 'matchMedia', 'document', `with (window) { ${script} }`);
    expect(() => run(blockedWindow, () => ({ matches: true }), { documentElement: { classList: { toggle } } })).not.toThrow();
    expect(toggle).toHaveBeenCalledWith('dark', true);
  });
});

describe('tailwind config edge cases', () => {
  test('a config without content: [ is left untouched and listed as pending', () => {
    const config = 'export default {\n    theme: {},\n};\n';
    const project = createProject({ ...laravelFiles, 'tailwind.config.js': config });
    const { output } = runInstaller(project);

    expect(read(project, 'tailwind.config.js')).toBe(config);
    expect(output).toContain('content: [');
  });

  test('a TypeScript config is listed as pending with the stack preset path', () => {
    const { 'tailwind.config.js': unusedConfig, ...files } = laravelFiles;
    const project = createProject({ ...files, 'tailwind.config.ts': 'export default { content: [] };\n' });
    const { output } = runInstaller(project);

    expect(output).toContain('tailwind.config.ts');
    expect(output).toContain('./resources/design/tailwind.preset.js');
    expect(existsSync(join(project, 'tailwind.config.js'))).toBe(false);
  });

  test('the missing config message names every supported extension', () => {
    const { output } = runInstaller(createProject(reactFiles));

    expect(output).toContain('tailwind.config.{js,mjs,ts}');
  });
});

test('aborts naming the three supported stacks when nothing matches', () => {
  const project = createProject({ 'package.json': JSON.stringify({ dependencies: { express: '^4.0.0' } }) });
  const { status, output } = runInstaller(project);

  expect(status).not.toBe(0);
  for (const stack of ['Laravel', 'React', 'Astro']) expect(output).toContain(stack);
});

describe('protection of foreign folders', () => {
  test('keeps a project src/design folder and reports it', () => {
    const project = createProject({ ...reactFiles, 'src/design/my.css': 'a {}\n' });
    const { status, output } = runInstaller(project);

    expect(status).not.toBe(0);
    expect(read(project, 'src/design/my.css')).toBe('a {}\n');
    expect(output).toContain('src/design');
    expect(read(project, 'src/index.css')).not.toContain('design/tokens.css');
  });

  test('keeps foreign blade components and touches nothing else', () => {
    const project = createProject({ ...laravelFiles, 'resources/views/components/cap/x.blade.php': 'x\n' });
    const { status, output } = runInstaller(project);

    expect(status).not.toBe(0);
    expect(read(project, 'resources/views/components/cap/x.blade.php')).toBe('x\n');
    expect(output).toContain('resources/views/components/cap');
    expect(existsSync(join(project, 'resources/design'))).toBe(false);
  });
});

test('works from a copy of the package without CAP_DESIGN_SRC', () => {
  const packageCopy = mkdtempSync(join(tmpdir(), 'cap-package-'));
  projectsToClean.push(packageCopy);
  for (const entry of ['design', 'scripts', 'install.sh']) cpSync(join(repoRoot, entry), join(packageCopy, entry), { recursive: true });
  const project = createProject(astroFiles);
  const { status } = runInstaller(project, { installScript: join(packageCopy, 'install.sh'), env: {} });

  expect(status).toBe(0);
  expect(read(project, 'src/layouts/Layout.astro')).toContain(themeScript);
});
