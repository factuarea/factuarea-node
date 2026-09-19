import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import tsupConfig from "../../tsup.config.js";
import * as serverEntry from "../../src/index.js";
import * as browserEntry from "../../src/storefront/index.js";

/**
 * Tasks 6.14 / 6.15 / 6.16 / 6.17 — el subpath `./storefront`, su presencia en
 * lo que se publica, la segunda entrada con objetivo de NAVEGADOR y la
 * separación real de los dos puntos de entrada.
 *
 * El `tsup.config.ts` se IMPORTA en vez de leerse como texto: así se comprueba
 * la configuración que el empaquetador va a recibir, no una cadena que podría
 * estar comentada.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

interface PackageJson {
  exports: Record<string, unknown>;
  files: string[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  main: string;
  module: string;
  types: string;
}

function pkg(): PackageJson {
  return JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as PackageJson;
}

interface TsupEntry {
  entry: string[] | Record<string, string>;
  target?: string;
  platform?: string;
  format?: string[];
  clean?: boolean;
  dts?: boolean;
}

function tsupEntries(): TsupEntry[] {
  return tsupConfig as unknown as TsupEntry[];
}

describe("el subpath `./storefront` se publica sin tocar el raíz", () => {
  it("declara importación y requerimiento con sus declaraciones de tipos", () => {
    expect(pkg().exports["./storefront"]).toEqual({
      import: { types: "./dist/storefront.d.ts", default: "./dist/storefront.js" },
      require: { types: "./dist/storefront.d.cts", default: "./dist/storefront.cjs" },
    });
  });

  it("el subpath raíz y los campos heredados quedan intactos", () => {
    const manifest = pkg();
    expect(manifest.exports["."]).toEqual({
      import: { types: "./dist/index.d.ts", default: "./dist/index.js" },
      require: { types: "./dist/index.d.cts", default: "./dist/index.cjs" },
    });
    expect(manifest.exports["./package.json"]).toBe("./package.json");
    expect(manifest.main).toBe("./dist/index.cjs");
    expect(manifest.module).toBe("./dist/index.js");
    expect(manifest.types).toBe("./dist/index.d.ts");
  });

  it("todo lo que el subpath sirve cae dentro de lo publicado (6.15)", () => {
    const published = pkg().files;
    // El artefacto construido y su fuente: `dist` y `src` ya están en la lista,
    // así que `dist/storefront.*` y `src/storefront/**` viajan en el tarball.
    expect(published).toContain("dist");
    expect(published).toContain("src");
    for (const target of Object.values(
      pkg().exports["./storefront"] as Record<string, Record<string, string>>,
    )) {
      for (const file of Object.values(target)) {
        expect(published.some((entry) => file.replace("./", "").startsWith(`${entry}/`))).toBe(true);
      }
    }
  });

  it("el paquete no gana NINGUNA dependencia de ejecución (6.15)", () => {
    expect(pkg().dependencies).toBeUndefined();
    expect(pkg().peerDependencies).toBeUndefined();
  });
});

describe("el empaquetado tiene dos entradas y dos objetivos", () => {
  it("conserva la entrada y el objetivo de Node de la existente", () => {
    const [node] = tsupEntries();
    expect(node!.entry).toEqual(["src/index.ts"]);
    expect(node!.target).toBe("node20");
    expect(node!.clean).toBe(true);
  });

  it("añade la segunda entrada con objetivo de NAVEGADOR", () => {
    const browser = tsupEntries()[1]!;
    expect(browser.entry).toEqual({ storefront: "src/storefront/index.ts" });
    expect(browser.platform).toBe("browser");
    expect(browser.target).not.toBe("node20");
    expect(browser.format).toEqual(["esm", "cjs"]);
    expect(browser.dts).toBe(true);
    // No puede limpiar `dist/`: borraría la salida de la entrada de Node.
    expect(browser.clean).toBe(false);
  });
});

describe("los dos puntos de entrada están separados de verdad (6.17)", () => {
  it("el de servidor no re-exporta nada del de navegador", () => {
    expect(Object.keys(serverEntry)).not.toContain("FactuareaStorefront");
    expect(Object.keys(serverEntry).filter((name) => name.startsWith("Storefront"))).toEqual([]);
  });

  it("el de navegador no re-exporta el cliente de servidor", () => {
    expect(Object.keys(browserEntry)).not.toContain("Factuarea");
    expect(Object.keys(browserEntry)).not.toContain("Webhooks");
    expect(Object.keys(browserEntry)).toContain("FactuareaStorefront");
  });
});
