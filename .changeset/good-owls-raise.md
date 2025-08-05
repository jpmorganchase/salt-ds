---
"@salt-ds/theme": minor
---

Update `--salt-selectable-borderColor-readonly` to fix contrast issues.

```diff
- --salt-selectable-borderColor-readonly: var(--salt-palette-interact-border-readonly);
+ --salt-selectable-borderColor-readonly: var(--salt-palette-interact-border);
```

```diff
- --salt-selectable-borderColor-readonly: var(--salt-palette-neutral-readonly);
+ --salt-selectable-borderColor-readonly: var(--salt-palette-neutral);
```
