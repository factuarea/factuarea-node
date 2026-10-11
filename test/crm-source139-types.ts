import type { CrmSourceResource } from "../src/crm/source/index.js";

/** Compile-only Source contracts; never invoked or compiled by this producer. */
function nativeSourceTypes(source: CrmSourceResource): void {
  void source.imports.getApplyOriginal(
    "019c0000-0000-7000-8000-000000001391",
    { original_body_sha256: "a".repeat(64) },
    { idempotencyKey: "original" }
  );
  // @ts-expect-error Original GET requires the retained native key.
  void source.imports.getApplyOriginal("019c0000-0000-7000-8000-000000001391", {
    original_body_sha256: "a".repeat(64),
  });
  // @ts-expect-error UUIDs remain strings, never internal numeric IDs.
  void source.sequences.getCurrent(139);
  // @ts-expect-error No apply Command is invented from an Original Query.
  void source.imports.apply({ confirmed: true });
  // @ts-expect-error Document restore is absent from the real input139 contract.
  void source.documents.restore("019c0000-0000-7000-8000-000000001391");
  // @ts-expect-error Query-only Booking filters have the closed native state union.
  void source.booking.listBookings({ status: "delivered" });
}
void nativeSourceTypes;
