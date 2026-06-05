# Spec sync

The OpenAPI spec is the contract this SDK is generated from. Its single source
of truth lives in the private `factuarea` repo and is published at a stable URL.
This repo keeps its pinned copy (`spec/openapi.json`) and the generated layer in
sync automatically (design decision **D10**).

## Receiver side (this repo — implemented)

The [`Spec Sync`](../.github/workflows/spec-sync.yml) workflow runs on three
triggers:

- **`repository_dispatch`** with `event_type: spec-updated` — pushed by the
  `factuarea` CI when the spec changes (the emitter is **not yet wired**, see
  below).
- **`workflow_dispatch`** — run it manually from the Actions tab.
- **`schedule`** — a daily cron (`17 6 * * *` UTC) as a fallback in case a
  dispatch is missed.

What it does:

1. Downloads the published spec from `SPEC_URL`
   (default `https://docs.factuarea.com/api/openapi`; a dispatch may override it
   via `client_payload.spec_url`).
2. **Compares it canonically** against the committed copy — parsed JSON with
   sorted keys, *not* raw bytes. This matters: the published URL serves the spec
   **minified** while the committed copy is **pretty-printed**, so a byte diff
   would always (falsely) report a change. The comparison lives in
   [`scripts/spec-sync.mjs`](../scripts/spec-sync.mjs) and is unit-tested in
   [`test/spec-sync.test.ts`](../test/spec-sync.test.ts).
3. If (and only if) it changed: re-pins the spec, runs `npm run generate`,
   typechecks, builds and tests, writes a changeset, and **opens a PR**
   (`peter-evans/create-pull-request`). It **never pushes to `main` directly** —
   a human reviews the diff and merges, which feeds the
   [Release](./RELEASING.md) flow.

### Bump inference

The check step infers the SemVer bump from operationId churn:

- new operations and **none removed** → `minor`
- anything else (removed/renamed operations, schema-only changes) → `patch`

A removed/renamed operation is potentially **breaking**; the PR body asks the
reviewer to promote the changeset to `major` before merging when appropriate.

## Emitter side (`factuarea` repo — NOT yet wired)

The emitter is a step in the private repo's CI that fires a `repository_dispatch`
to this repo (and to `factuarea-php`) when `openapi-public.json` changes on the
release branch. It is **not implemented yet** because it needs a GitHub token
with cross-repo `repository_dispatch` permission (a fine-grained PAT or GitHub
App token scoped to the `factuarea` org — the default `GITHUB_TOKEN` cannot
dispatch to other repos).

Until then, the daily `schedule` and `workflow_dispatch` triggers keep this repo
in sync. When you're ready to wire the emitter, add the following job to the
`factuarea` CI (this snippet is for the **private repo**, do not commit it here):

```yaml
# .github/workflows/<spec-publish>.yml in the PRIVATE factuarea repo.
# Run after the public spec is regenerated/published on develop or a release.
  notify-sdks:
    name: Notify SDK repos of spec change
    runs-on: ubuntu-latest
    # Only when the published spec actually changed in this push.
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      - name: Dispatch spec-updated to SDK repos
        env:
          # Fine-grained PAT (or GitHub App token) with
          # "Contents: read" + "Metadata: read" on factuarea-node & factuarea-php,
          # and the "repository_dispatch" / "Actions" permission to send events.
          GH_TOKEN: ${{ secrets.SDK_DISPATCH_TOKEN }}
        run: |
          for repo in factuarea-node factuarea-php; do
            gh api "repos/factuarea/$repo/dispatches" \
              -f event_type=spec-updated \
              -F 'client_payload[spec_url]=https://docs.factuarea.com/api/openapi'
          done
```

### Required secret (in the `factuarea` repo)

| Secret               | What                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------- |
| `SDK_DISPATCH_TOKEN` | Fine-grained PAT or GitHub App token allowed to send `repository_dispatch` to `factuarea/factuarea-node` and `factuarea/factuarea-php`. The built-in `GITHUB_TOKEN` cannot dispatch cross-repo. |

No secret is required on the **receiver** (this repo): the workflow uses the
built-in `GITHUB_TOKEN` to open the PR.
