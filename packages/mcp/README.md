# @salt-ds/mcp

Read-only, offline-first Salt Design System MCP server.

## Install and configure

Use Node 22 or newer and install the package in the project the MCP will
inspect:

```sh
yarn add --dev @salt-ds/mcp
```

Configure a local stdio server in your MCP host:

```json
{
  "mcpServers": {
    "Salt": {
      "command": "node",
      "args": ["./node_modules/@salt-ds/mcp/bin/salt-mcp.js"]
    }
  }
}
```

Launch the host from the intended project directory. The local server runs
with the filesystem permissions of the account that launched it; use the least
practical privileges and sandbox untrusted repositories. This configuration is
for local stdio use, not a remote or shared service.

## Breaking public surface

The server registers exactly three read-only tools:

- `search_salt` searches bounded catalog summaries and returns canonical
  resource links;
- `inspect_salt_project` observes package, installation, workspace, and policy
  facts under a server-authorized local root; and
- `review_salt_code` parses each non-blank submitted artifact once and applies
  a bounded, source-bound allowlist of Salt rules to normalized facts.

These tools share one sealed, offline Catalog v2, but make different
applicability claims:

- `search_salt` returns current target-state Salt guidance. It does not claim
  that every result is usable with an older installed package;
- `inspect_salt_project` compares each observed Salt package version with the
  matching package version in the sealed catalog. Exact equality is reported
  as package-version applicability; a mismatch or missing version is unknown;
  and
- `review_salt_code` reports official rule disposition separately from outcome.
  An explicit deprecation timeline can establish a narrow historical finding
  or no-finding decision, but never complete historical API availability.

Every applicability result sets `historical_completeness` to `false` and leaves
peer compatibility `not_evaluated`. In particular, exact equality for a Salt
package is not proof that its AG Grid, Embla, or other peer combination is
supported. Project-observed versions remain labelled untrusted project data;
the compared catalog version remains official sealed-catalog evidence.

Catalog resources are schema-v2 and digest-bound. Discover the current manifest
and record template through MCP resource discovery; their shapes are:

- `salt://catalog/v2/sha256-<digest>/manifest`
- `salt://catalog/v2/sha256-<digest>/{family}/{id}`

Authorized project inspection also returns a digest-bound policy manifest URI.
Its manifest, bounded canonical-IR chunks, and individual claim records use:

- `salt://project-policy/v2/<authorized-root-token>/sha256-<digest>/manifest/index`
- `salt://project-policy/v2/<authorized-root-token>/sha256-<digest>/{chunk|claim}/{id}`

Every read reauthorizes the root. Issued policy snapshots are retained in a
bounded per-server LRU cache (eight entries, 64 MiB total, 32 MiB per entry),
so a digest URI keeps returning the same bytes across later policy edits while
that snapshot is retained. Eviction or a server restart expires that snapshot;
an uncached stale digest is rejected. Claim resources are minimal exact-field
projections, while the manifest chunks reconstruct the complete canonical IR.
The manifest and claim links are returned as MCP resource links; large policy
IR is therefore recoverable even when omitted from the bounded inline result.
Policy evaluation is enabled by default and is independent of delivery:
`include_policy_ir: true` explicitly requests a bounded inline copy, while
`evaluate_policy: false` selects detection-only inspection.

Inspection also returns an opaque `project_context_handle` backed by the same
bounded process-local cache. Passing it to `review_salt_code` reuses the exact
policy snapshot and resolved exact package versions without rereading the
project. Handles are fixed-size random capabilities and do not encode the
project path or digest. A handle expires on replacement, eviction, or server
restart and never bypasses root authorization. Passing `root_dir` to review
instead explicitly requests a fresh reinspection; passing neither keeps review
limited to submitted text and optional caller-supplied exact
`package_versions`. Review always reports `scope.kind = submitted_text_only`
and separately identifies the auxiliary `context_source` as `none`,
`caller_package_versions`, `retained_project_snapshot`, or
`fresh_project_inspection`.

Resource discovery lists the curated catalog manifest rather than materializing
the internal graph. Exact records remain addressable through the digest-bound
resource template and links returned by search and parent records. Exact record
reads return compact metadata plus links to larger content; reading a `content`
resource returns its verified payload and media type. Resource-template
completion is bounded. The packaged catalog is immutable, so the server does
not advertise resource subscriptions or list-change notifications.

Resources are optional provenance and the exact-record path; they are not a
fourth tool or a second knowledge store. Search remains useful as bounded
current guidance even when a host does not automatically follow resource links.

Server creation crosses a whole-catalog integrity barrier before the server is
returned: every runtime family, support artifact, cross-reference, and content
object is verified. Manifest, per-file, aggregate stored-runtime, per-object
decoded-content, and aggregate declared decoded-content limits are enforced
before content-pack decompression.

The manifest reports the package `server_version`, catalog version and digests,
and the negotiated MCP protocol revision as separate identities.

There is no capability manifest or server-owned creation or migration workflow.

The stdio entry uses the SDK v2 dual-era server factory. It negotiates MCP
`2026-07-28` with modern or auto-negotiating clients and retains the legacy
`2025-11-25` and `2025-06-18` handshakes for existing clients. Earlier
revisions are intentionally not advertised because Salt tool results include
resource links, whose wire shape was added in `2025-06-18`. The public factory
returns the concrete `McpServer` type from `@modelcontextprotocol/server`;
callers that need dual-era negotiation should serve a fresh instance through
the SDK's serving entry, as the CLI does.

## Responsibility boundary

The server owns canonical Salt facts, deterministic retrieval, bounded
inspection, and evidence. The host agent owns dialogue, planning, code
generation, edits, authorization, iteration, and task completion.

Creation and migration are agent-owned procedures. An agent can inspect the
project, retrieve Salt evidence, make authorized edits, submit changed code for
bounded review, and run the consumer repository's real compile/runtime checks.
No MCP result authorizes a mutation or proves a file, repository, implementation,
or task complete.

## Local filesystem trust

The reusable factory is restricted by default. With no configured roots,
`inspect_salt_project` fails closed. Embedders enable inspection explicitly:

```ts
await createSaltMcpServer({
  projectAccess: {
    mode: "restricted",
    allowedRoots: [workspaceRoot],
    defaultRoot: workspaceRoot,
  },
});
```

Requested roots are checked against canonical configured directories with path
component boundaries after `realpath`; sibling-prefix and symlink/junction
escapes are rejected. If exactly one root is configured it is the default. A
multi-root configuration must provide `defaultRoot` for omitted `root_dir`
requests.

The selected `root_dir` is the starting point for inspection. Workspace
discovery may inspect a bounded set of ancestors, but only within the
authorized root containment boundary; inspection results disclose whether that
bounded ancestor stage ran or reached its limit. Project-policy manifests,
chunks, and claims are authorized reads of untrusted project data and carry
that trust classification in each resource envelope.

Dependency names, declared ranges, resolved versions, and resolved paths are
also project-controlled. Structured inspection results expose them only below
`data.installation.untrusted_project_data`, labelled with
`classification: untrusted_project_data`, `instruction_authority: none`, and
`authorization_meaning: read_access_only`. Top-level limitations and the text
fallback contain only stable repository-authored summaries and diagnostic
codes; raw dependency facts remain available in structured content.

Bounded readers also reopen the caller-named path, recheck canonical
containment, and compare the opened handle with the named path before and after
reading. Project inputs with multiple hard links are rejected because they do
not have a unique pathname identity. These checks detect observable
replacements, but Node does not expose
a portable directory-handle-relative, no-follow traversal for every path
component. An allowed repository that an attacker can rewrite concurrently
still requires OS permissions, an immutable mount, or process sandboxing.

The packaged CLI deliberately opts into `unrestricted_local_stdio`. It is a
local process with the filesystem permissions of the launching account, and an
omitted root uses its working directory. Run it with least practical privileges
and sandbox it for untrusted repositories. This explicit local mode must not be
copied into a remote or shared service.

Remote/shared authentication and tenant isolation remain the embedder's
responsibility; the factory's allowed-root policy bounds intended inspection
scope but is not an OS sandbox against hostile concurrent mutation. See the
[repository architecture guide](./CORE_ARCHITECTURE.md#local-filesystem-trust-model)
for the complete model. Repository Markdown is not part of the published
package.

Submitted review is limited to 256 KiB per artifact, 512 KiB per call, 50,000
AST/PostCSS nodes, depth 128, 10,000 normalized facts, and 250,000 rule
comparisons. Policy-import modules are limited to 128 KiB, 25,000 AST nodes,
depth 128, and 4,096 top-level statements, with unique-module caching and an
aggregate node budget. Limit exhaustion is atomic and returns no partial
findings. These structural limits do not provide a wall-clock or heap deadline
inside Node's synchronous parser. A remote or shared deployment must add a
resource-limited worker/process boundary with request deadlines; the package
does not claim safe multi-tenant parsing by itself.

Installation inspection understands package.json and pnpm workspace globs,
default/named catalogs, and local `workspace:` declarations. Unverifiable
protocol declarations are reported as such and never promoted to verified
health. Ambiguous lockfile families and invalid lockfile markers also downgrade
installation assessment to limited instead of following a fixed priority.
Lockfile presence is checked through contained, no-follow metadata and identity
validation; marker contents are not read.

## Package boundary

Published package contents are limited to the CLI entry point, compiled ESM and
CommonJS bundles, and the packaged offline Salt data needed by the registered
read-only surface. Internal builders, evaluation helpers, and source-only
artifacts are not public package APIs.

The Salt search, inspection, and submitted-code review operations use ordinary
Salt-owned inputs and results internally. MCP SDK schemas, content blocks,
resource links, and transport behavior stay at the server adapter edge. This
keeps the existing Node MCP product understandable without introducing another
package or generic protocol framework.

A Python host can use this MCP server as-is. Native Python implementation work
is deferred unless a real deployment cannot run the Node server. Concurrently
supported package-major ranges, exact tool-based record reads, a thinner
external Skill, or package-shipped documentation likewise require named product
evidence and separate plans; none is implied by the current applicability
labels.

The release build binds its generated catalog to the complete canonical input
pattern set in `src/core/build/catalogInputPatterns.json`. The package build re-enumerates
and byte-verifies that set at each build boundary and immediately before
success, rejecting added, removed, changed, or linked matching inputs.
