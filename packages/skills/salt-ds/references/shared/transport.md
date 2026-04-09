# Canonical Salt Workflow Contract

Use this contract whenever a Salt workflow needs to choose between canonical Salt guidance, project conventions, source validation, and runtime evidence.

## Contents

- [Default Model](#default-model)
- [Salt UI Task Rule](#salt-ui-task-rule)
- [Workflow Order](#workflow-order)
- [Transport Selection](#transport-selection)
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

Treat a request as a Salt UI task by default when it asks to build, refine, restyle, structurally fix, review, migrate, or upgrade UI in a Salt consumer repo and the work touches likely Salt surfaces such as dashboards, metric cards, data surfaces, navigation, app shells, sidebars, tabs, toolbars, forms, dialogs, overlays, tables, page layouts, or alignment and hierarchy fixes on existing Salt UI.

For Salt UI tasks:

1. Do not complete with generic React or CSS output if a canonical Salt option exists.
2. Complete a canonical Salt step, a validation step, and only then decide whether runtime evidence is still needed.
3. Keep project conventions and runtime evidence separate from the canonical Salt answer.

## Workflow Order

Use this order unless the task is explicitly narrower:

1. Detected context: framework, package versions, repo instructions, imports, runtime targets.
2. Canonical Salt guidance: recommendation, translation, lookup, or upgrade analysis.
3. Project conventions: only when the repo has local rules that change the final answer.
4. Source-level validation: confirm the first pass before treating the work as done.
5. Runtime evidence: only when source reasoning and validation are still not enough.

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
10. Keep the public CLI story workflow-first: `salt-ds init`, `salt-ds create`, `salt-ds review`, `salt-ds migrate`, `salt-ds upgrade`. Use `salt-ds init --create-stack --conventions-pack [<package[#export]>]` only when a selected repo needs starter stack scaffolding for a shared conventions pack.
11. Read workflow `confidence` and `raiseConfidence` before deciding whether to edit, ask follow-up questions, or add runtime evidence.
12. Use structured `fixCandidates` from `salt-ds review --json` when the agent should apply deterministic remediation; read `fixCandidates` before editing, prefer deterministic candidates first, and rerun `salt-ds review` after edits.
13. When `salt-ds migrate --json` returns a familiarity contract, migration checkpoints, delta categories, and `migrationScope`, use them to preserve the important experience anchors while still moving the result toward canonical Salt, and answer `migrationScope.questions` before the first migration scaffold is treated as final.
14. When a saved migration report is available, use `salt-ds review --url <url> --migration-report <path>` to verify preserved intent against the migrated result.
15. Keep `salt-ds doctor` and `salt-ds runtime inspect` in the runtime-evidence layer, not as the default workflow surface.
16. Use `salt-ds review <path> --url <url>` when source validation and runtime evidence should stay in the same workflow pass.
17. Use `salt-ds migrate [query] --source-outline <path>` when migration starts from a mockup, screenshot notes, or a rough design outline that should be turned into structured regions, actions, states, and notes before translation.
18. If mockups or screenshots are available as raw attachments, normalize them into the published `migrate_visual_evidence_v1` contract or an equivalent `source_outline` payload before the canonical Salt migrate step runs.
19. Do not send raw screenshot or mockup attachments directly to Salt MCP. MCP stays on structured migrate inputs until raw attachment support is explicitly added.
20. When CLI transport uses `--mockup` or `--screenshot`, require a configured visual adapter first. If the adapter is missing or returns weak output, fail closed to `--source-outline` instead of guessing.
21. Use `salt-ds migrate <query> --url <url>` when migration scoping needs current landmarks, action hierarchy, structure, or state visibility from the running experience.
22. Use both `--source-outline` and `--url` together when the migration needs to reconcile mockup-style intent with the current live UI before coding starts.
23. Do not add a second manual CLI vocabulary for canonical lookup. Keep the restricted-environment story on the same workflow commands.

## Workflow Map

Keep the workflow names stable even when the transport changes.

When MCP is the transport:

- `init`: bootstrap repo-local `.salt/team.json` and the managed root instruction block locally by default; add host adapters and `ui:verify` only when explicitly requested.
- `context`: use `get_salt_project_context` for repo diagnostics, policy inspection, or explicit context reuse; read `artifacts.summary.recommended_next_tool` before choosing the next MCP workflow tool; treat bootstrap recommendations as improvement paths for future repo-aware refinement rather than hard preconditions for first-run value.
- `create`: start with `create_salt_ui`; read returned workflow `confidence` and `raise_confidence`; treat returned `composition_contract` as an implementation checklist, not a summary; if `composition_contract` includes `expected_patterns` or `expected_components`, run the matching Salt create follow-up for each unresolved pattern or component before implementing that sub-surface; ask on `open_questions`; use returned logical follow-ups before editing when the recommendation still needs stronger evidence; do not substitute generic React, HTML, CSS, or repo-local guesses for unresolved contract items; do not assume every follow-up label maps to a separately exposed MCP tool on the default six-tool surface.
- `review`: start with `review_salt_ui`; read returned `confidence` and `fix_candidates`; add runtime evidence only if the source pass is still not enough.
- `migrate`: start with `migrate_to_salt`; read returned `confidence`, `post_migration_verification`, and `visual_evidence_contract`; use `source_outline` for structured mockup-style regions, actions, states, and notes; preprocess raw screenshot or mockup attachments into structured visual evidence before calling `migrate_to_salt`; keep live current-UI capture outside MCP through `salt-ds migrate --url <url>`.
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
6. `salt-ds migrate [query] --source-outline <path>` when migration starts from a mockup, screenshot notes, or a rough design outline that should be converted into structured evidence before translation
7. raw image attachments only after the host or adapter has normalized them into `migrate_visual_evidence_v1` or `source_outline`
8. `salt-ds runtime inspect <url>` when the task is explicitly evidence-only debugging or support work and you already know the target URL

Bootstrap repo-local conventions when the repo needs durable repo policy or the managed root instruction block to improve future Salt answers. `salt-ds init <rootDir>` creates `.salt/team.json` by default, updates `AGENTS.md` or an existing `CLAUDE.md`, and leaves `.salt/stack.json` setups intact when layered policy already exists. When those Salt-managed instruction files may be stale, rerun `salt-ds init <rootDir>` to refresh the managed Salt blocks instead of hand-rewriting them.

Keep the evidence levels clear:

- `browser-session`: stronger evidence for runtime errors, screenshots, hydrated output, and rendered structure.
- `fetched-html`: narrower evidence for title, status, landmarks, and coarse structure.

Treat layout-debug details as advanced evidence only.

## Boundary Rule

Keep these layers separate in the final answer:

- canonical Salt guidance: what Salt recommends.
- detected context: what the repo currently contains.
- project conventions: how this repo refines the answer.
- runtime evidence: what local verification was used.
