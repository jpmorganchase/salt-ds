# Plan 002: Add secure historical Salt knowledge resolution only after current-version GA

> **Successor correction — 2026-08-30:** This file is deferred design history,
> not executable authority. Its Plan-001/09b/09c, scanner, MCP, R2/R3, selector,
> and command references describe the superseded original launch design. No Unit
> 002 work may be dispatched until Plan 003 has completed, its actual activation/
> current-authority/public-discovery receipts validate, owners approve the Unit
> 00 gates, and a new tracked re-planning pass replaces every stale selector and
> verification command with the contracts that actually shipped. A placeholder
> row or old Plan 001 receipt cannot satisfy that re-plan.
>
> **Executor instructions:** This plan is intentionally deferred. Unit 00 may
> start only after every Unit 00 entry gate below is approved and
> `plans/README.md` records Plan 001/09c `DONE`, its discovery-deployment final
> receipt, and a concrete drift checkpoint after that completion. Units
> 00–01 are evidence-producing preflight; they do not expose a public command,
> contact a production origin, or publish. Implement one ordered code-bearing
> unit per branch/PR, subject only to Unit 04's bounded release lifecycle:
> implementation+Changeset PR, plan-control active-plan update, generated
> version PR, landed-rebind evidence update, ordinary-only protected dispatch
> and evidence update, historical-R2 protected dispatch and completion update.
> Unit 05 introduces no source implementation after the fence; it separates a
> non-mutating post-R2 fixture-confirmation checkpoint, protected activation,
> plan-control authority update, one bounded post-activation navigation/docs PR,
> normal docs deployment/readback, and completion update. Plan-control updates
> may change only tracker/index bytes;
> protected dispatch refs may change no source. Any other multi-ref expansion is
> a STOP condition. Read this file completely and Plan 001 only as historical rationale;
> the selector-pinned live current-authority contracts named below are
> implementation authority, with Plan 001/09b's immutable R3 activation retained
> only as the required ancestry anchor. Preserve the
> shipped offline current-bundle path, exact-or-unknown compatibility, path
> containment, package/provenance, and scanner isolation. Stop on any STOP
> condition; do not invent a signing, rollback, or compatibility shortcut.

> **Plan 002 drift check (run before every execution unit):** Read that unit's
> concrete checkpoint from `plans/README.md`; the `Planned at` SHA below is audit
> evidence only. If the tracker still says `set after...`, STOP. Verify the
> checkpoint and every dependency completion SHA are ancestors of `HEAD`, then
> inspect all post-checkpoint changes in the selector-pinned live contracts and Plan 002
> scope. Never fall back to Plan 001's original planning commit.
>
> PowerShell:
>
> ```powershell
> $plan2Checkpoint = "<checkpoint-sha>"
> if ($plan2Checkpoint -notmatch "^[0-9a-f]{40}$") { throw "Set the full Plan 002 unit checkpoint from plans/README.md" }
> git rev-parse --verify "$plan2Checkpoint^{commit}"
> if ($LASTEXITCODE -ne 0) { throw "Invalid Plan 002 unit checkpoint" }
> git merge-base --is-ancestor $plan2Checkpoint HEAD
> if ($LASTEXITCODE -ne 0) { throw "Plan 002 checkpoint is not an ancestor of HEAD" }
> git diff --stat "$plan2Checkpoint..HEAD" -- plans package.json yarn.lock .gitignore .changeset .github/workflows packages/knowledge packages/cli packages/mcp scripts tooling site README.md AGENTS.md docs evals examples workflow-examples
> git status --short --untracked-files=all
> ```
>
> POSIX shell:
>
> ```sh
> plan2_checkpoint="<checkpoint-sha>"
> case "$plan2_checkpoint" in
>   ''|*[!0-9a-f]*) echo "Invalid Plan 002 checkpoint" >&2; exit 2 ;;
> esac
> test "${#plan2_checkpoint}" -eq 40 || { echo "Use the full Plan 002 checkpoint SHA" >&2; exit 2; }
> git rev-parse --verify "${plan2_checkpoint}^{commit}" >/dev/null
> git merge-base --is-ancestor "$plan2_checkpoint" HEAD
> git diff --stat "${plan2_checkpoint}..HEAD" -- plans package.json yarn.lock .gitignore .changeset .github/workflows packages/knowledge packages/cli packages/mcp scripts tooling site README.md AGENTS.md docs evals examples workflow-examples
> git status --short --untracked-files=all
> ```
>
> Expected result: the checkpoint resolves, is an ancestor, contains every
> dependency, and post-checkpoint plan changes are limited to the plan-control
> transition that dispatched the unit. Reconcile any other package/schema,
> release/workflow, trust/origin, support, or public-contract drift before work.
> Never reset, restore, stash, clean, or overwrite user work.

## Status

- **Status:** DEFERRED — Plan 003 completion, post-release re-plan, product
  mandate, candidate vector, and owners are absent
- **Priority:** P2
- **Effort:** L — security-sensitive multi-phase follow-on
- **Risk:** HIGH — introduces a network/cache trust path and long-lived metadata operations
- **Depends on:** Plan 003 completion plus validated activation/current-authority/
  public-discovery receipts, a post-Plan-003 re-plan, and the Unit 00 gates below
- **Category:** direction / compatibility / supply chain / CLI / release / tests
- **Planned at:** commit `8c3bd5f1b`, 2026-08-26; full re-plan required after
  Plan 003

## Why this is separate

Plan 001 deliberately ships one exact transitive `@salt-ds/knowledge` bundle.
`info`, `scan`, `docs`, `context`, Skill reads, and any shipped MCP are offline and never
silently select `latest` or a nearby version. Historical support adds a mutable
mapping, downloaded untrusted bytes, persistent trust state, revocation, key
rotation, cache ownership, and executable-semantics compatibility. Treating
that as a late unit of current GA would either delay the useful product or hide
a materially larger security boundary.

This plan adds historical data only if Salt can operate it safely. It may be
rejected without changing Plan 001's success criteria.

## Non-negotiable decisions

1. Historical resolution is explicit and exact-or-fail. No ordinary command
   contacts the network and no resolver uses `latest`, nearest, or an unverified
   index entry.
2. Downloaded bundles are declarative data. Executable readers, analyzers, and
   rules ship only in provenance-verified npm package code.
3. Matching Salt package ranges is insufficient. Each operation requires a
   compatible reader contract, analyzer contract, and exact installed ruleset
   implementation allowlist.
4. Historical bundles default to retrieval-only. `scan` and, if Plan 001
   shipped it, MCP review are enabled only when the executing package contains
   and tests every exact rule implementation declared by that bundle.
5. Choose the least powerful distribution mechanism that satisfies approved
   requirements. Prefer a package-embedded immutable vector map or an explicit
   local bundle+digest over any mutable remote mapping. Use a maintained,
   independently reviewed TUF implementation only when Unit 00 proves that
   mapping/revocation must change independently of npm releases. Never create a
   bespoke signing protocol merely because detached signatures appear simpler.
6. Anti-rollback trust state is durable security state, separate from disposable
   bundle cache. Deleting a cache must not reset accepted metadata history.
   Ordinary sync never infers first use from a missing file: a user must run the
   explicit offline trust-initialization command before the first sync.
7. Only CLI's explicit `knowledge sync` path writes downloaded bundles on the
   remote-TUF track. The knowledge library validates/reads; any shipped MCP is
   offline and read-only.
8. Reuse Plan 001's single protected publication state machine, global
   `salt-publication` lock, verified npm provenance, immutable web paths, and
   guarded compare-and-swap promotion. Add no second publisher.
9. Private signing material, bearer credentials, raw response headers, and
   secrets never enter the repository, npm packages, bundle cache, logs, or
   receipts.
10. A compromised local account or rolled-back local disk is outside the
    network-replay guarantee. State that limitation plainly; do not market the
    design as tamper-proof local storage.

## Sequenced entry and activation gates

### Unit 00 entry gates

All must be true before Unit 00 is dispatched. They authorize documentation and
local spikes only, not public commands, production network access, signing, or
publication:

- Plan 001/09c is `DONE`; its tracker-acquired
  `discovery-deployment-final-receipt` proves live navigation/readback/crawl over
  the exact 09b R3 authority. The outer manifest, strict digest codec,
  operation-capability fields, release state machine, and support ownership are
  stable.
- Product and design-system leadership provide a written discovery mandate for
  one named candidate historical source tag/package-vector hypothesis, with a
  provisional owner, backup, and proposed EOL. This is not yet a support claim.
- Release, platform, and security name provisional reviewers for the Unit 00
  trust/origin spike and approve use of local fixtures only.
- The Plan 002 Unit 00 tracker row has a concrete post-09c default-branch
  checkpoint containing all approvals and Plan 001 completion evidence.
- The tracker records one exact live current-release authority descended from
  Plan 001 Unit 09b R3: its final receipt plus re-exposed immutable final-MCP,
  effective-selected-graph, and effective-package-doc parents. Unit 09b is the
  initial authority and 09c proves its public discovery, but neither is a
  permanent hard-coded current unit. Their digests must equal
  the parent fields inside the selected live receipt.
  Plan 002 has no MCP work or MCP package dependency when that final value is
  `omit`.

### Activation gates

These are outputs of Units 00, 01, and 04; they do not gate Unit 00. Unit 00 must
ratify one distribution choice and, only for the remote track, the TUF/profile
and threat-model choices before Unit 01. Unit 04 requires
approved origin, root custody, threshold-signing, monitoring, and incident
duties before any protected-environment release. Every item below and the
sealed Unit 04 historical R2 final/drill receipts gate Unit 05 and the R3
activation transition. They do not control initial scheduling status: once the
entry gates above are approved, the tracker moves Plan 002 from `DEFERRED` to
`TODO`, and dispatch moves it to `IN PROGRESS` under the normal tracker rules.

- `docs/ai/support-matrix.md` names at least one complete historical vector
  across the frozen 13-family universe, an authoritative reviewed source tag
  plus full commit with proven tag-to-commit equality, owner and backup,
  end-of-support date, compatibility evidence, and reproducible generation
  receipt.
- A Salt-controlled HTTPS origin supports immutable no-overwrite digest paths,
  bounded readback, atomic/CAS metadata promotion, retention, and incident
  response.
- Release/platform/security owners accept signing-root custody, threshold
  approvals, rotations, expiry monitoring, revocation, durable-client-state,
  cache, support, and recovery duties.
- If and only if `historical_distribution` is `remote-tuf`, a maintained
  Node-compatible TUF client can meet the repository's license, bundle, Node
  22/24, offline-test, and security requirements. If not, reject the remote
  track; do not substitute a bespoke signature protocol.
- A historical build proves reader compatibility and declares whether each of
  `search`, `docs`, `context`, `project_facts`, `scan`, and `review` is supported,
  retrieval-only, partial, or disabled.
- Product/release owners accept that unsupported historical scan/review returns
  explicit partial/failed coverage instead of current rule semantics.
- The site AI guide, knowledge and CLI READMEs, and support matrix contain the
  same exact supported vectors, operations, EOL, provenance, setup, offline
  behavior, and limitations. The docs-authoring, site-build, web-artifact, and
  live-link verifiers gate activation; no support claim exists only in an ADR.

## Live current-authority contract preflight

Before Unit 00, inspect and record the exact committed/package versions and
digests of these landed artifacts; do not implement from unstamped Plan 001
examples:

- `docs/decisions/0001-salt-ai-knowledge-platform.md` and
  `docs/ai/knowledge-bundle.md`;
- `packages/knowledge/schemas/knowledge-manifest-1.schema.json`,
  `item-applicability-1.schema.json`, and
  `operation-capabilities-1.schema.json`, plus
  `packages/cli/schemas/scan-result-1.schema.json` and
  `salt-config-1.schema.json` as packed in R3;
- `packages/knowledge/src/manifest/digestCodec.ts` and the landed package-root
  read-only bundle resolver API;
- `packages/knowledge/src/compatibility/operationCapabilityRegistry.ts` and exact current
  reader/analyzer/ruleset contract IDs;
- `.github/workflows/publish-salt-ai.yml`,
  `scripts/schemas/saltAiReleaseReceiptV1.schema.json`, and the sealed R3 release
  receipt identified by the release owner;
- the Plan 001 Unit 07 candidate recommendation plus Unit 08c final MCP
  disposition and effective two- or three-package release-graph receipts;
- `docs/ai/release-runbook.md` and the landed package/web ownership table.

Unit 00 stores these identities in ADR 0002. If a path, schema, ownership rule,
or receipt differs from this plan's assumptions, update/review Plan 002 before
implementation; never silently follow stale planning prose.

## Distribution decision before architecture

Unit 00 prototypes one exact historical vector through all four choices and
emits `historical-distribution-decision-v1.json`:

| Choice           | Mechanism                                                                                       | Use when                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `packaged-map`   | Immutable vector→bundle map and bytes released inside `@salt-ds/knowledge`                      | Supported history may advance with normal npm releases; simplest default               |
| `explicit-local` | User supplies an exact local bundle path plus expected digest; no discovery or network          | Expert/offline or private one-off use; provenance remains explicit and limited         |
| `remote-tuf`     | Explicit CLI sync resolves a mutable signed map into durable trust state and a disposable cache | Mapping, revocation, or EOL must change independently of npm and operations are funded |
| `reject`         | No historical product                                                                           | Demand, ownership, provenance, compatibility, or operational evidence is insufficient  |

Compare setup steps, consumer reach, provenance, offline behavior, update/EOL/
revocation latency, recovery, implementation size, dependencies, ongoing key/
origin duties, and measured task value. `remote-tuf` requires written evidence
that at least one approved requirement cannot be met by `packaged-map` or
`explicit-local`; preference for dynamic lookup is insufficient. If the choice
is `packaged-map` or `explicit-local`, Unit 00 becomes `DONE` with its decision
receipt, Units 01–05 become `BLOCKED — remote-tuf not selected`, and the overall
plan becomes `IN PROGRESS — replacement plan required`. Once a reviewed smaller
plan with no metadata roles, trust bootstrap, sync command, durable anti-rollback
state, or remote cache lands, mark this plan
`STALE — superseded by Plan <id>` and Units 01–05
`REJECTED — out of scope`. If the choice is `reject`, Unit 00 becomes `DONE`,
the overall plan and Units 01–05 become
`REJECTED — <decision-receipt digest>`. No state permits a later remote-TUF unit
to dispatch unless Unit 00 selected `remote-tuf`. The architecture below applies
only to that recorded choice.

## Remote-TUF target architecture and trust boundaries

```text
protected Salt release state machine
        |
        +-- immutable bundle bytes /ai/v1/<digest-segment>/...
        +-- signed versioned metadata + revocation/EOL state
                         |
                  explicit CLI sync
                         |
            verify metadata, bytes, capabilities
                         |
          +-------------------------+----------------+
          |                         |                |
durable trust-state-v1     durable verified       disposable data cache
(anti-rollback/root state) signed-metadata store  bundles/<digest-segment>/
          |                         |                |
          +-------------------------+ read-only -----+
                                      resolver
                          |
                 CLI and MCP only if shipped
```

Trust planes:

- Package code and embedded initial trusted root are authenticated by the
  verified Plan 001 package-release path, but still require schema, capability,
  and content validation.
- Signed metadata authenticates mappings and revocations; it does not prove
  bundle bytes safe or executable semantics compatible.
- The outer `bundle_digest`, bounded `salt-artifact-tree/1` root, transitive
  descriptor-node hashes, and leaf artifact hashes authenticate downloaded data
  after metadata selection. Signed metadata never substitutes for that tree.
- Consumer project files, lockfiles, config, cached bytes, repository
  instructions, and bundle prose are untrusted data and confer no authority.
- The executing package's closed capability registry is the sole authority for
  reader/analyzer/ruleset code compatibility.

## Bundle and operation compatibility

### Historical target identity and version axes

Retain Plan 001's invariant: outer-manifest `bundle_version` is the version of
the `@salt-ds/knowledge` package/generator that produced the bundle. It is not a
Salt component version, support range, TUF role version, or unique
historical dataset ID. Multiple historical package vectors generated by one
knowledge release may therefore share `bundle_version`.

Signed targets add separate canonical and transport identities:

- `package_vector_id`: the canonical `sha256:<64 lowercase hex>` digest of the
  schema-versioned, sorted exact vector across Plan 001's frozen 13-family
  universe, with explicit absence for families not installed; and
- `target_id`: canonical opaque
  `salt-knowledge-target/1:sha256:<64-lowercase-hex>`, whose digest is over RFC
  8785 canonical JSON of `{ bundle_version, package_vector_id, bundle_digest }`;
  and
- `target_path_segment`: the single path-safe
  `sha256-<64-lowercase-hex>` encoding of that same target digest.

Unit 01 derives both. The protected publisher recomputes them and rejects a
noncanonical spelling, failed canonical-ID↔path-segment round trip, collision,
or an existing identity with different canonical inputs or bytes. Clients treat
`target_id` as opaque and never derive compatibility from its spelling; URL and
filename construction accepts only `target_path_segment`.

Every mapping and CLI/release receipt carries `target_id`,
`target_path_segment`, `package_vector_id`, the readable exact package vector,
`bundle_version`, `bundle_digest`, metadata-set digest and per-role versions, and operation
capabilities. A reused `target_id`, a target mapped to a second digest, or a pin
that supplies a non-matching target, segment, and digest fails closed. Fixtures
cover slash/backslash, percent-encoding, case, Unicode, extra-prefix, truncated,
and alternate-separator aliases plus digest/segment collisions.

Plan 001 outer manifests already declare:

```json
{
  "reader_contract": "salt-knowledge-reader/1",
  "analyzer_contract": "salt-artifact-analyzer/1",
  "ruleset": {
    "id": "salt-rules-current",
    "version": "1.0.0",
    "digest": "sha256:...",
    "required_rule_implementations": ["salt/navigation-target@1"]
  },
  "operation_capabilities": {
    "search": "supported",
    "docs": "supported",
    "context": "supported",
    "project_facts": "supported",
    "scan": "supported",
    "review": "supported"
  }
}
```

Extend the executing package with a versioned, code-owned capability registry.
It maps an exact reader/analyzer/ruleset tuple and operation to an installed,
tested implementation. Remote metadata can narrow or disable capability; it
can never add an implementation to this allowlist.

Resolution rules:

1. Validate the outer schema and traverse the complete bounded artifact tree
   before exposing any operation. Reject cycles, repeated nodes, dangling
   children, path collisions, non-canonical ordering, budget/count mismatches,
   and any requested artifact without exactly one verified leaf descriptor.
2. Require a supported reader contract for all operations. Unknown schemas or
   readers fail closed; do not reinterpret them with a nearby reader.
3. Permit `search`/`docs`/`context` only if their declared data contracts and
   mandatory item-applicability map are supported.
4. Permit `project_facts` only if its analyzer contract is supported for that
   historical package-manager/package-vector evidence.
5. Permit `scan`/`review` only if the installed provenance-backed code contains
   every exact required rule implementation and its declared digest/behavior
   receipt. Never execute bundle JavaScript or silently run current rules over
   old declarative rule metadata.
6. A disabled historical operation reports a stable limitation. Retrieval may
   remain complete while scan is partial/failed; surfaces must not collapse
   those claims into one “supported” label.
7. If Plan 001 shipped MCP, it may expose historical reads/review only for the
   same explicit pinned bundle and identical capability decision as CLI.
   Otherwise MCP is absent from this plan; an omitted adapter is not recreated
   merely to expose historical data.

## Signed metadata and durable anti-rollback contract

### Required TUF profile for the remote track

Unit 00 selects a maintained implementation and records the exact supported
[TUF specification/profile](https://theupdateframework.github.io/specification/latest/).
Package the initial trusted root in
`@salt-ds/knowledge`. Define offline root custody, online timestamp/snapshot/
targets roles, threshold counts, expiry durations, consistent snapshots,
delegations by release channel, revocation/EOL targets, clock-skew policy, and
incident rotation. An index/targets document can never introduce its own trust
key.

Accept root rotation only when the new root version is strictly increasing and
meets both old-root and new-root thresholds. Old clients must either validate a
complete sequential rotation chain within configured bounds or fail safely;
they never skip to an untrusted latest root.

Remote metadata parsing has non-negotiable maxima before Unit 02: root 256 KiB,
timestamp 64 KiB, snapshot 256 KiB, each targets/delegated role 1 MiB, 8 MiB
aggregate verified metadata per sync, 16 signatures and 32 keys per role, 1,024
targets per role and 4,096 aggregate, 16 delegated roles, delegation depth 2,
64 JSON nesting levels, 64 KiB per string, and 32 sequential root versions per
sync. Unit 00 may lower but not raise them. Enforce response/content lengths and
streamed counters before allocation and before signature/key/target expansion;
a validly signed oversized role still fails without changing trusted state.
Hostile fixtures exceed each byte/count/depth/rotation ceiling by one and cover
unknown algorithms, duplicate keys/signatures/targets, and compressed/chunked
transport that tries to evade the bounds.

### No bespoke cryptographic fallback

If the maintained TUF implementation cannot satisfy the approved remote-track
requirements, select `packaged-map`, `explicit-local`, or `reject` and revise
the plan. HTTPS plus a detached signature and key ID is not an acceptable
shortcut, and this plan does not authorize a custom cryptographic protocol.

### Durable client state

Store owner-readable/writable security state in the OS application-state
directory, never the cache directory, keyed by a collision-resistant encoding
of canonical origin and channel:

```text
<state-root>/<origin-channel-key>/
├── trust-state-v1.json
├── trusted-metadata-v1/
│   └── snapshots/<signed-metadata-set-digest>/...
└── pending-acceptance-v1.json
```

`trusted-metadata-v1` contains immutable, fully verified signed role bytes; its
set digest covers role name, canonical version, length, and hash. It is not a
disposable HTTP cache. `trust-state-v1.json` contains at least:

- trusted-root version and digest;
- highest accepted standard TUF version for root, timestamp, snapshot, targets,
  and every accepted delegated role;
- accepted canonical signed-role digest keyed by `(role, version)` for
  same-version/different-bytes equivocation detection;
- `maximum_observed_wall_time`, a local monotonically nondecreasing clock high-
  water mark recorded at successful verification, not a remotely signed field;
- last successful metadata role versions/digests and expiry values;
- the accepted signed-metadata-set digest;
- schema version and atomic-write generation.

First use is an explicit offline action, never an inference from absence.
`salt-ds knowledge trust initialize` validates an approved origin/channel
against packaged policy, copies only the root embedded in the installed
provenance-verified official package, creates generation zero plus the verified
metadata store, and emits a local audit receipt. It refuses an existing or
corrupt state. Under a parent/origin lock it builds the complete state/root/
initialization-receipt directory as an owner-only private sibling, fsyncs it and
the parent where supported, then atomically renames the directory into the
previously absent `<origin-channel-key>` path; a losing concurrent initializer
fails without overwrite. Ordinary `sync` refuses any missing/corrupt/
uninitialized state with recovery guidance; it never silently bootstraps or
resets high-water data.
A separately approved recovery command/process may replace state only with
explicit operator acknowledgement and fresh trusted-root evidence, and records
a local audit receipt. Deleting every application-state copy can make a later
explicit initialization indistinguishable from a new installation; that local
account/disk rollback is outside the network-replay threat model and must be
documented plainly.

Historical offline freshness is a closed state machine using the earliest
expiry among the accepted trusted root, timestamp, snapshot, controlling
targets/delegated role, and support EOL. `fresh` means more than 72 hours remain: supported pinned
operations return their normal code. `stale-warning` means greater than zero and
at most 72 hours remain: operations still run offline, machine results include
the exact expiry/state, and human mode warns on stderr without contaminating
stdout. At or after expiry, `expired-blocked` makes every target-using historical
`info`/`docs`/`context`/`scan`/`review`/Skill/MCP call fail with coverage status
and exit/code 3; only read-only `knowledge status` succeeds to report recovery,
and explicit `sync` may refresh. An expired trusted root blocks every target-
using offline operation, but `sync` may still use that already-trusted root only
to attempt the specification-ordered, sequential dual-threshold root-update
chain; it accepts no timestamp/target or bundle until the final root is
unexpired. Failure to reach an unexpired root reports
`root-expired-freeze-blocked` and changes no accepted target/cache state.
`known-revoked` blocks immediately regardless
of cached bytes. A wall clock more than five minutes behind durable
`maximum_observed_wall_time` is `clock-untrusted-blocked` until approved recovery or
successful trusted sync; it never re-enters fresh state merely because time
moved backwards. There is no post-expiry grace or fallback target. Tests cover
both warning boundaries, exact expiry for every role including root, expired-
root recovery success/failure, EOL, revocation, offline restart, and clock
rollback for every surface and machine reason code.

One CLI-private transaction owns acceptance and has exactly two schema-tagged
variants. Both acquire the per-origin/channel exclusive lock, verify the complete
candidate metadata chain in memory, re-read durable state, reject any lower
standard TUF role version or `(role, version)` with different canonical signed
bytes, install/fsync the immutable metadata snapshot, journal prior/proposed
state generations plus metadata-set digest, and atomically replace/fsync
`trust-state-v1.json`. That replacement is the single metadata/high-water commit
point.

- `metadata_only` journals no target, bundle, staging, or cache identity. After
  the trust-state commit it clears the journal and emits a metadata-only receipt.
  Newly accepted revocation/EOL state affects every resolver immediately even
  though no bundle was downloaded.
- `bundle` first verifies one selected target into private staging and journals
  its `target_id`, bundle digest, and staging identity. After the trust-state
  commit it revalidates and runs the cache-generation transaction below, then
  clears the journal only after the active-cache pointer and cleanup state are
  reconciled.

A crash before the common trust-state commit leaves the old accepted state
authoritative and recovery removes unreferenced staging/metadata. A metadata-
only crash after commit finishes journal cleanup without inventing a target. A
bundle crash after commit never rolls state back: status reports accepted
metadata with the requested bundle missing, and identical per-role versions/
digests may resume the bundle transaction only after full revalidation. A crash
after bundle rename revalidates the final entry and clears the journal. Recovery
and sync receipts name `transaction_variant`; the read-only resolver exposes
neither staged nor partial bytes.
Restart, bundle-cache deletion, stale ETag, clock rollback, and concurrent sync
must preserve the accepted state and signed metadata.

## Resolution metadata and cache

Signed targets map exact or explicitly tested package vectors to immutable
outer-manifest URLs and canonical `sha256:<64 lowercase hex>` digests. Metadata binds source
identity, `target_id`, `package_vector_id`, readable vector,
bundle/schema/contracts, operation capabilities, EOL, revocation, and receipts.
Selection applies mandatory item applicability and prerelease rules from Plan 001. It never treats the signed mapping as proof of artifact bytes.

Cache layout is one cross-platform contract:

```text
<cache-root>/
└── bundles/
    └── sha256-<64-lowercase-hex>/
        ├── manifest.json
        ├── ...complete tree-selected files...
        └── cache-receipt.json
```

The strict Plan 001 codec converts canonical digest values to path segments;
no path contains `:` or an encoded/slash variant. The knowledge library owns
containment, schema/hash/byte revalidation, read-only resolution, stable lock-
path derivation, and the OS-backed shared/exclusive lease primitive used by
every process. CLI owns network I/O, private staging, exclusive writer/
transaction orchestration, fsync/atomic commit, and eviction. MCP imports only
the knowledge read lease and resolver; it never writes or syncs.

Historical cache v1 is whole-bundle only. A sync may stream or resume bounded
transport ranges into private staging, but it must fetch the outer manifest,
every reachable descriptor node, and every ordinary artifact; validate the
complete tree, counts, bytes, hashes, and absence of unlisted files; then rename
one complete directory atomically. No reader, search shard, pin, or operation
can observe a partial tree or staging path. Selective artifact download is a
future protocol revision, not an implicit optimization in this plan.
It consumes the exact landed Plan 001 artifact-tree policy—depth 4, 256 internal
children, 256 leaf entries, 64 KiB per node, 512 nodes, 8 MiB canonical tree
bytes, and 40,000 artifacts—and may only lower those ceilings in the Unit 00
decision receipt. Raising or independently redefining one is a STOP condition.
Hostile tests exceed each limit by one and prove rejection before allocation or
trusted-state/cache mutation.

Cache v1 defaults to at most eight active committed bundles and 512 MiB total, with
absolute ceilings of 16 bundles and 1 GiB; Unit 00 may lower these values after
measuring the candidate but must ratify exact numbers before Unit 02. Enforce
both count and bytes before download and after decompression. The active-set
limits are steady-state logical limits; an atomic update may retain the old set
plus at most one fully bounded staged bundle. It must preflight enough physical
headroom for that whole bundle and journal, and fail before download if the
reserve is unavailable. Eviction runs under the cache lock and is deterministic least-recently-verified-use, with
`target_id` as the tie-breaker. “Use” means the last successful explicit
`knowledge sync` verification/commit only; ordinary reads never update durable
metadata. Sync timestamps are not part of bundle identity. All processes lock a
stable origin/cache lock outside any evictable directory: a resolver holds a
shared OS-backed lock for its entire multi-file operation, while sync/eviction
holds the exclusive lock. Locks have a bounded acquisition timeout, are released
by the OS on process death, and fall back to exclusive-for-all on a platform
without reliable shared locks. Read-only acquisition writes no lease or access
metadata. A config pin fixes the target identity
for resolution—it is not a permanent cache-residency promise. If exact pinned
bytes were evicted, offline commands return an actionable failed-coverage/code-3
result naming the exact `knowledge sync` recovery; they never fall back to
current or another target. Disk exhaustion before the cache commit leaves every
previously active bundle unchanged and cleans private staging on recovery
(accepted high-water metadata may already require the documented resume path).

The cache transaction is explicit. Under the exclusive lock, select victims
without deleting them; write/fsync a journal containing the old active index,
new quota-valid index, staged bundle, and victim identities; rename/fsync the
verified bundle into its immutable digest directory; then atomically replace/
fsync `active-cache-v1.json`. That pointer replacement is the only cache commit
point. Before it, recovery removes the new/staged directory and preserves the
entire old set. After it, recovery keeps the complete new active set and deletes
only journal-listed unreferenced victims; a crash during victim deletion may
leave ignored garbage but never a partially visible active set. Clear the
journal last. Never delete a victim to create staging space.

Tests cover quota boundaries, deterministic ties, a pinned-but-evicted target,
two-process read/sync/eviction and lock timeout/process death, crash restart,
corrupt access metadata, and ENOSPC/crash at every journal, new-directory,
pointer, and victim boundary. They prove readers observe either the complete old
set or complete new quota-valid set. Byte-for-byte/mtime snapshots prove pinned
`info`, `docs`, `context`, `scan`, `review`, `knowledge status`, Skill reads, and
any shipped MCP leave cache, trust state, and eviction metadata unchanged.

Downloaded descriptor-node and artifact paths must be normalized relative
regular files: reject absolute,
drive/UNC, `..`, encoded separators, links/junctions, special files, duplicate
normalized/case-folded names, hard-link aliasing, replacement races, and
unlisted bytes. Enforce connection/read/total/per-file limits, artifact count,
content type, decompression ratio if compression is approved, redirects, and
same-origin policy before allocation/commit. Never cache credentials, auth
headers, cookies, mutable metadata as bundle identity, or secrets.

## CLI contract

Commands added only by this plan:

```shell
salt-ds knowledge status [root] --json
salt-ds knowledge trust initialize --origin <approved-origin> --channel <channel> --json
salt-ds knowledge sync [root] --metadata-only --json
salt-ds knowledge sync [root] --workspace-unit <workspace-unit-id> --target <target-id> --digest <sha256:...> --json
salt-ds knowledge sync [root] --workspace-unit <workspace-unit-id> --pinned --json
salt-ds knowledge sync [root] --all-units --target <target-id> --digest <sha256:...> --json
salt-ds knowledge pin [root] --workspace-unit <workspace-unit-id> --target <target-id> --digest <sha256:...> --dry-run
salt-ds knowledge pin [root] --workspace-unit <workspace-unit-id> --target <target-id> --digest <sha256:...>
salt-ds knowledge pin [root] --all-units --target <target-id> --digest <sha256:...>
```

- `status` is offline/read-only and reports installed package evidence, current
  bundled candidate, exact pin, cache/trust-state health, capability per
  operation, revocation/EOL information already known locally, and stable
  limitations. From already accepted signed metadata it lists compatible
  candidate target IDs/digests per `workspace_unit_id`, including why a target is
  ineligible; discovery never requires a cache hit. Historical results name all
  target/version axes above. It never says “current” without a verified signed
  metadata-set digest and validated per-role versions.
- `trust initialize` is offline but intentionally writes durable security state.
  It accepts only a packaged approved origin/channel and the installed embedded
  root, refuses overwrite/corruption, and emits the versioned initialization
  receipt on stdout. It does not fetch metadata or create a bundle cache entry.
- `sync` is the only network path. `--metadata-only` fetches/verifies and accepts
  signed metadata, reports the per-unit compatible candidate IDs, and downloads
  no bundle. A bundle sync names exactly one target: `--workspace-unit` plus
  `--target`/`--digest`, the same unit plus `--pinned`, or explicit
  `--all-units` plus one target/digest. It downloads/verifies/commits exact
  bytes, persists signed metadata/trust state and cache in the acceptance order
  above, and emits a sanitized receipt naming scope, unit IDs, and every target/
  version axis. Omitted scope is allowed only for one discovered unit and is
  normalized to that ID in the receipt. Network failure may use only an already
  validated exact cache hit; never a nearby target.
- There is no multi-target or partial-success sync in v1. Heterogeneous roots
  must run one explicit `--workspace-unit` command per target. `--all-units`
  succeeds only when the one named complete vector is compatible with every
  discovered unit; otherwise it exits 1 and prints the exact per-unit candidate
  commands without metadata/cache/config mutation beyond a separately requested
  successful `--metadata-only` acceptance. A bundle-sync failure exits 3 and
  exposes no new cache entry; its receipt distinguishes accepted-metadata/
  missing-bundle resume state from a wholly pre-acceptance failure.
- `pin --dry-run` shows the validated mutation without writing. The write form
  is explicit, preserves valid recognized unrelated `salt.config.json` fields,
  rejects unknown/invalid config under the versioned schema, and atomically
  writes an exact target ID/digest under the normalized root-relative
  `workspace_unit_id`. The config is a map, not one root-global pin: sibling
  workspace units may deliberately resolve different complete historical
  vectors. A pin is exact-or-fail and never interprets `bundle_version` as a
  unique historical target.
- `--workspace-unit` is required whenever discovery returns more than one unit.
  A single-unit project may omit it only when the resolver records that exact
  unit ID in the mutation receipt. `--all-units` is explicit and succeeds only
  when every discovered unit is compatible with the same complete target
  vector; it writes one independently auditable map entry per unit. A root-wide
  scalar, parent-directory inheritance, nearest-pin fallback, partial fan-out,
  or silent current-bundle fallback is forbidden. Heterogeneous roots report
  the incompatible unit IDs and exact per-unit commands without mutation.
- `info`, `scan`, `docs`, `context`, `skill`, MCP startup, and ordinary project
  use remain network-disabled. A configured historical pin resolves only from
  verified local bytes and durable accepted metadata state.

Workspace fixtures include two sibling applications pinned to different exact
vectors, an unpinned sibling, renamed/removed units, ambiguous ownership,
single-unit shorthand, rejected heterogeneous `--all-units`, and successful
homogeneous `--all-units`. Every `info`, retrieval, scan, review, and optional
MCP result carries the same `workspace_unit_id` and target/vector identity used
by Plan 001's workspace-aware scanner. Tests also cover metadata-only candidate
discovery, exact pinned recovery, rejection of an unscoped multi-unit sync, and
two sequential heterogeneous per-unit syncs with no partial aggregate mode.

Exit codes extend Plan 001:

| Code | Historical command meaning                                                                 |
| ---- | ------------------------------------------------------------------------------------------ |
| 0    | Completed; exact target/status/pin or dry-run operation succeeded, including no-op dry run |
| 1    | Completed lookup but no compatible approved target                                         |
| 2    | Usage/config error                                                                         |
| 3    | Signature/root/rollback/revocation/integrity/capability/cache/system failure               |

Machine stdout contains only the versioned result. Network/security diagnostics
go to stderr without secrets. Successful trust initialization exits 0; invalid
arguments/origin/channel syntax exit 2; existing, corrupt, unauthorized, or
non-atomically writable trust state exits 3 without overwrite. Revocation policy
is operation- and severity-specific, documented, and fail-closed for known
unsafe bundles.

## Git, package versioning, and clean package gates

Keep one execution unit in one branch/PR and advance the reserved tracker only
through the post-merge plan-control update. Never commit historical source
materializations, generated bundles, `dist`, cache/trust state, TUF working
metadata, keys, credentials, or unsanitized pilot output.

Plan 001 R3's landed `yarn build:ai-tooling` is the prerequisite for every
Plan 002 pack or `smoke:consumer --skip-build` command. It rebuilds knowledge,
CLI, and MCP only if Plan 001 shipped it, topologically from a fresh checkout in
the same job; no unit may reuse `dist` from an earlier unit or CI job. `yarn
build` remains the stricter alternative when a gate also needs the full
repository.

Changesets and exact internal dependencies remain cohort-wide. Reuse Plan 001's
landed planned/applied release-partition contract and generic protected
publisher; do not create a historical target selector or call unfiltered
`changeset publish`. First record the selector-pinned live effective dependency graph and
final MCP disposition; if it differs from knowledge → CLI plus MCP only when
finally shipped, STOP and review this matrix rather than guessing. Any packed
schema/runtime/root-policy byte change in `@salt-ds/knowledge` must include
knowledge plus exact dependant `@salt-ds/cli` and `@salt-ds/mcp` only when
shipped in the reviewed Changeset/version rehearsal, even if an adapter's source
did not change. Never hand-edit built versions or publish one member with a
stale exact dependency.

Units 01–03 build only under the closed `historical-development@1` pack
profile. The staging transform assigns every changed AI package a
digest-derived `0.0.0-history-dev.<digest-segment>` identity, exact-pins staged
dependants to those identities, marks the report `publishable: false`, records
`release_version: null`, and preserves the source manifest version only as
`published_baseline_version`. These tarballs may be installed by local smoke but
cannot satisfy a release partition, provenance gate, or publisher. Unit 04's
reviewed Changeset/version application removes this profile and creates the
first release-candidate identities. Tests prove a default-branch build with
unversioned historical changes cannot be confused with or published as the
same bytes as the live package version.

| Unit | Changeset file                                           | Required package treatment                                                                                                                                                                                |
| ---- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 00   | none                                                     | Decision/docs/spike only; any publishable package byte is a STOP condition                                                                                                                                |
| 01   | none; sealed cumulative version-intent receipt           | Remote-TUF track only: record intended Knowledge/CLI minors and shipped-MCP exact-dependant treatment; use only nonpublishable `historical-development@1` identities                                      |
| 02   | none; extend cumulative version-intent receipt           | Record intended Knowledge minor, CLI patch/minor closure, and shipped-MCP exact-dependant treatment under the same nonpublishable profile                                                                 |
| 03   | none; extend cumulative version-intent receipt           | Record intended CLI minor plus any Knowledge change and all selected exact dependants under the same nonpublishable profile                                                                               |
| 04   | consolidated `.changeset/plan-002-historical-support.md` | Materialize the reviewed cumulative Knowledge/CLI/(shipped MCP) bumps immediately before the final plan; README/template intent is authored before versioning and target-bound bytes after versions apply |
| 05   | none                                                     | Package-byte changes are a STOP condition; route a fix through a preceding/new versioned implementation unit before repeating the pilot                                                                   |

Each PR records affected packages, version intent, before/after exact dependency
versions, clean `build:ai-tooling` result, and candidate receipt identities where
that command exists. Units 01–03 add no AI Changeset, and the protected
publisher/partition policy rejects their unversioned AI source refs; unrelated
ordinary Changesets remain releasable. Unit 04 verifies the chained intent
receipts, creates one consolidated reviewed Changeset over the effective graph,
and only then authorizes a final version plan. Unit
04 rehearses `yarn changeset version --snapshot history` in an approved
disposable branch/environment and proves knowledge bumps update every selected
exact dependant; it does not publish.

This deliberate intent window never blocks an urgent current-version security
fix. If one is required after a Unit 01–03 merge, pause Plan 002 and cut it from
the last tracker-approved published current-release ref, excluding all
unversioned historical work. Invoke the separately reviewed successor/current-
maintenance plan required by Plan 001's one-R2 boundary; the launch machinery
alone is not authorization. After its terminal selector lands, merge its
version/changelog source back and run the authority-rebase classifier. A
contract-identical version-only descendant preserves prior evidence and becomes
the next unit's explicit parent; other drift invalidates only from the earliest
unit in the closed matrix below. Never edit or “reconcile” Unit 00's frozen
decision baseline in place. A non-security current AI release follows the same
classifier. After Unit 04 creates the active freeze, use the stricter
abandon/withdraw lifecycle below. Publishing unversioned historical bytes
incidentally is forbidden. If the repository cannot perform this isolated
protected current release without a second publisher, STOP Plan 002 before Unit 01.

Unit 00 specifies and Unit 01 adds `scripts/verifySaltAiHistoryVersions.mjs`, published
`scripts/schemas/saltAiHistoryVersionCohortReceiptV1.schema.json`, and root
`verify:salt-ai-history-versions`. Every unit first runs the clean build and
pack checker; the latter atomically creates the ignored `unitNN` report parent.
Only then may `changeset status --output` write beside that report. Every unit
atomically reacquires and verifies the complete live current-authority set.
Units 01–03
use those as topology parents for a cumulative version-intent receipt and create
no release partition. Unit 04 alone runs a fresh `planned
--selection-profile effective` partition against its consolidated Changeset,
current source ref, and those topology parents. The verifier validates all
schemas, parent digests, source SHA, and fresh pack report. It may narrow but
never reinterpret the ordinary/AI graph.

Immediately before each Unit 04 planned partition,
`materialize:salt-package-version-intent --plan 002 --mode unit-04-cumulative`
joins the Unit 03 intent with Unit 04's exact source/pack/support diff and emits
one cumulative Unit 04 intent. The partition must consume that receipt; the
later `queued` verifier checks the partition and consolidated Changeset against
the same pre-existing intent. This ordering forbids a partition↔verifier cycle.

The verifier has four closed modes. `intent` is used in Units 01–03: Unit 01
requires the tracker-acquired `remote-tuf` distribution-decision receipt, and
later intents inherit it through the previous immutable intent. The mode also
requires zero Plan 002 AI Changesets, the current pack/source diff, the effective graph,
and the previous intent after Unit 01; it emits the cumulative
required bump/dependant ledger. `queued` is used only in Unit 04 and requires
the pre-partition cumulative Unit 04 intent, one consolidated Changeset equal to
that ledger, and the fresh planned partition. Unit 04 reads
`mcp_history_mode: "absent" | "enabled" |
"current-only"` from the approved vector descriptor. `absent` is mandatory when
Plan 001 disposition was `omit`; the other values are legal only when it was
`ship` and decide the conditional MCP Changeset. Because a shipped adapter pins
Knowledge exactly, both `enabled` and `current-only` produce a new MCP package
identity when Knowledge changes. Neither may reuse Plan 001's byte/version-bound
MCP receipt. Unit 04 must emit a successor disposition bound to the new graph;
`absent` emits an equally explicit absence proof.
`applied` is used after the disposable/version PR consumes those Changesets; it
requires no pending package Changesets and proves the resulting knowledge, CLI,
and selected MCP version/dependency pin against the pre-version plan receipt. It
also emits a Plan-001-compatible effective-selected-graph receipt containing the
new exact package versions, dependency pins, final MCP mode, and predecessor
graph/partition digests. Premerge, landed, and protected runs must reproduce the
same graph bytes.
`unchanged` is used in Unit 05; it requires no new Changeset and no published-
package byte/source diff since the tracker-recorded Unit 04 version-applied
checkpoint. Missing/excess bumps, a caret/tilde/tag/workspace protocol in packed
manifests, a stale exact dependant, missing pack report, or identity mismatch is
a STOP condition.

## Historical evidence command contract

Unit 00 creates the schema-validated candidate source descriptor
`tooling/ai/historical-vectors/first-supported.json`. It contains the approved
tag and full source commit, exact package vector, expected source inventory
policy, generator/reader/analyzer/ruleset contract IDs, size limits, owner/EOL,
closed `historical_distribution`, closed `mcp_history_mode`, one exact
`decision_authority_baseline` object containing the release, final-MCP, effective-graph,
and effective-package-doc plan/unit/kind/receipt digests, one exact Plan-001/09b
`initial_r3_ancestor` selector, and one exact Plan-001/09c
`current_discovery` selector. The atomic live authority acquisition must equal
all four `decision_authority_baseline` entries, its three parent digests must equal the
selected release receipt, and its release chain must descend from
`initial_r3_ancestor`. The discovery final receipt must validate and prove the
public launch of that ancestor; it is not substituted for live authority. The
descriptor contains no mutable branch name. The full commit must already exist
in the reviewed checkout/object database; no script silently fetches it.

Unit 04 authors
`tooling/ai/historical-support/first-supported.template.json`; the reviewed
version PR materializes the separate release authority
`tooling/ai/historical-support/first-supported.json`, validated by
`scripts/schemas/saltAiHistoricalSupportDescriptorV1.schema.json`. It is bound
to the produced target rather than a source hypothesis and contains: the exact
13-family vector and `package_vector_id`; `target_id`, `bundle_version`, bundle/
semantic/compiler/ruleset digests; reader/analyzer/ruleset contracts; capability
and coverage status for every operation; provenance/source/generation receipts;
EOL and review dates; primary/backup owners; approved channel-neutral support
destination; limitations; final MCP mode; frozen historical route contract; and
`activation_required: true`. It never
claims mutable activation state: the resolver may select the target only after
a matching signed mapping plus higher-version signed `active` support
attestation is live. Salt treats the vector as officially supported only after
the terminal activation receipt and authority/lease tracker transaction exist;
the discovery receipt separately gates the wider launch announcement and plan
completion. Every public support table and
package/site projection is generated or parity-checked against this descriptor.

Derived bytes do not feed back into that descriptor. A separate
`saltAiHistoricalProjectionReceiptV1`, outside every knowledge bundle, binds the
descriptor SHA-256, Plan 001 effective package-doc inventory parent, exact
package README/manifest hashes, site/Markdown/`llms.txt` route hashes, current
and historical web artifact digests, route-map hash, and isolated-overlay or
tracked generation mode. Unit 04 updates
`tooling/ai/public-package-docs-v1.json` for the affected Knowledge/CLI and
conditional MCP entries, then seals one new effective package-doc receipt. The
historical R2 receipt parents the descriptor, projection, effective package-doc,
and selector-pinned live current release receipts. No descriptor or generated public projection
contains its own hash, a projection-receipt hash, or a final release-receipt
hash.

The commands below are root `package.json` scripts with closed argument schemas
and stable receipt paths. Their implementations and receipt JSON Schemas live in
`scripts/` and `scripts/schemas/`; every output is ignored CI evidence under
`dist/salt-ai-history/`, never a committed bundle:

| Command                                      | Introduced                  | Contract                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify:salt-ai-history-decision`            | 00                          | Compare all four distribution choices against frozen requirements/costs, bind the Plan 001 release graph and candidate vector, register its Plan-002 decision kind with the generic evidence acquirer, and emit one schema-valid nonpublication decision receipt                                                                                                              |
| `verify:salt-ai-history-authority-rebase`    | 00                          | Atomically compare a live current-authority selector with the decision baseline/previous rebase, classify contract/topology/version drift by the closed invalidation matrix, and emit an immutable rebase or STOP receipt; Unit 04 can freeze the accepted release parent                                                                                                     |
| `manage:salt-ai:authority-freeze`            | 04                          | Under `salt-publication`, CAS/read back the shared publication coordinator's current-authority generation and one same-kind freeze lease through `create-active`, `assert-active`, or a closed terminal transition; the tracker is an audit mirror, never the concurrency primitive                                                                                           |
| `verify:salt-ai-history-versions`            | 01                          | Seal cumulative intent against the landed effective graph in Units 01–03, then join Unit 04's fresh partition and pack report; reject stale/missing/excess package treatment                                                                                                                                                                                                  |
| `test:salt-ai-history-mcp`                   | 04                          | Derive `absent`/`current-only`/`enabled` from the reviewed vector and emit packed SDK-host, root-isolation, offline, security, and claimed-capability evidence; `absent` proves no selected MCP package or historical adapter surface                                                                                                                                         |
| `verify:salt-ai-history-mcp-final`           | 04                          | Join Plan 001's predecessor disposition, the successor graph, exact MCP package/version/Knowledge pin or absence, pack/smoke, and capability evidence into one Plan-001-compatible successor disposition; landed/protected runs must rebind it byte-for-byte                                                                                                                  |
| `materialize:salt-ai-history`                | 01                          | Verify the descriptor's signed/approved tag resolves to its full commit, use `git archive` to create a new data-only source root, reject links/submodules/LFS placeholders/special files, and seal its inventory; no network                                                                                                                                                  |
| `build:salt-ai-history`                      | 01                          | Read only the built current `dist/salt-ds-knowledge` generator and the materialized historical source root; emit one declarative bundle and generation receipt                                                                                                                                                                                                                |
| `verify:salt-ai-history`                     | 01                          | Compare two isolated builds, schemas, inventories, capabilities, target/vector/bundle axes, and byte identity; emit the determinism receipt                                                                                                                                                                                                                                   |
| `candidate:salt-ai-history`                  | 01                          | Orchestrate fresh materialization plus two builds and verification for later units; emit `<output>/candidate-receipt.json`                                                                                                                                                                                                                                                    |
| `acquire:salt-ai-history-evidence`           | 01                          | Resolve only a tracker-recorded Plan 002 unit/kind immutable locator plus SHA-256; apply a closed kind-specific validator and reject fields that are inapplicable to that receipt type                                                                                                                                                                                        |
| `acquire:salt-ai:current-authority`          | Plan 001/09c                | Reuse the Plan 001 command: read the tracker token's exact evidence-index digest, require one unexpired four-entry reserved current-authority set with closed parent equality, acquire all four immutable receipts atomically, and emit an exact selector receipt; it is the only command allowed to discover the live set without a pre-authored tuple                       |
| `verify:salt-ai:current-authority`           | Plan 001/09c                | Reuse and extend the Plan 001 command: dispatch by the selector-pinned release receipt schema/stage to the frozen current-R3, current-maintenance, historical-activation, or historical-maintenance validator, then prove the same exact MCP/graph/docs parents and live state; permits recursive maintenance without treating a maintenance receipt as an activation receipt |
| `finalize:salt-ai:historical-support`        | 04                          | Materialize a target-bound, digest-cycle-free support descriptor from the reviewed template plus exact candidate in `fixture`/`tracked`, or prove the landed candidate reproduces the tracked descriptor in `rebind`; fixture output is ignored and tracked output is allowlisted source                                                                                      |
| `project:salt-ai:historical-support`         | 04                          | Generate an isolated fixture overlay or allowlisted tracked package/site/web projections from one descriptor and emit `saltAiHistoricalProjectionReceiptV1` after hashing all outputs                                                                                                                                                                                         |
| `seal:salt-public-package-docs`              | 04                          | Extend Plan 001 with closed `historical-fixture`, `historical-tracked`, and `historical-rebind` modes that parent its effective inventory and bind exact projected README/manifest bytes                                                                                                                                                                                      |
| `validate:salt-ai:historical-support`        | 04                          | Validate descriptor, effective package-doc inventory, projection receipt, candidate/release parents, and public-claim parity without mutation                                                                                                                                                                                                                                 |
| `seal:salt-ai-history-mapping-input`         | 04                          | Seal the content-addressed, unsigned production mapping/signing input and later verify its immutable upload/readback receipt; never accesses keys or live metadata                                                                                                                                                                                                            |
| `rehearse:salt-ai-history`                   | 04                          | Require candidate plus joined version/pack/smoke/projection evidence and exercise only a closed fake-provider or uncredentialed preparation path; it never publishes                                                                                                                                                                                                          |
| `verify:salt-ai:historical-release-receipt`  | 04                          | Validate the versioned historical receipt chain, exact state/stage, selector-pinned live current-release parent, cohort, descriptor/projection, web/target, provenance, and CAS parent digests                                                                                                                                                                                |
| `pilot:salt-ai-history`                      | 05                          | Run every claimed operation in the tracked sanitized app matrix against one exact rehearsal receipt; emit per-operation evidence                                                                                                                                                                                                                                              |
| `drill:salt-ai-history`                      | 05                          | Run the tracked expiry/replay/revocation/rotation/recovery/incident scenario matrix; emit state-transition evidence                                                                                                                                                                                                                                                           |
| `eval:salt-ai:history`                       | 05                          | Validate the pilot receipt, derive and bind its `fixture`/`protected` mode (the command rejects a mode argument), run the frozen capability subset, and emit complete metrics tied to the same target                                                                                                                                                                         |
| `sign:salt-ai-history-production-metadata`   | 05                          | In the protected environment, perform only `stage-pending-activation`, `attest-historical-activation`, refresh, rotation, or forward-revocation; threshold-sign bounded roles into immutable staging and bind the precommitted activation ID, support state, commit digest where applicable, monotonic versions, and exact retained mapping/content                           |
| `verify:salt-ai-history-production-metadata` | 05                          | Validate an unexposed staged generation or an exposed readback; enforce pending→strictly-higher active-attestation ordering, stable activation ID/mapping/content, activation-commit binding, thresholds/expiry, and preservation or explicit forward-revocation during maintenance                                                                                           |
| `rehearse:salt-ai-history-maintenance`       | 05                          | Against the closed fake provider, execute either metadata-only refresh or sequential dual-threshold root rotation, crash at each boundary, prove forward recovery, and emit a nonproduction maintenance rehearsal receipt                                                                                                                                                     |
| `verify:salt-ai-history-maintenance-receipt` | 05                          | Validate rehearsal or protected maintenance operation, exact four-entry current-authority parent set, monotonic role versions, immutable staging/live readback, expiry margin, metadata-only non-mutation, and forward-recovery state                                                                                                                                         |
| `verify:salt-ai-history-activation`          | 04 readiness / 05 protected | In closed modes, join fixture readiness, protected pilot/drill/eval gates, or successful activation+lease+coordinator evidence; emit distinct tooling-ready, activation-gate, or authority-commit receipts without conflating them                                                                                                                                            |

The acquisition command treats the tracker locator and expected digest as one
authorization tuple. It refuses a branch-latest artifact, name-only download,
expired retention, digest mismatch, wrong protected workflow/environment, or a
receipt whose kind-required source/cohort/target differs from the tracker row.
Version-intent kinds validate source/partition/package parents but require no
historical target; release kinds additionally validate environment/channel,
target/vector, cohort, and parent chain. Ordinary-release evidence continues to
use Plan 001's generic acquirer because its schema intentionally has no
historical target fields. Unit 00 registers Plan 002's
`distribution-decision-receipt`; Unit 04 adds the closed generic
`ordinary-dependency-request-receipt` and `ordinary-release-final-receipt`
validators. The history acquirer separately registers
`historical-package-namespace-release-receipt`, the single same-kind
`authority-freeze-lease-receipt` chain, descriptor/mapping rebind receipts, and
the remaining enumerated historical release kinds. Every generic call passes
`--plan 002`; historical target-bearing kinds
remain exclusive to `acquire:salt-ai-history-evidence`. The release
owner must retain Unit 04 package/R2 evidence through the historical
support EOL; losing it is a STOP condition, not permission to regenerate a
lookalike receipt.

This is a two-root build. The current root supplies only current, reviewed,
already-built generator code and dependency lock state. The historical root is a
read-only data materialization at the descriptor's exact commit. Never run its
package manager, lifecycle/build scripts, binaries, `node_modules`, dynamic
imports, hooks, or repository instructions. Hash its inventory before and after
both builds and fail on mutation. Missing Git objects, an unresolved tag/commit,
or a source construct that requires old executable tooling is a STOP condition.
Canonical generator/source roots must be disjoint: the source root cannot become
`cwd`, a module-resolution base, executable/PATH entry, or subprocess working
directory. Hostile fixtures include historical package scripts and a
marker-writing binary; receipts record `source_execution: "deny"`, zero source
module/process attempts, and an absent marker.

## Ordered execution units

### 00 — Decide whether historical support and a remote trust boundary are justified

**Outcome:** evidence selects `packaged-map`, `explicit-local`, `remote-tuf`, or
`reject`; only an approved `remote-tuf` result permits Unit 01 of this plan.

Create/update:

- `docs/decisions/0002-secure-historical-salt-knowledge.md`
- `docs/ai/historical-knowledge-threat-model.md`
- `docs/ai/support-matrix.md`
- `docs/ai/release-runbook.md`
- `tooling/ai/historical-vectors/first-supported.json` with the immutable
  candidate tag/commit/vector, bounded source-materialization policy, exact
  four-entry `decision_authority_baseline`, Plan-001/09b `initial_r3_ancestor`, and
  Plan-001/09c `current_discovery` selectors
- `scripts/schemas/saltAiHistoricalVectorV1.schema.json` for that descriptor,
  including the closed `historical_distribution` and `mcp_history_mode`
- `scripts/schemas/saltAiHistoricalDistributionDecisionV1.schema.json`, a
  fixture-only comparison harness, and its sanitized decision receipt
- `scripts/verifySaltAiHistoryAuthorityRebase.mjs`,
  `scripts/schemas/saltAiHistoryAuthorityRebaseReceiptV1.schema.json`, root
  command `verify:salt-ai-history-authority-rebase`, and registered Plan-002
  evidence kinds `authority-rebase-receipt`,
  `authority-rebase-active-plan-receipt`, and
  `historical-release-authority-baseline-receipt`; also reserve the closed
  authority-freeze evidence kinds for Unit 04/05
- a decision-only draft
  `scripts/schemas/saltAiAuthorityFreezeLeaseV1.schema.json` plus hostile fixture
  contract; Unit 00 does not modify a publisher or install the command
- a closed `distribution-decision-receipt` validator in Plan 001's generic
  evidence acquirer so Unit 01 can fail closed before building any runtime change
- candidate metadata/trust/cache/config schema sketches and hostile-fixture
  inventory for cost/threat review only; no runtime package code
- Plan 002 Unit-04 premerge→landed pairs and the Unit-05 discovery pair in
  `tooling/ai/premerge-evidence-pairs-v1.json`, with registry-validation fixtures;
  no premerge evidence may be emitted before this registry update lands
- ratified status/owner notes and successor checkpoint policy in the already
  reserved Plan 002 tracker in `plans/README.md`

The Plan-002 registry extension is closed to these pairs:

```text
002/04 release-partition-applied-premerge -> release-partition-applied
002/04 historical-version-applied-premerge-receipt -> historical-version-applied-receipt
002/04 historical-effective-selected-graph-premerge-receipt -> historical-effective-selected-graph-receipt
002/04 historical-mcp-final-premerge-receipt -> historical-mcp-final-disposition-receipt
002/04 historical-support-descriptor-artifact -> historical-support-descriptor-rebind-receipt
002/04 historical-support-projection-premerge-receipt -> historical-support-projection-receipt
002/04 effective-public-package-docs-premerge-receipt -> effective-public-package-docs-receipt
002/04 pack-report-premerge -> pack-report
002/04 current-web-release-premerge-receipt -> current-web-release-receipt
002/04 production-mapping-signing-input-premerge-artifact -> production-mapping-signing-input-rebind-receipt
002/04 ordinary-dependency-request-premerge-receipt -> ordinary-dependency-request-receipt
002/05 historical-discovery-deployment-candidate-premerge-receipt -> historical-discovery-deployment-landed-candidate-receipt
```

The ADR records the measured four-way decision, first vector/EOL,
owners/backups, user demand, provenance, capability needs, and final MCP mode.
For `remote-tuf` it additionally names the maintained implementation and role
thresholds, embedded-root process, durable-state paths/permissions, explicit
initialization/recovery semantics, acceptance transaction/crash points,
target/version axes, expiry/clock policy, limits, incident response, release
commands, and every STOP choice above. Perform only local
dependency/license/Node/pack and workflow spikes; do not connect production,
change a public package, create a Changeset, or publish.

**Verification:**

```shell
yarn exec prettier --check docs/decisions/0002-secure-historical-salt-knowledge.md docs/ai/historical-knowledge-threat-model.md docs/ai/support-matrix.md docs/ai/release-runbook.md scripts/schemas/saltAiHistoricalVectorV1.schema.json scripts/schemas/saltAiHistoricalDistributionDecisionV1.schema.json tooling/ai/historical-vectors/first-supported.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --expected-vector tooling/ai/historical-vectors/first-supported.json --output-dir dist/salt-ai-history/unit00/input
yarn acquire:salt-ai:evidence -- --plan 001 --unit 09b --kind r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-history/unit00/input/initial-r3-ancestor-receipt.json
yarn acquire:salt-ai:evidence -- --plan 001 --unit 09c --kind discovery-deployment-final-receipt --tracker plans/README.md --output dist/salt-ai-history/unit00/input/current-discovery-final-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit00/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit00/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit00/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit00/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit00/input/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-history/unit00/input/initial-r3-ancestor-receipt.json --expected-vector tooling/ai/historical-vectors/first-supported.json --require-live-current
yarn verify:salt-ai:discovery-deployment -- --state final --receipt dist/salt-ai-history/unit00/input/current-discovery-final-receipt.json --required-r3-ancestor-receipt dist/salt-ai-history/unit00/input/initial-r3-ancestor-receipt.json --require-production-crawl
yarn verify:salt-ai-history-authority-rebase -- --mode decision-baseline --vector tooling/ai/historical-vectors/first-supported.json --current-authority-selector-receipt dist/salt-ai-history/unit00/input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit00/authority-rebase-receipt.json
yarn build:ai-tooling
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --report dist/salt-ai-history/unit00/pack-report.json
yarn verify:salt-ai-history-decision -- --vector tooling/ai/historical-vectors/first-supported.json --current-authority-selector-receipt dist/salt-ai-history/unit00/input/current-authority-selector-receipt.json --authority-rebase-receipt dist/salt-ai-history/unit00/authority-rebase-receipt.json --initial-r3-ancestor-receipt dist/salt-ai-history/unit00/input/initial-r3-ancestor-receipt.json --current-discovery-final-receipt dist/salt-ai-history/unit00/input/current-discovery-final-receipt.json --pack-report dist/salt-ai-history/unit00/pack-report.json --output dist/salt-ai-history/unit00/distribution-decision-receipt.json
```

**Expected result:** exit 0; every Unit 00 entry gate has named evidence; the
decision receipt parents the exact atomic live current-authority selector, its
decision-baseline authority-rebase receipt, Plan-001/09b R3 ancestor, and
Plan-001/09c public-discovery final receipt, covers
every option, and records one result. Apply the
closed tracker transitions defined in **Distribution decision before architecture**:
`packaged-map`/`explicit-local` block Units 01–05 pending a named replacement
plan, while `reject` rejects them. Only `remote-tuf` plus an approved threat/profile design dispatches Unit 01. Any unresolved maintained dependency, embedded-root custody, candidate
vector, durable-state design, or named reviewer prevents that result.
Production origin/signing operational approval may remain an explicitly
tracked activation gate for Unit 04; it is not a circular Unit 00 entry
requirement.

The Unit 00 authority set is an auditable decision baseline, not a months-long
release freeze. Before every later unit, atomically acquire the live set and run
`verify:salt-ai-history-authority-rebase` against the decision plus the latest
accepted rebase. A version-only descendant with byte-identical distribution
requirements, package-family universe, compiler/reader/analyzer/ruleset contract
IDs, source boundaries, MCP ship/omit topology, and public-doc contract may emit
an accepted rebase and continue. Drift in distribution requirements/threat model
restarts at Unit 00; generator/schema/source-boundary or selected-graph drift
invalidates Unit 01 onward; trust/cache contract drift invalidates Unit 02 onward;
CLI sync/pin/resolver contract drift invalidates Unit 03 onward. Unknown or
multi-class drift takes the earliest applicable restart. The tracker marks the
affected rows `STALE — authority rebase <classification>` and records the rebase
receipt; no unit silently changes parents.

Unit 04's landed release-baseline receipt authorizes the only freeze window, but
the tracker does not create the concurrency fence. A separate protected
`start-historical-freeze` operation acquires `salt-publication` and atomically
CAS-creates/read-backs the lease in the shared publication coordinator against
the selector-pinned current-authority generation. Only then does a plan-control
update mirror the active receipt into the tracker. Until Unit 05 commits
activation or the window closes, no current-authority successor may publish.
Release engineering owns the named window and expiry. A required current or
security release is never delayed merely to preserve Plan 002 evidence. Before
historical R2 publishes, it atomically records `abandoned_pre_r2`, ends the
backend fence, applies the matrix above, and may replan Unit 04. After historical
R2 publishes immutable SemVers/beta state, it must guarded-withdraw only beta
tags/pointers, retain every version/evidence byte, record
`withdrawn_post_r2`, mark Unit 05 stale, and require a new historical cohort,
versions, and tracker namespace; a `DONE` Unit 04 is never reopened.

The freeze uses one evidence kind, `authority-freeze-lease-receipt`, and one
schema with closed states `active`, `consumed`, `abandoned_pre_r2`,
`withdrawn_post_r2`, and `expired`. Each immutable generation same-kind
supersedes its predecessor; no cross-kind lifecycle edge or synthetic
`*-active`/`*-consumed` alias exists. Unit 04 creates `active`; only the exact
Unit 05 activation may change it to `consumed`. All generations remain indexed
under lifecycle tuple `002/04/authority-freeze-lease-receipt`; the Unit 05
workflow/completion SHA is bound inside the consumed generation but does not
move the tracker key across units. Every publisher that can mutate
the current-authority set—including Plan 001's installed current-maintenance
coordinator—must, after acquiring `salt-publication`, reread both the coordinator
and tracker/index, require their authority generations to agree, and reject an
unexpired active backend fence unless it is performing that exact activation or
one of the guarded closure operations. Expiry blocks historical activation and
is recorded under the same lock before a current successor proceeds. A
same-baseline extension is permitted only before R2, by named reapproval and a
same-kind active successor with a later bounded expiry; after R2, expiry forces
`withdrawn_post_r2` and a new cohort. CAS/readback evidence closes every state
change; an absent, stale, multiply active, or partially mirrored lease is a STOP.

`manage:salt-ai:authority-freeze` is the only lease/coordinator state writer. It
exposes closed operations `create-active`, `assert-active`, `extend-before-r2`,
`consume-on-activation`, `abandon-pre-r2`, `withdraw-post-r2`, and
`close-expired`. Every operation runs inside `salt-publication`; each successor
receipt parents the prior lease generation when one exists, exact tracker/index
digest, current-authority selector, coordinator generation, workflow/environment,
lock attempt, before/after state, and CAS/readback evidence.
`consume-on-activation` additionally requires the activation-commit and active-
support-attestation receipts and atomically CASes the coordinator to the new
four-entry authority tuple while changing the lease to `consumed`. Other
publishers then fail the coordinator↔tracker equality check until one
plan-control transaction records both that exact new authority set and the
same-kind terminal lease successor. `abandon-pre-r2` proves no external
historical target/tag/pointer exists. `withdraw-post-r2` requires the Unit 04 R2
final receipt and guarded beta tag/pointer withdrawal while retaining immutable
versions. `close-expired` requires trusted time at/after expiry and no in-flight
authorized activation. Hostile tests cover double close, stale/missing tracker
mirror, wrong R2/activation parent, crash at every CAS/readback, and publishers
queued before, during, and after fence creation/consumption.

### 01 — Reproduce one historical bundle and prove operation capabilities

**Outcome:** one historical vector produces immutable declarative bytes with an
honest per-operation compatibility result.

- Build from the approved reviewed source tag and its proven full commit in an
  isolated clean environment; fail if the tag resolves differently.
- Add `packages/knowledge/schemas/historical-target-1.schema.json`,
  `packages/cli/schemas/knowledge-result-1.schema.json`, the historical source/
  generation/pilot/trust/rehearsal/activation receipt schemas,
  `scripts/verifySaltAiHistoryVersions.mjs`, and its version-cohort receipt
  schema only after reacquiring a valid `remote-tuf` Unit 00 decision.
- Implement the Unit 01 materialize/build/verify/candidate scripts and receipt
  schemas from the historical evidence command contract, including the closed
  kind-aware Plan 002 evidence acquirer. The candidate command
  always creates a new exact-commit source materialization plus `run-a` and
  `run-b`; it cannot accept a branch, reuse an output directory, or execute any
  historical file.
- Generate the Plan 001 outer schema or a supported older schema with an exact
  reader fixture; never edit released source bytes by hand.
- Produce semantic/compiler/release receipts, mandatory item applicability,
  exact package vector plus `package_vector_id`, unique immutable `target_id`,
  contracts, ruleset implementation list, and operation capabilities. Retain
  `bundle_version` as the generator package version even when another target is
  produced by the same release.
- Extend the landed `@salt-ds/knowledge` closed capability registry and add
  positive/negative fixtures for every operation/contract/ruleset combination;
  do not create another registry in CLI or MCP.
- Prove retrieval-only behavior when analyzer/rules are unavailable; prove
  scan/review only with exact installed implementations. Compare CLI/MCP
  decisions only if Plan 001 shipped MCP and historical support is in scope.

**Verification:**

```shell
yarn acquire:salt-ai:evidence -- --plan 002 --unit 00 --kind distribution-decision-receipt --tracker plans/README.md --output dist/salt-ai-history/unit01/input/distribution-decision-receipt.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit01/input
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit01/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit01/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit01/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit01/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit01/input/current-effective-package-docs-parent-receipt.json --require-live-current
yarn verify:salt-ai-history-authority-rebase -- --mode continue --decision-receipt dist/salt-ai-history/unit01/input/distribution-decision-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit01/input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit01/authority-rebase-receipt.json
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --distribution-decision-receipt dist/salt-ai-history/unit01/input/distribution-decision-receipt.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit01
yarn vitest run packages/knowledge/src/compatibility packages/knowledge/src/manifest packages/knowledge/src/review --maxWorkers=4
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --report dist/salt-ai-history/unit01/pack-report.json
yarn changeset status --output dist/salt-ai-history/unit01/changeset-status.json
yarn verify:salt-ai-history-versions -- --mode intent --unit 01 --distribution-decision-receipt dist/salt-ai-history/unit01/input/distribution-decision-receipt.json --authority-rebase-receipt dist/salt-ai-history/unit01/authority-rebase-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit01/input/current-authority-selector-receipt.json --changeset-status dist/salt-ai-history/unit01/changeset-status.json --mcp-final-disposition-receipt dist/salt-ai-history/unit01/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit01/input/current-effective-selected-graph-parent-receipt.json --pack-report dist/salt-ai-history/unit01/pack-report.json --output dist/salt-ai-history/unit01/version-cohort-receipt.json
```

**Expected result:** exit 0; two historical builds are byte-identical; the
schema-valid receipts exist at
`dist/salt-ai-history/unit01/source/materialization-receipt.json`,
`dist/salt-ai-history/unit01/run-a/generation-receipt.json`,
`dist/salt-ai-history/unit01/run-b/generation-receipt.json`, and
`dist/salt-ai-history/unit01/candidate-receipt.json`; their source
inventories are identical before/after and name the descriptor's full commit.
The receipt names exactly one approved vector and every target/version axis; a
second vector generated by the same knowledge release has the same permitted
`bundle_version` but distinct vector/target/digest identities; unknown
reader/analyzer/ruleset tuples disable operations and never execute current
rules by inference. Tests make network/process/module access from the historical
root fail. The atomic live selector and `authority-rebase-receipt` are
tracker-bound with the version-intent receipt before Unit 02 receives a
checkpoint.

### 02 — Implement signed metadata, durable trust state, and data cache

**Outcome:** hostile/replayed metadata and bundles fail without weakening
accepted state or committing partial bytes.

Integrate and wrap only the maintained TUF client selected and pinned in Unit
00; do not implement signature, threshold, canonicalization, delegation, expiry,
rollback, or root-rotation semantics in Salt code. Knowledge owns the bounded
byte/path adapter, policy ceilings, read-only bundle/cache validation, and stable
cross-process read/write lease abstraction around that client. Implement HTTP,
the durable verified signed-metadata store,
`trust-state-v1` persistence, private staging, exclusive transaction
orchestration, atomic acceptance/bundle commit, recovery, and eviction in
private `packages/cli/src/knowledge-sync/**` modules; those modules call the
knowledge-owned exclusive lease. Exercise them with a test-only local server
before exposing public commands. Knowledge receives bounded bytes/authorized
paths and never owns HTTP or mutable trust/cache state. MCP cannot import the CLI
modules but can hold the knowledge-owned shared lease for its complete read.

Required fixtures: missing-state sync refusal; explicit first-use initialization;
repeated-initialization refusal; corrupt-state recovery guidance; clean restart;
cache deletion; lower per-role version; same-role/version same-digest idempotent
resume; same-role/version different-bytes equivocation for every role; stale ETag; expired/future
metadata; clock rollback/skew; concurrent writers; a crash at every metadata,
journal, high-water commit, cache-rename, and cleanup boundary; old/new/
dual-threshold root rotation; insufficient/unknown/revoked key; old and new
clients; unsigned revocation; origin-changing redirect; HTTP downgrade;
traversal/encoded path; case collision; link/junction/hard link;
CLI and MCP reader processes racing sync/eviction while holding shared leases;
digest/length/schema/content-type mismatch; oversized/chunked/decompression bomb;
special file; exact offline cache hit; reused target ID; target/digest mismatch;
and two vectors sharing one generator `bundle_version`.

**Verification:**

```shell
yarn build:ai-tooling
yarn vitest run packages/knowledge/src/trust packages/knowledge/src/cache packages/knowledge/src/compatibility --maxWorkers=4
yarn vitest run packages/cli/src/knowledge-sync --maxWorkers=4
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --report dist/salt-ai-history/unit02/pack-report.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit02/input
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit02/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit02/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit02/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit02/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit02/input/current-effective-package-docs-parent-receipt.json --require-live-current
yarn acquire:salt-ai:evidence -- --plan 002 --unit 00 --kind distribution-decision-receipt --tracker plans/README.md --output dist/salt-ai-history/unit02/input/distribution-decision-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 01 --kind authority-rebase-receipt --tracker plans/README.md --output dist/salt-ai-history/unit02/input/previous-authority-rebase-receipt.json
yarn verify:salt-ai-history-authority-rebase -- --mode continue --decision-receipt dist/salt-ai-history/unit02/input/distribution-decision-receipt.json --previous-rebase-receipt dist/salt-ai-history/unit02/input/previous-authority-rebase-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit02/input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit02/authority-rebase-receipt.json
yarn changeset status --output dist/salt-ai-history/unit02/changeset-status.json
yarn acquire:salt-ai-history-evidence -- --unit 01 --kind version-intent-receipt --tracker plans/README.md --output dist/salt-ai-history/unit02/input/unit-01-version-intent.json
yarn verify:salt-ai-history-versions -- --mode intent --unit 02 --previous-intent-receipt dist/salt-ai-history/unit02/input/unit-01-version-intent.json --authority-rebase-receipt dist/salt-ai-history/unit02/authority-rebase-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit02/input/current-authority-selector-receipt.json --changeset-status dist/salt-ai-history/unit02/changeset-status.json --mcp-final-disposition-receipt dist/salt-ai-history/unit02/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit02/input/current-effective-selected-graph-parent-receipt.json --pack-report dist/salt-ai-history/unit02/pack-report.json --output dist/salt-ai-history/unit02/version-cohort-receipt.json
```

**Expected result:** exit 0; rejection before the acceptance commit point leaves
the previous trust state/cache authoritative and exposes no staged bytes. A
simulated crash after that point may leave high-water state advanced with the
bundle absent, but recovery never regresses it and an identical candidate can
resume deterministically. Restart and cache deletion still reject replay; valid
rotation requires the ratified thresholds; no private key/test secret is
packaged. The atomic live selector and `authority-rebase-receipt` are
tracker-bound with the Unit 02 version-intent receipt before Unit 03 dispatches.

### 03 — Add explicit CLI trust initialization, sync/status/pin, and offline resolver integration

**Outcome:** a user can deliberately obtain and pin exact historical data while
all ordinary paths remain offline.

Implement the command/config/exit contracts, explicit atomic trust
initialization, CLI-only downloader/writer, read-only knowledge resolver, exact
target/capability reporting, atomic pin mutation, and packed consumer fixtures.
Add an offline module-boundary test proving only `knowledge sync` can reach
approved networking and no command reaches consumer code, package-manager
execution, credential files, MCP transport, or remote rules. Test
`knowledge trust initialize` from the packed official artifact with network
disabled; it must create state plus the embedded-root metadata snapshot
atomically, keep machine stdout pure, refuse repeat/corrupt-state overwrite, and
direct recovery without silently resetting.

**Verification:**

```shell
yarn build:ai-tooling
yarn vitest run packages/knowledge/src/cache packages/cli/src/commands/knowledge packages/cli/src/knowledge-sync --maxWorkers=4
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --report dist/salt-ai-history/unit03/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-history/unit03/pack-report.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit03/input
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit03/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit03/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit03/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit03/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit03/input/current-effective-package-docs-parent-receipt.json --require-live-current
yarn acquire:salt-ai:evidence -- --plan 002 --unit 00 --kind distribution-decision-receipt --tracker plans/README.md --output dist/salt-ai-history/unit03/input/distribution-decision-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 02 --kind authority-rebase-receipt --tracker plans/README.md --output dist/salt-ai-history/unit03/input/previous-authority-rebase-receipt.json
yarn verify:salt-ai-history-authority-rebase -- --mode continue --decision-receipt dist/salt-ai-history/unit03/input/distribution-decision-receipt.json --previous-rebase-receipt dist/salt-ai-history/unit03/input/previous-authority-rebase-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit03/input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit03/authority-rebase-receipt.json
yarn changeset status --output dist/salt-ai-history/unit03/changeset-status.json
yarn acquire:salt-ai-history-evidence -- --unit 02 --kind version-intent-receipt --tracker plans/README.md --output dist/salt-ai-history/unit03/input/unit-02-version-intent.json
yarn verify:salt-ai-history-versions -- --mode intent --unit 03 --previous-intent-receipt dist/salt-ai-history/unit03/input/unit-02-version-intent.json --authority-rebase-receipt dist/salt-ai-history/unit03/authority-rebase-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit03/input/current-authority-selector-receipt.json --changeset-status dist/salt-ai-history/unit03/changeset-status.json --mcp-final-disposition-receipt dist/salt-ai-history/unit03/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit03/input/current-effective-selected-graph-parent-receipt.json --pack-report dist/salt-ai-history/unit03/pack-report.json --output dist/salt-ai-history/unit03/version-cohort-receipt.json
```

**Expected result:** exit 0; packed trust initialization and status are offline;
sync refuses uninitialized state and works only against the local signed fixture
server after initialization; every JSON result identifies the relevant target,
vector, bundle, digest, and metadata axes; dry-run leaves config unchanged;
exact target/digest pin works after network blocking; repeated initialization
and revoked/corrupt/unsupported targets exit 3 or the documented exact no-target
code without fallback. The atomic live selector and
`authority-rebase-receipt` are tracker-bound with the Unit 03 version-intent
receipt before Unit 04 may generate an active release plan.

### 04 — Freeze every release byte and publish one historical R2 beta cohort

**Outcome:** supported historical surfaces, package landing docs, current web
discovery, and optional MCP parity use one target-bound support descriptor; the
existing authority publishes the exact new current+historical cohort to beta
without activating stable support.

Do not dispatch this unit until origin operations, offline root custody, online
role thresholds, expiry monitoring, recovery, and incident duties have their
final named approvals in the tracker checkpoint. Earlier units use only local
fixture origins.

Before any freeze or R2 publication, the Unit 04 implementation ref also lands
all noncredentialed Unit 05 pilot, drill, two-phase metadata, activation,
maintenance, hostile-crash, and receipt-schema code. A dedicated pre-R2
readiness gate uses only landed candidate/rebind evidence and a fake provider—
never an R2 receipt, production target, or production mapping readback—and
tracker-binds `historical-activation-tooling-ready-receipt` under Unit 04. This
is an explicit dependency of `start-historical-freeze`, not work deferred into
the fenced window. After R2, Unit 05 performs the bounded fixture confirmation,
protected executions, and navigation PR without landing runtime/release code.

- Implement `scripts/manageSaltAiAuthorityFreeze.mjs`, root command
  `manage:salt-ai:authority-freeze`, the finalized
  `saltAiAuthorityFreezeLeaseV1` schema, shared-coordinator CAS adapter, and the
  lock-time coordinator/tracker equality plus lease check in every current-
  authority-mutating publisher/coordinator. Register the single
  `authority-freeze-lease-receipt` kind and its same-kind supersession validator
  before creating a lease.

- If Plan 001 final disposition is `ship` and historical parity is separately
  approved, allow MCP to read only an authorized exact pin from the same
  validated cache; MCP never syncs/writes. Preserve the landed public v1
  contract and label historical capability/limitations explicitly. If MCP
  shipped but parity is not approved, document it as current-bundle-only. If
  final disposition is `omit`, make every MCP task, dependency, test, document, and
  release target not applicable.
- Author a reviewed target-neutral support template before versioning. In the
  Changesets version PR, after final package versions are applied, deterministically
  generate the target-bound descriptor defined above and derive or parity-check
  staged site/support source, knowledge/CLI READMEs, MCP README only when
  applicable, historical guide/index, Markdown alternates, bounded historical
  `llms.txt`, and future current/root `llms.txt` entry. Review those materialized
  bytes in that same version PR before merge. Package landing text and immutable
  guides use timeless conditional wording: historical resolution is technically
  enabled only when `salt-ds knowledge status` proves an active, unexpired, verified
  mapping and support-attestation generation for the exact package/vector/target
  and names its activation ID plus immutable activation-commit receipt digest;
  otherwise it is unavailable. They state separately that official Salt support
  begins only after the terminal historical-R3 receipt and atomic authority/
  lease tracker update exist. The later normal-site discovery receipt gates the
  broader launch/navigation announcement and Plan 002 completion, not the signed
  resolver truth. The page does not contain its own receipt digest, and offline
  status alone is not an organizational support claim. Pre-activation projections render the technical condition as
  unsatisfied and make no stable support/install claim. The ordinary
  production site route/navigation and root/current indexes remain unchanged;
  staged routable source lives only under
  `tooling/ai/historical-public-docs-v1/**` or ignored projection output. The
  future root/current indexes retain their normal entries and add only the
  bounded historical guide entry, never a concatenated historical corpus.
  Rebuild/repack and run
  docs-authoring, full-site, current-AI-web, and historical-web closure after
  materialization; Unit 05 may not edit immutable/package bytes, but its bounded
  post-activation navigation projection may expose the already-reviewed route.
- Freeze historical web namespace
  `/ai/history/v1/<target-path-segment>/<bundle-digest-segment>/`. It contains
  `llms.txt`, `guide.md`, `support.md`, and the target's deterministic
  manifest-selected Markdown alternates. The strict Plan 001 digest codec
  round-trips the target digest and bundle digest into the two single segments;
  it never encodes the namespaced canonical `target_id`. Every historical index
  entry targets a file under that exact
  immutable prefix. R2 adds exactly one “Historical Salt knowledge and support
  status” entry to the existing `/ai/beta/llms.txt` entries. R3 adds the same conditional entry to the existing
  root and `/ai/current/llms.txt` entries; it never replaces the current
  component/pattern/guide/migration entries. All three mutable indexes link only
  the immutable historical `guide.md`, use Plan 001's mutable-pointer cache
  class, and remain within 64 KiB. The immutable historical prefix uses the
  one-year immutable cache class. Route-map, relation, content-type, CAS, and
  live conditional-request checks cover both namespaces.
- Add closed `project:salt-ai:historical-support` modes `fixture`, `tracked`,
  `rebind`, and `activate-navigation`. The first three never add a production
  route or stable navigation entry. Unit 04 runs pre-activation build/site
  negative-exposure checks: there is no active historical support/install
  claim or ordinary navigation link, while R2 may expose only the explicitly
  beta-labelled immutable guide and `/ai/beta/llms.txt`. Unit 05 separately
  runs the tracker-bound production crawl after R3 authority activation but
  before navigation; that crawl requires the activated historical root and
  `/ai/current/llms.txt` entries to match authority and forbids only ordinary
  navigation or launch claims. `activate-navigation` accepts only the
  tracker-acquired terminal historical R3 receipt and is used by Unit 05's
  post-activation discovery PR.
- Extend the sole generic protected publisher with a new versioned
  `saltAiHistoricalReleaseReceiptV1` state machine and closed
  `SALT_AI_HISTORICAL_RELEASE` mode. Do not add historical fields or enum values
  silently to Plan 001's frozen `saltAiReleaseReceiptV1`. The new schema binds
  and parents the latest tracker-approved current Salt-AI final receipt whose
  live CAS values still match, applied release partition, ordinary final plus
  complete dependency evidence, effective package graph, support descriptor,
  projection/effective-package-doc receipts, current web artifact, historical
  target/metadata, production mapping-signing input, and before/after CAS state.
- Reuse Plan 001's planned/applied partition lifecycle. If its ordinary child is
  non-empty, publish and verify that child first through `ORDINARY_RELEASE`; the
  historical AI candidate then builds only against those registry identities.
  Changesets calculates versions but never selects or publishes targets.
- In `HISTORICAL_R2_BETA`, publish the exact knowledge/CLI versions plus MCP only
  when finally selected under unique candidate tags, verify official provenance
  and installed smoke, upload/read back the immutable matching current-web and
  historical-target bytes, and CAS-promote only `next`, `/ai/channels/beta/`, and
  `/ai/beta/llms.txt`. Publish signed metadata only to the isolated
  `historical-rehearsal-v1` channel. Also seal and upload/read back an immutable,
  content-addressed production mapping/signing-input artifact that fixes the
  exact target/vector/digest/capability identities, a collision-resistant
  precommitted `activation_id`, and role policy for Unit 05;
  it is not a live metadata role or pointer. Do not touch `latest`,
  `/ai/current/`, root `/llms.txt`, or the production historical mapping.
- Global concurrency remains `salt-publication`. Test a stale metadata
  promotion/rollback as a required non-mutating failure.
- Add scheduled expiry/origin/revocation/readback monitoring and incident drill.
- Implement `scripts/rehearseHistoricalSaltPublication.mjs`, its receipt schema,
  `scripts/finalizeSaltAiHistoricalSupport.mjs`,
  `scripts/projectSaltAiHistoricalSupport.mjs`,
  `scripts/validateSaltAiHistoricalSupport.mjs`,
  `scripts/testHistoricalSaltMcp.mjs`,
  `scripts/verifyHistoricalSaltMcpFinal.mjs`, their capability/final-disposition
  receipt schemas and closed history-acquirer validators,
  the `historical-release`/`protected-final` extension to
  `scripts/verifySaltAiPackageNamespaces.mjs`,
  `scripts/schemas/saltAiHistoricalPackageNamespaceReleaseReceiptV1.schema.json`
  and registered `historical-package-namespace-release-receipt` validator,
  `scripts/sealHistoricalMappingSigningInput.mjs`,
  `scripts/verifySaltAiHistoricalReleaseReceipt.mjs`,
  `scripts/schemas/saltAiHistoricalSupportDescriptorV1.schema.json`,
  `scripts/schemas/saltAiHistoricalProjectionReceiptV1.schema.json`,
  `scripts/schemas/saltAiHistoricalMappingSigningInputV1.schema.json`,
  `scripts/schemas/saltAiHistoricalMappingInputReadbackReceiptV1.schema.json`,
  `scripts/schemas/saltAiHistoricalPackageCohortReceiptV1.schema.json`,
  `scripts/schemas/saltAiHistoricalReleaseReceiptV1.schema.json`, and root
  `rehearse:salt-ai-history`. Extend the existing protected workflow's
  closed operation enum with `historical-rehearsal`; it always rebuilds from the
  immutable approved ref and accepts only channel `historical-rehearsal-v1`.
- Add root `seal:salt-ai-history-mapping-input`. Its schema-valid artifact binds
  the selector-pinned live current release; the exact expected package names, final versions, tarball/unpacked
  hashes, and dependency pins from the landed applied-partition, version, pack,
  and ordinary-dependency-request receipts; descriptor/projection/package-doc;
  exact target/vector/bundle/capabilities and precommitted `activation_id`; TUF
  profile/role/threshold policy; and
  required next-version constraints. It does not parent the later protected
  package-cohort receipt and contains no signature, private-key identity, live
  expiry, or mutable pointer. Protected rehearsal and R2 publication must prove
  the actual package-cohort receipt equals those sealed expected identities and
  parent both artifacts. R2 uploads the unsigned input to a no-overwrite digest
  path, reads it back, and emits the separately schema-valid readback receipt
  that Unit 05 must reacquire.
- Extend Plan 001's package-doc sealer with the three historical modes above.
  Fixture mode reads only the isolated overlay; tracked mode updates the shared
  `tooling/ai/public-package-docs-v1.json` allowlist and emits the reviewed
  successor effective receipt; rebind mode proves landed bytes equal the
  premerge receipt without mutation.
- Receipts retain Plan 001's distinction between `published_targets` and the
  complete `tested_dependency_cohort`; all package, current-web, historical
  target, descriptor, metadata, and discovery hashes must close in one R2
  parent chain.

**Verification:**

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit04/input
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit04/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit04/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit04/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit04/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit04/input/current-effective-package-docs-parent-receipt.json --require-live-current
yarn acquire:salt-ai:evidence -- --plan 002 --unit 00 --kind distribution-decision-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/input/distribution-decision-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 03 --kind authority-rebase-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/input/previous-authority-rebase-receipt.json
yarn verify:salt-ai-history-authority-rebase -- --mode active-plan --decision-receipt dist/salt-ai-history/unit04/input/distribution-decision-receipt.json --previous-rebase-receipt dist/salt-ai-history/unit04/input/previous-authority-rebase-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit04/authority-rebase-active-plan-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 03 --kind version-intent-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/input/unit-03-version-intent.json
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit04/candidate
yarn finalize:salt-ai:historical-support -- --mode fixture --template tooling/ai/historical-support/first-supported.template.json --candidate-receipt dist/salt-ai-history/unit04/candidate/candidate-receipt.json --output dist/salt-ai-history/unit04/support-descriptor.json
yarn project:salt-ai:historical-support -- --mode fixture --descriptor dist/salt-ai-history/unit04/support-descriptor.json --package-docs-parent dist/salt-ai-history/unit04/input/current-effective-package-docs-parent-receipt.json --output-root dist/salt-ai-history/unit04/support-projections --receipt dist/salt-ai-history/unit04/support-projection-receipt.json
yarn validate:salt-ai:historical-support -- --descriptor dist/salt-ai-history/unit04/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --package-docs-parent dist/salt-ai-history/unit04/input/current-effective-package-docs-parent-receipt.json --candidate-receipt dist/salt-ai-history/unit04/candidate/candidate-receipt.json
yarn vitest run packages/knowledge/src/compatibility --maxWorkers=4
yarn test:ai-tooling
yarn release:verify:ai-tooling
yarn check:ai-tooling:pack -- --projection-root dist/salt-ai-history/unit04/support-projections --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --report dist/salt-ai-history/unit04/pack-report.json
yarn seal:salt-public-package-docs -- --mode historical-fixture --inventory tooling/ai/public-package-docs-v1.json --parent-receipt dist/salt-ai-history/unit04/input/current-effective-package-docs-parent-receipt.json --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --pack-report dist/salt-ai-history/unit04/pack-report.json --output dist/salt-ai-history/unit04/effective-package-docs-receipt.json
yarn validate:salt-ai:historical-support -- --descriptor dist/salt-ai-history/unit04/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit04/candidate/candidate-receipt.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-history/unit04/pack-report.json
yarn build:salt-ai-web -- --projection-root dist/salt-ai-history/unit04/support-projections --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json
yarn check:salt-docs-authoring -- --support-descriptor dist/salt-ai-history/unit04/support-descriptor.json --projection-root dist/salt-ai-history/unit04/support-projections --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --historical-state pre-activation --forbid-production-historical-navigation
yarn workspace @salt-ds/site build -- --projection-root dist/salt-ai-history/unit04/support-projections --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json
yarn changeset status --output dist/salt-ai-history/unit04/changeset-status.json
yarn materialize:salt-package-version-intent -- --plan 002 --mode unit-04-cumulative --authority-rebase-receipt dist/salt-ai-history/unit04/authority-rebase-active-plan-receipt.json --previous-intent-receipt dist/salt-ai-history/unit04/input/unit-03-version-intent.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/input/current-effective-selected-graph-parent-receipt.json --pack-report dist/salt-ai-history/unit04/pack-report.json --support-descriptor dist/salt-ai-history/unit04/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/effective-package-docs-receipt.json --output dist/salt-ai-history/unit04/unit-04-package-version-intent.json
yarn partition:salt-release-plan -- --phase planned --selection-profile effective --changeset-status dist/salt-ai-history/unit04/changeset-status.json --mcp-final-disposition-receipt dist/salt-ai-history/unit04/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/input/current-effective-selected-graph-parent-receipt.json --version-intent-receipt dist/salt-ai-history/unit04/unit-04-package-version-intent.json --output dist/salt-ai-history/unit04/release-partition-planned.json
yarn verify:salt-ai-history-versions -- --mode queued --unit 04 --authority-rebase-receipt dist/salt-ai-history/unit04/authority-rebase-active-plan-receipt.json --version-intent-receipt dist/salt-ai-history/unit04/unit-04-package-version-intent.json --vector tooling/ai/historical-vectors/first-supported.json --release-partition-receipt dist/salt-ai-history/unit04/release-partition-planned.json --pack-report dist/salt-ai-history/unit04/pack-report.json --support-descriptor dist/salt-ai-history/unit04/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/effective-package-docs-receipt.json --output dist/salt-ai-history/unit04/version-plan-receipt.json
yarn rehearse:salt-ai-history -- --mode fixture --channel historical-rehearsal-v1 --vector tooling/ai/historical-vectors/first-supported.json --current-authority-selector-receipt dist/salt-ai-history/unit04/input/current-authority-selector-receipt.json --current-ai-final-receipt dist/salt-ai-history/unit04/input/current-r3-final-receipt.json --support-descriptor dist/salt-ai-history/unit04/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit04/candidate/candidate-receipt.json --pack-report dist/salt-ai-history/unit04/pack-report.json --version-receipt dist/salt-ai-history/unit04/version-plan-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --package-cohort-output dist/salt-ai-history/unit04/local-package-cohort-receipt.json --output dist/salt-ai-history/unit04/local-rehearsal-receipt.json
```

`local-package-cohort-receipt.json` and `local-rehearsal-receipt.json` must both
be schema-valid at the exact output paths above; every earlier candidate,
projection, package-doc, web, pack, version-intent, partition, and version-plan
receipt in the block must also pass its named validator. In a
separate approved disposable branch/environment, run this exact snapshot
rehearsal; do not publish or reset a developer worktree:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit04/snapshot/input
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit04/snapshot/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit04/snapshot/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit04/snapshot/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit04/snapshot/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit04/snapshot/input/current-effective-package-docs-parent-receipt.json --require-live-current
yarn acquire:salt-ai:evidence -- --plan 002 --unit 00 --kind distribution-decision-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/snapshot/input/distribution-decision-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 03 --kind authority-rebase-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/snapshot/input/previous-authority-rebase-receipt.json
yarn verify:salt-ai-history-authority-rebase -- --mode rehearsal --decision-receipt dist/salt-ai-history/unit04/snapshot/input/distribution-decision-receipt.json --previous-rebase-receipt dist/salt-ai-history/unit04/snapshot/input/previous-authority-rebase-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/snapshot/input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit04/snapshot/authority-rebase-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 03 --kind version-intent-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/snapshot/input/unit-03-version-intent.json
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit04/snapshot/pre-version-candidate
yarn finalize:salt-ai:historical-support -- --mode fixture --template tooling/ai/historical-support/first-supported.template.json --candidate-receipt dist/salt-ai-history/unit04/snapshot/pre-version-candidate/candidate-receipt.json --output dist/salt-ai-history/unit04/snapshot/pre-version-support-descriptor.json
yarn project:salt-ai:historical-support -- --mode fixture --descriptor dist/salt-ai-history/unit04/snapshot/pre-version-support-descriptor.json --package-docs-parent dist/salt-ai-history/unit04/snapshot/input/current-effective-package-docs-parent-receipt.json --output-root dist/salt-ai-history/unit04/snapshot/pre-version-support-projections --receipt dist/salt-ai-history/unit04/snapshot/pre-version-projection-receipt.json
yarn check:ai-tooling:pack -- --projection-root dist/salt-ai-history/unit04/snapshot/pre-version-support-projections --projection-receipt dist/salt-ai-history/unit04/snapshot/pre-version-projection-receipt.json --report dist/salt-ai-history/unit04/snapshot/pre-version-pack-report.json
yarn changeset status --output dist/salt-ai-history/unit04/snapshot/pre-version-changeset-status.json
yarn materialize:salt-package-version-intent -- --plan 002 --mode unit-04-cumulative --version-mode snapshot --authority-rebase-receipt dist/salt-ai-history/unit04/snapshot/authority-rebase-receipt.json --previous-intent-receipt dist/salt-ai-history/unit04/snapshot/input/unit-03-version-intent.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/snapshot/input/current-effective-selected-graph-parent-receipt.json --pack-report dist/salt-ai-history/unit04/snapshot/pre-version-pack-report.json --support-descriptor dist/salt-ai-history/unit04/snapshot/pre-version-support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/snapshot/pre-version-projection-receipt.json --output dist/salt-ai-history/unit04/snapshot/unit-04-package-version-intent.json
yarn partition:salt-release-plan -- --phase planned --selection-profile effective --version-mode snapshot --snapshot-tag history --changeset-status dist/salt-ai-history/unit04/snapshot/pre-version-changeset-status.json --mcp-final-disposition-receipt dist/salt-ai-history/unit04/snapshot/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/snapshot/input/current-effective-selected-graph-parent-receipt.json --version-intent-receipt dist/salt-ai-history/unit04/snapshot/unit-04-package-version-intent.json --output dist/salt-ai-history/unit04/snapshot/release-partition-planned.json
yarn verify:salt-ai-history-versions -- --mode queued --unit 04 --authority-rebase-receipt dist/salt-ai-history/unit04/snapshot/authority-rebase-receipt.json --version-intent-receipt dist/salt-ai-history/unit04/snapshot/unit-04-package-version-intent.json --vector tooling/ai/historical-vectors/first-supported.json --release-partition-receipt dist/salt-ai-history/unit04/snapshot/release-partition-planned.json --pack-report dist/salt-ai-history/unit04/snapshot/pre-version-pack-report.json --support-descriptor dist/salt-ai-history/unit04/snapshot/pre-version-support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/snapshot/pre-version-projection-receipt.json --output dist/salt-ai-history/unit04/snapshot/version-plan-receipt.json
yarn changeset version --snapshot history
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit04/snapshot/candidate
yarn finalize:salt-ai:historical-support -- --mode fixture --template tooling/ai/historical-support/first-supported.template.json --candidate-receipt dist/salt-ai-history/unit04/snapshot/candidate/candidate-receipt.json --output dist/salt-ai-history/unit04/snapshot/support-descriptor.json
yarn project:salt-ai:historical-support -- --mode fixture --descriptor dist/salt-ai-history/unit04/snapshot/support-descriptor.json --package-docs-parent dist/salt-ai-history/unit04/snapshot/input/current-effective-package-docs-parent-receipt.json --output-root dist/salt-ai-history/unit04/snapshot/support-projections --receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json
yarn validate:salt-ai:historical-support -- --descriptor dist/salt-ai-history/unit04/snapshot/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json --package-docs-parent dist/salt-ai-history/unit04/snapshot/input/current-effective-package-docs-parent-receipt.json --candidate-receipt dist/salt-ai-history/unit04/snapshot/candidate/candidate-receipt.json
yarn partition:salt-release-plan -- --phase applied --planned-receipt dist/salt-ai-history/unit04/snapshot/release-partition-planned.json --output dist/salt-ai-history/unit04/snapshot/release-partition-applied.json
yarn build:ai-tooling
yarn check:ai-tooling:pack -- --projection-root dist/salt-ai-history/unit04/snapshot/support-projections --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json --report dist/salt-ai-history/unit04/snapshot/pack-report.json
yarn seal:salt-public-package-docs -- --mode historical-fixture --inventory tooling/ai/public-package-docs-v1.json --parent-receipt dist/salt-ai-history/unit04/snapshot/input/current-effective-package-docs-parent-receipt.json --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json --pack-report dist/salt-ai-history/unit04/snapshot/pack-report.json --output dist/salt-ai-history/unit04/snapshot/effective-package-docs-receipt.json
yarn validate:salt-ai:historical-support -- --descriptor dist/salt-ai-history/unit04/snapshot/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/snapshot/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit04/snapshot/candidate/candidate-receipt.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-history/unit04/snapshot/pack-report.json
yarn build:salt-ai-web -- --projection-root dist/salt-ai-history/unit04/snapshot/support-projections --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json
yarn check:salt-docs-authoring -- --support-descriptor dist/salt-ai-history/unit04/snapshot/support-descriptor.json --projection-root dist/salt-ai-history/unit04/snapshot/support-projections --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json --historical-state pre-activation --forbid-production-historical-navigation
yarn workspace @salt-ds/site build -- --projection-root dist/salt-ai-history/unit04/snapshot/support-projections --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json
yarn changeset status --output dist/salt-ai-history/unit04/snapshot/post-version-changeset-status.json
yarn verify:salt-ai-history-versions -- --mode applied --version-kind snapshot --unit 04 --authority-rebase-receipt dist/salt-ai-history/unit04/snapshot/authority-rebase-receipt.json --vector tooling/ai/historical-vectors/first-supported.json --plan-receipt dist/salt-ai-history/unit04/snapshot/version-plan-receipt.json --release-partition-receipt dist/salt-ai-history/unit04/snapshot/release-partition-applied.json --changeset-status dist/salt-ai-history/unit04/snapshot/post-version-changeset-status.json --pack-report dist/salt-ai-history/unit04/snapshot/pack-report.json --support-descriptor dist/salt-ai-history/unit04/snapshot/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/snapshot/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/snapshot/effective-package-docs-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --effective-graph-output dist/salt-ai-history/unit04/snapshot/effective-selected-graph.json --output dist/salt-ai-history/unit04/snapshot/version-applied-receipt.json
yarn test:salt-ai-history-mcp -- --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/snapshot/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/snapshot/effective-selected-graph.json --pack-report dist/salt-ai-history/unit04/snapshot/pack-report.json --output dist/salt-ai-history/unit04/snapshot/mcp-capability-receipt.json
yarn verify:salt-ai-history-mcp-final -- --mode snapshot --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/snapshot/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/snapshot/effective-selected-graph.json --pack-report dist/salt-ai-history/unit04/snapshot/pack-report.json --capability-receipt dist/salt-ai-history/unit04/snapshot/mcp-capability-receipt.json --output dist/salt-ai-history/unit04/snapshot/mcp-final-disposition.json
```

The snapshot applied and successor-MCP receipts prove Unit 04's consolidated Changeset exactly
consumed the chained Unit 01–03 intent plus Unit 04 work, knowledge changed as
planned, CLI and any selected MCP exact-pin that
version, the final support descriptor is target-bound, and every generated doc/
README/web byte closes over it. The successor graph is materialized and checked
in this rehearsal rather than being assumed to exist only in the release PR.
After the Unit 04 implementation merge, a
plan-control update atomically records the authority-rebase active-plan receipt,
planned partition, and version evidence while leaving
the row `IN PROGRESS — version/R2 pending`.

The snapshot is evidence only. After the Unit 04 implementation and consolidated
Changeset merge, a clean latest-base job reacquires the live current release/final-MCP/
effective-graph/package-doc/Unit03-intent parents, rebuilds the fixture candidate
and overlay exactly as above under `dist/salt-ai-history/unit04/active-plan/`,
reruns current `changeset status`, and then runs the same three exact commands
shown above: `materialize:salt-package-version-intent --plan 002 --mode
unit-04-cumulative`, `partition:salt-release-plan --phase planned
--selection-profile effective`, and `verify:salt-ai-history-versions --mode
queued`. The partition's `--version-intent-receipt` is the newly materialized
Unit 04 cumulative receipt, never the Unit 03 predecessor directly. Persist and
tracker-bind that intent, planned partition, and version-plan receipt as one
active plan before creating a version PR; implementation-branch and snapshot
evidence cannot be publication parents. The Unit-04 implementation registers
stable selector ID `plan-002-unit-04` for the exact
`002/04/release-partition-planned` tuple plus required
`002/04/authority-rebase-active-plan-receipt` in Plan 001's closed AI
version-plan selector registry. Only the uncredentialed operator path may then
create the PR:

```shell
yarn generate:salt-ai:version-pr -- --selector-id plan-002-unit-04 --tracker plans/README.md --require-active-plan-rebase
```

Automatic ordinary Changesets maintenance must exclude every package reserved
by that active partition. An unregistered selector, missing/stale authority
rebase, partial partition, or ordinary/AI PR not equal to the selected partition
fails before generating a commit.

On the reviewed version PR, run this finalization sequence after acquiring the
active plan and all of its tracker-bound inputs:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit04/version-pr/input
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind authority-rebase-active-plan-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/version-pr/input/authority-rebase-active-plan-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind release-partition-planned --tracker plans/README.md --output dist/salt-ai-history/unit04/version-pr/input/release-partition-planned.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind version-plan-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/version-pr/input/version-plan-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit04/version-pr/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit04/version-pr/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit04/version-pr/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit04/version-pr/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit04/version-pr/input/current-effective-package-docs-parent-receipt.json --expected-rebase-receipt dist/salt-ai-history/unit04/version-pr/input/authority-rebase-active-plan-receipt.json --require-live-current
yarn changeset version
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit04/version-pr/candidate
yarn finalize:salt-ai:historical-support -- --mode tracked --template tooling/ai/historical-support/first-supported.template.json --candidate-receipt dist/salt-ai-history/unit04/version-pr/candidate/candidate-receipt.json --output tooling/ai/historical-support/first-supported.json
yarn project:salt-ai:historical-support -- --mode tracked --descriptor tooling/ai/historical-support/first-supported.json --package-docs-parent dist/salt-ai-history/unit04/version-pr/input/current-effective-package-docs-parent-receipt.json --receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json
yarn build:ai-tooling
yarn check:ai-tooling:pack -- --projection-receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json --report dist/salt-ai-history/unit04/version-pr/pack-report.json
yarn seal:salt-public-package-docs -- --mode historical-tracked --inventory tooling/ai/public-package-docs-v1.json --parent-receipt dist/salt-ai-history/unit04/version-pr/input/current-effective-package-docs-parent-receipt.json --projection-receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json --pack-report dist/salt-ai-history/unit04/version-pr/pack-report.json --output dist/salt-ai-history/unit04/version-pr/effective-package-docs-receipt.json
yarn validate:salt-ai:historical-support -- --descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/version-pr/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit04/version-pr/candidate/candidate-receipt.json
yarn build:salt-ai-web
yarn check:salt-docs-authoring -- --support-descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/version-pr/effective-package-docs-receipt.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json --historical-state pre-activation --forbid-production-historical-navigation
yarn workspace @salt-ds/site build
yarn partition:salt-release-plan -- --phase applied --planned-receipt dist/salt-ai-history/unit04/version-pr/input/release-partition-planned.json --output dist/salt-ai-history/unit04/version-pr/release-partition-applied-premerge.json
yarn changeset status --output dist/salt-ai-history/unit04/version-pr/post-version-changeset-status.json
yarn verify:salt-ai-history-versions -- --mode applied --version-kind final-premerge --unit 04 --authority-rebase-receipt dist/salt-ai-history/unit04/version-pr/input/authority-rebase-active-plan-receipt.json --plan-receipt dist/salt-ai-history/unit04/version-pr/input/version-plan-receipt.json --release-partition-receipt dist/salt-ai-history/unit04/version-pr/release-partition-applied-premerge.json --changeset-status dist/salt-ai-history/unit04/version-pr/post-version-changeset-status.json --pack-report dist/salt-ai-history/unit04/version-pr/pack-report.json --support-descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/version-pr/effective-package-docs-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --effective-graph-output dist/salt-ai-history/unit04/version-pr/effective-selected-graph-premerge.json --output dist/salt-ai-history/unit04/version-pr/version-applied-premerge.json
yarn test:salt-ai-history-mcp -- --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/version-pr/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/version-pr/effective-selected-graph-premerge.json --pack-report dist/salt-ai-history/unit04/version-pr/pack-report.json --output dist/salt-ai-history/unit04/version-pr/mcp-capability-premerge.json
yarn verify:salt-ai-history-mcp-final -- --mode final-premerge --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/version-pr/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/version-pr/effective-selected-graph-premerge.json --pack-report dist/salt-ai-history/unit04/version-pr/pack-report.json --capability-receipt dist/salt-ai-history/unit04/version-pr/mcp-capability-premerge.json --output dist/salt-ai-history/unit04/version-pr/mcp-final-premerge.json
yarn acquire:salt-ai:evidence -- --plan 001 --unit 00a --kind ordinary-baseline-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/version-pr/input/ordinary-baseline.json
yarn plan:salt:ordinary-dependencies -- --release-partition-receipt dist/salt-ai-history/unit04/version-pr/release-partition-applied-premerge.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/version-pr/effective-selected-graph-premerge.json --ordinary-baseline-receipt dist/salt-ai-history/unit04/version-pr/input/ordinary-baseline.json --pack-report dist/salt-ai-history/unit04/version-pr/pack-report.json --current-authority-selector-receipt dist/salt-ai-history/unit04/version-pr/input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit04/version-pr/ordinary-dependency-request.json
yarn seal:salt-ai-history-mapping-input -- --current-authority-selector-receipt dist/salt-ai-history/unit04/version-pr/input/current-authority-selector-receipt.json --candidate-receipt dist/salt-ai-history/unit04/version-pr/candidate/candidate-receipt.json --release-partition-receipt dist/salt-ai-history/unit04/version-pr/release-partition-applied-premerge.json --version-receipt dist/salt-ai-history/unit04/version-pr/version-applied-premerge.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/version-pr/effective-selected-graph-premerge.json --mcp-final-disposition-receipt dist/salt-ai-history/unit04/version-pr/mcp-final-premerge.json --ordinary-dependency-request dist/salt-ai-history/unit04/version-pr/ordinary-dependency-request.json --support-descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/version-pr/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/version-pr/effective-package-docs-receipt.json --pack-report dist/salt-ai-history/unit04/version-pr/pack-report.json --web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-history/unit04/version-pr/production-mapping-signing-input.json
```

The PR shows every allowlisted descriptor/package/site/discovery diff for human
review and has no pending Changesets. Before merge, persist and tracker-bind all
eleven registered premerge parents: applied partition, historical version-
applied, effective graph, successor-MCP/absence, descriptor artifact, projection,
effective package docs, pack report, current web, production mapping-signing
input, and ordinary dependency request. A partial set is invalid. After merge, a clean landed-ref job reacquires them, reruns the complete
build/candidate/pack/web/docs/site closure, runs partition `applied` with
`--expected-applied-receipt`, runs package-doc `historical-rebind`, and emits a
`verify:salt-ai-history-versions --mode applied --version-kind final-landed`
receipt. Every package/tarball/unpacked, descriptor/projection/README, target,
route, and web digest must equal premerge; only source merge metadata may differ.
The landed rebind also reruns `seal:salt-ai-history-mapping-input`, requires byte
equality to the premerge artifact, derives the complete ordinary dependency
request with Plan 001's planner, and requires the effective-selected-graph and
successor-MCP-disposition bytes to equal their premerge receipts. The landed applied/version/effective-graph/MCP-
descriptor-artifact/projection/package-doc/web/target/mapping-input/dependency-request receipts
replace the premerge entries as active tracker evidence. No protected job may
rewrite those bytes or consume a local version-PR `dist` path.
Tests mutate one projected README after the first build and require pack/seal to
reject that stale dist; only the post-projection rebuild may pass. The landed
rebind likewise acquires tracked descriptor/projection inputs before rebuilding.

The landed-ref job is this exact closed rebind (line wrapping does not change
arguments):

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit04/landed/input
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind authority-rebase-active-plan-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/authority-rebase-active-plan-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit04/landed/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit04/landed/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit04/landed/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit04/landed/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit04/landed/input/current-effective-package-docs-parent-receipt.json --expected-rebase-receipt dist/salt-ai-history/unit04/landed/input/authority-rebase-active-plan-receipt.json --require-live-current
yarn acquire:salt-ai:evidence -- --plan 002 --unit 00 --kind distribution-decision-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/distribution-decision-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 03 --kind authority-rebase-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/previous-authority-rebase-receipt.json
yarn verify:salt-ai-history-authority-rebase -- --mode freeze-release-baseline --decision-receipt dist/salt-ai-history/unit04/landed/input/distribution-decision-receipt.json --previous-rebase-receipt dist/salt-ai-history/unit04/landed/input/previous-authority-rebase-receipt.json --expected-active-plan-rebase-receipt dist/salt-ai-history/unit04/landed/input/authority-rebase-active-plan-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/landed/input/current-authority-selector-receipt.json --freeze-owner release-engineering --freeze-expires-at <approved-iso8601> --output dist/salt-ai-history/unit04/landed/historical-release-authority-baseline-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind version-plan-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/version-plan-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind release-partition-planned --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/release-partition-planned.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind release-partition-applied-premerge --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/release-partition-applied-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-version-applied-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/version-applied-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-effective-selected-graph-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/effective-selected-graph-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-mcp-final-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/mcp-final-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-descriptor-artifact --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/support-descriptor.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-projection-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/support-projection-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind effective-public-package-docs-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/package-docs-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind pack-report-premerge --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/pack-report-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind current-web-release-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/current-web-premerge.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind production-mapping-signing-input-premerge-artifact --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/mapping-input-premerge.json
yarn acquire:salt-ai:evidence -- --plan 002 --unit 04 --kind ordinary-dependency-request-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/ordinary-dependency-premerge.json
yarn acquire:salt-ai:evidence -- --plan 001 --unit 00a --kind ordinary-baseline-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/ordinary-baseline.json
yarn acquire:salt-ai:evidence -- --plan 001 --unit 08c --kind package-namespace-release-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/landed/input/plan-001-package-namespace-release-receipt.json
yarn verify:salt-ai:package-namespaces -- --mode historical-release --expected-receipt dist/salt-ai-history/unit04/landed/input/plan-001-package-namespace-release-receipt.json --output dist/salt-ai-history/unit04/landed/historical-package-namespace-release-receipt.json
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit04/landed/candidate
yarn finalize:salt-ai:historical-support -- --mode rebind --descriptor tooling/ai/historical-support/first-supported.json --expected-descriptor dist/salt-ai-history/unit04/landed/input/support-descriptor.json --candidate-receipt dist/salt-ai-history/unit04/landed/candidate/candidate-receipt.json --receipt dist/salt-ai-history/unit04/landed/support-descriptor-rebind-receipt.json
yarn project:salt-ai:historical-support -- --mode rebind --descriptor tooling/ai/historical-support/first-supported.json --expected-receipt dist/salt-ai-history/unit04/landed/input/support-projection-premerge.json --package-docs-parent dist/salt-ai-history/unit04/landed/input/current-effective-package-docs-parent-receipt.json --receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json
yarn build:ai-tooling
yarn check:ai-tooling:pack -- --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --expected-report dist/salt-ai-history/unit04/landed/input/pack-report-premerge.json --report dist/salt-ai-history/unit04/landed/pack-report.json
yarn partition:salt-release-plan -- --phase applied --planned-receipt dist/salt-ai-history/unit04/landed/input/release-partition-planned.json --expected-applied-receipt dist/salt-ai-history/unit04/landed/input/release-partition-applied-premerge.json --output dist/salt-ai-history/unit04/landed/release-partition-applied.json
yarn seal:salt-public-package-docs -- --mode historical-rebind --inventory tooling/ai/public-package-docs-v1.json --parent-receipt dist/salt-ai-history/unit04/landed/input/current-effective-package-docs-parent-receipt.json --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --pack-report dist/salt-ai-history/unit04/landed/pack-report.json --expected-receipt dist/salt-ai-history/unit04/landed/input/package-docs-premerge.json --output dist/salt-ai-history/unit04/landed/effective-package-docs-receipt.json
yarn validate:salt-ai:historical-support -- --descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/landed/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit04/landed/candidate/candidate-receipt.json
yarn build:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json
yarn check:salt-docs-authoring -- --support-descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/landed/effective-package-docs-receipt.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --expected-web-receipt dist/salt-ai-history/unit04/landed/input/current-web-premerge.json --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --historical-state pre-activation --forbid-production-historical-navigation
yarn workspace @salt-ds/site build
yarn changeset status --output dist/salt-ai-history/unit04/landed/changeset-status.json
yarn verify:salt-ai-history-versions -- --mode applied --version-kind final-landed --unit 04 --plan-receipt dist/salt-ai-history/unit04/landed/input/version-plan-receipt.json --release-partition-receipt dist/salt-ai-history/unit04/landed/release-partition-applied.json --expected-applied-receipt dist/salt-ai-history/unit04/landed/input/version-applied-premerge.json --expected-effective-graph-receipt dist/salt-ai-history/unit04/landed/input/effective-selected-graph-premerge.json --changeset-status dist/salt-ai-history/unit04/landed/changeset-status.json --pack-report dist/salt-ai-history/unit04/landed/pack-report.json --support-descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/landed/effective-package-docs-receipt.json --web-receipt dist/salt-ai-web/release-receipt.json --effective-graph-output dist/salt-ai-history/unit04/landed/effective-selected-graph.json --output dist/salt-ai-history/unit04/landed/version-applied-receipt.json
yarn test:salt-ai-history-mcp -- --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/landed/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/landed/effective-selected-graph.json --pack-report dist/salt-ai-history/unit04/landed/pack-report.json --output dist/salt-ai-history/unit04/landed/mcp-capability-receipt.json
yarn verify:salt-ai-history-mcp-final -- --mode final-landed --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/landed/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/landed/effective-selected-graph.json --pack-report dist/salt-ai-history/unit04/landed/pack-report.json --capability-receipt dist/salt-ai-history/unit04/landed/mcp-capability-receipt.json --expected-disposition-receipt dist/salt-ai-history/unit04/landed/input/mcp-final-premerge.json --output dist/salt-ai-history/unit04/landed/mcp-final-disposition.json
yarn plan:salt:ordinary-dependencies -- --release-partition-receipt dist/salt-ai-history/unit04/landed/release-partition-applied.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/landed/effective-selected-graph.json --ordinary-baseline-receipt dist/salt-ai-history/unit04/landed/input/ordinary-baseline.json --pack-report dist/salt-ai-history/unit04/landed/pack-report.json --current-authority-selector-receipt dist/salt-ai-history/unit04/landed/input/current-authority-selector-receipt.json --expected-receipt dist/salt-ai-history/unit04/landed/input/ordinary-dependency-premerge.json --output dist/salt-ai-history/unit04/landed/ordinary-dependency-request.json
yarn seal:salt-ai-history-mapping-input -- --verify-existing dist/salt-ai-history/unit04/landed/input/mapping-input-premerge.json --current-authority-selector-receipt dist/salt-ai-history/unit04/landed/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit04/landed/historical-release-authority-baseline-receipt.json --candidate-receipt dist/salt-ai-history/unit04/landed/candidate/candidate-receipt.json --release-partition-receipt dist/salt-ai-history/unit04/landed/release-partition-applied.json --version-receipt dist/salt-ai-history/unit04/landed/version-applied-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/landed/effective-selected-graph.json --mcp-final-disposition-receipt dist/salt-ai-history/unit04/landed/mcp-final-disposition.json --ordinary-dependency-request dist/salt-ai-history/unit04/landed/ordinary-dependency-request.json --support-descriptor tooling/ai/historical-support/first-supported.json --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/landed/effective-package-docs-receipt.json --pack-report dist/salt-ai-history/unit04/landed/pack-report.json --web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-history/unit04/landed/production-mapping-signing-input-rebind-receipt.json
yarn verify:salt-ai-history-activation -- --mode tooling-ready --provider fixture --candidate-receipt dist/salt-ai-history/unit04/landed/candidate/candidate-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/landed/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit04/landed/historical-release-authority-baseline-receipt.json --mcp-final-parent dist/salt-ai-history/unit04/landed/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/landed/effective-selected-graph.json --support-descriptor-rebind-receipt dist/salt-ai-history/unit04/landed/support-descriptor-rebind-receipt.json --projection-receipt dist/salt-ai-history/unit04/landed/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/landed/effective-package-docs-receipt.json --mapping-input-rebind-receipt dist/salt-ai-history/unit04/landed/production-mapping-signing-input-rebind-receipt.json --pilot-apps tooling/ai/historical-pilot-apps.json --drills tooling/ai/historical-trust-drills.json --require-hostile-crash-matrix --forbid-r2-or-production-input --output dist/salt-ai-history/unit04/landed/historical-activation-tooling-ready-receipt.json
```

Every `--expected-*` comparison is byte/identity exact. Persist and tracker-bind
the landed applied partition, version-plan, historical-version-applied,
effective-selected-graph, successor-MCP/absence, descriptor-rebind, projection,
package-doc, pack, web, mapping-input-rebind, package-namespace release,
release-authority-baseline, activation-tooling-ready, and
ordinary-dependency-request outputs with the landed completion SHA. The original
descriptor and unsigned mapping input remain immutable parents; their distinct
rebind receipts are the publisher-facing landed evidence. Then retire every
registered Unit-04 premerge pair atomically before either ordinary or historical
protected dispatch starts:

```shell
yarn retire:salt-ai:premerge-evidence -- --plan 002 --unit 04 --pairs-from tooling/ai/premerge-evidence-pairs-v1.json --scope 002/04 --tracker plans/README.md
yarn validate:salt-ai:tracker -- --tracker plans/README.md
```

The retirement must consume exactly the eleven registered pairs above. A
missing landed completion SHA, byte/parent mismatch, extra or partial pair, or
surviving active premerge-only kind aborts the prospective index transaction.

Protected Unit 04 runs a new `HISTORICAL_R2_BETA` chain. The fixture
`rehearse:salt-ai-history` command prepares/verifies inputs but never owns
credentials; only `release:salt:transition --mode SALT_AI_HISTORICAL_RELEASE`
publishes. The protected path emits a package-cohort receipt and a
`saltAiHistoricalReleaseReceiptV1` chain with verified npm provenance, registry
smoke, immutable current/historical web readback, beta CAS, threshold-valid
rehearsal metadata, matching CLI/MCP capabilities where selected, and required
stale-CAS rejection. No execution-unit branch publishes.

Protected workflow steps use the exact landed version-applied ref. The landed
rebind first tracker-binds the applied partition, ordinary dependency request,
and Plan 001 ordinary baseline. `ORDINARY_RELEASE` is always a separate dispatch:
the non-empty branch publishes/activates; the empty branch runs read-only
`attest-existing`. Both produce a complete-cohort `final` receipt, persist it at
an immutable locator, land the tracker update, and end before historical AI is
dispatched.

```shell
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind release-partition-applied --tracker plans/README.md --output dist/salt-ai-history/unit04/ordinary/input/release-partition-applied.json
yarn acquire:salt-ai:evidence -- --plan 002 --unit 04 --kind ordinary-dependency-request-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/ordinary/input/ordinary-dependency-request.json
yarn acquire:salt-ai:evidence -- --plan 001 --unit 00a --kind ordinary-baseline-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/ordinary/input/ordinary-baseline.json
```

For a non-empty child, run only:

```shell
yarn release:salt:transition -- --mode ORDINARY_RELEASE --operation publish --partition-receipt dist/salt-ai-history/unit04/ordinary/input/release-partition-applied.json --dependency-cohort-request dist/salt-ai-history/unit04/ordinary/input/ordinary-dependency-request.json --ordinary-baseline-receipt dist/salt-ai-history/unit04/ordinary/input/ordinary-baseline.json --output-dir dist/salt-ai-history/unit04/ordinary
yarn release:salt:transition -- --mode ORDINARY_RELEASE --operation activate --parent-receipt dist/salt-ai-history/unit04/ordinary/verified-receipt.json --dependency-cohort-request dist/salt-ai-history/unit04/ordinary/input/ordinary-dependency-request.json --ordinary-baseline-receipt dist/salt-ai-history/unit04/ordinary/input/ordinary-baseline.json --output-dir dist/salt-ai-history/unit04/ordinary
```

For an empty child, run only:

```shell
yarn release:salt:transition -- --mode ORDINARY_RELEASE --operation attest-existing --partition-receipt dist/salt-ai-history/unit04/ordinary/input/release-partition-applied.json --dependency-cohort-request dist/salt-ai-history/unit04/ordinary/input/ordinary-dependency-request.json --ordinary-baseline-receipt dist/salt-ai-history/unit04/ordinary/input/ordinary-baseline.json --output-dir dist/salt-ai-history/unit04/ordinary
```

Only after the selected ordinary branch has produced an immutable,
tracker-bound `ordinary-release-final-receipt` does a separate protected
operation start the actual authority fence; a pull-request, local job, or
same-job ordinary output cannot do this:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit04/freeze/input
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-release-authority-baseline-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/freeze/input/release-authority-baseline-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-activation-tooling-ready-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/freeze/input/activation-tooling-ready-receipt.json
yarn acquire:salt-ai:evidence -- --plan 002 --unit 04 --kind ordinary-dependency-request-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/freeze/input/ordinary-dependency-request.json
yarn acquire:salt-ai:evidence -- --plan 002 --unit 04 --kind ordinary-release-final-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/freeze/input/ordinary-final-receipt.json
yarn manage:salt-ai:authority-freeze -- --operation create-active --tracker plans/README.md --current-authority-selector-receipt dist/salt-ai-history/unit04/freeze/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit04/freeze/input/release-authority-baseline-receipt.json --activation-tooling-ready-receipt dist/salt-ai-history/unit04/freeze/input/activation-tooling-ready-receipt.json --ordinary-dependency-request dist/salt-ai-history/unit04/freeze/input/ordinary-dependency-request.json --ordinary-final-receipt dist/salt-ai-history/unit04/freeze/input/ordinary-final-receipt.json --approved-window-max-duration <bounded-duration> --require-publication-lock --coordinator-cas --output dist/salt-ai-history/unit04/freeze/authority-freeze-active-receipt.json
```

The command proves the ordinary receipt closes the exact request, rechecks the
live selector against the release baseline, and completes backend CAS/readback
before releasing the lock. The next plan-control update tracker-binds it as kind
`authority-freeze-lease-receipt` with `state: active`; while that mirror is
missing, coordinator↔tracker mismatch blocks every authority-mutating publisher.
Only after the active generation is tracker-bound may historical R2 dispatch
begin. This keeps ordinary publication and its queue time outside the fence.
The approved window is sized only for historical R2 publication, protected
pilot/drills, and R3 activation; it is never used to wait for source review,
implementation merge, ordinary publication, or routine queue. A window miss
follows the closed abandon/withdraw path rather than silently extending after
R2.

The later historical-AI dispatch starts clean. It reacquires every authority and
tracked byte; same-job ordinary output, local version-PR `dist`, or a raw source
path in place of acquired evidence is rejected:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit04/protected/input
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-release-authority-baseline-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/release-authority-baseline-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind authority-freeze-lease-receipt --require-state active --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/authority-freeze-active-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-package-namespace-release-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/package-namespace-release-receipt.json
yarn verify:salt-ai:package-namespaces -- --mode protected-final --expected-receipt dist/salt-ai-history/unit04/protected/input/package-namespace-release-receipt.json --require-unexpired --require-registry-readback --output dist/salt-ai-history/unit04/protected/input/package-namespace-protected-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit04/protected/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit04/protected/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit04/protected/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit04/protected/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit04/protected/input/current-effective-package-docs-parent-receipt.json --expected-rebase-receipt dist/salt-ai-history/unit04/protected/input/release-authority-baseline-receipt.json --require-live-current
yarn verify:salt-ai-history-authority-rebase -- --mode protected-freeze --release-authority-baseline-receipt dist/salt-ai-history/unit04/protected/input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit04/protected/input/authority-freeze-active-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/protected/input/current-authority-selector-receipt.json --require-unexpired-freeze
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind release-partition-applied --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/release-partition-applied.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind version-plan-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/version-plan-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-version-applied-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/version-applied-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-effective-selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-mcp-final-disposition-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/mcp-final-disposition.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-descriptor-rebind-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/support-descriptor-rebind-receipt.json --materialize-bound-artifact dist/salt-ai-history/unit04/protected/input/support-descriptor.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-projection-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind effective-public-package-docs-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/effective-package-docs-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind pack-report --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/expected-pack-report.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind current-web-release-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/current-web-release-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind production-mapping-signing-input-rebind-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input-rebind-receipt.json --materialize-bound-artifact dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input.json
yarn acquire:salt-ai:evidence -- --plan 002 --unit 04 --kind ordinary-dependency-request-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/ordinary-dependency-request.json
yarn acquire:salt-ai:evidence -- --plan 002 --unit 04 --kind ordinary-release-final-receipt --tracker plans/README.md --output dist/salt-ai-history/unit04/protected/input/ordinary-final-receipt.json
```

For a non-empty ordinary child, run only:

```shell
yarn resolve:salt:ordinary-dependency -- --changed-child --partition-receipt dist/salt-ai-history/unit04/protected/input/release-partition-applied.json --dependency-cohort-request dist/salt-ai-history/unit04/protected/input/ordinary-dependency-request.json --ordinary-final-receipt dist/salt-ai-history/unit04/protected/input/ordinary-final-receipt.json --output dist/salt-ai-history/unit04/protected/input/ordinary-dependency.json
```

For an empty ordinary child, run only:

```shell
yarn resolve:salt:ordinary-dependency -- --empty-child --partition-receipt dist/salt-ai-history/unit04/protected/input/release-partition-applied.json --dependency-cohort-request dist/salt-ai-history/unit04/protected/input/ordinary-dependency-request.json --ordinary-final-receipt dist/salt-ai-history/unit04/protected/input/ordinary-final-receipt.json --output dist/salt-ai-history/unit04/protected/input/ordinary-dependency.json
```

Then continue with the common historical path:

```shell
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit04/protected-candidate
yarn validate:salt-ai:historical-support -- --descriptor dist/salt-ai-history/unit04/protected/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/protected/input/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit04/protected-candidate/candidate-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/protected/input/current-authority-selector-receipt.json
yarn check:ai-tooling:pack -- --effective-selected-graph-receipt dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json --effective-package-docs-receipt dist/salt-ai-history/unit04/protected/input/effective-package-docs-receipt.json --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json --ordinary-dependency-receipt dist/salt-ai-history/unit04/protected/input/ordinary-dependency.json --expected-report dist/salt-ai-history/unit04/protected/input/expected-pack-report.json --report dist/salt-ai-history/unit04/protected-pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-history/unit04/protected-pack-report.json
yarn test:salt-ai-history-mcp -- --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/protected/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json --pack-report dist/salt-ai-history/unit04/protected-pack-report.json --output dist/salt-ai-history/unit04/protected-mcp-capability-receipt.json
yarn verify:salt-ai-history-mcp-final -- --mode protected --vector tooling/ai/historical-vectors/first-supported.json --predecessor-mcp-final dist/salt-ai-history/unit04/protected/input/current-mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json --pack-report dist/salt-ai-history/unit04/protected-pack-report.json --capability-receipt dist/salt-ai-history/unit04/protected-mcp-capability-receipt.json --expected-disposition-receipt dist/salt-ai-history/unit04/protected/input/mcp-final-disposition.json --output dist/salt-ai-history/unit04/protected-mcp-final-disposition.json
yarn build:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json
yarn check:salt-docs-authoring -- --support-descriptor dist/salt-ai-history/unit04/protected/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/protected/input/effective-package-docs-receipt.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json --expected-web-receipt dist/salt-ai-history/unit04/protected/input/current-web-release-receipt.json --historical-state beta --forbid-production-historical-navigation
yarn workspace @salt-ds/site build
yarn changeset status --output dist/salt-ai-history/unit04/protected-changeset-status.json
yarn verify:salt-ai-history-versions -- --mode applied --version-kind final-protected --unit 04 --plan-receipt dist/salt-ai-history/unit04/protected/input/version-plan-receipt.json --expected-applied-receipt dist/salt-ai-history/unit04/protected/input/version-applied-receipt.json --expected-effective-graph-receipt dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json --release-partition-receipt dist/salt-ai-history/unit04/protected/input/release-partition-applied.json --changeset-status dist/salt-ai-history/unit04/protected-changeset-status.json --pack-report dist/salt-ai-history/unit04/protected-pack-report.json --support-descriptor dist/salt-ai-history/unit04/protected/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/protected/input/effective-package-docs-receipt.json --web-receipt dist/salt-ai-history/unit04/protected/input/current-web-release-receipt.json --output dist/salt-ai-history/unit04/protected-version-applied-receipt.json
yarn release:verify:ai-tooling
yarn rehearse:salt-ai-history -- --mode protected --channel historical-rehearsal-v1 --vector tooling/ai/historical-vectors/first-supported.json --current-authority-selector-receipt dist/salt-ai-history/unit04/protected/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit04/protected/input/release-authority-baseline-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json --mcp-final-disposition-receipt dist/salt-ai-history/unit04/protected-mcp-final-disposition.json --support-descriptor dist/salt-ai-history/unit04/protected/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/protected/input/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit04/protected-candidate/candidate-receipt.json --pack-report dist/salt-ai-history/unit04/protected-pack-report.json --version-receipt dist/salt-ai-history/unit04/protected-version-applied-receipt.json --ordinary-dependency-receipt dist/salt-ai-history/unit04/protected/input/ordinary-dependency.json --web-receipt dist/salt-ai-history/unit04/protected/input/current-web-release-receipt.json --mapping-signing-input dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input.json --mapping-input-rebind-receipt dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input-rebind-receipt.json --package-cohort-output dist/salt-ai-history/unit04/protected-package-cohort-receipt.json --output dist/salt-ai-history/unit04/protected-rehearsal-candidate-receipt.json
yarn seal:salt-ai-history-mapping-input -- --verify-existing dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input.json --mapping-input-rebind-receipt dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input-rebind-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/protected/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit04/protected/input/release-authority-baseline-receipt.json --candidate-receipt dist/salt-ai-history/unit04/protected-candidate/candidate-receipt.json --release-partition-receipt dist/salt-ai-history/unit04/protected/input/release-partition-applied.json --version-receipt dist/salt-ai-history/unit04/protected/input/version-applied-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json --mcp-final-disposition-receipt dist/salt-ai-history/unit04/protected-mcp-final-disposition.json --ordinary-dependency-request dist/salt-ai-history/unit04/protected/input/ordinary-dependency-request.json --actual-package-cohort-receipt dist/salt-ai-history/unit04/protected-package-cohort-receipt.json --support-descriptor dist/salt-ai-history/unit04/protected/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit04/protected/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit04/protected/input/effective-package-docs-receipt.json --pack-report dist/salt-ai-history/unit04/protected-pack-report.json --web-receipt dist/salt-ai-history/unit04/protected/input/current-web-release-receipt.json
yarn release:salt:transition -- --mode SALT_AI_HISTORICAL_RELEASE --operation publish-historical-r2 --candidate-receipt dist/salt-ai-history/unit04/protected-rehearsal-candidate-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/protected/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit04/protected/input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit04/protected/input/authority-freeze-active-receipt.json --package-namespace-receipt dist/salt-ai-history/unit04/protected/input/package-namespace-protected-receipt.json --mcp-final-disposition-receipt dist/salt-ai-history/unit04/protected-mcp-final-disposition.json --mapping-signing-input dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input.json --mapping-input-rebind-receipt dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input-rebind-receipt.json --output-dir dist/salt-ai-history/unit04
yarn release:drill:salt -- --mode SALT_AI_HISTORICAL_RELEASE --stage HISTORICAL_PROTECTED_DRILL --verified-receipt dist/salt-ai-history/unit04/verified-receipt.json --output dist/salt-ai-history/unit04/drill-final-receipt.json
yarn release:salt:transition -- --mode SALT_AI_HISTORICAL_RELEASE --operation activate-historical-r2 --parent-receipt dist/salt-ai-history/unit04/verified-receipt.json --drill-receipt dist/salt-ai-history/unit04/drill-final-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit04/production-mapping-input-readback-receipt.json --output-dir dist/salt-ai-history/unit04
yarn verify:salt-ai:historical-release-receipt -- --state final --stage HISTORICAL_R2_BETA --receipt dist/salt-ai-history/unit04/final-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit04/protected/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit04/protected/input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit04/protected/input/authority-freeze-active-receipt.json --mapping-input-rebind-receipt dist/salt-ai-history/unit04/protected/input/production-mapping-signing-input-rebind-receipt.json --package-namespace-receipt dist/salt-ai-history/unit04/protected/input/package-namespace-protected-receipt.json --mcp-final-parent dist/salt-ai-history/unit04/protected-mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit04/protected/input/effective-selected-graph.json
```

The generic publisher, not `rehearse`, performs candidate publication,
provenance verification, registry smoke, immutable current/historical upload
and readback, protected drill, beta pointer/tag CAS, rehearsal-channel metadata
CAS, and immutable production-mapping-input upload/readback. Before its first
write it recomputes the actual package-cohort receipt and requires exact equality
with the expected identities sealed in the mapping input; R2 receipts parent the
mapping input and actual cohort independently so neither can substitute for the
other. Before Unit 04 becomes `DONE`, its canonical tracker completion set must
mirror `plans/README.md`: atomic live selector and active-plan rebase; frozen
release-authority baseline and active same-kind freeze lease; activation-
tooling-ready and package-namespace release; cumulative intent, version plan,
planned and landed-applied partition, historical version, successor effective
graph and MCP/absence; all eleven premerge→landed pairs retired; ordinary
dependency request, Plan-001 ordinary baseline, ordinary final and normalized
evidence; descriptor and mapping rebind receipts/artifacts, projection/effective
package docs, pack/current-web/package cohort, historical target/rehearsal
metadata and production mapping-input readback; and protected R2 final/drill
receipts. The tracker records every immutable locator and SHA-256 before Unit 04
becomes `DONE` or Unit 05 receives a checkpoint.

### 05 — Pilot one vector, publish limitations, and activate support

**Outcome:** the single declared vector is supportable; broader history remains
unsupported until separately evidenced.

Do not dispatch this unit until every activation gate is ratified and the Unit
04 protected-environment rehearsal receipt is sealed.

- Pilot current CLI plus the exact historical pin in representative sanitized
  apps for every claimed operation.
- Run retrieval, sample compilation, scanner precision/recall where enabled,
  offline restart/cache, expiry warning, revocation, rotation, recovery, and
  incident drills.
- Publish the exact vector, contracts, supported/disabled operations, EOL,
  `target_id`, `package_vector_id`, `bundle_version`/digest, metadata versions,
  receipts, cache/trust-state locations, reset limitations, and support path.
- Reacquire and parity-check the Unit 04 support descriptor, package tarballs,
  package READMEs, site/support guide, current web artifact, historical target/
  index, Markdown alternates, and bounded discovery bytes. Unit 05 changes none
  of them. A content, documentation, package, schema, or web correction returns
  to a new reviewed Unit-04-style version/R2 cohort and repeats the pilot.
- Activate the signed mapping only through the protected state machine. Never
  broaden a package range from one passing vector.
- Use the existing `saltAiHistoricalReleaseReceiptV1` chain for one closed
  `HISTORICAL_R3_GA` transition. It publishes/uploads no new package, bundle,
  historical target, docs, or web content bytes. Under the signing policy it may
  threshold-sign, upload, and read back fresh production targets/snapshot/
  timestamp metadata in an immutable staging namespace whose target mapping
  exactly equals Unit 04's retained signing-input receipt, includes a precommitted
  `activation_id`, and starts with `support_state: pending_activation`; role
  versions/expiry may advance, but no content or capability identity may change. Staging may
  occur before the global lock and remains `exposed_to_clients: false`. The
  transition then acquires `salt-publication`, re-reads live role versions and
  CAS generations, and rejects stale staged roles. The cross-system activation
  is an ordered, journaled saga rather than a false atomic transaction: (1)
  CAS-promote the exact Unit 04 package versions to stable tags while the new
  historical mapping is still dormant; (2) verify those exact installed bytes;
  (3) expose/read back the signed `pending_activation` production mapping as the
  irreversible metadata commit point; (4) only then CAS-promote the exact Unit
  04 current-web artifact to `/ai/current/` and root `/llms.txt`; (5) seal an
  immutable `activation-commit-receipt` over those readbacks; (6) threshold-sign,
  expose, and read back a strictly higher metadata generation with unchanged
  mapping/content but `support_state: active`, the same `activation_id`, and the
  activation-commit digest; (7) seal the successful historical-R3 activation
  receipt over the active readback; and (8) use that receipt to consume the
  authority-freeze lease and CAS the coordinator to the new authority tuple.
  The lease successor parents the activation receipt, never the reverse.
  Offline resolvers treat the pending mapping
  as unavailable and enable it only after sync accepts the active attestation.
  The packages remain current-safe when no mapping exists.
  Beta tags/pointers remain byte-identical. Before production metadata is
  exposed, a failed candidate guarded-restores any package tag it moved and
  proves no surviving pointer change before recording abandonment. After
  any client could accept the higher metadata generation, never restore older
  targets/snapshot/timestamp bytes or versions: threshold-sign a strictly
  higher-version compensating mapping (previous logical target or explicit
  revocation/removal), upload/read it back, and CAS forward. Package and web
  pointers may guarded-restore their before-values only after a compensating
  higher metadata generation has removed/revoked the mapping. Receipts distinguish
  `pre_exposure_abandoned` from `post_exposure_forward_recovered`; a crash between
  pending exposure and active attestation remains non-supporting and must resume
  or forward-revoke. If the signing
  threshold is unavailable after exposure, leave support incident-blocked rather
  than claim rollback. Stale state aborts without overwriting a newer cohort.
- In the Unit 04 implementation ref, add tracked
  `tooling/ai/historical-pilot-apps.json` and
  `tooling/ai/historical-trust-drills.json`; implement the Unit 05 pilot, drill,
  historical-eval, activation-verifier,
  `scripts/signHistoricalProductionMetadata.mjs`, and production metadata
  upload/readback verifier plus their receipt schemas, including
  `saltAiHistoricalProductionMetadataReceiptV1` (used for both pending and active
  generations), `saltAiHistoricalActivationCommitReceiptV1`,
  `saltAiHistoricalActivationAttemptReceiptV1`,
  `saltAiHistoricalAuthorityBackendTransitionReceiptV1`,
  `saltAiHistoricalAuthorityCommitReceiptV1`,
  `saltAiHistoricalActivationToolingReadyReceiptV1`, and
  `saltAiHistoricalActivationGateReceiptV1` with closed `fixture | protected`
  modes and mode-derived `eligible_for_activation`; register distinct
  `local-activation-gate-receipt` and `protected-activation-gate-receipt` kinds,
  and
  `saltAiHistoricalMaintenanceReceiptV1`; extend the already defined
  `saltAiHistoricalReleaseReceiptV1` only through its closed R3 state. Register
  distinct kinds for tooling readiness, pending metadata, active support
  attestation, activation commit/attempt/final, authority-backend transition,
  authority commit, and maintenance evidence. On that same Unit-04 ref, extend
  Plan 001's already-landed discovery machinery with closed historical handling:
  `project:salt-ai:historical-support --mode activate-navigation`, historical
  parent/support validation in `seal:salt-ai:discovery-deployment` and
  `verify:salt-ai:discovery-deployment`, and protected
  `SALT_DOCS_RELEASE --operation deploy-historical-discovery`. Register the
  Unit-05 history-acquirer kinds
  `historical-r3-activation-final-receipt`,
  `pre-navigation-negative-crawl-receipt`,
  `historical-discovery-deployment-candidate-premerge-receipt`,
  `historical-discovery-deployment-landed-candidate-receipt`, and
  `historical-discovery-deployment-final-receipt`, including the one registered
  premerge-to-landed pair. Fake-provider tests cover exact activation/support
  parents, same-or-maintenance-descendant authority, stale selectors, crash and
  resume, immutable-AI-web non-mutation, deployment readback/crawl, and closed
  rejection of generic/current modes or unregistered history kinds. The
  tooling-ready receipt binds those test/schema digests so Unit 05 can only
  execute the frozen implementation.

  The maintenance receipt has closed
  `operation: refresh-historical-metadata | rotate-historical-root`,
  `transaction_variant: metadata_only`, `rehearsed | final` state, exact
  four-entry authority parent digests, before/staged/live role versions and
  hashes, expiry margin, immutable readback, exposure boundary, and terminal
  `pre_exposure_abandoned | exposed | post_exposure_forward_recovered` state.
  It proves package, target mapping, capability, graph, docs, and web identities
  are unchanged. A successful refresh or root rotation must preserve and
  re-attest `support_state: active`, the original `activation_id`, and the exact
  activation-commit digest in its strictly newer metadata generation; its
  maintenance receipt and successor current-authority release bind those fields.
  The only alternative is an explicit strictly newer forward-revocation, which
  cannot remain a supported current-authority state. Private keys/signing sessions
  remain provider/HSM-side and are never serialized.
  Every matrix entry names its expected target, operation capability, state
  transition, exit code, and evidence assertion.

- Before activation, add closed protected
  `refresh-historical-metadata` and `rotate-historical-root` transitions to the
  same state machine and runbook. Refresh preserves the exact target mapping,
  package/web/graph/docs parents, advances every affected online-role version,
  stages/readbacks fresh expiry, then under `salt-publication` re-reads live
  versions and CAS-exposes only non-stale roles. Root rotation requires the
  approved sequential old+new threshold chain and an unexpired final root.
  Either transition emits that terminal maintenance receipt with live readback and
  forward-recovery state. Its plan-control update supersedes the prior active
  `current-r3-final-receipt` while atomically revalidating the unchanged active
  MCP/graph/docs aliases. Scheduled expiry monitoring must prove this path can
  finish before the earliest current role expiry; otherwise Unit 05 cannot
  activate. Unit 05 reuses Plan 001's `acquire:salt-ai:current-authority`; every maintenance
  run materializes the complete exact tuple from the tracker token and pins that
  selector receipt before staging. It never follows a branch, workflow name, or
  stage-only alias, and no extra tracked selector file is maintained.

**Verification:**

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit05/input
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-release-authority-baseline-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/release-authority-baseline-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-activation-tooling-ready-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/activation-tooling-ready-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind authority-freeze-lease-receipt --require-state active --tracker plans/README.md --output dist/salt-ai-history/unit05/input/authority-freeze-active-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit05/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit05/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit05/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit05/input/current-effective-package-docs-parent-receipt.json --expected-rebase-receipt dist/salt-ai-history/unit05/input/release-authority-baseline-receipt.json --require-live-current
yarn verify:salt-ai-history-authority-rebase -- --mode fixture-freeze --release-authority-baseline-receipt dist/salt-ai-history/unit05/input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit05/input/authority-freeze-active-receipt.json --activation-tooling-ready-receipt dist/salt-ai-history/unit05/input/activation-tooling-ready-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit05/input/current-authority-selector-receipt.json --require-unexpired-freeze
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-r2-final-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-effective-selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/effective-selected-graph.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-mcp-final-disposition-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/mcp-final-disposition.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-descriptor-rebind-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/support-descriptor-rebind-receipt.json --materialize-bound-artifact dist/salt-ai-history/unit05/input/support-descriptor.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-projection-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/support-projection-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind effective-public-package-docs-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind current-web-release-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/current-web-release-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-target-readback-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind production-mapping-input-readback-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json
yarn verify:salt-ai:historical-release-receipt -- --state final --stage HISTORICAL_R2_BETA --receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --target-readback-receipt dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit05/candidate
yarn validate:salt-ai:historical-support -- --descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit05/candidate/candidate-receipt.json --historical-release-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json
yarn test:ai-tooling
yarn check:ai-tooling:pack -- --expected-historical-release-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --report dist/salt-ai-history/unit05/pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-history/unit05/pack-report.json
yarn changeset status --output dist/salt-ai-history/unit05/changeset-status.json
yarn verify:salt-ai-history-versions -- --mode unchanged --unit 05 --tracker plans/README.md --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --changeset-status dist/salt-ai-history/unit05/changeset-status.json --pack-report dist/salt-ai-history/unit05/pack-report.json --output dist/salt-ai-history/unit05/version-cohort-receipt.json
yarn rehearse:salt-ai-history -- --mode fixture --channel historical-rehearsal-v1 --vector tooling/ai/historical-vectors/first-supported.json --mcp-final-disposition-receipt dist/salt-ai-history/unit05/input/mcp-final-disposition.json --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --candidate-receipt dist/salt-ai-history/unit05/candidate/candidate-receipt.json --pack-report dist/salt-ai-history/unit05/pack-report.json --version-receipt dist/salt-ai-history/unit05/version-cohort-receipt.json --web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --target-readback-receipt dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json --output dist/salt-ai-history/unit05/local-rehearsal-receipt.json
yarn pilot:salt-ai-history -- --mode fixture --vector tooling/ai/historical-vectors/first-supported.json --rehearsal-receipt dist/salt-ai-history/unit05/local-rehearsal-receipt.json --apps tooling/ai/historical-pilot-apps.json --output dist/salt-ai-history/unit05/local-pilot-receipt.json
yarn drill:salt-ai-history -- --mode fixture --vector tooling/ai/historical-vectors/first-supported.json --rehearsal-receipt dist/salt-ai-history/unit05/local-rehearsal-receipt.json --scenarios tooling/ai/historical-trust-drills.json --output dist/salt-ai-history/unit05/local-trust-drill-receipt.json
yarn eval:salt-ai:history -- --vector tooling/ai/historical-vectors/first-supported.json --pilot-receipt dist/salt-ai-history/unit05/local-pilot-receipt.json --output dist/salt-ai-history/unit05/local-eval-receipt.json
yarn rehearse:salt-ai-history-maintenance -- --operation refresh-historical-metadata --provider fixture --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --scenarios tooling/ai/historical-trust-drills.json --output dist/salt-ai-history/unit05/metadata-refresh-rehearsal-receipt.json
yarn verify:salt-ai-history-maintenance-receipt -- --state rehearsed --operation refresh-historical-metadata --receipt dist/salt-ai-history/unit05/metadata-refresh-rehearsal-receipt.json
yarn rehearse:salt-ai-history-maintenance -- --operation rotate-historical-root --provider fixture --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --root-rotation-plan tooling/ai/historical-root-rotation.json --scenarios tooling/ai/historical-trust-drills.json --output dist/salt-ai-history/unit05/root-rotation-rehearsal-receipt.json
yarn verify:salt-ai-history-maintenance-receipt -- --state rehearsed --operation rotate-historical-root --receipt dist/salt-ai-history/unit05/root-rotation-rehearsal-receipt.json
yarn verify:salt-ai-history-activation -- --mode fixture --current-authority-selector-receipt dist/salt-ai-history/unit05/input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit05/input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit05/input/authority-freeze-active-receipt.json --activation-tooling-ready-receipt dist/salt-ai-history/unit05/input/activation-tooling-ready-receipt.json --support-descriptor-rebind-receipt dist/salt-ai-history/unit05/input/support-descriptor-rebind-receipt.json --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --target-readback-receipt dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json --candidate-receipt dist/salt-ai-history/unit05/candidate/candidate-receipt.json --rehearsal-receipt dist/salt-ai-history/unit05/local-rehearsal-receipt.json --pilot-receipt dist/salt-ai-history/unit05/local-pilot-receipt.json --drill-receipt dist/salt-ai-history/unit05/local-trust-drill-receipt.json --eval-receipt dist/salt-ai-history/unit05/local-eval-receipt.json --metadata-refresh-rehearsal-receipt dist/salt-ai-history/unit05/metadata-refresh-rehearsal-receipt.json --root-rotation-rehearsal-receipt dist/salt-ai-history/unit05/root-rotation-rehearsal-receipt.json --pack-report dist/salt-ai-history/unit05/pack-report.json --version-receipt dist/salt-ai-history/unit05/version-cohort-receipt.json --output dist/salt-ai-history/unit05/local-activation-gate-receipt.json
yarn eval:salt-ai:validate
yarn release:verify:ai-tooling
yarn build:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json
yarn check:salt-docs-authoring -- --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --expected-web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json
yarn workspace @salt-ds/site build
```

This bounded noncredentialed block runs immediately after R2 from the already
landed, pre-freeze-tested implementations; it confirms the real immutable R2
parents against the same fake-provider behavior and may not modify source. The
separate Unit-04 `historical-activation-tooling-ready-receipt` remains its
pre-freeze code-readiness parent. The fixture activation receipt must say
`eligible_for_activation: false` because
fixture evidence cannot authorize support. Persist the exact candidate, pack,
version, local rehearsal/pilot/drill/eval/gate, metadata-refresh rehearsal, and
root-rotation rehearsal receipts at immutable locators. A plan-control-only
readiness update tracker-binds the local gate and both maintenance rehearsals
under Unit 05, records the remaining digests as their closed parent set, and
leaves the unit `IN PROGRESS — protected activation pending`; it merges no
source. Only after that update may the sole protected
workflow's closed `historical-activate` operation download and revalidate the
exact Unit 04 historical R2 final and drill-final receipts, rebuilds the
candidate, package cohort, current web, and historical target at the approved SHA,
runs pilot/drill with `--mode protected`, runs eval with mode derived from its
validated pilot receipt, and writes
`pilot-receipt.json`, `trust-drill-receipt.json`, `eval-receipt.json`, and
`activation-gate-receipt.json` under `dist/salt-ai-history/unit05/`. Only a
schema-valid gate receipt with `eligible_for_activation: true` lets the existing
publisher begin the ordered saga: promote/read back the exact package tags while
the mapping remains unavailable; then expose/read back pending metadata as the
irreversible commit; then promote/read back the conditional current/root web
bytes, seal the activation commit, and sign/expose/read back the higher active
attestation, then seal `activation-release-receipt.json`. Only afterward may the
lease manager parent that receipt, consume the lease, CAS the coordinator, and
emit the authority-commit evidence for the atomic tracker update. No command
collapses those boundaries into a claimed atomic external transition.

The protected operation first reacquires the complete closed Unit 04 parent set
by tracker locator and SHA-256: R2/drill, successor effective graph, descriptor
artifact, projection, effective package docs, current web, historical target,
and production mapping-input readback, plus Unit 04's successor MCP disposition
(or explicit absence proof) selected by the reviewed vector. Plan 001's MCP
receipt is ancestry only and cannot authorize the republished adapter. It then runs these exact evidence steps before its existing
publisher transition:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/unit05/protected-input
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-release-authority-baseline-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/protected-input/release-authority-baseline-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-activation-tooling-ready-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/protected-input/activation-tooling-ready-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind authority-freeze-lease-receipt --require-state active --tracker plans/README.md --output dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/unit05/protected-input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/unit05/protected-input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/protected-input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/unit05/protected-input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/unit05/protected-input/current-effective-package-docs-parent-receipt.json --expected-rebase-receipt dist/salt-ai-history/unit05/protected-input/release-authority-baseline-receipt.json --require-live-current
yarn manage:salt-ai:authority-freeze -- --operation assert-active --tracker plans/README.md --current-authority-selector-receipt dist/salt-ai-history/unit05/protected-input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit05/protected-input/release-authority-baseline-receipt.json --activation-tooling-ready-receipt dist/salt-ai-history/unit05/protected-input/activation-tooling-ready-receipt.json --lease-receipt dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json --require-publication-lock --require-coordinator-readback
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-r2-final-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-drill-final-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/historical-drill-final-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind local-activation-gate-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/local-activation-gate-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind metadata-refresh-rehearsal-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/metadata-refresh-rehearsal-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind root-rotation-rehearsal-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/root-rotation-rehearsal-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-effective-selected-graph-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/effective-selected-graph.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-mcp-final-disposition-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/mcp-final-disposition.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-descriptor-rebind-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/support-descriptor-rebind-receipt.json --materialize-bound-artifact dist/salt-ai-history/unit05/input/support-descriptor.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-projection-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/support-projection-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind effective-public-package-docs-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind current-web-release-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/current-web-release-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-target-readback-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind production-mapping-input-readback-receipt --tracker plans/README.md --output dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json
yarn verify:salt-ai:historical-release-receipt -- --state final --stage HISTORICAL_R2_BETA --receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --target-readback-receipt dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json
yarn build:ai-tooling
yarn candidate:salt-ai-history -- --vector tooling/ai/historical-vectors/first-supported.json --generator-root dist/salt-ds-knowledge --output dist/salt-ai-history/unit05/protected-candidate
yarn validate:salt-ai:historical-support -- --descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --candidate-receipt dist/salt-ai-history/unit05/protected-candidate/candidate-receipt.json --historical-release-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json
yarn check:ai-tooling:pack -- --expected-historical-release-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --report dist/salt-ai-history/unit05/protected-pack-report.json
yarn smoke:consumer --skip-build --pack-report dist/salt-ai-history/unit05/protected-pack-report.json
yarn changeset status --output dist/salt-ai-history/unit05/protected-changeset-status.json
yarn verify:salt-ai-history-versions -- --mode unchanged --unit 05 --tracker plans/README.md --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --changeset-status dist/salt-ai-history/unit05/protected-changeset-status.json --pack-report dist/salt-ai-history/unit05/protected-pack-report.json --output dist/salt-ai-history/unit05/protected-version-cohort-receipt.json
yarn build:salt-ai-web -- --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json
yarn check:salt-docs-authoring -- --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --require-web-route-map dist/salt-ai-web/route-map.json
yarn verify:salt-ai-web -- --expected-web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --expected-historical-release-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json
yarn verify:published:salt-ai-web -- --stage HISTORICAL_R2_BETA --release-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json
yarn release:verify:ai-tooling -- --historical-release-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json
yarn smoke:consumer --published-cohort-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json
yarn pilot:salt-ai-history -- --mode protected --vector tooling/ai/historical-vectors/first-supported.json --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --apps tooling/ai/historical-pilot-apps.json --output dist/salt-ai-history/unit05/pilot-receipt.json
yarn drill:salt-ai-history -- --mode protected --vector tooling/ai/historical-vectors/first-supported.json --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --scenarios tooling/ai/historical-trust-drills.json --output dist/salt-ai-history/unit05/trust-drill-receipt.json
yarn eval:salt-ai:history -- --vector tooling/ai/historical-vectors/first-supported.json --pilot-receipt dist/salt-ai-history/unit05/pilot-receipt.json --output dist/salt-ai-history/unit05/eval-receipt.json
yarn verify:salt-ai-history-activation -- --mode protected --current-authority-selector-receipt dist/salt-ai-history/unit05/protected-input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit05/protected-input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json --activation-tooling-ready-receipt dist/salt-ai-history/unit05/protected-input/activation-tooling-ready-receipt.json --fixture-activation-gate-receipt dist/salt-ai-history/unit05/input/local-activation-gate-receipt.json --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --support-descriptor-rebind-receipt dist/salt-ai-history/unit05/input/support-descriptor-rebind-receipt.json --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --target-readback-receipt dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json --candidate-receipt dist/salt-ai-history/unit05/protected-candidate/candidate-receipt.json --pilot-receipt dist/salt-ai-history/unit05/pilot-receipt.json --drill-receipt dist/salt-ai-history/unit05/trust-drill-receipt.json --eval-receipt dist/salt-ai-history/unit05/eval-receipt.json --metadata-refresh-rehearsal-receipt dist/salt-ai-history/unit05/input/metadata-refresh-rehearsal-receipt.json --root-rotation-rehearsal-receipt dist/salt-ai-history/unit05/input/root-rotation-rehearsal-receipt.json --pack-report dist/salt-ai-history/unit05/protected-pack-report.json --version-receipt dist/salt-ai-history/unit05/protected-version-cohort-receipt.json --output dist/salt-ai-history/unit05/activation-gate-receipt.json
yarn sign:salt-ai-history-production-metadata -- --operation stage-pending-activation --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json --historical-r2-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --activation-gate-receipt dist/salt-ai-history/unit05/activation-gate-receipt.json --support-state pending_activation --use-precommitted-activation-id --output dist/salt-ai-history/unit05/pending-production-metadata-receipt.json
yarn verify:salt-ai-history-production-metadata -- --operation stage-pending-activation --receipt dist/salt-ai-history/unit05/pending-production-metadata-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json --require-unexposed
yarn release:salt:transition -- --mode SALT_AI_HISTORICAL_RELEASE --operation commit-historical-r3 --parent-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --drill-receipt dist/salt-ai-history/unit05/input/historical-drill-final-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit05/protected-input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit05/protected-input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --target-readback-receipt dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json --pending-production-metadata-receipt dist/salt-ai-history/unit05/pending-production-metadata-receipt.json --activation-gate-receipt dist/salt-ai-history/unit05/activation-gate-receipt.json --output dist/salt-ai-history/unit05/activation-commit-receipt.json
yarn sign:salt-ai-history-production-metadata -- --operation attest-historical-activation --pending-receipt dist/salt-ai-history/unit05/pending-production-metadata-receipt.json --activation-commit-receipt dist/salt-ai-history/unit05/activation-commit-receipt.json --support-state active --same-activation-id --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json --output dist/salt-ai-history/unit05/active-support-attestation-receipt.json
yarn verify:salt-ai-history-production-metadata -- --operation attest-historical-activation --receipt dist/salt-ai-history/unit05/active-support-attestation-receipt.json --pending-receipt dist/salt-ai-history/unit05/pending-production-metadata-receipt.json --activation-commit-receipt dist/salt-ai-history/unit05/activation-commit-receipt.json --require-strictly-higher-version --require-unexposed
yarn release:salt:transition -- --mode SALT_AI_HISTORICAL_RELEASE --operation complete-historical-r3 --parent-receipt dist/salt-ai-history/unit05/input/historical-r2-final-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit05/protected-input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit05/protected-input/release-authority-baseline-receipt.json --authority-freeze-receipt dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json --activation-commit-receipt dist/salt-ai-history/unit05/activation-commit-receipt.json --pending-production-metadata-receipt dist/salt-ai-history/unit05/pending-production-metadata-receipt.json --active-support-attestation-receipt dist/salt-ai-history/unit05/active-support-attestation-receipt.json --activation-gate-receipt dist/salt-ai-history/unit05/activation-gate-receipt.json --output-dir dist/salt-ai-history/unit05
yarn verify:salt-ai-history-production-metadata -- --operation attest-historical-activation --receipt dist/salt-ai-history/unit05/active-support-attestation-receipt.json --pending-receipt dist/salt-ai-history/unit05/pending-production-metadata-receipt.json --activation-commit-receipt dist/salt-ai-history/unit05/activation-commit-receipt.json --activation-release-receipt dist/salt-ai-history/unit05/activation-release-receipt.json --require-exposed
yarn verify:salt-ai:historical-release-receipt -- --state final --stage HISTORICAL_R3_GA --receipt dist/salt-ai-history/unit05/activation-release-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit05/protected-input/current-authority-selector-receipt.json --release-authority-baseline-receipt dist/salt-ai-history/unit05/protected-input/release-authority-baseline-receipt.json --authority-freeze-active-receipt dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json --activation-commit-receipt dist/salt-ai-history/unit05/activation-commit-receipt.json --pending-production-metadata-receipt dist/salt-ai-history/unit05/pending-production-metadata-receipt.json --active-support-attestation-receipt dist/salt-ai-history/unit05/active-support-attestation-receipt.json --mcp-final-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --effective-selected-graph-receipt dist/salt-ai-history/unit05/input/effective-selected-graph.json --support-descriptor-rebind-receipt dist/salt-ai-history/unit05/input/support-descriptor-rebind-receipt.json --support-descriptor dist/salt-ai-history/unit05/input/support-descriptor.json --projection-receipt dist/salt-ai-history/unit05/input/support-projection-receipt.json --effective-package-docs-receipt dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --web-receipt dist/salt-ai-history/unit05/input/current-web-release-receipt.json --target-readback-receipt dist/salt-ai-history/unit05/input/historical-target-readback-receipt.json --mapping-input-readback-receipt dist/salt-ai-history/unit05/input/production-mapping-input-readback-receipt.json
yarn manage:salt-ai:authority-freeze -- --operation consume-on-activation --tracker plans/README.md --active-lease-receipt dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json --activation-release-receipt dist/salt-ai-history/unit05/activation-release-receipt.json --activation-commit-receipt dist/salt-ai-history/unit05/activation-commit-receipt.json --active-support-attestation-receipt dist/salt-ai-history/unit05/active-support-attestation-receipt.json --new-mcp-parent dist/salt-ai-history/unit05/input/mcp-final-disposition.json --new-effective-graph-parent dist/salt-ai-history/unit05/input/effective-selected-graph.json --new-effective-package-docs-parent dist/salt-ai-history/unit05/input/effective-package-docs-receipt.json --require-publication-lock --coordinator-cas --output dist/salt-ai-history/unit05/authority-freeze-terminal-receipt.json --backend-transition-output dist/salt-ai-history/unit05/authority-backend-transition-receipt.json
yarn verify:salt-ai-history-activation -- --mode authority-commit --activation-release-receipt dist/salt-ai-history/unit05/activation-release-receipt.json --authority-freeze-active-receipt dist/salt-ai-history/unit05/protected-input/authority-freeze-active-receipt.json --authority-freeze-terminal-receipt dist/salt-ai-history/unit05/authority-freeze-terminal-receipt.json --authority-backend-transition-receipt dist/salt-ai-history/unit05/authority-backend-transition-receipt.json --current-authority-selector-receipt dist/salt-ai-history/unit05/protected-input/current-authority-selector-receipt.json --output dist/salt-ai-history/unit05/historical-r3-authority-commit-receipt.json
yarn verify:published:salt-ai-web -- --stage HISTORICAL_R3_GA --release-receipt dist/salt-ai-history/unit05/activation-release-receipt.json
```

The two transitions re-read the Unit 04 registry tarballs/provenance and expected
package-tag, current-web-pointer, root-discovery, metadata, coordinator, and
freeze generations under the global lock. They require the historical manifest's
`bundle_version` to equal the published knowledge package version in that parent
cohort, then execute the ordered saga above. Package stable tags move and are
read back first; pending production mapping exposure is the irreversible commit;
current/root conditional discovery moves next; the strictly higher active
attestation is exposed and read back last. The journal records before/write/
readback for each external system and proves beta tags/pointers did not move.
A failure before pending exposure abandons staged roles and guarded-restores any
package tag already moved, leaving no surviving pointer change. After exposure,
the operation first resumes. If it cannot finish, it threshold-signs and exposes
a strictly higher generation that restores the prior logical mapping or revokes
it, proves a client that accepted the failed generation accepts the compensation,
and only then guarded-restores package/current-web pointers still equal to this
cohort. Never CAS an older TUF role back into production.

Failed or compensated attempts emit only
`historical-activation-attempt-receipt` with a closed
`pre_exposure_abandoned | pending_in_progress | post_exposure_forward_recovered`
state. They can never validate as `HISTORICAL_R3_GA/final`, become current
authority, or consume the lease; after a non-resumable post-R2 failure the lease
uses `withdrawn_post_r2` and a new cohort is required. The protected publisher
uploads every attempt receipt and saga journal
to a no-overwrite content-addressed incident locator with the same support-EOL
retention as release evidence. Before any different attempt or lease closure, a
plan-control incident update tracker-binds it under Unit-05 kind
`historical-activation-attempt-receipt`; an exact same-attempt resume must
reacquire that immutable journal. Ignored local `dist` is never the only copy.
A successful
`activation-release-receipt.json` instead proves the active attestation and
activation commit, exact package/current-web/target/metadata/capability/descriptor/
projection/docs parents, beta non-mutation, live readback, and no compensation.
It intentionally parents the active lease generation but not its not-yet-created
consumed successor. Only after that receipt validates may
`consume-on-activation` parent it, same-kind supersede the lease, and CAS the
coordinator to the receipt's exact new four-entry authority tuple. The separate
`historical-r3-authority-commit-receipt` joins the successful activation,
consumed lease, and coordinator readback without creating a digest cycle.

Runtime states are unambiguous. A visible `pending_activation` mapping without
its higher active attestation is unavailable and `activation_in_progress`;
resolvers must not select it. Active attestation plus its activation-commit
digest is technically enabled even if an operator crashes before sealing or
tracker-binding the terminal receipts; automation must resume the same immutable
attempt, and Salt does not declare official support yet. Official support begins
only after the successful activation receipt, consumed-lease/coordinator receipt,
and atomic tracker authority update exist. Tests crash at every edge, explicitly
including active-attestation exposure→activation-receipt and activation-receipt→
lease-consumption. The exposed validator proves live role bytes, versions,
hashes, thresholds, expiry, stable activation ID, mapping, and commit digest equal
the staged attestation.

`acquire:salt-ai:release-receipt` and its validator already include the closed
`HISTORICAL_R3_GA`/`final` schema on Unit 04's tracker-recorded implementation
ref; Unit 05 only exercises it. The post-activation plan-control
update atomically verifies the coordinator's new generation, same-kind
supersedes the active freeze lease with its exact `consumed` successor,
tracker-binds `historical-r3-authority-commit-receipt`, supersedes the previously
active current-authority set, and records the activation receipt under the permanent audit kind
`historical-r3-activation-final-receipt`, then records four active
Plan-002/Unit-05 authority entries: that same activation receipt as
`current-r3-final-receipt`, Unit 04's R2-bound successor MCP disposition (or
absence proof) as
`current-mcp-final-parent-receipt`, Unit 04's historical effective graph as
`current-effective-selected-graph-parent-receipt`, and Unit 04's effective docs
seal as `current-effective-package-docs-parent-receipt`. The activation receipt
carries those three exact parent digests. Cross-plan supersession points from
each prior active entry to its immediate successor and must leave exactly one
unexpired active current set. Old exact selectors remain valid for audit but
fail `--require-live-current`; future release/historical descriptors must name
the new exact Plan-002 selector and matching parent selectors. A partial tracker
update or coordinator mismatch blocks every publisher; it is never repaired by
publishing from the old selector.

That update leaves Unit 05 `IN PROGRESS — negative crawl pending`. A separate
read-only job now binds the live historical authority and proves ordinary site
navigation has not launched yet:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --require-origin-plan 002 --require-origin-unit 05 --output-dir dist/salt-ai-history/pre-navigation-crawl/input
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind historical-r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-history/pre-navigation-crawl/input/historical-r3-activation-final-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/pre-navigation-crawl/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/pre-navigation-crawl/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/pre-navigation-crawl/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/pre-navigation-crawl/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/pre-navigation-crawl/input/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-history/pre-navigation-crawl/input/historical-r3-activation-final-receipt.json --require-live-current
yarn verify:salt-ai:negative-discovery-crawl -- --mode historical-pre-navigation --activation-receipt dist/salt-ai-history/pre-navigation-crawl/input/historical-r3-activation-final-receipt.json --live-current-authority-selector-receipt dist/salt-ai-history/pre-navigation-crawl/input/current-authority-selector-receipt.json --require-authority-bound-ai-routes --forbid-ordinary-site-historical-navigation --output dist/salt-ai-history/pre-navigation-crawl/pre-navigation-negative-crawl-receipt.json
```

Persist and tracker-bind that output under Unit-05 kind
`pre-navigation-negative-crawl-receipt`; same-job logs are insufficient. Only
after that evidence update may Unit 05's bounded post-activation
navigation PR run. It changes only the predeclared site/navigation files, never
package READMEs, the descriptor, target, mapping, immutable historical/current
web bytes, or package versions:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --require-origin-plan 002 --require-origin-unit 05 --output-dir dist/salt-ai-history/discovery/input
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind historical-r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery/input/historical-r3-activation-final-receipt.json
yarn acquire:salt-ai:release-parents -- --receipt dist/salt-ai-history/discovery/input/historical-r3-activation-final-receipt.json --tracker plans/README.md --output-dir dist/salt-ai-history/discovery/input/r3-parents
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind pre-navigation-negative-crawl-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery/input/pre-navigation-negative-crawl-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-descriptor-rebind-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery/input/support-descriptor-rebind-receipt.json --materialize-bound-artifact dist/salt-ai-history/discovery/input/support-descriptor.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-projection-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery/input/support-projection-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/discovery/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/discovery/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/discovery/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/discovery/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/discovery/input/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-history/discovery/input/historical-r3-activation-final-receipt.json --require-live-current
yarn verify:salt-ai:historical-release-receipt -- --state final --stage HISTORICAL_R3_GA --receipt dist/salt-ai-history/discovery/input/historical-r3-activation-final-receipt.json --parent-selector-receipt dist/salt-ai-history/discovery/input/r3-parents/parent-selector-receipt.json --mcp-final-parent dist/salt-ai-history/discovery/input/r3-parents/mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/discovery/input/r3-parents/effective-selected-graph-parent-receipt.json --effective-package-docs-receipt dist/salt-ai-history/discovery/input/r3-parents/effective-package-docs-parent-receipt.json
yarn project:salt-ai:historical-support -- --mode activate-navigation --descriptor dist/salt-ai-history/discovery/input/support-descriptor.json --projection-receipt dist/salt-ai-history/discovery/input/support-projection-receipt.json --activation-release-receipt dist/salt-ai-history/discovery/input/historical-r3-activation-final-receipt.json --activation-parent-selector-receipt dist/salt-ai-history/discovery/input/r3-parents/parent-selector-receipt.json --current-authority-selector-receipt dist/salt-ai-history/discovery/input/current-authority-selector-receipt.json --require-current-descendant-of-activation --output dist/salt-ai-history/discovery/navigation-projection-receipt.json
yarn build:salt-ai-web
yarn verify:salt-ai-web -- --expected-historical-r3-receipt dist/salt-ai-history/discovery/input/historical-r3-activation-final-receipt.json --live-current-authority-selector-receipt dist/salt-ai-history/discovery/input/current-authority-selector-receipt.json --forbid-immutable-byte-change
yarn workspace @salt-ds/site build
yarn seal:salt-ai:discovery-deployment -- --mode premerge --current-authority-selector-receipt dist/salt-ai-history/discovery/input/current-authority-selector-receipt.json --navigation-projection-receipt dist/salt-ai-history/discovery/navigation-projection-receipt.json --negative-crawl-receipt dist/salt-ai-history/discovery/input/pre-navigation-negative-crawl-receipt.json --negative-crawl-authority-policy same-or-maintenance-descendant --require-identical-mcp-graph-docs-web-support --site-output site/dist --expected-web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-history/discovery/deployment-candidate-premerge-receipt.json
```

The crawl selector must equal the PR selector or be its verified metadata-only
maintenance ancestor with identical MCP/graph/docs/web/support parents;
otherwise rerun and same-kind supersede the crawl before sealing. Persist the
premerge candidate with `completion_sha: null`; it cannot authorize
deployment. After that PR merges, a clean landed-ref job reacquires the exact
activation/descriptor/projection/current-authority and premerge candidate,
reruns the block above, and seals the landed identity:

```shell
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind historical-discovery-deployment-candidate-premerge-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery-landed/input/deployment-candidate-premerge-receipt.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --require-origin-plan 002 --require-origin-unit 05 --output-dir dist/salt-ai-history/discovery-landed/input
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind historical-r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery-landed/input/historical-r3-activation-final-receipt.json
yarn acquire:salt-ai:release-parents -- --receipt dist/salt-ai-history/discovery-landed/input/historical-r3-activation-final-receipt.json --tracker plans/README.md --output-dir dist/salt-ai-history/discovery-landed/input/r3-parents
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind pre-navigation-negative-crawl-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery-landed/input/pre-navigation-negative-crawl-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-descriptor-rebind-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery-landed/input/support-descriptor-rebind-receipt.json --materialize-bound-artifact dist/salt-ai-history/discovery-landed/input/support-descriptor.json
yarn acquire:salt-ai-history-evidence -- --unit 04 --kind historical-support-projection-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery-landed/input/support-projection-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/discovery-landed/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/discovery-landed/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/discovery-landed/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/discovery-landed/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/discovery-landed/input/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-history/discovery-landed/input/historical-r3-activation-final-receipt.json --require-live-current
yarn verify:salt-ai:historical-release-receipt -- --state final --stage HISTORICAL_R3_GA --receipt dist/salt-ai-history/discovery-landed/input/historical-r3-activation-final-receipt.json --parent-selector-receipt dist/salt-ai-history/discovery-landed/input/r3-parents/parent-selector-receipt.json --mcp-final-parent dist/salt-ai-history/discovery-landed/input/r3-parents/mcp-final-parent-receipt.json --effective-selected-graph-receipt dist/salt-ai-history/discovery-landed/input/r3-parents/effective-selected-graph-parent-receipt.json --effective-package-docs-receipt dist/salt-ai-history/discovery-landed/input/r3-parents/effective-package-docs-parent-receipt.json
yarn project:salt-ai:historical-support -- --mode activate-navigation --descriptor dist/salt-ai-history/discovery-landed/input/support-descriptor.json --projection-receipt dist/salt-ai-history/discovery-landed/input/support-projection-receipt.json --activation-release-receipt dist/salt-ai-history/discovery-landed/input/historical-r3-activation-final-receipt.json --activation-parent-selector-receipt dist/salt-ai-history/discovery-landed/input/r3-parents/parent-selector-receipt.json --current-authority-selector-receipt dist/salt-ai-history/discovery-landed/input/current-authority-selector-receipt.json --require-current-descendant-of-activation --output dist/salt-ai-history/discovery-landed/navigation-projection-receipt.json
yarn build:salt-ai-web
yarn verify:salt-ai-web -- --expected-historical-r3-receipt dist/salt-ai-history/discovery-landed/input/historical-r3-activation-final-receipt.json --live-current-authority-selector-receipt dist/salt-ai-history/discovery-landed/input/current-authority-selector-receipt.json --forbid-immutable-byte-change
yarn workspace @salt-ds/site build
yarn seal:salt-ai:discovery-deployment -- --mode rebind-landed --expected-receipt dist/salt-ai-history/discovery-landed/input/deployment-candidate-premerge-receipt.json --current-authority-selector-receipt dist/salt-ai-history/discovery-landed/input/current-authority-selector-receipt.json --allow-maintenance-descendant-of-activation --require-identical-mcp-graph-docs-web-parents --navigation-projection-receipt dist/salt-ai-history/discovery-landed/navigation-projection-receipt.json --negative-crawl-receipt dist/salt-ai-history/discovery-landed/input/pre-navigation-negative-crawl-receipt.json --site-output site/dist --expected-web-receipt dist/salt-ai-web/release-receipt.json --output dist/salt-ai-history/discovery-landed/deployment-candidate-receipt.json
```

Any normalized route/site/immutable-web or MCP/graph/docs-parent delta fails.
The premerge and landed authority selectors are both recorded: exact selector
equality passes, while a separately verified maintenance descendant of the
permanent activation may differ only in its release receipt and monotonic
metadata fields. Any other authority delta fails. Tracker-bind the
landed receipt with non-null completion SHA and retire the registered premerge
kind in the plan-control update:

```shell
yarn retire:salt-ai:premerge-evidence -- --plan 002 --unit 05 --premerge-kind historical-discovery-deployment-candidate-premerge-receipt --landed-kind historical-discovery-deployment-landed-candidate-receipt --tracker plans/README.md
yarn validate:salt-ai:tracker -- --tracker plans/README.md
```

The normal docs publisher then starts clean and runs:

```shell
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind historical-discovery-deployment-landed-candidate-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery/deploy/input/deployment-candidate-receipt.json
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --require-origin-plan 002 --require-origin-unit 05 --output-dir dist/salt-ai-history/discovery/deploy/input/current
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind historical-r3-activation-final-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery/deploy/input/historical-r3-activation-final-receipt.json
yarn acquire:salt-ai-history-evidence -- --unit 05 --kind pre-navigation-negative-crawl-receipt --tracker plans/README.md --output dist/salt-ai-history/discovery/deploy/input/pre-navigation-negative-crawl-receipt.json
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/discovery/deploy/input/current/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/discovery/deploy/input/current/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/discovery/deploy/input/current/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/discovery/deploy/input/current/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/discovery/deploy/input/current/current-effective-package-docs-parent-receipt.json --required-ancestor-receipt dist/salt-ai-history/discovery/deploy/input/historical-r3-activation-final-receipt.json --require-live-current
yarn release:salt:transition -- --mode SALT_DOCS_RELEASE --operation deploy-historical-discovery --candidate-receipt dist/salt-ai-history/discovery/deploy/input/deployment-candidate-receipt.json --deployment-time-current-authority-selector-receipt dist/salt-ai-history/discovery/deploy/input/current/current-authority-selector-receipt.json --activation-receipt dist/salt-ai-history/discovery/deploy/input/historical-r3-activation-final-receipt.json --negative-crawl-receipt dist/salt-ai-history/discovery/deploy/input/pre-navigation-negative-crawl-receipt.json --allow-maintenance-descendant --require-identical-mcp-graph-docs-web-support --output-dir dist/salt-ai-history/discovery/deploy
yarn verify:salt-ai:discovery-deployment -- --state final --receipt dist/salt-ai-history/discovery/deploy/final-receipt.json --expected-candidate-receipt dist/salt-ai-history/discovery/deploy/input/deployment-candidate-receipt.json --deployment-time-current-authority-selector-receipt dist/salt-ai-history/discovery/deploy/input/current/current-authority-selector-receipt.json --activation-receipt dist/salt-ai-history/discovery/deploy/input/historical-r3-activation-final-receipt.json --negative-crawl-receipt dist/salt-ai-history/discovery/deploy/input/pre-navigation-negative-crawl-receipt.json --require-live-readback --require-production-crawl
```

The terminal receipt is registered as
`historical-discovery-deployment-final-receipt` and proves the live site links
only to the exact active vector/immutable guide, root/current discovery still
matches the activation receipt, and the tracker-bound post-R3 pre-navigation
negative-crawl receipt is its
parent. Unit 05 remains `IN PROGRESS — discovery pending` until this receipt is
tracker-bound.

Immediately after the authority update, even while discovery is pending, every
routine production renewal may use exactly one
of the following mutually exclusive protected blocks. All expensive checking and
threshold signing completes in immutable, unexposed staging before the global
lock. The transition acquires `salt-publication`, re-reads live metadata and the
four authority parents, and aborts on any drift before exposing bytes.

Metadata-only refresh:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/maintenance/refresh/input
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/maintenance/refresh/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/maintenance/refresh/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/maintenance/refresh/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/maintenance/refresh/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/maintenance/refresh/input/current-effective-package-docs-parent-receipt.json --require-live-current
yarn sign:salt-ai-history-production-metadata -- --operation refresh-historical-metadata --preserve-active-support-from-current-release --require-support-state active --require-stable-activation-id-and-commit --current-authority-selector-receipt dist/salt-ai-history/maintenance/refresh/input/current-authority-selector-receipt.json --parent-receipt dist/salt-ai-history/maintenance/refresh/input/current-r3-final-receipt.json --output dist/salt-ai-history/maintenance/refresh/staged-metadata-receipt.json
yarn verify:salt-ai-history-production-metadata -- --operation refresh-historical-metadata --require-preserved-active-support --receipt dist/salt-ai-history/maintenance/refresh/staged-metadata-receipt.json --current-authority-selector-receipt dist/salt-ai-history/maintenance/refresh/input/current-authority-selector-receipt.json --require-unexposed
yarn release:salt:transition -- --mode SALT_AI_HISTORICAL_RELEASE --operation refresh-historical-metadata --current-authority-selector-receipt dist/salt-ai-history/maintenance/refresh/input/current-authority-selector-receipt.json --require-preserved-active-support --production-metadata-receipt dist/salt-ai-history/maintenance/refresh/staged-metadata-receipt.json --output-dir dist/salt-ai-history/maintenance/refresh
yarn verify:salt-ai-history-maintenance-receipt -- --state final --operation refresh-historical-metadata --require-preserved-active-support --receipt dist/salt-ai-history/maintenance/refresh/maintenance-release-receipt.json --staged-metadata-receipt dist/salt-ai-history/maintenance/refresh/staged-metadata-receipt.json --current-authority-selector-receipt dist/salt-ai-history/maintenance/refresh/input/current-authority-selector-receipt.json --require-exposed
```

Root rotation:

```shell
yarn acquire:salt-ai:current-authority -- --tracker plans/README.md --output-dir dist/salt-ai-history/maintenance/root-rotation/input
yarn verify:salt-ai:current-authority -- --selector-receipt dist/salt-ai-history/maintenance/root-rotation/input/current-authority-selector-receipt.json --release-receipt dist/salt-ai-history/maintenance/root-rotation/input/current-r3-final-receipt.json --mcp-final-parent dist/salt-ai-history/maintenance/root-rotation/input/current-mcp-final-parent-receipt.json --effective-selected-graph-parent dist/salt-ai-history/maintenance/root-rotation/input/current-effective-selected-graph-parent-receipt.json --effective-package-docs-parent dist/salt-ai-history/maintenance/root-rotation/input/current-effective-package-docs-parent-receipt.json --require-live-current
yarn sign:salt-ai-history-production-metadata -- --operation rotate-historical-root --root-rotation-plan tooling/ai/historical-root-rotation.json --preserve-active-support-from-current-release --require-support-state active --require-stable-activation-id-and-commit --current-authority-selector-receipt dist/salt-ai-history/maintenance/root-rotation/input/current-authority-selector-receipt.json --parent-receipt dist/salt-ai-history/maintenance/root-rotation/input/current-r3-final-receipt.json --output dist/salt-ai-history/maintenance/root-rotation/staged-metadata-receipt.json
yarn verify:salt-ai-history-production-metadata -- --operation rotate-historical-root --require-preserved-active-support --receipt dist/salt-ai-history/maintenance/root-rotation/staged-metadata-receipt.json --root-rotation-plan tooling/ai/historical-root-rotation.json --current-authority-selector-receipt dist/salt-ai-history/maintenance/root-rotation/input/current-authority-selector-receipt.json --require-unexposed
yarn release:salt:transition -- --mode SALT_AI_HISTORICAL_RELEASE --operation rotate-historical-root --root-rotation-plan tooling/ai/historical-root-rotation.json --current-authority-selector-receipt dist/salt-ai-history/maintenance/root-rotation/input/current-authority-selector-receipt.json --require-preserved-active-support --production-metadata-receipt dist/salt-ai-history/maintenance/root-rotation/staged-metadata-receipt.json --output-dir dist/salt-ai-history/maintenance/root-rotation
yarn verify:salt-ai-history-maintenance-receipt -- --state final --operation rotate-historical-root --require-preserved-active-support --receipt dist/salt-ai-history/maintenance/root-rotation/maintenance-release-receipt.json --staged-metadata-receipt dist/salt-ai-history/maintenance/root-rotation/staged-metadata-receipt.json --current-authority-selector-receipt dist/salt-ai-history/maintenance/root-rotation/input/current-authority-selector-receipt.json --root-rotation-plan tooling/ai/historical-root-rotation.json --require-exposed
```

The successful terminal receipt is uploaded immutably and registered as
`historical-metadata-refresh-final-receipt` or
`historical-root-rotation-final-receipt`. A plan-control update then supersedes
the active `current-r3-final-receipt` with that same maintenance receipt and
atomically revalidates—without copying or superseding—the exact unchanged MCP,
graph, and docs entries. `acquire:salt-ai:release-receipt` accepts the closed
`HISTORICAL_METADATA_MAINTENANCE`/`final` stage as a current authority only when
this complete chain validates. A missing tracker update, expired role, same-or-
lower role version, changed mapping/package/web/graph/docs identity, absent live
readback, or partial four-entry set is a failed maintenance run. After exposure,
recovery remains forward-only through a still-higher metadata generation. The
signer and transition accept either a terminal historical activation receipt or
the immediately preceding terminal maintenance receipt as `--parent-receipt`;
their schemas reject every other parent. Fixtures cover activation→refresh,
refresh→refresh, refresh→rotate, rotate→refresh, crash/resume at every edge, and
stale selector reuse.

**Gate:** all commands exit 0, every claimed operation has positive and hostile
evidence, every named local/protected receipt validates, the promotion/forward-
recovery/revocation drills pass, support/EOL owners accept the burden, and public
docs contain no broader historical claim. The canonical Unit-05 completion set
mirrors `plans/README.md`: live selector, frozen release baseline, pre-freeze
tooling-ready and active lease; complete acquired Unit-04 R2/drill/graph/MCP/
descriptor/projection/docs/web/target/mapping parents; tracker-bound post-R2
fixture gate plus both maintenance rehearsals; protected candidate/pack/version/
pilot/drill/eval/activation gate; pending metadata, activation commit, strictly
higher active-support attestation/readback, and successful historical-R3 final;
same-kind consumed lease, coordinator transition, authority-commit, and atomic
four-entry successor current authority; post-R3 pre-navigation negative crawl;
navigation premerge/landed pair and its retirement; normal docs deployment and
production-crawl final receipt. Failed/compensated attempt receipts are retained
for audit but cannot satisfy this set. The protected final receipt's
`activated_at` is the real live transition time.

The authority/consumed-lease tracker transaction is the official-support
boundary and moves Unit 05 to `IN PROGRESS — negative crawl pending`, then
`IN PROGRESS — discovery pending`. The later discovery final receipt gates the
broader launch announcement and plan completion; it does not retroactively make
the signed active mapping true.

## Cross-cutting security/test matrix

| Layer                 | Required evidence                                                                                                                                                                                                                              | Role                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Historical generation | current trusted generator plus exact-commit data-only source root, denied source execution, deterministic bytes, semantic/compiler/release receipts                                                                                            | release blocking    |
| Capability registry   | reader/analyzer/ruleset positive and unknown/old/new negative tuples per operation                                                                                                                                                             | PR/release blocking |
| Signed metadata       | threshold/root rotations, expiry, equivocation, revocation, old-client behavior                                                                                                                                                                | security blocking   |
| Durable state         | explicit offline initialization; immutable signed-metadata store; acceptance journal/commit point; restart/cache deletion/corruption/concurrency/clock rollback/crash recovery                                                                 | security blocking   |
| Download/cache        | origin, redirects, limits, paths, links, races, hashes, atomic commit, no secrets                                                                                                                                                              | PR/release blocking |
| CLI                   | trust initialization/status offline, sync-only network, exact target/digest pin and dry run, target/version identities, stdout/exit contract                                                                                                   | PR blocking         |
| MCP                   | if shipped: same exact pin/digest/capabilities or explicit current-only limitation; never writes/network                                                                                                                                       | blocking if claimed |
| Package               | clean effective-graph-selected two/three-package pack report, partition/Changeset/exact-dependant equality, no executable remote rules, secrets, duplicate bundles, workspace/deep imports                                                     | release blocking    |
| Publication           | one protected authority, version-applied package cohort, verified provenance/smoke/readback before metadata CAS, global lock, threshold signatures, immutable parent receipts, guarded package/web rollback and forward-only metadata recovery | release blocking    |
| Operations            | monitoring, rotation/revocation/recovery/expiry/incident drill, EOL owner                                                                                                                                                                      | activation blocking |
| Public docs/web       | support descriptor parity across site/support matrix/package READMEs, docs-authoring/site/web builds, immutable links, bounded generated discovery                                                                                             | activation blocking |

## Definition of done

These criteria apply only after Unit 00 selects `remote-tuf`. The other three
results complete Unit 00 through the closed replacement/rejection tracker states
defined above, not by continuing through this checklist.

- [ ] Every Unit 00 entry and Unit 05 activation gate has named approval; Plan
      001 current offline operation remains unchanged.
- [ ] One exact historical vector builds reproducibly with mandatory
      applicability and honest operation capabilities.
- [ ] Two-root generation uses only current executable tooling, leaves the
      exact-commit historical source inventory unchanged, and seals two
      byte-identical builds plus `source_execution: "deny"` evidence.
- [ ] No downloaded content supplies executable code; reader/analyzer/ruleset
      compatibility is enforced by installed code.
- [ ] Explicit offline embedded-root initialization, threshold rotation,
      expiry/revocation, durable anti-rollback state plus verified signed
      metadata, transaction commit/crash recovery, and local-threat limitations
      are documented and tested.
- [ ] Cache paths use strict digest segments, commits are atomic, reads
      revalidate, cache deletion does not reset trust, and secrets are absent.
- [ ] Every package gate starts with a clean full AI cohort, smoke consumes its
      exact pack report when invoked, every version receipt joins the exact
      Changeset status and pack report, and reviewed Changesets keep knowledge
      plus exact CLI and selected MCP dependants version-aligned.
- [ ] Only explicit packed `knowledge sync` has network reachability; status,
      pin resolution, all Plan 001 commands, and any shipped MCP remain offline.
- [ ] Exact pin never falls back; unsupported historical scan/review is
      disabled with explicit coverage instead of current semantics.
- [ ] `bundle_version`, exact readable package vector, `package_vector_id`,
      `target_id`, bundle digest, and signed-metadata versions remain separate;
      all mappings and receipts carry them and reject ID/digest reuse.
- [ ] The sole protected workflow verifies provenance and immutable bytes,
      signs to an unexposed immutable staging area, then re-reads/CAS-promotes
      non-stale metadata under the global lock and rejects rollback to older roles.
- [ ] Unit 04 applies the consolidated Changeset matching all chained version
      intent on a reviewed immutable ref,
      publishes/provenance-verifies the exact final package cohort before
      rehearsal metadata CAS, and Unit 05 promotes only that retained cohort;
      historical `bundle_version` equals its published knowledge version.
- [ ] Unit 04/05 fixture and protected generation, rehearsal, pilot, drill,
      evaluation, activation-gate, and final release receipts exist at the
      contracted paths; every cross-job parent is reacquired by immutable
      locator plus SHA-256 and all hashes are recorded in the tracker.
- [ ] Public support claims name exact vectors, operations, limitations, owner,
      receipt, and EOL across the site, support matrix, package READMEs, and
      generated discovery; all docs/web gates pass and no untested range is
      implied.

## STOP conditions

Stop the affected remote-TUF unit and apply the closed tracker state above if:

- before Unit 01, no approved historical vector, provisional owner/backup, EOL,
  or locally testable origin hypothesis exists; or before Unit 04/05, the final
  production origin, custody, monitoring, recovery, or incident approvals do not
  exist;
- the Unit 00 decision does not prove that mutable remote mapping/revocation is
  necessary, or the maintained TUF dependency/profile cannot meet the approved
  remote requirements;
- private key material or credentials would need to enter source, package,
  cache, logs, or ordinary receipts;
- anti-rollback state or verified signed metadata would live only in disposable
  cache, ordinary sync could infer first use/reset silently, the acceptance
  commit point and crash recovery were not atomic/idempotent, or a root/index
  key could be introduced by the index itself;
- a rotation lacks old+new threshold authorization or old clients would accept
  a skipped/untrusted root;
- exact reader/analyzer/ruleset compatibility cannot be proven for a claimed
  operation;
- generation would need to install/import/execute historical checkout tooling,
  mutate its inventory, or use a branch/unresolved source identity;
- target/vector/bundle version axes remain ambiguous, a target ID can map to
  more than one digest, or receipts omit any identity needed to audit selection;
- historical scan/review would execute downloaded code or silently reuse
  current rule semantics;
- ordinary CLI or any shipped MCP operation would need network access, or a
  missing target would fall back to `latest`/nearest;
- immutable no-overwrite storage, verified readback/provenance, global
  serialization, CAS promotion, guarded package/web rollback, forward-only
  metadata recovery, or pre-expiry refresh/rotation is unavailable;
- a protected rehearsal/activation would run from a ref with pending package
  Changesets, before exact package publication/provenance/smoke, or with a
  `bundle_version` different from the published knowledge version;
- a tracker-recorded version/rehearsal/package parent receipt is absent,
  expired, mutable, digest-mismatched, or cannot be reacquired and revalidated;
- a clean full effective-graph-selected knowledge/CLI/(optional MCP) cohort, exact
  dependent repinning, reviewed Changeset, or pack-report-bound smoke cannot be
  reproduced;
- hostile path/size/signature/replay/concurrency tests can change trusted state
  or commit partial cache bytes.

## Maintenance

- Review metadata expiry continuously. Before the configured renewal threshold,
  the protected scheduler reacquires the active current authority, signs/stages
  a content-identical higher-version role set, runs
  `refresh-historical-metadata`, verifies live client readback, and tracker-
  supersedes the old current receipt. Root changes use only
  `rotate-historical-root` and the sequential dual-threshold chain. Rehearse
  refresh, root rotation, target revocation, post-exposure forward recovery, and
  incident handling at the ADR cadence; a workflow run without the successor
  tracker update is incomplete.
- Regenerate/test each supported vector on relevant Salt or ruleset changes;
  never broaden ranges automatically.
- EOL removes a vector from active selection through signed metadata but keeps
  immutable bytes/receipts for audit according to retention policy.
- Add another historical vector only with its own deterministic generation,
  capability matrix, pilot evidence, owner, EOL, and protected promotion.
- Revisit whether usage justifies this operational surface. Reject or retire
  active resolution through a separate compatibility/retention plan, never by
  deleting immutable bytes or silently breaking existing exact pins.
