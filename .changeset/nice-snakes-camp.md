---
"@salt-ds/core": minor
---

- Updated Button component CSS token values, visual changes expected. Font weight for CTA and Primary  variants changes from bold to semibold

```diff
- --button-fontWeight: var(--salt-actionable-cta-fontWeight);
- --button-fontWeight: var(--salt-actionable-primary-fontWeight);
- --button-fontWeight: var(--salt-actionable-secondary-fontWeight);
+ --button-fontWeight: var(--salt-text-action-fontWeight);
```

- Renamed Avatar component CSS token, no visual changes expected

```diff
- --salt-icon-size-base
+ --salt-size-icon
```

- Aligned Pill component CSS token names with figma, no visual changes expected

In `Pill.css`, these tokens have been renamed:

```diff
-  --pill-background: var(--saltPill-background, var(--salt-taggable-background));
-  --pill-background-active: var(--saltPill-background-active, var(--salt-taggable-background-active));
-  --pill-background-disabled: var(--saltPill-background-disabled, var(--salt-taggable-background-disabled));
-  --pill-background-hover: var(--saltPill-background-hover, var(--salt-taggable-background-hover));
+  --pill-background: var(--saltPill-background, var(--salt-actionable-primary-background));
+  --pill-background-active: var(--saltPill-background-active, var(--salt-actionable-primary-background-active));
+  --pill-background-disabled: var(--saltPill-background-disabled, var(--salt-actionable-primary-background-disabled));
+  --pill-background-hover: var(--saltPill-background-hover, var(--salt-actionable-primary-background-hover));

-  --pill-icon-color: var(--saltPill-icon-color, var(--salt-taggable-foreground));
-  --pill-icon-color-active: var(--saltPill-icon-color-active, var(--salt-taggable-foreground-active));
-  --pill-icon-color-hover: var(--saltPill-icon-color-hover, var(--salt-taggable-foreground-hover));
-  --pill-icon-color-disabled: var(--saltPill-icon-color-disabled, var(--salt-taggable-foreground-disabled));
-  --pill-text-color: var(--saltPill-text-color, var(--salt-taggable-foreground));
-  --pill-text-color-active: var(--saltPill-text-color-active, var(--salt-taggable-foreground-active));
-  --pill-text-color-hover: var(--saltPill-text-color-hover, var(--salt-taggable-foreground-hover));
-  --pill-text-color-disabled: var(--saltPill-text-color-disabled, var(--salt-taggable-foreground-disabled));
+  --pill-icon-color: var(--saltPill-icon-color, var(--salt-actionable-primary-foreground));
+  --pill-icon-color-active: var(--saltPill-icon-color-active, var(--salt-actionable-primary-foreground-active));
+  --pill-icon-color-hover: var(--saltPill-icon-color-hover, var(--salt-actionable-primary-foreground-hover));
+  --pill-icon-color-disabled: var(--saltPill-icon-color-disabled, var(--salt-actionable-primary-foreground-disabled));
+  --pill-text-color: var(--saltPill-text-color, var(--salt-actionable-primary-foreground));
+  --pill-text-color-active: var(--saltPill-text-color-active, var(--salt-actionable-primary-foreground-active));
+  --pill-text-color-hover: var(--saltPill-text-color-hover, var(--salt-actionable-primary-foreground-hover));
+  --pill-text-color-disabled: var(--saltPill-text-color-disabled, var(--salt-actionable-primary-foreground-disabled));

- --saltCheckbox-icon-tick-color: var(--salt-taggable-foreground-disabled);
+ --saltCheckbox-icon-tick-color: var(--salt-actionable-primary-foreground-disabled);

- --saltCheckbox-icon-tick-color: var(--salt-taggable-foreground-disabled);
+ --saltCheckbox-icon-tick-color: var(--salt-actionable-primary-foreground-disabled);
```

In `PillCheckbox.css`, this token has been renamed:

```diff
- --saltCheckbox-icon-tick-color: var(--salt-taggable-foreground);
+ --saltCheckbox-icon-tick-color: var(--salt-actionable-primary-foreground);
```

- Aligned Interactable Card component CSS token value with figma, visual changes expected. Disabled border color updated from blue to grey

```diff
- border-color: var(--saltCard-borderColor-disabled, var(--salt-accent-borderColor-disabled));
+ border-color: var(--saltCard-borderColor-disabled, var(--salt-container-primary-borderColor-disabled));

```
