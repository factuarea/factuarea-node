import {
  CRM_ENTITY_EXPORT_COLUMNS,
  CRM_ENTITY_EXPORT_TYPES,
  type CrmEntityExportIdentity,
  type CrmEntityExportRequest,
  type CrmEntityExportSelection,
  type CrmEntityExportType,
} from "./types.js";

const FILTER_KEYS = {
  organization: [
    "search",
    "kind",
    "status",
    "contact_uuid",
    "owner_uuid",
    "team_uuid",
    "country_code",
    "locality_key",
    "tag",
    "sort",
    "typed_filters",
    "updated_from",
    "updated_to",
  ],
  person: [
    "search",
    "kind",
    "status",
    "contact_uuid",
    "owner_uuid",
    "team_uuid",
    "country_code",
    "locality_key",
    "tag",
    "sort",
    "typed_filters",
    "updated_from",
    "updated_to",
  ],
  lead: [
    "status",
    "stage",
    "owner_id",
    "team_id",
    "source_term_id",
    "contact_person_id",
    "form_id",
    "installation_key",
    "created_from",
    "created_to",
    "score_min",
    "score_max",
    "has_email",
    "has_phone",
    "country_code",
    "locality_key",
    "typed_filters",
  ],
  opportunity: [
    "status",
    "pipeline_uuid",
    "stage_uuid",
    "owner_uuid",
    "team_uuid",
    "contact_uuid",
    "lead_uuid",
    "phone",
    "source",
    "created_from",
    "created_to",
    "expected_close_from",
    "expected_close_to",
    "typed_filters",
    "sort",
    "direction",
  ],
  activity: [
    "status",
    "type",
    "owner_uuid",
    "target_type",
    "target_uuid",
    "overdue",
    "due_from",
    "due_to",
    "search",
    "order",
  ],
  service_ticket: ["status", "assignee_uuid", "team_uuid", "period"],
} as const;

export function requireEntityExportId(id: unknown): asserts id is string {
  if (
    typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      id
    )
  ) {
    throw new TypeError(
      "Factuarea: an original lowercase UUIDv7 export id is required."
    );
  }
}

/** No normalization, Date conversion, lossy integers, custom serializers or silent array nulls. */
function requireJson(value: unknown, ancestors = new Set<object>()): void {
  if (value === null || ["string", "boolean"].includes(typeof value)) return;
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    (!Number.isInteger(value) || Number.isSafeInteger(value))
  )
    return;
  if (typeof value !== "object" || value === null || ancestors.has(value)) {
    throw new TypeError(
      "Factuarea: export selection must contain finite, exact JSON values."
    );
  }
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    throw new TypeError(
      "Factuarea: export selection must contain plain JSON objects."
    );
  }
  if (
    Object.getOwnPropertySymbols(value).length ||
    Object.values(Object.getOwnPropertyDescriptors(value)).some(
      (descriptor) =>
        descriptor.get !== undefined || descriptor.set !== undefined
    )
  ) {
    throw new TypeError(
      "Factuarea: export selection must contain stable JSON data properties."
    );
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) requireJson(value[i], ancestors);
  } else {
    for (const item of Object.values(value))
      if (item !== undefined) requireJson(item, ancestors);
  }
  ancestors.delete(value);
}

function deepFreeze(value: unknown): void {
  if (typeof value !== "object" || value === null) return;
  for (const item of Object.values(value)) deepFreeze(item);
  Object.freeze(value);
}

/** Immutable in-memory intent. `rawRequest` contains the selection: do not log or store it. */
export class CrmEntityExportIntent<
  T extends CrmEntityExportType = CrmEntityExportType
> {
  readonly #request: CrmEntityExportRequest<T>;
  readonly #rawRequest: string;
  readonly #idempotencyKey: string;

  private constructor(
    request: CrmEntityExportRequest<T>,
    rawRequest: string,
    key: string
  ) {
    this.#request = request;
    this.#rawRequest = rawRequest;
    this.#idempotencyKey = key;
    Object.freeze(this);
  }

  /** Preparation is local; dispatch still requires explicit humanConfirmed: true. */
  static prepare<T extends CrmEntityExportType>(
    selection: CrmEntityExportSelection<T> & { readonly entity_type: T },
    identity: CrmEntityExportIdentity
  ): CrmEntityExportIntent<T> {
    requireEntityExportId(identity?.id);
    if (
      typeof identity.idempotencyKey !== "string" ||
      !/^[ -~]{1,255}$/.test(identity.idempotencyKey)
    ) {
      throw new TypeError(
        "Factuarea: export intent requires the original printable ASCII Idempotency-Key (1–255 characters)."
      );
    }
    if (
      !selection ||
      typeof selection !== "object" ||
      Array.isArray(selection) ||
      Object.keys(selection).some(
        (key) => !["entity_type", "filters", "columns"].includes(key)
      ) ||
      !CRM_ENTITY_EXPORT_TYPES.includes(selection.entity_type)
    ) {
      throw new TypeError(
        "Factuarea: a closed native six-owner export selection is required."
      );
    }
    if (
      !selection.filters ||
      typeof selection.filters !== "object" ||
      Array.isArray(selection.filters) ||
      Object.keys(selection.filters).some(
        (key) =>
          !(FILTER_KEYS[selection.entity_type] as readonly string[]).includes(
            key
          )
      )
    ) {
      throw new TypeError(
        "Factuarea: export filters must use the selected owner's native keys."
      );
    }
    const allowedColumns: readonly string[] =
      CRM_ENTITY_EXPORT_COLUMNS[selection.entity_type];
    if (
      !Array.isArray(selection.columns) ||
      selection.columns.length < 1 ||
      selection.columns.length > 128 ||
      new Set(selection.columns).size !== selection.columns.length ||
      selection.columns.some((column) => !allowedColumns.includes(column))
    ) {
      throw new TypeError(
        "Factuarea: export columns must be ordered, unique native scalar keys."
      );
    }
    requireJson(selection);
    const rawRequest = JSON.stringify({
      id: identity.id,
      entity_type: selection.entity_type,
      filters: selection.filters,
      columns: selection.columns,
      confirmed: true,
    });
    const request = JSON.parse(rawRequest) as CrmEntityExportRequest<T>;
    deepFreeze(request);
    return new CrmEntityExportIntent(
      request,
      rawRequest,
      identity.idempotencyKey
    );
  }

  get id(): string {
    return this.#request.id;
  }
  get entityType(): T {
    return this.#request.entity_type;
  }
  get request(): CrmEntityExportRequest<T> {
    return this.#request;
  }
  get rawRequest(): string {
    return this.#rawRequest;
  }
  get idempotencyKey(): string {
    return this.#idempotencyKey;
  }

  /** Accidental logging/JSON serialization exposes only the opaque job id. */
  toJSON(): { id: string } {
    return { id: this.id };
  }
}
