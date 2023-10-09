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

- Deprecated all tokens in `taggable` characteristics, there's no direct replacement tokens, use the values suggested below

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

Deprecated `--salt-taggable-cursor-hover`, use `pointer` instead
Deprecated `--salt-taggable-cursor-active`, use `pointer` instead
Deprecated `--salt-taggable-cursor-disabled`, use `not-allowed` instead

Deprecated `--salt-taggable-background`, use `--salt-palette-interact-primary-background` instead
Deprecated `--salt-taggable-background-hover`, use `--salt-palette-interact-primary-background-hover` instead
Deprecated `--salt-taggable-background-active`, use `--salt-palette-interact-primary-background-active` instead
Deprecated `--salt-taggable-background-disabled`, use `--salt-palette-interact-primary-background-disabled` instead

Deprecated `--salt-taggable-foreground`, use `--salt-palette-interact-primary-foreground` instead
Deprecated `--salt-taggable-foreground-hover`, use `--salt-palette-interact-primary-foreground-hover` instead
Deprecated `--salt-taggable-foreground-active`, use `--salt-palette-interact-primary-foreground-active` instead
Deprecated `--salt-taggable-foreground-disabled`, use `--salt-palette-interact-primary-foreground-disabled` instead
