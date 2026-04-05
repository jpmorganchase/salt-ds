# build workflow

## 1. normalize the input

- Identify the user goal, core actions, data density, states, and constraints.
- For screenshots or mockups, translate visible regions into Salt patterns before thinking about JSX.
- If the starting point is non-Salt UI code or a foreign component library, use `migrate_to_salt` to map the source intent and structure into Salt targets before refining the implementation.
- Treat the resulting `source_ui_model` as the working map of page regions, primitive candidates, and structured flows.
- Separate direct swaps from pattern rewrites and manual reviews before you start writing JSX.
- If the translation step returns clarifying questions, answer the minimum set needed to unblock the highest-risk region before scaffolding.

## 2. choose the structure first

- Pick the page, panel, form, navigation, or content pattern that best matches the job.
- If the user asks for a dashboard, page, screen, workspace, overview, or another multi-region surface, keep that page-level framing in the first Salt create call instead of paraphrasing it into a single metric, card, or other sub-pattern.
- For greenfield dashboards, metric cards, navigation shells, and layout fixes, treat the request as Salt UI by default instead of starting from generic React/CSS composition.
- For new Salt-native work, treat the default visual shell as the default-new-work bootstrap described in `references/shared/theme.md`. Only fall back to the compatibility path from that same reference when migration compatibility or explicit repo policy requires it.
- If you name or scaffold `SaltProviderNext`, include the full default-new-work bootstrap from `references/shared/theme.md` instead of naming the provider alone unless an explicit compatibility or repo-policy exception applies.
- Before changing centering, spacing, or alignment on existing Salt UI, confirm the intended Salt primitive or pattern first instead of guessing with local CSS.
- Prefer the most constrained primitive or pattern that can carry the interaction.
- Before creating a custom component, wrapper, or layout helper, check whether an existing Salt primitive, pattern, or foundation already covers the need.
- Decide where foundations and tokens should handle spacing, density, typography, and color.
- For non-Salt starts, use the translation step to lock the Salt building blocks first, then choose the JSX composition that fits them cleanly.
- Use the translated workstreams and scaffold handoff to decide what gets built first instead of inventing a new implementation order.
- If a broad create result returns `composition_contract.expected_patterns` or `composition_contract.expected_components`, treat them as an implementation checklist and run the matching Salt follow-up for each unresolved named item before building that region.
- If the canonical Salt result recommends a project conventions check, confirm repo-specific wrappers or local patterns before you commit to the final structure.

## 3. clarify only when it changes the structure

- Ask a small number of high-value questions when package choice, layout pattern, responsiveness, or interaction model is unclear.
- If the ambiguity does not block a good first implementation, state an assumption instead of stopping.

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
- Keep canonical Salt guidance separate from repo-specific conventions. Use project conventions or explicit repo guidance for local overrides instead of assuming the core MCP already knows them.
- If you mention a specific Salt token, prop, or API name, verify that the exact name exists in canonical Salt guidance before returning it.
- When token choices affect surfaces, borders, separators, or semantic color, confirm the token family and direct-use policy before finalizing the styling.
- If custom composition remains necessary, explain why standard Salt options were ruled out and keep the customization narrow.

## 6. refine against the input

- Check that the structure, states, and affordances still match the requirement or mockup.
- If starting from partial code, simplify before adding more wrappers or overrides.
- If you started from non-Salt code, verify that the implemented result still matches the translated source regions and redesign hotspots.
- After the required follow-through and the first scaffold pass, run `review_salt_ui` on the result when updated code is available.
- If source-level validation is still not enough and the Salt CLI is available, run `salt-ds doctor` when runtime target confidence is low and `salt-ds review <file-or-dir> --url <url>` on the relevant running page or Storybook URL.
- Prefer browser-session evidence when available, and treat `fetched-html` fallback output as narrower evidence for structure, landmarks, and accessible names.

## 7. return the result

- For non-Salt inputs, start with a short translation checkpoint that names the detected source regions, grouped workstreams, direct swaps, pattern rewrites, and manual review points.
- Then show the scaffold handoff: what to start with, what grouped structure to build around, and what to validate after the first pass.
- For new Salt-native work, state the default theme bootstrap explicitly when it affects the scaffold by referencing the exact default-new-work or compatibility path from `references/shared/theme.md`.
- Then summarize the implementation plan, list the chosen building blocks, surface assumptions, include Salt compliance checks, and include starter code when it will accelerate implementation.

## runtime-assisted examples

### MCP-unavailable fallback example

- If Salt MCP is unavailable but the Salt CLI is available, keep the same workflow shape with the CLI fallback underneath.
- Complete the same stages:
  - canonical Salt selection
  - source-level validation through `salt-ds review <file-or-dir>`
  - any workflow-directed grounding follow-up the create or migrate result still recommends
- Only after that, if rendered behavior is still uncertain, use `salt-ds doctor` and `salt-ds review <file-or-dir> --url <url>` as local evidence.
- In the final response, state clearly that canonical Salt guidance came from the fallback path because MCP was unavailable, and keep runtime findings separate.

### browser-session example

- After the first scaffold pass, `review_salt_ui` is clean enough that the remaining uncertainty is about rendered labeling and runtime behavior.
- Run `salt-ds doctor` if the target URL is unclear, then run `salt-ds review <file-or-dir> --url <url>`.
- If the result is `browser-session`, use:
  - console and page errors to catch runtime breakage
  - screenshot artifacts to confirm the rendered structure you expect
  - hydrated roles and landmarks to refine accessibility fixes
- Return the implementation plan with the runtime findings separated from canonical Salt guidance.

### fetched-html fallback example

- If browser-session inspection is unavailable and `salt-ds review <file-or-dir> --url <url>` falls back to `fetched-html`, keep the claims narrow.
- Use the fallback output only for:
  - title or status confirmation
  - basic landmark and role summaries
  - coarse structure checks
- If the remaining issue depends on client-side execution, focus behavior, or a risky cleanup decision, ask for browser-session inspection or manual validation instead of overcommitting.
