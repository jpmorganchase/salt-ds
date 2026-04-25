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
- [CLI Follow-Through for Entity Grounding](#cli-follow-through-for-entity-grounding)
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

- `status`
- `safety.exact_request_safe`
- `safety.blocking_reasons`
- `action`
- `next_required_action`
- `allowed_next_actions`
- `recipe.steps`
- `questions`
- `evidence`
- `summary`

Treat `salt_workflow_v1` action kinds as binding:

- `implement`: edit only when `status` is `success`, `safety.exact_request_safe` is true, and `evidence.status` is `complete`; then run the returned review/post action
- `complete`: stop without edits; the reviewed scope has no changes required
- `review`: run the returned Salt review action before calling the workflow complete
- `ask_user`: stop and ask the returned question before writing code
- `retrieve_entity` or `retrieve_examples`: gather the requested Salt evidence before implementing that region
- `install_dependencies`: install the listed Salt packages before writing Salt UI
- `fix_context` or `bootstrap_repo`: resolve setup or repo context before repo-specific edits

Use `recipe.steps`, `questions`, and `evidence.missing` to explain remaining work instead of guessing past a partial result.

When compact `create` remains `partial` or `blocked` on a broad or mixed-surface prompt, inspect the retrieval support surface before escalating to `full`:

- MCP:
  - `salt://catalog/candidates/{query}`
  - `salt://catalog/entity/{name}`
  - `salt://catalog/family/{family}`
- CLI:
  - `salt-ds discover_salt "<prompt>" --json`
  - `salt-ds get_salt_entity "<name>" --json`
  - `salt-ds get_salt_examples "<target>" --json`
  - `salt-ds info --json --catalog-query "<prompt>"`
  - `salt-ds info --json --entity "<name>"`
  - `salt-ds info --json --family "<category>"`

Use that support surface to inspect grounded candidates, `when_to_use`, `when_not_to_use`, and supporting surfaces.
Do not treat it as a replacement for the workflow contract.
It is a support layer for choosing the next exact follow-up or confirming the owner before requesting additive `full` output.

When citing canonical Salt guidance in an answer, use `top_source_urls` from `ide_summary` as the grounding links instead of fabricating documentation URLs.
When evaluating component fit, use `key_props` from compact component output to check prop availability without requesting the full prop list.
When a component is compound (e.g., Dialog, Accordion, Form field), compact output includes `sub_component_names` listing the child exports and `composition` with `required_children` and `optional_children`. When MCP support tools are available in the session, request `include: ["props"]` on `get_salt_entity` to get full props for both the root component and its sub-components. When they are not available, use `salt-ds create "<component>" --json --include-starter-code --starter-only` to get the resolved component with starter code.

Treat these as blocking items when they affect the regions you plan to implement or review:

- `status != "success"`
- `safety.exact_request_safe = false`
- `safety.blocking_reasons`
- `action.kind != "implement"`
- `next_required_action`
- `required_follow_through`
- `implementation_gate` or equivalent follow-through markers
- `open_questions`
- `confirmation_needed`
- `questions`
- `evidence.status != "complete"`
- `evidence.missing`
- warnings that change pattern, component, theme, or token choice
- follow-through entity calls that exhausted the 2-attempt degraded-tooling budget (see `degraded-tooling.md`)

For page-level and multi-region work, do not treat one valid sub-pattern as permission to skip unresolved peer regions.
If a required sub-surface is still unresolved, either keep that region pending or stop before final implementation.
Do not treat `status: partial` as completion just because a starter file, scaffold, or initial diff was created.
Request or inspect `full` workflow output only when the blocking signal points to deeper artifacts such as composition details, starter snippets, or validation internals.

## Noisy Or Partial Results

When tooling is noisy, fail closed.

1. If MCP is unavailable, say so and switch to CLI.
2. If CLI or MCP returns useful output with a non-success status, treat it as **partial** and continue only with read-only inspection or clarification.
3. If a result is semantically off-target, misrouted to unrelated patterns, truncated, or malformed, do not count it as a completed canonical step.
4. If repeated follow-up calls for the same required item return conflicting or off-target results twice in a row, stop and report the blocker instead of guessing.
5. Do not use broad code generation to paper over incomplete canonical guidance.
6. When partial output is the best available signal, say what was learned, what remains unresolved, and what transport limitation prevented completion.
7. Do not ask for `view: "full"` just to fix context or to guess past a blocked compact result. Retry context or exact follow-through first.
8. If compact create stays broad on a mixed-surface prompt, inspect retrieval support and then continue with an exact named follow-up instead of jumping straight to `full`.

## Workflow Map

Keep the workflow names stable even when the transport changes.

When MCP is the transport:

- `init`: bootstrap repo-local `.salt/team.json` and the managed root instruction block locally by default; add host adapters and `ui:verify` only when explicitly requested.
- `context`: use `get_salt_project_context` for repo diagnostics, policy inspection, or explicit context reuse.
- `create`: start with `create_salt_ui`; read `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, and `summary` first; if compact output blocks implementation, follow `action` before editing the blocked region; for exact named follow-up, use `request.entity`, `request.resolved_entity`, and `request.match_status`; leave `solution_type` unset on broad or mixed-surface asks unless the request already points clearly to a known Salt family; request `full` only when you need deeper artifacts such as `composition_contract`, starter snippets, or expanded validation detail.
  - branch on `action.kind` rather than prose: `ask_user` asks, `retrieve_entity`/`retrieve_examples` gathers evidence, `install_dependencies` installs packages first, and only `implement` allows editing
  - if compact output is still broad or mixed-surface after the first pass, inspect `salt://catalog/candidates/{query}` or the CLI catalog-query support before asking for `full`
  - once the owner is grounded, use `salt://catalog/entity/{name}` or an exact follow-up create call to ground the supporting surface instead of paraphrasing it again
- `review`: start with `review_salt_ui`; read returned `confidence` and `fix_candidates`; add runtime evidence only if the source pass is still not enough.
- `migrate`: start with `migrate_to_salt`; read returned `confidence`, `post_migration_verification`, and `visual_evidence_contract`; use `source_outline` for structured mockup-style regions, actions, states, and notes.
- `upgrade`: start with `upgrade_salt_ui`; read returned workflow `confidence`; run `review_salt_ui` on updated code when it is available.

The default MCP surface exposes six repo-aware workflow tools first, followed by read-only support tools: `get_salt_entity`, `get_salt_examples`, and `discover_salt`. `salt_workflow_v1` actions such as `retrieve_entity` and `retrieve_examples` are directly followable in the default MCP surface. In constrained hosts, still verify the session tool list before calling a support tool; if a support tool is unavailable, use the workflow fallback for entity grounding (for example, `create_salt_ui` with an exact entity name as `query`).

When CLI is the transport:

- `init`: `salt-ds init`
- `create`: `salt-ds create`
- `review`: `salt-ds review`
- `migrate`: `salt-ds migrate`
- `upgrade`: `salt-ds upgrade`
- `retrieve_entity`: `salt-ds get_salt_entity`
- `retrieve_examples`: `salt-ds get_salt_examples`
- broad support routing: `salt-ds discover_salt`

### CLI Follow-Through for Entity Grounding

When a `salt-ds create --json` call returns a compact `PublicContract`, read these top-level fields first: `status`, `safety.exact_request_safe`, `safety.blocking_reasons`, `action`, and `summary`.

If the first compact result is still broad on a mixed-surface prompt and the next exact entity is not obvious, inspect:

```sh
salt-ds discover_salt "<original prompt>" --json
salt-ds info --json --catalog-query "<original prompt>"
```

Use the returned owner and supporting candidates to choose the next exact follow-up before requesting `--full`.

When `required_follow_through` lists named entities that still need grounding before their regions can be implemented, run a targeted follow-up call for each entity:

```
salt-ds get_salt_entity "<entity name>" --json --include examples,accessibility
salt-ds create "<entity name>" --json --include-starter-code --starter-only
```

Do not force `--type component` on follow-through calls unless you are certain the entity is a component. Named entities from `required_follow_through` may be patterns (e.g., Metric, App header, Analytical dashboard) or components (e.g., Table, Card). Omit `--type` to let the resolution find the best match across all solution types.

The `--starter-only` flag returns a minimal JSON object with `workflow`, `status`, `decision`, `starter_code`, `composition_contract`, and any deeper follow-through metadata that still remains — no full workflow envelope. Use this for follow-through grounding instead of reparsing a full workflow output.

Read the follow-through result as:

- `workflow`: always `"create"`
- `status`: check this for success/partial/blocked before using the result
- `decision.name`: the resolved Salt entity name
- `starter_code`: canonical starter snippet(s) for the entity
- `composition_contract`: slot structure for compound entities
- any deeper follow-through metadata that remains: use it before treating the entity as complete

If `decision.name` is null or misrouted (resolves to the wrong entity), count it as one attempt against the degraded-tooling budget. Do not re-query the same entity more than twice.

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
