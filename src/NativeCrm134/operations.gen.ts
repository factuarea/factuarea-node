// AUTO-GENERATED from actual private Native149 3667e01b82dea255c23b2eecb80e6e600baa445b5b7a2beb5a65eb978a1fc073.
export const CRM_NATIVE134_OPERATIONS = [
  {
    operationId: "applyServiceTicketBulkAction",
    operation: "customer_service.bulk_action",
    method: "POST",
    path: "/crm/service-tickets/bulk-actions",
    sdk: "crm.native134.bulk.apply",
    scope: "customer_service:write",
    oauthScope: "customer_service.write",
    parameters: [
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
    ],
    successStatuses: [200],
    successSchemas: [
      {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: ["assign", "priority", "tags", "status"],
              },
              total: {
                type: "integer",
                minimum: 1,
                maximum: 100,
              },
              confirmed: {
                type: "integer",
                minimum: 0,
              },
              rejected: {
                type: "integer",
                minimum: 0,
              },
              unknown: {
                type: "integer",
                minimum: 0,
              },
              partial: {
                type: "boolean",
              },
              results: {
                type: "array",
                minItems: 1,
                maxItems: 100,
                items: {
                  type: "object",
                  properties: {
                    index: {
                      type: "integer",
                      minimum: 0,
                    },
                    id: {
                      type: "string",
                      format: "uuid",
                      pattern:
                        "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                    },
                    expected_version: {
                      type: "integer",
                      minimum: 1,
                    },
                    state: {
                      type: "string",
                      enum: ["confirmed", "rejected", "unknown"],
                    },
                    reason: {
                      type: ["string", "null"],
                      enum: [
                        "unavailable",
                        "forbidden",
                        "revoked",
                        "stale_version",
                        "locked",
                        "invalid_data",
                        "wip_limit",
                        "approval_pending",
                        "original_key_conflict",
                        "original_unconfirmed",
                        null,
                      ],
                    },
                    effect_id: {
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
                    result_version: {
                      type: ["integer", "null"],
                      minimum: 1,
                    },
                    can_retry: {
                      type: "boolean",
                      const: false,
                    },
                  },
                  required: [
                    "index",
                    "id",
                    "expected_version",
                    "state",
                    "reason",
                    "effect_id",
                    "result_version",
                    "can_retry",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: [
              "action",
              "total",
              "confirmed",
              "rejected",
              "unknown",
              "partial",
              "results",
            ],
            additionalProperties: false,
          },
        },
        required: ["data"],
        additionalProperties: false,
      },
    ],
    requestSchema: {
      oneOf: [
        {
          type: "object",
          properties: {
            action: {
              type: "string",
              const: "assign",
            },
            items: {
              type: "array",
              minItems: 1,
              maxItems: 100,
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    pattern:
                      "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                  expected_version: {
                    type: "integer",
                    minimum: 1,
                  },
                },
                required: ["id", "expected_version"],
                additionalProperties: false,
              },
            },
            assignee_id: {
              anyOf: [
                {
                  type: "string",
                  format: "uuid",
                  pattern:
                    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
                },
                {
                  type: "null",
                },
              ],
            },
          },
          required: ["action", "items", "assignee_id"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            action: {
              type: "string",
              const: "priority",
            },
            items: {
              type: "array",
              minItems: 1,
              maxItems: 100,
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    pattern:
                      "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                  expected_version: {
                    type: "integer",
                    minimum: 1,
                  },
                },
                required: ["id", "expected_version"],
                additionalProperties: false,
              },
            },
            priority: {
              type: "string",
              enum: ["low", "normal", "high", "urgent"],
            },
          },
          required: ["action", "items", "priority"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            action: {
              type: "string",
              const: "tags",
            },
            items: {
              type: "array",
              minItems: 1,
              maxItems: 100,
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    pattern:
                      "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                  expected_version: {
                    type: "integer",
                    minimum: 1,
                  },
                },
                required: ["id", "expected_version"],
                additionalProperties: false,
              },
            },
            tag_ids: {
              type: "array",
              maxItems: 100,
              uniqueItems: true,
              items: {
                type: "string",
                format: "uuid",
                pattern:
                  "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
              },
            },
          },
          required: ["action", "items", "tag_ids"],
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            action: {
              type: "string",
              const: "status",
            },
            items: {
              type: "array",
              minItems: 1,
              maxItems: 100,
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    format: "uuid",
                    pattern:
                      "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                  },
                  expected_version: {
                    type: "integer",
                    minimum: 1,
                  },
                },
                required: ["id", "expected_version"],
                additionalProperties: false,
              },
            },
            pipeline_id: {
              type: "string",
              format: "uuid",
              pattern:
                "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
            },
            stage_id: {
              type: "string",
              format: "uuid",
              pattern:
                "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
            },
          },
          required: ["action", "items", "pipeline_id", "stage_id"],
          additionalProperties: false,
        },
      ],
    },
    exactIntegerPaths: [
      "data.total",
      "data.confirmed",
      "data.rejected",
      "data.unknown",
      "data.results[].index",
      "data.results[].expected_version",
      "data.results[].result_version",
    ],
    requestIntegerPaths: ["items[].expected_version"],
    original: false,
    binary: false,
  },
  {
    operationId: "crmGetCommercialDocumentRestoreOriginal",
    operation: "crm_documents.restore_original_get",
    method: "GET",
    path: "/crm/documents/{document}/restore/original",
    sdk: "crm.native134.documents.getRestoreOriginal",
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
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
        },
      },
      {
        name: "expected_version",
        in: "query",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 9223372036854775806,
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
    ],
    successStatuses: [200],
    successSchemas: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          data: {
            oneOf: [
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  state: {
                    type: "string",
                    const: "unknown",
                  },
                  document: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                        pattern:
                          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
                      },
                      expected_version: {
                        type: "integer",
                        minimum: 1,
                        maximum: 9223372036854775806,
                      },
                    },
                    required: ["id", "expected_version"],
                  },
                  restore_original: {
                    type: "null",
                  },
                },
                required: ["state", "document", "restore_original"],
              },
              {
                type: "object",
                additionalProperties: false,
                properties: {
                  state: {
                    type: "string",
                    const: "confirmed",
                  },
                  document: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                        pattern:
                          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
                      },
                      expected_version: {
                        type: "integer",
                        minimum: 1,
                        maximum: 9223372036854775806,
                      },
                    },
                    required: ["id", "expected_version"],
                  },
                  restore_original: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid",
                        pattern:
                          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
                      },
                      version: {
                        type: "integer",
                        minimum: 1,
                        maximum: 9223372036854775806,
                      },
                    },
                    required: ["id", "version"],
                  },
                },
                required: ["state", "document", "restore_original"],
              },
            ],
            title: "CrmDocumentRestoreOriginal",
          },
        },
        required: ["data"],
      },
    ],
    exactIntegerPaths: [
      "data.document.expected_version",
      "data.restore_original.version",
    ],
    original: true,
    binary: false,
  },
  {
    operationId: "getOriginalServiceTicketBulkItem",
    operation: "customer_service.bulk_action",
    method: "GET",
    path: "/crm/service-tickets/{ticket}/bulk-actions/original",
    sdk: "crm.native134.bulk.getItemOriginal",
    scope: "customer_service:write",
    oauthScope: "customer_service.write",
    parameters: [
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
        name: "action",
        in: "query",
        required: true,
        schema: {
          type: "string",
          enum: ["assign", "priority", "tags", "status"],
        },
      },
      {
        name: "expected_version",
        in: "query",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
      },
      {
        name: "assignee_id",
        in: "query",
        schema: {
          anyOf: [
            {
              type: "string",
              format: "uuid",
              pattern:
                "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
            },
            {
              type: "string",
              const: "null",
            },
          ],
          description:
            "Obligatorio sólo para assign; null textual representa desasignación.",
        },
      },
      {
        name: "priority",
        in: "query",
        schema: {
          type: "string",
          enum: ["low", "normal", "high", "urgent"],
          description: "Obligatorio sólo para priority.",
        },
      },
      {
        name: "tag_ids",
        in: "query",
        schema: {
          type: "string",
          maxLength: 4096,
          description:
            "Obligatorio sólo para tags: lista JSON de 0..100 UUID distintos, codificada en la URL.",
        },
      },
      {
        name: "pipeline_id",
        in: "query",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
          description: "Obligatorio sólo para status.",
        },
      },
      {
        name: "stage_id",
        in: "query",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
          description: "Obligatorio sólo para status.",
        },
      },
    ],
    successStatuses: [200],
    successSchemas: [
      {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              index: {
                type: "integer",
                minimum: 0,
              },
              id: {
                type: "string",
                format: "uuid",
                pattern:
                  "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
              },
              expected_version: {
                type: "integer",
                minimum: 1,
              },
              state: {
                type: "string",
                enum: ["confirmed", "unknown"],
              },
              reason: {
                type: ["string", "null"],
                enum: [
                  "unavailable",
                  "forbidden",
                  "revoked",
                  "stale_version",
                  "locked",
                  "invalid_data",
                  "wip_limit",
                  "approval_pending",
                  "original_key_conflict",
                  "original_unconfirmed",
                  null,
                ],
              },
              effect_id: {
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
              result_version: {
                type: ["integer", "null"],
                minimum: 1,
              },
              can_retry: {
                type: "boolean",
                const: false,
              },
            },
            required: [
              "index",
              "id",
              "expected_version",
              "state",
              "reason",
              "effect_id",
              "result_version",
              "can_retry",
            ],
            additionalProperties: false,
          },
        },
        required: ["data"],
        additionalProperties: false,
      },
    ],
    exactIntegerPaths: [
      "data.index",
      "data.expected_version",
      "data.result_version",
    ],
    original: true,
    binary: false,
  },
  {
    operationId: "getServiceStageOriginal",
    operation: "customer_service.update_stage",
    method: "GET",
    path: "/crm/service-stages/{stage}/original",
    sdk: "crm.native134.stages.getOriginal",
    scope: "customer_service:write",
    oauthScope: "customer_service.write",
    parameters: [
      {
        name: "stage",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
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
          minLength: 64,
          maxLength: 64,
          pattern: "^[a-f0-9]{64}$",
        },
      },
    ],
    successStatuses: [200],
    successSchemas: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: {
                type: "string",
                format: "uuid",
                pattern:
                  "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
              },
              pipeline_id: {
                type: "string",
                format: "uuid",
                pattern:
                  "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
              },
              name: {
                type: "string",
                minLength: 1,
                maxLength: 255,
                pattern: "^(?=.*[^ ])[^\\u0000-\\u001F\\u007F]+$",
              },
              status: {
                type: "string",
                enum: ["active", "archived"],
              },
              mapped_status: {
                type: "string",
                enum: ["new", "assigned", "pending", "closed", "rejected"],
              },
              wip_limit: {
                anyOf: [
                  {
                    type: "integer",
                    minimum: 1,
                    maximum: 2147483647,
                  },
                  {
                    type: "null",
                  },
                ],
              },
              version: {
                type: "integer",
                minimum: 1,
              },
              pipeline_version: {
                type: "integer",
                minimum: 1,
              },
            },
            required: [
              "id",
              "pipeline_id",
              "name",
              "status",
              "mapped_status",
              "wip_limit",
              "version",
              "pipeline_version",
            ],
          },
        },
        required: ["data"],
      },
    ],
    exactIntegerPaths: [
      "data.wip_limit",
      "data.version",
      "data.pipeline_version",
    ],
    original: true,
    binary: false,
  },
  {
    operationId: "getServiceTicketBulkOptions",
    operation: "customer_service.bulk_options",
    method: "GET",
    path: "/crm/service-tickets/bulk-actions/tag-options",
    sdk: "crm.native134.bulk.getOptions",
    scope: "customer_service:read",
    oauthScope: "customer_service.read",
    parameters: [],
    successStatuses: [200],
    successSchemas: [
      {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              authorization_version: {
                type: "string",
              },
              tags: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                      pattern:
                        "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
                    },
                    version: {
                      type: "integer",
                      minimum: 1,
                    },
                    name: {
                      type: "string",
                      minLength: 1,
                      maxLength: 255,
                    },
                  },
                  required: ["id", "version", "name"],
                  additionalProperties: false,
                },
              },
            },
            required: ["authorization_version", "tags"],
            additionalProperties: false,
          },
        },
        required: ["data"],
        additionalProperties: false,
      },
    ],
    exactIntegerPaths: ["data.tags[].version"],
    original: false,
    binary: false,
  },
  {
    operationId: "listServiceStages",
    operation: "customer_service.list_stages",
    method: "GET",
    path: "/crm/service-stages",
    sdk: "crm.native134.stages.list",
    scope: "customer_service:read",
    oauthScope: "customer_service.read",
    parameters: [
      {
        name: "pipeline_id",
        in: "query",
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
        },
      },
      {
        name: "page",
        in: "query",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 1000000,
          default: 1,
        },
      },
      {
        name: "per_page",
        in: "query",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 100,
        },
      },
    ],
    successStatuses: [200],
    successSchemas: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              items: {
                type: "array",
                maxItems: 100,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    id: {
                      type: "string",
                      format: "uuid",
                      pattern:
                        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
                    },
                    pipeline_id: {
                      type: "string",
                      format: "uuid",
                      pattern:
                        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
                    },
                    name: {
                      type: "string",
                      minLength: 1,
                      maxLength: 255,
                      pattern: "^(?=.*[^ ])[^\\u0000-\\u001F\\u007F]+$",
                    },
                    status: {
                      type: "string",
                      enum: ["active", "archived"],
                    },
                    mapped_status: {
                      type: "string",
                      enum: [
                        "new",
                        "assigned",
                        "pending",
                        "closed",
                        "rejected",
                      ],
                    },
                    wip_limit: {
                      anyOf: [
                        {
                          type: "integer",
                          minimum: 1,
                          maximum: 2147483647,
                        },
                        {
                          type: "null",
                        },
                      ],
                    },
                    version: {
                      type: "integer",
                      minimum: 1,
                    },
                    pipeline_version: {
                      type: "integer",
                      minimum: 1,
                    },
                  },
                  required: [
                    "id",
                    "pipeline_id",
                    "name",
                    "status",
                    "mapped_status",
                    "wip_limit",
                    "version",
                    "pipeline_version",
                  ],
                },
              },
              total: {
                type: "integer",
                minimum: 0,
              },
              page: {
                type: "integer",
                minimum: 1,
                maximum: 1000000,
              },
              per_page: {
                type: "integer",
                minimum: 1,
                maximum: 100,
              },
            },
            required: ["items", "total", "page", "per_page"],
          },
        },
        required: ["data"],
      },
    ],
    exactIntegerPaths: [
      "data.items[].wip_limit",
      "data.items[].version",
      "data.items[].pipeline_version",
      "data.total",
      "data.page",
      "data.per_page",
    ],
    original: false,
    binary: false,
  },
  {
    operationId: "updateServiceStage",
    operation: "customer_service.update_stage",
    method: "PATCH",
    path: "/crm/service-stages/{stage}",
    sdk: "crm.native134.stages.update",
    scope: "customer_service:write",
    oauthScope: "customer_service.write",
    parameters: [
      {
        name: "stage",
        in: "path",
        required: true,
        schema: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
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
    ],
    successStatuses: [200],
    successSchemas: [
      {
        type: "object",
        additionalProperties: false,
        properties: {
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: {
                type: "string",
                format: "uuid",
                pattern:
                  "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
              },
              pipeline_id: {
                type: "string",
                format: "uuid",
                pattern:
                  "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
              },
              name: {
                type: "string",
                minLength: 1,
                maxLength: 255,
                pattern: "^(?=.*[^ ])[^\\u0000-\\u001F\\u007F]+$",
              },
              status: {
                type: "string",
                enum: ["active", "archived"],
              },
              mapped_status: {
                type: "string",
                enum: ["new", "assigned", "pending", "closed", "rejected"],
              },
              wip_limit: {
                anyOf: [
                  {
                    type: "integer",
                    minimum: 1,
                    maximum: 2147483647,
                  },
                  {
                    type: "null",
                  },
                ],
              },
              version: {
                type: "integer",
                minimum: 1,
              },
              pipeline_version: {
                type: "integer",
                minimum: 1,
              },
            },
            required: [
              "id",
              "pipeline_id",
              "name",
              "status",
              "mapped_status",
              "wip_limit",
              "version",
              "pipeline_version",
            ],
          },
        },
        required: ["data"],
      },
    ],
    requestSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        pipeline_id: {
          type: "string",
          format: "uuid",
          pattern:
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$",
        },
        expected_version: {
          type: "integer",
          minimum: 1,
          maximum: 2147483647,
        },
        expected_pipeline_version: {
          type: "integer",
          minimum: 1,
          maximum: 2147483647,
        },
        name: {
          type: "string",
          minLength: 1,
          maxLength: 255,
          pattern: "^(?=.*[^ ])[^\\u0000-\\u001F\\u007F]+$",
        },
        mapped_status: {
          type: "string",
          enum: ["new", "assigned", "pending", "closed", "rejected"],
        },
        wip_limit: {
          anyOf: [
            {
              type: "integer",
              minimum: 1,
              maximum: 2147483647,
            },
            {
              type: "null",
            },
          ],
        },
      },
      required: [
        "pipeline_id",
        "expected_version",
        "expected_pipeline_version",
        "name",
        "mapped_status",
        "wip_limit",
      ],
    },
    exactIntegerPaths: [
      "data.wip_limit",
      "data.version",
      "data.pipeline_version",
    ],
    requestIntegerPaths: [
      "expected_version",
      "expected_pipeline_version",
      "wip_limit",
    ],
    original: false,
    binary: false,
  },
] as const;
