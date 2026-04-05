# @salt-ds/cli

Salt Design System workflow CLI package.

Use this package as the published fallback/support transport behind `salt-ds` when MCP is blocked or when you need direct manual support/debug access.

Install options:

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
  - bootstraps `.salt/team.json` plus repo-local instructions for a new or newly-adopting repo without changing the workflow model
  - can optionally scaffold a starter `.salt/stack.json` for repos using a shared conventions pack
  - scaffolds declared project policy only; repo-aware Salt workflows apply that policy automatically after bootstrap
- `salt-ds info [rootDir]`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - reports detected repo context, declared Salt policy, runtime signals, and workflow capabilities
- `salt-ds create <query>`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - supports `--include-starter-code`
  - creates Salt-first UI recommendations for new or existing repos without colliding with normal project build commands
- `salt-ds review [target ...]`
  - supports `--url <url>`
  - supports `--create-report <path>`
  - supports `--migration-report <path>`
  - supports `--json`
  - supports `--output <path>`
  - supports `--registry-dir <path>`
  - supports `--timeout <ms>`
  - supports `--mode <auto|browser|fetched-html>`
  - supports `--output-dir <path>`
  - supports `--no-screenshot`
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
  - compares Salt versions and turns the result into upgrade-oriented workflow output

Support commands:

- `salt-ds doctor [rootDir]`
  - supports `--json`
  - supports `--output <path>`
  - supports `--bundle` and `--bundle-dir <path>`
  - supports `--storybook-url <url>` and `--app-url <url>`
  - supports `--check-detected-targets`
  - supports `--timeout <ms>`
  - can probe runtime target reachability for explicit or detected local targets
  - validates layered Salt policy sources from `.salt/stack.json`, including package-backed shared conventions packs
  - can write a support bundle containing the doctor report plus manifest, Salt config, and policy-layer summaries
- `salt-ds runtime inspect <url>`
  - supports `--json`
  - supports `--output <path>`
  - supports `--output-dir <path>`
  - supports `--timeout <ms>`
  - supports `--mode <auto|browser|fetched-html>`
  - supports `--no-screenshot`
  - tries browser-session inspection by default, including screenshots, console and page errors, computed layout evidence, bounding boxes, and flex/grid ancestry when a browser runtime is available
  - falls back to `fetched-html` mode when browser-session inspection is unavailable, so consumers can still get structure, landmark, and accessible-name evidence even though computed layout evidence is unavailable

Canonical Salt grounding and declared-project-policy application now happen inside the public workflow commands and MCP tools. There is no second manual semantic CLI surface.

The intended model is:

- `salt-ds + MCP` when MCP is available
- `salt-ds + CLI` when MCP is blocked
- manual CLI use stays workflow-first
- `review --url`, `doctor`, and `runtime inspect` are support and evidence tools, not the main consumer story

Example workflow-oriented usage:

```sh
salt-ds init . --json
salt-ds init . --conventions-pack @acme/salt-conventions#markets --json
salt-ds info . --json
salt-ds create "Link to another page from a toolbar action" --json
salt-ds review src --json
salt-ds review src --create-report create-plan.json --json
salt-ds review src --url http://127.0.0.1:3000/ --migration-report migration-plan.json --json
salt-ds review src --url http://127.0.0.1:6006/?path=/story/example --json
salt-ds migrate "Translate this external UI toolbar into Salt" --json
salt-ds migrate "Translate this external UI toolbar into Salt" --url http://127.0.0.1:6006/legacy-toolbar --json --mode fetched-html
salt-ds upgrade --package @salt-ds/core --from-version 1.1.0 --json
```

Support-only examples:

```sh
salt-ds doctor . --check-detected-targets --bundle
salt-ds runtime inspect http://127.0.0.1:6006/?path=/story/example --json --output .salt-support/runtime-report.json
```

Interpreting runtime evidence:

- `browser-session`
  - stronger local evidence for screenshots, runtime/page errors, hydrated titles, landmarks, roles, rendered structure, and computed layout evidence such as boxes, centering clues, and flex/grid ancestry
- `fetched-html`
  - narrower fallback evidence for status, title, landmarks, roles, and coarse structure when browser-session inspection is unavailable
  - does not include computed layout evidence
- neither mode should be treated as canonical Salt policy; they are evidence inputs for create, review, migration, and support workflows
