import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { FactuareaStorefront } from "../../src/storefront/index.js";
import { StorefrontNamespace } from "../../src/storefront/transport.js";

/**
 * Task 6.19 / spec `storefront-browser-sdk` — "Los métodos publicados y las
 * operaciones del contrato coinciden".
 *
 * Both sides are MEASURED, never listed by hand:
 *
 *   • the contract side comes from the pinned `spec/openapi.json` (the copy §5
 *     re-pinned), filtered by the `Storefront` tag — the buyer lane of 1.13;
 *   • the SDK side is read at RUNTIME by walking the instantiated client and
 *     its prototype chains, so a method that is commented out, unreachable or
 *     merely declared in a type does not count.
 *
 * The comparison runs in BOTH directions: a method with no operation behind it
 * is invented surface, an operation with no method is lost surface. Neither
 * `tsc --noEmit` nor `tsup` notices either one.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;
const BUYER_TAG = "Storefront";
const MERCHANT_TAG = "Storefront Credentials";
const BUYER_GROUP_ROOT = "storefront.";

const PUBLISHABLE = "sf_pk_abcdef0123456789ABCDEFGH";
const COMPANY = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b";

type Operation = {
  operationId: string;
  tags?: string[];
  "x-speakeasy-group"?: string;
  "x-required-scope"?: string;
};
type Spec = { paths: Record<string, Record<string, Operation>> };

function pinnedSpec(): Spec {
  return JSON.parse(readFileSync(join(root, "spec", "openapi.json"), "utf8")) as Spec;
}

/** The same camelCase rule `scripts/build-resources.mjs` applies. */
function camel(segment: string): string {
  const parts = segment.replace(/-/g, "_").split("_");
  return (
    parts[0]! +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  );
}

function operationsTagged(tag: string): Operation[] {
  const out: Operation[] = [];
  for (const item of Object.values(pinnedSpec().paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (!(HTTP_METHODS as readonly string[]).includes(method)) continue;
      if ((op.tags ?? []).includes(tag)) out.push(op);
    }
  }
  return out;
}

/**
 * Dotted method path the browser client must publish for an operation. The
 * company axis is fixed at construction, so the namespace is the speakeasy
 * group MINUS its `storefront.` root: `storefront.products.images` + `list`
 * becomes `products.images.list`.
 */
function methodPathOf(op: Operation): string {
  const group = op["x-speakeasy-group"] ?? "";
  expect(group.startsWith(BUYER_GROUP_ROOT), `${op.operationId} sin grupo del carril`).toBe(true);
  const namespace = group.slice(BUYER_GROUP_ROOT.length);
  const action = camel(op.operationId.replace("public-api.v1.", "").split(".").pop()!);
  return namespace === "" ? action : `${namespace}.${action}`;
}

function browserClient(): FactuareaStorefront {
  return new FactuareaStorefront({
    publishableKey: PUBLISHABLE,
    company: COMPANY,
    fetch: (() => {
      throw new Error("ninguna petición en este test");
    }) as unknown as typeof fetch,
  });
}

/** Walks the FULL prototype chain, so an inherited method still counts. */
function methodsOf(node: object): string[] {
  const out: string[] = [];
  let proto: object | null = Object.getPrototypeOf(node) as object | null;
  while (proto !== null && proto !== Object.prototype && proto !== StorefrontNamespace.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === "constructor") continue;
      const descriptor = Object.getOwnPropertyDescriptor(proto, name);
      if (descriptor && typeof descriptor.value === "function") out.push(name);
    }
    proto = Object.getPrototypeOf(proto) as object | null;
  }
  return out;
}

function collect(prefix: string, node: object, out: Set<string>): void {
  for (const name of methodsOf(node)) {
    out.add(prefix === "" ? name : `${prefix}.${name}`);
  }
  for (const [key, value] of Object.entries(node)) {
    if (value instanceof StorefrontNamespace) {
      collect(prefix === "" ? key : `${prefix}.${key}`, value, out);
    }
  }
}

function publishedMethodPaths(): Set<string> {
  const out = new Set<string>();
  collect("", browserClient(), out);
  return out;
}

describe("la superficie del navegador y el carril del comprador del contrato coinciden", () => {
  it("el contrato fijado publica las 23 operaciones del comprador de 1.13", () => {
    expect(operationsTagged(BUYER_TAG)).toHaveLength(23);
  });

  it("no publica ninguna operación inventada (SDK → contrato)", () => {
    const expected = new Set(operationsTagged(BUYER_TAG).map(methodPathOf));
    const invented = [...publishedMethodPaths()].filter((m) => !expected.has(m)).sort();
    expect(invented, `Métodos sin operación detrás: ${invented.join(", ")}`).toEqual([]);
  });

  it("no pierde ninguna operación del comprador (contrato → SDK)", () => {
    const published = publishedMethodPaths();
    const lost = operationsTagged(BUYER_TAG)
      .map(methodPathOf)
      .filter((m) => !published.has(m))
      .sort();
    expect(lost, `Operaciones sin método: ${lost.join(", ")}`).toEqual([]);
  });

  it("los dos conjuntos tienen el mismo tamaño: 23 métodos, 23 operaciones", () => {
    expect(publishedMethodPaths().size).toBe(23);
  });

  it("cada método del comprador exige `storefront:read` o `storefront:write`", () => {
    const scopes = new Set(operationsTagged(BUYER_TAG).map((op) => op["x-required-scope"]));
    expect([...scopes].sort()).toEqual(["storefront:read", "storefront:write"]);
  });
});

describe("el carril de integrador NO es alcanzable desde el navegador", () => {
  it("ninguna de las 7 operaciones del comerciante tiene método aquí", () => {
    const merchant = operationsTagged(MERCHANT_TAG);
    expect(merchant).toHaveLength(7);

    const published = publishedMethodPaths();
    const reachable = merchant
      .map((op) => camel(op.operationId.replace("public-api.v1.storefront_keys.", "")))
      .filter((action) => [...published].some((m) => m.endsWith(`storefrontKeys.${action}`)));
    expect(reachable).toEqual([]);
    expect([...published].some((m) => m.startsWith("storefrontKeys"))).toBe(false);
  });

  it("el cliente no expone el cliente de servidor por ninguna propiedad", () => {
    const client = browserClient() as unknown as Record<string, unknown>;
    expect(Object.keys(client).sort()).toEqual([
      "availability",
      "catalogSelections",
      "categories",
      "company",
      "orders",
      "prices",
      "products",
      "sessions",
      "transport",
    ]);
  });

  it("el cliente en sí no publica ningún método de operación", () => {
    expect(methodsOf(browserClient())).toEqual([]);
  });
});
