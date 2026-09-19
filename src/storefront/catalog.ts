/**
 * Catalogue of the buyer lane: what a shopper may see of an article.
 *
 * The server publishes an INCLUSION list — public id, reference, name,
 * description, categories, base unit, kind, applicable tax, primary image and
 * the three flags that say whether the article has variants, presentations or
 * options. Cost, margin, supplier, reorder point, per-warehouse balance and
 * internal notes never reach this lane, so a new field of the article cannot
 * leak into a shop by omission.
 *
 * Payload types are `unknown` in `0.x`, exactly like the server SDK: cast to
 * the shape you expect, or read the reference of the operation in the docs.
 */

import {
  StorefrontNamespace,
  type StorefrontPage,
  type StorefrontRequestConfig,
  type StorefrontTransport,
} from "./transport.js";

/** Query of the article listing, as the frozen contract declares it. */
export interface StorefrontProductListParams {
  /** Page size. */
  limit?: number;
  /** Forward cursor. Handled for you by `StorefrontPage`. */
  starting_after?: string;
  /** Backward cursor. */
  ending_before?: string;
  /** Public id of a category. */
  category?: string;
  /** Article reference. */
  sku?: string;
  /** Only articles with stock available. */
  in_stock?: boolean;
  /** Ordering accepted by the lane. */
  sort?: string;
}

/** Query of the article search. */
export interface StorefrontProductSearchParams {
  /** Free text the shopper typed. */
  q: string;
}

export class StorefrontProductImages extends StorefrontNamespace {
  /** List the images of a storefront product. */
  async list(product: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/products/{product}/images",
        { company: this.company, product },
      ),
      ...config,
    });
  }
}

export class StorefrontProductOptions extends StorefrontNamespace {
  /** List the options of a storefront product. */
  async list(product: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/products/{product}/options",
        { company: this.company, product },
      ),
      ...config,
    });
  }
}

export class StorefrontProductPresentations extends StorefrontNamespace {
  /** List the presentations of a storefront product. */
  async list(product: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/products/{product}/presentations",
        { company: this.company, product },
      ),
      ...config,
    });
  }
}

export class StorefrontProductVariants extends StorefrontNamespace {
  /** List the variants of a storefront product. */
  async list(product: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath(
        "/companies/{company}/storefront/products/{product}/variants",
        { company: this.company, product },
      ),
      ...config,
    });
  }
}

export class StorefrontProducts extends StorefrontNamespace {
  readonly images: StorefrontProductImages;
  readonly options: StorefrontProductOptions;
  readonly presentations: StorefrontProductPresentations;
  readonly variants: StorefrontProductVariants;

  constructor(transport: StorefrontTransport, company: string) {
    super(transport, company);
    this.images = new StorefrontProductImages(transport, company);
    this.options = new StorefrontProductOptions(transport, company);
    this.presentations = new StorefrontProductPresentations(transport, company);
    this.variants = new StorefrontProductVariants(transport, company);
  }

  /** List storefront products, with transparent cursor pagination. */
  async list(
    params?: StorefrontProductListParams,
    config?: StorefrontRequestConfig,
  ): Promise<StorefrontPage<unknown>> {
    return this.transport.paginate<unknown>(
      this.transport.buildPath("/companies/{company}/storefront/products", {
        company: this.company,
      }),
      { ...params },
      config,
    );
  }

  /** Search storefront products by free text. */
  async search(
    params: StorefrontProductSearchParams,
    config?: StorefrontRequestConfig,
  ): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath("/companies/{company}/storefront/products/search", {
        company: this.company,
      }),
      query: { ...params },
      ...config,
    });
  }

  /** Retrieve one storefront product by its public id. */
  async show(product: string, config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath("/companies/{company}/storefront/products/{product}", {
        company: this.company,
        product,
      }),
      ...config,
    });
  }
}

export class StorefrontCategories extends StorefrontNamespace {
  /** List the categories the shop publishes. */
  async list(config?: StorefrontRequestConfig): Promise<unknown> {
    return this.transport.request({
      method: "GET",
      path: this.transport.buildPath("/companies/{company}/storefront/categories", {
        company: this.company,
      }),
      ...config,
    });
  }
}
