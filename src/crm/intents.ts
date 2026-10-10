import type { KnowledgeCategorySaveRequest, PublicHelpCenterAdministrativePublishRequest } from "./generated/types.gen.js";

/** Native oneOf: creation omits id; editing keeps the original category CAS. */
export type KnowledgeCategorySaveIntent = Omit<KnowledgeCategorySaveRequest, "id" | "expected_version"> & (
  | { id?: never; expected_version: null }
  | { id: string; expected_version: number }
);

/** Native conditional intent: an omitted/null id requires creation CAS zero. */
export type PublicHelpCenterPublishIntent = Omit<PublicHelpCenterAdministrativePublishRequest, "id" | "expected_version"> & (
  | { id?: null; expected_version: 0 }
  | { id: string; expected_version: number }
);
