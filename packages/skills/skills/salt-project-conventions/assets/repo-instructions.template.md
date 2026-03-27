Use the Salt MCP for canonical Salt guidance.

Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.

Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.

For Salt UI tasks, complete:

- a selection step through Salt MCP or the Salt CLI fallback
- a validation step through `analyze_salt_code` or `salt-ds review`
- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing

If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.

If a Salt MCP response sets `guidance_boundary.project_conventions.check_recommended` to `true`:

- read `.salt/team.json` if it exists
- if `.salt/stack.json` also exists, resolve layers in that order instead
- let project conventions override the final project answer
- keep the canonical Salt choice visible as provenance

Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.
