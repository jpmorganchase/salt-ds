---
name: salt-ui-builder
description: build salt ui from requirements, rough descriptions, screenshots, mockups, image descriptions, or partial code. use when turning product requirements into a salt-first component, page, screen, or layout. return an implementation plan, chosen building blocks, assumptions, and starter code when appropriate.
---

# Salt UI Builder

Assume the user is working in an application repo that consumes Salt, not in the Salt monorepo itself. Start from requirements and choose Salt primitives, patterns, foundations, and tokens before generating code. Ask only a small number of high-value clarifying questions, and rule out standard Salt options before proposing custom UI or abstractions. Keep the detailed workflow, gotchas, and output shape in the referenced files.

## When To Use

- building a new Salt-first component, page, screen, panel, or layout from requirements, screenshots, mockups, or image descriptions
- translating non-Salt UI or a foreign component library into Salt before implementation
- refining partial Salt code toward a cleaner, more canonical structure
- do not use this for pure code review or Salt version-to-version migration work

## Required Workflow

Follow these steps in order.

1. Inspect the requirements, screenshot, mockup, image description, or partial code before choosing Salt structure.
2. Treat greenfield UI requests and UI-fix requests as Salt UI tasks by default when they touch dashboards, metric cards, navigation, app shells, tabs, toolbars, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.
3. For Salt UI tasks, do not finish with generic React/CSS output if a canonical Salt option exists.
4. Load `references/build-workflow.md`, `references/gotchas.md`, and `references/output-template.md`.
5. Load `references/clarifying-questions.md` only when missing information blocks a good Salt-first structure.
6. Load `../../references/project-conventions.md` only when the consumer repo has wrappers, patterns, or shells that could change the final answer, or when `guidance_boundary.project_conventions.check_recommended` is `true`.
7. Load `../../references/canonical-salt-tool-surfaces.md` and follow it for choosing between Salt MCP, CLI fallback, source-level validation, and runtime evidence.
8. Complete the workflow in this order before you consider the task complete:
   - canonical Salt selection first:
     - start from translation when the input begins as non-Salt UI, a foreign component library, or a rough interface that must be mapped into Salt
     - start from recommendation or discovery when the input is already Salt-shaped but the right structure is still unclear
   - entity grounding before finalizing JSX, composition, or CSS decisions
   - apply project conventions only after the canonical Salt step when the boundary says they matter
   - validate the first scaffold or refined code before treating the work as done
   - if MCP is unavailable, start from `salt-ds info --json` and keep the same workflow through the Salt CLI rather than changing the consumer-facing story
9. After the first scaffold or implementation pass, request runtime evidence only when source reasoning and validation are still not enough:
   - use cheap URL fetch or fetched HTML when title, status, coarse structure, or obvious landmarks are enough
   - run `salt-ds doctor` when it is unclear whether there is a usable Storybook or app runtime target
   - run `salt-ds review <changed-path> --url <url>` when source validation and runtime evidence both matter in the same pass
   - run `salt-ds runtime inspect <url>` only when the task is explicitly runtime debugging or support work
   - prefer browser-session evidence when available
   - if runtime inspection falls back to `fetched-html`, keep claims limited to title, status, landmarks, and coarse structure
   - treat layout-debug details as advanced evidence only
10. If no standard Salt option fits cleanly, state which Salt directions were checked and why the remaining custom composition is justified in the consumer repo.
11. When partial code already exists, prefer refining it toward cleaner Salt usage instead of rebuilding from scratch unless the structure is fundamentally wrong.
12. Write the response with `references/output-template.md`.

## Examples

- "Turn this product brief and wireframe into a Salt page scaffold with recommended primitives and starter code."
- "Build a dashboard with metric cards and filters, but keep it Salt-first instead of using generic dashboard markup."
- "Translate this external UI toolbar and filter row into Salt and tell me what should be scaffolded first."
- "Fix the navigation centering on this Salt screen and keep the answer grounded in Salt structure instead of one-off CSS guessing."
- "Simplify this partial Salt form so it uses cleaner primitives and quieter defaults."
- "Build this Salt screen, then inspect the running URL before you finalize the scaffold if the rendered structure is still unclear."

## Common Edge Cases

- If translation returns low-confidence clarifying questions, resolve only the questions that block the highest-risk region.
- If the repo has approved wrappers or shells, check project conventions only when they materially change the final structure.
- If no standard Salt option fits, explain which canonical directions were checked and keep any custom composition narrow.
- If the input is partial, make the assumptions explicit instead of inventing speculative structure.
- If runtime evidence is needed, use browser-session evidence when available and keep fetched-HTML fallback claims narrower; use browser tooling or manual testing when the issue depends on client-side state, focus management, or screenshots.

## Output

Return a brief Salt-first implementation response. For non-Salt inputs, start with a short translation checkpoint, then show the scaffold handoff before the implementation plan.
