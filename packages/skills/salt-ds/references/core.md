# Salt DS — Always-Loaded Core

Load this file once at the start of any Salt workflow turn, before workflow-specific references. It carries the always-on behavior bullets every Salt workflow shares: no-invention, hard gate, action loop, project context, output posture, stable-first. SKILL.md is a thin router; the binding behavior contract lives here.

## No Salt Invention Rule

Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links.
Before naming or implementing Salt-specific structure, fetch canonical Salt evidence through MCP or CLI.
If evidence is missing, follow `next_required_action`, retrieve the required entity or examples, ask the user, or stop with the blocker.
Do not fill gaps from generic React, CSS, HTML, copied repo code, or model memory.

## Theme Evidence Rule

Do not name Salt provider or theme imports, provider props, fonts, accent/corner values, package paths, or compatibility paths from this skill.
When provider or theme bootstrap matters, obtain those facts from workflow output, registry-backed generated context with evidence refs, `.salt` project policy, or explicit user input.
If that evidence is missing, report theme bootstrap as pending or unsupported and continue only with workflow steps that do not require the missing theme facts.

## Hard Gate

Do not edit Salt UI for `create`, `migrate`, or `upgrade` implementation work unless the current workflow contract has all of these fields:

- `status: success`
- `action.kind: implement`
- `safety.exact_request_safe: true`
- `evidence.status: complete`

After editing, run the returned review or post action before calling the work complete.
Treat quick-check observations, starter snippets, package installs, retrieval results, successful builds, and partial scaffolds as non-implementation approval.

## Action Loop

For implementation-capable Salt workflows:

1. For repo-aware work, establish trusted project context first, or pass a known `root_dir` or `context_id` to the workflow.
2. Call the workflow.
3. Read `status`, `action.kind`, `next_required_action`, `safety`, `questions`, and `evidence`.
4. Perform exactly the returned action.
5. If `action.kind` is `ask_user`, stop and wait for the user answer; treat the answer as a new or updated workflow input, not as an evidence bridge.
6. After `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, or `bootstrap_repo`, rerun the originating workflow with the returned evidence bridge. For create entity follow-through, pass MCP `resolved_entities: ["Name"]` or CLI `--resolved-entity Name`.
7. Edit only when the rerun satisfies the Hard Gate.
8. Run review after edits.

Installing Salt packages is not implementation permission. After installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`.

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

## Shared Workflow Contract

For every Salt workflow:

1. Obtain canonical Salt guidance through MCP or CLI before making Salt-specific choices.
2. Keep the user task and page-level framing intact in the first canonical step.
3. Treat repo conventions and project memory as downstream context, not canonical Salt guidance.
4. Read compact workflow output from stable top-level workflow signals first: `status`, `safety`, `action`, `next_required_action`, `allowed_next_actions`, `recipe`, `questions`, `evidence`, and `summary`.
5. Treat `salt_workflow_v1.action.kind` as binding: perform exactly the returned action, and only edit when the Hard Gate is satisfied.
6. Validate with the returned review or post action before treating implementation work as done.

Preserve explicit user nouns that are not yet covered as unresolved requirements.
Retrieve canonical evidence for those nouns, but do not implement those regions until the workflow contract or support evidence covers them.
Use `recipe.steps`, `questions`, and `evidence.missing` to explain what remains unresolved instead of filling gaps with guessed Salt structure.

### Stable-First Rule

Prefer stable production-ready Salt directions first.
Do not reach for custom UI, lab/experimental usage, or decorative styling until the nearest canonical Salt pattern, primitive, composition, and foundation have been ruled out.
If the transport or validation warns that a recommendation is unstable, noisy, or needs attention, do not finalize it as the main answer without saying so.

## Output Posture

Keep results decision-first.
When blocked, say exactly what is blocked, what succeeded, and what remains unresolved.
Summarize blocked, partial, `ask_user`, retrieve, or missing-evidence states from existing fields only; do not invent a new compact field.
Treat `status: "partial"` as **user-facing remaining work** only — unresolved regions, follow-through entities, composite plans that still need grounding. It does not mean the workflow's own validator coverage is incomplete.
Read the top-level `internal_limitations` block (`unsupported_claim_count`, `unsupported_rule_kinds`) as a separate signal: registry/validator coverage gaps that the workflow itself could not confirm. A clean run with `internal_limitations.unsupported_claim_count > 0` is still `status: "success"` and still implementation-safe — surface the limitation transparently in your reply, but do not block, retry, or escalate on it.
When you cite a file Salt told you about (a config that was created, a hook manifest path, a report output), emit the **plain-text path** in your reply — write `.salt/team.json`, not `[team.json](.salt/team.json)`. Many chat UIs strip inline file widgets and render the bare markdown as `-  — team.json`, dropping the path the user needs to find the file. The Salt MCP and CLI always return paths as plain strings; preserve that in your reply.
Coding is allowed only when the Hard Gate is satisfied. Otherwise, say "coding is allowed: no" and do not edit the blocked region.
Do not claim a Salt workflow completed merely because the host emitted a large payload.

---

## Anti-Patterns

Avoid these behaviors across all Salt workflows.

- do not invent Salt APIs, props, token names, or component capabilities
- do not treat large or detailed transport output as completed guidance if the status is partial, noisy, truncated, or misrouted
- do not skip named follow-through such as `expected_patterns`, `expected_components`, `required_follow_through`, `implementation_gate`, or `open_questions`
- do not turn concrete user asks into abstract taxonomy prose when a concrete follow-up noun is already known
- do not present repo-local wrappers, shims, or conventions as canonical Salt guidance
- do not let generic React/CSS code generation substitute for an incomplete Salt workflow
- do not silently impose theme, font, accent, or corner choices when repo policy or asset availability is unknown
- do not treat one grounded region as permission to improvise unresolved peer regions on a page-level surface
- do not keep retrying the same noisy follow-up while coding around the gap; stop and report the blocker instead

- do not default to multiple designs when the user asked for execution rather than comparison
- do not ask a long chain of design questions when one blocker question or a default assumption would unblock the next safe step
- do not treat project memory or working-agreement notes as a replacement for canonical Salt guidance

---

## Copilot Host Guidance

Use this file when the consumer is working in VS Code Copilot or IntelliJ Copilot.

## Host Reality

The host may have uneven tool availability, noisy terminal output, partial chat-session resources, and a strong bias toward momentum.
Counter that by making workflow completion explicit.

## Scope Rules

- Bias toward the current file, current selection, active feature folder, and nearby imports before broad repo sweeps.
- Read only enough surrounding files to ground the Salt decision.
- Do not convert a narrow bug-fix into a repo-wide architecture sweep unless the root cause demands it.

## Tool Availability Rules

- Confirm whether MCP tools are actually available before planning around them.
- If the host lacks MCP, say so and switch to the CLI.
- If shell tools such as `rg` are missing, switch to host-native alternatives without changing the Salt workflow story.
- Do not confuse host limitations with Salt guidance.

## Completion Rules

- Large output is not the same as successful output.
- A generated patch is not proof that canonical Salt discovery completed.
- A successful build is not proof that the Salt workflow contract completed.
- Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links.
- Hard Gate: do not edit Salt UI for `create`, `migrate`, or `upgrade` implementation work unless the current workflow contract has `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`.
- Branch on compact `salt_workflow_v1.action.kind` before editing: `ask_user` asks and stops until the user provides updated input, `retrieve_entity`/`retrieve_examples` gathers evidence and reruns with the returned evidence bridge, `install_dependencies` installs packages and then reruns the workflow, and only `implement` permits Salt UI edits.
- Installing Salt packages is not implementation permission; after installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`. Do not insert a manual `get_salt_project_context` call between the install and the rerun — Salt MCP marks the cached project context for the affected `root_dir` stale as soon as the workflow emits `install_dependencies`, so the next rerun transparently refetches new package state.
- After `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, or `bootstrap_repo`, rerun the originating workflow with the returned evidence bridge before editing. If the returned action is `ask_user`, do not rerun unchanged; wait for the user's answer and treat it as updated workflow input.
- Do not treat `status: partial` or `status: blocked` as completion; use `recipe.steps`, `questions`, and `evidence.missing` to report what remains.
- For create, migrate, and upgrade work, run source-level Salt validation after the first scaffold pass when code is available.
- After editing, run the returned review or post action before calling the work complete.
- For create work, prefer `compact -> retrieval support -> exact follow-through -> full only when needed`.
- If compact create is still `partial` or `blocked`, inspect the catalog support surface before escalating:
  - MCP: `salt://catalog/candidates/{query}` and `salt://catalog/entity/{name}`
  - CLI fallback: `salt-ds info --json --catalog-query "<prompt>"` and `salt-ds info --json --entity "<name>"`
- Do not let the host paraphrase a grounded exact entity back into a broader prompt on the next call.

## Communication Rules

- Keep user-visible progress updates honest: say when you are switching transport, when a result is partial, and when a region is still unresolved.
- If the host made a best-effort fallback, name that fallback.
- If a required follow-through item is still open, say so before showing implementation.

---

## Degraded Tooling

Use this file whenever Salt MCP or the Salt CLI is missing, noisy, partial, truncated, semantically off-target, or otherwise unreliable.

## Fail-Closed Rule

Do not treat ambiguous transport output as completed canonical Salt guidance.
When the transport is ambiguous, preserve the useful signal, state the blocker, and stop before guessed implementation.

## Hard Stop Budget

After **2** noisy, conflicting, or off-target follow-up attempts for the **same** required sub-surface or entity, stop immediately and report the blocker. Do not attempt a third call.

Count any of the following as one attempt against this budget:

- a call that returns a non-matching `decision.name` or a misrouted pattern
- a call that returns truncated output missing the required contract fields
- a call that produces a parse failure or malformed payload
- a call that returns `status != "success"` without actionable partial guidance

When the budget is exhausted:

- report exactly which entity or sub-surface was blocked
- state what was attempted and what the transport returned
- keep any grounded regions from earlier steps intact
- mark the blocked region as pending instead of guessing its structure
- suggest the next unblocking step (e.g., try MCP, check Salt docs, or ask the user)

## Common Cases

### MCP unavailable

- Say MCP is unavailable.
- Switch to the CLI equivalent for the same workflow.
- Do not act as if the canonical step already succeeded.

### Non-zero exit with useful output

- Treat the result as **partial**.
- Summarize what was learned.
- List the unresolved blockers or missing follow-through items.
- Continue only with inspection or clarification.
- Do not move into final implementation yet, and do not treat starter-code creation as completion while status remains partial or blocked.

### Misrouted or semantically off-target results

- A result that resolves to the wrong pattern, wrong surface, or wrong scope does not complete the canonical step.
- Re-query the exact required noun or exact returned Salt target name.
- If the same required item misroutes twice, the hard stop budget is exhausted — stop and report transport ambiguity. Do not attempt a third call.

### Truncated or malformed payloads

- If required follow-through may be hidden in the missing portion, stop.
- Do not guess the missing contract.
- Do not summarize a partial payload as complete.
- Each truncated or malformed result counts as one attempt against the hard stop budget.

## Multi-Region Safety Rule

For dashboards, pages, overviews, navigation shells, large forms, and other multi-region work:

- one valid anchor does not resolve the whole surface
- do not implement unresolved essential regions from generic React/CSS knowledge alone
- if some regions are grounded and one essential region is not, either stop or return a clearly-labeled partial scaffold with the unresolved region marked pending

## Bounded Partial Scaffold Rule

If the user explicitly wants a starting point despite unresolved Salt guidance, you may return a bounded partial scaffold only when:

- the grounded regions are clearly separated from the unresolved ones
- unresolved regions are marked pending instead of improvised
- the explanation states exactly what canonical Salt follow-through is still missing
- the result is framed as provisional, not as completed Salt guidance

## Reporting Pattern

When blocked, say:

- what transport was attempted
- what succeeded
- what remained unresolved
- what exact next step would unblock the work

Good phrasing:

- `Salt MCP was unavailable, so I switched to the CLI fallback.`
- `The CLI returned useful guidance but exited non-zero, so I treated it as partial and did not implement yet.`
- `The create follow-up for Header block misrouted twice, so I stopped instead of guessing that region.`
- `The payload was truncated before the completion contract, so I could not safely treat the canonical step as complete.`
- `I can return a bounded partial scaffold for the grounded regions, but the chart region is still pending canonical Salt follow-through.`

## Quick-Check Under Degraded Tooling

If the user asked for a quick-check and the transport is degraded:

- you may return bounded provisional observations
- keep them narrow and action-oriented
- separate grounded findings from likely-but-unverified concerns
- say explicitly when a deep review is the safer next step

---

## Design Principles

Use this file when the task needs design-system judgment instead of only API lookup.

These principles should guide both `create` and `review`.

## Task-First Composition

- make the main user job obvious before secondary information
- choose the structure that best supports the task, not the most decorative composition
- if two valid directions exist, prefer the one that makes the primary action easier to find and understand

## Quiet Hierarchy

- use emphasis sparingly
- let one region own the page or panel purpose
- do not make metrics, actions, alerts, and supporting copy all compete at the same visual weight

## Shallow Structure

- keep hierarchy shallow and responsibilities obvious
- add a wrapper only when it owns semantics, state, layout, or reuse that is real in the repo
- treat extra wrappers as suspicious until they improve clarity or behavior

## Layout Ownership

- identify which region owns the shell, which region owns the main task, and which regions are supporting
- avoid splitting layout responsibility across multiple adjacent helpers without a clear boundary
- prefer the most constrained Salt layout or pattern that can carry the interaction

## Appropriate Density

- match density to the amount of information and frequency of interaction
- dense surfaces should stay structured and scannable, not compressed into noise
- sparse surfaces should not be padded into emptiness just to fill space

## Foundation Discipline

- prefer Salt patterns, primitives, foundations, and tokens before raw values
- verify named tokens, props, and APIs against canonical Salt guidance before using them
- treat direct raw styling as an exception, not the default path

## Bounded Customization

- customize only after ruling out a canonical Salt direction
- keep custom composition narrow and easy to explain
- if customization is necessary, make clear why standard Salt options were not sufficient

## Pattern Before Local Cleverness

- do not preserve foreign component-library structure when the Salt pattern should replace it
- do not confuse repo-local wrappers with canonical Salt guidance
- preserve user-task familiarity during migration, not the exact foreign visual system

## Ask Instead Of Guess

- ask when the choice changes workflow structure, major layout ownership, or migration familiarity
- do not invent a Salt answer just because the host expects momentum
- use runtime evidence only when the source pass still leaves an important gap

## Stable Before Experimental

- prefer stable core Salt directions before lab, rc, or custom composition
- if a recommendation is noisy, provisional, or transport-dependent, say so instead of presenting it as settled guidance
- do not reach for decorative novelty or custom art direction when a quieter stable Salt solution already fits

---

## Modes

Use this file when the job could be handled either lightly or deeply.

## Default Rule

Choose the lightest mode that still preserves Salt correctness.
Do not force every task into a comprehensive multi-step workflow when the user only wants a quick signal.
Do not let a quick pass quietly become a full redesign.

## Quick-Check

Use for:

- gut-checks
- sanity checks before commit
- current-file or current-selection feedback
- narrow accessibility or hierarchy checks
- `what is the safest next fix?`

Behavior:

- stay close to the current file, selection, diff, or smallest relevant region
- a clearly bounded answer may start before full project context when the issue is confined to the current file, selection, or diff
- prefer source reading and canonical validation over broad repo exploration
- return the top 1-3 issues, the safest next fix, and any confidence gap
- quick-check is not permission to implement create, migrate, or upgrade work
- do not state Salt-specific props, tokens, imports, package names, or composition rules as canonical unless they were verified through MCP or CLI evidence
- if canonical transport is degraded, you may still return provisional observations, but label them as provisional and avoid claiming completion
- escalate to `deep` when the issue is structurally ambiguous, a canonical mismatch is likely, repo policy clearly matters, or transport/tooling must be consulted to answer safely
- if the user clearly wants implementation or a comprehensive answer, escalate to `deep`

## Deep

Use for:

- implementation
- full create workflows
- comprehensive review or accessibility audit
- migration
- upgrade
- repo bootstrap
- any task where the answer should be treated as completion guidance rather than a quick signal

Behavior:

- complete canonical follow-through before finalizing
- use runtime evidence only when the source pass still leaves an important gap
- keep blocked states explicit instead of coding through ambiguity

## Explore-Options

Use only when the user explicitly asks for alternatives, options, comparisons, or `design it twice`.
Load `references/create/explore-options.md` for create work.

Behavior:

- ground the top-level Salt surface first
- default to two Salt-valid directions and exceed two only when the user explicitly asks for more
- make the directions meaningfully different in composition or emphasis, not randomly decorative
- keep shared invariants visible
- recommend a default continuation path after comparison

Do not use explore-options by default for routine implementation.

## Clarify-Blockers

Use when the work is blocked by one or two structural decisions.

Behavior:

- ask one focused question at a time
- explain why the answer changes the Salt direction
- provide a recommended default answer when possible
- stop asking once the blocked decision is resolved
- if the repo or codebase can answer the question, explore it instead of asking the user

Do not turn this into an interview unless the user explicitly wants a deeper design review.

---

## Project Memory

Use this file when repeated repo-local decisions, accepted deviations, or host/tool constraints would otherwise create repeated friction.

## What Counts As Project Memory

Prefer existing durable sources first:

- `.salt/team.json`
- `.salt/stack.json`
- repo instruction files such as `AGENTS.md`
- ADRs, architecture notes, or repo docs
- an optional working agreement created from `assets/salt-working-agreement.template.md`

Project memory is downstream context.
It helps the agent avoid re-arguing settled repo decisions.
It is not canonical Salt guidance.

## Good Uses

Capture durable decisions such as:

- approved wrappers and when to use them
- accepted deviations from canonical Salt guidance and why they are intentional
- host/tool constraints such as `MCP unavailable in IntelliJ`, `CLI output noisy on Windows`, or `runtime URL unavailable in CI`
- preferred validation habits such as `always run review after create` or `doctor only when source validation stays ambiguous`
- known migration debt or temporary shims that the team already understands
- explicit non-goals such as `mobile not in scope yet` or `legacy provider retained until platform migration completes`

## Bad Uses

Do not use project memory for:

- temporary session chatter
- generic TODO lists
- guesses about canonical Salt behavior
- one-off implementation details that do not change future agent choices
- broad style opinions that conflict with repo policy or canonical Salt guidance

## Reading Rule

When project memory exists:

- respect acknowledged exceptions instead of nagging repeatedly
- say briefly when a finding is already known or intentionally accepted
- keep the canonical Salt answer visible when project memory changes the final recommendation

When project memory is missing:

- do not block work
- continue with canonical Salt guidance and declared repo policy
- suggest creating a small working agreement only if the same decisions keep recurring

## Writing Rule

If the user wants recurring decisions documented, keep the file short.
Prefer a small working agreement over a large narrative.
Store only decisions that materially change future Salt guidance.

---

## Surface Resolution

Use this file when the main risk is collapsing the user's ask too early.

Preserve the owning surface before choosing local implementation details.

## Resolution Order

1. user task
2. owning surface
3. required regions or sub-surfaces
4. nearest Salt pattern or composition
5. local primitives and visual treatment

## Rules

- preserve page-level asks such as `dashboard`, `page`, `screen`, `workspace`, `overview`, `dialog flow`, or `navigation shell` in the first canonical step
- preserve concrete region nouns such as `table`, `chart`, `filter`, `metric`, `header`, `tabs`, or `sidebar` in follow-up create calls
- do not collapse a page ask into a smaller component decision before the owning surface is grounded
- do not infer unresolved peer regions from one valid anchor; one grounded region does not complete the whole surface
- if a region remains unresolved after the canonical step, either keep it pending or ask instead of inventing a bespoke structure
- keep mock data and starter scaffolds subordinate to the workflow contract; they do not replace canonical completion

## When To Stop

Stop or return a clearly-labeled partial scaffold when:

- an essential region is still unresolved
- repeated follow-up for the same region keeps misrouting
- the transport output is partial or truncated in a way that could hide completion gates
- the visual treatment depends on unresolved Salt guidance rather than on already-grounded structure

## Common Mistakes

- turning a page-level ask into disconnected local widgets too early
- paraphrasing concrete nouns into abstract taxonomy prompts
- assuming a table, chart, or metric region is interchangeable with the owning workflow
- using bespoke wrappers or styling to hide an unresolved composition decision

---

## Common Product Surfaces

Use this file when the task is not only "which component" but "what kind of Salt surface is this?"

Keep the user task visible first.
These surface classes matter for create, review, migrate, and upgrade work.

Do not reduce a page-level ask into a smaller local component before the top-level direction is grounded.

## Contents

- [Dashboard Or Overview Page](#dashboard-or-overview-page)
- [Table Plus Filters](#table-plus-filters)
- [Form Page](#form-page)
- [Dialog Workflow](#dialog-workflow)
- [Navigation Shell](#navigation-shell)
- [Loading, Empty, Error, And Success States](#loading-empty-error-and-success-states)

## Dashboard Or Overview Page

Use when the screen must summarize a workflow before the user drills into detail.

- main task:
  - orient the user, surface the most important signals, and lead into deeper detail
- primary interaction should feel like:
  - scan first, act second, drill into the main body without losing context
- usual Salt direction:
  - retrieve source-backed page-level pattern context before naming the Salt target
  - keep summary signals grounded in the returned workflow output
  - keep shell and main analytical body decisions pending until the workflow evidence names them
- common mistakes:
  - turning the page into disconnected cards
  - treating every metric as equally loud
  - collapsing the page into one widget before the top-level structure is chosen

## Table Plus Filters

Use when data review, filtering, selection, and follow-up actions are the main job.

- main task:
  - narrow the dataset, inspect the right rows, then act
- primary interaction should feel like:
  - filter and orient quickly without losing the main table as the detail owner
- usual Salt direction:
  - keep filters subordinate to the source-backed data region
  - group actions by row, selection, or page ownership only when workflow evidence supports that ownership
- common mistakes:
  - oversized summary regions that demote the table
  - filters and actions competing for the same emphasis
  - ad hoc spacing wrappers instead of clear layout ownership

## Form Page

Use when data entry, editing, validation, and status feedback are the core workflow.

- main task:
  - move the user through input, validation, and completion with low ambiguity
- primary interaction should feel like:
  - predictable, calm, and structured around the next decision
- usual Salt direction:
  - retrieve source-backed form workflow context before naming the Salt target
  - keep supporting text and status close to the fields only when the workflow evidence supports that structure
  - align actions with completion and recovery paths from registry-backed or project-policy evidence
- common mistakes:
  - treating the form as a loose stack of controls
  - burying validation or status feedback away from the fields
  - introducing custom wrappers before the canonical form structure is clear

## Dialog Workflow

Use when the task is confirmation, announcement, preferences, or a bounded decision.

- main task:
  - focus the user on one decision or one short configuration step
- primary interaction should feel like:
  - constrained, obvious, and hard to misread
- usual Salt direction:
  - retrieve source-backed bounded-workflow context before naming the Salt target
  - use action ordering only when it is backed by workflow output, registry context, or project policy
  - keep supporting structure minimal unless source evidence requires more context
- common mistakes:
  - overloading the dialog with page-level content
  - making secondary actions visually equal to the main decision
  - carrying page-shell layout rules into a bounded overlay

## Navigation Shell

Use when the user needs stable landmarks, orientation, and movement between major tasks.

- main task:
  - preserve orientation while the user switches between features or views
- primary interaction should feel like:
  - navigable, legible, and stable under frequent reuse
- usual Salt direction:
  - retrieve source-backed shell and navigation context before naming Salt targets
  - separate shell regions from content regions only when workflow evidence supports the boundary
  - match navigation structure to task grouping from source evidence or project policy
- common mistakes:
  - mixing shell actions with content actions
  - recreating a custom rail before checking canonical navigation patterns
  - treating wrappers as canonical when they are only repo-local conventions

## Loading, Empty, Error, And Success States

Use when the supporting states materially affect trust and usability.

- main task:
  - keep the workflow understandable when primary data or actions are not yet available
- primary interaction should feel like:
  - clear about status, clear about next step, and still recognisably the same workflow
- usual Salt direction:
  - keep state content subordinate to the owning workflow surface named by evidence
  - tie actions to recovery, retry, or onward progression only when the source evidence supports that flow
- common mistakes:
  - replacing workflow structure with generic placeholder blocks
  - using decorative messaging without a clear action path
  - making transient states louder than the normal working state

---

## Theme Bootstrap

## Evidence Required

Provider and theme bootstrap guidance is unsupported in this static skill reference until the specific names, imports, props, fonts, package paths, and compatibility paths are backed by workflow evidence, registry-backed generated context with evidence refs, `.salt` project policy, or explicit user input.

Do not fill this gap from skill prose, generated prompt text, generic React guidance, copied repo code, or model memory.

If provider or theme bootstrap matters and no evidence source supplies it, mark the theme decision as pending or unsupported and continue only with workflow steps that do not require those facts.

## Accepted Evidence Sources

- workflow output with complete evidence
- registry-backed generated context with evidence refs
- `.salt` project policy
- explicit user input captured as workflow input

---

## Canonical Salt Workflow Contract

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
Do not guess or hallucinate Salt APIs, props, imports, package names, tokens, component capabilities, composition rules, examples, or documentation links; fetch canonical Salt evidence through MCP or CLI before naming or implementing Salt-specific structure.
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
- `ask_user`: stop and ask the returned question before writing code; when the user answers, treat it as a new or updated workflow input, not as an evidence bridge
- `retrieve_entity` or `retrieve_examples`: gather the requested Salt evidence before implementing that region; for create entity follow-through, rerun with MCP `resolved_entities` or CLI `--resolved-entity`
- `install_dependencies`: install the listed Salt packages, then rerun the originating workflow; installing packages is not implementation permission
- `fix_context` or `bootstrap_repo`: resolve setup or repo context before repo-specific edits

Hard Gate: do not edit Salt UI for `create`, `migrate`, or `upgrade` implementation work unless the current workflow contract has `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, and `evidence.status: complete`.
Use `recipe.steps`, `questions`, and `evidence.missing` to explain remaining work instead of guessing past a partial result.
After `retrieve_entity`, `retrieve_examples`, `install_dependencies`, `fix_context`, or `bootstrap_repo`, rerun the originating workflow with the returned evidence bridge and wait for `status: success` with `action.kind: implement` before editing.
If `action.kind` is `ask_user`, stop and wait for the user answer; do not rerun the original workflow unchanged.
Installing Salt packages is not implementation permission. After installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`.
For create entity follow-through, the evidence bridge is MCP `resolved_entities: ["Name"]` or CLI `--resolved-entity Name`.
Action Loop: establish trusted project context for repo-aware work, call the workflow, read `status` and `action.kind`, perform exactly the returned action, stop when `ask_user` asks for updated input, then after non-user follow-up rerun the originating workflow with the evidence bridge, edit only on `implement`, and run review after edits.

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
When compact output indicates a component is compound, use `sub_component_names` and `composition` from that output as evidence for child exports and slot structure. When MCP support tools are available in the session, request `include: ["props"]` on `get_salt_entity` to get full props for both the root component and its sub-components. When they are not available, use `salt-ds create "<component>" --json --include-starter-code --starter-only` to get the resolved component with starter code.

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
`status: partial` means **user-facing remaining work** — unresolved regions, follow-through entities, composite plans that still need grounding. It does not mean Salt's own validator coverage is incomplete. Registry coverage gaps live in the top-level `internal_limitations` block (`unsupported_claim_count`, `unsupported_rule_kinds`) and are independent of `status`. A clean run with `internal_limitations.unsupported_claim_count > 0` is still `status: success` and still implementation-safe; surface the limitation in your reply but do not retry, block, or escalate on it.
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
  - branch on `action.kind` rather than prose: `ask_user` asks and stops until the user provides updated input, `retrieve_entity`/`retrieve_examples` gathers evidence and reruns with the returned evidence bridge, `install_dependencies` installs packages and then reruns the workflow, and only `implement` allows editing
  - if compact output is still broad or mixed-surface after the first pass, inspect `salt://catalog/candidates/{query}` or the CLI catalog-query support before asking for `full`
  - once the owner is grounded, use `salt://catalog/entity/{name}` or an exact follow-up create call to ground the supporting surface instead of paraphrasing it again
- `review`: start with `review_salt_ui`; read returned `confidence` and `fix_candidates`; add runtime evidence only if the source pass is still not enough.
- `migrate`: start with `migrate_to_salt`; read returned `confidence`, `post_migration_verification`, and `visual_evidence_contract`; use `source_outline` for structured mockup-style regions, actions, states, and notes.
- `upgrade`: start with `upgrade_salt_ui`; read returned workflow `confidence`; run `review_salt_ui` on updated code when it is available.

The default MCP surface exposes repo-aware workflow tools first, followed by read-only support tools for entity, example, and discovery grounding. Use the capability manifest and current tool list for exact availability. `salt_workflow_v1` actions such as `retrieve_entity` and `retrieve_examples` are directly followable when those support tools are present. In constrained hosts, still verify the session tool list before calling a support tool; if a support tool is unavailable, use the workflow fallback for entity grounding with an exact entity name as workflow input. After create entity follow-through succeeds, rerun the original create workflow with `resolved_entities`.

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
salt-ds create "<original prompt>" --json --resolved-entity "<entity name>"
```

Do not force `--type component` on follow-through calls unless you are certain the entity is a component. Named entities from `required_follow_through` may be patterns or components. Omit `--type` to let the resolution find the best match across all solution types.

The `--resolved-entity` rerun is the CLI evidence bridge for create entity follow-through. MCP hosts use the same bridge as `resolved_entities: ["<entity name>"]` on the rerun of the original `create_salt_ui` call.

The `--starter-only` flag returns a minimal JSON object with `workflow`, `status`, `decision`, `starter_code`, `composition_contract`, and any deeper follow-through metadata that still remains — no full workflow envelope. Use this only as additive support for the exact entity, not as a replacement for rerunning the original workflow with the resolved entity.

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
