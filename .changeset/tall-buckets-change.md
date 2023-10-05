---
"@salt-ds/theme": minor
---

- New tokens added for `text` characteristics

```diff
+ --salt-text-notation-fontWeight-small: var(--salt-typography-fontWeight-regular);
+ --salt-text-notation-fontWeight-strong: var(--salt-typography-fontWeight-bold);
```

- New token added for `size` foundations

```diff
+ --salt-size-bar-small: 2px;
```

- Deprecated all tokens in `taggable` characteristics

```diff
-  --salt-taggable-cursor-hover: pointer;
-  --salt-taggable-cursor-active: pointer;
-  --salt-taggable-cursor-disabled: not-allowed;

-  --salt-taggable-background: var(--salt-palette-interact-primary-background);
-  --salt-taggable-background-hover: var(--salt-palette-interact-primary-background-hover);
-  --salt-taggable-background-active: var(--salt-palette-interact-primary-background-active);
-  --salt-taggable-background-disabled: var(--salt-palette-interact-primary-background-disabled);

-  --salt-taggable-foreground: var(--salt-palette-interact-primary-foreground);
-  --salt-taggable-foreground-hover: var(--salt-palette-interact-primary-foreground-hover);
-  --salt-taggable-foreground-active: var(--salt-palette-interact-primary-foreground-active);
-  --salt-taggable-foreground-disabled: var(--salt-palette-interact-primary-foreground-disabled);
```

- Updated `taggable` characteristics tokens used in `@salt-ds/lab` Pill component to use `actionable` characteristics tokens
