<!-- salt-ds:copilot-instructions:start -->

# Salt UI Workflow

Follow the repo root `AGENTS.md` as the primary Salt workflow contract.

- In the IDE, prefer Salt jobs in this order: review, upgrade, migrate, then create.
- When Salt returns `result.ide_summary`, render that compact summary first and use the rest of the workflow payload as supporting detail.
- For broad prompts such as `create a dashboard`, `add tabs`, `add a table`, or `fix this layout`, use the Salt workflow before editing.
- If a broad create result includes `composition_contract.expected_patterns` or `expected_components`, treat those named items as required Salt follow-through and run the matching Salt create follow-up before implementing those regions.
- Start from the active file, selection, nearby imports, or current feature folder before broad repo sweeps unless the task clearly needs wider repo context.
- If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first answer canonical-only and recommend the Salt bootstrap workflow or `salt-ds init` only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.
- Prefer the repo Salt UI agent in `.github/agents/salt-ui.agent.md` for those broad Salt UI tasks when your host supports custom agents.
- Do not use `node_modules`, copied app code, or generic web examples as canonical Salt guidance.
- Validate with the repo `ui:verify` script when it exists, or run `salt-ds review` directly, before considering Salt UI work done.
- If the Salt-managed repo guidance or generated host adapter files look stale, rerun `bootstrap_salt_repo` or `salt-ds init` to refresh them instead of hand-rewriting them.
- If Salt MCP and the Salt CLI are both unavailable, stop instead of improvising Salt-specific React/CSS/HTML.
<!-- salt-ds:copilot-instructions:end -->
