import { describe, expect, it } from "vitest";
import {
  INTEGRATOR_KEY_PREFIXES,
  PUBLISHABLE_KEY_PATTERN,
  PUBLISHABLE_KEY_PREFIX,
  PUBLISHABLE_KEY_SECRET_BODY_LENGTH,
  assertPublishableStorefrontKey,
} from "../../src/storefront/credential.js";
import { StorefrontCredentialError } from "../../src/storefront/errors.js";
import { FactuareaStorefront } from "../../src/storefront/index.js";

/**
 * Task 6.18 / spec `storefront-browser-sdk` — "Una credencial de integrador se
 * rechaza en la construcción".
 *
 * The point of the guard is the MOMENT: a server key leaked into a web page has
 * to blow up while the developer is looking at it, not on the first shopper's
 * first request in production. So every rejection case here also asserts that
 * NO request was emitted — the `fetch` handed to the client throws if it is
 * ever called.
 */

const PUBLISHABLE = "sf_pk_abcdef0123456789ABCDEFGH";
const COMPANY = "01931b3e-7c4a-7f2e-9a8b-3c5d6e7f8a9b";

function forbiddenFetch(): typeof fetch {
  return (() => {
    throw new Error("La construcción del cliente NO puede emitir ninguna petición.");
  }) as unknown as typeof fetch;
}

describe("la forma de la credencial publicable está congelada por el contrato", () => {
  it("deriva el patrón de las dos constantes medidas en 1.12 (`sf_pk_` + 24 base62)", () => {
    expect(PUBLISHABLE_KEY_PREFIX).toBe("sf_pk_");
    expect(PUBLISHABLE_KEY_SECRET_BODY_LENGTH).toBe(24);
    expect(PUBLISHABLE_KEY_PATTERN.source).toBe("^sf_pk_[0-9A-Za-z]{24}$");
    expect(PUBLISHABLE.slice(PUBLISHABLE_KEY_PREFIX.length)).toHaveLength(
      PUBLISHABLE_KEY_SECRET_BODY_LENGTH,
    );
  });

  it("enumera los dos prefijos del carril de integrador", () => {
    expect([...INTEGRATOR_KEY_PREFIXES]).toEqual(["fact_live_", "fact_test_"]);
  });

  it("acepta el secreto completo y devuelve la misma cadena", () => {
    expect(assertPublishableStorefrontKey(PUBLISHABLE)).toBe(PUBLISHABLE);
  });

  it("rechaza el prefijo VISIBLE de 8 caracteres: no es el secreto", () => {
    expect(() => assertPublishableStorefrontKey("sf_pk_abcdef01")).toThrowError(
      StorefrontCredentialError,
    );
  });
});

describe("el cliente de navegador se construye con la credencial publicable", () => {
  it("queda listo y publica el carril del comprador", () => {
    const client = new FactuareaStorefront({
      publishableKey: PUBLISHABLE,
      company: COMPANY,
      fetch: forbiddenFetch(),
    });

    expect(client.company).toBe(COMPANY);
    expect(typeof client.products.list).toBe("function");
    expect(typeof client.orders.confirmPayment).toBe("function");
    expect(typeof client.orders.buyerIdentity.update).toBe("function");
  });
});

describe("una credencial del carril de integrador se rechaza EN CONSTRUCCIÓN", () => {
  for (const prefix of ["fact_live_", "fact_test_"]) {
    it(`rechaza \`${prefix}…\` sin emitir ninguna petición`, () => {
      let thrown: unknown;
      try {
        new FactuareaStorefront({
          publishableKey: `${prefix}abcdef0123456789ABCDEFGH`,
          company: COMPANY,
          fetch: forbiddenFetch(),
        });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(StorefrontCredentialError);
      const credentialError = thrown as StorefrontCredentialError;
      expect(credentialError.code).toBe("integrator_credential_in_browser");
      expect(credentialError.message).toMatch(/browser/i);
      expect(credentialError.message).toMatch(/sf_pk_/);
      // El secreto JAMÁS viaja en el mensaje de error.
      expect(credentialError.message).not.toContain("abcdef0123456789ABCDEFGH");
    });
  }

  it("rechaza cualquier otra cadena con el error genérico de formato", () => {
    let thrown: unknown;
    try {
      new FactuareaStorefront({
        publishableKey: "pk_live_stripe_looking_key",
        company: COMPANY,
        fetch: forbiddenFetch(),
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(StorefrontCredentialError);
    expect((thrown as StorefrontCredentialError).code).toBe("publishable_key_malformed");
  });

  it("rechaza la credencial ausente o vacía", () => {
    for (const value of ["", "   ", undefined]) {
      let thrown: unknown;
      try {
        new FactuareaStorefront({
          publishableKey: value as unknown as string,
          company: COMPANY,
          fetch: forbiddenFetch(),
        });
      } catch (error) {
        thrown = error;
      }
      expect((thrown as StorefrontCredentialError).code).toBe("publishable_key_missing");
    }
  });

  it("rechaza la empresa ausente: el eje va en la construcción, no en cada llamada", () => {
    expect(
      () =>
        new FactuareaStorefront({
          publishableKey: PUBLISHABLE,
          company: "",
          fetch: forbiddenFetch(),
        }),
    ).toThrowError(/company/i);
  });
});
