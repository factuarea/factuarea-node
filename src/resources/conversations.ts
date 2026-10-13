// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.1.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


import type * as NativeApi from "../generated/types.gen.js";

export class ConversationsResource extends BaseResource {
  /** Registrar consentimiento actual de cuenta WhatsApp CRM */
  async configureCrmWhatsAppAccount(mailbox: string, body: NativeApi.ConfigureCrmWhatsAppAccountData["body"], config?: RequestConfig): Promise<NativeApi.ConfigureCrmWhatsAppAccountResponse> {
    const path = this.buildPath("/crm/conversation/mailboxes/{mailbox}/whatsapp-cloud/consent", { "mailbox": mailbox });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.ConfigureCrmWhatsAppAccountResponse>("POST", path, body, config);
  }

  /** Crear configuración local de buzón CRM */
  async createMailboxConfigurationV1(body: NativeApi.CreateMailboxConfigurationV1Data["body"], config?: RequestConfig): Promise<NativeApi.CreateMailboxConfigurationV1Response> {
    const path = "/crm/conversation/mailboxes";
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.CreateMailboxConfigurationV1Response>("POST", path, body, config);
  }

  /** Crear cuenta WhatsApp CRM */
  async createCrmWhatsAppAccount(body: NativeApi.CreateCrmWhatsAppAccountData["body"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.CreateCrmWhatsAppAccountResponse> {
    const path = "/crm/conversation/accounts/whatsapp-cloud";
    config = this._nativeConfig(config, true);
    return this._sendNative<NativeApi.CreateCrmWhatsAppAccountResponse>("POST", path, body, config);
  }

  /** Recuperar el alta original del buzón CRM */
  async getCreatedCrmMailboxWriteOriginal(params: NativeApi.GetCreatedCrmMailboxWriteOriginalData["query"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.GetCreatedCrmMailboxWriteOriginalResponse> {
    const path = "/crm/conversation/mailboxes/write-original";
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.GetCreatedCrmMailboxWriteOriginalResponse>(path, params, config);
  }

  /** Recuperar la actualización original del buzón CRM */
  async getUpdatedCrmMailboxWriteOriginal(mailbox: string, params: NativeApi.GetUpdatedCrmMailboxWriteOriginalData["query"], config: RequestConfig & { idempotencyKey: string }): Promise<NativeApi.GetUpdatedCrmMailboxWriteOriginalResponse> {
    const path = this.buildPath("/crm/conversation/mailboxes/{mailbox}/write-original", { "mailbox": mailbox });
    config = this._nativeConfig(config, true);
    return this._get<NativeApi.GetUpdatedCrmMailboxWriteOriginalResponse>(path, params, config);
  }

  /** Consultar el envío humano original de WhatsApp CRM */
  async getCrmWhatsAppMessageOriginal(conversation: string, message: string, params: NativeApi.GetCrmWhatsAppMessageOriginalData["query"], config?: RequestConfig): Promise<NativeApi.GetCrmWhatsAppMessageOriginalResponse> {
    const path = this.buildPath("/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/original", { "conversation": conversation, "message": message });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.GetCrmWhatsAppMessageOriginalResponse>(path, params, config);
  }

  /** Read CRM WhatsApp templates and reply window */
  async listCrmWhatsAppMessageTemplates(conversation: string, message: string, params: NativeApi.ListCrmWhatsAppMessageTemplatesData["query"], config?: RequestConfig): Promise<NativeApi.ListCrmWhatsAppMessageTemplatesResponse> {
    const path = this.buildPath("/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/templates", { "conversation": conversation, "message": message });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.ListCrmWhatsAppMessageTemplatesResponse>(path, params, config);
  }

  /** Preparar el envío humano de WhatsApp CRM */
  async prepareCrmWhatsAppMessage(conversation: string, message: string, params: NativeApi.PrepareCrmWhatsAppMessageData["query"], config?: RequestConfig): Promise<NativeApi.PrepareCrmWhatsAppMessageResponse> {
    const path = this.buildPath("/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/preparation", { "conversation": conversation, "message": message });
    config = this._nativeConfig(config, false);
    return this._get<NativeApi.PrepareCrmWhatsAppMessageResponse>(path, params, config);
  }

  /** Enviar el mensaje humano original de WhatsApp CRM */
  async sendCrmWhatsAppMessage(conversation: string, message: string, body: NativeApi.SendCrmWhatsAppMessageData["body"], config?: RequestConfig): Promise<NativeApi.SendCrmWhatsAppMessageResponse> {
    const path = this.buildPath("/crm/conversation/{conversation}/messages/{message}/whatsapp-cloud/send", { "conversation": conversation, "message": message });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.SendCrmWhatsAppMessageResponse>("POST", path, body, config);
  }

  /** Actualizar configuración local de buzón CRM */
  async updateMailboxConfigurationV1(mailbox: string, body: NativeApi.UpdateMailboxConfigurationV1Data["body"], config?: RequestConfig): Promise<NativeApi.UpdateMailboxConfigurationV1Response> {
    const path = this.buildPath("/crm/conversation/mailboxes/{mailbox}", { "mailbox": mailbox });
    config = this._nativeConfig(config, false);
    return this._sendNative<NativeApi.UpdateMailboxConfigurationV1Response>("PUT", path, body, config);
  }
}
