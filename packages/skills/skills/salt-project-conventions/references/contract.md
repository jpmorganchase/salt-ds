# Project Conventions Contract

Use project conventions only for downstream rules that refine canonical Salt guidance in one application repo or one shared organizational layer.

For most repos, keep one `.salt/team.json` file. If your organization also has a shared line-of-business layer, add `.salt/stack.json` and keep that shared layer separate from the team file. Each actual layer still uses the same base contract.

## Required Shape

Start with:

- `contract`
  - must be `project_conventions_v1`
- `version`
  - repo-owned version string

Common optional sections:

- `project`
- `preferred_components`
- `approved_wrappers`
- `pattern_preferences`
- `banned_choices`
- `notes`

## Boundary

- Salt MCP stays canonical and Salt-only.
- Project conventions stay downstream from the MCP.
- If multiple downstream layers exist, keep shared LoB defaults separate from team-specific overrides.
- Do not describe repo wrappers or local shells as if they were part of the official Salt registry.

## Merge Order

When multiple rules match, apply them in this order:

1. `banned_choices`
2. `preferred_components`
3. `approved_wrappers`
4. `pattern_preferences`
5. canonical Salt answer

## Rule Intent

- `preferred_components`
  - use when the repo explicitly replaces one canonical Salt choice with another repo-approved component name
- `approved_wrappers`
  - use when a repo-approved wrapper wraps a canonical Salt primitive
  - include import and usage-provenance fields when they materially change how the wrapper should be applied
- `pattern_preferences`
  - use when the repo standardizes one shell or page pattern around canonical Salt building blocks
- `banned_choices`
  - use when the repo forbids a specific choice and may require a replacement

## Authoring Rules

- Prefer explicit, evidence-backed rules over broad prose.
- Add `docs` links when the repo has ADRs, component docs, or migration notes that justify the rule.
- Keep `notes` for durable repo-wide guidance, not temporary migration chatter.
- If the rule only repeats canonical Salt guidance, it does not belong here.
- For approved wrappers, add `import`, `use_when`, `avoid_when`, and `migration_shim` when those details affect the final project answer.

## Bootstrap Companion

When you create a new `.salt/team.json` file for a simple repo, pair it with a small repo instruction snippet.

Default bootstrap rule:

- if the repo already uses a repo-local instruction file such as `CLAUDE.md` or another established equivalent, update that file
- otherwise create or update `AGENTS.md` by default
- do not create multiple competing repo instruction files unless the user explicitly asks for that

That companion snippet should:

- tell the agent to use the Salt MCP for canonical Salt guidance
- tell the agent that the Salt CLI is only the fallback transport when MCP is unavailable
- tell the agent to read `.salt/team.json` when `guidance_boundary.project_conventions.check_recommended` is `true`
- mention `.salt/stack.json` only as the layered upgrade path, not the default
- keep the canonical Salt answer visible when a repo rule changes the final choice
