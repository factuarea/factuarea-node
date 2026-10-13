# ServiceInsights native SDK reads — batch74

The existing `client.crmServiceInsights(paths)` factory uses the configured SDK HTTP client and credential for the three current native GET routes. Bind the paths relative to the client's V1 base URL:

```ts
const insights = client.crmServiceInsights({
  getServiceInsights: "/crm/service-insights",
  getServiceMetrics: "/crm/service-insights/service-metrics",
  getServiceInsightDrillThrough: "/crm/service-insights/drill",
});
const selection = {
  start: "2026-10-01T00:00:00.000001Z",
  end: "2026-10-02T00:00:00.000001Z",
  clock_mode: "business" as const,
};
const { data: dataset } = await insights.getServiceMetrics(selection);
const detail = await insights.getServiceInsightDrillThrough({
  ...selection,
  metric: "frt",
  as_of: dataset.as_of,
  predicate_hash: dataset.predicate_hash,
  per_page: 25,
});
for await (const ticket of detail) consumeAuthorizedProjection(ticket);
```

The native route names are `public-api.v1.crm-service-insights.metrics`, `public-api.v1.crm-service-insights.service-metrics`, and `public-api.v1.crm-service-insights.drill`, with operation IDs `getCrmServiceInsights`, `getCrmServiceMetrics`, and `getCrmServiceInsightDrillThrough`. Each route requires `service_insights:read` and `customer_service:read`, the feature gate and current native operation authorization. The SDK path bindings describe Source; they do not activate a capability or grant access.

CSAT takes only `start` and `end`. Service metrics require `clock_mode`; optional `agent_id`, `team_id` and `status` stay omitted when absent and reject explicit nulls. Instants retain all six UTC fractional digits and the original cohort is `[start, end)`, at most 366 days. Agent IDs use the native User UUID contract; team IDs use UUIDv7. Native masked values remain null. CSAT scores retain four-place decimal strings and service durations retain six-place decimal strings.

Drill iteration uses the original selection, metric, `as_of`, `predicate_hash`, page size and request headers. Each page is a fresh native read, so its `authorization_version` and masks remain current. The SDK validates the owner's exact `array_slice` cardinality, rejects changing contributor totals and ticket IDs repeated across pages, and stops on native errors. Editing public presentation objects cannot change the traversal facts. Cancellation retains the original `AbortSignal`. Each independent traversal has its own in-memory set of returned identities.

Original coverage: `crm-csat-service-insights` task 6.3 requires closing “docs de dominio, registro cross-BC, OpenAPI y docs/SDK/CLI/plugin aplicables o razón exacta de exclusión; coordinar versiones antes de ofrecer la capability.” This batch closes the SDK read boundary for the three current V1 Queries and the relevant read portion of CRM-217/CRM-218: exact cohort/clock/decimal representation, filters, original drill predicate, current masks, count-to-ID agreement, pagination, and current denials. Native survey delivery, public response tokens, export jobs, erasure policy, activation and complete change acceptance remain with their native owners. Package version and transport defaults are unchanged.

Offline selectors: `test/crm-service-insights-boundary.test.ts` and `test/crm-service-insights-native-batch74.test.ts`. The tests use synthetic credentials and injected fetch responses; they perform no live API or business effects.

Validation executed on 2026-10-10: `./node_modules/.bin/vitest run test/crm-service-insights-boundary.test.ts test/crm-service-insights-native-batch74.test.ts --maxWorkers=1 --minWorkers=1` passed both files, 37 tests. Scoped TypeScript also passed with a temporary configuration extending the repository `tsconfig.json`, including this resource, the existing client/public index and those two selectors, and explicitly resolving `node_modules/@types`. No build, release or live API verification was performed.
