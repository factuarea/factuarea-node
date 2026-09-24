// Names congelados por `backend/docs/api/sdk-method-naming.md @ 1.1.0` (§3.1,
// «Purchase scanner and expense categories»), medidos y contrastados contra la
// derivación determinista del §2 en `anchors/contract.md` (task 1.7) del change
// `scanner-sdk-cli-spec-sync`. Este test es el gate: si el generador
// (`scripts/build-resources.mjs`) o el spec pineado se desvían de esta tabla,
// falla aquí antes de llegar a un consumidor.
import { describe, expect, it } from "vitest";
import { PurchaseScansResource } from "../src/resources/purchaseScans.js";
import { PurchaseScanEmailsResource } from "../src/resources/purchaseScanEmails.js";
import { PurchaseInvoicesResource } from "../src/resources/purchaseInvoices.js";
import { testClient } from "./helpers.js";

/** The 11 `public-api.v1.purchase_scans.*` operations, in the order frozen by contract.md. */
const EXPECTED_PURCHASE_SCANS_METHODS = [
  "list",
  "create",
  "stats",
  "show",
  "source",
  "retry",
  "review",
  "duplicateResolution",
  "convert",
  "archive",
  "restore",
];

function publicMethodNames(prototype: object): string[] {
  return Object.getOwnPropertyNames(prototype).filter(
    (name) => name !== "constructor" && typeof (prototype as Record<string, unknown>)[name] === "function"
  );
}

describe("purchase scanner SDK naming (sdk-method-naming.md @ 1.1.0)", () => {
  it("PurchaseScansResource exposes exactly the 11 frozen methods", () => {
    const methods = publicMethodNames(PurchaseScansResource.prototype);
    expect(methods.sort()).toEqual([...EXPECTED_PURCHASE_SCANS_METHODS].sort());
  });

  it("PurchaseScanEmailsResource exposes list", () => {
    const methods = publicMethodNames(PurchaseScanEmailsResource.prototype);
    expect(methods).toEqual(["list"]);
  });

  it("PurchaseInvoicesResource exposes expenseCategories", () => {
    const methods = publicMethodNames(PurchaseInvoicesResource.prototype);
    expect(methods).toContain("expenseCategories");
  });

  it("a client exposes purchaseScans and purchaseScanEmails namespaces", () => {
    const client = testClient();
    expect(client.purchaseScans).toBeInstanceOf(PurchaseScansResource);
    expect(client.purchaseScanEmails).toBeInstanceOf(PurchaseScanEmailsResource);
  });
});
