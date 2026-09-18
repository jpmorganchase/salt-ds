# Plan 001a: Reuse the CLI and MCP names after unused test snapshots

> **Archived complete:** This approved one-shot compatibility decision is
> preserved for provenance only and dispatches no work. Use the
> [current plan index](../../README.md) for active authority.

**Status:** APPROVED on 2026-08-27 by the package owner.

## Scope

This compatibility addendum closes Plan 001 Unit 00a's package-identity STOP
condition. It applies only to `@salt-ds/cli` and `@salt-ds/mcp`. It does not
change the product architecture, public v1 contracts, package graph, MCP ship
decision, or release sequence in Plan 001.

## Registry facts and owner decision

The read-only registry preflight found six `@salt-ds/cli` and thirteen
`@salt-ds/mcp` versions. Every version is a `0.0.0-snapshot-<timestamp>` build
from the Salt repository with npm integrity and provenance. No stable version
exists. The package owner confirmed these versions were tests and are not used.

The names are therefore reused. The snapshots are pre-stable test artifacts,
not supported APIs, and create no runtime, command, wire, migration, or alias
compatibility obligation. `@salt-ds/knowledge` remains a clean unclaimed name.

## Closed compatibility policy

`tooling/ai/snapshot-package-compatibility-v1.json` is the machine-readable
authority. It allowlists the exact version sets, dist-tags, Salt repository
directories, absence of deprecations, and required integrity/provenance. The
namespace receipt binds its digest. Before the first protected release, any
additional version, changed tag, missing integrity/provenance, foreign
repository, or pre-existing stable version is a STOP condition.

Unit 00a performs no registry write. The first registry transition remains
under Plan 001's protected publisher. It must re-read the exact registry state,
deprecate every allowlisted test snapshot, and create a successor namespace
policy. A shipped package publishes no version below `1.0.0`, activates the
reviewed stable cohort, and removes the old `snapshot` tag. If MCP is omitted,
the protected transition publishes no MCP version and removes both legacy MCP
dist-tags. Neither path preserves test payloads or exposes compatibility shims.

## Completion conditions

- The live preflight classifies CLI and MCP as
  `owned_compatible_test_snapshots` and Knowledge as `safe_absent`.
- The compatibility policy and namespace receipt are schema-valid and
  digest-bound.
- Hostile fixtures reject an extra version, stable version, altered tag,
  unapproved repository directory, missing integrity, and missing provenance.
- Plan 001 language consistently says “no stable release,” rather than “never
  published.”
