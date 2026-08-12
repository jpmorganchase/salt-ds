# MCP internal core

`src/core` is the deterministic catalog and analysis layer inside
`@salt-ds/mcp`. It owns registry construction and loading, catalog search and
retrieval, submitted-source review, and factual project-policy parsing.

`src/server`, `src/cli.ts`, and `src/index.ts` own MCP protocol registration,
transport, process integration, and host compatibility. Production code crosses
into the core through `src/core/runtime.ts`; registry-build code targets
`src/core/build/buildRegistry.ts` directly and is never a runtime export.

## Catalog identity layers

| Identity                 | Inputs                                                  | Observable effect                                                                                                              |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Audit/build provenance   | Every sealed catalog input, including tests and stories | Binds the manifest input inventory, source revision, mutation checks, generator receipts, and immutable publication generation |
| Semantic source evidence | Production files plus consumed pattern stories          | Binds repository source records, canonical artifacts, semantic digest, and public catalog resource identity                    |

Tests and unconsumed stories remain inventoried, digest-bound, read-tracked,
and mutation-checked. Changing them rotates audit provenance and publishes a
new manifest-bound generation, but does not change canonical catalog facts or
semantic identity. A catalog fact may cite only production or deliberately
consumed semantic evidence; direct audit-only citations fail closed.

## Runtime catalog flow

Server startup opens `CatalogStoreV2` directly and completes the whole-catalog
integrity barrier before returning a server. Search and resources read that
verified store. Submitted-source review receives a purpose-built view containing
only catalog version/semantic identity plus the component, deprecation, and
token fields its rules consume. It does not receive a whole legacy registry or
materialize unrelated catalog families.

The legacy registry projection remains an internal build/test compatibility
boundary while its remaining supported callers are migrated. It is not part of
the packed runtime path or the MCP public API.

## Local filesystem trust model

The published `createSaltMcpServer` factory is transport-agnostic and
restricted by default. Without configured allowed roots, project inspection
fails closed. In restricted mode the server canonicalizes configured roots and
the optional default root, then enforces path-component containment after
`realpath`. Caller text is never an authorization grant. Embedders still own
authentication and tenant isolation.

`root_dir` selects an active repo or package only inside a configured authority.
With one allowed root, omission selects that root. With multiple allowed roots,
the server requires a configured default; otherwise omission fails closed.
Workspace ancestor discovery stops at the selected authority root.

The supported CLI explicitly selects `unrestricted_local_stdio`, uses the
filesystem permissions of the OS account that launched it, and defaults an
omitted root to the process working directory. This is a deliberate local-only
mode, not a suitable remote/shared configuration.

A discovered marker path is diagnostic evidence, not proof that the marker is
usable. Package, policy, and tsconfig data is reported only after bounded
validation. Invalid or unreadable inputs are returned as limitations rather
than converted into workflow decisions or remediation commands. All
marker/config readers share a regular-file, byte-bounded, lexical and canonical
containment primitive. The primitive opens the caller-named path, rechecks
canonical containment, and compares opened-handle and named-path filesystem
identity before and after reading. Observable replacement is rejected.

This is not a complete TOCTOU sandbox: Node does not provide a portable
directory-handle-relative, no-follow traversal for every path component.
Repositories writable by an attacker during inspection require OS-level
permissions, an immutable mount, or process sandbox isolation. Allowed roots
define intended scope; they do not replace those controls.

Project-context inspection is limited to:

- the package manifest at the requested root, with a 1 MiB content cap;
- authority-bounded declared Salt package resolution, package.json workspaces,
  pnpm workspace globs, catalogs, local workspace-protocol signals, and
  ambiguity/validity checks across package-manager lockfile families;
- `.salt` policy JSON and its complete policy IR;
- bounded tsconfig resolution only when validating declared policy import
  aliases;
- up to 16 policy-declared wrapper or theme source targets, capped at 128 KiB
  each, with 25,000 AST
  nodes, depth 128, 4,096 top-level statements, a 100,000 aggregate AST-node
  budget, and one cached parse per unique resolved module.

There is no general recursive source crawl. Review source is supplied explicitly
in tool arguments. Project inspection reports facts and limitations; the host
decides what action, if any, to take.

Review additionally caps each submitted artifact at 256 KiB, the aggregate at
512 KiB, structural traversal at 50,000 nodes/depth 128, normalized facts at
10,000, and rule comparisons at 250,000. Exceeding a structural or rule budget
discards partial analysis. Babel and PostCSS parsing is synchronous, so these
post-parse structural limits are not a wall-clock or heap sandbox. Remote/shared
embedders must isolate parsing in a resource-limited worker or process and apply
request deadlines before exposing it to untrusted tenants.

An invalid or escaping policy import target is reported as a limitation and is
not treated as resolved evidence. Project policy prose remains labeled
untrusted data; only server-owned condition and rule identities are executable.
Digest-bound policy snapshots are retained per server in a bounded LRU cache
(eight entries, 64 MiB total, 32 MiB per entry). Reads always reauthorize the
root; retained digests remain byte-stable across edits, while eviction or a
server restart expires old snapshots. Claim records expose only the exact
bounded declaration fields used by citations; canonical chunks carry the full
policy IR.

Operators should launch the local CLI with the least practical privileges and
sandbox it when repositories are untrusted. Remote/shared embedders must use
restricted mode with tenant-specific roots; never treat caller-provided
`root_dir` or a lexical `startsWith` check as authority.

The core is an internal architecture boundary, not a workspace package or a
supported public API. A separate package should only be reconsidered when there
is a second production consumer, an independent release cadence, or a distinct
deployment boundary.
