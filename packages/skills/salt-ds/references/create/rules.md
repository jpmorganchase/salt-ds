# Create Rules

Use this file only for `create` work after project context is known.

## Priority Order

1. User task
   - State the task the UI must help the user complete.
   - Identify the key interaction that should feel obvious first.
2. Canonical Salt choice
   - Resolve the nearest Salt pattern, component, composition, or foundation before inventing custom structure.
   - Prefer existing Salt composition over ad hoc markup.
3. Repo conventions
   - Apply wrappers, banned choices, or local shells only after the canonical Salt direction is clear.
4. Evidence
   - Add runtime evidence only when source-grounded create guidance still leaves important uncertainty.

## Critical Rules

- obtain canonical Salt guidance through MCP or CLI before choosing components, patterns, props, tokens, or writing Salt-specific code
- if the user asks for a dashboard, page, screen, workspace, overview, or another multi-region surface, preserve that page-level wording in the first Salt create call instead of collapsing it into a single widget or sub-pattern
- for targeted follow-up on a named sub-surface, preserve the user's concrete noun phrase such as `chart`, `table`, `metric`, or `filter` and add slot or pattern context only as supporting detail
- do not translate concrete follow-up asks into abstract category prose such as `data visualization component for dashboard analytical body`
- choose one composition direction before writing code
- prefer Salt patterns and compositions before custom UI structure
- keep the first scaffold centered on the main task, not on optional embellishment
- when provider or theme bootstrap matters, use `references/shared/theme.md`; prefer the shared new-work path only when repo policy does not override it and the required assets are available
- keep visual choices Salt-native; do not chase novelty outside the design system
- use workflow confidence to decide whether to proceed or ask a follow-up question
- verify any named Salt token, prop, or API against canonical Salt guidance before you put it in the plan or code
- for compound components, check `sub_component_names` and `composition` from the canonical output to use the correct child components and structure instead of guessing the JSX nesting
- if compact `create` output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before implementing the blocked sub-surface
- branch on `salt_workflow_v1.action.kind`: `ask_user` asks and stops until the user provides updated input, `retrieve_entity` or `retrieve_examples` gathers evidence and reruns with the returned evidence bridge, `install_dependencies` installs packages and then reruns the workflow, and only `implement` allows Salt UI edits
- installing Salt packages is not implementation permission; after installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`
- require `evidence.status: complete` before treating create output as implementation-ready
- use `recipe.steps`, `questions`, and `evidence.missing` to report remaining create work instead of guessing through gaps
- do not treat `status: partial` as completion just because starter code or one file was created; continue follow-through or report the work as incomplete
- leave `solution_type` unset on broad or mixed-surface create prompts unless the request already points clearly to a known Salt family
- if an exact Salt target name is already known from `required_follow_through`, `requested_entity`, `resolved_entity`, or a resolved MCP result, use that exact name or verified alias in the next create call instead of paraphrasing it
- do not implement named contract items from general React, CSS, HTML, or copied repo code before that Salt follow-through completes
- preserve explicit user nouns that are not yet covered as unresolved requirements, retrieve canonical evidence for them, and do not implement those regions until the workflow contract or support evidence covers them

## Stable Rule IDs

- `create-task-first`
  - state the user task before choosing components, wrappers, or embellishment
- `create-key-interaction-first`
  - make the primary interaction or decision point obvious before secondary details
- `create-choose-composition-direction`
  - commit to one Salt composition direction before writing code
- `create-canonical-before-custom`
  - resolve the nearest Salt pattern, component, or foundation before inventing custom structure
- `create-theme-bootstrap-only-when-grounded`
  - use shared theme guidance only when the task actually needs bootstrap guidance and repo policy does not override it
- `create-apply-conventions-after-canonical`
  - apply wrappers and local policy only after the canonical Salt direction is clear
- `create-runtime-evidence-only-for-gaps`
  - use runtime evidence only when source-grounded create guidance still leaves important uncertainty
- `create-verify-named-salt-details`
  - verify named Salt tokens, props, and APIs against canonical Salt guidance before suggesting them
- `create-check-compound-composition`
  - for compound components, check sub_component_names and composition from the canonical output to use the correct child components and JSX structure

## Intent-First Loop

0. Obtain canonical Salt guidance via MCP (`create_salt_ui`) or CLI (`salt-ds create`) and do not proceed until the result is complete enough for the regions you plan to implement.
1. State the user task, preserving page-level nouns like dashboard, page, screen, workspace, or overview when the request is multi-region.
2. State the key interaction or decision point.
3. State the composition direction.
4. State the Salt pattern or component choice.
5. State whether theme bootstrap guidance matters for this task and, if so, which path from `references/shared/theme.md` applies or remains pending.
6. Verify any explicit Salt token or API names you plan to mention.
7. If a targeted follow-up is needed, keep the concrete user noun phrase visible and add slot or page context without turning it into taxonomy-style wording.
8. If compact `create` output is not safe to implement, follow the returned `action.kind` before writing the blocked region.
9. If the exact Salt target name is already known, use it directly in the follow-up instead of paraphrasing it.
10. Only then move into code or starter guidance.

## Ask Instead Of Guess

- more than one Salt pattern fits and the tradeoff affects the user flow
- the key interaction is unclear
- the repo policy could materially change the chosen component or wrapper
- confidence is low and the workflow output says more evidence is needed

## Noisy-Result Safety

- if canonical create output is partial, semantically off-target, truncated, or repeated-conflict noise, stop before implementation and use `references/shared/degraded-tooling.md`
- after two noisy follow-up attempts for the same required item, do not keep fishing for a better result while coding around the gap
- for page-level work, do not treat one valid anchor such as `Analytical dashboard` as permission to improvise unresolved peer regions such as header, navigation, chart, or table surfaces
- if a concrete region remains unresolved, either keep that region pending or ask instead of inventing a bespoke composition
- do not let successful TypeScript build or generic rendering override an incomplete Salt create contract
