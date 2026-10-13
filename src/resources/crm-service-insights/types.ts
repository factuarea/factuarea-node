/** Native V1 readonly ServiceInsights. Current operation/field/privacy authority stays server-owned. */
export type CrmServiceInsightMetric = "frt" | "nrt" | "mttr" | "backlog" | "sla_compliance";
export type CrmServiceInsightTicketStatus = "new" | "assigned" | "pending" | "closed" | "rejected" | "duplicate";
export interface CrmServiceInsightCohort { start: string; end: string }
export interface CrmServiceInsightSelection extends CrmServiceInsightCohort {
  clock_mode: "natural" | "business";
  /** Canonical native User UUID; no actor/context grant from this filter. */
  agent_id?: string;
  team_id?: string;
  status?: CrmServiceInsightTicketStatus;
}
export interface CrmServiceInsightDrillParameters extends CrmServiceInsightSelection {
  metric: CrmServiceInsightMetric;
  /** Exact original native snapshot/predicate; never a cursor or client authority proof. */
  as_of: string;
  predicate_hash: string;
  page?: number;
  per_page?: number;
}
export interface CrmServiceInsightEnvelope<T> { data: T }
export interface CrmServiceCsatMetric {
  metric: "csat";
  metric_version: 1;
  cohort_start: string;
  cohort_end: string;
  cohort_basis: "original_closed_at";
  cycle_policy: "each_closure_participant";
  clock_mode: "not_applicable";
  invited: number;
  answered: number | null;
  /** Exact native four-place decimals, never Number/Float. */
  mean: string | null;
  median: string | null;
  masked_fields: Array<"answered_at" | "rating">;
  authorization_version: string;
  predicate_hash: string;
}
export interface CrmServiceInsightMetricValues {
  eligible_count: number;
  sample_count: number | null;
  contributor_count: number | null;
  /** Exact native six-place duration decimals; no monetary/Float conversion. */
  mean_microseconds: string | null;
  median_microseconds: string | null;
  value_count: number | null;
  compliant_count: number | null;
  missing_count: number | null;
  masked: boolean;
}
export interface CrmServiceInsightMetrics {
  selection: CrmServiceInsightCohort & {
    clock_mode: "natural" | "business";
    agent_id: string | null;
    team_id: string | null;
    status: CrmServiceInsightTicketStatus | null;
  };
  cohort_basis: "ticket_created_at";
  cycle_basis: "current_cycle";
  as_of: string;
  authorization_version: string;
  predicate_hash: string;
  cohort_count: number;
  metrics: Record<CrmServiceInsightMetric, CrmServiceInsightMetricValues>;
}
export interface CrmServiceInsightTicket {
  id: string;
  version: number;
  cycle: number;
  label: string | null;
  status: CrmServiceInsightTicketStatus | null;
  sample_count: number;
}
export interface CrmServiceInsightDrill {
  metric: CrmServiceInsightMetric;
  as_of: string;
  authorization_version: string;
  predicate_hash: string;
  total: number;
  page: number;
  per_page: number;
  items: CrmServiceInsightTicket[];
}
/** Actual V1 composition must supply all paths; SPA routes/realms are never a fallback. */
export interface CrmServiceInsightsV1Paths {
  readonly getServiceInsights: string;
  readonly getServiceMetrics: string;
  readonly getServiceInsightDrillThrough: string;
}
