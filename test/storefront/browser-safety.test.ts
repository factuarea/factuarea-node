import { builtinModules } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { importGraph } from "./importGraph.js";

/**
 * Task 6.21 — ningún módulo bajo `src/storefront/` importa un módulo propio de
 * Node, comprobado sobre el árbol de imports RESUELTO.
 *
 * Por qué el árbol y no un grep: el riesgo real no es escribir el nombre de un
 * módulo de Node en `src/storefront/`, es importar una pieza de `src/core/` que
 * lo hace por ti. Medido hoy: el transporte de servidor arrastra el módulo de
 * criptografía de Node en su primera línea y el empaquetado apunta a Node
 * (design.md D7). Un grep de la carpeta no vería nada; el cierre transitivo sí.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const entry = join(root, "src", "storefront", "index.ts");
const graph = importGraph(entry);

const NODE_BUILTINS = new Set([
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
]);

describe("el punto de entrada de navegador no arrastra nada del entorno de servidor", () => {
  it("su cierre de imports vive ENTERO bajo `src/storefront/`", () => {
    const outside = graph.files
      .map((f) => relative(root, f))
      .filter((f) => !f.startsWith(join("src", "storefront")))
      .sort();
    expect(outside, `Ficheros fuera del punto de entrada: ${outside.join(", ")}`).toEqual([]);
  });

  it("no alcanza NINGÚN módulo propio de Node, ni directa ni indirectamente", () => {
    const offenders = [...graph.external.entries()]
      .filter(([specifier]) => NODE_BUILTINS.has(specifier))
      .map(([specifier, files]) => `${specifier} ← ${files.map((f) => relative(root, f)).join(", ")}`)
      .sort();
    expect(offenders, `Módulos de Node alcanzados: ${offenders.join(" | ")}`).toEqual([]);
  });

  it("no alcanza NINGUNA dependencia externa en absoluto", () => {
    expect([...graph.external.keys()].sort()).toEqual([]);
  });

  it("cubre los once módulos del paquete de navegador", () => {
    expect(graph.files.map((f) => relative(root, f)).sort()).toEqual(
      [
        "availability",
        "cart",
        "catalog",
        "checkout",
        "credential",
        "errors",
        "idempotency",
        "index",
        "orders",
        "pricing",
        "transport",
      ].map((name) => join("src", "storefront", `${name}.ts`)),
    );
  });
});

describe("el cierre del cliente de SERVIDOR no arrastra el del comprador", () => {
  it("`src/index.ts` no alcanza ningún fichero de `src/storefront/`", () => {
    const serverGraph = importGraph(join(root, "src", "index.ts"));
    const leaked = serverGraph.files
      .map((f) => relative(root, f))
      .filter((f) => f.startsWith(join("src", "storefront")));
    expect(leaked, `El cliente de servidor arrastra: ${leaked.join(", ")}`).toEqual([]);
  });

  it("y el del comprador NO alcanza `src/client.ts` ni `src/resources/`", () => {
    const reachable = graph.files.map((f) => relative(root, f));
    expect(reachable.filter((f) => f === join("src", "client.ts"))).toEqual([]);
    expect(reachable.filter((f) => f.startsWith(join("src", "resources")))).toEqual([]);
    expect(reachable.filter((f) => f.startsWith(join("src", "core")))).toEqual([]);
  });
});
