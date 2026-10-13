import type { CrmDocumentDate, CrmDocumentDecimal, CrmDocumentId, CrmDocumentTimestamp, CrmDocumentVersion, CrmNativeDocumentType, NativeDocumentId } from "./types.js";

export function record(value: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype
    || required.some(key => !Object.hasOwn(value, key)) || Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) {
    throw new TypeError("Factuarea: document JSON contains missing or unsupported fields.");
  }
  return value as Record<string, unknown>;
}
export function items(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new TypeError("Factuarea: document items must be a JSON list.");
  return value;
}
export function text(value: unknown, max = 262144, empty = false): string {
  if (typeof value !== "string" || [...value].length > max || (!empty && value.trim() === "")) {
    throw new TypeError("Factuarea: document text has an invalid type or length.");
  }
  return value;
}
export function cleanText(value: unknown, max = 255, empty = false): string {
  const result = text(value, max, empty);
  if (/[\x00-\x1f\x7f]/.test(result)) throw new TypeError("Factuarea: document text contains unsupported controls.");
  return result;
}
export function nullable<T>(value: unknown, decode: (v: unknown) => T): T | null { return value === null ? null : decode(value); }
export function integer(value: unknown, zero = false): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < (zero ? 0 : 1)) throw new TypeError("Factuarea: document count/CAS must be a safe native integer.");
  return value;
}
export function boolean(value: unknown): boolean {
  if (typeof value !== "boolean") throw new TypeError("Factuarea: document boolean must retain its JSON type.");
  return value;
}
function uuid(value: unknown, native = false): string {
  const pattern = native ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i : /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (typeof value !== "string" || !pattern.test(value) || /^(?:0{8}-0{4}-0{4}-0{4}-0{12}|f{8}-f{4}-f{4}-f{4}-f{12})$/i.test(value)) {
    throw new TypeError("Factuarea: document identity must be its native UUID.");
  }
  return value;
}
export function crmDocumentId(value: string): CrmDocumentId { return uuid(value) as CrmDocumentId; }
export function nativeDocumentId(value: string): NativeDocumentId { return uuid(value, true) as NativeDocumentId; }
export function id(value: unknown): CrmDocumentId { return uuid(value) as CrmDocumentId; }
export function ownerId(value: unknown): NativeDocumentId { return uuid(value, true) as NativeDocumentId; }
export function crmDocumentVersion(value: number): CrmDocumentVersion { return integer(value) as CrmDocumentVersion; }
export function version(value: unknown): CrmDocumentVersion { return integer(value) as CrmDocumentVersion; }
export function expectedVersion(value: unknown): CrmDocumentVersion {
  const result = version(value);
  if (result >= Number.MAX_SAFE_INTEGER) throw new TypeError("Factuarea: document CAS must leave room for its safe successor.");
  return result;
}
export function documentType(value: unknown): CrmNativeDocumentType {
  if (!(["quote", "invoice", "contract", "recurring_schedule"] as unknown[]).includes(value)) throw new TypeError("Factuarea: unsupported native document type.");
  return value as CrmNativeDocumentType;
}
export function currency(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Z]{3}$/.test(value)) throw new TypeError("Factuarea: currency must retain its native code.");
  return value;
}
export function crmDocumentDecimal<Scale extends 2 | 4 = 2>(value: string, scale: Scale = 2 as Scale): CrmDocumentDecimal<Scale> { return decimal(value, scale); }
export function decimal<Scale extends 2 | 4 = 2>(value: unknown, scale: Scale = 2 as Scale): CrmDocumentDecimal<Scale> {
  if (typeof value !== "string" || !new RegExp(`^(?:0|[1-9][0-9]{0,17})\\.[0-9]{${scale}}$`).test(value)) throw new TypeError("Factuarea: document money must be an exact decimal string.");
  return value as CrmDocumentDecimal<Scale>;
}
export function crmDocumentDate(value: string): CrmDocumentDate { return date(value); }
export function date(value: unknown): CrmDocumentDate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new TypeError("Factuarea: document date must be YYYY-MM-DD.");
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new TypeError("Factuarea: invalid document calendar date.");
  return value as CrmDocumentDate;
}
export function crmDocumentTimestamp(value: string): CrmDocumentTimestamp { return timestamp(value); }
export function timestamp(value: unknown): CrmDocumentTimestamp {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    || !Number.isFinite(Date.parse(value))) throw new TypeError("Factuarea: document timestamp requires a valid explicit timezone.");
  date(value.slice(0, 10));
  return value as CrmDocumentTimestamp;
}
export function mime(value: unknown): string {
  const result = text(value, 255);
  if (!/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/.test(result)) throw new TypeError("Factuarea: invalid claimed MIME.");
  return result;
}
export function key(value: unknown): string {
  if (typeof value !== "string" || value.length > 255 || !/^[ -~]+$/.test(value)) throw new TypeError("Factuarea: document writes require the original ASCII idempotencyKey (1–255 characters).");
  return value;
}
export function oneOf<T extends string>(value: unknown, values: readonly T[]): T {
  if (typeof value !== "string" || !(values as readonly string[]).includes(value)) throw new TypeError("Factuarea: unsupported document enum.");
  return value as T;
}
export function sameId(a: string, b: string): boolean { return a.toLowerCase() === b.toLowerCase(); }
export function has(value: Record<string, unknown>, property: string): boolean { return Object.hasOwn(value, property) && value[property] !== undefined; }
