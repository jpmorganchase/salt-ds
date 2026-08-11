# Plan 002: Make project discovery bounded and fail closed

> **Historical completion record:** Do not execute this plan again. The bounded
> allocation, fail-closed nearest-package resolution, bounded worker pool, and
> real-server regressions were implemented and verified on 2026-08-10. Preserve
> the remaining text as implementation rationale and test ownership.
>
> **Drift check (run first):** > `git diff --stat cfa29d6e3..HEAD -- packages/mcp/src/core/project/boundedProjectFile.ts packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts packages/mcp/src/server/projectContext/saltInstallation.ts packages/mcp/src/__tests__/projectContextInstallation.spec.ts packages/mcp/src/__tests__/createServer.spec.ts`
> Then run the same path list with `git diff --` because this plan was written
> against an intentionally dirty working tree whose changes are not represented
> by `HEAD`. If the excerpts below do not match, stop and reconcile the plan.

## Status

- **Plan status:** DONE — implemented and verified 2026-08-10
- **Priority:** P1
- **Effort:** M
- **Risk:** MEDIUM
- **Depends on:** none
- **Category:** correctness / integrity / performance
- **Planned at:** commit `cfa29d6e3`, 2026-08-10, including the dirty working tree

## Why this matters

Salt package discovery currently combines three independently bounded inputs
in a way that creates an unbounded live-resource burst: up to 128 package
resolutions run at once, and each tiny manifest receives a 1 MiB read buffer.
The resolver also climbs past an invalid closest installed package and can
report a healthy hoisted ancestor even though the closer package directory
shadows it in real Node resolution. This plan keeps all existing descriptor,
mutation, containment, and diagnostic guarantees while making resource use
small and invalid nearest candidates fail closed.

## Current state

- `packages/mcp/src/core/project/boundedProjectFile.ts:172-203` verifies the
  descriptor size but allocates from the configured cap:

  ```ts
  const stats = await handle.stat({ bigint: true });
  if (stats.size > BigInt(input.maxUtf8Bytes)) {
    /* oversized */
  }
  // ...identity verification...
  const bytes = Buffer.alloc(input.maxUtf8Bytes + 1);
  ```

  For `MAX_PACKAGE_JSON_BYTES`, every small manifest therefore reserves
  1,048,577 bytes. The same function's post-read `handle.stat`, descriptor
  snapshot comparison, and named-path recheck are recent required protections.

- `packages/mcp/src/server/projectContext/saltInstallation.ts:781-818`
  continues ancestor search for every result except `valid`:

  ```ts
  const inspection = await inspectPackageJsonFile(/* candidate */);
  if (inspection.status === "valid") return inspection.path;
  // climbs toward absoluteAllowedRoot for both absent and invalid
  ```

  `inspectPackageJsonFile` already distinguishes `absent` from invalid reasons
  such as malformed, oversized, linked, outside-root, and concurrently changed.
  The caller currently discards that distinction.

- `saltInstallation.ts:845-903` uses one `Promise.all` over every selected
  package, then calls `readPackageJsonFile` after the successful resolver has
  already parsed the same manifest.

- `packages/mcp/src/core/build/catalogInputInventory.ts:264-278` is the local
  worker-pool exemplar: a bounded number of workers increment a shared index,
  write results by original index, and await one `Promise.all` over workers.
  Match that small pattern; do not add a dependency or generic queue class.

- `packages/mcp/src/__tests__/projectContextInstallation.spec.ts` already owns
  temporary package-layout fixtures and distinguishes valid, absent, invalid,
  contained, outside-root, workspace, and PnP behavior. Extend this file rather
  than creating a detached resolver test.

## Commands you will need

- Focused tests: `yarn vitest run packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts packages/mcp/src/__tests__/projectContextInstallation.spec.ts packages/mcp/src/__tests__/createServer.spec.ts --maxWorkers=1` → exit 0; all selected tests pass.
- MCP typecheck: `yarn typecheck:mcp` → exit 0 with no diagnostics.
- Full MCP tests: `yarn test:ai-tooling` → exit 0.
- Format check: `yarn exec prettier --check packages/mcp/src/core/project/boundedProjectFile.ts packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts packages/mcp/src/server/projectContext/saltInstallation.ts packages/mcp/src/__tests__/projectContextInstallation.spec.ts packages/mcp/src/__tests__/createServer.spec.ts` → exit 0.
- Lint check: `yarn biome check packages/mcp/src/core/project/boundedProjectFile.ts packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts packages/mcp/src/server/projectContext/saltInstallation.ts packages/mcp/src/__tests__/projectContextInstallation.spec.ts packages/mcp/src/__tests__/createServer.spec.ts` → exit 0 with no errors.

Do not install or update dependencies. The current repository uses Yarn 4,
TypeScript, and Vitest; no new package is needed.

## Scope

**In scope — the only files to modify:**

- `packages/mcp/src/core/project/boundedProjectFile.ts`
- `packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts`
- `packages/mcp/src/server/projectContext/saltInstallation.ts`
- `packages/mcp/src/__tests__/projectContextInstallation.spec.ts`
- `packages/mcp/src/__tests__/createServer.spec.ts`

**Out of scope:**

- Public tool names, input/output schemas, result shapes, or error codes.
- Workspace-pattern, package-manager, Yarn PnP, and policy semantics.
- Catalog filesystem readers or a shared filesystem abstraction.
- Executing package-manager resolution code.
- Raising the 128-package inspection cap or the 1 MiB per-file acceptance cap.
- Weakening link count, `dev`/`ino`, size, `mtimeNs`, `ctimeNs`, UTF-8,
  containment, or post-read named-path checks.

## Git workflow

- Stay on the current `mcp` branch. Do not switch, reset, clean, restore, stage,
  commit, push, publish, or version packages unless the operator separately
  authorizes it.
- Before editing, save `git status --porcelain=v1 --untracked-files=all` and
  the scoped diffs. After every step, confirm no file outside the in-scope list
  changed.
- Commit style, if later authorized, is conventional and present tense, for
  example `fix(mcp): bound project package discovery`.

## Steps

### Step 1: Allocate bounded project reads from observed descriptor size

In `readBoundedProjectFile`, validate that `maxUtf8Bytes` is a non-negative
safe integer before converting it to `BigInt` or allocating. After the opened
descriptor is proven to be a single-link regular file and its observed size is
within the cap, allocate `Number(stats.size) + 1` bytes instead of
`maxUtf8Bytes + 1`.

The extra byte must remain so growth after the opening stat is observable.
Retain the existing loop until EOF/cap-plus-one and every pre/post descriptor
and named-path comparison. A short read is not success unless EOF is reached.

Add a focused regression in `boundedProjectFile.spec.ts` that observes the
requested allocation size through the file-handle seam already used by the
same-length mutation test. It must demonstrate that a tiny file does not
allocate the configured maximum. Existing growth, same-length mutation,
hard-link, rebound-path, and unavailable-identity cases must pass unchanged.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/core/project/__tests__/boundedProjectFile.spec.ts --maxWorkers=1
yarn typecheck:mcp
```

Expected: both commands exit 0; removing the descriptor-sized allocation or
post-read stat makes a focused test fail.

### Step 2: Preserve the closest-candidate result instead of returning a path

Replace `resolveDeclaredPackageManifestPath`'s path-only success/failure
contract with an internal discriminated result that can represent:

- a valid manifest, including its canonical path and already parsed value;
- an absent candidate package directory, which permits the next ancestor;
- a present but absent/uninspectable manifest, which blocks ancestor fallback.

Check the candidate package directory itself with bounded, no-follow,
contained filesystem semantics before deciding that it is absent. Continue
upward only when the entire candidate package directory is absent. If a closer
directory exists but its manifest is missing, malformed, oversized, linked,
outside the authorized root, unreadable, or changed during inspection, return
an unverifiable resolution. Do not include absolute paths or raw JSON in the
public issue text.

Reuse the valid `inspectPackageJsonFile` result in `resolveDeclaredPackages`.
Do not `realpath` and parse the same manifest a second time. Retain the checks
that its `name` equals the requested package and its version is a non-empty
string before treating it as resolved.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/__tests__/projectContextInstallation.spec.ts --maxWorkers=1
```

Expected: exit 0; an invalid closest package never resolves to a valid ancestor,
while ordinary hoisting still works when every closer package directory is
genuinely absent.

### Step 3: Bound package-resolution concurrency while preserving order

Add one small internal constant for package-resolution concurrency (prefer a
single-digit value). Implement the same indexed worker-loop shape used by
`catalogInputInventory.ts`: at most that many asynchronous resolutions may be
live, and results must be stored at the original package index so diagnostics
remain deterministic.

Do not add a third-party limiter, server-global scheduler, timing deadline, or
test-only production parameter. If observability is needed, instrument the
existing file/open seam in tests, not a new public API.

Add coverage with 128 tiny valid installed Salt manifests. Assert the returned
order matches declarations and peak concurrent descriptor opens never exceeds
the internal worker limit. The test must fail if the implementation returns to
the package-wide `Promise.all`.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/__tests__/projectContextInstallation.spec.ts --maxWorkers=1
```

Expected: exit 0; the maximum-count fixture is deterministic and bounded.

### Step 4: Cross the real MCP inspection and retained-context boundary

In `createServer.spec.ts`, use the existing protocol-client/project-fixture
helpers to inspect a nested workspace package with:

- a valid declared Salt dependency;
- a malformed closest installed package manifest; and
- a valid hoisted ancestor manifest with a plausible matching version.

Assert `inspect_salt_project` succeeds as a protocol call but reports limited,
unverifiable/unresolved installation evidence rather than `verified_healthy`.
Reuse the returned context handle in `review_salt_code` and assert the rejected
ancestor version is not present in version-specific review provenance.

Also retain one real-server happy-path assertion proving valid ordinary
hoisting still resolves. Platform-gate only link/junction fixture creation for
documented privilege errors; malformed JSON coverage must run everywhere.

**Verify:**

```powershell
yarn vitest run packages/mcp/src/__tests__/createServer.spec.ts --maxWorkers=1
yarn typecheck:mcp
yarn test:ai-tooling
```

Expected: all commands exit 0; both the fail-closed and valid-hoist paths cross
production server registration and tool execution.

## Test plan

- `boundedProjectFile.spec.ts`: safe-integer input bound, descriptor-sized
  allocation, growth after stat, same-inode/same-length mutation, and all
  existing identity/link cases.
- `projectContextInstallation.spec.ts`: malformed closest manifest, present
  directory with missing manifest, linked/outside-root closest candidate,
  genuinely absent closer directories, maximum package count, deterministic
  order, and peak concurrency.
- `createServer.spec.ts`: real MCP inspect/review regression and valid hoisted
  control.
- Do not mock `resolveDeclaredPackageManifestPath`; the regression must reach
  `inspectPackageJsonFile` and `readBoundedProjectFile`.

## Done criteria

- [x] Tiny files allocate from observed size plus one byte, not the acceptance cap.
- [x] Every existing post-read descriptor/named-path mutation test still passes.
- [x] Ancestor search continues only when the closer package directory is absent.
- [x] Valid manifest bytes are parsed once and reused.
- [x] Peak package-resolution concurrency is bounded and result order is stable.
- [x] A real MCP client cannot receive a healthy hoisted version behind an
      invalid closest package.
- [x] Focused tests, MCP typecheck, full MCP tests, formatting, and lint pass.
- [x] `git status` shows no change outside the five in-scope files and preserved
      pre-existing work.
- [x] This plan's index row is `DONE` with the verification date.

## STOP conditions

Stop and report if:

- descriptor-sized allocation would require removing the post-read metadata
  comparison, cap-plus-one growth detection, or named-path reauthorization;
- ordinary Node hoisting cannot be distinguished from a present shadowing
  package directory without executing package-manager code;
- the fix requires a public tool schema/result change;
- an in-scope current hunk no longer matches the excerpts; or
- verification fails twice after one focused correction.

## Maintenance notes

Any future increase to `MAX_RESOLVED_SALT_PACKAGES` must be reviewed together
with the worker count and per-file cap. Any new package marker must preserve the
absent-versus-invalid distinction through its caller; a typed lower-level
result is ineffective if a resolver collapses it back to path-or-null.
