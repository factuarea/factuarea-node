import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { BASE_URL, server, testClient, useMockServer } from "./helpers.js";
import { BaseResource } from "../src/core/resource.js";
import { Page } from "../src/core/pagination.js";
import { createResources } from "../src/resources/index.js";

/**
 * Acceptance criterion of a regeneration (spec `sdk-typescript` — "El diff de
 * métodos públicos sale vacío", design D6).
 *
 * `tsc --noEmit` and `tsup` both pass with half the surface missing: a resource
 * file that never gets written, or an operation the generator silently skips
 * because it carries no grouping extension, produce a SMALLER SDK that still
 * typechecks and still builds. The only thing that catches it is comparing the
 * set of public methods the SDK publishes against the set of operations the
 * PINNED contract declares, IN BOTH DIRECTIONS:
 *
 *   • a method with no operation behind it  → invented surface,
 *   • an operation with no method           → lost surface.
 *
 * The SDK side is read at RUNTIME (the resource registry is instantiated and
 * its prototype chain walked), never by grepping source: a text scan would
 * happily accept a method that is commented out or unreachable.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

type Operation = {
  operationId: string;
  tags?: string[];
  parameters?: Array<{ name: string; in: string }>;
  requestBody?: { content?: Record<string, unknown> };
  responses?: Record<string, { content?: Record<string, unknown> }>;
  "x-speakeasy-group"?: string;
  "x-irreversible"?: boolean;
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

type ContractOperation = {
  /** Dotted path of the method the SDK must publish, e.g. `salesOrders.lines.create`. */
  methodPath: string;
  /** Namespace segments, already camelCased. */
  namespace: string[];
  action: string;
  operationId: string;
  method: string;
  path: string;
  pathParams: string[];
  cursorParam: string | null;
  isBinary: boolean;
  declaresIdempotencyKey: boolean;
  /** `x-irreversible` of the contract: the operation cannot be undone. */
  irreversible: boolean;
  tags: string[];
};

function contractOperations(spec: Spec): ContractOperation[] {
  const out: ContractOperation[] = [];
  for (const [path, item] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(item)) {
      if (!(HTTP_METHODS as readonly string[]).includes(method)) continue;
      const group = op["x-speakeasy-group"];
      // An operation with no grouping extension is DROPPED by the resource
      // generator (`if (!group) continue`). Keeping it here with an empty
      // namespace makes the two-way diff report it as lost surface instead of
      // hiding it, which is the whole point of this test.
      const namespace = (group ?? "").split(".").filter(Boolean).map(camel);
      const action = camel(op.operationId.replace("public-api.v1.", "").split(".").pop()!);
      const params = op.parameters ?? [];
      const queryNames = new Set(params.filter((p) => p.in === "query").map((p) => p.name));
      const contentTypes: string[] = [];
      for (const response of Object.values(op.responses ?? {})) {
        contentTypes.push(...Object.keys(response.content ?? {}));
      }
      out.push({
        methodPath: [...namespace, action].join("."),
        namespace,
        action,
        operationId: op.operationId,
        method: method.toUpperCase(),
        path,
        pathParams: params.filter((p) => p.in === "path").map((p) => p.name),
        cursorParam: queryNames.has("starting_after")
          ? "starting_after"
          : queryNames.has("cursor")
            ? "cursor"
            : null,
        isBinary: contentTypes.some(
          (ct) => ct.includes("pdf") || ct.includes("octet-stream") || ct.includes("zip"),
        ),
        declaresIdempotencyKey: params.some(
          (p) => p.in === "header" && p.name.toLowerCase() === "idempotency-key",
        ),
        irreversible: op["x-irreversible"] === true,
        tags: op.tags ?? [],
      });
    }
  }
  return out;
}

/** The namespace tree the SDK actually exposes, instantiated and walked. */
function resourceTree(): Record<string, BaseResource> {
  return createResources(testClient().http) as unknown as Record<string, BaseResource>;
}

function collectMethods(prefix: string, node: BaseResource, out: Set<string>): void {
  const proto = Object.getPrototypeOf(node) as object;
  for (const name of Object.getOwnPropertyNames(proto)) {
    if (name === "constructor") continue;
    const descriptor = Object.getOwnPropertyDescriptor(proto, name);
    if (descriptor && typeof descriptor.value === "function") {
      out.add(prefix === "" ? name : `${prefix}.${name}`);
    }
  }
  for (const [key, value] of Object.entries(node)) {
    if (value instanceof BaseResource) {
      collectMethods(prefix === "" ? key : `${prefix}.${key}`, value, out);
    }
  }
}

function publicMethodPaths(): Set<string> {
  const out = new Set<string>();
  for (const [namespace, resource] of Object.entries(resourceTree())) {
    collectMethods(namespace, resource, out);
  }
  return out;
}

/** Resolves a dotted namespace path to its resource instance, or `null`. */
function resolveNamespace(segments: string[]): BaseResource | null {
  let node: BaseResource | undefined = resourceTree()[segments[0]!];
  for (const segment of segments.slice(1)) {
    if (node === undefined) return null;
    const child = (node as unknown as Record<string, unknown>)[segment];
    if (!(child instanceof BaseResource)) return null;
    node = child;
  }
  return node ?? null;
}

// ---------------------------------------------------------------------------
// The ERP universe of this wave, read from the frozen inventory of §1 (1.6/1.7)
// rather than re-derived, so the test measures the same 166 operations the
// wave declares. Tag names are the contract's own.
// ---------------------------------------------------------------------------

/** Tags introduced by the ERP wave (1.6-tags-erp.json, measured 2026-09-18). */
const ERP_TAGS = [
  "Sales Orders",
  "Purchase Orders",
  "Goods Receipts",
  "Warehouses",
  "Stock Transfers",
  "Stock Reservations",
  "Stock Availability",
  "Carriers",
  "Returns",
  "Storefront",
  "Storefront Credentials",
] as const;

/**
 * ERP operations that landed on tags that already existed (1.7, 22 of them).
 * Enumerated by operationId because their tag alone does not identify them.
 */
const ERP_OPERATIONS_ON_PREEXISTING_TAGS = [
  "public-api.v1.delivery_notes.fulfilment_status.transition",
  "public-api.v1.delivery_notes.fulfilment_statuses",
  "public-api.v1.delivery_notes.packages.create",
  "public-api.v1.delivery_notes.packages.delete",
  "public-api.v1.delivery_notes.packages.list",
  "public-api.v1.delivery_notes.packages.update",
  "public-api.v1.delivery_notes.packing_list",
  "public-api.v1.delivery_notes.picking_lines.pick",
  "public-api.v1.delivery_notes.picking_list.open",
  "public-api.v1.delivery_notes.picking_list.pdf",
  "public-api.v1.delivery_notes.picking_list.show",
  "public-api.v1.delivery_notes.picking_queue.list",
  "public-api.v1.delivery_notes.shipment.show",
  "public-api.v1.delivery_notes.shipment.update",
  "public-api.v1.delivery_notes.shipping_label",
  "public-api.v1.proformas.convert_to_sales_order",
  "public-api.v1.purchase_invoices.match.accept",
  "public-api.v1.purchase_invoices.match.link",
  "public-api.v1.purchase_invoices.match.reject",
  "public-api.v1.quotes.convert_to_sales_order",
  "public-api.v1.stores.product_links.list",
  "public-api.v1.stores.product_links.show",
] as const;

function isErp(op: ContractOperation): boolean {
  return (
    op.tags.some((tag) => (ERP_TAGS as readonly string[]).includes(tag)) ||
    (ERP_OPERATIONS_ON_PREEXISTING_TAGS as readonly string[]).includes(op.operationId)
  );
}

const SPEC = pinnedSpec();
const OPERATIONS = contractOperations(SPEC);
const ERP_OPERATIONS = OPERATIONS.filter(isErp);

useMockServer();

// ---------------------------------------------------------------------------
// 5.8 / 5.9 — the two-way diff
// ---------------------------------------------------------------------------

describe("superficie pública del SDK contra el contrato fijado", () => {
  it("declara la misma cifra de operaciones que el contrato congelado de la ola", () => {
    // Guard on the fixture itself: if the pinned copy is not the frozen
    // contract, every other assertion in this file is measuring the wrong
    // document. 654 operations over 532 paths, measured 2026-09-18.
    expect(OPERATIONS).toHaveLength(654);
    expect(Object.keys(SPEC.paths)).toHaveLength(532);
  });

  it("no publica ningún método sin operación detrás (superficie inventada)", () => {
    const declared = new Set(OPERATIONS.map((op) => op.methodPath));
    const extra = [...publicMethodPaths()].filter((m) => !declared.has(m)).sort();
    expect(
      extra,
      `El SDK publica ${extra.length} método(s) que el contrato fijado NO declara. ` +
        `Cada uno es superficie inventada: el consumidor la llama y el servidor responde 404. ` +
        `Sobrantes:\n  ${extra.join("\n  ")}`,
    ).toEqual([]);
  });

  it("no pierde ninguna operación del contrato (superficie perdida)", () => {
    const published = publicMethodPaths();
    const missing = OPERATIONS.filter((op) => !published.has(op.methodPath))
      .map((op) => `${op.methodPath}  (${op.method} ${op.path}, ${op.operationId})`)
      .sort();
    expect(
      missing,
      `El contrato fijado declara ${missing.length} operación(es) que el SDK no publica. ` +
        `\`tsc --noEmit\` y \`tsup\` pasan igual con esta superficie perdida: esta comparación ` +
        `es lo único que la caza. Ausentes:\n  ${missing.join("\n  ")}`,
    ).toEqual([]);
  });

  it("el diff sale vacío en las DOS direcciones sobre el mismo recuento", () => {
    const published = [...publicMethodPaths()].sort();
    const declared = [...new Set(OPERATIONS.map((op) => op.methodPath))].sort();
    expect(published).toEqual(declared);
    expect(published).toHaveLength(654);
  });

  it("cada familia del contrato tiene su fichero de recurso instanciado", () => {
    const tops = new Set(OPERATIONS.map((op) => op.namespace[0]!));
    const registry = resourceTree();
    const missing = [...tops].filter((top) => !(registry[top] instanceof BaseResource)).sort();
    expect(missing, `Familias del contrato sin recurso: ${missing.join(", ")}`).toEqual([]);
    expect(tops.size).toBe(62); // 49 antes de la ola + 13 de la ola (medido 2026-09-18)
  });
});

// ---------------------------------------------------------------------------
// 5.10 — nesting of the ERP sub-resources
// ---------------------------------------------------------------------------

describe("anidamiento de los sub-recursos del ERP", () => {
  it("cada grupo ERP se anida en el SDK en el mismo número de niveles que declara", () => {
    const wrong: string[] = [];
    for (const op of ERP_OPERATIONS) {
      const namespace = resolveNamespace(op.namespace);
      if (namespace === null) {
        wrong.push(`${op.namespace.join(".")} no existe como espacio de nombres`);
        continue;
      }
      // The method must live on THAT node, not on an ancestor flattened one.
      const proto = Object.getPrototypeOf(namespace) as object;
      if (typeof (proto as Record<string, unknown>)[op.action] !== "function") {
        wrong.push(`${op.methodPath} no está en el nodo de profundidad ${op.namespace.length}`);
      }
    }
    expect(wrong, `Anidamiento distinto del declarado:\n  ${wrong.join("\n  ")}`).toEqual([]);
  });

  it("ningún sub-recurso ERP colisiona con un método de su padre", () => {
    const collisions: string[] = [];
    for (const op of ERP_OPERATIONS) {
      if (op.namespace.length < 2) continue;
      const parentSegments = op.namespace.slice(0, -1);
      const childName = op.namespace[op.namespace.length - 1]!;
      const parent = resolveNamespace(parentSegments);
      if (parent === null) continue;
      const parentProto = Object.getPrototypeOf(parent) as object;
      if (typeof (parentProto as Record<string, unknown>)[childName] === "function") {
        collisions.push(`${parentSegments.join(".")}.${childName}`);
      }
    }
    expect(
      [...new Set(collisions)].sort(),
      `Un sub-recurso pisa un método de su padre: el campo gana y el método desaparece en silencio.`,
    ).toEqual([]);
  });

  it("los sub-recursos de tres niveles del ERP existen a tres niveles", () => {
    // Medido 2026-09-18 sobre el contrato congelado: CINCO grupos ERP anidan a
    // tres niveles. El generador de recursos ya los soporta (el precedente vivo
    // es `automations.rules.versions`), así que el SDK no los aplana — pero la
    // task 5.4 pide reportarlos al backend, no parchearlos aquí.
    const threeLevel = [...new Set(ERP_OPERATIONS.filter((op) => op.namespace.length === 3).map((op) => op.namespace.join(".")))].sort();
    expect(threeLevel).toEqual([
      "storefront.orders.buyerIdentity",
      "storefront.products.images",
      "storefront.products.options",
      "storefront.products.presentations",
      "storefront.products.variants",
    ]);
    for (const group of threeLevel) {
      expect(resolveNamespace(group.split(".")), group).toBeInstanceOf(BaseResource);
    }
  });
});

// ---------------------------------------------------------------------------
// 5.11 — automatic idempotency key
// ---------------------------------------------------------------------------

/** Calls a generated method with placeholder path params. */
async function invoke(op: ContractOperation, extra: unknown[] = []): Promise<unknown> {
  const namespace = resolveNamespace(op.namespace);
  if (namespace === null) throw new Error(`namespace ${op.namespace.join(".")} not found`);
  const fn = (namespace as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>)[op.action];
  if (typeof fn !== "function") throw new Error(`method ${op.methodPath} not found`);
  const args = op.pathParams.map((_, index) => `p${index + 1}`);
  return fn.call(namespace, ...args, ...extra);
}

/** Substitutes the placeholder path params into the path template for MSW. */
function concretePath(op: ContractOperation): string {
  let index = 0;
  return op.path.replace(/\{[^}]+\}/g, () => `p${++index}`);
}

describe("clave de idempotencia automática en las operaciones del ERP", () => {
  const keyedPosts = ERP_OPERATIONS.filter(
    (op) => op.method === "POST" && op.declaresIdempotencyKey,
  );
  const readOnly = ERP_OPERATIONS.filter((op) => op.method === "GET");

  it("toda operación ERP marcada como irreversible declara la cabecera, y ninguna lectura", () => {
    // `x-irreversible` del contrato (comprobado contra el inventario 1.7: las
    // 166 operaciones ERP coinciden, 0 discrepancias, 2026-09-18). 41 son
    // irreversibles — 34 POST y 7 DELETE — y las 41 declaran `Idempotency-Key`.
    const irreversible = ERP_OPERATIONS.filter((op) => op.irreversible);
    expect(irreversible).toHaveLength(41);
    expect(irreversible.filter((op) => op.method === "POST")).toHaveLength(34);
    expect(irreversible.filter((op) => op.method === "DELETE")).toHaveLength(7);
    expect(
      irreversible.filter((op) => !op.declaresIdempotencyKey).map((op) => op.operationId),
      "Una operación irreversible sin `Idempotency-Key` en el contrato no se puede reintentar sin " +
        "duplicar: el hueco es del backend, no del SDK.",
    ).toEqual([]);
    expect(irreversible.filter((op) => op.method === "GET")).toHaveLength(0);
    // Ninguna operación de sólo lectura del ERP la declara.
    expect(ERP_OPERATIONS.filter((op) => op.method === "GET" && op.declaresIdempotencyKey)).toHaveLength(0);
    expect(keyedPosts).toHaveLength(37); // 34 irreversibles + 3 POST reintentables
  });

  it("toda escritura POST del ERP que declara la cabecera la recibe automáticamente", async () => {
    const withoutKey: string[] = [];
    for (const op of keyedPosts) {
      let key: string | null = null;
      server.use(
        http.post(`${BASE_URL}${concretePath(op)}`, ({ request }) => {
          key = request.headers.get("idempotency-key");
          return HttpResponse.json({ object: "ok" });
        }),
      );
      await invoke(op, op.isBinary ? [undefined, undefined] : []);
      if (key === null) withoutKey.push(`${op.methodPath} (${op.method} ${op.path})`);
      server.resetHandlers();
    }
    expect(
      withoutKey,
      `Escrituras del ERP emitidas SIN \`Idempotency-Key\`: un reintento del cliente duplicaría ` +
        `el pedido, el traspaso o la devolución.\n  ${withoutKey.join("\n  ")}`,
    ).toEqual([]);
  });

  it("ninguna lectura del ERP recibe la clave de idempotencia", async () => {
    const withKey: string[] = [];
    for (const op of readOnly) {
      let key: string | null = "unset";
      server.use(
        http.get(`${BASE_URL}${concretePath(op)}`, ({ request }) => {
          key = request.headers.get("idempotency-key");
          return op.isBinary
            ? HttpResponse.arrayBuffer(new Uint8Array([0x25, 0x50]).buffer as ArrayBuffer, {
                headers: { "Content-Type": "application/pdf" },
              })
            : HttpResponse.json(
                op.cursorParam ? { data: [], has_more: false, next_cursor: null } : { object: "ok" },
              );
        }),
      );
      await invoke(op);
      if (key !== null) withKey.push(`${op.methodPath} -> ${String(key)}`);
      server.resetHandlers();
    }
    expect(
      withKey,
      `Lecturas del ERP que viajan con \`Idempotency-Key\`: la clave sólo tiene sentido en una ` +
        `escritura y aquí sólo sirve para romper la caché del borde.\n  ${withKey.join("\n  ")}`,
    ).toEqual([]);
    expect(readOnly.length).toBe(69);
  });

  it("DECLARA el hueco medido: los borrados irreversibles del ERP no reciben clave automática", async () => {
    // HUECO DECLARADO (E-DEV5-2, 2026-09-18) — NO es una excusa, es la cifra.
    // `src/core/http-client.ts` sólo genera la clave automática para POST
    // (`METHODS_WITH_IDEMPOTENCY`), y `src/core/` es la capa a mano que esta
    // fase NO toca. El contrato congelado declara `Idempotency-Key` en 30
    // DELETE y 3 PUT además de los 132 POST; siete de esos DELETE son del ERP
    // y los SIETE son irreversibles. El consumidor puede pasarla a mano
    // (`config.idempotencyKey`, comprobado abajo), pero la automática no llega.
    // Cuando se cierre el hueco, esta lista queda VACÍA y el test se pone rojo:
    // actualízala entonces, no la silencies.
    const gap = ERP_OPERATIONS.filter(
      (op) => op.declaresIdempotencyKey && op.method !== "POST",
    );
    for (const op of gap) {
      let auto: string | null = "unset";
      let manual: string | null = "unset";
      server.use(
        http.delete(`${BASE_URL}${concretePath(op)}`, ({ request }) => {
          const seen = request.headers.get("idempotency-key");
          if (auto === "unset") auto = seen;
          else manual = seen;
          return HttpResponse.json({ object: "ok" });
        }),
      );
      await invoke(op);
      await invoke(op, [{ idempotencyKey: "idem_manual" }]);
      expect(auto, `${op.methodPath} ya recibe clave automática`).toBeNull();
      expect(manual, `${op.methodPath} ignora la clave manual`).toBe("idem_manual");
      server.resetHandlers();
    }
    expect(gap.map((op) => `${op.method} ${op.path}`).sort()).toEqual([
      "DELETE /companies/{company}/carriers/{carrier}",
      "DELETE /companies/{company}/delivery-notes/{delivery_note}/packages/{package}",
      "DELETE /companies/{company}/purchase-orders/{purchase_order}",
      "DELETE /companies/{company}/returns/{return}",
      "DELETE /companies/{company}/sales-orders/{sales_order}",
      "DELETE /companies/{company}/warehouses/{warehouse}",
      "DELETE /companies/{company}/warehouses/{warehouse}/locations/{location}",
    ]);
  });
});

// ---------------------------------------------------------------------------
// 5.12 — binary downloads
// ---------------------------------------------------------------------------

describe("descargas binarias del ERP", () => {
  const binaries = ERP_OPERATIONS.filter((op) => op.isBinary);

  it("las SEIS descargas del ERP están declaradas como binarias en el contrato", () => {
    // §1 cerró E-DEV1-2 declarando las cabeceras de las seis; si alguna
    // perdiera su `application/pdf`, el generador emitiría un método que
    // devuelve `unknown` (JSON) y el PDF llegaría como cadena rota.
    expect(binaries.map((op) => op.operationId).sort()).toEqual([
      "public-api.v1.delivery_notes.packing_list",
      "public-api.v1.delivery_notes.picking_list.pdf",
      "public-api.v1.delivery_notes.shipping_label",
      "public-api.v1.purchase_orders.pdf",
      "public-api.v1.sales_orders.pdf",
      "public-api.v1.stock_transfers.pdf",
    ]);
  });

  it("devuelven el tipo binario del SDK y no una cadena", async () => {
    const wrong: string[] = [];
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"
    for (const op of binaries) {
      server.use(
        http.get(`${BASE_URL}${concretePath(op)}`, () =>
          HttpResponse.arrayBuffer(bytes.buffer as ArrayBuffer, {
            headers: { "Content-Type": "application/pdf", "X-Request-Id": "req_bin" },
          }),
        ),
      );
      const result = (await invoke(op)) as {
        body?: unknown;
        contentType?: unknown;
        toBuffer?: unknown;
      };
      if (
        typeof result !== "object" ||
        result === null ||
        !(result.body instanceof ArrayBuffer) ||
        result.contentType !== "application/pdf" ||
        typeof result.toBuffer !== "function"
      ) {
        wrong.push(`${op.methodPath} -> ${typeof result}`);
      } else {
        expect(Buffer.from(result.body).subarray(0, 5).toString("latin1")).toBe("%PDF-");
      }
      server.resetHandlers();
    }
    expect(
      wrong,
      `Descargas que no devuelven \`BinaryResponse\`: síntoma de una declaración binaria ausente ` +
        `en el contrato (1.20).\n  ${wrong.join("\n  ")}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5.13 — cursor pagination
// ---------------------------------------------------------------------------

describe("paginación por cursor de los listados del ERP", () => {
  const paginated = ERP_OPERATIONS.filter((op) => op.cursorParam !== null);

  it("los quince listados ERP con cursor lo declaran con el nombre del contrato", () => {
    expect(paginated).toHaveLength(15);
    expect([...new Set(paginated.map((op) => op.cursorParam))]).toEqual(["starting_after"]);
  });

  it("se exponen por el iterador del SDK y avanzan con el nombre del contrato", async () => {
    const wrong: string[] = [];
    for (const op of paginated) {
      const seen: string[] = [];
      server.use(
        http.get(`${BASE_URL}${concretePath(op)}`, ({ request }) => {
          const url = new URL(request.url);
          const cursor = url.searchParams.get(op.cursorParam!);
          seen.push(cursor ?? "");
          return HttpResponse.json(
            cursor === null
              ? { data: [{ id: "a" }], has_more: true, next_cursor: "cur_2" }
              : { data: [{ id: "b" }], has_more: false, next_cursor: null },
          );
        }),
      );
      const page = (await invoke(op)) as Page<{ id: string }>;
      if (!(page instanceof Page)) {
        wrong.push(`${op.methodPath} no devuelve Page`);
        server.resetHandlers();
        continue;
      }
      const all = await page.toArray();
      if (all.length !== 2 || seen.length !== 2 || seen[1] !== "cur_2") {
        wrong.push(`${op.methodPath} no avanzó por \`${op.cursorParam}\` (vio ${JSON.stringify(seen)})`);
      }
      server.resetHandlers();
    }
    expect(
      wrong,
      `Listados del ERP que no paginan por el nombre del contrato:\n  ${wrong.join("\n  ")}`,
    ).toEqual([]);
  });

  it("no inventa paginación donde el contrato no declara cursor", () => {
    // Trece colecciones anidadas del ERP (`…lines.list`, `…variants.list`, …)
    // no declaran cursor: el SDK debe devolverlas enteras, no envolverlas en un
    // iterador que pediría una página siguiente que el servidor no sirve.
    const noCursor = ERP_OPERATIONS.filter(
      (op) => op.action === "list" && op.cursorParam === null,
    ).map((op) => op.methodPath);
    expect(noCursor.sort()).toEqual([
      "deliveryNotes.packages.list",
      "goodsReceipts.lines.list",
      "purchaseOrders.lines.list",
      "purchaseReorderSuggestions.list",
      "returns.correctiveCandidates.list",
      "salesOrders.lines.list",
      "stockAvailability.commitments.list",
      "stockTransfers.lines.list",
      "storefront.categories.list",
      "storefront.products.images.list",
      "storefront.products.options.list",
      "storefront.products.presentations.list",
      "storefront.products.variants.list",
    ]);
  });
});

// ---------------------------------------------------------------------------
// Cableado del cliente — hueco medido que la reconciliación de §14 encontrará
// ---------------------------------------------------------------------------

describe("cableado de los espacios de nombres en el cliente público", () => {
  it("`Factuarea` cablea los 62 espacios de nombres que `createResources()` construye", () => {
    // HUECO CERRADO por §6 (task 6.27, 2026-09-18). `src/client.ts` enumeraba
    // sus campos a mano y se había quedado en 17 de 62 —45 inalcanzables,
    // entre ellos los TRECE del ERP: el comerciante no podía escribir
    // `factuarea.salesOrders.list(...)`—. Ahora la clase extiende la interfaz
    // del registro (`ResourceNamespaces`) y asigna en bloque lo que
    // `createResources()` construye, así que la lista no puede volver a
    // desfasarse. Si esto se pone rojo, alguien volvió a enumerar a mano:
    // arréglalo en `src/client.ts`, no aquí.
    const wired = Object.entries(testClient()).filter(([, v]) => v instanceof BaseResource);
    const all = Object.keys(resourceTree());
    const unreachable = all.filter((name) => !wired.some(([field]) => field === name)).sort();

    expect(all).toHaveLength(62);
    expect(wired).toHaveLength(62);
    expect(unreachable, `Espacios de nombres inalcanzables: ${unreachable.join(", ")}`).toEqual([]);

    const client = testClient() as unknown as Record<string, unknown>;
    expect(
      [
        "carriers",
        "contacts",
        "goodsReceipts",
        "purchaseOrders",
        "purchaseReorderSuggestions",
        "returns",
        "salesOrders",
        "stockAvailability",
        "stockReservations",
        "stockTransfers",
        "storefront",
        "storefrontKeys",
        "warehouses",
      ].filter((name) => client[name] instanceof BaseResource),
      `Los TRECE recursos del ERP tienen que ser alcanzables desde \`new Factuarea(...)\`.`,
    ).toHaveLength(13);
  });
});
