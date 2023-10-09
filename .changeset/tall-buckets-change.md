---
"@salt-ds/theme": minor
---

### Characteristics

- Deprecated tokens in characteristics, use replacement tokens as listed

```diff
- --salt-overlayable-shadow-borderRegion
+ --salt-overlayable-shadow-region

- --salt-actionable-primary-fontWeight
- --salt-actionable-secondary-fontWeight
- --salt-actionable-cta-fontWeight
+ --salt-text-action-fontWeight

- --salt-actionable-letterSpacing
+ --salt-text-action-letterSpacing

- --salt-actionable-textTransform
+ --salt-text-action-textTransform

- --salt-text-link-foreground-hover
- --salt-text-link-foreground-active
- --salt-text-link-foreground-visited
+ --salt-navigable-foreground-hover
+ --salt-navigable-foreground-active
+ --salt-navigable-foreground-visited

- --salt-text-link-textDecoration
- --salt-text-link-textDecoration-hover
- --salt-text-link-textDecoration-selected
+ --salt-navigable-textDecoration
+ --salt-navigable-textDecoration-hover
+ --salt-navigable-textDecoration-selected

- --salt-text-primary-foreground
- --salt-text-primary-foreground-disabled
- --salt-text-secondary-foreground
- --salt-text-secondary-foreground-disabled
+ --salt-foreground-primary
+ --salt-foreground-primary-disabled
+ --salt-foreground-secondary
+ --salt-foreground-secondary-disabled

- --salt-text-background-selected
+ --salt-foreground-text-highlight

- --salt-navigable-primary-background-hover
+ --salt-navigable-background-hover

- --salt-accent-fontWeight
- --salt-accent-fontSize
- --salt-accent-lineHeight
+ --salt-text-notation-fontWeight
+ --salt-text-notation-fontSize
+ --salt-text-notation-lineHeight: 10px; /* Value previously 11px */

- --salt-track-borderWidth
- --salt-track-borderWidth-active
- --salt-track-borderWidth-complete
- --salt-track-borderWidth-incomplete
+ --salt-size-border-strong

- --salt-track-borderColor
+ --salt-palette-neutral-secondary-border

- --salt-selectable-primary-foreground-selected
+ --salt-actionable-primary-foreground-active

- --salt-selectable-primary-foreground-selectedDisabled
+ --salt-color-white-fade-foreground

- --salt-selectable-primary-background
- --salt-selectable-primary-background-disabled
- --salt-selectable-primary-background-hover
- --salt-selectable-primary-background-selected
- --salt-selectable-primary-background-selectedDisabled
+ --salt-palette-interact-background
+ --salt-palette-interact-background-disabled
+ --salt-palette-interact-primary-background-hover
+ --salt-palette-interact-primary-background-active
+ --salt-palette-interact-primary-background-activeDisabled

- --salt-selectable-secondary-foreground-hover
- --salt-selectable-secondary-foreground-selected
- --salt-selectable-secondary-foreground-selectedDisabled
+ --salt-palette-interact-secondary-foreground-hover
+ --salt-palette-interact-secondary-foreground-active
+ --salt-palette-interact-secondary-foreground-activeDisabled

- --salt-selectable-secondary-background
- --salt-selectable-secondary-background-disabled
- --salt-selectable-secondary-background-hover
- --salt-selectable-secondary-background-selected
- --salt-selectable-secondary-background-selectedDisabled
+ --salt-palette-interact-background
+ --salt-palette-interact-background-disabled
+ --salt-palette-interact-secondary-background-hover
+ --salt-palette-interact-secondary-background-active
+ --salt-palette-interact-secondary-background-activeDisabled

```

- New tokens added to `text` characteristics

```diff
+ --salt-text-notation-fontWeight-small: var(--salt-typography-fontWeight-regular);
+ --salt-text-notation-fontWeight-strong: var(--salt-typography-fontWeight-bold);
```

- Deprecated tokens with no direct replacement tokens, use values suggested in comments

```diff
- --salt-taggable-cursor-hover /* Use `pointer` */
- --salt-taggable-cursor-active /* Use `pointer` */
- --salt-taggable-cursor-disabled /* Use `not-allowed` */

- --salt-taggable-background /* Use --salt-palette-interact-primary-background */
- --salt-taggable-background-hover /* Use --salt-palette-interact-primary-background-hover */
- --salt-taggable-background-active /* Use --salt-palette-interact-primary-background-active */
- --salt-taggable-background-disabled /* Use --salt-palette-interact-primary-background-disabled */

- --salt-taggable-foreground /* Use --salt-palette-interact-primary-foreground */
- --salt-taggable-foreground-hover /* Use --salt-palette-interact-primary-foreground-hover */
- --salt-taggable-foreground-active /* Use --salt-palette-interact-primary-foreground-active */
- --salt-taggable-foreground-disabled /* Use --salt-palette-interact-primary-foreground-disabled */

- --salt-navigable-primary-background /* Use `transparent` */
- --salt-navigable-primary-background-active /* Use `transparent` */
- --salt-navigable-secondary-background /* Use `transparent` */
- --salt-navigable-secondary-background-hover /* Use --salt-color-gray-30 in light mode, --salt-color-gray-600 in dark mode */
- --salt-navigable-secondary-background-active /* Use `transparent` */
- --salt-navigable-tertiary-background /* Use `transparent` */
- --salt-navigable-tertiary-background-hover /* Use --salt-color-gray-20 in light mode, --salt-color-gray-700 in dark mode */
- --salt-navigable-tertiary-background-active /* Use `transparent` */

- --salt-navigable-indicator-activeDisabled /* Use --salt-color-orange-600-fade-border in light mode, --salt-color-orange-400-fade-border in dark mode */

- --salt-accent-foreground-disabled /* Use --salt-palette-accent-foreground-disabled */
- --salt-accent-background-disabled /* Use --salt-palette-accent-background-disabled */
- --salt-accent-borderColor-disabled /* Use --salt-container-primary-borderColor-disabled */

- --salt-track-fontWeight /* Use --salt-typography-fontWeight-semiBold */
- --salt-track-textAlign /* Use `center` */

- --salt-track-background  /* Use --salt-color-gray-60 in light mode, --salt-color-gray-300 in dark mode */
- --salt-track-background-disabled /* Use --salt-color-gray-60-fade-background in light mode, --salt-color-gray-300-fade-background in dark mode */

- --salt-track-borderColor-disabled /* Use --salt-color-gray-90-fade-background in both light and dark modes */

- --salt-selectable-cta-foreground-hover /* Use
--salt-palette-interact-cta-foreground-hover */
- --salt-selectable-cta-foreground-selected /* Use --salt-palette-interact-cta-foreground-active */
- --salt-selectable-cta-foreground-selectedDisabled /* Use --salt-palette-interact-cta-foreground-activeDisabled */

- --salt-selectable-cta-background /* Use
--salt-palette-interact-backround */
- --salt-selectable-cta-background-disabled /* Use
--salt-palette-interact-backround-disabled */
- --salt-selectable-cta-background-hover /* Use
--salt-palette-interact-cta-background-hover */
- --salt-selectable-cta-background-selected /* Use --salt-palette-interact-cta-background-active */
- --salt-selectable-cta-background-selectedDisabled /* Use --salt-palette-interact-cta-background-activeDisabled */

- --salt-selectable-primary-foreground-hover /* Use
--salt-palette-interact-foreground-hover */

```

### Foundations

- Deprecated tokens in foundations, use replacement tokens as listed

```diff

- --salt-icon-size-base
- --salt-icon-size-status-adornment
+ --salt-size-icon
+ --salt-size-adornment

- --salt-shadow-1
- --salt-shadow-2
- --salt-shadow-3
- --salt-shadow-4
- --salt-shadow-5
+ --salt-shadow-100
+ --salt-shadow-200
+ --salt-shadow-300
+ --salt-shadow-400
+ --salt-shadow-500

- --salt-shadow-1-color
- --salt-shadow-2-color
- --salt-shadow-3-color
- --salt-shadow-4-color
- --salt-shadow-5-color
+ --salt-shadow-100-color
+ --salt-shadow-200-color
+ --salt-shadow-300-color
+ --salt-shadow-400-color
+ --salt-shadow-500-color

- --salt-palette-navigate-primary-background-hover (light mode)
+ --salt-palette-navigate-background-hover: var(--salt-color-black-fade-background-hover)
- --salt-palette-navigate-primary-background-hover (dark mode)
+ --salt-palette-navigate-background-hover: var(--salt-color-white-fade-background-hover)

```

- Updated `neutral` token value in `light` mode

```diff
- --salt-palette-neutral-backdrop: var(--salt-color-black-fade-backdrop)
+ --salt-palette-neutral-backdrop: var(--salt-color-white-fade-backdrop)
```

- New token added

In `size.css` foundations,

```diff
+ --salt-size-bar-small: 2px; /* for all densities */
+ --salt-size-border-strong: 2px /* for all densities */
+ --salt-size-bar-strong
```

In `fade.css` foundations,

```diff
+ --salt-color-black-fade-background-hover: rgba(0, 0, 0, var(--salt-opacity-8))
+ --salt-color-white-fade-background-hover: rgba(255, 255, 255, var(--salt-opacity-8))
```

- Deprecated tokens with no replacement tokens, use values suggested in comments

```diff
- --salt-shadow-0 /* Use `none` */
```

### Palette

- Deprecated tokens in palette, use replacement tokens as listed

- Deprecated tokens with no replacement tokens, use values suggested in comments

```diff
- --salt-palette-navigate-primary-background /* Use `transparent` */
- --salt-palette-navigate-primary-background-active /* Use `transparent` */
- --salt-palette-navigate-secondary-background /* Use `transparent` */
- --salt-palette-navigate-secondary-background-hover /* Use --salt-color-gray-30 in light mode, --salt-color-gray-600 in dark mode */
- --salt-palette-navigate-secondary-background-active /* Use `transparent` */
- --salt-palette-navigate-tertiary-background /* Use `transparent` */
- --salt-palette-navigate-tertiary-background-hover /* Use --salt-color-gray-20 in light mode, --salt-color-gray-700 in dark mode */
- --salt-palette-navigate-tertiary-background-active /* Use `transparent` */

- --salt-palette-navigate-indicator-activeDisabled /* Use --salt-color-orange-600-fade-border in light mode, --salt-color-orange-400-fade-border in dark mode */

- --salt-palette-neutral-tertiary-background /* Use `transparent` */
- --salt-palette-neutral-tertiary-background-disabled /* Use `transparent` */
- --salt-palette-neutral-tertiary-border /* Use `transparent` */
- --salt-palette-neutral-tertiary-border-disabled /* Use `transparent` */

- --salt-palette-track-border /* Use --salt-color-gray-90 */
- --salt-palette-track-border-disabled /* Use --salt-color-gray-90-fade-border */

- --salt-palette-track-background /* Use --salt-color-gray-60 in light mode, --salt-color-gray-300 in dark mode */
- --salt-palette-track-background-disabled /* Use --salt-color-gray-60-fade-border in light mode, --salt-color-gray-300-fade-border in dark mode */

- --salt-palette-interact-cta-foreground-activeDisabled /* Use --salt-color-white-fade-foreground */
- --salt-palette-interact-cta-background-activeDisabled /* Use --salt-color-blue-700-fade-background */

- --salt-palette-interact-primary-foreground-activeDisabled /* Use --salt-color-white-fade-foreground in light mode, --salt-color-gray-900-fade-foreground in dark mode */
- --salt-palette-interact-primary-background-activeDisabled /* Use --salt-color-gray-200-fade-background in light mode, --salt-color-gray-70-fade-background in dark mode */

- --salt-palette-interact-secondary-foreground-activeDisabled /* Use --salt-color-white-fade-foreground in light mode, --salt-color-gray-900-fade-foreground in dark mode */
- --salt-palette-interact-secondary-background-activeDisabled /* Use --salt-color-gray-200-fade-background in light mode, --salt-color-gray-70-fade-background in dark mode */

- --salt-palette-accent-foreground-disabled /* Use --salt-color-white-fade-foreground */
- --salt-palette-accent-background-disabled /* Use --salt-color-blue-500-fade-background */
- --salt-palette-accent-border-disabled /* Use --salt-color-blue-500-fade-border */
```
