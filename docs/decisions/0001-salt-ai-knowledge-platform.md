# ADR 0001: Salt AI knowledge platform

- Status: accepted
- Decision date: 2026-08-27
- Review date: 2026-11-27
- Owners: `@saltdesignsystem` (primary), `@brooklynrob` (backup)
- Supersedes: archived MCP-primary direction in
  `advisor-plans/archive/019-keep-mcp-primary-and-model-applicability.md`

## Context

Salt's unreleased MCP prototype combines normalized documentation, examples,
analysis, project inspection, and protocol delivery. That prototype is useful
implementation evidence, but MCP is not a sufficiently broad product boundary.
The unused `@salt-ds/cli` and `@salt-ds/mcp` snapshot publications are test
artifacts and create no runtime compatibility obligation.

## Decisions

1. `@salt-ds/knowledge` is the only owner of the generated bundle, reader,
   deterministic query and applicability layers, submitted-artifact analyzer,
   and protocol-neutral project facts.
2. `@salt-ds/cli` publishes the `salt-ds` executable. The colliding `salt`
   executable name is forbidden.
3. CLI v1 starts with `help`, `version`, `info`, and `scan`. `docs` and `context`
   activate only after projection and retrieval gates pass.
4. `@salt-ds/mcp` is a thin, optional candidate. It owns no knowledge bytes or
   independent rules and is published only after both candidate and final
   outcome gates select `ship`; otherwise its final disposition is `omit`.
5. Storybook is maintainer-only visual evidence. No consumer journey or public
   artifact may require a Storybook process or URL.
6. GA supports exact current versions. Compatible ranges require source-bound
   or matrix-tested evidence; `latest` and nearest-version fallback are banned.
7. Ordinary knowledge, CLI, and analyzer paths are read-only, deterministic,
   offline, and free of model calls, telemetry, installation, and network I/O.
8. One analyzer creates one complete internal result. Pretty, JSON, SARIF,
   prompt, CLI, and MCP surfaces are renderers of that result.
9. Embeddings are not canonical. A future embedding index is a replaceable
   derived cache keyed by bundle digest, model identity, and index schema.
10. Executable rules are signed package code. Remote data may describe rules
    but may not contain executable JavaScript, commands, or install hooks.
11. Knowledge identity closes over knowledge-owned inputs only. Semantic,
    compiler/ruleset, and release-tool inputs are separate inventories; CLI and
    MCP sources do not affect knowledge identity.
12. `semantic_source_digest` and `compiler_digest` identify normalized semantic
    and compiler inputs. Git/tag/workflow provenance belongs only in the external
    release receipt. Pre-version private output is `publishable: false`, has a
    digest-derived `candidate_build_id`, and uses
    `package_version_state: "unversioned-candidate"`.

## Package and API ownership

Dependency direction is CLI -> Knowledge and MCP -> Knowledge. Knowledge never
depends on either adapter. The planned Knowledge package root API is:

```text
loadKnowledgeBundle
getKnowledgeManifest
resolveKnowledgeCompatibility
searchKnowledge
readKnowledgeRecord
renderKnowledgeContext
inspectSaltProjectFacts
analyzeSaltArtifacts
```

Generator APIs, Catalog-v2 compatibility, CLI formatting, MCP schemas, remote
cache/sync, and model calls are excluded from that public API.

The public CLI contract is `@salt-ds/cli`, binary `salt-ds`, Node >=22. The MCP
candidate is `@salt-ds/mcp`, binary `salt-mcp`, with package-root factory
`createSaltMcpServer(options)` and one schema-derived options type.

## Knowledge-v1 identity and limits

Knowledge-v1 has one JSON-Schema-validated outer manifest and one strict
`salt-artifact-tree/1`. The outer manifest hashes exactly one root descriptor.
Leaves commit every ordinary artifact exactly once. `bundle_digest` is SHA-256
over RFC 8785 canonical JSON of the outer manifest with only `bundle_digest`
omitted. `semantic_digest` covers normalized facts and records. The release
receipt, not the bundle, records source commit, tag, workflow, and package/web
subjects.

The mandatory applicability map classifies every record, rule, example, and
projection across this frozen family universe:

```text
@salt-ds/ag-grid-theme
@salt-ds/core
@salt-ds/countries
@salt-ds/date-adapters
@salt-ds/date-components
@salt-ds/embla-carousel
@salt-ds/highcharts-theme
@salt-ds/icons
@salt-ds/lab
@salt-ds/react-resizable-panels-theme
@salt-ds/styles
@salt-ds/theme
@salt-ds/window
```

Missing or `unknown` applicability excludes the item and reports incomplete
coverage. Inheritance intersects support and cannot broaden it. Each operation
also requires a package-owned allowlisted reader, analyzer, and ruleset
contract/digest. Unknown capabilities disable the operation.

Digest JSON form is lowercase `sha256:<64 hex>`; URI/filesystem form is
`sha256-<64 hex>`. A shared strict codec rejects noncanonical, encoded,
slash-containing, uppercase, or truncated forms.

Artifact-tree limits are depth 4, 256 internal children, 256 leaf entries,
64 KiB per descriptor node, 512 nodes, 8 MiB total descriptor bytes, and 40,000
ordinary artifacts. The outer manifest target is 32 KiB, search bootstrap index
512 KiB, default context 16 KiB, ordinary content artifact 64 KiB unless
allowlisted, compressed package 10 MiB, and unpacked package 25 MiB. Unit 00b's
Catalog-v2 baseline is retained as immutable Unit 00b evidence; it is not a
publishable Knowledge-v1 identity or a regenerable post-omission command. A budget change requires measurements,
fixtures, ADR review, and owner approval.

Semantic sources are explicit Salt public source/types/tokens/migrations,
allowlisted site MDX, canonical examples, migration records, and authored
Skill/AGENTS projections. Compiler inputs are schemas, generator/runtime source,
rules, and declared compiler dependencies. Release tooling is recorded only in
the release receipt. Broad `packages/*` input patterns are forbidden.

## Current-version boundary and package managers

Plan 001 ships no historical resolver, mutable index, sync, pin, trust
initialization, or custom public bundle override. Historical support is a STOP
handoff to Plan 002, `plans/002-add-secure-historical-salt-knowledge.md`, and cannot begin
until Plan 001 GA/discovery is tracker-complete.

Supported exact-resolution evidence is frozen as follows:

| Layout                                | Supported manager/lock contract                           | Status              |
| ------------------------------------- | --------------------------------------------------------- | ------------------- |
| npm physical `node_modules`           | npm 10.x or 11.x; package-lock v3                         | GA exact            |
| Yarn Classic physical `node_modules`  | Yarn 1.22.x; yarn.lock v1                                 | GA exact            |
| Yarn Berry `nodeLinker: node-modules` | Yarn 4.17.x; lock metadata v8                             | GA exact            |
| pnpm isolated/hoisted `node_modules`  | pnpm 9.x or 10.x; lockfile 9.0, unique contained realpath | GA exact or partial |
| Bun physical `node_modules`           | detected only                                             | partial             |
| Yarn Plug'n'Play                      | detected; `.pnp.cjs` is never executed                    | partial             |
| unknown/custom                        | detected, never guessed                                   | partial             |

Stable resolver limitation codes are
`SALT_LOCKFILE_AMBIGUOUS`, `SALT_LOCKFILE_UNSUPPORTED_VERSION`,
`SALT_RESOLVED_PATH_OUTSIDE_ROOT`, `SALT_LAYOUT_BUN_UNSUPPORTED`,
`SALT_LAYOUT_YARN_PNP_UNSUPPORTED`, `SALT_LAYOUT_CUSTOM_UNSUPPORTED`,
`SALT_PACKAGE_VECTOR_INCOMPATIBLE`, `SALT_PRERELEASE_UNDECLARED`, and
`SALT_FAMILY_APPLICABILITY_UNKNOWN`.

## Scanner and result contract

The scanner measures every bound incrementally before allocation. Project config
may lower, never raise, these values:

| Dimension                       | Default | Absolute ceiling | Limit outcome/code                                      |
| ------------------------------- | ------: | ---------------: | ------------------------------------------------------- |
| traversal depth                 |      32 |               64 | partial / `SCAN_TRAVERSAL_DEPTH_LIMIT`                  |
| visited directories             |  10,000 |           50,000 | partial / `SCAN_VISITED_DIRECTORY_LIMIT`                |
| directory entries               | 100,000 |          250,000 | partial / `SCAN_DIRECTORY_ENTRY_LIMIT`                  |
| queued paths                    |  25,000 |          100,000 | partial / `SCAN_QUEUED_PATH_LIMIT`                      |
| selected files                  |   5,000 |           20,000 | partial / `SCAN_SELECTED_FILE_LIMIT`                    |
| selected aggregate bytes        |  50 MiB |          200 MiB | partial / `SCAN_SELECTED_BYTES_LIMIT`                   |
| individual source bytes         |   1 MiB |            5 MiB | partial / `SCAN_SOURCE_BYTES_LIMIT`                     |
| discovery elapsed               |    15 s |             60 s | failed / `SCAN_DISCOVERY_TIMEOUT`                       |
| JS/TS AST nodes per file        | 250,000 |        1,000,000 | failed / `SCAN_JS_AST_NODE_LIMIT`                       |
| CSS nodes per file              | 100,000 |          500,000 | failed / `SCAN_CSS_NODE_LIMIT`                          |
| evidence candidates per file    |  25,000 |          100,000 | failed / `SCAN_EVIDENCE_LIMIT`                          |
| findings per file               |     500 |            2,000 | failed / `SCAN_FINDING_LIMIT`                           |
| worker concurrency              |       2 |                4 | configuration error / `SCAN_WORKER_CONCURRENCY_INVALID` |
| per-file worker deadline        |     5 s |             10 s | failed / `SCAN_WORKER_TIMEOUT`                          |
| worker old-generation heap      | 128 MiB |          256 MiB | failed / `SCAN_WORKER_OOM`                              |
| forced restarts per scan        |       8 |               32 | failed / `SCAN_WORKER_RESTART_LIMIT`                    |
| cumulative worker-job wall time |  15 min |           60 min | failed / `SCAN_WORKER_TIME_LIMIT`                       |
| whole scan elapsed              |  10 min |           30 min | failed / `SCAN_WHOLE_TIMEOUT`                           |
| canonical result bytes          |   2 MiB |            8 MiB | failed / `SCAN_RESULT_BYTES_LIMIT`                      |

Worker crash, protocol violation, parser/system failure, overlapping workspace
ownership, lost containment, and inability to enforce isolation are failed
coverage with `SCAN_WORKER_CRASH`, `SCAN_WORKER_PROTOCOL`,
`SCAN_PARSER_FAILURE`, `SCAN_WORKSPACE_OWNERSHIP_CONFLICT`,
`SCAN_PATH_CONTAINMENT_FAILURE`, or `SCAN_ISOLATION_UNAVAILABLE`. Unsupported
language/construct and undeclared family coverage are partial. Intentional
configured exclusions do not make coverage partial unless they leave a required
workspace unit unevaluated.

One `salt-scan-result/1` carries tool/engine/ruleset/knowledge identities,
normalized relative root facts, ordered workspace units, exact package evidence,
findings, coverage, and limitations. Findings are ordered by workspace unit,
path, start, severity, then rule ID. Finding IDs contain no absolute path.
Ordinary JSON contains no timestamps, durations, source text, or absolute paths.
Prompt output quotes and delimits untrusted source; SARIF converts UTF-8 byte
locations to character coordinates.

Exit 0 means complete/no threshold finding, 1 means a threshold finding, 2 is
usage/configuration, and 3 is incomplete/failed/incompatible/integrity/internal.
`--allow-incomplete` permits disclosed partial coverage to use 0/1 but never
overrides failed coverage. `--fail-on never` does not override exit 3.

Canonical migration records are authored under
`docs/ai/migrations/records/<id>.json`, not inferred from changelogs. They carry
owner, provenance, exact from/to ranges, affected families, prerequisites,
before/after examples, classification, verification, and limitations.

## MCP v1 and disposition

The candidate targets MCP `2026-07-28` and stable v2
`@modelcontextprotocol/server`, with `serveStdio` and `legacy: "reject"`. It is
local stdio, read-only, and explicit-root only. Authority comes from repeatable
startup `--root` values or `projectRoots`; cwd, repository content, tool input,
deprecated Roots, and client paths grant no authority.

Candidate tools are `search_salt`, `inspect_salt_project`, and
`review_salt_code`. Resource discovery is bounded to 16 bootstrap resources,
eight per page, four digest-bound templates, and 16 KiB per discovery response.
No record enumeration, remote HTTP, auth, prompts, sampling, elicitation,
mutation, subscriptions, network, compiler, crawler, or duplicate bundle ships.

Unit 07 selects candidate `ship` only when mode 4 adds at least five percentage
points on the predeclared MCP-eligible subset or two additional successful paired
cells per host/model, with no version-correctness or unsupported-claim-rate
regression. Unit 08c reruns all applicable final packed cells and may preserve
`ship`, preserve `omit`, or demote `ship` to `omit`; it may never promote an
omitted/unevaluated candidate. Any failed decision gate is `omit`. Omit deletes
the candidate from public workspaces, build, docs, release inventory, and
Changesets and publishes no package, binary, metadata, or setup guidance.

## Documentation and web projection

Generated Markdown is selected from the same semantic inputs; there is no
hand-written parallel AI corpus. Visibility is explicit in
`tooling/ai/content-visibility-v1.json`. Unsupported MDX fails generation.

Generated llms.txt v2 indexes exist at `/llms.txt`, `/ai/current/llms.txt`,
`/ai/beta/llms.txt`, and immutable
`/ai/v1/<sha256-segment>/llms.txt`. Each is at most 64 KiB and links only
manifest-selected immutable Markdown. No `llms-full.txt` ships. Route codec
`salt-ai-web-route/2` maps `/x/` to `/x/index.md`, replaces `.html` with `.md`,
and appends `.md` to other extensionless routes. Dot segments, encoded
separators, case-only collisions, or two HTML routes mapping to one Markdown
path fail. Markdown is `text/markdown; charset=utf-8`; HTML carries the Markdown
alternate and most-specific described-by relation.

Immutable routes use one-year immutable caching. Mutable root/current/beta
pointers use strong content hashes, monotonic receipt-bound generations,
60-second must-revalidate caching, and CAS. Live verification performs
conditional reads before and after promotion and refuses stale-body success.

The accountable site owner is `@saltdesignsystem` with `@brooklynrob` backup.
The checkout does not define an approved immutable storage target, upload
identity, live readback endpoint, pointer CAS primitive, or rollback command.
Those five fields are deliberately `unresolved` and block web beta/GA, but not
local Knowledge/CLI extraction. They must be ratified by ADR amendment; no
executor may invent them.

## Publication modes

Publication is no longer a Plan 001 completion gate. Plan 001 ends with the
locally packed, consumer-verified Unit 07 release candidate and authorizes no
version, registry, or deployment mutation. The design below is retained for the
separately activated Plan 003 publication track; none of its identities or
controls may be treated as provisioned merely because candidate artifacts
exist. Plan 001 namespace checks establish package-name and snapshot-lineage
compatibility only. They do not approve a workflow, environment, credential, or
registry mutation.

The sole credentialed publisher is operator-dispatched, protected, and bound to
an immutable approved tag or protected-branch-reachable commit. All modes share
one repository-wide lock, state machine, target allowlist, journal, CAS rules,
and workflow-policy checks. Cross-mode receipts and targets are rejected.

| Mode                | Closed write set                                                                                                           | Required rejection                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `ORDINARY_RELEASE`  | reviewed non-AI package partition                                                                                          | all AI packages/web/receipts                                                        |
| `SALT_AI_RELEASE`   | Knowledge, CLI, MCP only after final `ship`, and matching immutable AI web/pointers                                        | ordinary packages, omitted MCP, mixed/unversioned cohorts                           |
| `SALT_DOCS_RELEASE` | one receipt-selected full-site artifact and normal site pointer for `deploy-ai-discovery` or `deploy-historical-discovery` | npm, TUF, immutable AI/history bytes, AI pointers, arbitrary/unbound site artifacts |

Version-PR and snapshot jobs have no credentials, OIDC, publish, or deploy
authority. GitHub issue-comment publication is prohibited.

## Evaluation protocol

The frozen corpus has 14 disjoint outcome cases plus a separate activation
corpus. Modes are cumulative: mode 1 base repository/file/edit/test tools; mode
2 adds selected normalized Markdown; mode 3 adds local `salt-ds` and the winning
AGENTS/Skill bootstrap profile; mode 4 adds the exact same-digest MCP candidate.
Modes 1-3 are always required at GA. Final MCP `omit` closes mode 4 as
`not_selected`, not missing. `legacy_docs_reference` and
`prototype_mcp_reference` are diagnostic and non-cumulative.

Before mode 3, AGENTS-only, Skill-only, and combined profiles run on the
activation-only corpus. Highest unaided setup/discovery success wins with no
correctness regression; ties choose fewer artifacts, then fewer tokens. All
cells use fresh state, two predeclared host/model aliases, three repetitions,
equal frozen budgets, a committed seed, counterbalanced mode order, and one
initial attempt. One retry is allowed only for preclassified provider
transport/rate-limit/5xx failure before output or tool action. Quality,
timeout, host/tool, invalid/partial output, and grader failures are final.

The Markdown mode-2 minus mode-1 effect is reported without a minimum claim.
Mode 3 must improve task success by at least 10 percentage points over mode 2
with no version-correctness regression. The MCP materiality rule is the
five-point/two-cell rule above. Changing thresholds, modes, eligibility,
sampling, attempts, or budgets invalidates the cohort.

Metric formulas and budgets are frozen in `evals/salt-ai/protocol`. Key gates
are 95% retrieval recall@5 micro and category-macro on >=40 queries, 95%
precision and 90% recall per rule and macro on >=20 positive and >=20 negative
fixtures per gateable rule, unsupported claims below 2% with >=200 assessable
claims per gated mode and two mode-blind reviewers, deterministic builds, and
exact version correctness. Task failures/timeouts remain denominators.

Non-waivable metrics are bundle/package integrity, deterministic identity,
provenance, privacy/security/path isolation, version correctness, failed
coverage, complete modes 1-3, mode-3 uplift, unsupported-claim rate, and every
required cell. Only metrics predeclared `waivable: true` may use a named,
approved, expiring waiver.

PR cadence is deterministic validation only. Weekly cadence is the frozen smoke
cohort. R2/GA, major architecture changes, and material host/model changes run
the full cohort. Raw prompts, output, traces, credentials, and proprietary
fixtures stay in ignored `.salt-eval-cache`; git contains only schemas,
protocol, sanitized receipts, and summaries.

## Ownership and support

`@saltdesignsystem` is primary and `@brooklynrob` backup for the Knowledge
compiler, analyzer/rules, CLI/scanner, MCP candidate/adapter, docs/Skill/examples,
sample apps, release/provenance, web distribution, and evaluation until a later
reviewed inventory delegates a surface. This explicit concentration is safer
than inventing unavailable teams and must be reviewed before beta.

The approved public intake is
`https://www.saltdesignsystem.com/salt/support-and-contributions`. AI package
metadata and docs must not route support to GitHub Issues; existing AI-scoped
GitHub-Issues links are removed before beta. Intake requests versions/digests,
Node/OS, exact Salt vector, command/format/exit, sanitized config/minimal
fixture, offline state, and limitations—never proprietary source, lockfiles,
credentials, or environment values by default.

After GA, review weekly for one month, monthly for scanner/sample quality, on
every Salt release for the knowledge cohort, and quarterly for budgets and any
shipped MCP value/cost.
