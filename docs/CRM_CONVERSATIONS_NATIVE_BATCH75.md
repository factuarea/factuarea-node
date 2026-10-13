# Conversation native READ75 SDK

El recurso canónico `crmConversations(paths)` utiliza el transporte, credencial, entorno, errores, cancelación y política de reintentos configurados del cliente existente. Esta entrega aporta Source para las dos lecturas V1 nativas de NativeReadSurfacesBatch75; no acredita despliegue, activación, publicación, fase Applied ni acceso al buzón por aceptar un UUID.

```ts
import { Factuarea, encodeCrmConversationFilters } from "@factuarea/sdk";

const client = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY! });
const conversations = client.crmConversations({
  listConversations: "/crm/conversation",
  getConversation: "/crm/conversation/{conversation}",
});
const filters = encodeCrmConversationFilters({ state: "active", search: "Factura", sort: "last_message_at:desc" });
const inbox = await conversations.listConversations({ filters, limit: 20 });
for await (const conversation of inbox) console.log(conversation.id, conversation.subject);
const thread = await conversations.getConversation("019a0000-0000-7000-8000-000000000001", { limit: 20 });
for await (const message of thread) console.log(message.id, message.delivery_status);
```

Con la URL base V1 del cliente, los paths relativos anteriores ejecutan `GET /v1/crm/conversation` (`listCrmConversations`) y `GET /v1/crm/conversation/{conversation}` (`getCrmConversation`). Se requieren bindings exactos del dueño; no hay ruta SPA de reserva. GET no añade body, archivos ni Idempotency-Key. El recurso no añade scopes, actor, Company, C7, conexiones, consentimiento ni grants. El servidor exige el scope fino `conversations:read` y el guard heredado `crm:read` o `*`; conocer el primero no amplía la credencial ni autoriza correo personal ajeno.

`filters` es un string JSON literal cerrado: `mailbox_uuid`, `state` (active|archived), `search` (1..255 caracteres), `target_type`+`target_uuid` juntos y `sort` (subject|last_message_at:asc|desc). El helper tipado construye ese string; un literal existente conserva sus bytes sin reserialización. El límite JSON es 1MiB UTF-8; `limit` es entero 1..100, default20. Get sólo acepta cursor/limit y el UUIDv7 original del hilo. `cursor` admite null o string no vacío hasta8192 caracteres; se trata como dato opaco y conserva sus bytes. No se fabrica, decodifica ni traslada entre SPA/V1/MCP o credenciales.

La proyección pública usa `id`, `mailbox_id`, `owner_id`, `team_id`, `messages[].conversation_id` y `attachments[].conversation_id/message_id`. Los filtros y `meta.readable_fields/filterable_fields/sortable_fields` conservan los nombres propietarios como `uuid` y `mailbox_uuid`; esos metadatos no son otro permiso. Cada página devuelve su `authorization_version` y máscaras actuales. Campos ocultos permanecen null; links/messages/attachments ocultos permanecen arrays vacíos. El codec rechaza una proyección incompatible o campos privados añadidos. Un fallo nativo conserva su código/subcode/param/requestId; un éxito incompatible produce `ConnectionError` con código `crm_conversation_projection_unreadable`, sin convertirlo en lista vacía.

`CrmConversationInboxPage` itera conversaciones y expone `payload` con items/conteos/limit/cursor y `meta` actual. `CrmConversationThreadPage` itera mensajes y conserva en `payload` la cabecera y los metadatos de adjuntos de esa página. `getNextPage()` y `toArray()` utilizan filtros, límite, cursor, cabecera del detalle y configuración originales; editar los objetos de presentación no los sustituye. La señal de cancelación original sigue efectiva. Cada continuación vuelve al GET del dueño; una denegación actual interrumpe la lectura. Se detectan cursores/identidades repetidos en la propia iteración, sin ledger o caché de autoridad.

`send_intent` sigue siendo intención. Los resultados originales `pending`, `confirmed`, `unconfirmed` y `failed` y `submitted_at` se conservan cuando delivery_status es legible; no se confirma ni reenvía desde una lectura. `quarantine`, `ready` y `rejected` conservan el estado original del adjunto. Estas rutas sólo exponen metadatos, sin storage key, URL, bytes o API de descarga. Los writers de conversación, recuperación de envío y carriers de adjuntos no están publicados por este módulo.

## Criterios originales y alcance

El tasks.md de `crm-conversation-workspace-backend` no contiene una tarea SDK independiente. Este módulo aplica el contrato literal de lecturas originales 3.16/3.17/3.18 (ListConversations) y 3.23/3.24/3.25 (GetConversation), mediante los carriers nativos75 y las Queries/Responses NativeInbox74. No modifica sus estados ni reemplaza al dueño backend.

- CRM-045: «Corregir una asociación no duplica el hilo ni concede acceso adicional; el historial mantiene dirección, origen y correspondencia de sus mensajes.» SDK conserva dirección, asociaciones visibles e identidades originales; no implementa corrección de asociaciones.
- CRM-047: «Una URL copiada no permite descargar a otro tenant o usuario sin ámbito; retirar acceso bloquea la descarga y no se exponen credenciales del almacenamiento.» SDK sólo consume metadatos privados y denegaciones actuales; descarga, almacenamiento y pruebas reales de aislamiento quedan al dueño nativo.
- CRM-071: «Recargar o compartir la URL restaura filtros, orden y página; una coincidencia fuera de la página inicial se encuentra y valores inválidos no alteran el contrato.» SDK preserva el literal y orden/cursor/límite originales y valida la selección; el filtrado anterior a COUNT/LIMIT lo ejecuta el repositorio nativo.
- CRM-080: «Para cada ruta CRM incluida, OpenAPI contiene parámetros, id UUID, respuestas y requestBody cuando procede; los ejemplos aceptados y rechazados coinciden con el comportamiento real. V1RouteOpenApiCoverageTest y paridad MCP pasan; exportar el fichero no da por terminados docs/CLI/SDK/plugin.» Source SDK y pruebas offline aportan evidencia de estas dos lecturas; OpenAPI/paridad/API/SQL, docs públicas trilingües, CLI/plugin y versión/publicación siguen con Root y los dueños de cada superficie.

Selector offline propio: `test/crm-conversations-native-batch75.test.ts`. El grupo final incluye los dos selectores ServiceInsights74 existentes para conservar sus 37 casos. Sin API real, envío de correo ni suites generales del repositorio.

Validación ejecutada: `vitest run test/crm-conversations-native-batch75.test.ts test/crm-service-insights-boundary.test.ts test/crm-service-insights-native-batch74.test.ts --maxWorkers=1 --minWorkers=1` → **85 PASS** (48 propios + 37 ServiceInsights). TypeScript noEmit con configuración temporal limitada al módulo/factories y estos selectores → PASS. `git diff --check` en paths declarados → PASS. Source nuevo644 y directorio755. No cambian versiones o claims de disponibilidad.
