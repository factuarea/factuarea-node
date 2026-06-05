# Releasing

`@factuarea/sdk` is published to npm with **[Changesets](https://github.com/changesets/changesets)**
for versioning and **npm [Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
(OIDC)** for authentication. There is **no long-lived `NPM_TOKEN`** in CI:
GitHub Actions exchanges a short-lived OIDC token for publish rights, and every
release ships with build [provenance](https://docs.npmjs.com/generating-provenance-statements).

## The normal flow

1. **Add a changeset** with your PR:

   ```bash
   npm run changeset
   ```

   Pick the bump (`patch` / `minor` / `major`) and write a one-line summary.
   This creates a `.changeset/*.md` file — commit it. (See
   [VERSIONING.md](./VERSIONING.md) for which bump to pick.)

2. **Merge the PR to `main`.** The `Release` workflow opens (or updates) a
   **"Version Packages"** PR that applies the accumulated changesets: it bumps
   `package.json`, rewrites `CHANGELOG.md`, syncs `SDK_VERSION`
   (`src/core/version.ts`) and the lockfile.

3. **Merge the "Version Packages" PR.** With the changeset files gone, the
   `Release` workflow runs `changeset publish`, which publishes the new version
   to npm via OIDC + provenance and creates the matching GitHub release + tag.

You never run `npm publish` by hand for a normal release.

## One-time setup: configure the npm Trusted Publisher

Trusted Publishing can only be configured **after the package exists** on npm
(the first `0.1.0` was published manually — see below). Do this **once**:

1. Sign in to <https://www.npmjs.com> as the `factuarea` account.
2. Go to the package page → **Settings**:
   <https://www.npmjs.com/package/@factuarea/sdk/access>
   (or **Settings → Publishing access / Trusted Publisher**).
3. Under **Trusted Publisher**, choose **GitHub Actions** and enter:
   - **Organization or user:** `factuarea`
   - **Repository:** `factuarea-node`
   - **Workflow filename:** `release.yml`
   - **Environment:** *(leave empty)*
4. Save.

After this, the `Release` workflow can publish with no token. If it is **not**
configured, the publish step fails with npm's auth error and the workflow prints
a pointer back to this file.

## First publish (already done)

The initial `0.1.0` was published manually because Trusted Publishing needs an
existing package:

```bash
npm whoami            # → factuarea
npm publish --access public
```

The `factuarea` npm account uses 2FA (a passkey); the publish may open a browser
to complete web authentication.

## Requirements in CI

- `permissions: id-token: write` on the release job (granted in `release.yml`).
- npm `>= 11.5.1` in the runner (the workflow upgrades npm explicitly).
- `NPM_CONFIG_PROVENANCE=true` and `publishConfig.provenance=true` so every
  publish is attested.

## Yanking a bad release

```bash
npm deprecate @factuarea/sdk@<version> "Broken release — upgrade to <next>"
```

Prefer `deprecate` over `unpublish`. Then ship a fixed patch through the normal
flow.
