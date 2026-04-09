---
name: salt-ds
description: Salt Design System workflow for consumer repos. Use when Codex needs Salt-specific create, review, migrate, upgrade, or bootstrap guidance for UI work in repos that already use @salt-ds packages, .salt/team.json, .salt/stack.json, Salt MCP, or salt-ds CLI, or when the user explicitly asks to adopt Salt. Covers dashboards, navigation, forms, dialogs, tables, layouts, alignment, and repo-local Salt conventions. Example asks include reviewing a Salt dialog layout, creating a Salt-native dashboard page, migrating a non-Salt screen to Salt, or upgrading older Salt usage. Do not use for generic React/CSS advice or non-UI work that does not require Salt.
---

# Salt DS

Salt's public skill for repo-aware design-system work in external consumer repos.
Keep the product story on one workflow surface: `init`, `create`, `review`, `migrate`, `upgrade`; do not make the user choose between separate builder, reviewer, migration, upgrade, or conventions skills.

## Example Triggers

- `Review this Salt dialog layout and tell me the safest next fix.`
- `Create a Salt-native dashboard page for this feature.`
- `Migrate this non-Salt screen into Salt without changing the task flow.`
- `Upgrade this feature from older Salt usage and separate required changes from cleanup.`

## What Salt Handles Best

- `review`: existing Salt UI, Salt-specific bugs, or validation of a changed Salt implementation.
- `upgrade`: version moves, deprecations, and Salt-native modernization where the source is already Salt-based.
- `migrate`: non-Salt UI, foreign component libraries, screenshots, or mockups that should become Salt while preserving important user experience anchors.
- `create`: bounded new Salt-native work such as a dashboard page, summary region, form workflow, dialog, navigation shell, or supporting state surface.
- `init`: repo policy bootstrap and managed instruction refresh.

## Project Context First

- Prefer MCP project context when Salt MCP is available.
- If the host already knows the active workspace path, pass it as `root_dir` on `get_salt_project_context` or the repo-aware workflow call instead of relying on MCP server cwd inference.
- Use `salt-ds info --json` as the CLI equivalent when MCP is blocked.
- Treat repo context as the first pass for framework, package, import, runtime-target, and policy detection.
- If MCP project context returns `resolution.status = needs_explicit_root` or `mismatch`, or it resolves a root without `package.json` in a repo that should have one, stop and retry with explicit `root_dir` or reuse a known `context_id`.
- Skip this only for clearly Salt-agnostic exploration where repo shape does not affect the answer.

## Fast Reference Routing

- Load `references/shared/surfaces.md` for common product surfaces such as dashboards, table-and-filters views, form pages, dialog workflows, navigation shells, and supporting states.
- Load `references/shared/design-principles.md` for design-system judgment about hierarchy, density, layout ownership, and bounded customization, then use `references/shared/transport.md` for the shared transport and evidence contract.
- Load workflow-specific references only after the workflow is chosen.

## Trigger Boundary

- Use this skill when the repo already shows Salt signals such as `@salt-ds/*` packages, `.salt/team.json`, `.salt/stack.json`, Salt MCP workflows, or the `salt-ds` CLI.
- Also use this skill when the user explicitly asks to adopt Salt, migrate non-Salt UI into Salt, or bootstrap Salt repo policy.
- Do not use this skill for generic React, CSS, accessibility, or product-design work that does not require Salt-specific guidance.
- Do not use for generic React/CSS advice or non-UI work that does not require Salt.
- If the repo clearly uses Salt and the task touches UI structure, layout, navigation, forms, dialogs, tables, dashboards, or alignment, treat it as a Salt UI task unless the user explicitly asks for Salt-agnostic exploration.

## Workflow Selection

Route by user job, not by IDE presence:

- `review`: review existing Salt UI, diagnose a Salt bug, check Salt alignment, or validate a changed Salt implementation.
- `upgrade`: handle Salt version moves, deprecation cleanup, package/API upgrades, or Salt-native modernization where the UI is already Salt-based.
- `migrate`: replace non-Salt UI, foreign component libraries, or mockup-defined experiences with Salt while preserving task flow and critical states.
- `create`: build new Salt-native components, panels, pages, screens, workspaces, dashboards, or bounded extensions to an existing Salt surface.
- `init`: bootstrap `.salt/team.json`, `.salt/stack.json`, repo instructions, or starter conventions when the immediate job is repo policy setup.
  Ask instead of guess when the task reasonably spans more than one workflow. Split the work into phases only when the user goal actually requires it.

## Shared Workflow Rules

For repo-aware Salt work, obtain canonical Salt guidance before making Salt-specific choices.

- MCP: `create_salt_ui`, `review_salt_ui`, `migrate_to_salt`, `upgrade_salt_ui`; use `get_salt_project_context` only when repo diagnostics or explicit context reuse are needed.
- CLI: `salt-ds init`, `salt-ds create`, `salt-ds review`, `salt-ds migrate`, `salt-ds upgrade`; use `salt-ds info --json` when repo diagnostics or explicit context inspection are needed.
  Do not select Salt components, patterns, props, tokens, plans, or code until the canonical Salt step has completed successfully.
  If the user asks for a dashboard, page, screen, workspace, overview, or another multi-region surface, preserve that page-level intent in the first Salt create call. Do not rewrite the initial create query into a single widget, card, metric, or other sub-pattern before Salt returns the top-level direction.
  When `create` returns `composition_contract.expected_patterns` or `composition_contract.expected_components`, the canonical step is not complete for those named sub-surfaces. Run targeted Salt create follow-up for each unresolved named item before writing that region.
  For targeted create follow-up, preserve the user's concrete noun phrase and append parent-pattern or slot context only as supporting detail. Do not rewrite `chart`, `table`, `filter`, `metric`, or similar concrete asks into abstract taxonomy prompts such as `data visualization component for dashboard analytical body`.
  If a canonical Salt target name is already known from `required_follow_through`, `expected_patterns`, `expected_components`, or an exact MCP result, use that exact name or verified alias in the next create step instead of paraphrasing it.
  If `create` returns `open_questions`, ask those before committing to the unresolved Salt choice.
- If both `.salt/team.json` and `.salt/stack.json` are missing, continue with canonical Salt guidance first.
- keep the result canonical-only and recommend bootstrap only when durable repo policy or managed repo instructions would materially improve future Salt answers
- If the repo already has Salt-managed instruction files and they may be stale, rerun `bootstrap_salt_repo` or `salt-ds init` to refresh the managed Salt blocks instead of hand-rewriting them.
- Treat `.salt/team.json` and `.salt/stack.json` as declared policy, not detected repo context.
- do not select Salt components, patterns, props, tokens, or write Salt-specific code until canonical Salt guidance has been obtained via MCP or CLI
- if `create` returns `composition_contract.expected_patterns` or `composition_contract.expected_components`, treat those named items as required Salt follow-through
- do not invent Salt APIs, props, components, or token names; ground named Salt details against canonical Salt guidance before suggesting them
- Keep source reasoning first and add runtime evidence only when the source pass is still insufficient.
- treat screenshots and mockups as supporting migration evidence only; if they are used, require normalization into structured outline evidence before the canonical Salt step
- do not send raw screenshot or mockup attachments directly to Salt MCP; preprocess them into `source_outline`-style evidence first, or fall back to `--source-outline`
- Read workflow `fixCandidates`, `confidence`, and `raiseConfidence` before editing or escalating.
- When a workflow result includes `result.ide_summary`, present that compact summary first and use the rest of the payload as expandable detail.
- Do not present repo-local wrappers, migration shims, or shared conventions packs as canonical Salt guidance.
- Keep `salt-ds doctor` and `salt-ds runtime inspect` in the support/evidence layer unless the task is explicitly diagnostic.
  When the user is working in an IDE, bias toward the current file, current selection, current feature folder, and nearby imports before broad repo sweeps unless the task clearly needs wider coverage.
  If MCP is unavailable, use the CLI fallback. If both MCP and CLI fail, resolve the blocker or ask the user before proceeding. Do not silently continue with guessed Salt guidance.
- Bootstrap with `bootstrap_salt_repo`, `salt-ds init`, or `salt-ds init --create-stack --conventions-pack [<package[#export]>]` only when a selected repo needs starter layered policy for a shared conventions pack.

## Non-Salt Repo Bootstrap

- no Salt usage yet and the immediate job is to bootstrap repo policy or instructions: use `init`.
- replacing existing non-Salt UI with Salt: use `migrate`.
- adding a new Salt-native screen or feature in a repo that happens to contain non-Salt UI elsewhere: use `create`.
  Do not treat every non-Salt repo as a migration by default. Choose the workflow based on the user job.

## Scope Boundaries

- canonical Salt guidance: what Salt recommends.
- detected repo context: framework, imports, packages, runtime targets, repo instructions.
- repo conventions: `.salt/team.json`, `.salt/stack.json`, shared conventions packs.
- runtime evidence: local confirmation used only after source-grounded workflow reasoning.
- Keep the user-visible story workflow-first: explain what job Salt is handling, name whether the work is `init`, `create`, `review`, `migrate`, or `upgrade`, state what canonical Salt guidance was used, say whether repo conventions changed the outcome, say whether the result stayed canonical-only because no repo policy was declared, say whether runtime evidence was needed, and state the safest next step in the IDE workflow.

## Reference Loading

- Start with the workflow `rules.md`, then load deeper files only when needed.
- Shared contract: `references/shared/transport.md`, `references/shared/theme.md`, `references/shared/surfaces.md`, `references/shared/design-principles.md`.
- Create: start with `references/create/rules.md`; load `references/create/workflow.md`, `references/create/questions.md`, `references/create/gotchas.md`, and `references/create/output.md` only when needed.
- Review: start with `references/review/rules.md`; load `references/review/rubric.md`, `references/review/debug.md`, `references/review/gotchas.md`, and `references/review/output.md` only when needed.
- Migrate and upgrade: use `references/migrate/rules.md`, `references/migrate/workflow.md`, `references/migrate/gotchas.md`, and `references/migrate/output.md`.
- Conventions: load `references/conventions/rules.md`, `references/conventions/contract.md`, `references/conventions/examples.md`, and `references/conventions/review-checklist.md`; use `assets/project-conventions.template.json`, `assets/project-conventions-stack.template.json`, and `assets/repo-instructions.template.md` only when bootstrapping or editing conventions artifacts.

## Ask Instead Of Guess

- the task could reasonably fit more than one workflow
- `create` returns `composition_contract.expected_patterns` or `composition_contract.expected_components` and one of those named sub-surfaces is still unresolved
- `create` returns `open_questions` or a `confirmation_needed` composition choice
- an upgrade needs to separate required changes from optional cleanup
- migration familiarity constraints are unclear
- repo policy conflicts with canonical Salt guidance, or the repo has no declared policy yet and local wrappers/bans would materially change the final answer
- confidence is low and `raiseConfidence` points to missing evidence
- the runtime target itself is unclear and `salt-ds doctor` is the cheaper next step
