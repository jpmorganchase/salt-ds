# Number Input

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/number-input
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/number-input/NumberInput.tsx
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/number-input/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/number-input/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/number-input/accessibility.mdx
- Storybook:
  - https://storybook.saltdesignsystem.com/?path=/story/core-number-input--default
  - https://storybook.saltdesignsystem.com/?path=/story/core-number-input--min-and-max-value
  - https://storybook.saltdesignsystem.com/?path=/story/core-number-input--clamping
- Stories source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/number-input/number-input.stories.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/number-input/NumberInput.cy.tsx

## When to use

- For numeric values that need small, precise increment/decrement interactions.
- When values have clear numeric boundaries and users benefit from stepping controls.
- When immediate numeric feedback is useful as values change.

## When not to use

- For subjective/freeform text values; use `Input` or `MultilineInput`.
- For date/date-range selection; use `DateInput`.
- For selecting from large option lists; use `ComboBox`.
- For choosing one of a small set (about five to 10) of fixed options without filtering; use `Dropdown`.

## Accessibility intent

- Wrap in `FormField` for visible label, helper guidance, and validation feedback.
- Ensure range constraints and clamp behavior are communicated, especially when value is auto-adjusted.
- Use `onNumberChange` for committed numeric updates and announce important changes where needed.

## Decision trees

### NumberInput vs alternatives
- Need direct numeric typing + steppers? → Use `NumberInput`.
- Need arbitrary text input? → Use `Input`/`MultilineInput`.
- Need option selection rather than numeric entry? → Use `Dropdown`/`ComboBox`.

### Value model
- Uncontrolled initialization only? → Use `defaultValue`.
- Controlled behavior from parent state? → Use `value` + `onChange` and handle `onNumberChange` on commits.

### Range and precision
- Need soft range guidance only? → Set `min`/`max` and validate with helper/error messaging.
- Need enforced bounds on commit? → Add `clamp`.
- Need specific decimal precision with default parsing? → Set `decimalScale`.
- Need advanced formatting/parsing (e.g., compact notation, suffixes, international separators)? → Provide `format` + `parse` (+ `pattern`).

### Interaction tuning
- Faster keyboard jumps needed? → Adjust `stepMultiplier`.
- Buttons not appropriate in layout? → Use `hideButtons` and optional custom adornment buttons.
- Read-only display required? → Use `readOnly` and optional `emptyReadOnlyMarker`.

## Validation checklist

- [ ] Usage matches "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Controlled/uncontrolled pattern is used consistently
- [ ] `min`/`max`/`clamp` choices match business rules
- [ ] `onNumberChange` is handled for committed numeric state
- [ ] Custom `format` is paired with compatible `parse` (and `pattern` when needed)
- [ ] Text alignment choice is intentional for context
- [ ] Accessibility messaging covers range errors and clamped updates

## Primary references

- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/number-input/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/number-input/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/number-input/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/number-input/NumberInput.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/number-input/number-input.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/number-input/NumberInput.cy.tsx

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./number-input.md`
- Required behavior and constraints can be satisfied using props/states documented in `./number-input.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./number-input.json` |
| **State model** | Use controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) mode consistently |
| **Commit handling** | Use `onNumberChange` for stable parsed numeric updates (blur/increment/decrement) |
| **Range handling** | Use `min`/`max` for bounds; add `clamp` only when commit-time enforcement is required |
| **Formatting** | If custom `format` is used, provide compatible `parse` and usually `pattern` |
| **Accessibility** | Compose with `FormField`; announce clamped/range-important changes when necessary |

### Validation
- [ ] Generated usage aligns with `./number-input.md` "When to use"
- [ ] Generated usage avoids `./number-input.md` "When not to use"
- [ ] Required props and value types match `./number-input.json`
- [ ] Accessibility requirements from `./number-input.json` are satisfied
