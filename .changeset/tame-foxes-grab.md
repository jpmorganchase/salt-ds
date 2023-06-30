---
"@salt-ds/theme": minor
---

Deprecated the following tokens: Use hex value as replacement if needed.

```diff
- --salt-status-info-foreground-disabled: #2670A9B3
- --salt-status-success-foreground-disabled: #24874BB3
- --salt-status-warning-foreground-disabled: #EA7319B3
- --salt-status-error-foreground-disabled: #E32B16B3
- --salt-status-static-foreground-disabled: #61656E | #B4B7BE
- --salt-status-negative-foreground-disabled: #FF5942B3 | #A6150BB3
- --salt-status-positive-foreground-disabled: #3CAB60B3 | #0C5D2EB3
- --salt-status-info-borderColor-disabled: #2670A966
- --salt-status-success-borderColor-disabled: #24874B66
- --salt-status-warning-borderColor-disabled: #EA731966
- --salt-status-error-borderColor-disabled: #E32B1666
- --salt-palette-error-border-disabled: #E32B1666
- --salt-palette-warning-border-disabled: #EA731966
- --salt-palette-success-border-disabled: #24874B66
- --salt-palette-info-border-disabled: #2670A966
- --salt-palette-error-foreground-disabled: #E32B16B3
- --salt-palette-success-foreground-disabled: #24874BB3
- --salt-palette-info-foreground-disabled: #2670A9B3
```

Any components that have a validation state should not be able to simultaneously be disabled. Consider altering code if this is the case.
