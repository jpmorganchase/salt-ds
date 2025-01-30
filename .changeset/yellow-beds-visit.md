---
"@salt-ds/theme": minor
---

The Alpha palette has been added to the current theme. Previously it was only in theme-next.

```diff
+ --salt-palette-alpha: var(--salt-color-black-30a);
+ --salt-palette-alpha-strong: var(--salt-color-black-45a);
+ --salt-palette-alpha-weak: var(--salt-color-black-15a);
+ --salt-palette-alpha-weaker: var(--salt-color-black-10a);
+ --salt-palette-alpha-backdrop: var(--salt-color-white-70a);
+ --salt-palette-alpha-none: transparent;
```

```diff
+ --salt-palette-alpha: var(--salt-color-white-30a);
+ --salt-palette-alpha-strong: var(--salt-color-white-45a);
+ --salt-palette-alpha-weak: var(--salt-color-white-15a);
+ --salt-palette-alpha-weaker: var(--salt-color-white-10a);
+ --salt-palette-alpha-backdrop: var(--salt-color-black-70a);
+ --salt-palette-alpha-none: transparent;
```
