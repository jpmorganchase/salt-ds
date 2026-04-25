<!-- salt-ds:repo-instructions:start -->

Use the Salt MCP for canonical Salt guidance.

Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.

When working in the IDE, prioritize these Salt jobs in order: review current UI, upgrade current Salt usage, migrate attached or referenced non-Salt UI, then create bounded new UI.

Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.

Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.

Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links.

For Salt UI tasks, complete:

- a canonical Salt selection step through Salt MCP or the Salt CLI fallback
- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)
- if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing
- do not treat `status: partial` as completion just because starter code or an initial scaffold was created; continue follow-through or report the work as incomplete
- use the compact Salt contract first: `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, `next_required_action`, `allowed_next_actions`, `recipe`, `questions`, `evidence`, and `summary`; inspect full workflow fields only when deeper artifacts are required
- hard gate: do not edit Salt UI for create, migrate, or upgrade implementation work unless the current workflow contract has `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`
- leave `solution_type` unset on broad or mixed-surface create prompts unless the user already asked for a known Salt family

Treat the compact `salt_workflow_v1` action as a command, not advice:

- `action.kind: "implement"`: implementation is allowed only when `status` is `success`, `safety.exact_request_safe` is true, and `evidence.status` is `complete`; after editing, run the returned review/post action
- `action.kind: "ask_user"`: stop and ask the returned question; do not edit around it
- `action.kind: "retrieve_entity"` or `"retrieve_examples"`: gather the named Salt evidence first, then rerun the originating workflow with the returned evidence bridge such as MCP `resolved_entities` or CLI `--resolved-entity` for create entity follow-through
- `action.kind: "install_dependencies"`: install the listed packages before writing Salt UI
- `action.kind: "fix_context"` or `"bootstrap_repo"`: resolve repo setup or context before repo-specific edits
- after `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, `bootstrap_repo`, or an answered `ask_user`, rerun the originating workflow with the returned evidence bridge before editing
- use `recipe.steps`, `questions`, and `evidence.missing` to report remaining work instead of guessing

If screenshots or mockups are involved in migration work, normalize them into structured outline evidence before the canonical Salt migrate step. Do not send raw image attachments directly to Salt MCP.

Do not inspect `node_modules`, copied app code, or generic web examples to choose Salt-specific components, patterns, tokens, props, or layout structures.

Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until the canonical workflow satisfies the hard gate; after editing, run the validation or review step.

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
