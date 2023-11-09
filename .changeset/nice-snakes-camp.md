---
"@salt-ds/core": minor
---

**_Theming and CSS updates_** with visual changes to Salt components:

1. Minor changes in `Button` component width. `CTA` and `Primary` button text font weight changed from bold to semibold. Expect components containing Salt `Button` to have similar change.

```diff
- --button-fontWeight: var(--salt-actionable-cta-fontWeight);
- --button-fontWeight: var(--salt-actionable-primary-fontWeight);
- --button-fontWeight: var(--salt-actionable-secondary-fontWeight);
+ --button-fontWeight: var(--salt-text-action-fontWeight);
```

<!-- INSERT IMAGE SHOWCASING DIFFERENCES HERE -->

2. Disabled `InteractableCard` component has border color updated from blue to grey.

```diff
- border-color: var(--saltCard-borderColor-disabled, var(--salt-accent-borderColor-disabled));
+ border-color: var(--saltCard-borderColor-disabled, var(--salt-container-primary-borderColor-disabled));

```

<!-- INSERT IMAGE SHOWCASING DIFFERENCES HERE -->

3. `Text` component has two new variants: `Action` and `Notation`. See [storybook](https://storybook.saltdesignsystem.com/?path=/story/core-text-text-qa--all-variants-grid) for more information.

```tsx
<Text styleAs="notation">Lorem ipsum</Text>
```

```tsx
<Notation>Lorem ipsum</Notation>
```

**_Theming and CSS updates_** with no visual change to Salt components, useful for teams overriding theme locally:

- `Avatar` component CSS token name updated

```diff
- --salt-icon-size-base
+ --salt-size-icon
```

- `Pill` component CSS token names updated

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
