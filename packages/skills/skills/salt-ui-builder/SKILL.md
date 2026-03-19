---
name: salt-ui-builder
description: build salt ui from requirements, rough descriptions, screenshots, mockups, image descriptions, or partial code. use when turning product requirements into a salt-first component, page, screen, or layout. return an implementation plan, chosen building blocks, assumptions, and starter code when appropriate.
---

# Salt UI Builder

Start from requirements and choose Salt primitives, patterns, foundations, and tokens before generating code. Prefer simple composition and ask only a small number of high-value clarifying questions when they materially affect the structure. Do not jump straight to code before choosing structure and primitives.

## Workflow

1. Inspect the requirements, screenshot, mockup, image description, or partial code before choosing Salt structure.
2. Load `references/build-workflow.md` and `references/gotchas.md`.
3. Load `references/clarifying-questions.md` only when missing information blocks a good Salt-first structure.
4. Use Salt MCP selectively:
   - `discover_salt` for broad starting points.
   - `choose_salt_solution` for component, pattern, foundation, or token decisions.
   - `get_salt_entity` for canonical details.
   - `get_salt_examples` for examples and nearby variants.
   - `analyze_salt_code` when refining existing partial code.
5. When partial code already exists, prefer refining it toward cleaner Salt usage instead of rebuilding from scratch unless the structure is fundamentally wrong.
6. Write the response with `references/output-template.md`.

## Output

Return a short implementation plan, chosen Salt building blocks, assumptions, and starter code when appropriate. Keep the plan brief and the code aligned to the chosen Salt structure.
