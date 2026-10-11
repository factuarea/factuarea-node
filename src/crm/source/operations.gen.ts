// AUTO-GENERATED from private native Source 438b12b53be7ae7535cd6c85ba7dea06c76d84a33024db0e0232ac8ba279be63; metadata grants no access.
export const CRM_SOURCE_OPERATIONS = [
  {
    operationId: "crmCreateCrmActivity",
    operation: "crm_activities.create",
    method: "POST",
    path: "/crm/crmactivity",
    sdk: "crm.source.activities.create",
    scope: "crm_activities:write",
    oauthScope: "crm_activities.write",
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Client-generated opaque key (up to 255 characters; UUID v7 recommended) that makes retries safe: the first response is cached and replayed for repeats without re-executing the mutation. Reusing a key with a different body returns `409 idempotency_key_reused`. See the [Idempotency guide](/guides/idempotency).",
        required: false,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          example: "01928f10-7c0e-7c4a-9b7d-2f8a6e3c1d4b",
        },
      },
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
    ],
    successStatuses: [201],
    exactIntegerPaths: ["data.activity.version"],
    requestIntegerPaths: [],
    original: false,
    binary: false,
  },
  {
    operationId: "crmCreateOpportunity",
    operation: "crm_opportunities.create",
    method: "POST",
    path: "/crm/opportunity",
    sdk: "crm.source.opportunities.create",
    scope: "crm_opportunities:write",
    oauthScope: "crm_opportunities.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Clave ASCII imprimible de la intención original. El replay no repite efectos ni sustituye el snapshot original por el estado último. Una petición distinta con la misma clave devuelve 409.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[ -~]+$",
        },
      },
    ],
    successStatuses: [201],
    exactIntegerPaths: [
      "data.version",
      "data.playbook_answers[].definition_version",
      "data.history[].version",
    ],
    requestIntegerPaths: [],
    original: false,
    binary: false,
  },
  {
    operationId: "crmDownloadCommercialDocument",
    operation: "crm_documents.download",
    method: "GET",
    path: "/crm/documents/{document}/download",
    sdk: "crm.source.documents.download",
    scope: "crm_documents:read",
    oauthScope: "crm_documents.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "document",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "document_version",
        in: "query",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 9223372036854776000,
        },
      },
      {
        name: "linked_entity_type",
        in: "query",
        schema: {
          type: "string",
          enum: ["person", "lead", "opportunity", "quote", "invoice"],
        },
      },
      {
        name: "linked_entity_id",
        in: "query",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [],
    original: false,
    binary: true,
  },
  {
    operationId: "crmGetCrmActivityCreateOriginal",
    operation: "crm_activities.create",
    method: "GET",
    path: "/crm/crmactivity/create/original",
    sdk: "crm.source.activities.getCreateOriginal",
    scope: "crm_activities:write",
    oauthScope: "crm_activities.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        description:
          "Exact retained original write key; 1–255 printable ASCII characters. Preserve every byte, including spaces. No new write or effect is requested.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[ -~]+$(?![\\s\\S])",
        },
      },
      {
        name: "original_body_sha256",
        in: "query",
        required: true,
        description:
          "SHA-256 of the exact original write body bytes; lowercase 64 hexadecimal characters. This is the sole accepted query key. This GET accepts no body.",
        schema: {
          type: "string",
          minLength: 64,
          maxLength: 64,
          pattern: "^[0-9a-f]{64}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.original_response.status"],
    original: true,
    binary: false,
  },
  {
    operationId: "public-api.v1.crm-spreadsheet-imports.apply-original",
    operation: "crm_imports.apply",
    method: "GET",
    path: "/crm/imports/{run}/apply/original",
    sdk: "crm.source.imports.getApplyOriginal",
    scope: "crm_imports:write",
    oauthScope: null,
    parameters: [
      {
        name: "run",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
      },
      {
        name: "original_body_sha256",
        in: "query",
        required: true,
        schema: {
          type: "string",
          pattern: "^[0-9a-f]{64}$",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.original_response.status"],
    original: true,
    binary: false,
  },
  {
    operationId: "getBookingSequenceStopDecision",
    operation: "booking.sequence_stop_decision",
    method: "GET",
    path: "/crm/booking/bookings/{booking}/sequence-stop-decision",
    sdk: "crm.source.booking.getSequenceStopDecision",
    scope: "booking:read",
    oauthScope: "booking.read",
    parameters: [
      {
        name: "booking",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "sequence_id",
        in: "query",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "expected_booking_version",
        in: "query",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 9223372036854776000,
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.booking_version",
      "data.sequence_version",
      "data.rule_version",
      "data.subject_version",
      "data.booking_subject_version",
      "data.policy_version",
      "data.enrolments[].version",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "getBookingService",
    operation: "booking.get_service",
    method: "GET",
    path: "/crm/booking/services/{service}",
    sdk: "crm.source.booking.getService",
    scope: "booking:read",
    oauthScope: "booking.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "service",
        in: "path",
        required: true,
        description:
          "UUID canónico del servicio actual. Para recuperar una actualización conserva el target original.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.version",
      "data.publication_version",
      "data.schedule.windows[].start_minute",
      "data.schedule.windows[].end_minute",
      "data.schedule.windows[].weekday",
      "data.schedule.exceptions[].windows[].start_minute",
      "data.schedule.exceptions[].windows[].end_minute",
      "data.schedule.duration_minutes",
      "data.schedule.buffer_before",
      "data.schedule.buffer_after",
      "data.schedule.capacity",
      "data.schedule.minimum_notice_minutes",
      "data.schedule.booking_horizon_days",
      "data.schedule.slot_step_minutes",
      "data.hold_minutes",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "crmGetCommercialDocument",
    operation: "crm_documents.get",
    method: "GET",
    path: "/crm/documents/{document}",
    sdk: "crm.source.documents.getCurrent",
    scope: "crm_documents:read",
    oauthScope: "crm_documents.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "document",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.version",
      "data.versions[].number",
      "data.versions[].size_bytes",
      "data.links[].document_version",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "crmGetCrmActivity",
    operation: "crm_activities.show",
    method: "GET",
    path: "/crm/crmactivity/{activity}",
    sdk: "crm.source.activities.getCurrent",
    scope: "crm_activities:read",
    oauthScope: "crm_activities.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "activity",
        in: "path",
        required: true,
        description:
          "UUIDv7 público. La identidad no concede acceso al registro ni a sus referencias.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.activity.version",
      "data.comments[].version",
      "data.attachments[].version",
      "data.attachments[].size",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "crmUpdateCrmActivity",
    operation: "crm_activities.update",
    method: "PATCH",
    path: "/crm/crmactivity/{activity}",
    sdk: "crm.source.activities.update",
    scope: "crm_activities:write",
    oauthScope: "crm_activities.write",
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Client-generated opaque key (up to 255 characters; UUID v7 recommended) that makes retries safe: the first response is cached and replayed for repeats without re-executing the mutation. Reusing a key with a different body returns `409 idempotency_key_reused`. See the [Idempotency guide](/guides/idempotency).",
        required: false,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          example: "01928f10-7c0e-7c4a-9b7d-2f8a6e3c1d4b",
        },
      },
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "activity",
        in: "path",
        required: true,
        description:
          "UUIDv7 público. La identidad no concede acceso al registro ni a sus referencias.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.activity.version"],
    requestIntegerPaths: ["expected_version"],
    original: false,
    binary: false,
  },
  {
    operationId: "v1.crm.sequences.original_enrol",
    operation: "automation.crm_sequence_enrol_original",
    method: "GET",
    path: "/crm/crmsequence/enrolments/original",
    sdk: "crm.source.sequences.getEnrolOriginal",
    scope: "automation:write",
    oauthScope: "automation.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        description:
          "Preserve the original opaque header and exact intent. GET recovery reads the durable original without redispatch.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 512,
          pattern: "^[^\\u0000-\\u0020\\u007f]+$",
          "x-max-bytes": 512,
          description:
            "Same opaque header, nonempty and at most 512 bytes. No spaces/control bytes, trimming, reencoding or new key on recovery. This is not an entity or effect ID.",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.version",
      "data.generation",
      "data.definition_version",
      "data.current_step",
    ],
    original: true,
    binary: false,
  },
  {
    operationId: "GetCrmReportDefinitionOriginal",
    operation: "crm_forecast.save_definition",
    method: "GET",
    path: "/crm/report-definitions/{definition}/original",
    sdk: "crm.source.reports.getDefinitionOriginal",
    scope: "crm_forecast:write",
    oauthScope: "crm_forecast.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "definition",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[\\x20-\\x7e]+$",
        },
      },
      {
        name: "expectedVersion",
        in: "query",
        schema: {
          type: ["integer", "null"],
          minimum: 1,
          description:
            "CAS of an existing draft. Missing/null remains a native 409; PUT never creates a definition.",
        },
      },
      {
        name: "dimensionsJson",
        in: "query",
        required: true,
        schema: {
          type: "string",
          minLength: 2,
          maxLength: 262144,
          description:
            "JSON list of current permitted native dimension keys. An empty list is permitted. No SQL, expressions or caller joins.",
        },
      },
      {
        name: "measuresJson",
        in: "query",
        required: true,
        schema: {
          type: "string",
          minLength: 2,
          maxLength: 262144,
          description:
            "Nonempty JSON list of declared native measures with every current readable and aggregatable dependency.",
        },
      },
      {
        name: "filtersJson",
        in: "query",
        required: true,
        schema: {
          type: "string",
          minLength: 2,
          maxLength: 262144,
          description:
            "JSON list of closed objects {field,operator,value}; value is text or null. Current readable/filterable authority and native operators are required.",
        },
      },
      {
        name: "visibility",
        in: "query",
        required: true,
        schema: {
          type: "string",
          enum: ["personal", "team", "company"],
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.version"],
    original: true,
    binary: false,
  },
  {
    operationId: "v1.crm.sequences.original_save",
    operation: "automation.crm_sequence_save_original",
    method: "GET",
    path: "/crm/crmsequence/original",
    sdk: "crm.source.sequences.getSaveOriginal",
    scope: "automation:write",
    oauthScope: "automation.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        description:
          "Preserve the original opaque header and exact intent. GET recovery reads the durable original without redispatch.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 512,
          pattern: "^[^\\u0000-\\u0020\\u007f]+$",
          "x-max-bytes": 512,
          description:
            "Same opaque header, nonempty and at most 512 bytes. No spaces/control bytes, trimming, reencoding or new key on recovery. This is not an entity or effect ID.",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.version"],
    original: true,
    binary: false,
  },
  {
    operationId: "crmGetLeadCreateOriginal",
    operation: "crm_leads.create",
    method: "GET",
    path: "/crm/leads/create/original",
    sdk: "crm.source.leads.getCreateOriginal",
    scope: "crm_leads:write",
    oauthScope: "crm_leads.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        description:
          "Exact retained original write key; 1–255 printable ASCII characters. Preserve every byte, including spaces. No new write or effect is requested.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[ -~]+$(?![\\s\\S])",
        },
      },
      {
        name: "original_body_sha256",
        in: "query",
        required: true,
        description:
          "SHA-256 of the exact original write body bytes; lowercase 64 hexadecimal characters. This is the sole accepted query key. This GET accepts no body.",
        schema: {
          type: "string",
          minLength: 64,
          maxLength: 64,
          pattern: "^[0-9a-f]{64}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.original_response.status"],
    original: true,
    binary: false,
  },
  {
    operationId: "crmGetOpportunityCreateOriginal",
    operation: "crm_opportunities.create",
    method: "GET",
    path: "/crm/opportunity/create/original",
    sdk: "crm.source.opportunities.getCreateOriginal",
    scope: "crm_opportunities:write",
    oauthScope: "crm_opportunities.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        description:
          "Exact retained original write key; 1–255 printable ASCII characters. Preserve every byte, including spaces. No new write or effect is requested.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[ -~]+$(?![\\s\\S])",
        },
      },
      {
        name: "original_body_sha256",
        in: "query",
        required: true,
        description:
          "SHA-256 of the exact original write body bytes; lowercase 64 hexadecimal characters. This is the sole accepted query key. This GET accepts no body.",
        schema: {
          type: "string",
          minLength: 64,
          maxLength: 64,
          pattern: "^[0-9a-f]{64}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.original_response.status"],
    original: true,
    binary: false,
  },
  {
    operationId: "crmGetOpportunityStageOriginal",
    operation: "crm_opportunities.move_stage",
    method: "GET",
    path: "/crm/opportunity/{opportunity}/stage/original",
    sdk: "crm.source.opportunities.getStageOriginal",
    scope: "crm_opportunities:write",
    oauthScope: "crm_opportunities.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        description:
          "Exact retained original write key; 1–255 printable ASCII characters. Preserve every byte, including spaces. No new write or effect is requested.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[ -~]+$(?![\\s\\S])",
        },
      },
      {
        name: "original_body_sha256",
        in: "query",
        required: true,
        description:
          "SHA-256 of the exact original write body bytes; lowercase 64 hexadecimal characters. This is the sole accepted query key. This GET accepts no body.",
        schema: {
          type: "string",
          minLength: 64,
          maxLength: 64,
          pattern: "^[0-9a-f]{64}$",
        },
      },
      {
        name: "opportunity",
        in: "path",
        required: true,
        description:
          "Existing opportunity of the original stage transition, admitted again under current owner record access. Native OpportunityUuid accepts UUIDv7 in either letter case and canonicalizes it.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.original_response.status"],
    original: true,
    binary: false,
  },
  {
    operationId: "crmGetOpportunity",
    operation: "crm_opportunities.show",
    method: "GET",
    path: "/crm/opportunity/{opportunity}",
    sdk: "crm.source.opportunities.getCurrent",
    scope: "crm_opportunities:read",
    oauthScope: "crm_opportunities.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "opportunity",
        in: "path",
        required: true,
        description:
          "UUIDv7 público de Opportunity, validado tras el guard común; no concede acceso.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.version",
      "data.playbook_answers[].definition_version",
      "data.history[].version",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "crmUpdateOpportunity",
    operation: "crm_opportunities.update",
    method: "PATCH",
    path: "/crm/opportunity/{opportunity}",
    sdk: "crm.source.opportunities.update",
    scope: "crm_opportunities:write",
    oauthScope: "crm_opportunities.write",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "opportunity",
        in: "path",
        required: true,
        description:
          "UUIDv7 público de Opportunity, validado tras el guard común; no concede acceso.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        description:
          "Clave ASCII imprimible de la intención original. El replay no repite efectos ni sustituye el snapshot original por el estado último. Una petición distinta con la misma clave devuelve 409.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[ -~]+$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.version",
      "data.playbook_answers[].definition_version",
      "data.history[].version",
    ],
    requestIntegerPaths: [
      "expected_version",
      "changes.playbook_answers[].definition_version",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "crmGetOriginalCaptureFormSave",
    operation: "crm_capture_forms.save_original",
    method: "GET",
    path: "/crm/capture/forms/save-original",
    sdk: "crm.source.capture.getFormSaveOriginal",
    scope: "crm_capture_forms:read",
    oauthScope: "crm_capture_forms.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "X-Crm-Save-Attempt",
        in: "header",
        required: true,
        description:
          "Single opaque owner-issued key; maximum 4096 UTF-8 bytes. No control or whitespace characters. Keep out of logs, storage, query caches and assistant context.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 4096,
          pattern: "^[^\\u0000-\\u0020\\u007f]+$",
        },
      },
      {
        name: "original_body_sha256",
        in: "query",
        required: true,
        schema: {
          type: "string",
          pattern: "^[a-f0-9]{64}$",
          minLength: 64,
          maxLength: 64,
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.original.expected_version",
      "data.original.configuration_version",
      "data.original.authorization_version",
    ],
    original: true,
    binary: false,
  },
  {
    operationId: "crmGetOriginalWebToTicketSubmission",
    operation: "crm_capture_submissions.original",
    method: "GET",
    path: "/crm/capture/forms/{form}/submissions/original",
    sdk: "crm.source.capture.getSubmissionOriginal",
    scope: "crm_capture_submissions:read",
    oauthScope: "crm_capture_submissions.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "form",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        description:
          "Exact key of the original submission by this authenticated caller; no candidate effect or resend.",
        schema: {
          type: "string",
          minLength: 8,
          maxLength: 128,
          pattern: "^[A-Za-z0-9._:-]{8,128}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.version", "data.publication_version"],
    original: true,
    binary: false,
  },
  {
    operationId: "v1.crm.sequences.get",
    operation: "automation.crm_sequence_get",
    method: "GET",
    path: "/crm/crmsequence/{sequence}",
    sdk: "crm.source.sequences.getCurrent",
    scope: "automation:read",
    oauthScope: "automation.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "sequence",
        in: "path",
        required: true,
        description:
          "Public UUID v7 of the exact sequence; never an internal integer.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.version"],
    original: false,
    binary: false,
  },
  {
    operationId: "getServiceReplyOriginal",
    operation: "customer_service.send_reply",
    method: "GET",
    path: "/crm/service-tickets/{ticket}/replies/original",
    sdk: "crm.source.serviceTickets.getReplyOriginal",
    scope: "customer_service:write",
    oauthScope: "customer_service.write",
    parameters: [
      {
        name: "ticket",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^[ -~]+$",
        },
      },
      {
        name: "request_fingerprint",
        in: "query",
        required: true,
        schema: {
          type: "string",
          pattern: "^[a-f0-9]{64}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.version"],
    original: true,
    binary: false,
  },
  {
    operationId: "getCrmWhatsAppMessageOriginal",
    operation: "conversations.get",
    method: "GET",
    path: "/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/original",
    sdk: "crm.source.conversations.getWhatsAppOriginal",
    scope: "conversations:read",
    oauthScope: null,
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "conversation",
        in: "path",
        required: true,
        description: "UUIDv7 original autorizado.",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
      {
        name: "message",
        in: "path",
        required: true,
        description: "UUIDv7 original autorizado.",
        schema: {
          type: "string",
          format: "uuid",
        },
      },
      {
        name: "original_wire",
        in: "query",
        required: true,
        description:
          "URL-encode de los bytes JSON exactos del POST original; preserve orden, espacios, Unicode y CAS.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 65536,
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [],
    original: true,
    binary: false,
  },
  {
    operationId: "listBookingServices",
    operation: "booking.list_services",
    method: "GET",
    path: "/crm/booking/services",
    sdk: "crm.source.booking.listServices",
    scope: "booking:read",
    oauthScope: "booking.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "cursor",
        in: "query",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 4096,
        },
      },
      {
        name: "limit",
        in: "query",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 25,
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.items[].version",
      "data.items[].publication_version",
      "data.items[].schedule.windows[].start_minute",
      "data.items[].schedule.windows[].end_minute",
      "data.items[].schedule.windows[].weekday",
      "data.items[].schedule.exceptions[].windows[].start_minute",
      "data.items[].schedule.exceptions[].windows[].end_minute",
      "data.items[].schedule.duration_minutes",
      "data.items[].schedule.buffer_before",
      "data.items[].schedule.buffer_after",
      "data.items[].schedule.capacity",
      "data.items[].schedule.minimum_notice_minutes",
      "data.items[].schedule.booking_horizon_days",
      "data.items[].schedule.slot_step_minutes",
      "data.items[].hold_minutes",
      "data.total",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "listBookings",
    operation: "booking.list_bookings",
    method: "GET",
    path: "/crm/booking/bookings",
    sdk: "crm.source.booking.listBookings",
    scope: "booking:read",
    oauthScope: "booking.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "cursor",
        in: "query",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 4096,
        },
      },
      {
        name: "limit",
        in: "query",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 25,
        },
      },
      {
        name: "service_id",
        in: "query",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "host_id",
        in: "query",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "status",
        in: "query",
        schema: {
          type: "string",
          enum: ["held", "confirmed", "cancelled", "expired"],
        },
      },
      {
        name: "from",
        in: "query",
        description: "Instante UTC nativo; from debe ser anterior a through.",
        schema: {
          type: "string",
          format: "date-time",
        },
      },
      {
        name: "through",
        in: "query",
        description: "Instante UTC nativo; from debe ser anterior a through.",
        schema: {
          type: "string",
          format: "date-time",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.items[].version", "data.total"],
    original: false,
    binary: false,
  },
  {
    operationId: "crmListCommercialDocuments",
    operation: "crm_documents.list",
    method: "GET",
    path: "/crm/documents",
    sdk: "crm.source.documents.list",
    scope: "crm_documents:read",
    oauthScope: "crm_documents.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "search",
        in: "query",
        schema: {
          type: ["string", "null"],
          maxLength: 255,
        },
      },
      {
        name: "page",
        in: "query",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 9223372036854776000,
        },
      },
      {
        name: "per_page",
        in: "query",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
        },
      },
      {
        name: "sort",
        in: "query",
        schema: {
          type: "string",
          enum: ["id", "title", "version"],
        },
      },
      {
        name: "archived",
        in: "query",
        schema: {
          type: "boolean",
        },
      },
      {
        name: "linked_entity_type",
        in: "query",
        schema: {
          type: "string",
          enum: ["person", "lead", "opportunity", "quote", "invoice"],
          description:
            "Pareja con linked_entity_id; lectura actual del dueño y del documento antes de contar o paginar.",
        },
      },
      {
        name: "linked_entity_id",
        in: "query",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.items[].version",
      "data.items[].versions[].number",
      "data.items[].versions[].size_bytes",
      "data.items[].links[].document_version",
      "data.total",
      "data.page",
      "data.per_page",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "v1.crm.sequences.list",
    operation: "automation.crm_sequence_list",
    method: "GET",
    path: "/crm/crmsequence",
    sdk: "crm.source.sequences.list",
    scope: "automation:read",
    oauthScope: "automation.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "filters",
        in: "query",
        required: true,
        description:
          "JSON object with explicit resource=schedules|enrolments. Only the closed fields for that resource are allowed; no operators, payload or arbitrary sorting.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 8192,
          contentMediaType: "application/json",
          contentSchema: {
            oneOf: [
              {
                type: "object",
                additionalProperties: false,
                required: ["resource"],
                properties: {
                  resource: {
                    const: "schedules",
                  },
                  state: {
                    type: "string",
                    enum: ["draft", "active", "paused", "retired"],
                  },
                  owner_id: {
                    type: "string",
                    format: "uuid",
                    pattern:
                      "^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                  team_id: {
                    anyOf: [
                      {
                        type: "string",
                        format: "uuid",
                        pattern:
                          "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                },
              },
              {
                type: "object",
                additionalProperties: false,
                required: ["resource"],
                properties: {
                  resource: {
                    const: "enrolments",
                  },
                  state: {
                    type: "string",
                    enum: [
                      "active",
                      "waiting",
                      "paused",
                      "completed",
                      "cancelled",
                      "blocked",
                    ],
                  },
                  owner_id: {
                    type: "string",
                    format: "uuid",
                    pattern:
                      "^[0-9a-f]{8}-[0-9a-f]{4}-[47][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                  team_id: {
                    anyOf: [
                      {
                        type: "string",
                        format: "uuid",
                        pattern:
                          "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                  sequence_id: {
                    type: "string",
                    format: "uuid",
                    pattern:
                      "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                  definition_version: {
                    type: "integer",
                    minimum: 1,
                    maximum: 9223372036854776000,
                  },
                  stop_reason: {
                    anyOf: [
                      {
                        type: "string",
                        enum: [
                          "human_reply",
                          "optout",
                          "closure",
                          "booking_confirmed",
                          "owner_disabled",
                          "revoked",
                          "suppressed",
                          "manual",
                          "privacy",
                          "unconfirmed",
                        ],
                      },
                      {
                        type: "null",
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
      {
        name: "cursor",
        in: "query",
        description:
          "Opaque native cursor bound to current filters/resource and scope. A changed selection requires a fresh page.",
        schema: {
          type: "string",
          minLength: 1,
          maxLength: 4096,
          pattern: "^[A-Za-z0-9+/=_-]+$",
        },
      },
      {
        name: "limit",
        in: "query",
        required: true,
        description: "Required page limit; no implicit default.",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: [
      "data.items[].version",
      "data.enrolments[].version",
      "data.enrolments[].generation",
      "data.enrolments[].definition_version",
      "data.enrolments[].current_step",
      "data.visible_count",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "v1.crm.sequences.preview",
    operation: "automation.crm_sequence_preview",
    method: "GET",
    path: "/crm/crmsequence/{sequence}/preview",
    sdk: "crm.source.sequences.preview",
    scope: "automation:read",
    oauthScope: "automation.read",
    parameters: [
      {
        name: "Factuarea-Version",
        in: "header",
        description:
          "Pin the API version (`YYYY-MM-DD`, Stripe-style date versioning) for this request; omit to use the key's pinned version, or the latest if none. Unsupported version → `400 unsupported_api_version`; malformed → `400 parameter_invalid_format`. The effective version is echoed in the `Factuarea-Version` response header. See the [Versioning guide](/guides/versioning).",
        required: false,
        schema: {
          type: "string",
          format: "date",
          example: "2026-06-01",
        },
      },
      {
        name: "X-Active-Profile",
        in: "header",
        description:
          "Operate on behalf of a child company (gestoría master key): pass its public `id` (UUID v7) and the request runs against that child's data without changing the key's scope, tier or environment (omit to use the key's own company). Invalid UUID → `400 parameter_invalid_uuid`; unknown or non-owned id → `404 profile_not_found`. See the [Acting on behalf guide](/guides/acting-on-behalf).",
        required: false,
        schema: {
          type: "string",
          format: "uuid",
          example: "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a0c",
        },
      },
      {
        name: "sequence",
        in: "path",
        required: true,
        description:
          "Public UUID v7 of the exact sequence; never an internal integer.",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "subject_type",
        in: "query",
        required: true,
        schema: {
          type: "string",
          enum: ["lead", "opportunity", "business_contact"],
        },
      },
      {
        name: "subject_id",
        in: "query",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        },
      },
      {
        name: "start_at",
        in: "query",
        required: true,
        description:
          "Explicit instant with offset, not earlier than the current server clock. Preview is read-only, rechecks enrolment eligibility and does not allocate effects.",
        schema: {
          type: "string",
          format: "date-time",
          maxLength: 40,
          pattern:
            "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,6})?(?:Z|[+-]\\d{2}:\\d{2})$",
        },
      },
    ],
    successStatuses: [200],
    exactIntegerPaths: ["data.definition_version", "data.steps[].step_index"],
    original: false,
    binary: false,
  },
] as const;
