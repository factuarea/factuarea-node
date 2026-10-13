import { createHash } from "node:crypto";
import { keys, object, template, type WhatsAppPreparation } from "./types.js";
/** Retains the first public wire, including whitespace and key order. Authority is sealed by the server. */
export class CrmWhatsAppSendIntent {
  readonly originalWireHash: string;
  readonly firstWire: string;
  constructor(readonly preparation: WhatsAppPreparation, firstWire?: string) {
    const expected={conversation_id:preparation.conversation_id,effect_id:preparation.effect_id,expected_version:preparation.expected_version,message_version:preparation.message_version,purpose:preparation.purpose,template:preparation.template,preparation_token:preparation.preparation_token};
    this.firstWire=firstWire ?? JSON.stringify(expected);
    if (Buffer.byteLength(this.firstWire,"utf8")>65536 || Buffer.from(this.firstWire,"utf8").toString("utf8")!==this.firstWire) throw new TypeError("Invalid native WhatsApp wire.");
    const data=object(JSON.parse(this.firstWire)); keys(data,Object.keys(expected));
    for (const k of Object.keys(expected) as (keyof typeof expected)[]) {
      if (k === "template" ? JSON.stringify(template(data[k])) !== JSON.stringify(expected[k]) : data[k] !== expected[k]) throw new TypeError("The first wire must match its sealed preparation.");
    }
    this.originalWireHash=createHash("sha256").update(this.firstWire,"utf8").digest("hex"); Object.freeze(this);
  }
}
