# @salt-ds/cli

Salt Design System workflow CLI package.

Use this package as the published fallback/support transport behind `salt-ds` when MCP is blocked or when you need direct manual support/debug access.

Consumer setup lives in [`../../site/docs/getting-started/ai.mdx`](../../site/docs/getting-started/ai.mdx). This README is the CLI package reference.

Package invocation:

```sh
npx -y @salt-ds/cli@latest info . --json
npm install -g @salt-ds/cli
```

After global install, use the `salt-ds` binary directly.

Primary workflow commands:

- `salt-ds init [rootDir]`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - supports `--project <name>`
  - supports `--conventions-pack [<package[#export]>]`
  - supports `--add-agent-hooks` to write `.github/hooks/salt.json` (agent-loop `--hook` wiring)
  - bootstraps `.salt/team.json` plus repo-local instructions for a new or newly-adopting repo without changing the workflow model
  - can optionally scaffold a starter `.salt/stack.json` for repos using a shared conventions pack
  - scaffolds declared project policy only; repo-aware Salt workflows apply that policy automatically after bootstrap
- `salt-ds info [rootDir]`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - reports detected repo context, declared Salt policy, runtime signals, and workflow capabilities
  - includes a machine-readable `capabilityManifest` in JSON mode so hosts can inspect the compact contract version, workflow vocabulary, support-tool policy, v1 action/evidence gates, and runtime metadata without parsing prose
- `salt-ds create <query>`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - supports `--include-starter-code`
  - supports `--starter-only`
  - supports `--full`
  - creates Salt-first UI recommendations for new or existing repos without colliding with normal project build commands
  - `--json` is the compact public contract path for create
  - `--starter-only` is a create-only advanced JSON artifact path for starter grounding and follow-through
  - `--full` is the explicit rich-output path
- `salt-ds review [target ...]`
  - supports `--url <url>`
  - supports `--create-report <path>`
  - supports `--migration-report <path>`
  - supports `--json`
  - supports `--registry-dir <path>`
  - supports `--timeout <ms>`
  - supports `--mode <auto|browser|fetched-html>`
  - supports `--full`
  - surfaces `require_human_review_for` policy matches from `.salt/team.json` as ordinary blocking findings with rule id `policy.require_human_review_for.<kind>`; the command exits non-zero on the violation.
  - runs source-first Salt review for existing Salt code and can attach runtime evidence in the same pass when `--url` is provided
  - returns structured `confidence`, `raiseConfidence`, and `fixCandidates` in JSON output so the agent can judge whether to edit, inspect further, or ask follow-up questions without the CLI mutating files directly
  - can load a saved create report to check whether the implementation drifted away from the previously chosen canonical Salt direction
  - can load a saved migration report to verify preserved landmarks, action hierarchy, and other migration-contract checks during `review --url`
- `salt-ds migrate <query>`
  - supports `--url <url>`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - supports `--include-starter-code`
  - supports `--timeout <ms>`
  - supports `--mode <auto|browser|fetched-html>`
  - supports `--output-dir <path>`
  - supports `--no-screenshot`
  - supports `--full`
  - translates non-Salt UI intent into Salt-first targets and implementation guidance
  - returns a familiarity contract, migration scope, post-migration verification guidance, delta categories, confidence signals, and optional runtime-scoping evidence so the agent can preserve important experience anchors without cloning the old visual system
- `salt-ds upgrade`
  - supports `--package <name>`
  - supports `--component <name>`
  - supports `--from-version <version>`
  - supports `--to-version <version>`
  - supports `--include-deprecations`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - supports `--full`
  - compares Salt versions and turns the result into upgrade-oriented workflow output

Agent-hook commands (drive agent guardrails over stdin/stdout — designed to be wired by `init --add-agent-hooks`):

- `salt-ds hook`
  - PostToolUse / PreToolUse review over stdin; emits findings as one NDJSON line on stdout
  - supports `--emit-attestation`: on a clean PostToolUse review, emits a `SaltAttestationV1` payload (salt-ds.dev/schemas/attestation/v1) as one NDJSON line on stdout. Salt owns the payload; consumers pipe stdout to whatever audit store they already operate
- `salt-ds verify [<path>]`
  - reads `SaltAttestationV1` NDJSON from stdin (or the provided path), re-hashes the recorded files against the current on-disk state, and exits non-zero on drift. Standalone-usable in CI or from a Stop hook

`salt-ds review --hook` and `salt-ds review --verify-attestations` remain as backward-compatible aliases for these top-level commands.

Support commands:

- `salt-ds doctor [rootDir]`
  - supports `--json`
  - supports `--output <path>`
  - supports `--bundle` and `--bundle-dir <path>`
  - supports `--storybook-url <url>` and `--app-url <url>`
  - supports `--check-detected-targets`
  - supports `--timeout <ms>`
  - supports `--check-install`
  - supports `--check-install`
  - can probe runtime target reachability for explicit or detected local targets
  - validates layered Salt policy sources from `.salt/stack.json`, including package-backed shared conventions packs
  - `--check-install`: walks `node_modules/@salt-ds/cli/package.json` and `node_modules/@salt-ds/mcp/package.json`, checks whether `playwright` (or `playwright-core` / `@playwright/test`) appears in their transitive dependencies, and scans the repo for `--mode browser` / `--mode auto` usage in `package.json` scripts, `.github/` CI files, and `AGENTS.md`. Emits a `warn` check if playwright is present but no browser-mode usage is detected, suggesting `--mode fetched-html` or removing `runtime-inspector-browser` once task 0.1 (Playwright split) lands.
  - can write a support bundle containing the doctor report plus manifest, Salt config, and policy-layer summaries
  - `--check-install`: walks `node_modules/@salt-ds/cli/package.json` and `node_modules/@salt-ds/mcp/package.json`, checks whether `playwright` (or `playwright-core` / `@playwright/test`) appears in their transitive dependencies, and scans the repo for `--mode browser` / `--mode auto` usage in `package.json` scripts, `.github/` CI files, and `AGENTS.md`. Emits a `warn` check if playwright is present but no browser-mode usage is detected, suggesting `--mode fetched-html` or removing `runtime-inspector-browser` once task 0.1 (Playwright split) lands.
- `salt-ds runtime inspect <url>`
  - supports `--json`
  - supports `--output <path>`
  - supports `--output-dir <path>`
  - supports `--timeout <ms>`
  - supports `--mode <auto|browser|fetched-html>`
  - supports `--no-screenshot`
  - tries browser-session inspection by default, including screenshots, console and page errors, computed layout evidence, bounding boxes, and flex/grid ancestry when a browser runtime is available
  - falls back to `fetched-html` mode when browser-session inspection is unavailable, so consumers can still get structure, landmark, and accessible-name evidence even though computed layout evidence is unavailable
Canonical Salt grounding and declared-project-policy application happen inside the public workflow commands, MCP tools, and the read-only support commands that mirror `salt_workflow_v1` retrieval actions.
  - browser-session inspection uses the optional Playwright peer dependency. `--mode fetched-html` (or the default `--mode auto` fallback) runs without Playwright installed; `--mode browser` lazy-requires Playwright and exits with a clear install hint (`npm install playwright`) when it is absent. Playwright is **not** a transitive dependency of `@salt-ds/cli`, so cold installs do not pay its ~250 MB browser download cost.

Canonical Salt grounding and declared-project-policy application happen inside the public workflow commands, MCP tools, and the read-only support commands that mirror `salt_workflow_v1` retrieval actions.

Workflow JSON modes:

- `--json`
  - compact public contract
- `--full`
  - explicit rich workflow path: top-level `salt_workflow_v1` plus additive `details`
- `create --starter-only --json`
  - create-only narrow artifact contract for starter grounding and required follow-through
  - requires `--json`
  - rejects `--full`

Workflow-oriented examples:

```sh
salt-ds info . --json
salt-ds create "Link to another page from a toolbar action" --json
salt-ds review src --json
salt-ds migrate "Translate this external UI toolbar into Salt" --json
salt-ds upgrade --package @salt-ds/core --from-version 1.1.0 --json
```

Support-only examples:

```sh
salt-ds doctor . --check-detected-targets --bundle
salt-ds doctor . --check-install --json
salt-ds runtime inspect http://127.0.0.1:6006/?path=/story/example --json --output .salt-support/runtime-report.json
```

Interpreting runtime evidence:

- `browser-session`
  - stronger local evidence for screenshots, runtime/page errors, hydrated titles, landmarks, roles, rendered structure, and computed layout evidence such as boxes, centering clues, and flex/grid ancestry
- `fetched-html`
  - narrower fallback evidence for status, title, landmarks, roles, and coarse structure when browser-session inspection is unavailable
  - does not include computed layout evidence
- neither mode should be treated as canonical Salt policy; they are evidence inputs for create, review, migration, and support workflows
