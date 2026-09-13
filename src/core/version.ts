/**
 * SDK version. Kept in sync with `package.json` by the release pipeline.
 * Used in the informative `User-Agent` (no telemetry).
 */
export const SDK_VERSION = "0.4.0";

/**
 * Default `Factuarea-Version` pinned by this SDK release. The API is
 * versioned by date (`Factuarea-Version: YYYY-MM-DD`, Stripe-style); the SDK
 * sends this on every request so behaviour stays stable until the integrator
 * upgrades. The value is a supported request version from the backend, independent of
 * the date on which the OpenAPI snapshot was exported.
 */
export const DEFAULT_FACTUAREA_VERSION = "2026-06-01";
