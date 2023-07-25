---
"@salt-ds/lab": patch
---

Drawer

- Replace `Scrim` with `FloatingFocusManager`
- Remove `disableScrim`, `disableAnimations` and `scrimProps` props
- Rename prop `isOpen` to `open` and add `onOpenChange` prop to allow component to be dismissed when clicking outside or pressing `Esc`
