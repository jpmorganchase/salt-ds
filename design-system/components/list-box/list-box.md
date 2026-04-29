# List Box

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/list-box
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/list-box/ListBox.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/option/Option.tsx
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/option/OptionGroup.tsx
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/list-box/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/list-box/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/list-box/accessibility.mdx
- Storybook:
  - https://storybook.saltdesignsystem.com/?path=/story/core-list-box--single-select
  - https://storybook.saltdesignsystem.com/?path=/story/core-list-box--multiselect
  - https://storybook.saltdesignsystem.com/?path=/story/core-list-box--grouped
- Stories source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/list-box/list-box.stories.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/list-box/ListBox.cy.tsx

## When to use

- To present a visible set of selectable options for onward actions, such as filtering data, assigning values, or choosing categories.
- When users benefit from seeing multiple options at once and comparing them before selecting.
- When single-select or multi-select behavior is needed without a collapsed trigger control.

## When not to use

- If list items are navigation destinations, use stacked `NavigationItem` patterns instead.
- If there are five options or fewer, prefer `RadioButtonGroup` for simpler scan-and-select behavior.
- If there are roughly five to 10 options and constant visibility is not required, prefer `Dropdown`.
- If there are more than 10 options and space is constrained, prefer `ComboBox` for filtering and reduced visual load.

## Accessibility intent

- `ListBox` uses listbox semantics and manages active descendant focus for options.
- Users should be able to operate selection fully with keyboard interaction.
- Option groups should have clear labels so grouped options are announced with context.

## Decision trees

### ListBox vs alternatives
- Need always-visible options with direct selection? → Use `ListBox`.
- Need compact closed control that opens on demand? → Use `Dropdown`.
- Need filtering/search for long option sets? → Use `ComboBox`.
- Need very short single-select set? → Use `RadioButtonGroup`.
- Need navigation rather than selection? → Use `NavigationItem` patterns.

### Selection model
- One value at a time? → Keep default single-select mode.
- Multiple values concurrently? → Set `multiselect`.
- Need controlled state from parent logic? → Use `selected` + `onSelectionChange`.
- Need uncontrolled initialization only? → Use `defaultSelected`.

### Option content
- Text-only options? → Use simple `Option` labels.
- Need richer visual context (for example metadata or secondary text)? → Use custom `Option` children with simple, left-aligned visuals.
- Need categorical structure? → Group related options with `OptionGroup label`.

## Validation checklist

- [ ] Usage matches "When to use" guidance
- [ ] Not used in a "When not to use" scenario
- [ ] Selection mode (`multiselect` vs single-select) matches requirements
- [ ] Controlled/uncontrolled props are not mixed incorrectly
- [ ] Every `Option` has a stable `value`
- [ ] Disabled options are intentional and not relied on for required actions
- [ ] Listbox has an accessible label (`aria-label` or `aria-labelledby`)
- [ ] Keyboard interactions (Arrow/Home/End/Page keys, Enter/Space, Tab flow) are preserved

## Primary references

- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/list-box/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/list-box/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/list-box/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/list-box/ListBox.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/option/Option.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/option/OptionGroup.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/list-box/list-box.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/list-box/ListBox.cy.tsx

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./list-box.md`
- Required behavior and constraints can be satisfied using props/states documented in `./list-box.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./list-box.json` |
| **Structure** | Render `ListBox` with `Option` children, optionally nested in `OptionGroup` |
| **Selection mode** | Default to single-select; set `multiselect` only when multi-selection is explicitly required |
| **State model** | Use either controlled (`selected` + `onSelectionChange`) or uncontrolled (`defaultSelected`) pattern consistently |
| **Accessibility** | Always provide accessible labeling and preserve listbox keyboard semantics |
| **Option content** | Keep option content concise; if adding visuals, place support visuals before text and keep labels readable |

### Validation
- [ ] Generated usage aligns with `./list-box.md` "When to use"
- [ ] Generated usage avoids `./list-box.md` "When not to use"
- [ ] Required props and value types match `./list-box.json`
- [ ] Accessibility requirements from `./list-box.json` are satisfied
