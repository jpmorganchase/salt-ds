---
"@salt-ds/theme": patch
---

Updated content hover and active tokens so that they switch to Teal when using the Next theme.

```diff
-  --salt-content-foreground-hover: var(--salt-palette-foreground-hover);
-  --salt-content-foreground-active: var(--salt-palette-foreground-active);
+  --salt-content-foreground-hover: var(--salt-palette-accent-strong);
+  --salt-content-foreground-active: var(--salt-palette-accent-stronger);
```
