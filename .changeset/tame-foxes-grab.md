---
"@salt-ds/theme": minor
---

Deprecated the following tokens:

```diff
- --salt-status-info-foreground-disabled
- --salt-status-success-foreground-disabled
- --salt-status-warning-foreground-disabled
- --salt-status-error-foreground-disabled
- --salt-status-static-foreground-disabled
- --salt-status-negative-foreground-disabled
- --salt-status-positive-foreground-disabled
- --salt-status-info-borderColor-disabled
- --salt-status-success-borderColor-disabled
- --salt-status-warning-borderColor-disabled
- --salt-status-error-borderColor-disabled
- --salt-palette-error-border-disabled
- --salt-palette-warning-border-disabled
- --salt-palette-success-border-disabled
- --salt-palette-info-border-disabled
- --salt-palette-error-foreground-disabled
- --salt-palette-success-foreground-disabled
- --salt-palette-info-foreground-disabled
```

Any components that have a validation state should not be able to simultaneously be disabled. Consider altering code if this is the case.
