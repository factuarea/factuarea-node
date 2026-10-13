import type { ApiResponse, HttpClient } from "../../core/http-client.js";
import { ConnectionError } from "../../core/errors.js";
import { CrmNumberPage } from "../../crm/pagination.js";
import type { CrmRequestConfig } from "../../crm/resource.js";
import { decodeCrmServiceCsatMetric, decodeCrmServiceInsightDrill, decodeCrmServiceInsightMetrics, serviceInsightsCohortQuery, serviceInsightsDrillQuery, serviceInsightsPath, serviceInsightsSelectionQuery, validateCrmServiceInsightsPaths } from "./codec.js";
import type * as T from "./types.js";

export type CrmServiceInsightsNativeTransport = Pick<HttpClient, "request">;
export type CrmServiceInsightsConfig = Omit<CrmRequestConfig, "idempotencyKey">;
export class CrmServiceInsightsDrillPage extends CrmNumberPage<T.CrmServiceInsightTicket> {
  readonly payload: T.CrmServiceInsightDrill;
  private readonly original: T.CrmServiceInsightDrill;
  private contributors: Set<string>;
  private readonly nextNative: (page: number) => Promise<CrmServiceInsightsDrillPage>;

  constructor(payload: T.CrmServiceInsightDrill, requestId: string | null, next: (page: number) => Promise<CrmServiceInsightsDrillPage>) {
    const items = payload.items.map((item) => ({ ...item }));
    super(items, { total: payload.total, current_page: payload.page, per_page: payload.per_page }, requestId, next);
    this.payload = { ...payload, items };
    this.original = { ...payload, items: payload.items.map((item) => ({ ...item })) };
    this.contributors = new Set(this.original.items.map((item) => item.id));
    this.nextNative = next;
  }

  override async getNextPage(): Promise<CrmServiceInsightsDrillPage | null> {
    const original = this.original;
    if (original.page * original.per_page >= original.total) return null;
    const next = await this.nextNative(original.page + 1);
    const current = next.original;
    if (current.metric !== original.metric || current.as_of !== original.as_of || current.predicate_hash !== original.predicate_hash
      || current.total !== original.total || current.per_page !== original.per_page || current.page !== original.page + 1
      || current.items.some((item) => this.contributors.has(item.id))) {
      throw unreadable({ data: { data: current }, requestId: next.requestId }, new TypeError("Factuarea: incompatible original ServiceInsights contributor sequence."));
    }
    next.contributors = new Set([...this.contributors, ...current.items.map((item) => item.id)]);
    return next;
  }

  override async *[Symbol.asyncIterator](): AsyncIterator<T.CrmServiceInsightTicket> {
    let page: CrmServiceInsightsDrillPage | null = this;
    while (page !== null) {
      // Public presentation objects may be edited by a caller; they never replace the native traversal facts.
      for (const item of page.original.items) yield { ...item };
      page = await page.getNextPage();
    }
  }
}
function headers(config?: CrmServiceInsightsConfig): Record<string, string> | undefined {
  const result = Object.fromEntries(Object.entries(config?.headers ?? {}).filter(([name]) => !["idempotency-key", "content-type"].includes(name.toLowerCase())));
  return Object.keys(result).length === 0 ? undefined : result;
}
function unreadable(response: Pick<ApiResponse<unknown>, "data" | "requestId">, cause: unknown): ConnectionError {
  return new ConnectionError({ message: "Factuarea: the native ServiceInsights projection could not be read.", code: "crm_service_insights_projection_unreadable", requestId: response.requestId, rawResponse: response.data, cause });
}
/** Three readonly native Queries. No survey mutation, export/job, cursor or staff-auth fallback. */
export class CrmServiceInsightsResource {
  private readonly paths: T.CrmServiceInsightsV1Paths;

  constructor(private readonly client: CrmServiceInsightsNativeTransport, paths: T.CrmServiceInsightsV1Paths) {
    if (typeof client?.request !== "function") throw new TypeError("Factuarea: the configured native ServiceInsights HTTP client is required.");
    validateCrmServiceInsightsPaths(paths);
    this.paths = { ...paths };
  }
  async getServiceInsights(parameters: T.CrmServiceInsightCohort, config?: CrmServiceInsightsConfig): Promise<T.CrmServiceInsightEnvelope<T.CrmServiceCsatMetric>> {
    const query = serviceInsightsCohortQuery(parameters);
    const response = await this.get(serviceInsightsPath(this.paths.getServiceInsights), query, config);
    return this.project(response, () => {
      const result = decodeCrmServiceCsatMetric(response.data);
      if (result.data.cohort_start !== query.start || result.data.cohort_end !== query.end) throw new TypeError("Factuarea: incompatible original ServiceInsights cohort.");
      return result;
    });
  }
  async getServiceMetrics(parameters: T.CrmServiceInsightSelection, config?: CrmServiceInsightsConfig): Promise<T.CrmServiceInsightEnvelope<T.CrmServiceInsightMetrics>> {
    const query = serviceInsightsSelectionQuery(parameters);
    const response = await this.get(serviceInsightsPath(this.paths.getServiceMetrics), query, config);
    return this.project(response, () => {
      const result = decodeCrmServiceInsightMetrics(response.data); const selected = result.data.selection;
      if (selected.start !== query.start || selected.end !== query.end || selected.clock_mode !== query.clock_mode
        || selected.agent_id !== (query.agent_id ?? null) || selected.team_id !== (query.team_id ?? null) || selected.status !== (query.status ?? null)) throw new TypeError("Factuarea: incompatible ServiceInsights selection.");
      return result;
    });
  }
  async getServiceInsightDrillThrough(parameters: T.CrmServiceInsightDrillParameters, config?: CrmServiceInsightsConfig): Promise<CrmServiceInsightsDrillPage> {
    const query = serviceInsightsDrillQuery(parameters);
    const originalConfig = config === undefined ? undefined : { ...config, headers: config.headers === undefined ? undefined : { ...config.headers } };
    const response = await this.get(serviceInsightsPath(this.paths.getServiceInsightDrillThrough), query, originalConfig);
    const result = this.project(response, () => {
      const result = decodeCrmServiceInsightDrill(response.data); const data = result.data;
      // Explicit native request defaults are verified from the producer, while omission stays omitted on the wire.
      if (data.metric !== query.metric || data.as_of !== query.as_of || data.predicate_hash !== query.predicate_hash
        || data.page !== (query.page ?? 1) || data.per_page !== (query.per_page ?? 25)) throw new TypeError("Factuarea: incompatible original ServiceInsights drill predicate or page.");
      return result;
    });
    const perPage = result.data.per_page;
    return new CrmServiceInsightsDrillPage(result.data, response.requestId, (page) => this.getServiceInsightDrillThrough({ ...query, page, per_page: perPage } as unknown as T.CrmServiceInsightDrillParameters, originalConfig));
  }
  private async get(path: string, query: Record<string, unknown>, config?: CrmServiceInsightsConfig): Promise<ApiResponse<unknown>> {
    const response = await this.client.request<unknown>({ ...config, method: "GET", path, query, body: undefined, rawJsonBody: undefined, formData: undefined,
      idempotencyKey: undefined, autoIdempotency: false, headers: headers(config) });
    config?.onResponse?.(response); return response;
  }
  private project<V>(response: ApiResponse<unknown>, decode: () => V): V {
    try { if (response.status !== 200) throw new TypeError("Factuarea: incompatible ServiceInsights response status."); return decode(); }
    catch (cause) { throw unreadable(response, cause); }
  }
}
export function createCrmServiceInsightsResource(client: CrmServiceInsightsNativeTransport, paths: T.CrmServiceInsightsV1Paths): CrmServiceInsightsResource { return new CrmServiceInsightsResource(client, paths); }
export { decodeCrmServiceCsatMetric, decodeCrmServiceInsightMetrics, decodeCrmServiceInsightDrill } from "./codec.js";
export type * from "./types.js";
