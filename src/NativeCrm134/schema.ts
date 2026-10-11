/** Runtime shapes are generated from actual Native149; these checks grant no access. */
export interface NativeJsonSchema {
  readonly [key: string]: unknown;
  readonly type?: string | readonly string[];
  readonly properties?: Readonly<Record<string, NativeJsonSchema>>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean | NativeJsonSchema;
  readonly items?: NativeJsonSchema;
  readonly minItems?: number;
  readonly maxItems?: number;
  readonly uniqueItems?: boolean;
  readonly minimum?: number;
  readonly maximum?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string;
  readonly format?: string;
  readonly enum?: readonly unknown[];
  readonly const?: unknown;
  readonly anyOf?: readonly NativeJsonSchema[];
  readonly oneOf?: readonly NativeJsonSchema[];
  readonly allOf?: readonly NativeJsonSchema[];
}

export function matchesNativeJson(
  value: unknown,
  schema: NativeJsonSchema
): boolean {
  if (
    schema.anyOf &&
    !schema.anyOf.some((branch) => matchesNativeJson(value, branch))
  )
    return false;
  if (
    schema.oneOf &&
    schema.oneOf.filter((branch) => matchesNativeJson(value, branch)).length !==
      1
  )
    return false;
  if (
    schema.allOf &&
    !schema.allOf.every((branch) => matchesNativeJson(value, branch))
  )
    return false;
  if ("const" in schema && value !== schema.const) return false;
  if (schema.enum && !schema.enum.includes(value)) return false;
  const types = typeof schema.type === "string" ? [schema.type] : schema.type;
  if (
    types &&
    !types.some((type) =>
      type === "null"
        ? value === null
        : type === "array"
        ? Array.isArray(value)
        : type === "object"
        ? value !== null && typeof value === "object" && !Array.isArray(value)
        : type === "integer"
        ? typeof value === "number" && Number.isSafeInteger(value)
        : type === "number"
        ? typeof value === "number" && Number.isFinite(value)
        : typeof value === type
    )
  )
    return false;
  if (value === null) return true;
  if (typeof value === "number") {
    if (
      (schema.minimum !== undefined && value < schema.minimum) ||
      (schema.maximum !== undefined && value > schema.maximum)
    )
      return false;
  }
  if (typeof value === "string") {
    const length = [...value].length;
    const patternMatch =
      schema.pattern === undefined
        ? undefined
        : new RegExp(schema.pattern, "u").exec(value);
    if (
      (schema.minLength !== undefined && length < schema.minLength) ||
      (schema.maxLength !== undefined && length > schema.maxLength) ||
      (typeof schema["x-max-bytes"] === "number" &&
        Buffer.byteLength(value, "utf8") > schema["x-max-bytes"]) ||
      (schema.pattern !== undefined &&
        (!patternMatch ||
          (schema.pattern.endsWith("$") && patternMatch[0] !== value)))
    )
      return false;
    if (
      schema.format === "uuid" &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value
      )
    )
      return false;
    // Native UTF-8 JSON rejects unpaired UTF-16 surrogates before dispatch.
    for (const character of value)
      if (character.length === 1 && /^[\uD800-\uDFFF]$/u.test(character))
        return false;
  }
  if (Array.isArray(value)) {
    if (
      (schema.minItems !== undefined && value.length < schema.minItems) ||
      (schema.maxItems !== undefined && value.length > schema.maxItems)
    )
      return false;
    if (
      schema.items &&
      !value.every((item) => matchesNativeJson(item, schema.items!))
    )
      return false;
    if (
      schema.uniqueItems &&
      new Set(value.map((item) => JSON.stringify(item))).size !== value.length
    )
      return false;
  } else if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    if (
      schema.required?.some(
        (key) => !Object.hasOwn(object, key) || object[key] === undefined
      )
    )
      return false;
    for (const [key, child] of Object.entries(object)) {
      const property = schema.properties?.[key];
      if (
        property
          ? !matchesNativeJson(child, property)
          : schema.additionalProperties === false ||
            (typeof schema.additionalProperties === "object" &&
              !matchesNativeJson(child, schema.additionalProperties))
      )
        return false;
    }
  }
  return true;
}
