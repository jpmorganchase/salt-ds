# File Drop Zone

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/file-drop-zone
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/file-drop-zone/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/file-drop-zone/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/file-drop-zone/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-file-drop-zone--default

## When to use

- To enable users to upload single or multiple files from a native file browser.
- To enable users to attach supporting files within form-driven flows.

## When not to use

- To display upload progress, file listing, and file management in one component.
- For advanced upload workflows that require queue management or retry controls; use `Dialog` as a starting point for a richer file interface.

## Accessibility intent

- Keyboard focus targets the `FileDropZoneTrigger` (“Browse files”) button.
- `Tab`/`Shift+Tab` follow normal tab order in and out of the drop zone.
- `Space`/`Enter` on the trigger opens the native file picker.
- Communicate acceptance criteria and validation outcomes in visible text.
- Keep disabled state non-interactive for drag/drop and trigger activation.

## Decision trees

### File Drop Zone vs richer upload UI
- Need only drag/drop + browse + validation messaging? → Use `FileDropZone`.
- Need file list, upload progress, retry, or item management? → Compose a fuller experience (for example with `Dialog`).

### Trigger and validation behavior
- Need to constrain selectable types in picker? → Set `accept` on `FileDropZoneTrigger`.
- Need real enforcement of file rules? → Validate files in `onDrop` / `onChange` handlers.
- Need multi-file selection? → Set `multiple` on `FileDropZoneTrigger`.

### Status and state handling
- No validation outcome yet? → Leave `status` undefined.
- Validation failed? → Set `status="error"` and show corrective message.
- Upload/validation succeeded? → Set `status="success"` and show confirmation.
- No interaction allowed? → Set `disabled` on both `FileDropZone` and `FileDropZoneTrigger`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `FileDropZoneTrigger` is present and discoverable
- [ ] `accept` is treated as picker guidance only; runtime validation is implemented in handlers
- [ ] Success/error feedback text is clear and actionable
- [ ] Disabled behavior blocks both drop and browse interactions
- [ ] Keyboard interactions (`Tab`, `Shift+Tab`, `Space`/`Enter`) behave as documented

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/file-drop-zone
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/file-drop-zone/FileDropZone.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/file-drop-zone/FileDropZoneTrigger.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/file-drop-zone/FileDropZoneIcon.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/file-drop-zone/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/file-drop-zone/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/file-drop-zone/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-file-drop-zone--default
- https://storybook.saltdesignsystem.com/?path=/story/core-file-drop-zone--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-file-drop-zone--with-file-type-validation
- https://storybook.saltdesignsystem.com/?path=/story/core-file-drop-zone--with-multiple-validations

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./file-drop-zone.md`
- Required behavior and constraints can be satisfied using props/states documented in `./file-drop-zone.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./file-drop-zone.json` |
| **Composition** | Compose `FileDropZone` with `FileDropZoneIcon`, instructional text, and `FileDropZoneTrigger` |
| **Validation** | Use `accept` as picker hint only; validate files in `onDrop`/`onChange` handlers |
| **Status** | Set `status` to `error` or `success` only when outcome is known |
| **Disabled** | Keep `disabled` in sync on `FileDropZone` and `FileDropZoneTrigger` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./file-drop-zone.json` |

### Validation
- [ ] Generated usage aligns with `./file-drop-zone.md` "When to use"
- [ ] Generated usage avoids `./file-drop-zone.md` "When not to use"
- [ ] Required props and value types match `./file-drop-zone.json`
- [ ] Accessibility requirements from `./file-drop-zone.json` are satisfied