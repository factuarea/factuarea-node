<?php

declare(strict_types=1);

/** Source-only contract extraction; no application boot, database, configuration or release changes. */
$backend = $argv[1] ?? '/var/www/html';
require $backend.'/vendor/autoload.php';

use App\BusinessContact\Infrastructure\Crm\CrmCapabilityManifest as PeopleManifest;
use App\BusinessContact\Infrastructure\Documentation\ContactPeopleOpenApiRequestSchemas;
use App\BusinessContact\Infrastructure\Documentation\ContactPeopleOpenApiSchemas;
use App\Lead\Infrastructure\Crm\CrmCapabilityManifest as LeadManifest;
use App\Lead\Infrastructure\Documentation\LeadOpenApiSchemas;
use App\Pipeline\Infrastructure\Crm\CrmCapabilityManifest as PipelineManifest;
use App\Pipeline\Infrastructure\Documentation\PipelineOpenApiSchemas;
use App\Pipeline\Infrastructure\Documentation\StageHealthConfigurationOpenApiSchemas;
use App\Shared\Domain\Crm\CrmCatalogSnapshot;
use Dedoc\Scramble\Support\Generator\InfoObject;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\Generator\Path;
use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Facade;

$container = new Container;
Container::setInstance($container);
$router = new Router(new Dispatcher($container), $container);
$container->instance('router', $router);
Facade::setFacadeApplication($container);
$router->group(['prefix' => 'v1'], function () use ($backend): void {
    foreach (['BusinessContact', 'Lead', 'Pipeline'] as $owner) {
        require $backend.'/app/'.$owner.'/Infrastructure/Http/Routes/v1-public.php';
    }
});
$router->getRoutes()->refreshNameLookups();
$definitions = [...(new PeopleManifest)->definitions(), ...(new LeadManifest)->definitions(), ...(new PipelineManifest)->definitions()];
$catalog = new CrmCatalogSnapshot($definitions, CrmCatalogSnapshot::hashFor($definitions));
$api = new OpenApi('3.1.0');
$api->setInfo(new InfoObject('Factuarea CRM native Source contract', '2026-10-09'));
$metadata = [];
foreach ($catalog->operations as $definition) {
    foreach ($definition->surfaces as $surface) {
        if ($surface->channel !== 'v1' || $surface->exclusionReason !== null) {
            continue;
        }
        $route = $router->getRoutes()->getByName($surface->routeName);
        if ($route === null) {
            throw new RuntimeException('Missing native route: '.$surface->routeName);
        }
        $uri = substr($route->uri(), 3);
        foreach ($route->methods() as $method) {
            if (in_array($method, ['HEAD', 'OPTIONS'], true)) {
                continue;
            }
            $api->addPath((new Path($uri))->addOperation(new Operation(strtolower($method))));
            $metadata['/'.$uri][strtolower($method)] = [
                'key' => $definition->key,
                'action' => $definition->action,
                'scope' => $definition->fineScope,
                'oauthScope' => $definition->oauthScope,
                'confirmation' => $definition->requiresConfirmation,
                'effect' => str_ends_with($definition->handlerClass, 'CommandHandler'),
            ];
        }
    }
}
(new ContactPeopleOpenApiSchemas($router, new ContactPeopleOpenApiRequestSchemas))->apply($api);
(new LeadOpenApiSchemas($router))->apply($api);
(new PipelineOpenApiSchemas($router, $catalog))->apply($api);
(new StageHealthConfigurationOpenApiSchemas($catalog, $router))->apply($api);
$document = $api->toArray();
foreach ($document['paths'] as $path => &$methods) {
    foreach ($methods as $method => &$operation) {
        $entry = $metadata[$path][$method];
        $operation['x-crm-operation'] = $entry['key'];
        $operation['x-required-scope'] = $entry['scope'];
        $operation['x-required-oauth-scope'] = $entry['oauthScope'];
        $operation['x-crm-requires-confirmation'] = $entry['confirmation'];
        $operation['x-crm-effect'] = $entry['effect'];
    }
}
unset($operation, $methods);
$sources = [];
foreach (get_included_files() as $file) {
    if (str_starts_with($file, $backend.'/app/')) {
        $sources[substr($file, strlen($backend) + 1)] = hash_file('sha256', $file);
    }
}
foreach (['BusinessContact', 'Lead', 'Pipeline'] as $owner) {
    foreach (['Infrastructure/Http/Routes/v1-public.php', 'Infrastructure/Crm/CrmCapabilityManifest.php'] as $relative) {
        $file = 'app/'.$owner.'/'.$relative;
        $sources[$file] = hash_file('sha256', $backend.'/'.$file);
    }
}
$pageReader = 'app/BusinessContact/Infrastructure/Persistence/Eloquent/EloquentContactPeopleReadRepository.php';
$sources[$pageReader] = hash_file('sha256', $backend.'/'.$pageReader);
ksort($sources);
$document['x-source-evidence'] = ['status' => 'Source; no activation or native runtime acceptance claimed', 'catalog_sha256' => $catalog->contentHash, 'files' => $sources];
echo json_encode($document, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), PHP_EOL;
