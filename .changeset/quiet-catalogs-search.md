---
"@salt-ds/mcp": major
---

Replace the private Salt workflow protocol with the MCP SDK v2 adapter. The
package now exposes only `search_salt`, `inspect_salt_project`, and
`review_salt_code`. Resource discovery returns one curated, digest-bound
catalog manifest; exact records remain addressable through the catalog
resource template and links from search or parent records. Exact records link
larger verified content resources, while bounded resource-template completion
reports `total` and `hasMore`. Removed create,
migration, continuation, workflow-completion, starter-scaffold, and
workflow-specific policy contracts are not compatible with the former beta
surface.

The public `createSaltMcpServer` factory now returns the SDK v2 concrete
`McpServer` type. The stdio entry supports the current `2026-07-28` protocol
and retains the documented legacy revisions headed by `2025-11-25`.

The reusable factory is now restricted by default. Embedders should configure
`projectAccess.allowedRoots` and, where required, `defaultRoot` for bounded
project inspection. Trusted local-process embedders may instead select the
explicit public `unrestricted_local_stdio` mode; the packaged CLI selects that
mode automatically. It is not appropriate for remote or shared deployments.
