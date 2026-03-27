# Canonical Salt Workflow Contract

Use this contract whenever a Salt workflow needs to choose between canonical Salt guidance, project conventions, source validation, and runtime evidence.

## Default Model

Use the stack like this:

- Salt skills
  - the workflow layer
- Salt MCP
  - the preferred transport for canonical Salt guidance
- Salt CLI
  - the fallback transport when MCP is blocked
- project conventions
  - repo-local refinements applied after the canonical step
- runtime evidence
  - optional second-pass verification only

Do not teach consumers transport internals as the primary story.

## Salt UI Task Rule

Treat a request as a Salt UI task by default when it asks to build, refine, restyle, structurally fix, review, migrate, or upgrade UI in a Salt consumer repo and the work touches likely Salt surfaces such as:

- dashboards, metric cards, or data surfaces
- navigation, app shells, sidebars, tabs, or toolbars
- forms, dialogs, overlays, tables, or page layouts
- alignment, spacing, centering, hierarchy, or composition fixes on existing Salt UI

For Salt UI tasks:

1. Do not complete with generic React or CSS output if a canonical Salt option exists.
2. Complete a canonical Salt step, a validation step, and only then decide whether runtime evidence is still needed.
3. Keep project conventions and runtime evidence separate from the canonical Salt answer.

## Workflow Order

Use this order unless the task is explicitly narrower:

1. Detected context
   - framework, package versions, repo instructions, imports, runtime targets
2. Canonical Salt guidance
   - recommendation, translation, lookup, or upgrade analysis
3. Project conventions
   - only when the repo has local rules that change the final answer
4. Source-level validation
   - confirm the first pass before treating the work as done
5. Runtime evidence
   - only when source reasoning and validation are still not enough

## Transport Selection

1. Prefer Salt MCP when it is available.
2. If Salt MCP is unavailable, keep the same workflow and let the environment fall back to the Salt CLI.
3. When MCP transport is used, start repo-aware work from `get_salt_project_context` by default.
4. When CLI transport is used, start from `salt-ds info --json` so the workflow has the same repo-context contract.
5. Keep the public CLI story workflow-first:
   - `salt-ds init`
   - `salt-ds init --conventions-pack [<package[#export]>]` when a selected repo needs starter stack scaffolding for a shared conventions pack
   - `salt-ds create`
   - `salt-ds review`
   - `salt-ds migrate`
   - `salt-ds upgrade`
   - read workflow `confidence` and `raiseConfidence` output before deciding whether to edit, ask follow-up questions, or add runtime evidence
   - use structured `fixCandidates` from `salt-ds review --json` when the agent should apply deterministic remediation
   - read `fixCandidates` before editing
   - prefer deterministic candidates first
   - apply only the candidates that still fit the repo context and the user goal
   - rerun `salt-ds review` after edits
   - when `salt-ds migrate --json` returns a familiarity contract, migration checkpoints, delta categories, and `migrationScope`, use them to preserve the important experience anchors while still moving the result toward canonical Salt
   - answer `migrationScope.questions` before the first migration scaffold is treated as final
   - when a saved migration report is available, use `salt-ds review --url <url> --migration-report <path>` to verify preserved intent against the migrated result
6. Keep `salt-ds doctor` and `salt-ds runtime inspect` in the runtime-evidence layer, not as the default workflow surface.
7. Use `salt-ds review --url <url>` when source validation and runtime evidence should stay in the same workflow pass.
8. Use `salt-ds migrate [query] --source-outline <path>` when migration starts from a mockup, screenshot notes, or a rough design outline that should be turned into structured regions, actions, states, and notes before translation.
9. Use `salt-ds migrate <query> --url <url>` when migration scoping needs current landmarks, action hierarchy, structure, or state visibility from the running experience.
10. Use both `--source-outline` and `--url` together when the migration needs to reconcile mockup-style intent with the current live UI before coding starts.
11. Do not add a second manual CLI vocabulary for canonical lookup. Keep the restricted-environment story on the same workflow commands.

## Workflow Map

Keep the workflow names stable even when the transport changes.

When MCP is the transport:

- `init`
  - bootstrap repo-local `.salt/team.json` and instruction files locally
  - keep any conventions-specific reasoning inside the Salt workflow layer rather than exposing a second MCP tool surface
- `context`
  - start with `get_salt_project_context` for normal repo-aware work
  - read `summary.recommended_next_workflow` before choosing the next MCP workflow tool
- `create`
  - start with `choose_salt_solution`
  - read returned workflow `confidence` and `raise_confidence`
  - use the returned logical follow-ups before editing when the recommendation still needs stronger evidence
  - do not assume every follow-up label maps to a separately exposed MCP tool on the default five-tool surface
- `review`
  - start with `analyze_salt_code`
  - read returned `confidence` and `fix_candidates`
- `migrate`
  - start with `translate_ui_to_salt`
  - read returned `confidence`, `post_migration_verification`, and `visual_evidence_contract`
  - use `source_outline` for structured mockup-style regions, actions, states, and notes
  - keep live current-UI capture outside MCP through `salt-ds migrate --url <url>`
- `upgrade`
  - start with `compare_salt_versions`
  - read returned workflow `confidence`
  - run `analyze_salt_code` on updated code when it is available
- `review`
  - add runtime evidence only if the source pass is still not enough

When CLI is the transport:

- `init`
  - `salt-ds init`
- `create`
  - `salt-ds create`
- `review`
  - `salt-ds review`
- `migrate`
  - `salt-ds migrate`
- `upgrade`
  - `salt-ds upgrade`

The default beta MCP surface stays on the five repo-aware workflow tools. Broad discovery and entity/example grounding remain implementation detail behind that surface.

## Runtime Evidence Ladder

Escalate only as far as the claim requires:

1. source reasoning and validation
2. cheap URL fetch or fetched HTML
   - title
   - status
   - coarse structure
   - obvious landmarks
3. `salt-ds doctor`
   - when the runtime target is unclear
   - or when stack-layer resolution and runtime targets still look ambiguous after `salt-ds info --json`
4. `salt-ds review <path> --url <url>`
   - when source validation and runtime evidence should stay in the same workflow pass
5. `salt-ds migrate <query> --url <url>`
   - when migration scoping needs current landmarks, action hierarchy, structure, or state visibility from the running experience
6. `salt-ds migrate [query] --source-outline <path>`
   - when migration starts from a mockup, screenshot notes, or a rough design outline that should be converted into structured evidence before translation
7. `salt-ds runtime inspect <url>`
   - when the task is explicitly evidence-only debugging or support work and you already know the target URL

Bootstrap repo-local conventions before create or review work when the repo has no declared Salt policy yet:

- `salt-ds init <rootDir>`
  - creates `.salt/team.json` by default
  - updates `AGENTS.md` or an existing `CLAUDE.md`
  - leaves `.salt/stack.json` setups intact when layered policy already exists

Keep the evidence levels clear:

- `browser-session`
  - stronger evidence for runtime errors, screenshots, hydrated output, and rendered structure
- `fetched-html`
  - narrower evidence for title, status, landmarks, and coarse structure

Treat layout-debug details as advanced evidence only.

## Boundary Rule

Keep these layers separate in the final answer:

- canonical Salt guidance
  - what Salt recommends
- detected context
  - what the repo currently contains
- project conventions
  - how this repo refines the answer
- runtime evidence
  - what local verification was used
