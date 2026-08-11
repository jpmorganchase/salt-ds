# Plan 003: Guarantee every advertised MCP resource is readable

> **Historical completion record:** Do not execute this plan again. Shared
> resource serialization, producer-side catalog bounds, aggregate policy-claim
> projection, rollback coverage, and real-server tests were implemented and
> verified on 2026-08-10. Preserve the remaining text as contract rationale.
>
> **Drift check (run first):** > `git diff --stat cfa29d6e3..HEAD -- packages/mcp/src/core packages/mcp/src/server/registerResources.ts packages/mcp/src/server/projectPolicySnapshot.ts packages/mcp/src/server/__tests__/projectPolicySnapshot.spec.ts packages/mcp/src/__tests__/createServer.spec.ts`
> Also inspect `git diff --` for the exact in-scope files below because the
> reviewed implementation is uncommitted. Stop if the current excerpts differ.

## Status

- **Plan status:** DONE — implemented and release-verified 2026-08-10; later
  artifact receipts are owned by Plan 006
- **Priority:** P1
- **Effort:** L
- **Risk:** MEDIUM
- **Depends on:** Plan 002 only to serialize edits to `createServer.spec.ts`
- **Category:** protocol correctness / integrity
- **Planned at:** commit `cfa29d6e3`, 2026-08-10, including the dirty working tree

## Why this matters

The server advertises immutable catalog-record and project-policy-claim URIs,
but two valid producers can create JSON that exceeds the resource handler's
64 KiB envelope. Catalog generation and real server creation currently accept
an oversized fact; the exact record then fails only when read. A valid policy
can similarly create a claim resource around 77 KiB. The public contract must
be fail-closed before a URI is advertised: every accepted record/claim must use
one exact serializer shared by validation and `resources/read`.

## Current state

- `packages/mcp/src/server/registerResources.ts:37-47` owns the late guard:

  ```ts
  export const MAX_CATALOG_RESOURCE_READ_UTF8_BYTES = 64 * 1024;
  function boundedResourceText(uri: string, text: string): string {
    const bytes = Buffer.byteLength(text, "utf8");
    if (bytes > MAX_CATALOG_RESOURCE_READ_UTF8_BYTES) throw new Error(/*...*/);
    return text;
  }
  ```

  Despite its catalog-specific name, the same function guards catalog records,
  policy manifests/chunks/claims, and content.

- `packages/mcp/src/core/catalog/catalogSchemaV2.ts:156-173` accepts unbounded
  `name`, `aliases`, and `summary`. `buildRegistryComponents.ts:819-846` copies
  a package's unconstrained `description` to `summary`.

- `catalogWriterV2.ts:577-604` validates staged schema, cross-references, and
  other budgets, but does not serialize public non-content envelopes. Real
  server creation eventually calls `CatalogStoreV2.ensureCatalogVerified`, so
  `CatalogStoreV2.validateCrossReferences` is the common pre-publication and
  pre-server validation boundary.

- `registerResources.ts:367-394` independently constructs each non-content
  catalog envelope:

  ```ts
  JSON.stringify({
    resolved_catalog_digest: context.store.manifest.semantic_digest,
    record,
    content_resources: contentResources,
  });
  ```

  No producer uses that exact serialization before installation.

- `projectPolicySnapshot.ts:34-37` caps individual reason, documentation, and
  opaque-condition strings, while `layerDiagnostics.ts:6-11,172-193` permits
  up to 100 `use_when`, 100 `avoid_when`, and 100 documentation strings. The
  combined legal fields have no aggregate claim-payload budget.

- `projectPolicySnapshot.spec.ts:204-260` exercises one large condition array
  through the detached claim projector and merely expects it below 64 KiB.
  `createServer.spec.ts:1152-1219` reads one small real claim. Neither reaches
  the combined valid boundary. The catalog real-server test reads Button and
  one representative per family, not every possible record size.

- `packages/mcp/src/core/publicResultBudget.ts` is the local convention for
  byte-count helpers and explicit omission metadata. Resource budgets are a
  different wire contract; share the coding pattern, not the tool-result name.

## Commands you will need

| Purpose        | Command                                                                                                                                                                                                                                                              | Expected on success |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Focused tests  | `yarn vitest run packages/mcp/src/core/__tests__/catalogPublicBounds.spec.ts packages/mcp/src/core/__tests__/catalogWriterV2.spec.ts packages/mcp/src/server/__tests__/projectPolicySnapshot.spec.ts packages/mcp/src/__tests__/createServer.spec.ts --maxWorkers=1` | exit 0              |
| Catalog tests  | `yarn vitest run packages/mcp/src/core/__tests__/catalogV2.spec.ts packages/mcp/src/__tests__/registryCoverage.spec.ts --maxWorkers=1`                                                                                                                               | exit 0              |
| MCP typecheck  | `yarn typecheck:mcp`                                                                                                                                                                                                                                                 | exit 0              |
| Full MCP tests | `yarn test:ai-tooling`                                                                                                                                                                                                                                               | exit 0              |
| Budgets        | `yarn workspace @salt-ds/mcp measure:runtime-loc && yarn workspace @salt-ds/mcp measure:surface`                                                                                                                                                                     | both exit 0         |

Use scoped `yarn exec prettier --check <changed files>` and
`yarn biome check <changed files>` before completion. Do not install a new
serializer, schema, or truncation dependency.

## Scope

**In scope — only these files, plus the two explicitly named new helpers:**

- `packages/mcp/src/core/publicResourceBudget.ts` (new)
- `packages/mcp/src/core/catalog/catalogResourceEnvelope.ts` (new)
- `packages/mcp/src/core/catalog/catalogStoreV2.ts`
- `packages/mcp/src/core/build/catalogWriterV2.ts` only if the staged call site
  needs an explicit validation invocation
- `packages/mcp/src/core/__tests__/catalogPublicBounds.spec.ts`
- `packages/mcp/src/core/__tests__/catalogWriterV2.spec.ts`
- `packages/mcp/src/server/registerResources.ts`
- `packages/mcp/src/server/projectPolicySnapshot.ts`
- `packages/mcp/src/server/__tests__/projectPolicySnapshot.spec.ts`
- `packages/mcp/src/__tests__/createServer.spec.ts`
- `packages/mcp/README.md` only for an exact public-bound clarification

**Out of scope:**

- Raising 65,536 bytes, changing URI identity, or adding pagination to record
  resources.
- Catalog schema version changes or arbitrary new per-field compatibility caps.
- Reducing accepted policy-file/entry counts or changing canonical policy IR
  chunks and digests.
- Tool-result budgets, search results, catalog content-object limits, or MCP
  tool/resource names and counts.
- A generic serialization framework or test-only production hook.

## Git workflow

- Stay on `mcp`; do not reset, clean, restore, stage, commit, push, publish,
  version, or switch branches without separate authorization.
- Capture full status and scoped dirty diffs before editing. Stop on an
  unexplained overlap.
- If later authorized, use a present-tense conventional commit such as
  `fix(mcp): validate public resource envelopes`.

## Steps

### Step 1: Establish one resource-byte contract

Create `core/publicResourceBudget.ts` with a resource-specific 64 KiB constant,
UTF-8 JSON byte measurement, and an assertion that returns the already
serialized text or throws a stable internal validation error. Do not reuse the
tool-result constant merely because the numeric value matches.

Move `registerResources.ts` off its private constant/helper and use the shared
resource helper for content, catalog, and policy responses. Preserve the
current `ResourceNotFoundError` behavior for identity misses. Oversized valid
producers should be rejected earlier by later steps; the handler assertion
remains defense in depth.

Add exact-boundary tests for ASCII, multibyte text, and JSON escaping. The
measurement must be UTF-8 bytes after `JSON.stringify`, never character count
or an estimate.

**Verify:** run `catalogPublicBounds.spec.ts` and `typecheck:mcp`; both exit 0.

### Step 2: Share the exact catalog-record envelope between store and server

Create `core/catalog/catalogResourceEnvelope.ts` with one function that accepts
the verified manifest and a non-content runtime record, resolves its content
references to canonical digest-bound URIs, constructs the exact public object,
and serializes it deterministically with `JSON.stringify`. The server handler
must call this function instead of rebuilding the object.

During `CatalogStoreV2.validateCrossReferences`, after references are known to
resolve and before `ensureCatalogVerified` can succeed, serialize every
resource-ready non-content runtime record with the same function and reject if
any text exceeds the shared public resource limit. Content records retain their
existing decoded-content validation path.

Because `writeCatalogV2` validates a staged `CatalogStoreV2` before generation
installation, this common check must cause the writer to reject before it
replaces the prior root manifest. Do not duplicate a second writer-only
implementation.

Tests must cover:

- a valid normalized catalog whose package summary puts its exact envelope one
  byte over the limit;
- the largest accepted envelope at or immediately below the limit, including a
  content-reference URI and escape-heavy/multibyte strings;
- writer rejection before manifest replacement, preserving the prior manifest;
- a rebound pre-existing registry whose oversized late-family record makes the
  real `createSaltMcpServer` factory reject before returning.

Do not create an oversized invalid record by bypassing Zod and then assert the
wrong guard. The fixture must be valid under the catalog codec and must fail
specifically at the resource-envelope assertion.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/core/__tests__/catalogPublicBounds.spec.ts packages/mcp/src/core/__tests__/catalogWriterV2.spec.ts packages/mcp/src/__tests__/createServer.spec.ts --maxWorkers=1
```

Expected: exit 0; removing store validation or switching the handler back to a
separate projection makes a regression fail.

### Step 3: Make policy-claim projection aggregate-budget aware

Refactor claim projection so the exact fixed resource wrapper (`contract`,
`trust`, digest, and `claim`) and the claim record are budgeted together. Build
mandatory identity, selector, source/provenance, precedence, applicability
counts, and import-validation facts first. Add optional authored prose,
documentation entries, and opaque-condition text deterministically while
remaining bytes allow.

Apply UTF-8-aware bounds to every project-controlled string, not only the
current reason/docs/opaque text. Preserve semantic counts even when optional
text is omitted. Add explicit deterministic coverage metadata—available,
returned, and truncated/omitted sections—so a consumer never mistakes a
bounded claim for complete evidence.

Keep `projectPolicyClaimRecord` and `resources/read` on one projection path.
The read handler must not add unbudgeted project-controlled fields after the
projector checks size. If the mandatory skeleton alone cannot fit, stop rather
than silently dropping evidence referenced by tool results.

Add tests for a valid policy that combines both 100-entry condition arrays,
the maximum documentation collection, a bounded reason, multibyte text, and
JSON-escaped characters. Assert:

- snapshot/inspection succeeds;
- a real MCP client reads the advertised digest-bound claim URI successfully;
- serialized resource text is at most 65,536 bytes;
- omission metadata reports the exact available/returned counts;
- selector, source, import validation, and applicability counts remain usable.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/server/__tests__/projectPolicySnapshot.spec.ts packages/mcp/src/__tests__/createServer.spec.ts --maxWorkers=1
yarn typecheck:mcp
```

Expected: both commands exit 0; the combined-boundary policy crosses the real
resource handler and succeeds within the byte cap.

### Step 4: Run complete MCP and publication-path checks

Run the focused catalog tests, full MCP suite, runtime/public-surface budgets,
and scoped formatter/linter checks. If source is final and the operator permits
artifact generation, run `yarn release:verify:mcp`; otherwise report that the
ignored artifact receipt is pending and do not mark the release ready.

**Verify:** all commands in the command table exit 0. The public surface remains
three tools, one resource, and two templates.

## Test plan

- Unit boundary: exact UTF-8 JSON resource measurement at below/equal/above
  limits, with escape-heavy and multibyte inputs.
- Catalog integration: exact shared envelope for every non-content family,
  writer rollback, and real factory rejection.
- Policy integration: maximal valid combined fields read through an MCP client
  with explicit omission coverage.
- Negative tests must assert the intended error/message and prove they reached
  store/projector validation, not an earlier malformed-fixture guard.

## Done criteria

- [x] One resource-specific byte constant and exact serializer govern all reads.
- [x] Catalog writer and real server reject an oversized valid record before a
      resource URI can be advertised.
- [x] Accepted policy claims always serialize at or below 65,536 UTF-8 bytes.
- [x] Policy omission is explicit and mandatory evidence remains intact.
- [x] Handler and producer/store use the same catalog and claim projections.
- [x] Focused/full tests, typecheck, LOC/surface budgets, and scoped checks pass.
- [x] No public name/count/schema-version change and no out-of-scope file edit.
- [x] This plan's index row is `DONE` with the verification date.

## STOP conditions

Stop and report if:

- a mandatory catalog/claim evidence skeleton exceeds the limit;
- fitting the payload requires changing a field path already returned in tool
  evidence without an explicit compatibility decision;
- the only proposed solution is to raise the public limit or weaken catalog or
  policy input validation;
- a staged writer can install the generation before the envelope check;
- current source no longer matches the excerpts; or
- verification fails twice after one focused correction.

## Maintenance notes

Any field added to a catalog resource or policy claim must go through the exact
shared projector and its boundary tests. Schema-level field caps may still be
useful for domain semantics, but they are not a substitute for measuring the
final escaped UTF-8 envelope that crosses MCP.
