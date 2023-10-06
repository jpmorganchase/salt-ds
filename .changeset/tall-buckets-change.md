---
"@salt-ds/theme": minor
---

- New tokens added to `text` characteristics

```diff
+ --salt-text-notation-fontWeight-small: var(--salt-typography-fontWeight-regular);
+ --salt-text-notation-fontWeight-strong: var(--salt-typography-fontWeight-bold);
```

- New token added to `size` foundations

```diff
+ --salt-size-bar-small: 2px;
```

- Deprecated all tokens in `taggable` characteristics, there's no direct replacement tokens.

```diff
-  --salt-taggable-cursor-hover
-  --salt-taggable-cursor-active
-  --salt-taggable-cursor-disabled

-  --salt-taggable-background
-  --salt-taggable-background-hover
-  --salt-taggable-background-active
-  --salt-taggable-background-disabled

-  --salt-taggable-foreground
-  --salt-taggable-foreground-hover
-  --salt-taggable-foreground-active
-  --salt-taggable-foreground-disabled
```
