// AUTO-GENERATED native Restore POST validation only; existing Source143 owns the writer.
export const CRM_NATIVE134_RESTORE_VALIDATION = {
  operationId: "crmRestoreCommercialDocument",
  method: "POST",
  path: "/crm/documents/{document}/restore",
  scope: "crm_documents:write",
  oauthScope: "crm_documents.write",
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
      name: "Idempotency-Key",
      in: "header",
      description:
        "Intención original: mismos argumentos recuperan el receipt original con permisos actuales; otro contenido devuelve409.",
      schema: {
        type: "string",
        minLength: 1,
        maxLength: 255,
        pattern: "^[ -~]+$",
      },
    },
  ],
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
                "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
            },
            version: {
              type: "integer",
              minimum: 1,
            },
          },
          required: ["id", "version"],
          title: "CrmPrivateDocumentReceipt",
        },
      },
      required: ["data"],
    },
  ],
  requestSchema: {
    type: "object",
    properties: {
      expected_version: {
        type: "integer",
        minimum: 1,
        maximum: 9223372036854775806,
      },
      confirmed: {
        type: "boolean",
        const: true,
        description:
          "Confirmación humana explícita de esta restauración y revisión; no concede acceso.",
      },
    },
    required: ["expected_version", "confirmed"],
    additionalProperties: false,
  },
} as const;
