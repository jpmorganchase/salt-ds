---
"@salt-ds/ag-grid-theme": minor
"@salt-ds/core": minor
"@salt-ds/data-grid": minor
"@salt-ds/icons": minor
"@salt-ds/lab": minor
"@salt-ds/theme": minor
---

Deprecated text foreground tokens; replaced with the same tokens with `foreground` key removed

```diff
+ --salt-text-primary: var(--salt-palette-neutral-primary-foreground);
+ --salt-text-primary-disabled: var(--salt-palette-neutral-primary-foreground-disabled);
+ --salt-text-secondary: var(--salt-palette-neutral-secondary-foreground);
+ --salt-text-secondary-disabled: var(--salt-palette-neutral-secondary-foreground-disabled);
+ --salt-text-highlight: var(--salt-palette-interact-background-active);
+ --salt-text-link-hover: var(--salt-palette-navigate-foreground-hover);
+ --salt-text-link-active: var(--salt-palette-navigate-foreground-active);
+ --salt-text-link-visited: var(--salt-palette-navigate-foreground-visited);
```

`--salt-text-primary` replaced `--salt-text-primary-foreground`
`--salt-text-primary-disabled` replaced `--salt-text-primary-foreground-disabled`
`--salt-text-secondary` replaced `--salt-text-secondary-foreground`
`--salt-text-secondary-disabled` replaced `--salt-text-secondary-foreground-disabled`
`--salt-text-highlight` replaced `--salt-text-background-selected`
`--salt-text-link-visited` replaced `--salt-text-link-foreground-visited`
`--salt-text-link-hover` replaced `--salt-text-link-foreground-hover`
`--salt-text-link-active` replaced `--salt-text-link-foreground-active`
