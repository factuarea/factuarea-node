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
  async create(company: string, product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/presentations", { "company": company, "product": product });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List product presentations */
  async list(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/products/{product}/presentations", { "company": company, "product": product });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a product presentation */
  async delete(company: string, product: string, presentation: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/presentations/{presentation}", { "company": company, "product": product, "presentation": presentation });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a product presentation */
  async update(company: string, product: string, presentation: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/presentations/{presentation}", { "company": company, "product": product, "presentation": presentation });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class ProductsVariantsResource extends BaseResource {
  /** Create a product variant */
  async create(company: string, product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/variants", { "company": company, "product": product });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List product variants */
  async list(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/products/{product}/variants", { "company": company, "product": product });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a product variant */
  async delete(company: string, product: string, variant: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/variants/{variant}", { "company": company, "product": product, "variant": variant });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a product variant */
  async update(company: string, product: string, variant: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/variants/{variant}", { "company": company, "product": product, "variant": variant });
    return this._send<unknown>("PATCH", path, body, config);
  }
}

export class ProductsSupplierOffersResource extends BaseResource {
  /** Create a supplier offer */
  async create(company: string, product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/supplier-offers", { "company": company, "product": product });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List supplier offers */
  async list(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/products/{product}/supplier-offers", { "company": company, "product": product });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a supplier offer */
  async delete(company: string, product: string, offer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/supplier-offers/{offer}", { "company": company, "product": product, "offer": offer });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Update a supplier offer */
  async update(company: string, product: string, offer: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/supplier-offers/{offer}", { "company": company, "product": product, "offer": offer });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Set the preferred supplier offer */
  async preferred(company: string, product: string, offer: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/supplier-offers/{offer}/preferred", { "company": company, "product": product, "offer": offer });
    return this._send<unknown>("POST", path, undefined, config);
  }
}

export class ProductsGalleryResource extends BaseResource {
  /** Remove a gallery image from a product */
  async delete(company: string, product: string, index: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/gallery/{index}", { "company": company, "product": product, "index": index });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Download a product gallery image binary */
  async download(company: string, product: string, index: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/products/{product}/gallery/{index}/download", { "company": company, "product": product, "index": index });
    return this._binary(path, "GET", undefined, undefined, config);
  }

  /** Upload a gallery image to a product */
  async upload(company: string, product: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/gallery", { "company": company, "product": product });
    return this._sendForm<unknown>(path, formData, config);
  }
}

export class ProductsVideoResource extends BaseResource {
  /** Remove the product video */
  async delete(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/video", { "company": company, "product": product });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Upload a video to a product */
  async upload(company: string, product: string, formData: FormData, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/video", { "company": company, "product": product });
    return this._sendForm<unknown>(path, formData, config);
  }

  /** Download the product video binary */
  async download(company: string, product: string, config?: RequestConfig): Promise<BinaryResponse> {
    const path = this.buildPath("/companies/{company}/products/{product}/video/download", { "company": company, "product": product });
    return this._binary(path, "GET", undefined, undefined, config);
  }
}

export class ProductsConfigurationsResource extends BaseResource {
  /** List product commercial combinations */
  async list(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/products/{product}/configurations", { "company": company, "product": product });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Preview the impact of restricting a catalog */
  async impactPreview(company: string, product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/configurations/impact-preview", { "company": company, "product": product });
    return this._send<unknown>("POST", path, body, config);
  }
}

export class ProductsOptionsResource extends BaseResource {
  /** List product option groups */
  async list(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/products/{product}/options", { "company": company, "product": product });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }
}

export class ProductsStockMovementsResource extends BaseResource {
  /** List stock movements of a product */
  async list(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/products/{product}/stock-movements", { "company": company, "product": product });
    return this._paginate<unknown>(path, params, "starting_after", config);
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
  async bulkDelete(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/bulk-delete", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Bulk change product active state */
  async bulkStatus(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/bulk-status", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Update stock for many products */
  async bulkUpdateStock(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/bulk-update-stock", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Create a product */
  async create(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List all products */
  async list(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<Page<unknown>> {
    const path = this.buildPath("/companies/{company}/products", { "company": company });
    return this._paginate<unknown>(path, params, "starting_after", config);
  }

  /** Delete a product */
  async delete(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}", { "company": company, "product": product });
    return this._send<unknown>("DELETE", path, undefined, config);
  }

  /** Retrieve a product */
  async show(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}", { "company": company, "product": product });
    return this._get<unknown>(path, params, config);
  }

  /** Update a product */
  async update(company: string, product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}", { "company": company, "product": product });
    return this._send<unknown>("PATCH", path, body, config);
  }

  /** Find a product by external ID */
  async findByExternalId(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/find-by-external-id", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Find a product by SKU */
  async findBySku(company: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/find-by-sku", { "company": company });
    return this._send<unknown>("POST", path, body, config);
  }

  /** List products below the stock threshold */
  async lowStockReport(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/low-stock-report", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** List product activity timeline */
  async activities(company: string, product: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/activities", { "company": company, "product": product });
    return this._get<unknown>(path, params, config);
  }

  /** Get product sales analytics */
  async salesAnalytics(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/sales-analytics", { "company": company, "product": product });
    return this._get<unknown>(path, undefined, config);
  }

  /** Get product stats */
  async stats(company: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/stats", { "company": company });
    return this._get<unknown>(path, undefined, config);
  }

  /** Resolve a catalog selection */
  async resolveSelection(company: string, product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/resolve-selection", { "company": company, "product": product });
    return this._send<unknown>("POST", path, body, config);
  }

  /** Search products */
  async search(company: string, params?: Record<string, unknown>, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/search", { "company": company });
    return this._get<unknown>(path, params, config);
  }

  /** Toggle product active state */
  async toggleActive(company: string, product: string, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/toggle-active", { "company": company, "product": product });
    return this._send<unknown>("POST", path, undefined, config);
  }

  /** Update product stock */
  async updateStock(company: string, product: string, body?: unknown, config?: RequestConfig): Promise<unknown> {
    const path = this.buildPath("/companies/{company}/products/{product}/stock", { "company": company, "product": product });
    return this._send<unknown>("PATCH", path, body, config);
  }
}
