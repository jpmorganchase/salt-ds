# MCP internal core

`src/core` is the deterministic reasoning layer inside `@salt-ds/mcp`. It owns
registry construction and loading, exact catalog retrieval, project-policy
evaluation, and pure create/review/migrate reasoning.

`src/server`, `src/cli.ts`, and `src/index.ts` own MCP protocol registration,
transport, process integration, and host compatibility. Production code crosses
into the core through `src/core/runtime.ts`; registry-build code targets
`src/core/build/buildRegistry.ts` directly and is never a runtime export.

The core is an internal architecture boundary, not a workspace package or a
supported public API. A separate package should only be reconsidered when there
is a second production consumer, an independent release cadence, or a distinct
deployment boundary.
