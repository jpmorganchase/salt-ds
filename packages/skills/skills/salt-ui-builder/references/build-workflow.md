# build workflow

## 1. normalize the input

- Identify the user goal, core actions, data density, states, and constraints.
- For screenshots or mockups, translate visible regions into Salt patterns before thinking about JSX.

## 2. choose the structure first

- Pick the page, panel, form, navigation, or content pattern that best matches the job.
- Prefer the most constrained primitive or pattern that can carry the interaction.
- Decide where foundations and tokens should handle spacing, density, typography, and color.

## 3. clarify only when it changes the structure

- Ask a small number of high-value questions when package choice, layout pattern, responsiveness, or interaction model is unclear.
- If the ambiguity does not block a good first implementation, state an assumption instead of stopping.

## 4. compose the ui

- Keep hierarchy shallow and responsibilities obvious.
- Let Salt primitives carry semantics and interaction behavior.
- Add custom styling only when Salt foundations or tokens do not already cover the need.

## 5. refine against the input

- Check that the structure, states, and affordances still match the requirement or mockup.
- If starting from partial code, simplify before adding more wrappers or overrides.

## 6. return the result

- Summarize the plan, list the chosen building blocks, surface assumptions, and include starter code when it will accelerate implementation.
