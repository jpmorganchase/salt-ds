---
"@salt-ds/lab": minor
---

- Focus trap behavior is no longer managed by Scrim. Props related to this behavior such as `autoFocusRef`, `disableAutoFocus`, `disableFocusTrap`, `disableReturnFocus`, `fallbackFocusRef`, `returnFocusOptions` an `tabEnabledSelectors`, have been removed.
- Removed `onBackDropClick` prop. Use `onClick` instead.
- Removed `closeWithEscape` and `onClose` props. You can handle this outside of the scrim.
- Removed `enableContainerMode` and `containerRef` props and added `fixed` prop. The default behavior is now for the scrim to fill its container, and you can use the `fixed` prop to fill the viewport.
- Removed `zIndex` prop. You can change the `zIndex` using CSS.
- Removed `ScrimContext`.