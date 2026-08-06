# Spec sync

The OpenAPI spec is the contract this SDK is generated from. Its single source
of truth lives in the private `factuarea` repo and is published at a stable URL.
This repo keeps its pinned copy (`spec/openapi.json`) and the generated layer in
sync automatically (design decision **D10**).

## Receiver side (this repo — implemented)

The [`Spec Sync`](../.github/workflows/spec-sync.yml) workflow runs on three
triggers:

- **`repository_dispatch`** with `event_type: spec-updated` — pushed by the
  `factuarea` CI when the public spec is republished (the emitter is wired, see
  below).
- **`workflow_dispatch`** — run it manually from the Actions tab.
- **`schedule`** — a daily cron (`17 6 * * *` UTC) as a fallback in case a
  dispatch is missed.

What it does:

1. Downloads the published spec from `SPEC_URL`
   (`https://docs.factuarea.com/api/openapi`). The URL is **fixed in this repo**
   and is not overridable from the event payload — see
   [Why the emitter sends no `spec_url`](#why-the-emitter-sends-no-spec_url).
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

- any operation added **or removed** → `minor`
- schema-only changes, with no operation added or removed → `patch`

A removed or renamed operation is **breaking**, and in `0.x` a breaking change
is still a `minor`: `1.0.0` is reserved for the API's GA event, so spending it
on a routine renaming would make the GA indistinguishable from it (see
[VERSIONING.md](./VERSIONING.md)). What the reviewer owes the changeset is the
**replacement** of each removed operation, not a promoted bump.

## Emitter side (`factuarea` repo — wired)

The emitter is the `SDK Spec Dispatch` workflow
(`.github/workflows/sdk-spec-dispatch.yml`) in the private `factuarea` repo. It
fires the `repository_dispatch` to this repo and to `factuarea-php`:

```sh
# GH_TOKEN is the SDK_DISPATCH_TOKEN secret of the private repo.
for repo in factuarea/factuarea-node factuarea/factuarea-php; do
  gh api "repos/${repo}/dispatches" -f event_type=spec-updated
done
```

Its triggers are:

- **`workflow_dispatch`** — the reference trigger, run by hand right after the
  documentation portal is republished. That is the only moment the published
  spec is known to have changed.
- **`push` of a `v*` tag** — the release event that exists in the private repo,
  as a best-effort automatic nudge.

It deliberately does **not** fire on pushes to `develop`: this workflow reads the
*published* spec, not the spec on any branch, so a `develop` push would only
produce a run that finds nothing to sync. The published document is served by a
separate repo (`factuarea-docs`) that has no hook back into `factuarea`, so
there is no unambiguous "the published spec just changed" event to hang the
emitter on — hence the manual trigger being the primary one. A tag push may
therefore land before the portal is republished; the run then reports "nothing
to sync" and the daily `schedule` picks the change up within 24h.

### Why the emitter sends no `spec_url`

Earlier revisions of this document showed the emitter sending
`client_payload[spec_url]`. It does not, and it must not: `SPEC_URL` is fixed in
the receiver so that a dispatch cannot point CI at a foreign spec that would be
downloaded, turned into generated code and executed on the runner. A
`repository_dispatch` is only a "go regenerate" signal, never a "from where".

Sending a value the receiver ignores on purpose invites someone to "fix" the
inconsistency the wrong way round — by making the receiver honour it. Both sides
state the reason explicitly so that does not happen.

### Required secret (in the `factuarea` repo)

| Secret               | What                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------- |
| `SDK_DISPATCH_TOKEN` | Fine-grained PAT (or GitHub App installation token) scoped to `factuarea/factuarea-node` and `factuarea/factuarea-php`, with **Contents: Read and write** (plus the mandatory **Metadata: Read-only**). There is no permission literally named `repository_dispatch`: `POST /repos/{owner}/{repo}/dispatches` is gated by *Contents* write, so read-only is not enough. The built-in `GITHUB_TOKEN` cannot dispatch cross-repo at all. |

If the secret is missing, the emitter **fails red** instead of skipping the
dispatch quietly. An emitter that silently does nothing is how this repo went
two months without a spec update.

No secret is required on the **receiver** (this repo): the workflow uses the
built-in `GITHUB_TOKEN` to open the PR.

## Auditing the sync state

**When was the spec last checked?** The date of the most recent
[`Spec Sync` run](https://github.com/factuarea/factuarea-node/actions/workflows/spec-sync.yml),
which the badge at the top of the [README](../README.md) links to. That date is
*not* the date of the last commit: a run that finds the spec unchanged is the
normal outcome and leaves no commit behind, so from the commit log a repo that
is checked daily and one nobody watches look the same.

**How big is the drift?** A sync PR states it in its title and body (`+N/-M
ops`), and the changeset it writes repeats the counts. The withdrawn operations
are not listed by name — read them off the `spec/openapi.json` diff, and pair
each one with its replacement in the changeset before merging.

**Is anything still watching?** `npm test` asserts, in
[`test/spec-sync.test.ts`](../test/spec-sync.test.ts), that at least one
unattended trigger — `repository_dispatch` or `schedule` — is live in
`spec-sync.yml`. `workflow_dispatch` does not count: it fires when someone
remembers, and that is the assumption that failed. The assertion has no
allowlist, so switching the last one off turns CI red instead of going unnoticed.

### Pausing a trigger

Pausing a trigger is allowed. Pausing it silently is not: the pause carries the
condition that brings it back, written so whoever reads the file next can check
it without knowing why it was paused.

```yaml
# PAUSED schedule since 2026-06-07; reactivate when: the published spec has at
# least as many paths as spec/openapi.json
# schedule:
#   - cron: "17 6 * * *"
```

The test rejects a disabled trigger with no such line, and rejects a vague one —
the date and the condition are both mandatory, so "paused for now, will re-enable
later" does not pass.

Reactivating **replaces** that note with the evidence the condition was met, and
the date it was met. The same test rejects an active trigger still carrying its
pause note, so the substitution cannot be skipped:

```yaml
# `schedule` restored 2026-08-06: published spec 345 paths vs 192 pinned, which
# satisfies the `docs == prod` condition it was paused under on 2026-06-07.
```

A pause that outlives its own condition is not caught by re-reading the comment;
nobody re-reads comments, which is how the 2026-06 pause survived two months
past the moment its condition inverted. It is caught by its effects: while one
trigger is live, the accumulated drift shows up as a sync PR whose title carries
its magnitude.
