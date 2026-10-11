export { NativeCrm134Resource } from "./resources.gen.js";
export { NativeCrm134Client } from "./client.js";
export {
  RetainedBulkAction,
  prepareStageUpdate,
  prepareDocumentRestore,
} from "./intents.js";
export type {
  StageUpdateBody,
  BulkActionBody,
  DocumentRestoreBody,
  StageUpdateIntention,
  DocumentRestoreIntention,
} from "./intents.js";
export { CRM_NATIVE134_OPERATIONS } from "./operations.gen.js";
export { RetainedNativeEffect } from "./retained-effect.js";
export type {
  RetainedNativeEffectState,
  NativeEffectDispatchConfig,
  NativeEffectOriginalConfig,
} from "./retained-effect.js";
export type * from "./generated/types.gen.js";
