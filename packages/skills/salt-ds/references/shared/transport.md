# Canonical Salt Workflow Contract

Use this contract whenever a Salt workflow needs to choose between canonical Salt guidance, project conventions, source validation, and runtime evidence.

## Contents

- [Default Model](#default-model)
- [Salt UI Task Rule](#salt-ui-task-rule)
- [Workflow Order](#workflow-order)
- [Transport Selection](#transport-selection)
- [Completion Gates](#completion-gates)
- [Noisy Or Partial Results](#noisy-or-partial-results)
- [Workflow Map](#workflow-map)
- [Runtime Evidence Ladder](#runtime-evidence-ladder)
- [Boundary Rule](#boundary-rule)

## Default Model

- Salt skills: the workflow layer.
- Salt MCP: the preferred transport for canonical Salt guidance.
- Salt CLI: the fallback transport when MCP is blocked.
- project conventions: repo-local refinements applied after the canonical step.
- runtime evidence: optional second-pass verification only.

Do not teach consumers transport internals as the primary story.

## Salt UI Task Rule

Treat a request as a Salt UI task by default when it asks to build, refine, restyle, structurally fix, review, audit accessibility, migrate, or upgrade UI in a Salt consumer repo and the work touches likely Salt surfaces such as dashboards, metric cards, data surfaces, navigation, app shells, sidebars, tabs, toolbars, forms, dialogs, overlays, tables, page layouts, or alignment and hierarchy fixes on existing Salt UI.

For Salt UI tasks:

1. Do not complete with generic React or CSS output if a canonical Salt option exists.
2. Complete a canonical Salt step, a validation step, and only then decide whether runtime evidence is still needed.
3. Keep project conventions and runtime evidence separate from the canonical Salt answer.

## Workflow Order

Use this order unless the task is explicitly narrower:

1. detected context: framework, package versions, repo instructions, imports, runtime targets.
2. canonical Salt guidance: recommendation, translation, lookup, or upgrade analysis.
3. completion gates: required follow-through, open questions, and exact-name grounding.
4. project conventions: only when the repo has local rules that change the final answer.
5. source-level validation: confirm the first pass before treating the work as done.
6. runtime evidence: only when source reasoning and validation are still not enough.

## Transport Selection

1. Prefer Salt MCP when it is available.
2. If Salt MCP is unavailable, keep the same workflow and let the environment fall back to the Salt CLI.
3. Do not select Salt components, patterns, props, tokens, plans, or code until the canonical Salt step succeeds through MCP or CLI.
4. If both MCP and CLI fail, resolve the blocker or ask the user before proceeding. Do not silently skip the canonical Salt step.
5. When MCP transport is used, let `create_salt_ui`, `review_salt_ui`, and `migrate_to_salt` auto-collect repo context by default only when the MCP server cwd is already the active repo. If the host knows the workspace path, pass it as `root_dir` on the workflow tool or on `get_salt_project_context`, then reuse the returned `context_id` across follow-up calls.
6. If MCP project context returns `resolution.status = needs_explicit_root` or `mismatch`, or resolves a root without the expected repo manifest, stop and retry with explicit `root_dir` instead of continuing with repo-specific guidance.
7. If both `.salt/team.json` and `.salt/stack.json` are missing, keep the first result canonical-only and recommend bootstrap only when durable repo policy or the managed repo instruction block would materially improve future Salt answers.
8. When CLI transport is used, start from `salt-ds info --json` only when the workflow needs explicit repo diagnostics or context inspection.
9. If Salt-managed repo instructions or host adapter files may be stale, rerun `bootstrap_salt_repo` or `salt-ds init` to refresh the managed Salt blocks instead of hand-rewriting them.
10. Keep the public CLI story workflow-first: `salt-ds init`, `salt-ds create`, `salt-ds review`, `salt-ds migrate`, `salt-ds upgrade`.
11. Read workflow `confidence` and `raiseConfidence` before deciding whether to edit, ask follow-up questions, or add runtime evidence.
12. Use structured `fixCandidates` from `salt-ds review --json` when the agent should apply deterministic remediation; read `fixCandidates` before editing, prefer deterministic candidates first, and rerun `salt-ds review` after edits.
13. When `salt-ds migrate --json` returns a familiarity contract, migration checkpoints, delta categories, and `migrationScope`, use them to preserve the important experience anchors while still moving the result toward canonical Salt, and answer `migrationScope.questions` before the first migration scaffold is treated as final.
14. Keep `salt-ds doctor` and `salt-ds runtime inspect` in the runtime-evidence layer, not as the default workflow surface.
15. Use `salt-ds review <path> --url <url>` when source validation and runtime evidence should stay in the same workflow pass.

## Completion Gates

The canonical step is not complete until the transport result is both relevant and complete enough for the intended output.
Read compact workflow output from top-level fields first:

- `workflow_status`
- `safe_to_implement_exact_request`
- `blocking_reasons`
- `next_step`
- `summary`

Treat these as blocking items when they affect the regions you plan to implement or review:

- `workflow_status != "success"`
- `safe_to_implement_exact_request = false`
- `blocking_reasons`
- `next_step`
- `required_follow_through`
- `implementation_gate` or equivalent follow-through markers
- `open_questions`
- `confirmation_needed`
- warnings that change pattern, component, theme, or token choice

For page-level and multi-region work, do not treat one valid sub-pattern as permission to skip unresolved peer regions.
If a required sub-surface is still unresolved, either keep that region pending or stop before final implementation.
Request or inspect `full` workflow output only when the blocking signal points to deeper artifacts such as composition details, starter snippets, or validation internals.

## Noisy Or Partial Results

When tooling is noisy, fail closed.

1. If MCP is unavailable, say so and switch to CLI.
2. If CLI or MCP returns useful output with a non-success status, treat it as **partial** and continue only with read-only inspection or clarification.
3. If a result is semantically off-target, misrouted to unrelated patterns, truncated, or malformed, do not count it as a completed canonical step.
4. If repeated follow-up calls for the same required item return conflicting or off-target results twice in a row, stop and report the blocker instead of guessing.
5. Do not use broad code generation to paper over incomplete canonical guidance.
6. When partial output is the best available signal, say what was learned, what remains unresolved, and what transport limitation prevented completion.

## Workflow Map

Keep the workflow names stable even when the transport changes.

When MCP is the transport:

- `init`: bootstrap repo-local `.salt/team.json` and the managed root instruction block locally by default; add host adapters and `ui:verify` only when explicitly requested.
- `context`: use `get_salt_project_context` for repo diagnostics, policy inspection, or explicit context reuse.
- `create`: start with `create_salt_ui`; read `workflow_status`, `safe_to_implement_exact_request`, `blocking_reasons`, `next_step`, and `summary` first; if compact output blocks implementation, follow `next_step` before editing the blocked region; for exact named follow-up, use `requested_entity`, `resolved_entity`, and `match_status`; request `full` only when you need deeper artifacts such as `composition_contract`, starter snippets, or expanded validation detail.
- `review`: start with `review_salt_ui`; read returned `confidence` and `fix_candidates`; add runtime evidence only if the source pass is still not enough.
- `migrate`: start with `migrate_to_salt`; read returned `confidence`, `post_migration_verification`, and `visual_evidence_contract`; use `source_outline` for structured mockup-style regions, actions, states, and notes.
- `upgrade`: start with `upgrade_salt_ui`; read returned workflow `confidence`; run `review_salt_ui` on updated code when it is available.

When CLI is the transport:

- `init`: `salt-ds init`
- `create`: `salt-ds create`
- `review`: `salt-ds review`
- `migrate`: `salt-ds migrate`
- `upgrade`: `salt-ds upgrade`

## Runtime Evidence Ladder

Escalate only as far as the claim requires:

1. source reasoning and validation
2. cheap URL fetch or fetched HTML for title, status, coarse structure, and obvious landmarks
3. `salt-ds doctor` when the runtime target is unclear or still ambiguous after `salt-ds info --json`
4. `salt-ds review <path> --url <url>` when source validation and runtime evidence should stay in the same workflow pass
5. `salt-ds migrate <query> --url <url>` when migration scoping needs current landmarks, action hierarchy, structure, or state visibility from the running experience
6. `salt-ds migrate [query] --source-outline <path>` when migration starts from a mockup or rough design outline that should be converted into structured evidence before translation
7. raw image attachments only after the host or adapter has normalized them into structured migration evidence
8. `salt-ds runtime inspect <url>` when the task is explicitly evidence-only debugging or support work and you already know the target URL

## Boundary Rule

Keep the public Salt story workflow-first.
Do not turn transport-specific quirks into the main design-system explanation.
