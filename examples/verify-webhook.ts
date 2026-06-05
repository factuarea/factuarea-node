/**
 * Verify a webhook signature inside an Express handler.
 *
 * In your project: `import { Factuarea } from "@factuarea/sdk";`
 *
 * IMPORTANT: pass the RAW request body (a string), not a re-serialized object.
 * In Express, use `express.raw({ type: "application/json" })` for the webhook
 * route so `req.body` is a Buffer you can stringify exactly as received.
 */
import { Factuarea, WebhookSignatureError, SIGNATURE_HEADER } from "../src/index.js";

const factuarea = new Factuarea({ apiKey: process.env.FACTUAREA_API_KEY ?? "fact_test_xxx" });
const webhookSecret = process.env.FACTUAREA_WEBHOOK_SECRET ?? "whsec_xxx";

// Pseudo Express handler:
export function handleWebhook(req: { body: Buffer; headers: Record<string, string> }, res: { status: (code: number) => { send: (body: string) => void } }): void {
  const rawBody = req.body.toString("utf8");
  const signature = req.headers[SIGNATURE_HEADER.toLowerCase()] ?? "";

  try {
    const event = factuarea.webhooks.verify(rawBody, signature, webhookSecret);
    // `event` is fully typed; switch on event.type.
    switch (event.type) {
      case "invoice.paid":
        console.log("Invoice paid:", event.data);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    res.status(200).send("ok");
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      console.warn("Rejected webhook:", error.message);
      res.status(400).send("invalid signature");
      return;
    }
    throw error;
  }
}
