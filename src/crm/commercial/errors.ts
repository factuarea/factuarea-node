import { ConnectionError } from "../../core/errors.js";
import type { CrmOriginalIntent } from "../oauth-originals/intent.js";
export class CrmCommercialContractError extends TypeError {}
/** No assertion about whether a mutation committed. Only explicit original GET recovery follows. */
export class CrmCommercialWriteUnconfirmedError extends ConnectionError {
  constructor(readonly intent: CrmOriginalIntent, status?: number, requestId?: string | null) {
    super({ message: "CRM write result is unconfirmed. Retain its original intent and explicitly read its receipt.", status, requestId });
  }
}
