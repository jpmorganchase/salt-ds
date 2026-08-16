---
"@salt-ds/mcp": major
"@salt-ds/core": minor
"@salt-ds/theme": patch
"@salt-ds/date-adapters": patch
"@salt-ds/icons": patch
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
and retains only the resource-link-compatible `2025-11-25` and `2025-06-18`
legacy revisions. Project inspection now labels dependency-controlled facts,
uses fixed-size opaque context handles and metadata-only lockfile probes, and
review results distinguish fresh, retained, caller-version, and context-free
evidence without implying that unsubmitted source was analyzed. Production
token applicability now excludes test, story, and QA sources.

The reusable factory is now restricted by default. Embedders should configure
`projectAccess.allowedRoots` and, where required, `defaultRoot` for bounded
project inspection. Trusted local-process embedders may instead select the
explicit public `unrestricted_local_stdio` mode; the packaged CLI selects that
mode automatically. It is not appropriate for remote or shared deployments.

Separated the three Salt operations from MCP response adaptation while keeping
the public three-tool surface unchanged. Search now labels its results as
current target-state guidance, inspection compares observed Salt package
versions with the sealed catalog without claiming peer compatibility, and
review reports official rule disposition and outcome with bounded,
source-backed version decisions. All applicability remains explicitly
historically incomplete, and component records no longer misstate the current
package version as an introduction version.

Exported `ValidationStatusValues` from `@salt-ds/core` as the supported
replacement for the deprecated `VALIDATION_NAMED_STATUS` constant and added
standard typed replacement links across deprecated Core APIs.

Corrected published Theme token aliases and deprecated-token replacement
metadata.

Corrected Date Adapters declaration generation, removed duplicate declaration
sources, kept source-only entrypoint metadata out of the published manifest,
removed workspace-only publish scripts and directory metadata, made
adapter-specific peers optional, and finalized the published README and
LICENSE, dual ESM/CommonJS module boundaries, derived export map, and isolated
packed-consumer verification.

Added resolvable replacement links to deprecated Icon declarations.
