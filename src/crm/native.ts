import type { HttpClient } from "../core/http-client.js";
import { CrmResource } from "./resources.js";
import { CrmEntityExportsResource } from "./entity-exports/resource.js";
import { CrmSourceResource } from "./source/resources.gen.js";

/** Compose hand-written native wrappers without changing the pinned generated layer. */
export class CrmNativeResource extends CrmResource {
  readonly entityExports: CrmEntityExportsResource;
  readonly source: CrmSourceResource;

  constructor(client: HttpClient) {
    super(client);
    this.entityExports = new CrmEntityExportsResource(client);
    this.source = new CrmSourceResource(client);
  }
}
