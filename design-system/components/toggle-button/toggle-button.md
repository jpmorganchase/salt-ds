# Toggle Button

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggle-button
- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggle-button-group
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--icon-only
- SOURCE_GAP: Storybook ID `core-toggle-button--default` does not resolve

## When to use

- To make a single selection when switching between opposing yet mutually exclusive options.
- To visually prioritize options more strongly than `RadioButton` or `Switch`.
- To present a compact set of related commands where one option should be active at a time (`ToggleButtonGroup`).

## When not to use

- For instantaneous binary on/off behavior; use `Switch`.
- When options are lower-priority form choices; use `RadioButtonGroup`.
- When options do not need to be visible at once; consider `Dropdown`.

## Decision trees

### When to use this component vs alternatives
- Use `ToggleButton`/`ToggleButtonGroup` when the choice needs high affordance and visible pressed state.
- Use `Switch` for simple binary feature state.
- Use `RadioButtonGroup` for standard form-choice inputs.
- Use `Dropdown` if many options or constrained space makes persistent options impractical.

### When to use each variant/state
- Use `selected/defaultSelected` to express current active choice.
- Use `readOnly` when users should perceive the current selection but not change it.
- Use `disabled` when control is unavailable and should not receive focus/action.
- Use `orientation="vertical"` for stacked option sets; keep horizontal for compact side-by-side choices.

### Group styling decisions
- Set `appearance` on `ToggleButtonGroup` for consistency; avoid mixing appearance per-item.
- Group-level `sentiment` is preferred; use per-button sentiment only when mixed semantics are intentional.
- Keep labels short (ideally 1–3 words, max 5) and avoid ampersands to compress text.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Icon-only buttons provide `aria-label`
- [ ] Icons in text+icon buttons are marked `aria-hidden`
- [ ] Group contains two or more related options
- [ ] Read-only vs disabled choice reflects whether selected state must remain perceivable

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggle-button
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/toggle-button-group
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggle-button/ToggleButton.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggle-button/ToggleButton.css
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggle-button-group/ToggleButtonGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/toggle-button-group/ToggleButtonGroup.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/toggle-button/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/toggle-button/toggle-button.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--icon-only
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--text-only
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--text-and-icon
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--sentiment
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--bordered
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--controlled
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-toggle-button--default-selected

## Accessibility intent

- When a toggle button has both an icon and text, use aria-hidden on the icon so that screen readers don't announce its text.
- When a toggle button has icon only, provide `aria-label` describing the action/state.
- In groups, keyboard arrow keys should move focus between options with wrap behavior.

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./toggle-button.md`
- Required behavior and constraints can be satisfied using props/states documented in `./toggle-button.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./toggle-button.json` |
| **Selection model** | Use standalone `selected/defaultSelected` for single toggle; use group `value/defaultValue` + `onChange` for mutually exclusive sets |
| **Structure** | Prefer `ToggleButtonGroup` with two or more related options when choices are mutually exclusive |
| **State choice** | Use `readOnly` when current selection must remain perceivable; use `disabled` when control is unavailable |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./toggle-button.json` |

### Validation
- [ ] Generated usage aligns with `./toggle-button.md` "When to use"
- [ ] Generated usage avoids `./toggle-button.md` "When not to use"
- [ ] Required props and value types match `./toggle-button.json`
- [ ] Accessibility requirements from `./toggle-button.json` are satisfied