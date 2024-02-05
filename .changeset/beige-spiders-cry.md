---
"@salt-ds/theme": minor
---

Added `--salt-color-gray-40-fade-border`.

```diff
+  --salt-color-gray-40-fade-border: rgba(217, 221, 227, var(--salt-palette-opacity-disabled));
```

Updated the values of `--salt-palette-neutral-primary-border`, `--salt-palette-neutral-primary-border-disabled`, `--salt-palette-neutral-secondary-border` and `--salt-palette-neutral-secondary-border-disabled`.

New values in light mode:

```diff
- --salt-palette-neutral-primary-border: var(--salt-color-gray-60);
- --salt-palette-neutral-primary-border-disabled: var(--salt-color-gray-60-fade-border);
+ --salt-palette-neutral-primary-border: var(--salt-color-gray-40);
+ --salt-palette-neutral-primary-border-disabled: var(--salt-color-gray-40-fade-border);
```

```diff
- --salt-palette-neutral-secondary-border: var(--salt-color-gray-90);
- --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-90-fade-border);
+ --salt-palette-neutral-secondary-border: var(--salt-color-gray-40);
+ --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-40-fade-border);
```

New values in dark mode:

```diff
- --salt-palette-neutral-secondary-border: var(--salt-color-gray-90);
- --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-90-fade-border);
+ --salt-palette-neutral-secondary-border: var(--salt-color-gray-300);
+ --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-300-fade-border);
```
