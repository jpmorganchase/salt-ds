---
name: salt-ui-reviewer
description: review, critique, fix, simplify, modernize, or check salt-based react ui, jsx, composition, styling, accessibility, and design-system alignment. use when inspecting existing salt ui code or a described interface. return a structured, priority-ordered review.
---

# Salt UI Reviewer

Review the actual code or described UI before reaching conclusions. Prefer the most constrained Salt primitive or pattern that satisfies the need, and verify major replacement recommendations against canonical Salt guidance. Keep the detailed rubric, gotchas, and response shape in the referenced files.

## Workflow

1. Inspect the code, jsx, styling, or ui description first before making design-system judgments.
2. Load `references/review-rubric.md`, `references/gotchas.md`, and `references/output-template.md`.
3. Use Salt MCP only where it clarifies the review:
   - `analyze_salt_code` for code-grounded validation and obvious fix opportunities.
   - `get_salt_entity`, `get_salt_examples`, or `choose_salt_solution` for canonical replacement guidance.
   - `compare_salt_versions` only for version or migration questions.
   - `discover_salt` only when the right starting point is unclear.
   - Treat Salt MCP output as canonical Salt guidance. If the repo has approved wrappers or local patterns, check separate project conventions or explicit repo guidance before treating a replacement suggestion as final.
4. Prioritize findings in this order:
   1. broken or risky ux and accessibility
   2. wrong primitive or pattern choice
   3. over-composition and structural complexity
   4. foundations drift such as spacing, sizing, density, or token misuse
   5. lower-level cleanup and polish
5. When recommending a replacement for custom UI or abstraction, state which Salt option should take its place and what canonical guidance supports that recommendation.
6. Write the review with `references/output-template.md`.

## Output

Return a concrete, priority-ordered review.
