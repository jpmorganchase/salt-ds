# Interactable Card

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/interactable-card
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/InteractableCard.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/InteractableCardGroup.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/interactable-card/InteractableCard.cy.tsx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--default
- SOURCE_GAP:
  - https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/interactable-card/usage.mdx
  - https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/interactable-card/examples.mdx
  - https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/interactable-card/accessibility.mdx

## When to use

- To make card content directly interactive as a standalone action surface.
- To present a set of options where each option is displayed as a card.
- To support single-select (radio-like) or multi-select (checkbox-like) card selection via `InteractableCardGroup`.

## When not to use

- For non-interactive informational containers; use `Card` instead.
- When options are simple text labels without rich content; use standard radio/checkbox controls.
- When navigation to a destination is primary intent; consider `LinkCard`.

## Accessibility intent

- Standalone `InteractableCard` behaves with button-like interaction.
- In `InteractableCardGroup`, cards use `radio` role for single-select and `checkbox` role for multi-select behavior.
- Group role is `radiogroup` in single-select mode and `group` in multi-select mode.
- Keyboard behavior is source-tested: Space toggles cards; Arrow keys navigate/select in single-select groups; Enter does not toggle in multi-select mode.

## Decision trees

### InteractableCard vs alternatives
- Need an interactive card surface? → Use `InteractableCard`.
- Need selectable cards with managed group behavior? → Use `InteractableCardGroup` + `InteractableCard`.
- Need non-interactive visual container only? → Use `Card`.

### Group selection model
- Only one option should be selected at a time? → Use default single-select group.
- Multiple options may be selected? → Set `multiSelect={true}` and use array-shaped values.
- External state controls selection? → Use controlled `value` + `onChange` on group.
- Internal state is sufficient? → Use `defaultValue` on group.

### Variant and styling choices
- Need standard interactive hierarchy? → Use `variant` (`primary`, `secondary`, `tertiary`).
- Need directional emphasis? → Set `accent` (`top`, `right`, `bottom`, `left`).
- Supporting legacy code only? → `accentPlacement` is deprecated; prefer `accent`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Group mode (single vs multi) matches business selection rules
- [ ] Controlled/uncontrolled group state pattern is used consistently
- [ ] Card `value` is set for selectable use cases
- [ ] Disabled behavior is verified for card and group contexts
- [ ] Keyboard interactions are preserved for target selection mode

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/interactable-card
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/InteractableCard.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/InteractableCardGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/useInteractableCard.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/InteractableCardGroupContext.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/interactable-card/InteractableCard.cy.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--default
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--accent-placement
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--variant
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--interactable-card-group-single-select
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--interactable-card-group-multi-select
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--interactable-card-group-radio
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--interactable-card-group-checkbox

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./interactable-card.md`
- Required behavior and constraints can be satisfied using props/states documented in `./interactable-card.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./interactable-card.json` |
| **Standalone action** | Use `InteractableCard` alone for button-like card activation |
| **Selection groups** | Use `InteractableCardGroup` when cards represent selectable options |
| **Selection model** | Use `multiSelect` only when multiple values are allowed |
| **State model** | Use controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) group state consistently |
| **Accessibility** | Keep role/keyboard behavior consistent with standalone vs grouped mode |
| **Deprecated prop** | Prefer `accent` over `accentPlacement` |

### Validation
- [ ] Generated usage aligns with `./interactable-card.md` "When to use"
- [ ] Generated usage avoids `./interactable-card.md` "When not to use"
- [ ] Required props and value types match `./interactable-card.json`
- [ ] Accessibility requirements from `./interactable-card.json` are satisfied
