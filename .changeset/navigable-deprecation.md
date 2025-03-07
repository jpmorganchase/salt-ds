---
"@salt-ds/theme": minor
---

Added below foundation tokens.

```
--salt-typography-textDecoration-none: none;
--salt-typography-textDecoration-underline: underline;
```

Deprecated below navigable and text characteristics tokens, replace with new tokens below.

```
--salt-navigable-textDecoration: var(--salt-typography-textDecoration-underline);
--salt-navigable-textDecoration-hover: var(--salt-typography-textDecoration-none);
--salt-navigable-textDecoration-selected: var(--salt-typography-textDecoration-underline);

--salt-text-textDecoration: var(--salt-typography-textDecoration-none);
```
