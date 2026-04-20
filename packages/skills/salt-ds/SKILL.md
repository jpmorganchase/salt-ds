---
name: salt-ds
description: salt design system workflow for consumer repos. use when chatgpt, codex, or copilot needs salt-specific create, review, migrate, upgrade, init, quick-check, accessibility-audit, or option-exploration guidance for ui work in repos that already use @salt-ds packages, .salt/team.json, .salt/stack.json, salt mcp, or the salt-ds cli, or when the user explicitly asks to adopt salt. use for salt-specific structure, composition, layout, hierarchy, navigation, forms, dialogs, tables, dashboards, migration, version upgrades, and repo conventions in salt consumer repos. accessibility audits normally route through review. bootstrap tasks normally route through init. do not use for generic react/css advice, generic typescript cleanup, build/test/ci/package-management work, generic debugging, or non-ui work unless salt primitives, patterns, policy, migration, upgrade, or repo-specific salt decisions are part of the answer.
---

# Salt DS

Salt's public orchestrator skill for repo-aware design-system work in consumer repos.
Keep one public workflow surface: `init`, `create`, `review`, `migrate`, `upgrade`.
Do not make the user choose between separate builder, reviewer, migration, accessibility, or conventions skills.

## Root Execution Flow

For every Salt task, follow this order:

1. Identify the workflow: `review`, `upgrade`, `migrate`, `create`, or `init`.
2. Choose the lightest safe mode:
   - `quick-check` for narrow, local, low-ambiguity work
   - `deep` when full canonical reasoning is needed
   - `explore-options` only when the user explicitly wants alternatives
   - `clarify-blockers` when one unresolved decision prevents safe progress
3. Establish project context when the task is repo-aware or the answer could change based on repo state.
4. Load only the minimal shared and workflow references needed for the current step.
5. Execute the workflow.
6. Check whether canonical reasoning is complete enough for the current step.
7. If safe progress is blocked, stop or ask one blocker question instead of guessing.
8. Answer in the workflow-appropriate format, leading with the summary and current workflow state.

## Example Triggers

- `Quick-check this Salt form before I commit.`
- `Create a Salt-native dashboard page for this feature.`
- `Show me two Salt-valid directions for this workspace shell.`
- `Review this Salt dialog and tell me the safest next fix.`
- `Audit this screen for Salt-specific accessibility and hierarchy issues.`
- `Migrate this MUI page into Salt without changing the task flow.`
- `Upgrade this older Salt usage and separate required fixes from cleanup.`
- `Bootstrap Salt repo policy for this consumer app.`

## Workflow Selection

Route by user job, not by IDE presence:

- `create`: new Salt-native components, panels, pages, screens, dashboards, shells, or bounded extensions to an existing Salt surface.
- `review`: existing Salt UI, Salt-specific bugs, accessibility audits, alignment/layout issues, or validation of changed Salt code.
- `migrate`: non-Salt UI, foreign component libraries, screenshots, mockups, or rough source experiences that should become Salt while preserving task flow and critical states.
- `upgrade`: Salt version moves, deprecations, package/API upgrades, and Salt-native modernization where the starting point is already Salt-based.
- `init`: repo-policy bootstrap and managed-instruction refresh.

Accessibility audits normally route through `review`.
Bootstrap tasks normally route through `init`.
Ask instead of guessing when the task genuinely spans more than one workflow.
Split into phases only when the user goal requires it.

## Mode Selection

Choose the lightest mode that still preserves Salt correctness.
Load `references/shared/modes.md` before acting when the user intent is not obvious.

- `quick-check`: fast gut-checks, current-file sanity reviews, current-diff feedback, or a short accessibility/composition pass before commit.
- `deep`: the default for implementation, comprehensive review, migration, upgrade, bootstrap, and any task that needs canonical completion.
- `explore-options`: only when the user explicitly asks for alternatives, options, comparisons, or “design it twice”.
- `clarify-blockers`: when canonical progress is blocked by one or two structural decisions; ask focused questions one at a time and provide a recommended default answer.

`quick-check` may start from the current file, selection, or diff when the answer is clearly bounded.
Escalate to `deep` when the issue is structurally ambiguous, a canonical mismatch is likely, repo policy clearly matters, or transport/tooling must be consulted to answer safely.
Do not force `explore-options` or `clarify-blockers` when the user wants straightforward execution.
Do not let `quick-check` quietly turn into a full migration or deep redesign without saying so.

## Root Output Contract

Every Salt answer should make these things clear before any deeper detail:

- what workflow Salt chose
- whether the current step is grounded enough to continue safely
- whether implementation is safe for the exact requested region or entity
- what blockers or follow-through remain
- what the safest next action is

Prefer a compact summary first.
Do not hide unresolved follow-through behind confident implementation.
Do not let structural detail crowd out the workflow state.
When stable top-level workflow fields are available from MCP or CLI, read them first.
Do not assume that transport-specific field names are the only way to satisfy this contract.

## Project Context First

For deep or repo-spanning Salt work, start from project context before choosing Salt-specific structure.
In `quick-check`, you may start from the current file, selection, or diff when the answer is clearly bounded, then add project context when feasibility or safety requires it.

When repo-aware guidance needs project context:

- prefer Salt MCP project context when available
- if the host already knows the active workspace path, pass it as `root_dir` on `get_salt_project_context` or the repo-aware workflow call instead of relying on cwd inference
- use `salt-ds info --json` as the CLI equivalent when MCP is blocked or unavailable
- treat repo context as the first pass for framework, package, import, runtime-target, and policy detection
- if project-context resolution returns `needs_explicit_root`, `mismatch`, or resolves a root without the expected manifest, stop and retry with explicit `root_dir` or a known `context_id`
- skip project context only for clearly Salt-agnostic exploration where repo shape does not affect the answer

## Project Memory

Load `references/shared/project-memory.md` when the repo already has local Salt policy, accepted deviations, or recurring host/tool constraints.
Prefer existing durable sources first:

- `.salt/team.json`
- `.salt/stack.json`
- repo instruction files such as `AGENTS.md`
- ADRs, architecture notes, or repo docs that capture repeated Salt decisions
- an optional repo-local working agreement created from `assets/salt-working-agreement.template.md`

Treat project memory as downstream context that reduces repeat friction.
Do not present it as canonical Salt guidance.

## Reference Routing

Load only the minimum shared and workflow references needed for the chosen mode and current step.
Do not treat `quick-check` as a deep workflow unless ambiguity, policy, or evidence requirements clearly force escalation.

- `quick-check`: start with `references/shared/modes.md`; add `references/shared/transport.md` when canonical validation or transport handling is needed; add other shared references only when the bounded check depends on them.
- `deep`, `explore-options`, and `clarify-blockers`: load the shared references that match the task before acting.

Shared references:

- `references/shared/transport.md` for the workflow and transport contract.
- `references/shared/degraded-tooling.md` when MCP or CLI output is noisy, partial, truncated, misrouted, or unavailable.
- `references/shared/modes.md` for quick-vs-deep behavior, option exploration, and blocker questions.
- `references/shared/project-memory.md` when repo-local decisions or accepted deviations may change the final answer.
- `references/shared/surfaces.md` for dashboards, table-and-filters views, forms, dialogs, navigation shells, and supporting states.
- `references/shared/surface-resolution.md` for preserving page-, region-, and concrete-surface nouns without over-collapsing the task.
- `references/shared/design-principles.md` for hierarchy, layout ownership, density, stable-first choices, and bounded customization.
- `references/shared/theme.md` when create or migrate work touches provider/theme bootstrap.
- `references/shared/copilot-hosts.md` for VS Code / IntelliJ Copilot host behavior and repo-scoping rules.
- `references/shared/anti-patterns.md` for behaviors that commonly derail otherwise-correct Salt answers.

Then load workflow-specific references:

- `create`: `references/create/rules.md`, `references/create/workflow.md`, `references/create/gotchas.md`, `references/create/output.md`, `references/create/questions.md`
- `create` + `explore-options`: also load `references/create/explore-options.md`
- `review`: `references/review/rules.md`, `references/review/rubric.md`, `references/review/debug.md`, `references/review/gotchas.md`, `references/review/output.md`
- `migrate`: `references/migrate/rules.md`, `references/migrate/workflow.md`, `references/migrate/gotchas.md`, `references/migrate/output.md`
- `upgrade`: `references/upgrade/rules.md`, `references/upgrade/workflow.md`, `references/upgrade/gotchas.md`, `references/upgrade/output.md`
- `init` / conventions-sensitive work: `references/conventions/rules.md`, `references/conventions/contract.md`, `references/conventions/examples.md`, `references/conventions/review-checklist.md`

## Trigger Boundary

Use this skill when:

- the repo already shows Salt signals such as `@salt-ds/*` packages, `.salt/team.json`, `.salt/stack.json`, Salt MCP workflows, or the `salt-ds` CLI
- the user explicitly asks to adopt Salt, migrate non-Salt UI into Salt, or bootstrap Salt repo policy
- the task touches Salt-specific UI structure, layout, hierarchy, navigation, forms, dialogs, tables, dashboards, accessibility, migration, or upgrades in a Salt consumer repo

Do not use this skill for generic React, CSS, accessibility, or product-design work that does not require Salt-specific guidance.
Do not use this skill for generic repo work that merely happens in a Salt repo, including generic refactors, TypeScript cleanup, CSS-only fixes, build/test/CI/package-management work, or generic debugging where Salt primitives, patterns, policy, migration, or upgrade logic are not part of the answer.

## Root Behavior Examples

### Grounded execution

User: `Use salt-ds to review this file.`

Good behavior:

- choose `review`
- use `quick-check` if the issue is local and low-ambiguity
- return the main finding, safest next fix, and any important confidence gap

### Partial execution

User: `Use salt-ds to add a dashboard summary area above this table.`

Good behavior:

- choose `create`
- keep the request page-level first
- if follow-through is still required, say so clearly and do not code unresolved regions as if they were grounded

### Blocked execution

User: `Use salt-ds to migrate this screen into Salt.`

Good behavior:

- choose `migrate`
- keep the preserved interaction anchors explicit
- if one unresolved decision blocks safe progress, ask one blocker question or return a bounded provisional direction instead of guessing

## Shared Workflow Contract

Follow these rules for every Salt workflow:

1. Obtain canonical Salt guidance through MCP or CLI before making Salt-specific choices.
2. Keep the user task and page-level framing intact in the first canonical step.
3. Treat repo conventions and project memory as later refinements, not as canonical Salt guidance.
4. Validate the source result before treating the work as done.
5. Add runtime evidence only when the source pass still leaves an important gap.

### Canonical Completion Rules

Do not treat the canonical step as complete until all of the following are true:

- the compact workflow result clearly indicates that the current step is safe to continue, or you have explicitly requested expanded output because the compact contract pointed to deeper artifacts
- the top-level surface is grounded
- any named `expected_patterns`, `expected_components`, `required_follow_through`, `implementation_gate`, or equivalent follow-through items are resolved for the regions you plan to implement or finalize
- unresolved `open_questions`, `confirmation_needed`, or compatibility questions that would change the structure have been answered or explicitly left pending
- named Salt tokens, props, APIs, and theme bootstrap choices you plan to mention have been verified against canonical Salt guidance

For multi-region asks such as dashboards, pages, workspaces, overviews, shells, and complex forms, do not silently continue from only a partial subset of named sub-patterns.
If an essential region is unresolved, stop or return only a clearly-labeled partial scaffold with the unresolved region marked as pending.

### Degraded Tooling Rules

Use `references/shared/degraded-tooling.md` whenever tooling is noisy.
The critical rules are:

- if MCP is unavailable, explicitly switch to CLI fallback instead of acting as though canonical guidance succeeded
- if CLI or MCP returns useful output with a non-success status, treat it as **partial**, not as approval to implement
- if output is truncated, malformed, semantically off-target, or repeatedly misroutes to unrelated patterns, fail closed
- the hard stop budget is **2 attempts** per required sub-surface or entity — after 2 noisy, conflicting, or off-target follow-up attempts, stop immediately and report the blocker instead of continuing with guessed Salt structure
- do not hide transport ambiguity behind a confident implementation
- in `quick-check` mode, you may still return bounded provisional observations, but label them as provisional and do not overstate canonical completion

### Compact Contract First

Read compact workflow output from stable top-level workflow signals first, such as:

- workflow status
- exact-request safety
- blocking reasons
- next-step guidance
- summary

If compact `create` output is `blocked`, `partial`, or not yet safe for the exact request, follow the returned next step before implementing the blocked region.
Request expanded workflow output only when the compact contract points to deeper artifacts such as `composition_contract`, starter snippets, or expanded validation detail.

### Concrete-Noun Follow-Through

When a workflow returns named sub-surfaces, preserve concrete user nouns such as `chart`, `table`, `filter`, `metric`, `header`, or `navigation` in follow-up create calls.
Add slot or page context only as supporting detail.
Do not paraphrase concrete follow-up asks into abstract taxonomy prompts.
If an exact Salt target name is already known from canonical output, use that exact name or verified alias in the next call.
When using CLI fallback for follow-through, use `salt-ds create "<entity>" --json --include-starter-code --starter-only` to get a minimal response — see `references/shared/transport.md` §"CLI Follow-Through for Entity Grounding". Do not force `--type component` unless you are certain the entity is a component, not a pattern.

For broad prompts that mention multiple UI elements (e.g., "a form with inputs, a sidebar navigation, and toggle switches"), the tooling's `required_follow_through` list covers entities the resolved pattern knows about, but **may not cover every entity the user mentioned**.
After processing the tooling's follow-through list, scan the original user prompt for concrete UI nouns that were not covered and issue follow-through calls for those too.
Do not wait for the tooling to enumerate every entity — the agent is responsible for bridging the gap between the user's intent and the pattern's built-in anatomy.

### Stable-First Rule

Prefer stable production-ready Salt directions first.
Do not reach for custom UI, lab/experimental usage, or decorative styling until the nearest canonical Salt pattern, primitive, composition, and foundation have been ruled out.
If the transport or validation warns that a recommendation is unstable, noisy, or needs attention, do not finalize it as the main answer without saying so.

## Copilot Host Behavior

Consumers usually use this skill in VS Code or IntelliJ Copilot.
In those environments:

- bias toward the current file, current selection, active feature folder, and nearby imports before broad repo sweeps
- confirm tool availability before promising a workflow step
- if the host lacks MCP, say so and switch to CLI
- if CLI output is machine-noisy, keep parsing/inspection separate from implementation and use the degraded-tooling rules
- do not claim a Salt workflow completed merely because the host emitted a large payload

## Output Posture

Keep results decision-first.
When blocked, say exactly what is blocked, what succeeded, and what remains unresolved.
In `quick-check` mode, keep the answer short and action-oriented: top issues, safest next fix, and any confidence gap.
In `deep` mode, explain the chosen Salt direction, the validation completed, and any remaining evidence gaps.
In `explore-options` mode, compare two Salt-valid directions by default, describe the trade-offs in prose, and recommend one default continuation path.
Only exceed two directions when the user explicitly asks for more.
When a task includes code generation, prefer the shortest valid Salt-native scaffold that preserves the grounded structure.
