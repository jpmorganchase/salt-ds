# MCP internal core

`src/core` is the deterministic reasoning layer inside `@salt-ds/mcp`. It owns
registry construction and loading, exact catalog retrieval, project-policy
evaluation, and pure create/review/migrate reasoning.

`src/server`, `src/cli.ts`, and `src/index.ts` own MCP protocol registration,
transport, process integration, and host compatibility. Production code crosses
into the core through `src/core/runtime.ts`; registry-build code targets
`src/core/build/buildRegistry.ts` directly and is never a runtime export.

## Local filesystem trust model

The supported CLI runs as a local, read-only stdio process with the filesystem
permissions of the OS account that launched it. The published
`createSaltMcpServer` factory is transport-agnostic; an embedder that exposes it
remotely or shares it between users owns authentication, tenant isolation, and
path confinement. The local CLI trust statement does not transfer to that
deployment.

`root_dir` selects the active repo or package where bounded project-context
discovery begins. It is not an authorization grant, sandbox, or allowed-root
boundary. When omitted it resolves from the MCP process working directory, and
discovery may inspect readable ancestors for workspace manifests and tsconfig.
In a monorepo, callers should pass the active workspace-package root when the
repo root would be ambiguous.

A discovered marker path is diagnostic evidence, not proof that the marker is
usable. Package and tsconfig markers contribute to root signals, framework or
workspace conclusions, import aliases, trust, and repo-specific workflow
readiness only after validation. A malformed, non-file, unreadable, escaping,
oversized, or parser-rejected discovered marker keeps repo-specific create,
review, and migrate actions fail-closed until the marker is fixed or removed.
This validation boundary does not turn `root_dir` into authorization or
containment. Valid monorepo-ancestor and package-based tsconfig inheritance may
resolve outside `root_dir`.

Project-context inspection is limited to:

- package and workspace manifests, with a 1 MiB content cap;
- the nearest discovered tsconfig and its standard `get-tsconfig` inheritance
  resolution;
- Salt policy and installation data;
- up to 16 policy-declared wrapper or theme source targets, capped at 256 KiB
  each; and
- presence and path checks for AGENTS/CLAUDE instructions and framework
  configuration.

There is no general recursive source crawl. Review source is supplied explicitly
in tool arguments. `needs_explicit_root` and `mismatch` report context
confidence; they are not access-control decisions.

An unreadable, non-file, escaping, or parser-rejected discovered tsconfig fails
closed and exposes no partial aliases or validated tsconfig path. Broader
resource containment for inherited tsconfig graphs is not claimed by this
release and should be handled by the local process sandbox for untrusted repos.

Operators should launch the local process with the least practical privileges,
from an intended working directory, and sandbox it when repositories are
untrusted. Stricter containment requires a separately agreed authority such as
server-configured roots or verified MCP client roots, plus both lexical and
canonical/`realpath` containment checks to prevent symlink or junction escapes.
Do not treat caller-provided `root_dir` or a lexical `startsWith` check as that
authority.

The core is an internal architecture boundary, not a workspace package or a
supported public API. A separate package should only be reconsidered when there
is a second production consumer, an independent release cadence, or a distinct
deployment boundary.
