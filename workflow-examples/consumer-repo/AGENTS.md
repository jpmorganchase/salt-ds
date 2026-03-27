<!-- salt-ds:repo-instructions:start -->

Use the Salt MCP for canonical Salt guidance.

Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.

When working in the IDE, prioritize these Salt jobs in order: review current UI, upgrade current Salt usage, migrate attached or referenced non-Salt UI, then create bounded new UI.

Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.

Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.

For Salt UI tasks, complete:

- a canonical Salt selection step through Salt MCP or the Salt CLI fallback
- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)
- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing
- if a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through and run the matching Salt create follow-up before implementing those sub-surfaces
- when a Salt workflow result includes `result.ide_summary`, use that compact summary first and expand the raw workflow fields only when needed

If screenshots or mockups are involved in migration work, normalize them into structured outline evidence before the canonical Salt migrate step. Do not send raw image attachments directly to Salt MCP.

Do not inspect `node_modules`, copied app code, or generic web examples to choose Salt-specific components, patterns, tokens, props, or layout structures.

Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical selection step and the validation step have completed successfully.

If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first result canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.

If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.

Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, or run `salt-ds review` directly.

If this Salt-managed block or the generated host adapter files look stale, rerun the Salt bootstrap workflow or `salt-ds init` to refresh the managed Salt guidance instead of hand-rewriting it.

If both Salt MCP and the Salt CLI are unavailable or failing, stop, resolve the blocker, or ask the user before proceeding. Do not continue with guessed Salt-specific guidance.

If a Salt workflow result says project conventions matter:

- keep repo-local policy in `.salt/team.json` when it exists
- use `.salt/stack.json` only when the repo already declares layered upstream policy
- use repo-aware Salt workflows so Salt applies the declared project conventions
- keep the canonical Salt choice visible as provenance

Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.

<!-- salt-ds:repo-instructions:end -->

If source-level guidance is still not enough and the Salt CLI is available, use:

- `salt-ds doctor` for local environment and runtime-target checks
- `salt-ds review <path> --url <url>` when source validation and runtime evidence should stay in the same workflow pass
- `salt-ds runtime inspect <url>` only for explicit runtime debugging or support work

Keep that CLI evidence separate from canonical Salt guidance, and keep fetched-HTML fallback claims narrower than browser-session evidence.
