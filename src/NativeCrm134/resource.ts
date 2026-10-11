import { ConnectionError, FactuareaError } from "../core/errors.js";
import { CrmUnconfirmedWriteError } from "../crm/errors.js";
import {
  CrmSourceBaseResource,
  type CrmSourceRequestConfig,
  type CrmSourceWriteConfig,
} from "../crm/source/resource.js";
import { matchesNativeJson, type NativeJsonSchema } from "./schema.js";

interface NativeParameter {
  readonly name: string;
  readonly in: string;
  readonly required?: boolean;
  readonly schema?: NativeJsonSchema;
}
interface NativeOperation {
  readonly operationId: string;
  readonly method: "GET";
  readonly path: string;
  readonly parameters: readonly NativeParameter[];
  readonly exactIntegerPaths: readonly string[];
  readonly successSchemas: readonly NativeJsonSchema[];
  readonly binary: false;
}
interface NativeEffect extends Omit<NativeOperation, "method"> {
  readonly method: "POST" | "PATCH";
  readonly successStatuses: readonly number[];
  readonly requestIntegerPaths: readonly string[];
  readonly requestSchema: NativeJsonSchema;
}

/** Compose strict actual-native JSON shapes with the existing authenticated transport. */
export abstract class NativeCrm134BaseResource extends CrmSourceBaseResource {
  protected async readNative<T>(
    operation: NativeOperation,
    path: Record<string, unknown>,
    query: Record<string, unknown> | undefined,
    config?: CrmSourceRequestConfig
  ): Promise<T> {
    this.assertParameters(operation, path, query, config);
    const response = await this.readSource<T>(operation, path, query, config);
    this.assertResponse(operation, response);
    return response;
  }

  protected async writeNative<T>(
    operation: NativeEffect,
    path: Record<string, unknown>,
    body: unknown,
    config: CrmSourceWriteConfig
  ): Promise<T> {
    this.assertParameters(operation, path, undefined, config);
    if (!matchesNativeJson(body, operation.requestSchema))
      throw new TypeError(
        "Factuarea: the reviewed body differs from the closed native request schema."
      );
    let response: T;
    try {
      response = await this.writeSource<T>(operation, path, body, config);
    } catch (cause) {
      if (cause instanceof Error && !(cause instanceof FactuareaError))
        throw new CrmUnconfirmedWriteError(
          operation.operationId,
          config.idempotencyKey,
          cause
        );
      throw cause;
    }
    try {
      this.assertResponse(operation, response);
    } catch (cause) {
      if (cause instanceof ConnectionError)
        throw new CrmUnconfirmedWriteError(
          operation.operationId,
          config.idempotencyKey,
          cause
        );
      throw cause;
    }
    return response;
  }

  private assertResponse(
    operation: NativeOperation | NativeEffect,
    response: unknown
  ): void {
    if (
      !operation.successSchemas.some((schema) =>
        matchesNativeJson(response, schema)
      )
    )
      throw new ConnectionError({
        message:
          "Factuarea: the native response differs from its closed success schema.",
        code: "crm_native134_response_unreadable",
      });
  }

  private assertParameters(
    operation: NativeOperation | NativeEffect,
    path: Record<string, unknown>,
    query: Record<string, unknown> | undefined,
    config?: CrmSourceRequestConfig
  ): void {
    for (const parameter of operation.parameters) {
      const value =
        parameter.in === "path"
          ? path[parameter.name]
          : parameter.in === "query"
          ? query?.[parameter.name]
          : parameter.name.toLowerCase() === "idempotency-key"
          ? config?.idempotencyKey
          : Object.entries(config?.headers ?? {}).find(
              ([name]) => name.toLowerCase() === parameter.name.toLowerCase()
            )?.[1];
      if (
        value === undefined
          ? parameter.required
          : parameter.schema && !matchesNativeJson(value, parameter.schema)
      )
        throw new TypeError(
          `Factuarea: incompatible native ${parameter.name}.`
        );
    }
  }
}
