# Evidencia de release CRM Node — pendiente

Captura local del 2026-10-13 para `crm-node-sdk-delivery` 3.1 (CRM-084).
Identifica dos propietarios Source existentes. No declara una release nueva,
una instalación de sus bytes actuales ni una compatibilidad runtime ejecutada.

| Identidad observada | Fragmento nativo 77 | Generación nativa amplia / recetas comerciales |
| --- | --- | --- |
| Checkout | `repos/factuarea-node` | `development/factuarea-node-servicelevel-native` |
| Rama | `feature/dev-2-crm-node-sdk-native-20261009` | `feature/dev-2-servicelevel-node-native` |
| HEAD local | `13e28b0b6f6dcc4a2af5f92905b46ffd33298290` | `78bebb082357f06b777ba90f97286d02904b6a1c` |
| Package metadata | `@factuarea/sdk` `0.6.0` | `@factuarea/sdk` `0.8.0` |
| Node mínimo declarado | `>=20` | `>=20` |
| Spec | `spec/crm-native77.json` | `spec/openapi.json` |
| SHA-256 spec | `4a2cb151faef526aa8c8fd26c29a1d3f6acd019335e13b058b86671f40eb609f` | `485af6d71fbec443b79e54ef61f27b016b778164b56864ffa967026c29d6bd23` |
| Inventario del spec | 77 operations con `x-crm-operation` | 883 operations totales; 251 con `x-crm-operation` |
| Generación propietaria | `openapi-crm.config.ts`, `scripts/generate-crm.mjs` | `openapi-ts.config.ts`, `scripts/build-resources.mjs` |

Ambos checkouts contienen cambios locales y archivos sin seguimiento. Estos
HEADs son revisiones reales del repositorio, pero no commits de todos los
archivos actuales. Las versiones de metadata no son prueba de publicación o
instalación de esos contratos. No se declara un merge entre los dos grupos.
Los conteos proceden del JSON local: no acreditan cada operación instalada ni
su disponibilidad en un servidor.

El fragmento 77 conserva modelos generados y wrappers propios para Lead,
ContactPeople, Pipeline, Knowledge y PublicHelpCenter. Sus tests HTTP fake,
contratos de tipos, cancelación, cursor, revocación simulada y clientes aislados
están preparados en `test/`; el Source amplio conserva la generación y sus
contratos propios. La clasificación de Command/Query depende del handler nativo,
no del verbo HTTP. Las nuevas comprobaciones no se ejecutaron en este encargo.

Las recetas Source para website y Lead→Opportunity→Activity están en
`development/factuarea-node-servicelevel-native/examples/crm-website-server.ts`
y `examples/crm-commercial-journey.ts`. Su evidencia histórica de tarball privado,
instalación e imports ESM/CJS está en
`app/openspec/changes/crm-node-sdk-delivery/external-capability-evidence.md`.
Es evidencia de la copia medida entonces con HTTP local; no acredita todos los
bytes actuales, Node 20 runtime, scopes/tenant reales ni una release publicada.

## Receta pendiente del operador

1. Conciliar el Source y el OpenAPI vigente en un commit revisable del SDK,
   preservando los dos grupos anteriores. Registrar commit, hash del spec y
   versión coordinada; no inferir una release de `package.json` o del HEAD local.
2. En la fase autorizada, generar y compilar con las herramientas existentes.
   Empaquetar con `npm pack` una copia privada revisada; conservar el hash del
   tarball, su lista de archivos y el commit que los contiene. `npm pack` no
   publica el paquete, pero no se ha ejecutado aquí.
3. Instalar ese tarball en consumidores limpios ESM y CJS; comprobar imports del
   paquete público, declaraciones `.d.ts`/`.d.cts`, tipos negativos y recetas.
   Guardar lock, versiones Node/npm/TypeScript, comandos y resultados reales.
   Las rutas Source o un `dist` anterior no sustituyen los entrypoints instalados.
4. Ejecutar en la validación autorizada los contratos fake pertinentes y Node 20
   runtime. Verificar aparte sandbox nativo, scopes, tenant A/B, rol/plan,
   revocación, masks y recuperación; ningún catálogo estático concede autoridad.
5. La publicación usa el proceso existente del repo y requiere autorización
   que la cubra. Para acreditar una release externa faltan versión/tag/commit,
   provenance/artefacto y una instalación desde el canal realmente publicado.

3.1 permanece pendiente. Esta captura no ejecutó suites, build, generación,
instalación, npm pack, publicación, push, PR ni activación. Runtime-evidence
permanece intacto.
