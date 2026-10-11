/** Native CRM158 owners. Activity type `note` is not a seventh export owner. */
export const CRM_ENTITY_EXPORT_TYPES = Object.freeze([
  "organization",
  "person",
  "lead",
  "opportunity",
  "activity",
  "service_ticket",
] as const);
export type CrmEntityExportType = (typeof CRM_ENTITY_EXPORT_TYPES)[number];

/** Possible native scalar columns; this catalog grants no record or field access. */
export const CRM_ENTITY_EXPORT_COLUMNS = Object.freeze({
  organization: Object.freeze([
    "id",
    "kind",
    "name",
    "job_title",
    "contact_id",
    "version",
    "status",
    "updated_at",
  ] as const),
  person: Object.freeze([
    "id",
    "kind",
    "name",
    "job_title",
    "contact_id",
    "version",
    "status",
    "updated_at",
  ] as const),
  lead: Object.freeze([
    "id",
    "uuid",
    "version",
    "status",
    "stage",
    "name",
    "email",
    "phone",
    "mobile",
    "company_name",
    "owner_id",
    "team_id",
    "contact_id",
    "person_id",
    "source",
    "source_term_id",
    "score",
    "rules_version",
    "created_at",
    "updated_at",
    "erased_at",
    "estimated_value_amount",
    "estimated_value_currency",
    "country_code",
    "province",
    "city",
    "postal_code",
  ] as const),
  opportunity: Object.freeze([
    "uuid",
    "version",
    "status",
    "title",
    "lead_uuid",
    "contact_uuid",
    "pipeline_uuid",
    "stage_uuid",
    "owner_uuid",
    "team_uuid",
    "amount",
    "currency",
    "probability",
    "weighted_value",
    "expected_close",
    "next_step",
    "closed_at",
  ] as const),
  activity: Object.freeze([
    "id",
    "version",
    "type",
    "status",
    "due_at",
    "timezone",
    "completed_at",
  ] as const),
  service_ticket: Object.freeze([
    "uuid",
    "version",
    "title",
    "description",
    "status",
    "priority",
    "type",
    "pipeline_uuid",
    "stage_uuid",
    "counterparty_uuid",
    "person_uuid",
    "assignee_uuid",
    "created_at",
    "updated_at",
    "first_response_at",
    "resolved_at",
    "closed_at",
    "archived_at",
    "cycle",
  ] as const),
});
export type CrmEntityExportColumn<T extends CrmEntityExportType> =
  (typeof CRM_ENTITY_EXPORT_COLUMNS)[T][number];

/** Native Configuration plans are transported, never compiled or granted by the SDK. */
export type CrmEntityExportJson =
  | string
  | number
  | boolean
  | null
  | readonly CrmEntityExportJson[]
  | { readonly [key: string]: CrmEntityExportJson };

export interface CrmContactPeopleExportFilters {
  search?: string;
  status?: "active" | "archived";
  contact_uuid?: string;
  owner_uuid?: string;
  team_uuid?: string;
  country_code?: string;
  locality_key?: string;
  tag?: string;
  sort?: "name" | "-name" | "updated_at" | "-updated_at";
  /** JSON-encoded native Configuration plan, preserved verbatim. */
  typed_filters?: string;
  /** Exact UTC YYYY-MM-DDTHH:mm:ssZ; inclusive lower/upper bounds. */
  updated_from?: string;
  updated_to?: string;
}
export type CrmOrganizationExportFilters = CrmContactPeopleExportFilters & {
  kind?: "organization";
};
export type CrmPersonExportFilters = CrmContactPeopleExportFilters & {
  kind?: "person";
};

export type CrmLeadExportStatus =
  | "open"
  | "disqualified"
  | "converted"
  | "deleted";
export type CrmLeadExportStage = "inbox" | "contacted" | "qualified";
export interface CrmLeadExportFilters {
  /** Omission excludes deleted; supplied lists must contain 1..100 native values. */
  status?: CrmLeadExportStatus | readonly CrmLeadExportStatus[];
  stage?: CrmLeadExportStage | readonly CrmLeadExportStage[];
  owner_id?: string;
  team_id?: string;
  source_term_id?: string;
  contact_person_id?: string;
  form_id?: string;
  installation_key?: string;
  /** Native UTC YYYY-MM-DDTHH:mm:ss[.1..6digits]Z; both bounds inclusive. */
  created_from?: string;
  created_to?: string;
  score_min?: number;
  score_max?: number;
  has_email?: boolean;
  has_phone?: boolean;
  country_code?: string;
  locality_key?: string;
  typed_filters?: string | { readonly [key: string]: CrmEntityExportJson };
}

export interface CrmOpportunityExportFilters {
  status?: "open" | "won" | "lost";
  pipeline_uuid?: string;
  stage_uuid?: string;
  owner_uuid?: string;
  team_uuid?: string;
  contact_uuid?: string;
  lead_uuid?: string;
  phone?: string;
  source?: string;
  /** Native YYYY-MM-DD calendar dates; both bounds inclusive. */
  created_from?: string;
  created_to?: string;
  expected_close_from?: string;
  expected_close_to?: string;
  /** Current native Configuration definition and operators remain authoritative. */
  typed_filters?: {
    readonly definition_version: number;
    readonly filters: readonly CrmEntityExportJson[];
  };
  sort?:
    | "uuid"
    | "version"
    | "title"
    | "status"
    | "amount"
    | "currency"
    | "probability"
    | "weighted_value"
    | "expected_close"
    | "stage_changed_at"
    | "created_at"
    | "owner_uuid"
    | "team_uuid"
    | "pipeline_uuid"
    | "stage_uuid";
  direction?: "asc" | "desc";
}

interface CrmActivityExportCriteria {
  status?: "pending" | "completed" | "cancelled";
  type?: "task" | "call" | "meeting" | "note";
  owner_uuid?: string;
  overdue?: boolean;
  /** Exact UTC YYYY-MM-DDTHH:mm:ssZ; both bounds inclusive. */
  due_from?: string;
  due_to?: string;
  search?: string;
  order?: "due_at" | "-due_at" | "uuid" | "-uuid";
}
export type CrmActivityExportFilters = CrmActivityExportCriteria &
  (
    | { target_type?: never; target_uuid?: never }
    | {
        target_type: "contact" | "person" | "lead" | "opportunity" | "booking";
        target_uuid: string;
      }
  );

export interface CrmServiceTicketExportFilters {
  status?: "new" | "assigned" | "pending" | "closed" | "rejected" | "duplicate";
  /** Explicit null selects unassigned, omission leaves the native filter unset. */
  assignee_uuid?: string | null;
  /** Explicit null selects no team. */
  team_uuid?: string | null;
  /** RFC3339 offset instants; inclusive from, exclusive until, until > from. */
  period?: { readonly from: string; readonly until: string };
}

export interface CrmEntityExportFiltersByType {
  organization: CrmOrganizationExportFilters;
  person: CrmPersonExportFilters;
  lead: CrmLeadExportFilters;
  opportunity: CrmOpportunityExportFilters;
  activity: CrmActivityExportFilters;
  service_ticket: CrmServiceTicketExportFilters;
}

/** Full native selection. There are no page, cursor, limit or synthetic saved-view fields. */
export type CrmEntityExportSelection<
  T extends CrmEntityExportType = CrmEntityExportType
> = {
  [K in T]: {
    readonly entity_type: K;
    readonly filters: Readonly<CrmEntityExportFiltersByType[K]>;
    readonly columns: readonly CrmEntityExportColumn<K>[];
  };
}[T];

/** Closed native wire request; confirmation never supplies authority. */
export type CrmEntityExportRequest<
  T extends CrmEntityExportType = CrmEntityExportType
> = CrmEntityExportSelection<T> & {
  readonly id: string;
  readonly confirmed: true;
};

export type CrmEntityExportStatus =
  | "processing"
  | "ready"
  | "failed"
  | "expired";
export type CrmEntityExportJob<
  T extends CrmEntityExportType = CrmEntityExportType
> = {
  readonly id: string;
  readonly entity_type: T;
} & (
  | {
      readonly status: "processing" | "failed" | "expired";
      readonly filename?: never;
      readonly size_bytes?: never;
    }
  | {
      readonly status: "ready";
      readonly filename: string;
      readonly size_bytes: number;
    }
);
export interface CrmEntityExportEnvelope<
  T extends CrmEntityExportType = CrmEntityExportType
> {
  readonly data: CrmEntityExportJob<T>;
}

/** Stable lowercase UUIDv7 and printable ASCII transport key retained before dispatch. */
export interface CrmEntityExportIdentity {
  readonly id: string;
  readonly idempotencyKey: string;
}
