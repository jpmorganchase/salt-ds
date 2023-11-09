---
"@salt-ds/theme": minor
---

**_Theming and CSS updates_** For teams customizing theme, the following tokens will be impacted. Update them as per suggestion.

### Characteristics

- New tokens added to `text` characteristics

```diff
+ --salt-text-notation-fontFamily: var(--salt-typography-fontFamily);
+ --salt-text-notation-fontWeight-small: var(--salt-typography-fontWeight-regular);
+ --salt-text-notation-fontWeight-strong: var(--salt-typography-fontWeight-bold);
```

- Deprecated tokens in characteristics, use replacement tokens as listed. The change is motivated by several factors including:
  - reduced number of tokens
  - easier theming experience
  - `text.css` updated to `content.css` as tokens are used on more than just texts i.e. icon
  - consolidating tokens into `text.css` to ensure all text-related tokens are within the same file, aside from text colors, they sit within `content.css`

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

- --salt-actionable-textAlign
+ --salt-text-action-textAlign

- --salt-text-link-foreground-hover
- --salt-text-link-foreground-active
- --salt-text-link-foreground-visited
+ --salt-content-foreground-hover
+ --salt-content-foreground-active
+ --salt-content-foreground-visited

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
+ --salt-content-primary-foreground
+ --salt-content-primary-foreground-disabled
+ --salt-content-secondary-foreground
+ --salt-content-secondary-foreground-disabled

- --salt-text-background-selected
+ --salt-content-foreground-highlight

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

- Deprecated tokens with no direct replacement tokens, use values suggested in comments

```diff
- --salt-taggable-cursor-hover /* Use `pointer` */
- --salt-taggable-cursor-active /* Use `pointer` */
- --salt-taggable-cursor-disabled /* Use `not-allowed` */

- --salt-taggable-background /* Use rgb(197, 201, 208) in light mode, rgb(76, 80, 91) in dark mode */
- --salt-taggable-background-hover /* Use rgb(217, 221, 227) in light mode, rgb(97, 101, 110) in dark mode */
- --salt-taggable-background-active /* Use --salt-palette-interact-primary-background-active Use rgb(97, 101, 110) in light mode, rgb(180, 183, 190) in dark mode */
- --salt-taggable-background-disabled /* Use --salt-palette-interact-primary-background-disabled Use rgba(197, 201, 208, 0.4) in light mode, rgba(76, 80, 91, 0.4) in dark mode */

- --salt-taggable-foreground /* Use rgb(255, 255, 255) */
- --salt-taggable-foreground-hover /* Use rgb(255, 255, 255) */
- --salt-taggable-foreground-active /* Use rgb(22, 22, 22) */
- --salt-taggable-foreground-disabled /* Use rgba(255, 255, 255, 0.4) */

- --salt-navigable-primary-background /* Use `transparent` */
- --salt-navigable-primary-background-active /* Use `transparent` */
- --salt-navigable-secondary-background /* Use `transparent` */
- --salt-navigable-secondary-background-hover /* Use rgb(76, 80, 91) in light mode, rgb(47, 49, 54) in dark mode */
- --salt-navigable-secondary-background-active /* Use `transparent` */
- --salt-navigable-tertiary-background /* Use `transparent` */
- --salt-navigable-tertiary-background-hover /* Use rgb(234, 237, 239) in light mode,  rgb(42, 44, 47) in dark mode */
- --salt-navigable-tertiary-background-active /* Use `transparent` */

- --salt-navigable-indicator-activeDisabled /* Use rgba(224, 101, 25, 0.4) in light mode, rgba(238, 133, 43, 0.4) in dark mode */

- --salt-accent-foreground-disabled /* Use rgba(255, 255, 255, 0.4) */
- --salt-accent-background-disabled /* Use rgba(38, 112, 169, 0.4) */
- --salt-accent-borderColor-disabled /* Use --salt-container-primary-borderColor-disabled */

- --salt-track-fontWeight /* Use --salt-typography-fontWeight-semiBold */
- --salt-track-textAlign /* Use `center` */

- --salt-track-background  /* Use rgb(197, 201, 208) in light mode, rgb(76, 80, 91); in dark mode */
- --salt-track-background-disabled /* Use  rgba(197, 201, 208,0.4) in light mode, rgba(76, 80, 91,0.4) in dark mode */

- --salt-track-borderColor-disabled /* Use rgba(132, 135, 142, 0.4) in both light and dark modes */

- --salt-selectable-cta-foreground-hover /* Use rgb(255, 255, 255) in both light and dark mode */
- --salt-selectable-cta-foreground-selected /* Use rgb(255, 255, 255) in both light and dark mode */
- --salt-selectable-cta-foreground-selectedDisabled /* Use rgba(255, 255, 255,0.4) in both light and dark mode  */

- --salt-selectable-cta-background /* Use `transparent` */
- --salt-selectable-cta-background-disabled /* Use `transparent` */
- --salt-selectable-cta-background-hover /* Use rgb(203, 231, 249) in light mode, rgb(39, 60, 77) in dark mode */
- --salt-selectable-cta-background-selected /* Use rgb(164, 213, 244) in light mode, rgb(0, 71, 123) in dark mode */
- --salt-selectable-cta-background-selectedDisabled /* Use  rgba(164, 213, 244,0.4) in light mode,rgba(0, 71, 123, 0.4) in dark mode */
- --salt-selectable-primary-foreground-hover /* Use rgb(38, 112, 169) in both light and dark mode */

```

### Foundations

- Updated `neutral` token value in `light` mode

```diff
- --salt-palette-neutral-backdrop: var(--salt-color-black-fade-backdrop)
+ --salt-palette-neutral-backdrop: var(--salt-color-white-fade-backdrop)
```

- New tokens added

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

- Deprecated tokens with no replacement tokens, use values suggested in comments

```diff
- --salt-shadow-0 /* Use `none` */
```

### Palette

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
