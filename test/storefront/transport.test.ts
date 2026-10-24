import { describe, expect, it } from "vitest";
import {
  CREDENTIAL_HEADER,
  STOREFRONT_ALLOWED_REQUEST_HEADERS,
  StorefrontTransport,
} from "../../src/storefront/transport.js";
import {
  StorefrontAuthenticationError,
  StorefrontRateLimitError,
  StorefrontValidationError,
} from "../../src/storefront/errors.js";
import { FactuareaStorefront } from "../../src/storefront/index.js";

/**
 * Task 6.20 — la clave de idempotencia se adjunta en las mutantes y no en las
 * lecturas, las peticiones salen sin credenciales de navegador y el retroceso
 * respeta la cabecera de espera.
 *
 * El doble de `fetch` captura el `RequestInit` REAL, que es donde vive
 * `credentials`: ningún servidor simulado puede afirmar que el navegador no
 * mandó la cookie, porque esa decisión la toma el `fetch` del navegador a
 * partir de esa opción.
 */

const PUBLISHABLE = "sf_pk_abcdef0123456789ABCDEFGH";
const COMPANY = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b";
const BASE_URL = "https://api.factuarea.test/v1";

interface Call {
  url: string;
  init: RequestInit;
  headers: Record<string, string>;
}

function recorder(queue: Array<() => Response>): { fetch: typeof fetch; calls: Call[] } {
  const calls: Call[] = [];
  const impl = async (input: unknown, init?: RequestInit): Promise<Response> => {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries((init?.headers ?? {}) as Record<string, string>)) {
      headers[key.toLowerCase()] = value;
    }
    calls.push({ url: String(input), init: init ?? {}, headers });
    const next = queue.shift();
    if (next === undefined) {
      throw new Error(`Petición inesperada nº ${calls.length}: ${String(input)}`);
    }
    return next();
  };
  return { fetch: impl as unknown as typeof fetch, calls };
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function transport(
  queue: Array<() => Response>,
  overrides: Record<string, unknown> = {},
): { transport: StorefrontTransport; calls: Call[]; slept: number[] } {
  const { fetch: fetchImpl, calls } = recorder(queue);
  const slept: number[] = [];
  const instance = new StorefrontTransport({
    publishableKey: PUBLISHABLE,
    baseUrl: BASE_URL,
    fetch: fetchImpl,
    sleep: async (ms: number) => {
      slept.push(ms);
    },
    random: () => 1,
    ...overrides,
  });
  return { transport: instance, calls, slept };
}

describe("la clave de idempotencia se adjunta sólo a las operaciones mutantes", () => {
  it("no viaja en una lectura", async () => {
    const { transport: t, calls } = transport([() => json({ data: [] })]);
    await t.request({ method: "GET", path: "/companies/c/storefront/products" });
    expect(calls[0]!.headers["idempotency-key"]).toBeUndefined();
  });

  for (const method of ["POST", "PATCH", "DELETE"] as const) {
    it(`viaja en ${method} y es un UUID`, async () => {
      const { transport: t, calls } = transport([() => json({ data: {} })]);
      await t.request({ method, path: "/companies/c/storefront/orders", body: { a: 1 } });
      expect(calls[0]!.headers["idempotency-key"]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    });
  }

  it("la clave explícita gana y se reutiliza en TODOS los reintentos", async () => {
    const { transport: t, calls } = transport([
      () => json({ error: { code: "server_error" } }, 503),
      () => json({ data: {} }),
    ]);
    await t.request({
      method: "POST",
      path: "/companies/c/storefront/orders",
      body: {},
      idempotencyKey: "order-4711",
    });
    expect(calls).toHaveLength(2);
    expect(calls[0]!.headers["idempotency-key"]).toBe("order-4711");
    expect(calls[1]!.headers["idempotency-key"]).toBe("order-4711");
  });

  it("la clave automática también se reutiliza entre reintentos", async () => {
    const { transport: t, calls } = transport([
      () => json({ error: { code: "server_error" } }, 500),
      () => json({ data: {} }),
    ]);
    await t.request({ method: "POST", path: "/companies/c/storefront/orders", body: {} });
    expect(calls[0]!.headers["idempotency-key"]).toBe(calls[1]!.headers["idempotency-key"]);
  });
});

describe("las peticiones se emiten sin credenciales de navegador", () => {
  it("declara `credentials: omit` en cada intento", async () => {
    const { transport: t, calls } = transport([
      () => json({ error: {} }, 500),
      () => json({ data: {} }),
    ]);
    await t.request({ method: "GET", path: "/companies/c/storefront/categories" });
    expect(calls.map((c) => c.init.credentials)).toEqual(["omit", "omit"]);
  });

  it("la credencial viaja en la cabecera propia y nunca como portador", async () => {
    const { transport: t, calls } = transport([() => json({ data: {} })]);
    await t.request({ method: "GET", path: "/companies/c/storefront/categories" });
    expect(calls[0]!.headers[CREDENTIAL_HEADER.toLowerCase()]).toBe(PUBLISHABLE);
    expect(calls[0]!.headers["authorization"]).toBeUndefined();
    expect(calls[0]!.headers["cookie"]).toBeUndefined();
  });

  it("no envía ninguna cabecera fuera de la lista que la comprobación previa permite", async () => {
    const { transport: t, calls } = transport([() => json({ data: {} })]);
    await t.request({ method: "POST", path: "/companies/c/storefront/orders", body: {} });
    const allowed = STOREFRONT_ALLOWED_REQUEST_HEADERS.map((h) => h.toLowerCase());
    const sent = Object.keys(calls[0]!.headers);
    expect(sent.filter((h) => !allowed.includes(h))).toEqual([]);
    // Las dos que el cliente de SERVIDOR sí manda y aquí romperían el preflight.
    expect(sent).not.toContain("factuarea-version");
    expect(sent).not.toContain("user-agent");
  });
});

describe("el retroceso respeta la cabecera de espera", () => {
  it("espera exactamente lo que dice `Retry-After` en segundos", async () => {
    const { transport: t, slept } = transport([
      () => json({ error: { code: "rate_limit_exceeded" } }, 429, { "retry-after": "2" }),
      () => json({ data: {} }),
    ]);
    await t.request({ method: "GET", path: "/companies/c/storefront/products" });
    expect(slept).toEqual([2000]);
  });

  it("sin cabecera de espera usa el retroceso exponencial con tope", async () => {
    const { transport: t, slept } = transport([
      () => json({ error: {} }, 503),
      () => json({ error: {} }, 503),
      () => json({ data: {} }),
    ]);
    await t.request({ method: "GET", path: "/companies/c/storefront/products" });
    expect(slept).toEqual([500, 1000]);
  });

  it("no reintenta un 422: es determinista", async () => {
    const { transport: t, calls } = transport([
      () => json({ error: { code: "parameter_invalid", request_id: "req_1" } }, 422),
    ]);
    await expect(
      t.request({ method: "POST", path: "/companies/c/storefront/orders", body: {} }),
    ).rejects.toBeInstanceOf(StorefrontValidationError);
    expect(calls).toHaveLength(1);
  });

  it("agotados los reintentos lanza el error tipado con `retryAfter`", async () => {
    const { transport: t } = transport(
      [
        () => json({ error: { code: "rate_limit_exceeded" } }, 429, { "retry-after": "1" }),
        () => json({ error: { code: "rate_limit_exceeded" } }, 429, { "retry-after": "1" }),
      ],
      { maxRetries: 1 },
    );
    const error = (await t
      .request({ method: "GET", path: "/companies/c/storefront/products" })
      .catch((e: unknown) => e)) as StorefrontRateLimitError;
    expect(error).toBeInstanceOf(StorefrontRateLimitError);
    expect(error.retryAfter).toBe(1);
    expect(error.code).toBe("rate_limit_exceeded");
  });
});

describe("el sobre de error del contrato se traduce a errores tipados", () => {
  it("expone el código y el identificador de petición, no el texto", async () => {
    const { transport: t } = transport([
      () =>
        json(
          {
            error: {
              type: "authentication_error",
              code: "storefront_origin_not_allowed",
              message: "El origen no está declarado.",
              request_id: "req_01HKQS5NGS8Z3T6Q1D2E7FYVSI",
            },
          },
          401,
        ),
    ]);
    const error = (await t
      .request({ method: "GET", path: "/companies/c/storefront/products" })
      .catch((e: unknown) => e)) as StorefrontAuthenticationError;

    expect(error).toBeInstanceOf(StorefrontAuthenticationError);
    expect(error.code).toBe("storefront_origin_not_allowed");
    expect(error.requestId).toBe("req_01HKQS5NGS8Z3T6Q1D2E7FYVSI");
    expect(error.status).toBe(401);
    expect(error.type).toBe("authentication_error");
  });

  it("cae al identificador de la cabecera expuesta cuando el cuerpo no lo trae", async () => {
    const { transport: t } = transport([
      () => json({ error: { code: "not_found" } }, 404, { "x-request-id": "req_header" }),
    ]);
    const error = (await t
      .request({ method: "GET", path: "/companies/c/storefront/orders/1" })
      .catch((e: unknown) => e)) as StorefrontAuthenticationError;
    expect(error.requestId).toBe("req_header");
  });
});

describe("el cliente compone el eje de empresa y pagina con cursor", () => {
  it("interpola la empresa fijada en la construcción", async () => {
    const { fetch: fetchImpl, calls } = recorder([() => json({ data: [], has_more: false })]);
    const client = new FactuareaStorefront({
      publishableKey: PUBLISHABLE,
      company: COMPANY,
      baseUrl: BASE_URL,
      fetch: fetchImpl,
    });
    await client.products.list({ limit: 2 });
    expect(calls[0]!.url).toBe(`${BASE_URL}/companies/${COMPANY}/storefront/products?limit=2`);
  });

  it("recorre las páginas con `starting_after`", async () => {
    const { fetch: fetchImpl, calls } = recorder([
      () => json({ data: [{ id: "p1" }], has_more: true, next_cursor: "cur_1" }),
      () => json({ data: [{ id: "p2" }], has_more: false, next_cursor: null }),
    ]);
    const client = new FactuareaStorefront({
      publishableKey: PUBLISHABLE,
      company: COMPANY,
      baseUrl: BASE_URL,
      fetch: fetchImpl,
    });
    const page = await client.products.list();
    const all = await page.toArray();
    expect(all).toHaveLength(2);
    expect(calls[1]!.url).toContain("starting_after=cur_1");
  });
});
