# Dialog

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dialog
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dialog/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dialog/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dialog/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-dialog--default

## When to use

- To notify users of critical information related to their current workflow that requires immediate action
- To intentionally interrupt the user’s flow for high-priority decisions or acknowledgment

## When not to use

- When interruption is unnecessary: use `Toast` for peripheral events or `Banner` for in-workflow information
- To launch one dialog from another dialog; prefer progressive disclosure in a single dialog

## Accessibility intent

- Provide an accessible name using a visible `DialogHeader` where possible; if no visible header is used, provide `aria-label`
- Focus is trapped while open and returns to the trigger element when the dialog closes
- Use `initialFocus` when you need deterministic first focus (index or element ref)
- For status dialogs requiring explicit acknowledgment, set `role="alertdialog"`
- Ensure keyboard support for Tab/Shift+Tab cycling, Escape to close, and Enter/Space on focused dialog actions
- When dialog content scrolls, keep `DialogContent` keyboard focusable so keyboard and screen-reader users can navigate overflow content

## Decision trees

### Dialog vs Banner vs Toast
- Need to interrupt the current task and require immediate acknowledgment/action? → Use `Dialog`
- Message relates to current workflow but should not interrupt task flow? → Use `Banner`
- Message is peripheral to the current workflow/event feed? → Use `Toast`

### `dialog` vs `alertdialog`
- Informational or standard confirm flow? → Use default `role="dialog"`
- Critical status that requires acknowledgment (`error`, `warning`, `success`, `info` alert patterns)? → Use `role="alertdialog"`

### Dismiss behavior
- User can click away to dismiss? → Default (`disableDismiss={false}`)
- User must complete/acknowledge an action in the dialog? → Set `disableDismiss={true}`

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] `open` and `onOpenChange` are wired to controlled state
- [ ] Close behavior is intentional (`disableDismiss` / `disableScrim`) for the workflow
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dialog
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dialog/Dialog.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dialog/DialogHeader.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dialog/DialogContent.tsx
- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/dialog/DialogActions.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dialog/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dialog/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/dialog/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-dialog--default
## Deprecation note

- `DialogCloseButton` is deprecated; use `actions` on `DialogHeader` instead

## Key variants

- **size**: `small`, `medium`, `large`
- **status**: `info`, `warning`, `error`, `success` (status icon + semantic styling)
- **disableDismiss**: prevents click-away dismiss for mandatory actions
- **disableScrim**: renders dialog without scrim
- **header actions**: use `DialogHeader actions` for close behavior

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./dialog.md`
- Required behavior and constraints can be satisfied using props/states documented in `./dialog.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./dialog.json` |
| **State model** | Use controlled state with `open` + `onOpenChange` |
| **Structure** | Compose with `DialogHeader`, `DialogContent`, and `DialogActions` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./dialog.json` |

### Validation
- [ ] Generated usage aligns with `./dialog.md` "When to use"
- [ ] Generated usage avoids `./dialog.md` "When not to use"
- [ ] Required props and value types match `./dialog.json`
- [ ] Accessibility requirements from `./dialog.json` are satisfied
- [ ] Uses `DialogHeader actions` for close control instead of deprecated `DialogCloseButton`