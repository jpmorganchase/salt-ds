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

- obtain canonical Salt guidance through MCP or CLI before choosing components, patterns, props, tokens, or writing Salt-specific code
- if the user asks for a dashboard, page, screen, workspace, overview, or another multi-region surface, preserve that page-level wording in the first Salt create call instead of collapsing it into a single widget or sub-pattern
- choose one composition direction before writing code
- prefer Salt patterns and compositions before custom UI structure
- keep the first scaffold centered on the main task, not on optional embellishment
- for new Salt work, default to the shared default-new-work bootstrap described in `references/shared/theme.md` unless migration compatibility or repo policy explicitly requires the compatibility path
- when you use `SaltProviderNext` for default new work, include the full default-new-work bootstrap from `references/shared/theme.md` rather than naming the provider alone unless an explicit exception applies
- keep visual choices Salt-native; do not chase novelty outside the design system
- use workflow confidence to decide whether to proceed or ask a follow-up question
- verify any named Salt token, prop, or API against canonical Salt guidance before you put it in the plan or code
- if a broad `create` result returns `composition_contract.expected_patterns` or `composition_contract.expected_components`, treat those named items as required Salt follow-through before implementing the matching sub-surface
- do not implement named contract items from general React, CSS, HTML, or copied repo code before that Salt follow-through completes

## Stable Rule IDs

- `create-task-first`
  - state the user task before choosing components, wrappers, or embellishment
- `create-key-interaction-first`
  - make the primary interaction or decision point obvious before secondary details
- `create-choose-composition-direction`
  - commit to one Salt composition direction before writing code
- `create-canonical-before-custom`
  - resolve the nearest Salt pattern, component, or foundation before inventing custom structure
- `create-default-brand-theme-for-new-work`
  - use the default-new-work bootstrap from `references/shared/theme.md` by default for new Salt work unless compatibility or repo policy says otherwise
- `create-complete-brand-bootstrap`
  - when using `SaltProviderNext` for default new work, include the full bootstrap from `references/shared/theme.md` rather than naming the provider alone
- `create-apply-conventions-after-canonical`
  - apply wrappers and local policy only after the canonical Salt direction is clear
- `create-runtime-evidence-only-for-gaps`
  - use runtime evidence only when source-grounded create guidance still leaves important uncertainty
- `create-verify-named-salt-details`
  - verify named Salt tokens, props, and APIs against canonical Salt guidance before suggesting them

## Intent-First Loop

0. Obtain canonical Salt guidance via MCP (`create_salt_ui`) or CLI (`salt-ds create`) and do not proceed until it succeeds.
1. State the user task, preserving page-level nouns like dashboard, page, screen, workspace, or overview when the request is multi-region.
2. State the key interaction or decision point.
3. State the composition direction.
4. State the Salt pattern or component choice.
5. State whether the work should use the default-new-work bootstrap from `references/shared/theme.md` or an explicit compatibility exception.
6. Verify any explicit Salt token or API names you plan to mention.
7. If `composition_contract.expected_patterns` or `composition_contract.expected_components` are present, run targeted Salt follow-up for each unresolved named item before writing that part of the code.
8. Only then move into code or starter guidance.

## Ask Instead Of Guess

- more than one Salt pattern fits and the tradeoff affects the user flow
- the key interaction is unclear
- the repo policy could materially change the chosen component or wrapper
- confidence is low and the workflow output says more evidence is needed
