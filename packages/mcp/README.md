# @salt-ds/mcp

Read-only, offline-first Salt Design System MCP server.

## Breaking public surface

The server registers exactly three read-only tools:

- `search_salt` searches bounded catalog summaries and returns canonical
  resource links;
- `inspect_salt_project` observes package, installation, workspace, and policy
  facts under a server-authorized local root; and
- `review_salt_code` parses each non-blank submitted artifact once and applies
  a bounded, source-bound allowlist of Salt rules to normalized facts.

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

Resource discovery cursor-pages every canonical record in descriptor order.
Exact record reads return compact metadata plus digest-bound links to larger
content; reading a `content` resource returns its verified payload and media
type. Resource-template completion is a convenience capped by the negotiated
protocol response and reports `total`/`hasMore`; exhaustive discovery always
uses resource listing. The packaged catalog is immutable, so the server does
not advertise resource subscriptions or list-change notifications.

The manifest reports the package `server_version`, catalog version and digests,
and the negotiated MCP protocol revision as separate identities.

There is no capability manifest or server-owned creation or migration workflow.

The stdio server and reusable factory deliberately use the SDK v2 legacy
protocol era. They advertise, in preference order, MCP `2025-11-25`,
`2025-06-18`, `2025-03-26`, `2024-11-05`, and `2024-10-07`; they do not
advertise MCP `2026-07-28`. The public factory now returns the concrete
`McpServer` type from
`@modelcontextprotocol/server`, which is an intentional breaking type change
from the former v1 SDK surface.

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

Bounded readers also reopen the caller-named path, recheck canonical
containment, and compare the opened handle with the named path before and after
reading. These checks detect observable replacements, but Node does not expose
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
scope but is not an OS sandbox against hostile concurrent mutation. See
[the packaged architecture guide](./CORE_ARCHITECTURE.md#local-filesystem-trust-model)
for the complete model.

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

## Package boundary

Published package contents are limited to the CLI entry point, compiled ESM and
CommonJS bundles, and the packaged offline Salt data needed by the registered
read-only surface. Internal builders, evaluation helpers, and source-only
artifacts are not public package APIs.
