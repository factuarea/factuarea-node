// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ProductsGalleryResource extends BaseResource {
  /** Remove a gallery image from a product */
  async delete(product: string, index: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/gallery/{index}", { "product": product, "index": index });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Download a product gallery image binary */
  async download(product: string, index: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/products/{product}/gallery/{index}/download", { "product": product, "index": index });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Upload a gallery image to a product */
  async upload(product: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/gallery", { "product": product });
    return this._sendForm<unknown>(path, formData, config);
  }
}

export class ProductsVideoResource extends BaseResource {
  /** Remove the product video */
  async delete(product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/video", { "product": product });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Upload a video to a product */
  async upload(product: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/video", { "product": product });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Download the product video binary */
  async download(product: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/products/{product}/video/download", { "product": product });
    return this._binary(path, "GET", undefined, undefined, config);
  }
}

export class ProductsResource extends BaseResource {
  readonly gallery: ProductsGalleryResource;
  readonly video: ProductsVideoResource;

  constructor(client: HttpClient) {
    super(client);
    this.gallery = new ProductsGalleryResource(client);
    this.video = new ProductsVideoResource(client);
  }

  /** Delete multiple products in bulk */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/products/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Update stock for many products */
  async bulkUpdateStock(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/products/bulk-update-stock";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a product */
  async create(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/products";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all products */
  async list(params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    return this._paginate<unknown>("/products", params, "starting_after");
  }

  /** Delete a product */
  async delete(product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}", { "product": product });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a product */
  async show(product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}", { "product": product });
    return this._get<unknown>(path, undefined, config);
  }

  /** Update a product */
  async update(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}", { "product": product });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Find a product by SKU */
  async findBySku(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/products/find-by-sku";
    return this._send<unknown>("POST", path, body, config);
  }

  /** List products below the stock threshold */
  async lowStockReport(config?: RequestConfig): Promise<unknown> {
    const path = "/products/low-stock-report";
    return this._get<unknown>(path, undefined, config);
  }

  /** List product activity timeline */
  async activities(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/activities", { "product": product });
    return this._get<unknown>(path, params, config);
  }

  /** Get product sales analytics */
  async salesAnalytics(product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/sales-analytics", { "product": product });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get product stats */
  async stats(config?: RequestConfig): Promise<unknown> {
    const path = "/products/stats";
    return this._get<unknown>(path, undefined, config);
  }

  /** Search products */
  async search(params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = "/products/search";
    return this._get<unknown>(path, params, config);
  }

  /** Toggle product active state */
  async toggleActive(product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/toggle-active", { "product": product });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Update product stock */
  async updateStock(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/stock", { "product": product });
    return this._send<unknown>("PUT", path, body, config);
  }
}
