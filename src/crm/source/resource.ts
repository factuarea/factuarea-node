import { BaseResource, flattenQuery } from "../../core/resource.js";
import { ConnectionError } from "../../core/errors.js";
import type { BinaryResponse } from "../../core/http-client.js";
import type { CrmRequestConfig } from "../resource.js";

export interface CrmSourceRequestConfig extends CrmRequestConfig {}

/** Exact retained key. Each native operation supplies its own alphabet/length contract. */
export interface CrmSourceOriginalRequestConfig extends CrmSourceRequestConfig {
  idempotencyKey: string;
}

interface NativeParameter {
  readonly name: string;
  readonly in: string;
  readonly required?: boolean;
  readonly schema?: Readonly<Record<string, unknown>>;
}

interface NativeRead {
  readonly operationId: string;
  readonly method: "GET";
  readonly path: string;
  readonly parameters: readonly NativeParameter[];
  readonly exactIntegerPaths: readonly string[];
  readonly binary: boolean;
}

/** Uses the canonical authenticated transport; no receipt/current cache, new key, POST or fallback. */
export abstract class CrmSourceBaseResource extends BaseResource {
  protected readSource<T>(
    operation: NativeRead & { readonly binary: false },
    pathValues: Record<string, unknown>,
    query: Record<string, unknown> | undefined,
    config?: CrmSourceRequestConfig
  ): Promise<T>;
  protected readSource(
    operation: NativeRead & { readonly binary: true },
    pathValues: Record<string, unknown>,
    query: Record<string, unknown> | undefined,
    config?: CrmSourceRequestConfig
  ): Promise<BinaryResponse>;
  protected async readSource<T>(
    operation: NativeRead,
    pathValues: Record<string, unknown>,
    query: Record<string, unknown> | undefined,
    config?: CrmSourceRequestConfig
  ): Promise<T | BinaryResponse> {
    const declared = new Set(
      operation.parameters.filter((p) => p.in === "query").map((p) => p.name)
    );
    for (const field of Object.keys(query ?? {}))
      if (!declared.has(field))
        throw new TypeError(
          `Factuarea: undeclared native query field ${field}.`
        );
    const headerEntries = Object.entries(config?.headers ?? {});
    const headerKey = headerEntries.find(
      ([name]) => name.toLowerCase() === "idempotency-key"
    )?.[1];
    const key = config?.idempotencyKey ?? headerKey;
    for (const parameter of operation.parameters) {
      const value =
        parameter.in === "path"
          ? pathValues[parameter.name]
          : parameter.in === "query"
          ? query?.[parameter.name]
          : parameter.name.toLowerCase() === "idempotency-key"
          ? key
          : headerEntries.find(
              ([name]) => name.toLowerCase() === parameter.name.toLowerCase()
            )?.[1];
      this.assertParameter(parameter, value);
    }
    const path = this.buildPath(
      operation.path,
      pathValues as Record<string, string>
    );
    // Explicit options prevent a caller-supplied method/body from changing a Query into an effect.
    const options = {
      method: "GET" as const,
      path,
      query: flattenQuery(query),
      signal: config?.signal,
      timeout: config?.timeout,
      maxRetries: config?.maxRetries,
      headers: config?.headers,
      idempotencyKey: key,
    };
    if (operation.binary) {
      const response = await this.client.requestBinary(options);
      config?.onResponse?.({ ...response, data: response.body });
      return response;
    }
    const response = await this.client.request<T>(options);
    config?.onResponse?.(response);
    if (
      typeof response.data !== "object" ||
      response.data === null ||
      Array.isArray(response.data) ||
      !("data" in response.data) ||
      typeof response.data.data !== "object" ||
      response.data.data === null ||
      Array.isArray(response.data.data)
    )
      throw new ConnectionError({
        message: "Factuarea: native Source JSON envelope could not be read.",
        code: "crm_source_response_unreadable",
        requestId: response.requestId,
      });
    for (const exactPath of operation.exactIntegerPaths) {
      this.assertExactIntegerPath(response.data, exactPath, response.requestId);
    }
    return response.data;
  }

  private assertParameter(parameter: NativeParameter, value: unknown): void {
    if (value === undefined) {
      if (parameter.required)
        throw new TypeError(`Factuarea: native ${parameter.name} is required.`);
      return;
    }
    const schema = parameter.schema ?? {};
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (value === null) {
      if (!types.includes("null"))
        throw new TypeError(
          `Factuarea: native ${parameter.name} is not nullable.`
        );
      return;
    }
    if (types.includes("integer")) {
      if (
        typeof value !== "number" ||
        !Number.isSafeInteger(value) ||
        (typeof schema.minimum === "number" && value < schema.minimum) ||
        (typeof schema.maximum === "number" && value > schema.maximum)
      )
        throw new TypeError(
          `Factuarea: native ${parameter.name} requires an exact safe integer.`
        );
    } else if (types.includes("string")) {
      if (
        typeof value !== "string" ||
        (typeof schema.minLength === "number" &&
          [...value].length < schema.minLength) ||
        (typeof schema.maxLength === "number" &&
          [...value].length > schema.maxLength) ||
        (typeof schema["x-max-bytes"] === "number" &&
          Buffer.byteLength(value, "utf8") > schema["x-max-bytes"]) ||
        (typeof schema.pattern === "string" &&
          !new RegExp(schema.pattern).test(value))
      )
        throw new TypeError(
          `Factuarea: incompatible native ${parameter.name}.`
        );
      if (
        schema.format === "uuid" &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value
        )
      )
        throw new TypeError(
          `Factuarea: native ${parameter.name} requires a UUID string.`
        );
    } else if (types.includes("boolean") && typeof value !== "boolean")
      throw new TypeError(
        `Factuarea: native ${parameter.name} requires a boolean.`
      );
    if (Array.isArray(schema.enum) && !schema.enum.includes(value))
      throw new TypeError(`Factuarea: incompatible native ${parameter.name}.`);
  }

  private assertExactIntegerPath(
    value: unknown,
    path: string,
    requestId: string | null
  ): void {
    const [field, ...remaining] = path.split(".");
    if (field === undefined || value === null || value === undefined) return;
    const array = field.endsWith("[]");
    const key = array ? field.slice(0, -2) : field;
    const selected =
      key === ""
        ? value
        : typeof value === "object"
        ? (value as Record<string, unknown>)[key]
        : undefined;
    if (array && Array.isArray(selected)) {
      for (const item of selected)
        this.assertExactIntegerPath(item, remaining.join("."), requestId);
    } else if (remaining.length)
      this.assertExactIntegerPath(selected, remaining.join("."), requestId);
    else if (
      selected !== undefined &&
      selected !== null &&
      (typeof selected !== "number" || !Number.isSafeInteger(selected))
    )
      throw new ConnectionError({
        message:
          "Factuarea: native response contains an unsafe integer; retain the Original and refresh explicitly.",
        code: "crm_response_unsafe_integer",
        requestId,
      });
  }
}
