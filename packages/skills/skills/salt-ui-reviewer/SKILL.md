---
name: salt-ui-reviewer
description: review, critique, fix, simplify, modernize, or check salt-based react ui, jsx, composition, styling, accessibility, and design-system alignment. use when inspecting existing salt ui code or a described interface. return a structured, priority-ordered review.
---

# Salt UI Reviewer

Assume the user is reviewing UI in an application repo that consumes Salt. Review the actual code or described UI before reaching conclusions. Prefer the most constrained Salt primitive or pattern that satisfies the need, and verify major replacement recommendations against canonical Salt guidance. Keep the detailed rubric, gotchas, and response shape in the referenced files.

## When To Use

- reviewing existing Salt-based React UI for component choice, composition, styling, accessibility, or design-system fit
- turning a UI audit into a priority-ordered set of findings
- debugging or fixing a narrow existing UI problem such as centering, alignment, primitive misuse, shell/layout conflicts, or metric/dashboard composition drift
- simplifying or modernizing existing Salt code without changing the task into a migration plan
- do not use this as the primary workflow for non-Salt translation or version-to-version upgrade analysis

## Required Workflow

Follow these steps in order.

1. Inspect the code, jsx, styling, or ui description first before making design-system judgments.
2. Load `references/review-rubric.md`, `references/gotchas.md`, and `references/output-template.md`.
3. Load `references/debug-workflow.md` when the task is a narrow UI bug-fix or root-cause debugging request rather than a broad review.
4. Load `../../references/project-conventions.md` only when the consumer repo has wrappers, patterns, or shells that could change the review outcome, or when `guidance_boundary.project_conventions.check_recommended` is `true`.
5. Load `../../references/canonical-salt-tool-surfaces.md` and follow it for choosing between Salt MCP, CLI fallback, source-level validation, and runtime evidence.
6. Use the canonical Salt step first, then validation, then runtime evidence only if needed:
   - start from code-grounded validation for the current implementation
   - use canonical Salt lookup or recommendation only where it clarifies the review outcome
   - use version comparison only when the issue is genuinely version- or migration-shaped
   - if MCP is unavailable, start from `salt-ds info --json` and keep the same review workflow through the Salt CLI
7. For narrow debug or fix tasks, resolve the canonical Salt target before guessing at CSS or layout tweaks, then return:
   - the suspected root cause
   - the smallest credible fix
   - the validation surface used
   - the verification still needed, if any
8. For broad review tasks, prioritize findings in this order:
   1. broken or risky ux and accessibility
   2. wrong primitive or pattern choice
   3. over-composition and structural complexity
   4. foundations drift such as spacing, sizing, density, or token misuse
   5. lower-level cleanup and polish
9. Apply project conventions only after the canonical step when the boundary says repo-local wrappers, shells, or bans actually change the final answer.
10. Request runtime evidence only when source reasoning and validation are still not enough:
    - use cheap URL fetch or fetched HTML when title, status, coarse structure, or obvious landmarks are enough
    - run `salt-ds doctor` when the runtime target is unclear
    - run `salt-ds review <file-or-dir> --url <url>` when source validation and runtime evidence should stay in the same pass
    - run `salt-ds runtime inspect <url>` only when the task is explicitly evidence-only debugging or support work
    - treat layout-debug details as advanced evidence only
11. When recommending a replacement for custom UI or abstraction, state which Salt option should take its place and what canonical guidance supports that recommendation.
12. Write the review with `references/output-template.md`.

## Examples

- "Review this Salt toolbar and tell me the highest-impact issues before I refactor it."
- "Audit this existing page for wrong primitive choice, token drift, and accessibility risk."
- "Critique this Salt-based dialog composition and prioritize the fixes."
- "Fix the centering on this Salt navigation and tell me the smallest credible change instead of a broad audit."
- "Why are these metric cards drifting off-center in this Salt dashboard?"
- "Review this Salt page, and if the rendered structure is still unclear, inspect the running URL before you finalize the findings."

## Common Edge Cases

- Valid Salt APIs can still hide the wrong primitive or pattern choice; do not stop at API correctness.
- For narrow fix tasks, do not jump straight to local CSS tweaks before confirming the intended Salt primitive or pattern.
- Repo-approved wrappers can change the final recommendation, so check project conventions when the boundary says they matter.
- If the issue looks version-specific, use `compare_salt_versions` to separate review findings from migration findings.
- If the user only provides a UI description, keep assumptions visible and avoid overconfident structural judgments.
- If the bug looks like alignment or layout drift, inspect the parent chain, wrappers, and surface/layout ownership before blaming the leaf component.
- If runtime evidence is needed, use browser-session evidence when available and keep fetched-HTML fallback claims narrower; use browser tooling or manual testing when the issue depends on client-side state, focus management, or screenshots.

## Output

Return a concrete, priority-ordered review.
