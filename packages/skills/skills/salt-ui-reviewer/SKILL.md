---
name: salt-ui-reviewer
description: review, critique, fix, simplify, modernize, or check salt-based react ui, jsx, composition, styling, accessibility, and design-system alignment. use when inspecting existing salt ui code or a described interface. return a structured, priority-ordered review.
---

# Salt UI Reviewer

Review the actual code or described UI before reaching conclusions. Prefer the most constrained Salt primitive or pattern that satisfies the need. Do not bury major issues under a long list of lower-impact comments.

## Workflow

1. Inspect the code, jsx, styling, or ui description first before making design-system judgments.
2. Load `references/review-rubric.md` and `references/gotchas.md`.
3. Use Salt MCP selectively:
    - `analyze_salt_code` for validation, deprecated usage, and obvious fix opportunities.
    - `get_salt_entity` for canonical Salt guidance.
    - `get_salt_examples` for better implementation examples or nearby variants.
    - `choose_salt_solution` when the current primitive or pattern seems questionable.
    - `compare_salt_versions` only for migration or version questions.
    - `discover_salt` only when the right starting point is unclear.
4. Prioritize findings in this order:
    1. broken or risky ux and accessibility
    2. wrong primitive or pattern choice
    3. over-composition and structural complexity
    4. foundations drift such as spacing, sizing, density, or token misuse
    5. lower-level cleanup and polish
5. Write the review using `references/output-template.md`.

## Output

Return a structured review with an overall assessment, highest-priority findings, quick wins, and suggested next checks. Keep the review concrete and prioritized.
