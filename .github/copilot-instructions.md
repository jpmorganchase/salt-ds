# Salt Design System Instructions

This repository uses Salt Design System. Prefer Salt primitives, patterns, foundations, and tokens over ad hoc UI composition.

## General rules

- Use Salt MCP for canonical guidance when it is available.
- Prefer the most constrained Salt primitive or pattern that satisfies the need.
- Do not invent Salt APIs, props, or components.
- Prefer Salt foundations and tokens over raw spacing, sizing, typography, and color values.
- Prefer simpler hierarchy and quieter defaults over decorative styling or wrapper-heavy composition.

## When reviewing Salt UI

- Inspect the actual code or described UI before reaching conclusions.
- Prioritize findings in this order:
  1. broken or risky UX and accessibility
  2. wrong primitive or pattern choice
  3. over-composition and structural complexity
  4. foundations drift such as spacing, sizing, density, or token misuse
  5. lower-level cleanup and polish
- Do not bury major issues under a long list of minor comments.
- Valid API usage is not the same as good design-system usage.

## When building Salt UI

- Start from requirements and choose Salt structure before writing code.
- Ask only a small number of high-value clarifying questions when they materially change the structure.
- Prefer simple composition and shallow hierarchy.
- If partial code already exists, refine it toward cleaner Salt usage before rebuilding from scratch unless the structure is fundamentally wrong.

## When handling Salt migrations

- Identify the source version, target version, and affected package scope before suggesting changes.
- Prioritize breaking changes and deprecated usage before optional cleanup.
- Prefer canonical replacements over compatibility hacks.
- Distinguish required migration work from optional modernization.

## MCP usage guidance

- Use `discover_salt` for broad or ambiguous starting points.
- Use `choose_salt_solution` for component, pattern, foundation, or token selection and comparison.
- Use `get_salt_entity` for known or near-known canonical Salt guidance.
- Use `get_salt_examples` for implementation examples and nearby variants.
- Use `analyze_salt_code` for validation, deprecated usage, and obvious fix opportunities.
- Use `compare_salt_versions` only for upgrade and version-boundary questions.

## Response expectations

- For reviews, return a structured, priority-ordered assessment with the highest-impact findings first.
- For builds, return a short implementation plan, chosen Salt building blocks, assumptions, and starter code when appropriate.
- For migrations, return a migration summary, affected APIs or patterns, recommended actions, and risk notes.
