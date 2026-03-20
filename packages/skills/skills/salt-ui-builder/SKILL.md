---
name: salt-ui-builder
description: build salt ui from requirements, rough descriptions, screenshots, mockups, image descriptions, or partial code. use when turning product requirements into a salt-first component, page, screen, or layout. return an implementation plan, chosen building blocks, assumptions, and starter code when appropriate.
---

# Salt UI Builder

Start from requirements and choose Salt primitives, patterns, foundations, and tokens before generating code. Ask only a small number of high-value clarifying questions, and rule out standard Salt options before proposing custom UI or abstractions. Keep the detailed workflow, gotchas, and output shape in the referenced files.

## Workflow

1. Inspect the requirements, screenshot, mockup, image description, or partial code before choosing Salt structure.
2. Load `references/build-workflow.md`, `references/gotchas.md`, and `references/output-template.md`.
3. Load `references/clarifying-questions.md` only when missing information blocks a good Salt-first structure.
4. Use Salt MCP only where it changes the implementation direction:
   - `translate_ui_to_salt` first when the input starts from non-Salt UI code, a foreign component library, or a rough interface that needs to be mapped into Salt first.
   - Carry forward the `source_ui_model`, `implementation_plan`, `starter_code`, assumptions, and clarifying questions from that translation step before choosing JSX structure.
   - Treat Salt MCP output as canonical Salt guidance. If the result recommends a project conventions check, resolve repo-specific wrappers or local patterns before finalizing the implementation.
   - `discover_salt` or `choose_salt_solution` for structure and primitive decisions.
   - `get_salt_entity` and `get_salt_examples` for canonical details and examples.
   - `analyze_salt_code` when refining existing partial code.
5. If no standard Salt option fits cleanly, state which Salt directions were checked and why the remaining custom composition is justified.
6. When partial code already exists, prefer refining it toward cleaner Salt usage instead of rebuilding from scratch unless the structure is fundamentally wrong.
7. Write the response with `references/output-template.md`.

## Output

Return a brief Salt-first implementation response. For non-Salt inputs, start with a short translation checkpoint, then show the scaffold handoff before the implementation plan.
