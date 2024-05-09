---
"@salt-ds/core": minor
---

Added status color support to Text.

```tsx
    <Text color="info">This is info color of Text</Text>
    <Text color="error">This is error color of Text</Text>
    <Text color="warning">This is warning color of Text</Text>
    <Text color="success">This is success color of Text</Text>
```

- Checkbox will now have the correct border color on focus when it is in an error or warning state.
- Checkbox now uses `--salt-status-error-foreground-decorative` and `--salt-status-warning-foreground-decorative` instead of `--salt-status-error-foreground` and `--salt-status-warning-foreground`.
- RadioButton will now have the correct border color on focus when it is in an error or warning state.
- RadioButton now uses `--salt-status-error-foreground-decorative` and `--salt-status-warning-foreground-decorative` instead of `--salt-status-error-foreground` and `--salt-status-warning-foreground`.
- StatusAdornment now uses `--salt-status-error-foreground-decorative`, `--salt-status-warning-foreground-decorative` and `--salt-status-success-foreground-decorative` instead of `--salt-status-error-foreground`, `--salt-status-warning-foreground` and `--salt-status-success-foreground`.
- StatusIndicator now uses `--salt-status-info-foreground-decorative`, `--salt-status-error-foreground-decorative`, `--salt-status-warning-foreground-decorative` and `--salt-status-success-foreground-decorative` instead of `--salt-status-info-foreground`, `--salt-status-error-foreground`, `--salt-status-warning-foreground`, `--salt-status-success-foreground`.
