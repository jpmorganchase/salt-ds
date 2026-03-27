# Create Rules

Use this file only for `create` work after project context is known.

## Priority Order

1. User task
   - State the task the UI must help the user complete.
   - Identify the key interaction that should feel obvious first.
2. Canonical Salt choice
   - Resolve the nearest Salt pattern, component, composition, or foundation before inventing custom structure.
   - Prefer existing Salt composition over ad hoc markup.
3. Repo conventions
   - Apply wrappers, banned choices, or local shells only after the canonical Salt direction is clear.
4. Evidence
   - Add runtime evidence only when source-grounded create guidance still leaves important uncertainty.

## Critical Rules

- choose one composition direction before writing code
- prefer Salt patterns and compositions before custom UI structure
- keep the first scaffold centered on the main task, not on optional embellishment
- keep visual choices Salt-native; do not chase novelty outside the design system
- use workflow confidence to decide whether to proceed or ask a follow-up question

## Stable Rule IDs

- `create-task-first`
  - state the user task before choosing components, wrappers, or embellishment
- `create-key-interaction-first`
  - make the primary interaction or decision point obvious before secondary details
- `create-choose-composition-direction`
  - commit to one Salt composition direction before writing code
- `create-canonical-before-custom`
  - resolve the nearest Salt pattern, component, or foundation before inventing custom structure
- `create-apply-conventions-after-canonical`
  - apply wrappers and local policy only after the canonical Salt direction is clear
- `create-runtime-evidence-only-for-gaps`
  - use runtime evidence only when source-grounded create guidance still leaves important uncertainty

## Intent-First Loop

1. State the user task.
2. State the key interaction or decision point.
3. State the composition direction.
4. State the Salt pattern or component choice.
5. Only then move into code or starter guidance.

## Ask Instead Of Guess

- more than one Salt pattern fits and the tradeoff affects the user flow
- the key interaction is unclear
- the repo policy could materially change the chosen component or wrapper
- confidence is low and the workflow output says more evidence is needed
