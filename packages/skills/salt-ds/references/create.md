# Salt DS — Create Reference

## Create Rules

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
- when provider or theme bootstrap matters, use `references/shared/theme.md`; name provider/theme facts only when workflow evidence, registry-backed generated context, `.salt` policy, or explicit user input supplies them
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
- for page-level work, do not treat one valid registry-backed anchor as permission to improvise unresolved peer regions such as header, navigation, chart, or table surfaces
- if a concrete region remains unresolved, either keep that region pending or ask instead of inventing a bespoke composition
- do not let successful TypeScript build or generic rendering override an incomplete Salt create contract

---

## create workflow

## 1. normalize the input

- Identify the user goal, core actions, data density, states, and constraints.
- For screenshots or mockups, translate visible regions into Salt patterns before thinking about JSX.
- If the starting point is non-Salt UI code or a foreign component library, use `migrate_to_salt` to map the source intent and structure into Salt targets before refining the implementation.
- Treat the resulting `source_ui_model` as the working map of page regions, primitive candidates, and structured flows.
- Separate direct swaps from pattern rewrites and manual reviews before you start writing JSX.
- If the translation step returns clarifying questions, answer the minimum set needed to unblock the highest-risk region before scaffolding.

## 2. choose the structure first

- For pages with multiple regions or concrete sub-surfaces, also consult `references/shared/surface-resolution.md` before choosing local implementation details.

- Pick the page, panel, form, navigation, or content pattern that best matches the job.
- If the user asks for a dashboard, page, screen, workspace, overview, or another multi-region surface, keep that page-level framing in the first Salt create call instead of paraphrasing it into a single metric, card, or other sub-pattern.
- For greenfield dashboards, metric cards, navigation shells, and layout fixes, treat the request as Salt UI by default instead of starting from generic React/CSS composition.
- For new Salt-native work, consult `references/shared/theme.md` when provider or theme bootstrap is part of the task. Name provider/theme facts only when workflow evidence, registry-backed generated context, `.salt` policy, or explicit user input supplies them.
- Before changing centering, spacing, or alignment on existing Salt UI, confirm the intended Salt primitive or pattern first instead of guessing with local CSS.
- Prefer the most constrained primitive or pattern that can carry the interaction.
- Before creating a custom component, wrapper, or layout helper, check whether an existing Salt primitive, pattern, or foundation already covers the need.
- Decide where foundations and tokens should handle spacing, density, typography, and color.
- For non-Salt starts, use the translation step to lock the Salt building blocks first, then choose the JSX composition that fits them cleanly.
- Use the translated workstreams and scaffold handoff to decide what gets built first instead of inventing a new implementation order.
- If compact create output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before building the blocked region.
- Branch on `salt_workflow_v1.action.kind`: `ask_user` asks and stops until the user provides updated input, `retrieve_entity`/`retrieve_examples` gathers evidence and reruns with the returned evidence bridge, `install_dependencies` installs packages and then reruns the workflow, and only `implement` permits Salt UI edits.
- Installing Salt packages is not implementation permission; after installing, immediately rerun the originating workflow and edit only if that rerun returns `status: success`, `action.kind: implement`, and `evidence.status: complete`.
- Use `recipe.steps`, `questions`, and `evidence.missing` to keep unresolved regions visible instead of filling them with guessed Salt structure.
- Do not treat `status: partial` as a finished create step just because starter code or a first scaffold exists.
- Leave `solution_type` unset on broad or mixed-surface create prompts unless the request already points clearly to a known Salt family.
- If compact create stays broad on a mixed-surface prompt and the next exact follow-up is not obvious, inspect retrieval support first:
  - MCP: `salt://catalog/candidates/{query}`, `salt://catalog/entity/{name}`, then `salt://catalog/family/{family}` when the broader Salt family still matters
  - CLI: `salt-ds info --json --catalog-query "<prompt>"`, `salt-ds info --json --entity "<name>"`, then `salt-ds info --json --family "<category>"`
- Use retrieval support to confirm the owner and supporting surfaces, then continue with exact named follow-through. For create entity follow-through, rerun with MCP `resolved_entities` or CLI `--resolved-entity`. Do not jump to `full` just to re-run selection.
- Request `full` output only when `action` or `safety.blocking_reasons` indicate you need deeper artifacts such as `composition_contract`, starter snippets, or expanded validation detail.
- For exact named asks, keep the first create call close to the named Salt target. Do not paraphrase exact requested entity names into broader descriptive text before the first grounded call.
- If the host already knows the workspace root, get project context first and reuse `context_id` on repeated repo-aware calls instead of recollecting context each time.
- If the canonical Salt result recommends a project conventions check, confirm repo-specific wrappers or local patterns before you commit to the final structure.

## 3. clarify only when it changes the structure

- Ask a small number of high-value questions when package choice, layout pattern, responsiveness, or interaction model is unclear.
- In blocker-question mode, ask one focused question at a time and provide a recommended default answer.
- State an assumption only after the workflow satisfies the implementation gate, and only for non-structural details that do not affect component or pattern choice, navigation behavior, accessibility semantics, data model, package choice, repo policy, or Salt API/prop/token usage.
- If an unresolved decision affects those structural choices, ask one blocker question instead of implementing through the gap.

## 3b. branch into options only when requested

- If the user explicitly wants alternatives, load `references/create/explore-options.md` after the top-level surface is grounded.
- Default to two Salt-valid directions: one conservative default and one more opinionated but still bounded direction.
- Exceed two directions only when the user explicitly asks for more.
- Keep shared invariants visible and recommend a default continuation path.

## 4. compose the ui

- Keep hierarchy shallow and responsibilities obvious.
- Let Salt primitives carry semantics and interaction behavior.
- Add custom styling only when Salt foundations or tokens do not already cover the need.
- When the translation step identifies pattern rewrites, rebuild the structure around the Salt pattern instead of preserving foreign wrapper hierarchy.
- If starter code is available for the translated target, use it as the scaffold baseline instead of rewriting the same structure from scratch.

## 5. validate against Salt guidance

- Confirm the chosen direction against canonical Salt guidance through the Salt MCP or the docs it points to.
- Do not stop after a plausible first scaffold if the request is a Salt UI task; complete the selection, validation, and any workflow-directed grounding follow-ups before finishing.
- Do not substitute custom KPI cards, raw tables, bespoke headers, or other guessed sub-patterns when the contract already named a canonical Salt target that still needs follow-through.
- Once the owner is grounded, keep supporting follow-through exact. Do not paraphrase a grounded follow-up entity back into a broad prompt.
- Keep canonical Salt guidance separate from repo-specific conventions. Use project conventions or explicit repo guidance for local overrides instead of assuming the core MCP already knows them.
- If you mention a specific Salt token, prop, or API name, verify that the exact name exists in canonical Salt guidance before returning it.
- When token choices affect surfaces, borders, separators, or semantic color, confirm the token family and direct-use policy before finalizing the styling.
- If custom composition remains necessary, explain why standard Salt options were ruled out and keep the customization narrow.

## 6. refine against the input

- Check that the structure, states, and affordances still match the requirement or mockup.
- If starting from partial code, simplify before adding more wrappers or overrides.
- If you started from non-Salt code, verify that the implemented result still matches the translated source regions and redesign hotspots.
- After the required follow-through and the first scaffold pass, run `review_salt_ui` on the result when updated code is available.
- If source-level validation is still not enough and the Salt CLI is available, use `references/shared/transport.md` to choose between `salt-ds doctor` and `salt-ds review <file-or-dir> --url <url>`.
- Prefer browser-session evidence when available, and treat `fetched-html` fallback output as narrower evidence for structure, landmarks, and accessible names.

## 7. return the result

- For non-Salt inputs, start with a short translation checkpoint that names the detected source regions, grouped workstreams, direct swaps, pattern rewrites, and manual review points.
- Then show the scaffold handoff: what to start with, what grouped structure to build around, and what to validate after the first pass.
- State the theme/bootstrap decision explicitly only when it affects the scaffold or implementation plan and the required evidence is available.
- Then summarize the implementation plan, list the chosen building blocks, surface assumptions, include Salt compliance checks, and include starter code when it will accelerate implementation.

## 8. prove completion before finalizing

- confirm the top-level surface is grounded
- confirm every required named sub-surface for the regions you implemented is grounded
- confirm any explicit token, prop, API, and theme bootstrap names you mention were verified
- if the transport stayed partial or noisy, do not convert a plausible scaffold into a "finished Salt answer"
- when code was written, run source-level Salt validation before finalizing

---

## output template

## translation checkpoint

- For non-Salt inputs, summarize the translated source regions first.
- Call out the grouped workstreams, direct swaps, pattern rewrites, manual review points, and any clarifying question that still blocks the structure.

## scaffold handoff

- State what to scaffold first from the translated plan.
- Name the grouped region or pattern the implementation should build around.
- If compact create output is not yet implementation-safe, list the top-level `safety.blocking_reasons` and the returned `action` before implementation.
- If `status` stays `partial` or `blocked`, state clearly that the workflow is not complete even if starter code or one file was created.
- State what must be validated immediately after the first scaffold pass.
- If runtime validation is still needed and a runnable URL exists, note whether `salt-ds doctor` or `salt-ds review <file-or-dir> --url <url>` should be used as local evidence after the first scaffold pass.

## implementation plan

- Outline the shortest sensible path from structure choice to implementation.
- If provider or theme bootstrap matters, cite the evidence source for the chosen path or state that the theme decision remains pending.
- If some regions are grounded and others are not, return a clearly-labeled partial scaffold only for the grounded regions.

## chosen Salt building blocks

- List the selected primitives, patterns, foundations, and tokens with a brief reason for each.
- Include the theme bootstrap only when it materially affects the scaffold or code handoff.

## assumptions

- Make the assumptions explicit when the input is incomplete or ambiguous.

## salt compliance checks

- State whether the task was treated as a Salt UI task and why.
- Summarize the required stages completed:
  - selection
  - safe-to-implement check
  - validation
- State the compact workflow fields you relied on first:
  - `status`
  - `safety.exact_request_safe`
  - `safety.blocking_reasons`
  - `action`
  - `summary`
- List the Salt primitives, patterns, or foundations that were checked before settling on the solution.
- State whether the implementation uses a standard Salt option; if not, justify the custom composition briefly.
- Note the canonical Salt guidance source consulted when it materially affected the decision.
- Use `top_source_urls` from `ide_summary` as canonical grounding links when referencing Salt documentation in the answer.
- If you needed `full` workflow output, note which deeper artifacts were inspected and why the compact contract was not sufficient on its own.
- If you named any Salt token, prop, or API explicitly, note that the exact name was verified against canonical Salt guidance.
- If provider or theme bootstrap was recommended, note whether repo policy and asset availability were confirmed, still pending, or explicitly overridden.
- State which source-level validation surface was used after the first scaffold pass:
  - `review_salt_ui`
  - `salt-ds review`
  - or still pending
- Note whether project conventions or explicit repo guidance were checked for local wrappers, patterns, or conventions when the task depends on them.
- Note which token family checks were applied for custom styling, borders, or surfaces.
- If runtime evidence was used or recommended, note whether it came from browser-session inspection or a fetched-HTML fallback.

## blocked or partial create states

- If canonical create guidance stayed partial, noisy, or blocked, state that clearly before offering implementation or starter code.
- Separate grounded regions from regions that are still pending canonical follow-through.
- For multi-region surfaces, do not present a complete-looking scaffold when essential sub-surfaces are unresolved; mark each unresolved region as pending.
- If the bounded partial scaffold rule applies, state exactly what canonical Salt follow-through is still missing and frame the result as provisional.
- If transport was degraded, name the transport attempted, what succeeded, what remained unresolved, and the exact next step that would unblock the work.

Example blocked phrasing:

- `The create step resolved the dashboard shell and metric summary region, but the chart surface misrouted twice. The chart region is marked pending instead of improvised.`
- `Compact create output returned safety.exact_request_safe: false with a blocking reason of unresolved navigation pattern. The action is to resolve the navigation region before scaffolding the full page.`
- `I can return a bounded partial scaffold for the header and form regions, but the table region is still pending canonical Salt follow-through.`

## starter code

```tsx
// Include starter code only when it materially helps the task move forward
// and follows the chosen Salt structure.
```

## option exploration

Only include this section when the user explicitly asked for alternatives.

- Default to two Salt-valid directions.
- Exceed two only when the user explicitly asks for more.
- For each direction, say what stays invariant, what changes, and the main trade-off.
- End by recommending one default continuation path.

---

## create gotchas

- Do not jump straight to code without choosing primitives and structure first.
- Do not skip the translation map when the source starts outside Salt. Separate direct swaps, pattern rewrites, and manual review points before coding.
- Do not ignore low-confidence translation output. Resolve the blocking clarifying question before you scaffold the wrong structure.
- Do not over-nest layout wrappers when a simpler Salt pattern or layout primitive will do.
- Do not create custom UI, wrappers, or abstractions until you have ruled out an existing Salt primitive, pattern, or foundation.
- Do not invent Salt APIs, props, or components.
- Do not rely on raw values when Salt foundations or tokens should be used.
- Do not finalize token choices without checking the canonical token policy or Salt MCP guidance for the correct family and direct-use rules.
- Do not style borders or separator lines with non-fixed thickness values unless an established Salt pattern explicitly requires it.
- Prefer quieter defaults over decorative UI or needless emphasis.
- Avoid restyling Salt primitives into a separate design language unless the user explicitly asks for it.
- If the input is incomplete, make explicit assumptions before adding speculative complexity.
- If partial code already exists, prefer simplifying and aligning it before rebuilding from scratch unless the structure is fundamentally wrong.
- If you use `salt-ds review <file-or-dir> --url <url>` or `salt-ds runtime inspect <url>`, keep fetched-HTML fallback findings separate from canonical Salt guidance and from claims that require full browser-session testing.

---

## clarifying questions

Ask only the few questions that change the Salt structure or package choice.

## good question types

- Scope: is this a single component, a panel section, or a full page?
- Interaction model: what are the primary actions, selection patterns, or editing flows?
- Data shape: what content density, column structure, or empty states must the UI support?
- Responsiveness: does the layout need distinct mobile, tablet, or desktop behavior?
- Constraints: is there a required Salt package, version boundary, accessibility requirement, or implementation constraint that changes the structure?

## example prompts

- "Is this intended to be a reusable component or a page-level layout?"
- "Should the primary interaction behave like selection, editing, navigation, or review?"
- "Do you need responsive behavior beyond simple stacking?"
- "Are there existing Salt primitives or packages that must be used or avoided?"

## avoid

- Long questionnaires.
- Questions that do not change the chosen primitives or structure.
- Asking for pixel-perfect detail when a reasonable Salt-first default is already clear.

## blocker-question mode

When one unresolved decision blocks the Salt direction:

- ask one question at a time
- say why it changes the structure or pattern choice
- provide your recommended default answer when possible
- if the codebase or repo context can answer it, inspect that first instead of asking the user

---

## Explore Options

Use this file only when the user explicitly asks for alternatives, comparisons, or multiple directions.
Do not use it by default.

## Entry Rule

Before exploring options:

- ground the top-level Salt surface canonically
- preserve the user task and main workflow
- identify the non-negotiable constraints that both options must respect

If the top-level surface is still unresolved, do not branch into options yet.

## Option Count

Default to two options.
Exceed two only when the user explicitly asks for more.
More than two usually creates noise in IDE workflows.

Use this pairing by default:

1. **Conservative direction**
   - closest to the canonical Salt default
   - lowest structural risk
   - easiest to implement and review
2. **Opinionated direction**
   - still Salt-valid
   - changes composition, emphasis, or information flow in a meaningful but bounded way
   - must still preserve the same user job and core states

## What May Vary

Allow options to vary in:

- layout ownership
- information hierarchy
- whether navigation, summary, or task flow is emphasized first
- shell vs content emphasis
- where supporting states appear

Do not vary options mainly through theme, decorative styling, or arbitrary widget changes.

## Output Pattern

For each option, include:

- what stays invariant
- the composition direction
- why it fits the task
- main trade-offs
- implementation or review risk

Then end with:

- which option you recommend as the default continuation
- what would make you choose the other option instead

## Anti-Patterns

- do not generate radically different options that break Salt consistency
- do not present options before the surface is grounded
- do not produce more than two options unless the user explicitly asks for more
- do not compare options in a dense table; explain the trade-offs in prose
