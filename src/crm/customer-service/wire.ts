import type { ServiceTicketActorId, ServiceTicketId, ServiceTicketTimestamp, ServiceTicketVersion } from "./types.js";

export function record(value: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype
    || required.some(key => !Object.hasOwn(value, key)) || Object.keys(value).some(key => !required.includes(key) && !optional.includes(key))) {
    throw new TypeError("Factuarea: ticket JSON contains missing or unsupported fields.");
  }
  return value as Record<string, unknown>;
}
export function items(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new TypeError("Factuarea: ticket items must be a JSON list.");
  return value;
}
export function integer(value: unknown, zero = false): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < (zero ? 0 : 1)) throw new TypeError("Factuarea: ticket count/CAS must be a safe native integer.");
  return value;
}
export function text(value: unknown, limit: number, empty = false): string {
  if (typeof value !== "string" || new TextEncoder().encode(value).byteLength > limit || (!empty && value.trim() === "")
    || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]|<\/?[a-z!][^>]*>/i.test(value)) throw new TypeError("Factuarea: ticket text must retain valid native plain text.");
  return value;
}
export function enumText(value: unknown): string {
  if (typeof value !== "string" || value.length > 255 || !/^[a-z][a-z0-9_]*$/.test(value)) throw new TypeError("Factuarea: ticket enum must retain its native string.");
  return value;
}
export function id(value: unknown): ServiceTicketId {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new TypeError("Factuarea: ticket identity must be UUIDv7.");
  return value as ServiceTicketId;
}
export function actor(value: unknown): ServiceTicketActorId {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new TypeError("Factuarea: ticket actor must retain its native UUID.");
  return value as ServiceTicketActorId;
}
export function version(value: unknown): ServiceTicketVersion { return integer(value) as ServiceTicketVersion; }
export function expectedVersion(value: unknown): ServiceTicketVersion {
  const result = version(value);
  if (result >= Number.MAX_SAFE_INTEGER) throw new TypeError("Factuarea: ticket CAS must leave room for its safe successor.");
  return result;
}
export function timestamp(value: unknown): ServiceTicketTimestamp {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,6})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)
    || !Number.isFinite(Date.parse(value))) throw new TypeError("Factuarea: ticket timestamp requires a valid explicit timezone.");
  const day = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value.slice(0, 10)) throw new TypeError("Factuarea: invalid ticket calendar date.");
  return value as ServiceTicketTimestamp;
}
export function mime(value: unknown): string {
  if (typeof value !== "string" || value.length > 255 || !/^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/.test(value)) throw new TypeError("Factuarea: invalid ticket MIME.");
  return value;
}
export function key(value: unknown): string {
  if (typeof value !== "string" || value.length > 255 || !/^[ -~]+$/.test(value)) throw new TypeError("Factuarea: ticket writes require the original ASCII idempotencyKey (1–255 characters).");
  return value;
}
export function oneOf<T extends string>(value: unknown, options: readonly T[]): T {
  if (typeof value !== "string" || !(options as readonly string[]).includes(value)) throw new TypeError("Factuarea: unsupported ticket filter.");
  return value as T;
}
export function nullable<T>(value: unknown, decode: (wire: unknown) => T): T | null { return value === null ? null : decode(value); }
export function sameId(a: string, b: string): boolean { return a.toLowerCase() === b.toLowerCase(); }
export function has(value: Record<string, unknown>, key: string): boolean { return Object.hasOwn(value, key) && value[key] !== undefined; }
export function page(page: unknown, perPage: unknown): { page: number; per_page: number; } {
  const p = integer(page), size = integer(perPage);
  if (p > 1000000 || size > 100) throw new TypeError("Factuarea: ticket pages require page 1..1000000 and per_page 1..100.");
  return { page: p, per_page: size };
}
export function serviceTicketId(value: string): ServiceTicketId { return id(value); }
export function serviceTicketVersion(value: number): ServiceTicketVersion { return version(value); }
export function serviceTicketActorId(value: string): ServiceTicketActorId { return actor(value); }
export function serviceTicketTimestamp(value: string): ServiceTicketTimestamp { return timestamp(value); }
