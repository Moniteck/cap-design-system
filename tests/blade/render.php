<?php

use Illuminate\Container\Container;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\View\Factory as ViewFactoryContract;
use Illuminate\Events\Dispatcher;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Facade;
use Illuminate\View\Compilers\BladeCompiler;
use Illuminate\View\Engines\CompilerEngine;
use Illuminate\View\Engines\EngineResolver;
use Illuminate\View\Factory;
use Illuminate\View\FileViewFinder;

require __DIR__ . '/vendor/autoload.php';

const SLOT_NAMES = ['slot', 'search', 'headerActions', 'topbarActions'];

[, $componentName, $propsJson, $contextJson] = $argv + [null, null, '{}', '{}'];
$props = json_decode($propsJson, true);
$context = json_decode($contextJson, true);

function request()
{
    global $context;

    return new class($context['routeIs'] ?? false) {
        public function __construct(private bool $routeIsMatching)
        {
        }

        public function routeIs(string ...$patterns): bool
        {
            return $this->routeIsMatching;
        }
    };
}

function route(string $name, mixed $parameters = []): string
{
    global $context;

    return str_replace('{provider}', ((array) $parameters)[0] ?? '', $context['routes'][$name]);
}

function session(string $key, mixed $default = null): mixed
{
    global $context;

    return $context['session'][$key] ?? $default;
}

function old(string $key, mixed $default = null): mixed
{
    return $default;
}

function csrf_field(): string
{
    return '<input type="hidden" name="_token" value="test-token">';
}

function method_field(string $method): string
{
    return '<input type="hidden" name="_method" value="' . htmlspecialchars($method) . '">';
}

function kebabCase(string $name): string
{
    return strtolower(preg_replace('/(?<!^)[A-Z]/', '-$0', $name));
}

function buildTemplate(string $componentName, array $props): string
{
    $slots = array_intersect_key($props, array_flip(SLOT_NAMES));
    $attributes = '';
    foreach (array_diff_key($props, $slots) as $name => $unused) {
        $attributes .= ' :' . kebabCase($name) . '="$props[\'' . $name . '\']"';
    }

    $namedSlots = '';
    foreach (array_diff_key($slots, ['slot' => true]) as $name => $unused) {
        $namedSlots .= '<x-slot:' . $name . '>{!! $props[\'' . $name . '\'] !!}</x-slot:' . $name . '>';
    }

    return '<x-cap.' . $componentName . $attributes . '>' . $namedSlots . '{!! $props[\'slot\'] ?? \'\' !!}</x-cap.' . $componentName . '>';
}

$container = new Container();
Container::setInstance($container);
Facade::setFacadeApplication($container);
$container->instance('router', new class($context['routes'] ?? []) {
    public function __construct(private array $routes)
    {
    }

    public function has(string $name): bool
    {
        return isset($this->routes[$name]);
    }
});

$container->instance(Application::class, new class {
    public function getNamespace(): string
    {
        return 'App\\';
    }
});

$filesystem = new Filesystem();
$compiledPath = sys_get_temp_dir() . '/cap-blade-compiled';
$filesystem->ensureDirectoryExists($compiledPath);
$container->instance('config', new class($compiledPath) {
    public function __construct(private string $compiledPath)
    {
    }

    public function get(string $key): string
    {
        return $this->compiledPath;
    }
});

$compiler = new BladeCompiler($filesystem, $compiledPath);
$engines = new EngineResolver();
$engines->register('blade', fn () => new CompilerEngine($compiler, $filesystem));
$viewFinder = new FileViewFinder($filesystem, []);
$viewFactory = new Factory($engines, $viewFinder, new Dispatcher($container));
$viewFactory->setContainer($container);
$container->instance(ViewFactoryContract::class, $viewFactory);
$container->instance('view', $viewFactory);
$container->instance(BladeCompiler::class, $compiler);
$compiler->anonymousComponentPath(dirname(__DIR__, 2) . '/design/blade/components');

echo $compiler::render(buildTemplate($componentName, $props), ['props' => $props]);
