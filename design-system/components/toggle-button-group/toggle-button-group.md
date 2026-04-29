# Toggle Button Group

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggle-button-group
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--horizontal
- SOURCE_GAP: dedicated docs under `site/docs/components/toggle-button-group/*` return 404
- SOURCE_GAP: Storybook ID `core-toggle-button-group--default` does not resolve

## When to use

- To make a single selection from mutually exclusive, high-priority options.
- To keep all key options visible at once with strong pressed-state affordance.
- When grouped choices should share orientation, sentiment, and appearance.

## When not to use

- For binary on/off controls; use `Switch`.
- For lower-priority form options; use `RadioButtonGroup`.
- When options need not remain visible; consider `Dropdown`.

## Decision trees

### When to use this component vs alternatives
- Use `ToggleButtonGroup` for visible, mutually exclusive command/value selection.
- Use `Switch` for a single feature-state toggle.
- Use `RadioButtonGroup` for standard form data-entry choice sets.
- Use `Dropdown` when space is constrained or options are numerous.

### When to use each variant/state
- Use uncontrolled mode (`defaultValue`) for local UI state.
- Use controlled mode (`value` + `onChange`) when state sync with app logic is required.
- Use `readOnly` when users must perceive current selection but cannot edit.
- Use `disabled` when the entire control is unavailable.

### Layout and styling decisions
- Keep horizontal orientation for compact toolbars and short labels.
- Use vertical orientation for stacked layouts or long labels.
- Set `appearance` at group level for consistency across options.
- Group-level sentiment is recommended; mix per-button sentiment only when semantics differ intentionally.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Group contains two or more functionally related options
- [ ] Group has an accessible label (`aria-label` or `aria-labelledby`) when needed
- [ ] Icon-only options include button-level `aria-label` and `aria-hidden` decorative icons
- [ ] Read-only vs disabled behavior matches intended focus/perception requirements

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggle-button-group
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggle-button-group/ToggleButtonGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggle-button-group/ToggleButtonGroup.css
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggle-button-group/ToggleButtonGroupContext.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/toggle-button-group/toggle-button-group.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--horizontal
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--horizontal-icon-only
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--horizontal-text-only
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--vertical
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--vertical-icon-only
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--vertical-text-only
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--bordered
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--controlled
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--read-only
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--read-only-and-selected
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--disabled-selected
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--sentiment
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button-group--mixed-sentiment

## Accessibility intent

- Use radiogroup semantics so assistive tech can announce single-select behavior.
- Ensure arrow-key navigation moves focus between enabled options with wrap behavior.
- Keep icon-only options labeled and decorative icons hidden from announcement.

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./toggle-button-group.md`
- Required behavior and constraints can be satisfied using props/states documented in `./toggle-button-group.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./toggle-button-group.json` |
| **Structure** | Always compose with child `ToggleButton` options (minimum two related options) |
| **State model** | Use `defaultValue` for uncontrolled usage; use `value` + `onChange` for controlled usage |
| **Interaction state** | Prefer `readOnly` when selection visibility matters; use `disabled` when interaction is unavailable |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./toggle-button-group.json` |

### Validation
- [ ] Generated usage aligns with `./toggle-button-group.md` "When to use"
- [ ] Generated usage avoids `./toggle-button-group.md` "When not to use"
- [ ] Required props and value types match `./toggle-button-group.json`
- [ ] Accessibility requirements from `./toggle-button-group.json` are satisfied