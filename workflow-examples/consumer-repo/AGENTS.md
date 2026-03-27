Use the Salt MCP for canonical Salt guidance.

Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.

Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.

For Salt UI tasks, complete:

- a selection step through Salt MCP or the Salt CLI fallback
- a validation step through `analyze_salt_code` or `salt-ds review`
- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing

If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.

If source-level guidance is still not enough and the Salt CLI is available, use:

- `salt-ds doctor` for local environment and runtime-target checks
- `salt-ds review <path> --url <url>` when source validation and runtime evidence should stay in the same workflow pass
- `salt-ds runtime inspect <url>` only for explicit runtime debugging or support work

Keep that CLI evidence separate from canonical Salt guidance, and keep fetched-HTML fallback claims narrower than browser-session evidence.

If a Salt MCP response sets `guidance_boundary.project_conventions.check_recommended` to `true`:

- read `.salt/team.json` if it exists
- if `.salt/stack.json` also exists, resolve layers in that order instead
- let project conventions override the final project answer
- keep the canonical Salt choice visible as provenance
