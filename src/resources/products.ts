// AUTO-GENERATED resource wrapper. Do not edit by hand.
// Regenerate with `npm run generate:resources`. These wrappers compose the
// hand-written core (`../core`) only — never the generated HTTP layer (D5).
//
// Method names follow backend/docs/api/sdk-method-naming.md @ 1.0.0.

import { BaseResource, type RequestConfig } from "../core/resource.js";
import type { HttpClient, BinaryResponse } from "../core/http-client.js";
import type { Page } from "../core/pagination.js";


export class ProductsPresentationsResource extends BaseResource {
  /** Create a product presentation */
  async create(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/presentations", { "product": product });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List product presentations */
  async list(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/products/{product}/presentations", { "product": product });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Delete a product presentation */
  async delete(product: string, presentation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/presentations/{presentation}", { "product": product, "presentation": presentation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a product presentation */
  async update(product: string, presentation: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/presentations/{presentation}", { "product": product, "presentation": presentation });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class ProductsVariantsResource extends BaseResource {
  /** Create a product variant */
  async create(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/variants", { "product": product });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List product variants */
  async list(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/products/{product}/variants", { "product": product });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Delete a product variant */
  async delete(product: string, variant: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/variants/{variant}", { "product": product, "variant": variant });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a product variant */
  async update(product: string, variant: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/variants/{variant}", { "product": product, "variant": variant });
    return this._send<unknown>("PUT", path, body, config);
  }
}

export class ProductsSupplierOffersResource extends BaseResource {
  /** Create a supplier offer */
  async create(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/supplier-offers", { "product": product });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List supplier offers */
  async list(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/products/{product}/supplier-offers", { "product": product });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Delete a supplier offer */
  async delete(product: string, offer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/supplier-offers/{offer}", { "product": product, "offer": offer });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a supplier offer */
  async update(product: string, offer: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/supplier-offers/{offer}", { "product": product, "offer": offer });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Set the preferred supplier offer */
  async preferred(product: string, offer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/supplier-offers/{offer}/preferred", { "product": product, "offer": offer });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

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

export class ProductsConfigurationsResource extends BaseResource {
  /** List product commercial combinations */
  async list(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/products/{product}/configurations", { "product": product });
    return this._paginate<unknown>(path, params, "starting_after");
  }

  /** Preview the impact of restricting a catalog */
  async impactPreview(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/configurations/impact-preview", { "product": product });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class ProductsOptionsResource extends BaseResource {
  /** List product option groups */
  async list(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/products/{product}/options", { "product": product });
    return this._paginate<unknown>(path, params, "starting_after");
  }
}

export class ProductsStockMovementsResource extends BaseResource {
  /** List stock movements of a product */
  async list(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/products/{product}/stock-movements", { "product": product });
    return this._paginate<unknown>(path, params, "starting_after");
  }
}

export class ProductsResource extends BaseResource {
  readonly presentations: ProductsPresentationsResource;
  readonly variants: ProductsVariantsResource;
  readonly supplierOffers: ProductsSupplierOffersResource;
  readonly gallery: ProductsGalleryResource;
  readonly video: ProductsVideoResource;
  readonly configurations: ProductsConfigurationsResource;
  readonly options: ProductsOptionsResource;
  readonly stockMovements: ProductsStockMovementsResource;

  constructor(client: HttpClient) {
    super(client);
    this.presentations = new ProductsPresentationsResource(client);
    this.variants = new ProductsVariantsResource(client);
    this.supplierOffers = new ProductsSupplierOffersResource(client);
    this.gallery = new ProductsGalleryResource(client);
    this.video = new ProductsVideoResource(client);
    this.configurations = new ProductsConfigurationsResource(client);
    this.options = new ProductsOptionsResource(client);
    this.stockMovements = new ProductsStockMovementsResource(client);
  }

  /** Delete multiple products in bulk */
  async bulkDelete(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/products/bulk-delete";
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change product active state */
  async bulkStatus(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/products/bulk-status";
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
  async show(product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}", { "product": product });
    return this._get<unknown>(path, params, config);
  }

  /** Update a product */
  async update(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}", { "product": product });
    return this._send<unknown>("PUT", path, body, config);
  }

  /** Find a product by external ID */
  async findByExternalId(body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = "/products/find-by-external-id";
    return this._send<unknown>("POST", path, body, config);
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

  /** Resolve a catalog selection */
  async resolveSelection(product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/products/{product}/resolve-selection", { "product": product });
    return this._send<unknown>("POST", path, body, config);
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
