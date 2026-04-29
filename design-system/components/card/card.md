# Card

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/card
- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/interactable-card
- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/link-card
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/card/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/card/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/card/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-card-card--default
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--default
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-link-card--default

## When to use

- To group related information with the same visual hierarchy.
- To present a summary of a larger idea.
- Use `LinkCard` when the whole card should navigate.
- Use `InteractableCard` when the whole card should act as a button/selectable option, including grouped single- or multi-select behavior.

## When not to use

- To display sequential/ranked information; use `List` instead.
- As a standalone call to action; use `Button` instead.
- For decoration-only content with no information value.
- Don’t place actionable elements inside `LinkCard` or `InteractableCard` because the card itself is the interactive element.

## Decision trees

### Card vs LinkCard vs InteractableCard
- Need non-interactive container that may include nested actions (links/buttons) -> Use `Card`.
- Need entire card to navigate (`href`) -> Use `LinkCard`.
- Need entire card to activate/select like button/radio/checkbox -> Use `InteractableCard` (optionally inside `InteractableCardGroup`).

### Group selection behavior
- Need mutually exclusive selection -> `InteractableCardGroup` default (radio-like).
- Need independent multi-selection -> `InteractableCardGroup` with `multiSelect`.
- Need unavailable option -> Set `disabled` on card (and nested content styles as needed).

### Visual configuration
- Need hierarchy emphasis -> choose `variant` (`primary`, `secondary`, `tertiary`; plus `ghost` for `Card`).
- Need edge emphasis -> set `accent` (`top`, `right`, `bottom`, `left`) and keep placement consistent in card groups.

## Validation checklist

- [ ] Usage aligns with "When to use"
- [ ] Avoids all "When not to use" patterns
- [ ] Variant choice (`Card` vs `LinkCard` vs `InteractableCard`) matches interaction intent
- [ ] Interactive cards do not contain nested focusable controls
- [ ] `InteractableCardGroup` selection mode (`multiSelect` or default) matches behavior intent
- [ ] Accessibility naming and keyboard behavior are appropriate for the chosen variant

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./card.md`
- Required behavior and constraints can be satisfied using props/states documented in `./card.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./card.json` |
| **Variant** | `Card` for static grouping, `LinkCard` for navigation, `InteractableCard` for selectable/activatable container |
| **Grouping** | Use `InteractableCardGroup` for related selectable cards; set `multiSelect` only when additive selection is required |
| **Accessibility** | Apply role/keyboard/ARIA guidance from `./card.json` and this file |

### Validation
- [ ] Generated usage aligns with `./card.md` "When to use"
- [ ] Generated usage avoids `./card.md` "When not to use"
- [ ] Required props and value types match `./card.json`
- [ ] Accessibility requirements from `./card.json` are satisfied

## Accessibility intent

- Ensure each interactive card/link card has a clear accessible name via visible heading/text or explicit labeling.
- `InteractableCardGroup` provides checkbox/radio-like keyboard semantics; use it for grouped selection behavior.
- Keyboard behaviors follow upstream guidance: Tab/Shift+Tab navigation, Space selection in groups, Enter activation for `LinkCard` and standalone `InteractableCard`, and Arrow-key navigation for single-select groups.
- Maintain readable content and adequate contrast for card content against the card background.

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/card
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/card/Card.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/interactable-card
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/InteractableCard.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/interactable-card/InteractableCardGroup.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/link-card
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link-card/LinkCard.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/card/card.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/interactable-card/interactable-card.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/link-card/link-card.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/card/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/card/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/card/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-card-card--default
- https://storybook.saltdesignsystem.com/?path=/story/core-interactable-card--default
- https://storybook.saltdesignsystem.com/?path=/story/core-link-card--default