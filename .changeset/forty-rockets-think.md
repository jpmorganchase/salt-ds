---
"@salt-ds/theme": minor
---

Added separable foreground and background tokens:

`separable-next.css`:

```diff
+  --salt-separable-borderStyle: solid;
+  --salt-separable-foreground: var(--salt-palette-foreground-primary);
+  --salt-separable-foreground-hover: var(--salt-palette-foreground-primary);
+  --salt-separable-foreground-active: var(--salt-palette-foreground-primary-alt);
+  --salt-separable-background: var(--salt-palette-alpha-none);
+  --salt-separable-background-hover: var(--salt-palette-alpha-weak);
+  --salt-separable-background-active: var(--salt-palette-accent);
```

`separable.css`

```diff
+  --salt-separable-foreground: var(--salt-palette-neutral-primary-foreground);
+  --salt-separable-foreground-hover: var(--salt-palette-neutral-primary-foreground);
+  --salt-separable-foreground-active: var(--salt-palette-interact-cta-foreground);
+  --salt-separable-background: var(--salt-palette-alpha-none);
+  --salt-separable-background-hover: var(--salt-palette-alpha-weak);
+  --salt-separable-background-active: var(--salt-palette-accent);
```
