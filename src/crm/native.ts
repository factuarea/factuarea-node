import type { HttpClient } from "../core/http-client.js";
import { CrmResource } from "./resources.js";
import { CrmEntityExportsResource } from "./entity-exports/resource.js";

/** Compose hand-written native wrappers without changing the pinned generated layer. */
export class CrmNativeResource extends CrmResource {
  readonly entityExports: CrmEntityExportsResource;

  constructor(client: HttpClient) {
    super(client);
    this.entityExports = new CrmEntityExportsResource(client);
  }
}
