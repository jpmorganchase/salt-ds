# Salt DS — Review Reference

## Review Rules

Use this file only for `review` work.
For deep or repo-spanning review, project context should already be known.
For quick-check, you may start from the current file, selection, or smallest affected region and add project context when feasibility or safety requires it.

## Priority Order

Review in this order:

1. correctness and canonical mismatch
2. composition misuse
3. conventions conflicts
4. migration or upgrade risk
5. evidence gaps

Do not lead with style nits when a more important issue exists.

## Issue Families

- `review-canonical-mismatch`
  - the code bypasses the nearest correct Salt component, pattern, or foundation
- `review-composition-misuse`
  - Salt parts are combined incorrectly or required structure is missing
- `review-conventions-conflict`
  - repo wrappers, bans, or local rules are ignored or treated as canonical Salt
- `review-migration-upgrade-risk`
  - deprecated, unstable, or version-sensitive Salt usage needs change
- `review-evidence-gap`
  - source review is not enough to close the question and runtime evidence is the right next step

## Review Loop

0. Obtain canonical Salt guidance via MCP (`review_salt_ui`) or CLI (`salt-ds review`) before proposing Salt-specific fixes.
1. Read the source findings first.
2. Inspect `fixCandidates`.
3. Inspect `confidence` and `raiseConfidence`.
4. Apply only edits that still fit the repo context and user goal.
5. Rerun `review`.
6. Add `review --url` only if the source pass still leaves an important gap.

If structured fields such as `fixCandidates`, `confidence`, or `raiseConfidence` are missing, keep the same order and derive the next step from the canonical findings rather than stalling or skipping the review contract.

## Critical Rules

- do not propose Salt-specific fixes, replacements, or code until canonical Salt guidance has been obtained via MCP or CLI
- keep findings decision-first and concise
- prefer deterministic `fixCandidates` before inventing broader edits
- keep canonical Salt guidance separate from repo conventions in the explanation
- use runtime evidence to answer unresolved questions, not as the first step
- when multiple findings exist, order them by user impact and regression risk

## Accessibility Audit Rule

Treat Salt-specific accessibility audits as `review` work, not generic accessibility commentary.
Ground the audit in canonical Salt guidance first, then use the rubric to assess semantics, keyboard flow, labeling, focus visibility, contrast-sensitive states, and recovery states.
Do not skip Salt source validation just because the request mentions accessibility.

## Quick-Check Mode

Use quick-check mode when the user wants a gut-check, pre-commit sanity review, or the safest next fix.

- stay close to the current file, current selection, or smallest affected region
- still obtain canonical Salt guidance when feasible, but avoid broad repo sweeps unless the issue clearly requires them
- return the top issues, the safest next fix, and the most important confidence gap
- if the review becomes structurally ambiguous, say that a deep review is the safer next step

---

## output template

## overall assessment

- Give a short summary of design-system alignment, risk level, and the main theme of the review.
- For narrow debug/fix tasks, summarize the broken region, the likely root-cause theme, and whether the issue looks structural, wrapper-driven, or styling-only.

## highest-priority findings

- State the issue, why it matters, and the preferred Salt direction or fix.
- Order findings by impact rather than by file order.
- For narrow debug/fix tasks, lead with:
  - suspected root cause
  - smallest credible fix
  - why that fix is narrower or safer than broader redesign

## quick wins

- List small, high-leverage improvements that can be made without redesigning the whole UI.
- For narrow debug/fix tasks, use this section for:
  - minimal follow-up edits
  - wrapper cleanup checks
  - verification steps still needed

## salt compliance checks

- State whether the response used quick-check mode, broad review mode, or narrow debug/fix mode.
- Note which Salt primitives, patterns, or foundations were checked when judging component choice.
- State whether the review findings were validated against canonical Salt guidance.
- State which source-level validation surface was used when code was available:
  - `review_salt_ui`
  - `salt-ds review`
  - or no source-level validation
- If custom UI is retained, explain briefly why a standard Salt option does not appear to fit.
- Note whether local wrappers, patterns, or repo conventions were applied through the repo-aware Salt workflow or explicit repo guidance when they could change the review outcome.
- Note any token-family or direct-use checks that materially affected the review findings.

## suggested next checks

- Suggest follow-up checks such as keyboard flow, responsive states, story coverage, or version-specific validation.
- If a runnable URL exists and source review is still inconclusive, suggest `salt-ds doctor` or `salt-ds review <file-or-dir> --url <url>` as local evidence.
- If runtime evidence was used, note whether it came from browser-session inspection or a fetched-HTML fallback.
- If runtime evidence came from `browser-session`, you may use it to support findings about runtime errors, hydrated accessible names, landmark structure, or other rendered behavior.
- If runtime evidence came from `fetched-html`, keep the language narrower and frame it as structure-level evidence rather than full runtime validation.

Example runtime-assisted phrasing:

- `Browser-session evidence: the inspected page reported one console error on mount and rendered three unnamed buttons, which strengthens the recommendation to fix labeling before shipping.`
- `Fetched-html fallback evidence: the page structure includes a main landmark and a button cluster, but browser-session inspection is still needed before making claims about client-side behavior or focus flow.`

Example MCP-unavailable fallback phrasing:

- `MCP unavailable: canonical Salt guidance was checked through the Salt CLI fallback, source-level validation ran before runtime evidence, and the review still treats the CLI as transport rather than as a second policy layer.`
- `Fallback guidance: the review used the same Salt workflow, validated the source first through salt-ds review, then kept salt-ds doctor and salt-ds review --url reserved for local evidence only.`

Example debug/fix phrasing:

- `Debug/fix mode: the broken region is the left navigation shell, the likely root cause is centering applied at the shell wrapper instead of the navigation layout owner, and the smallest credible fix is to correct the parent flex alignment rather than patch the child items.`
- `Debug/fix mode: the metric row drift looks structural rather than cosmetic; the cards are being laid out with generic wrappers instead of the intended Salt composition, so the fix starts with the layout owner before touching individual card styles.`

If there are no material findings, say so explicitly and note any residual testing gaps or assumptions.

## blocked or partial review states

- if canonical review guidance stayed partial or noisy, state that clearly before giving recommendations
- separate “grounded finding” from “likely but not fully grounded”
- if runtime evidence came from fetched-html fallback only, keep claims narrower than full browser-session validation

Example quick-check phrasing:

- `Quick-check mode: the form structure is broadly reasonable, but the validation feedback is detached from the affected fields; the safest next fix is to move the status and helper text back under field ownership before touching spacing.`
- `Quick-check mode: I see one likely Salt composition issue and one confidence gap. Fix the layout owner first; if the problem persists, escalate to a deep review.`

---

## review gotchas

- Prefer the most constrained Salt primitive that satisfies the need.
- Do not recommend bespoke replacements until you have checked whether Salt already has a canonical component, pattern, or foundation.
- Treat extra wrappers as suspicious until they clearly improve semantics, layout, or state ownership.
- Flag raw spacing, sizing, and styling values unless there is a clear, local justification.
- Flag direct palette-token usage, non-fixed border thickness, or mismatched container surface tokens when the UI styles Salt components directly.
- Remember that valid API usage is not the same as good design-system usage.
- Prefer simpler hierarchy and quieter defaults over clever composition or decorative styling.
- Do not bury major issues under a long list of minor comments.
- Call out when a custom abstraction hides a standard Salt pattern or makes future changes harder.
- Prefer MCP-backed evidence when recommending a different primitive or pattern.
- For narrow debug/fix tasks, confirm the intended Salt primitive or pattern before recommending local CSS changes.
- For alignment and centering issues, inspect the layout owner, parent flex/grid chain, and wrappers before blaming the leaf component.
- Treat dashboard and metric drift as possible structure or shell problems, not just card-level styling problems.
- If Salt MCP is unavailable, keep the same review workflow and use the Salt CLI only as fallback access to canonical Salt guidance.
- If the review question is really about deprecations, package drift, or version-shaped behavior, treat it as upgrade work instead of forcing it into a generic review.
- If code is available and MCP is unavailable, run `salt-ds review <file-or-dir>` before escalating to runtime evidence.
- In debug/fix mode, return the smallest credible fix and the verification still needed instead of expanding into a broad findings list.
- If you use `salt-ds review <file-or-dir> --url <url>` or `salt-ds runtime inspect <url>`, keep fetched-HTML fallback findings separate from canonical Salt guidance and from full browser-session testing claims.

---

## debug workflow

## Contents

- [1. classify the task](#1-classify-the-task)
- [2. isolate the broken region](#2-isolate-the-broken-region)
- [3. resolve the canonical Salt target first](#3-resolve-the-canonical-salt-target-first)
- [4. inspect the local implementation](#4-inspect-the-local-implementation)
- [5. validate the source before runtime](#5-validate-the-source-before-runtime)
- [6. use runtime evidence only if needed](#6-use-runtime-evidence-only-if-needed)
- [7. return the fix result](#7-return-the-fix-result)

Use this when the task is a narrow Salt UI bug-fix or root-cause request rather than a broad audit.

## 1. classify the task

- Treat the task as debug/fix mode when the user is asking why one layout, navigation, spacing, centering, or interaction detail is broken.
- Keep the scope narrow. Do not turn a single bug into a full review unless the root cause clearly spans the whole screen.

## 2. isolate the broken region

- Name the smallest broken region first: navigation shell, toolbar cluster, metric card row, dialog footer, or form action area.
- Separate the visible symptom from the likely owning structure.
- For alignment issues, identify the leaf element that looks wrong, the parent layout owner, and any wrapper or shell that may actually control positioning.

## 3. resolve the canonical Salt target first

- Before suggesting CSS or wrapper changes, confirm the intended Salt primitive or pattern.
- Prefer `create_salt_ui` and read the returned canonical guidance, sources, and starter path before suggesting CSS or wrapper changes.
- If MCP is unavailable, keep the same debug workflow and let the environment use the Salt CLI fallback underneath.

Many apparent layout bugs are really primitive-choice, shell-choice, or wrapper-conflict problems.

## 4. inspect the local implementation

- Look for wrappers changing alignment or sizing, flex/grid ownership confusion, hard-coded spacing or width rules, custom CSS fighting Salt structure, and generic div-based dashboard rows where Salt layout or data surfaces would be clearer.

## 5. validate the source before runtime

- Use `review_salt_ui` or `salt-ds review <file-or-dir>`.
- Treat that as the main validation step before runtime evidence.

## 6. use runtime evidence only if needed

- If source-level reasoning still does not explain the bug, use cheap URL fetch or fetched HTML when title, status, coarse structure, or obvious landmarks are enough.
- Use `salt-ds doctor` if runtime target confidence is low, then use `salt-ds review <file-or-dir> --url <url>`.
- Prefer browser-session evidence.
- Use fetched-html fallback only for narrower structure claims.
- Treat layout-debug details as advanced evidence only.

## 7. return the fix result

For debug/fix mode, return the broken region, suspected root cause, smallest credible fix, validation surface used, and whether verification is complete or still needed.

---

## review rubric

Use this rubric to judge impact, not to generate comment volume.

## debug/fix focus

- If the task is a narrow UI bug-fix, prioritize root cause over comment volume.
- Identify whether the issue is owned by:
  - the canonical Salt primitive or pattern choice
  - a local wrapper or shell
  - the parent layout structure
  - a narrower styling or token decision
- Return the smallest credible fix before broad redesign ideas.

## component choice

- Check whether the UI uses the most constrained Salt primitive, pattern, or foundation that fits the need.
- Before accepting custom UI or abstraction, check whether Salt already provides a standard component or pattern for the job.
- Flag custom compositions that recreate a Salt primitive or pattern without a strong reason.
- Check whether the package choice is appropriate and whether a more canonical Salt option exists.

## composition

- Prefer flat, readable hierarchy with obvious ownership of layout, semantics, and state.
- For compound components, verify that the required sub-components from `composition.required_children` are present and that optional sub-components are used correctly.
- Flag wrapper stacks, pass-through components, duplicated structure, and prop plumbing that hide the real UI intent.
- Ask whether the same outcome can be achieved with fewer layout nodes or a clearer pattern.

## foundations

- Check spacing, sizing, density, typography, color, and elevation against Salt foundations and tokens.
- Check that token family choices and direct-use decisions follow the canonical Salt token policy instead of visual guesswork.
- Check that borders or separator lines use the right structural tokens and that container surfaces do not mix mismatched background and border levels.
- Flag places where the UI drifts because it uses raw values or inconsistent density assumptions.
- Treat local overrides as suspect until they are justified by the product need.

## styling discipline

- Prefer token-driven styling and narrowly scoped overrides.
- Flag ad hoc CSS that restyles Salt components into a different system.
- Check whether styling choices create unnecessary visual noise or state ambiguity.

## accessibility

- Check keyboard flow, focus visibility, semantics, labels, announcements, contrast, and interactive target clarity.
- Prioritize issues that break access, create confusion, or make important states invisible.
- Consider empty, loading, validation, and error states, not just the happy path.

## maintainability

- Check whether the structure is easy to extend without duplicating layout or styling rules.
- Flag custom abstractions that obscure the underlying Salt pattern or make simple changes expensive.
- Prefer explicit structure over clever indirection.

## severity guide

- Critical: broken access, missing semantics, unusable workflows, or dangerous state ambiguity.
- High: wrong primitive or pattern, severe composition issues, or strong foundations drift.
- Medium: maintainability issues, noisy styling, or preventable complexity.
- Low: minor cleanup or polish that does not change the main UX outcome.
