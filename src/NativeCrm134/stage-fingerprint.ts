import { createHash } from "node:crypto";
import type { UpdateServiceStageData } from "./generated/types.gen.js";

type StageBody = NonNullable<UpdateServiceStageData["body"]>;

/** Exact normalized seven-field wire described by actual Native149 Stage Original. */
export function stageRequestFingerprint(
  stage: string,
  body: Readonly<StageBody>
): string {
  // ConfirmedIdentityReplay::canonicalJson sorts object keys as strings. These
  // scalar native fields contain only safe integers, normalized UUIDs and name bytes.
  const normalized = {
    expected_pipeline_version: body.expected_pipeline_version,
    expected_version: body.expected_version,
    mapped_status: body.mapped_status,
    name: body.name,
    pipeline_uuid: body.pipeline_id.toLowerCase(),
    stage_uuid: stage.toLowerCase(),
    wip_limit: body.wip_limit,
  };
  const canonical = JSON.stringify(normalized)
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}
