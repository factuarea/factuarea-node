import type { HttpClient } from "../core/http-client.js";
import { CrmResource } from "./resources.js";
import { CrmEntityExportsResource } from "./entity-exports/resource.js";
import { CrmSourceResource } from "./source/resources.gen.js";
import { NativeCrm134Client } from "../NativeCrm134/client.js";

/** Compose hand-written native wrappers without changing the pinned generated layer. */
export class CrmNativeResource extends CrmResource {
  readonly entityExports: CrmEntityExportsResource;
  readonly source: CrmSourceResource;
  /** Actual Native149 Stage/Bulk/Restore consumers; native authority stays current. */
  readonly native134: NativeCrm134Client;

  constructor(client: HttpClient) {
    super(client);
    this.entityExports = new CrmEntityExportsResource(client);
    this.source = new CrmSourceResource(client);
    this.native134 = new NativeCrm134Client(client, this.source.documents);
  }
}
