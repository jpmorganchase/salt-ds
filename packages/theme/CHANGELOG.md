# @salt-ds/theme

## 1.40.0

### Minor Changes

- c7079b6: Simplify the themes and deprecate the text palette.

  Deprecated tokens:

  - `--salt-palette-text-fontFamily`
  - `--salt-palette-text-fontFamily-heading`
  - `--salt-palette-text-fontFamily-code`
  - `--salt-palette-text-fontFamily-action`
  - `--salt-palette-text-action-fontWeight`
  - `--salt-palette-text-action-fontWeight-small`
  - `--salt-palette-text-action-fontWeight-strong`
  - `--salt-palette-text-display-fontWeight`
  - `--salt-palette-text-display-fontWeight-small`
  - `--salt-palette-text-display-fontWeight-strong`
  - `--salt-palette-text-heading-fontWeight`
  - `--salt-palette-text-heading-fontWeight-small`
  - `--salt-palette-text-heading-fontWeight-strong`
  - `--salt-palette-text-body-fontWeight`
  - `--salt-palette-text-body-fontWeight-small`
  - `--salt-palette-text-body-fontWeight-strong`
  - `--salt-palette-text-notation-fontWeight`
  - `--salt-palette-text-notation-fontWeight-small`
  - `--salt-palette-text-notation-fontWeight-strong`

  If you are using any of these tokens directly, the relevant typography foundation tokens should be used instead.

- a16cbc5: Added `--salt-sentiment-accent-dataviz`.

## 1.39.0

### Minor Changes

- 972e37e: Added mobile density tokens.
- 972e37e: Added a new layout characteristic to the theme. This also adds `--salt-layout-page-margin` for the margin around the main content area and `--salt-layout-gap` for gutters.

## 1.38.1

### Patch Changes

- c8affab: Updated `--salt-selectable-borderColor-hover` and `--salt-selectable-foreground-hover` to address color contrast issues.

## 1.38.0

### Minor Changes

- df46ef9: Added new categorical and sentiment data visualization tokens.

  ## Category

  - `--salt-category-1-dataviz`
  - `--salt-category-2-dataviz`
  - `--salt-category-3-dataviz`
  - `--salt-category-4-dataviz`
  - `--salt-category-5-dataviz`
  - `--salt-category-6-dataviz`
  - `--salt-category-7-dataviz`
  - `--salt-category-8-dataviz`
  - `--salt-category-9-dataviz`
  - `--salt-category-10-dataviz`
  - `--salt-category-11-dataviz`
  - `--salt-category-12-dataviz`
  - `--salt-category-13-dataviz`
  - `--salt-category-14-dataviz`
  - `--salt-category-15-dataviz`
  - `--salt-category-16-dataviz`
  - `--salt-category-17-dataviz`
  - `--salt-category-18-dataviz`
  - `--salt-category-19-dataviz`
  - `--salt-category-20-dataviz`

  ## Sentiment

  - `--salt-positive-dataviz`
  - `--salt-negative-dataviz`
  - `--salt-neutral-dataviz`
  - `--salt-caution-dataviz`

### Patch Changes

- afe9104: Renamed subtle category tokens to remove the "subtle" word from their names and deprecated the old tokens. For example,
  `--salt-category-1-subtle-foreground` is now `--salt-category-1-foreground`.

  This change improves consistency and clarity in the naming of category tokens.

## 1.37.0

### Minor Changes

- aae8a1b: Deprecated unused content tokens.

  | Deprecated token                      | Replacement token                       |
  | ------------------------------------- | --------------------------------------- |
  | `--salt-content-foreground-highlight` | `--salt-selectable-background-selected` |
  | `--salt-content-foreground-active`    | `--salt-content-accent-foreground`      |
  | `--salt-content-foreground-hover`     | `--salt-content-accent-foreground`      |

- 89779b5: Deprecated unused white foreground tokens:

  - `--salt-category-1-bold-foreground`
  - `--salt-category-2-bold-foreground`
  - `--salt-category-3-bold-foreground`
  - `--salt-category-4-bold-foreground`
  - `--salt-category-5-bold-foreground`
  - `--salt-category-6-bold-foreground`
  - `--salt-category-7-bold-foreground`
  - `--salt-category-8-bold-foreground`
  - `--salt-category-9-bold-foreground`
  - `--salt-category-10-bold-foreground`
  - `--salt-category-11-bold-foreground`
  - `--salt-category-12-bold-foreground`
  - `--salt-category-13-bold-foreground`
  - `--salt-category-14-bold-foreground`
  - `--salt-category-15-bold-foreground`
  - `--salt-category-16-bold-foreground`
  - `--salt-category-17-bold-foreground`
  - `--salt-category-18-bold-foreground`
  - `--salt-category-19-bold-foreground`
  - `--salt-category-20-bold-foreground`
  - `--salt-accent-foreground`

  All of these tokens can be replaced with `--salt-content-bold-foreground`.

- 448b1d8: Added the alpha dark ramp to the alpha palette in the next theme.

  - `--salt-palette-alpha-dark-highest`
  - `--salt-palette-alpha-dark-higher`
  - `--salt-palette-alpha-dark-high`
  - `--salt-palette-alpha-dark-mediumHigh`
  - `--salt-palette-alpha-dark-medium`
  - `--salt-palette-alpha-dark-mediumLow`
  - `--salt-palette-alpha-dark-low`
  - `--salt-palette-alpha-dark-lower`
  - `--salt-palette-alpha-dark-lowest`

- 448b1d8: - Updated actionable subtle hover border and actionable subtle active border tokens in all sentiments to be `--salt-palette-alpha-none`.
  - Updated actionable subtle background hover tokens in all sentiments to be `--salt-palette-alpha-lower`.
  - Updated actionable subtle background active tokens in all sentiments to be `--salt-palette-alpha-low`.
  - Updated actionable bold background hover tokens in all sentiments to be the default sentiment palette token with an alpha of `--salt-palette-alpha-dark-low` overlaid.
  - Updated actionable bold border hover tokens in all sentiments to be `--salt-palette-alpha-contrast-medium`.

## 1.36.0

### Minor Changes

- 54a18b5: Deprecated `--salt-separable-background` which is not used anywhere in the system. There is no replacement token.

## 1.35.0

### Minor Changes

- 764916b: Updated actionable tokens to address consumer feedback around the active and hover states of actionable components.
- 764916b: Deprecated action hover tokens:

  - `--salt-palette-warning-action-hover`
  - `--salt-palette-neutral-action-hover`
  - `--salt-palette-positive-action-hover`
  - `--salt-palette-accent-action-hover`

  Use the respective weaker tokens instead e.g. `--salt-palette-accent-action-hover` becomes `--salt-palette-accent-weakest`.

- 764916b: Deprecated unused neutral palette tokens:

  - `--salt-palette-neutral-weaker-disabled`
  - `--salt-palette-neutral-weaker-readonly`
  - `--salt-palette-neutral-weak-disabled`

- 764916b: Added strong tokens to positive, warning and negative palettes in the brand theme.

  ### Light

  ```css
  --salt-palette-positive-stronger: var(--salt-color-green-700);
  --salt-palette-warning-stronger: var(--salt-color-orange-700);
  --salt-palette-negative-stronger: var(--salt-color-red-700);
  ```

  ### Dark

  ```css
  --salt-palette-positive-stronger: var(--salt-color-green-300);
  --salt-palette-warning-stronger: var(--salt-color-orange-300);
  --salt-palette-negative-stronger: var(--salt-color-red-300);
  ```

- 764916b: Deprecated action active tokens:

  - `--salt-palette-warning-action-active`
  - `--salt-palette-neutral-action-active`
  - `--salt-palette-positive-action-active`
  - `--salt-palette-accent-action-active`

  Use the respective weaker tokens instead e.g. `--salt-palette-accent-action-active` becomes `--salt-palette-accent-weaker`.

### Patch Changes

- 764916b: Fixed the neutral palette so that it's aligned with the other palette token sets.

  ```diff
  .salt-theme.salt-theme-next[data-mode="light"]
  -  --salt-palette-neutral-weaker: var(--salt-color-gray-300);
  -  --salt-palette-neutral-weakest: var(--salt-color-gray-200);
  +  --salt-palette-neutral-weaker: var(--salt-color-gray-200);
  +  --salt-palette-neutral-weakest: var(--salt-color-gray-100);

  }

  .salt-theme.salt-theme-next[data-mode="dark"]
  -  --salt-palette-neutral-weaker: var(--salt-color-gray-700);
  -  --salt-palette-neutral-weakest: var(--salt-color-gray-800);
  +  --salt-palette-neutral-weaker: var(--salt-color-gray-800);
  +  --salt-palette-neutral-weakest: var(--salt-color-gray-900);
  }
  ```

## 1.34.0

### Minor Changes

- e9838b5: - Added `--salt-shadow-lowest`, `--salt-shadow-lower`, `--salt-shadow-low`, `--salt-shadow-mediumLow` and `--salt-shadow-medium`.

  - Deprecated `--salt-shadow-100`, `--salt-shadow-200`, `--salt-shadow-300`, `--salt-shadow-400` and `--salt-shadow-500`.
  - Deprecated `--salt-shadow-100-color`, `--salt-shadow-200-color`, `--salt-shadow-300-color`, `--salt-shadow-400-color` and `--salt-shadow-500-color`.

  | Deprecated token          | Replacement token         |
  | ------------------------- | ------------------------- |
  | `--salt-shadow-100`       | `--salt-shadow-lowest`    |
  | `--salt-shadow-200`       | `--salt-shadow-lower`     |
  | `--salt-shadow-300`       | `--salt-shadow-low`       |
  | `--salt-shadow-400`       | `--salt-shadow-mediumLow` |
  | `--salt-shadow-500`       | `--salt-shadow-medium`    |
  | `--salt-shadow-100-color` | None                      |
  | `--salt-shadow-200-color` | None                      |
  | `--salt-shadow-300-color` | None                      |
  | `--salt-shadow-400-color` | None                      |
  | `--salt-shadow-500-color` | None                      |

- e9838b5: - Added `--salt-typography-textDecoration-italic: italic`.
  - Deprecated `--salt-editable-help-fontStyle`. It has been replaced with `--salt-typography-textDecoration-italic`.

### Patch Changes

- e9838b5: Refactored the theme structure to help with future improvements.

## 1.33.0

### Minor Changes

- 9c74ceb: Added focus-ring styling to global.css. This ensures that any focus ring shown when focus-visible is true is styled using Salt tokens.

## 1.32.0

### Minor Changes

- 512b0e7: Fixed `-weak` suffix in palette and characteristic tokens for negative, positive, info, and warning, where `-weakest` should have been used.

  Deprecated the following `-weak` palette tokens and renamed to the correct:

  | Name                           | Replacement                       |
  | ------------------------------ | --------------------------------- |
  | `--salt-palette-positive-weak` | `--salt-palette-positive-weakest` |
  | `--salt-palette-negative-weak` | `--salt-palette-negative-weakest` |
  | `--salt-palette-warning-weak`  | `--salt-palette-warning-weakest`  |
  | `--salt-palette-info-weak`     | `--salt-palette-info-weakest`     |

- 64ef723: Update `--salt-selectable-borderColor-readonly` to fix contrast issues.

  ```diff
  - --salt-selectable-borderColor-readonly: var(--salt-palette-interact-border-readonly);
  + --salt-selectable-borderColor-readonly: var(--salt-palette-interact-border);
  ```

  ```diff
  - --salt-selectable-borderColor-readonly: var(--salt-palette-neutral-readonly);
  + --salt-selectable-borderColor-readonly: var(--salt-palette-neutral);
  ```

- 9277313: Added `--salt-color-orange-875`. This is needed for color contrast requirements for warning-background-selected.
- 9277313: Added status weaker tokens to the next theme:

  ### Light mode

  ```css
  --salt-palette-positive-weaker: var(--salt-color-green-200);
  --salt-palette-negative-weaker: var(--salt-color-red-200);
  --salt-palette-warning-weaker: var(--salt-color-orange-200);
  ```

  ### Dark mode

  ```css
  --salt-palette-positive-weaker: var(--salt-color-green-800);
  --salt-palette-negative-weaker: var(--salt-color-red-800);
  --salt-palette-warning-weaker: var(--salt-color-orange-800);
  ```

- 8538730: Removed global text selection background color override.
- 9277313: - Added `--salt-overlayable-background-hover` to replace `--salt-navigable-background-hover`.
  - Deprecated `--salt-navigable-background-hover`.

### Patch Changes

- 9277313: Updated the status background selected tokens in the legacy theme:

  - In light mode, background selected tokens have moved from their respective 20 colors to 30 to improve the visual distinction between default and selected states.
    - For example: `--salt-palette-error-background-selected` went from `--salt-color-red-20` to `--salt-color-red-30`.
  - In dark mode, background selected tokens have moved from their respective 900 color to 800 to provide a visual distinction between default and selected states. Except for warning which went from 900 to 875.
    - For example: `--salt-palette-error-background-selected` went from `--salt-color-red-900` to `--salt-color-red-800`.

- 9277313: Updated status background selected tokens to differentiate them from the status background tokens.

  ```diff
  - --salt-status-success-background-selected: var(--salt-palette-positive-weakest);
  - --salt-status-warning-background-selected: var(--salt-palette-warning-weakest);
  - --salt-status-error-background-selected: var(--salt-palette-negative-weakest);
  + --salt-status-success-background-selected: var(--salt-palette-positive-weaker);
  + --salt-status-warning-background-selected: var(--salt-palette-warning-weaker);
  + --salt-status-error-background-selected: var(--salt-palette-negative-weaker);
  ```

## 1.31.0

### Minor Changes

- 665c306: Added a new border style foundation. This allows us to consolidate 18 characteristic tokens in to 3 foundational tokens.

  ```diff
  + --salt-borderStyle-dashed
  + --salt-borderStyle-dotted
  + --salt-borderStyle-solid
  ```

  Deprecated the following `-borderStyle` characteristic tokens:

  | Name                                         | Replacement                 |
  | -------------------------------------------- | --------------------------- |
  | `--salt-container-borderStyle`               | `--salt-borderStyle-solid`  |
  | `--salt-editable-borderStyle`                | `--salt-borderStyle-solid`  |
  | `--salt-editable-borderStyle-hover `         | `--salt-borderStyle-solid`  |
  | `--salt-editable-borderStyle-active`         | `--salt-borderStyle-solid`  |
  | `--salt-editable-borderStyle-disabled`       | `--salt-borderStyle-solid`  |
  | `--salt-editable-borderStyle-readonly`       | `--salt-borderStyle-solid`  |
  | `--salt-selectable-borderStyle`              | `--salt-borderStyle-solid`  |
  | `--salt-selectable-borderStyle-hover`        | `--salt-borderStyle-solid`  |
  | `--salt-selectable-borderStyle-selected`     | `--salt-borderStyle-solid`  |
  | `--salt-selectable-borderStyle-blurSelected` | `--salt-borderStyle-solid`  |
  | `--salt-separable-borderStyle`               | `--salt-borderStyle-solid`  |
  | `--salt-target-borderStyle`                  | `--salt-borderStyle-dashed` |
  | `--salt-target-borderStyle-hover`            | `--salt-borderStyle-solid`  |
  | `--salt-target-borderStyle-disabled`         | `--salt-borderStyle-dashed` |
  | `--salt-track-borderStyle`                   | `--salt-borderStyle-solid`  |
  | `--salt-track-borderStyle-active`            | `--salt-borderStyle-solid`  |
  | `--salt-track-borderStyle-complete`          | `--salt-borderStyle-solid`  |
  | `--salt-track-borderStyle-incomplete`        | `--salt-borderStyle-dotted` |

- 9a4ff31: Added 2 new navigable tokens:

  - `--salt-navigable-accent-background-active`
  - `--salt-navigable-accent-borderColor-active`

  Undeprecated and updated `--salt-navigable-background-hover`.

- 5edb00f: Deprecated the `--salt-status-static-foreground` token.

  | Token                           | Replacement                         |
  | ------------------------------- | ----------------------------------- |
  | --salt-status-static-foreground | --salt-content-secondary-foreground |

- c86ee15: Deprecated `--salt-selectable-background-blurSelected` and `--salt-palette-interact-background-blurSelected`.
- 1a8898f: Deprecated 6 alpha foundation tokens.

  | Token                  |
  | ---------------------- |
  | --salt-color-black-60a |
  | --salt-color-black-70a |
  | --salt-color-black-90a |
  | --salt-color-white-60a |
  | --salt-color-white-70a |
  | --salt-color-white-90a |

- 5edb00f: Added sentiment characteristic.

  | Token                                            |
  | ------------------------------------------------ |
  | --salt-sentiment-negative-foreground-decorative  |
  | --salt-sentiment-negative-foreground-informative |
  | --salt-sentiment-positive-foreground-decorative  |
  | --salt-sentiment-positive-foreground-informative |
  | --salt-sentiment-neutral-track                   |
  | --salt-sentiment-neutral-track-disabled          |

  As part of this change, some tokens have been deprecated.

  | Token                             | Replacement                                     |
  | --------------------------------- | ----------------------------------------------- |
  | --salt-track-borderColor          | --salt-sentiment-neutral-track                  |
  | --salt-track-borderColor-disabled | --salt-sentiment-neutral-track-disabled         |
  | --salt-status-positive-foreground | --salt-sentiment-positive-foreground-decorative |
  | --salt-status-negative-foreground | --salt-sentiment-negative-foreground-decorative |

- 1a8898f: Updated the alpha palette to add a bias towards lower values of alpha. This change affects alpha and alpha contrast tokens.

  | Alpha level | Old alpha value | New alpha value |
  | ----------- | --------------- | --------------- |
  | Highest     | 90%             | 80%             |
  | Higher      | 80%             | 65%             |
  | High        | 70%             | 50%             |
  | Medium High | 60%             | 40%             |
  | Medium      | 50%             | 30%             |
  | Medium Low  | 40%             | 20%             |
  | Low         | 30%             | 15%             |
  | Lower       | 20%             | 10%             |
  | Lowest      | 10%             | 5%              |

  As part of this change, characteristics have been updated to use the new level that corresponds to their old value. For example:

  | Token                                   | Replacement                              |
  | --------------------------------------- | ---------------------------------------- |
  | --salt-palette-alpha-high               | --salt-palette-alpha-higher              |
  | --salt-palette-alpha-contrast-lowest    | --salt-palette-alpha-contrast-lower      |
  | --salt-palette-alpha-contrast-lower     | --salt-palette-alpha-contrast-mediumLow  |
  | --salt-palette-alpha-contrast-low       | --salt-palette-alpha-contrast-medium     |
  | --salt-palette-alpha-contrast-mediumLow | --salt-palette-alpha-contrast-mediumHigh |
  | --salt-palette-alpha-contrast-medium    | --salt-palette-alpha-contrast-high       |

- 9a4ff31: Deprecated `--salt-navigable-indicator-active`. It has been replaced by `--salt-navigable-accent-indicator-active`.
- 1a8898f: Added 6 alpha foundation tokens.

  | Token                  |
  | ---------------------- |
  | --salt-color-black-5a  |
  | --salt-color-black-15a |
  | --salt-color-black-65a |
  | --salt-color-white-5a  |
  | --salt-color-white-15a |
  | --salt-color-white-65a |

- 91f0e09: Deprecated navigable font weight tokens.

  | Name                                 | Replacement                     |
  | ------------------------------------ | ------------------------------- |
  | `--salt-navigable-fontWeight`        | `--salt-text-fontWeight`        |
  | `--salt-navigable-fontWeight-hover`  | `--salt-text-fontWeight`        |
  | `--salt-navigable-fontWeight-active` | `--salt-text-fontWeight-strong` |
  | `--salt-navigable-fontWeight-edit`   | `--salt-text-fontWeight`        |

- efb4fbc: Added an experimental brown ramp.

  ```css
  --salt-color-brown-100
  --salt-color-brown-200
  --salt-color-brown-300
  --salt-color-brown-400
  --salt-color-brown-500
  --salt-color-brown-600
  --salt-color-brown-700
  --salt-color-brown-800
  --salt-color-brown-900
  ```

### Patch Changes

- efb4fbc: Updated 4 foundational color tokens to address color contrast requirements:

  - `--salt-color-gray-100`
  - `--salt-color-teal-900`
  - `--salt-color-orange-400`
  - `--salt-color-orange-600`

## 1.30.0

### Minor Changes

- 621253b: Added new fixed size tokens.

  | Token                   | All densities (px) |
  | ----------------------- | ------------------ |
  | `--salt-size-fixed-100` | 1                  |
  | `--salt-size-fixed-200` | 2                  |
  | `--salt-size-fixed-300` | 3                  |
  | `--salt-size-fixed-400` | 4                  |
  | `--salt-size-fixed-500` | 5                  |
  | `--salt-size-fixed-600` | 6                  |
  | `--salt-size-fixed-700` | 7                  |
  | `--salt-size-fixed-800` | 8                  |
  | `--salt-size-fixed-900` | 9                  |

- 621253b: Added new fixed spacing tokens.

  | Token                      | All densities (px) |
  | -------------------------- | ------------------ |
  | `--salt-spacing-fixed-100` | 1                  |
  | `--salt-spacing-fixed-200` | 2                  |
  | `--salt-spacing-fixed-300` | 3                  |
  | `--salt-spacing-fixed-400` | 4                  |
  | `--salt-spacing-fixed-500` | 5                  |
  | `--salt-spacing-fixed-600` | 6                  |
  | `--salt-spacing-fixed-700` | 7                  |
  | `--salt-spacing-fixed-800` | 8                  |
  | `--salt-spacing-fixed-900` | 9                  |

- 621253b: Deprecated 3 size tokens:

  | Deprecated token            | Replacement token                                     |
  | --------------------------- | ----------------------------------------------------- |
  | `--salt-size-border`        | `--salt-spacing-fixed-100` or `--salt-size-fixed-100` |
  | `--salt-size-border-strong` | `--salt-spacing-fixed-200` or `--salt-size-fixed-200` |
  | `--salt-size-bar-small`     | `--salt-spacing-fixed-200` or `--salt-size-fixed-200` |

- 2d58071: New cursor foundation

  ```diff
  + --salt-cursor-active
  + --salt-cursor-disabled
  + --salt-cursor-drag-ew
  + --salt-cursor-drag-ns
  + --salt-cursor-grab
  + --salt-cursor-grab-active
  + --salt-cursor-hover
  + --salt-cursor-pending
  + --salt-cursor-readonly
  + --salt-cursor-text
  ```

  Deprecated the following cursor tokens:

  | Name                                        | Replacement                 |
  | ------------------------------------------- | --------------------------- |
  | `--salt-taggable-cursor-hover`              | `--salt-cursor-hover`       |
  | `--salt-taggable-cursor-active`             | `--salt-cursor-active`      |
  | `--salt-taggable-cursor-disabled`           | `--salt-cursor-disabled`    |
  | `--salt-navigable-cursor-active`            | `--salt-cursor-active`      |
  | `--salt-navigable-cursor-hover`             | `--salt-cursor-hover`       |
  | `--salt-navigable-cursor-disabled`          | `--salt-cursor-disabled`    |
  | `--salt-navigable-cursor-edit`              | `--salt-cursor-text`        |
  | `--salt-target-cursor-disabled`             | `--salt-cursor-disabled`    |
  | `--salt-actionable-cursor-hover`            | `--salt-cursor-hover`       |
  | `--salt-actionable-cursor-active`           | `--salt-cursor-active`      |
  | `--salt-actionable-cursor-disabled`         | `--salt-cursor-disabled`    |
  | `--salt-draggable-horizontal-cursor-hover`  | `--salt-cursor-drag-ns`     |
  | `--salt-draggable-horizontal-cursor-active` | `--salt-cursor-drag-ns`     |
  | `--salt-draggable-vertical-cursor-hover`    | `--salt-cursor-drag-ew`     |
  | `--salt-draggable-vertical-cursor-active`   | `--salt-cursor-drag-ew`     |
  | `--salt-draggable-grab-cursor-hover`        | `--salt-cursor-grab`        |
  | `--salt-draggable-grab-cursor-active`       | `--salt-cursor-grab-active` |
  | `--salt-selectable-cursor-hover`            | `--salt-cursor-hover`       |
  | `--salt-selectable-cursor-selected`         | `--salt-cursor-active`      |
  | `--salt-selectable-cursor-blurSelected`     | `--salt-cursor-hover`       |
  | `--salt-selectable-cursor-disabled`         | `--salt-cursor-disabled`    |
  | `--salt-selectable-cursor-readonly`         | `--salt-cursor-readonly`    |
  | `--salt-editable-cursor-hover`              | `--salt-cursor-text`        |
  | `--salt-editable-cursor-active`             | `--salt-cursor-text`        |
  | `--salt-editable-cursor-disabled`           | `--salt-cursor-disabled`    |
  | `--salt-editable-cursor-readonly`           | `--salt-cursor-text`        |

- 7adcf27: Deprecated `--salt-editable-borderWidth-active`. Use `--salt-size-fixed-200` instead.

## 1.29.0

### Minor Changes

- 4fc024c: Deprecated `--salt-overlayable-rangeSelection` to replace with `--salt-overlayable-background-rangeSelection`, for better system token naming convension.

  Deprecated `--salt-text-textTransform` token, which is not used anywhere in the system.

## 1.28.1

### Patch Changes

- faa0334: Fixed display4 font weight token mapping. Closes #4903.
- aed941a: Changed `--salt-track-borderColor` token from `--salt-palette-alpha-contrast-lower` to `--salt-palette-alpha-contrast-medium` to fix the contrast issue in the track.

  | Token                      | Old value                             | New value                              |
  | -------------------------- | ------------------------------------- | -------------------------------------- |
  | `--salt-track-borderColor` | `--salt-palette-alpha-contrast-lower` | `--salt-palette-alpha-contrast-medium` |

  This change impacts the following components:

  - Slider
  - RangeSlider
  - Progress
  - Stepped Tracker

## 1.28.0

### Minor Changes

- ea8b4e3: Added new `--salt-content-attention-foreground` token.

## 1.27.0

### Minor Changes

- afd7ae1: Expanded corner palette `--salt-palette-corner-strong` and `--salt-palette-corner-stronger` tokens.

  | Token                            | HD  | MD   | LD   | TD   |
  | -------------------------------- | --- | ---- | ---- | ---- |
  | `--salt-palette-corner-strong`   | 4px | 8px  | 12px | 16px |
  | `--salt-palette-corner-stronger` | 5px | 10px | 15px | 20px |

- d078641: Added separable foreground and background tokens:

  `separable-next.css`:

  ```diff
  +  --salt-separable-borderStyle: solid;
  +  --salt-separable-foreground: var(--salt-palette-foreground-primary);
  +  --salt-separable-foreground-hover: var(--salt-palette-foreground-primary);
  +  --salt-separable-foreground-active: var(--salt-palette-foreground-primary-alt);
  +  --salt-separable-background: var(--salt-palette-alpha-none);
  +  --salt-separable-background-hover: var(--salt-palette-alpha-weak);
  +  --salt-separable-background-active: var(--salt-palette-accent);
  ```

  `separable.css`

  ```diff
  +  --salt-separable-foreground: var(--salt-palette-neutral-primary-foreground);
  +  --salt-separable-foreground-hover: var(--salt-palette-neutral-primary-foreground);
  +  --salt-separable-foreground-active: var(--salt-palette-interact-cta-foreground);
  +  --salt-separable-background: var(--salt-palette-alpha-none);
  +  --salt-separable-background-hover: var(--salt-palette-alpha-weak);
  +  --salt-separable-background-active: var(--salt-palette-accent);
  ```

- aac1500: Added new container ghost characteristic tokens

  ```css
  --salt-container-ghost-background: var(--salt-palette-alpha-low);
  --salt-container-ghost-borderColor: var(--salt-palette-alpha-contrast-low);
  ```

  Added new palette alpha tokens

  | New token                                  | Light mode value            | Dark mode value             |
  | ------------------------------------------ | --------------------------- | --------------------------- |
  | `--salt-palette-alpha-highest`             | var(--salt-color-white-90a) | var(--salt-color-black-90a) |
  | `--salt-palette-alpha-higher`              | var(--salt-color-white-80a) | var(--salt-color-black-80a) |
  | `--salt-palette-alpha-high`                | var(--salt-color-white-70a) | var(--salt-color-black-70a) |
  | `--salt-palette-alpha-mediumHigh`          | var(--salt-color-white-60a) | var(--salt-color-black-60a) |
  | `--salt-palette-alpha-medium`              | var(--salt-color-white-50a) | var(--salt-color-black-50a) |
  | `--salt-palette-alpha-mediumLow`           | var(--salt-color-white-40a) | var(--salt-color-black-40a) |
  | `--salt-palette-alpha-low`                 | var(--salt-color-white-30a) | var(--salt-color-black-30a) |
  | `--salt-palette-alpha-lower`               | var(--salt-color-white-20a) | var(--salt-color-black-20a) |
  | `--salt-palette-alpha-lowest`              | var(--salt-color-white-10a) | var(--salt-color-black-10a) |
  | `--salt-palette-alpha-contrast-highest`    | var(--salt-color-black-90a) | var(--salt-color-white-90a) |
  | `--salt-palette-alpha-contrast-higher`     | var(--salt-color-black-80a) | var(--salt-color-white-80a) |
  | `--salt-palette-alpha-contrast-high`       | var(--salt-color-black-70a) | var(--salt-color-white-70a) |
  | `--salt-palette-alpha-contrast-mediumHigh` | var(--salt-color-black-60a) | var(--salt-color-white-60a) |
  | `--salt-palette-alpha-contrast-medium`     | var(--salt-color-black-50a) | var(--salt-color-white-50a) |
  | `--salt-palette-alpha-contrast-mediumLow`  | var(--salt-color-black-40a) | var(--salt-color-white-40a) |
  | `--salt-palette-alpha-contrast-low`        | var(--salt-color-black-30a) | var(--salt-color-white-30a) |
  | `--salt-palette-alpha-contrast-lower`      | var(--salt-color-black-20a) | var(--salt-color-white-20a) |
  | `--salt-palette-alpha-contrast-lowest`     | var(--salt-color-black-10a) | var(--salt-color-white-10a) |

  Deprecated below palette tokens, use replacement below instead

  ```css
  --salt-palette-alpha: var(--salt-palette-alpha-contrast-low);
  --salt-palette-alpha-strong: var(--salt-palette-alpha-contrast-mediumLow);
  --salt-palette-alpha-weak: var(--salt-palette-alpha-contrast-lower);
  --salt-palette-alpha-weaker: var(--salt-palette-alpha-contrast-lowest);

  --salt-palette-alpha-backdrop: var(--salt-palette-alpha-high);
  ```

- 09f5144: Moved curve tokens from only being defined in salt-next into salt.

  - `--salt-curve-0`
  - `--salt-curve-50`
  - `--salt-curve-100`
  - `--salt-curve-150`
  - `--salt-curve-200`
  - `--salt-curve-250`
  - `--salt-curve-999`

- 803d0c0: Added below foundation tokens.

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

- 09f5144: Added corner palette tokens to the theme.

  ```css
  --salt-palette-corner-weaker: var(--salt-curve-0);
  --salt-palette-corner-weak: var(--salt-curve-0);
  --salt-palette-corner: var(--salt-curve-0);
  --salt-palette-corner-strong: var(--salt-curve-0);
  --salt-palette-corner-stronger: var(--salt-curve-0);
  --salt-palette-corner-strongest: var(--salt-curve-999);
  ```

- 38da566: Added `--salt-text-action-fontWeight-small` and `--salt-text-action-fontWeight-strong` characteristics tokens.

## 1.26.0

### Minor Changes

- 90b85d4: Deprecated `--salt-palette-navigate-foreground-hover` and `--salt-palette-navigate-foreground-active` and replaced them with `--salt-palette-accent-foreground-informative`.
- 8ca3b2f: Added white 20, black 20 and 40 to the legacy alpha foundation:

  ```css
  --salt-color-white-20a: rgba(var(--salt-color-white-rgb), 0.2);
  --salt-color-black-20a: rgba(var(--salt-color-black-rgb), 0.2);
  --salt-color-black-40a: rgba(var(--salt-color-black-rgb), 0.4);
  ```

  Deprecated alpha 15 and 45 tokens in white and black in both themes:

  ```css
  --salt-color-white-15a: rgba(var(--salt-color-white-rgb), 0.15);
  --salt-color-white-45a: rgba(var(--salt-color-white-rgb), 0.45);
  --salt-color-black-15a: rgba(var(--salt-color-black-rgb), 0.15);
  --salt-color-black-45a: rgba(var(--salt-color-black-rgb), 0.45);
  ```

- 8ca3b2f: Rebalanced the alpha palette by updating the strong and weak tokens:

  ```diff
  - --salt-palette-alpha-strong: var(--salt-color-black-45a);
  - --salt-palette-alpha-weak: var(--salt-color-black-15a);
  + --salt-palette-alpha-strong: var(--salt-color-black-40a);
  + --salt-palette-alpha-weak: var(--salt-color-black-20a);
  ```

  ```diff
  - --salt-palette-alpha-strong: var(--salt-color-white-45a);
  - --salt-palette-alpha-weak: var(--salt-color-white-15a);
  + --salt-palette-alpha-strong: var(--salt-color-white-40a);
  + --salt-palette-alpha-weak: var(--salt-color-white-20a);
  ```

- 3764d72: Undeprecated `--salt-accent-borderColor-disabled` and `--salt-track-borderColor-disabled`.
- d22534b: Extended the spacing foundation to spacing-950.

  ```diff
  + --salt-spacing-450
  + --salt-spacing-500
  + --salt-spacing-550
  + --salt-spacing-600
  + --salt-spacing-650
  + --salt-spacing-700
  + --salt-spacing-750
  + --salt-spacing-800
  + --salt-spacing-850
  + --salt-spacing-900
  + --salt-spacing-950
  ```

- 90b85d4: Added `--salt-content-accent-foreground` to theme and theme-next.
- 8ca3b2f: Updated `--salt-track-borderColor` to be lighter in the Salt Next theme.

## 1.25.0

### Minor Changes

- 926316f: Simplified the accent, interact, neutral palette tokens by reducing the number of attributes.

  | Deprecated Token                                      | Replacement                            |
  | ----------------------------------------------------- | -------------------------------------- |
  | --salt-palette-accent-background                      | --salt-palette-accent                  |
  | --salt-palette-accent-background-disabled             | --salt-palette-accent-disabled         |
  | --salt-palette-accent-border                          | --salt-palette-accent                  |
  | --salt-palette-accent-border-disabled                 | --salt-palette-accent-disabled         |
  | --salt-palette-interact-cta-foreground-active         | --salt-palette-interact-cta-foreground |
  | --salt-palette-interact-cta-foreground-hover          | --salt-palette-interact-cta-foreground |
  | --salt-palette-interact-background                    | --salt-palette-alpha-none              |
  | --salt-palette-interact-background-disabled           | --salt-palette-alpha-none              |
  | --salt-palette-interact-border-none                   | --salt-palette-alpha-none              |
  | --salt-palette-interact-secondary-background          | --salt-palette-alpha-none              |
  | --salt-palette-interact-secondary-background-disabled | --salt-palette-alpha-none              |
  | --salt-palette-neutral-primary-background-readonly    | --salt-palette-alpha-none              |
  | --salt-palette-neutral-secondary-background-readonly  | --salt-palette-alpha-none              |
  | --salt-palette-neutral-primary-border                 | --salt-palette-neutral-border          |
  | --salt-palette-neutral-secondary-border               | --salt-palette-neutral-border          |
  | --salt-palette-neutral-tertiary-border                | --salt-palette-neutral-border          |
  | --salt-palette-neutral-primary-border-disabled        | --salt-palette-neutral-border-disabled |
  | --salt-palette-neutral-secondary-border-disabled      | --salt-palette-neutral-border-disabled |
  | --salt-palette-neutral-tertiary-border-disabled       | --salt-palette-neutral-border-disabled |
  | --salt-palette-neutral-highlight                      | --salt-palette-alpha                   |
  | --salt-palette-neutral-secondary-separator            | --salt-palette-alpha                   |
  | --salt-palette-neutral-selection                      | --salt-palette-alpha-weak              |
  | --salt-palette-neutral-tertiary-separator             | --salt-palette-alpha-weak              |
  | --salt-palette-neutral-primary-separator              | --salt-palette-alpha-strong            |
  | --salt-palette-neutral-backdrop                       | --salt-palette-alpha-backdrop          |

- 926316f: Aligned the theme and theme-next fade/alpha token implementation. All fade tokens have been deprecated and where necessary replaced with alpha tokens.

  | Deprecated Token                                   | Replacement                 |
  | -------------------------------------------------- | --------------------------- |
  | --salt-color-blue-30-fade-background               | --salt-color-blue-30-40a    |
  | --salt-color-blue-100-fade-foreground              | --salt-color-blue-100-40a   |
  | --salt-color-blue-100-fade-fill                    | --salt-color-blue-100-40a   |
  | --salt-color-blue-200-fade-foreground              | --salt-color-blue-200-40a   |
  | --salt-color-blue-500-fade-foreground              | --salt-color-blue-500-40a   |
  | --salt-color-blue-500-fade-border                  | --salt-color-blue-500-40a   |
  | --salt-color-blue-500-fade-background              | --salt-color-blue-500-40a   |
  | --salt-color-blue-600-fade-foreground              | --salt-color-blue-600-40a   |
  | --salt-color-blue-600-fade-background              | --salt-color-blue-600-40a   |
  | --salt-color-blue-600-fade-fill                    | --salt-color-blue-600-40a   |
  | --salt-color-blue-700-fade-background              | --salt-color-blue-700-40a   |
  | --salt-color-gray-20-fade-background               | --salt-color-gray-20-40a    |
  | --salt-color-gray-20-fade-background-readonly      | No replacement              |
  | --salt-color-gray-30-fade-background               | --salt-color-gray-30-40a    |
  | --salt-color-gray-50-fade-background               | --salt-color-gray-50-40a    |
  | --salt-color-gray-50-fade-border                   | --salt-color-gray-50-40a    |
  | --salt-color-gray-60-fade-background               | --salt-color-gray-60-40a    |
  | --salt-color-gray-60-fade-border                   | --salt-color-gray-60-40a    |
  | --salt-color-gray-70-fade-background               | --salt-color-gray-70-40a    |
  | --salt-color-gray-70-fade-foreground               | --salt-color-gray-70-40a    |
  | --salt-color-gray-90-fade-foreground               | --salt-color-gray-90-40a    |
  | --salt-color-gray-90-fade-border                   | --salt-color-gray-90-40a    |
  | --salt-color-gray-90-fade-border-readonly          | --salt-color-gray-90-15a    |
  | --salt-color-gray-200-fade-background              | --salt-color-gray-200-40a   |
  | --salt-color-gray-200-fade-foreground              | --salt-color-gray-200-40a   |
  | --salt-color-gray-200-fade-border                  | --salt-color-gray-200-40a   |
  | --salt-color-gray-200-fade-border-readonly         | --salt-color-gray-200-15a   |
  | --salt-color-gray-300-fade-border                  | --salt-color-gray-300-40a   |
  | --salt-color-gray-300-fade-background              | --salt-color-gray-300-40a   |
  | --salt-color-gray-600-fade-background              | --salt-color-gray-600-40a   |
  | --salt-color-gray-600-fade-background-readonly     | No replacement              |
  | --salt-color-gray-800-fade-background              | --salt-color-gray-800-40a   |
  | --salt-color-gray-800-fade-background-readonly     | No replacement              |
  | --salt-color-gray-900-fade-foreground              | --salt-color-gray-900-40a   |
  | --salt-color-green-200-fade-foreground             | --salt-color-green-200-40a  |
  | --salt-color-green-300-fade-foreground             | --salt-color-green-300-40a  |
  | --salt-color-green-400-fade-foreground             | --salt-color-green-400-40a  |
  | --salt-color-green-400-fade-border                 | --salt-color-green-400-40a  |
  | --salt-color-green-500-fade-foreground             | --salt-color-green-500-40a  |
  | --salt-color-green-500-fade-border                 | --salt-color-green-500-40a  |
  | --salt-color-green-500-fade-background             | --salt-color-green-500-40a  |
  | --salt-color-green-600-fade-foreground             | --salt-color-green-600-40a  |
  | --salt-color-green-600-fade-background             | --salt-color-green-600-40a  |
  | --salt-color-green-700-fade-foreground             | No replacement              |
  | --salt-color-red-200-fade-foreground               | --salt-color-red-200-40a    |
  | --salt-color-red-300-fade-foreground               | No replacement              |
  | --salt-color-red-500-fade-foreground               | --salt-color-red-500-40a    |
  | --salt-color-red-500-fade-border                   | --salt-color-red-500-40a    |
  | --salt-color-red-600-fade-foreground               | --salt-color-red-600-40a    |
  | --salt-color-red-600-fade-background               | --salt-color-red-600-40a    |
  | --salt-color-red-700-fade-foreground               | No replacement              |
  | --salt-color-orange-400-fade-foreground            | --salt-color-orange-400-40a |
  | --salt-color-orange-400-fade-border                | --salt-color-orange-400-40a |
  | --salt-color-orange-500-fade-border                | --salt-color-orange-500-40a |
  | --salt-color-orange-600-fade-border                | --salt-color-orange-600-40a |
  | --salt-color-orange-700-fade-border                | --salt-color-orange-700-40a |
  | --salt-color-orange-850-fade-foreground            | --salt-color-orange-850-40a |
  | --salt-color-white-fade-foreground                 | --salt-color-white-40a      |
  | --salt-color-white-fade-background                 | --salt-color-white-40a      |
  | --salt-color-white-fade-background-readonly        | No replacement              |
  | --salt-color-white-fade-backdrop                   | --salt-color-white-70a      |
  | --salt-color-white-fade-background-highlight       | --salt-color-white-30a      |
  | --salt-color-white-fade-background-selection       | --salt-color-white-15a      |
  | --salt-color-white-fade-separatorOpacity-primary   | --salt-color-white-45a      |
  | --salt-color-white-fade-separatorOpacity-secondary | --salt-color-white-15a      |
  | --salt-color-white-fade-separatorOpacity-tertiary  | --salt-color-white-10a      |
  | --salt-color-black-fade-backdrop                   | --salt-color-black-70a      |
  | --salt-color-black-fade-background-highlight       | --salt-color-black-30a      |
  | --salt-color-black-fade-background-selection       | --salt-color-black-15a      |
  | --salt-color-black-fade-separatorOpacity-primary   | --salt-color-black-45a      |
  | --salt-color-black-fade-separatorOpacity-secondary | --salt-color-black-15a      |
  | --salt-color-black-fade-separatorOpacity-tertiary  | --salt-color-black-10a      |

- 926316f: Deprecated opacity foundation and palette tokens. There are no direct replacements for these tokens.

  ```css
  --salt-opacity-0: 0;
  --salt-opacity-15: 0.15;
  --salt-opacity-25: 0.25;
  --salt-opacity-40: 0.4;
  --salt-opacity-45: 0.45;
  --salt-opacity-70: 0.7;
  --salt-palette-opacity-backdrop: var(--salt-opacity-70);
  --salt-palette-opacity-disabled: var(--salt-opacity-40);
  --salt-palette-opacity-background-readonly: var(--salt-opacity-0);
  --salt-palette-opacity-border-readonly: var(--salt-opacity-15);
  --salt-palette-opacity-primary-border: var(--salt-opacity-45);
  --salt-palette-opacity-secondary-border: var(--salt-opacity-25);
  --salt-palette-opacity-tertiary-border: var(--salt-opacity-15);
  ```

- 926316f: Aligned the color ramp implementation with theme-next. Color tokens now have respective rgb tokens.
- 1203a3f: Deprecate `--salt-navigable-background-hover` and related tokens.

  - `--salt-navigable-background-hover`
  - `--salt-palette-navigate-background-hover`
  - `--salt-color-white-fade-background-hover`
  - `--salt-color-black-fade-background-hover`
  - `--salt-opacity-8`

- 926316f: The Alpha palette has been added to the current theme. Previously it was only in theme-next.

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

### Patch Changes

- 3e474a0: Added missing fade token: `--salt-color-gray-500-fade-background`.
- 3e474a0: Removed incorrectly deprecated tokens:

  - `--salt-color-orange-600-fade-background`
  - `--salt-palette-negative-foreground-disabled`
  - `--salt-palette-positive-foreground-disabled`
  - `--salt-palette-warning-border-disabled`
  - `--salt-palette-accent-background-disabled`
  - `--salt-palette-accent-border-disabled`

## 1.24.0

### Minor Changes

- 06ad53b: Deprecated foreground hover and active palette tokens.

  | Deprecated token                   | Replacement token                |
  | ---------------------------------- | -------------------------------- |
  | `--salt-palette-foreground-active` | `--salt-palette-accent-stronger` |
  | `--salt-palette-foreground-hover`  | `--salt-palette-accent-strong`   |

### Patch Changes

- a2fc9cf: Fixed `--salt-color-autumn-500`, `--salt-color-indigo-500`, `--salt-color-rose-500` not meeting colour contrast requirements in certain scenarios.
- 0a5b68b: Marked CSS files as having side effects. This fixes Webpack tree-shaking CSS files when `sideEffects: true` is not set on style-loader rules.
- 06ad53b: Updated content hover and active tokens so that they switch to Teal when using the Next theme.

  ```diff
  -  --salt-content-foreground-hover: var(--salt-palette-foreground-hover);
  -  --salt-content-foreground-active: var(--salt-palette-foreground-active);
  +  --salt-content-foreground-hover: var(--salt-palette-accent-strong);
  +  --salt-content-foreground-active: var(--salt-palette-accent-stronger);
  ```

## 1.23.3

### Patch Changes

- 131dd9a: Undeprecate `--salt-accent-background-disabled`
- f6848dd: Fixed below tokens pointing to incorrect palette token, with underlying value not changing (`transparent`), from `var(--salt-palette-interact-border-none)` to `var(--salt-palette-interact-background)`.

  - `--salt-actionable-negative-background-disabled`
  - `--salt-actionable-negative-background`
  - `--salt-actionable-negative-subtle-background-disabled`
  - `--salt-actionable-negative-subtle-background`
  - `--salt-actionable-positive-background-disabled`
  - `--salt-actionable-positive-background`
  - `--salt-actionable-positive-subtle-background-disabled`
  - `--salt-actionable-positive-subtle-background`
  - `--salt-actionable-caution-background-disabled`
  - `--salt-actionable-caution-background`
  - `--salt-actionable-caution-subtle-background-disabled`
  - `--salt-actionable-caution-subtle-background`

- 5af2978: Fixed titanium background color token was incorrected named

  ```diff
  - --salt-color-background-gradientlight
  + --salt-color-background-titanium
  ```

## 1.23.2

### Patch Changes

- 2f027e9: Fixed target characteristic tokens being incorrect in Salt Next.

## 1.23.1

### Patch Changes

- 0661efa: - Fixed invalid CSS variables in `theme-next.css`. Closes #4302.
  - Fixed missing actionable disabled palette tokens in `theme-next.css`.

## 1.23.0

### Minor Changes

- 4ccc245: Added new tokens in Salt theme.

  - `--salt-palette-interact-cta-border-hover`
  - `--salt-palette-interact-cta-border-active`
  - `--salt-accent-background-disabled`
  - `--salt-palette-accent-background-disabled`

  Added new tokens in Salt Next theme.

  - `--salt-accent-background-disabled`

  Updated mapping for below tokens, to help visual alignment between Salt and Salt Next themes.

  ```diff
  - --salt-actionable-accented-borderColor-hover: var(--salt-palette-interact-border-none);
  + --salt-actionable-accented-borderColor-hover: var(--salt-palette-interact-cta-border-hover);
  - --salt-actionable-accented-borderColor-active: var(--salt-palette-interact-border-none);
  + --salt-actionable-accented-borderColor-active: var(--salt-palette-interact-cta-border-active);
  ```

## 1.22.0

### Minor Changes

- 1098fc1: Updated tokens values mapping for below tokens

  ```diff
  /* light */
  - --salt-palette-negative-foreground: var(--salt-color-red-700);
  + --salt-palette-negative-foreground: var(--salt-color-red-600);
  - --salt-palette-positive-foreground: var(--salt-color-green-700);
  + --salt-palette-positive-foreground: var(--salt-color-green-600);
  /* dark */
  - --salt-palette-negative-foreground: var(--salt-color-red-300);
  + --salt-palette-negative-foreground: var(--salt-color-red-200);
  - --salt-palette-positive-foreground: var(--salt-color-green-300);
  + --salt-palette-positive-foreground: var(--salt-color-green-200);
  ```

  Deprecated actionable cta/primary/secondary tokens in favor of new tokens. Replacement references below

  | Deprecated token                                   | Replacement token                                      |
  | -------------------------------------------------- | ------------------------------------------------------ |
  | `--salt-actionable-cta-background-active`          | `--salt-actionable-accented-bold-background-active`    |
  | `--salt-actionable-cta-background-disabled`        | `--salt-actionable-accented-bold-background-disabled`  |
  | `--salt-actionable-cta-background-hover`           | `--salt-actionable-accented-bold-background-hover`     |
  | `--salt-actionable-cta-background`                 | `--salt-actionable-accented-bold-background`           |
  | `--salt-actionable-cta-borderColor-active`         | `--salt-actionable-accented-bold-borderColor-active`   |
  | `--salt-actionable-cta-borderColor-disabled`       | `--salt-actionable-accented-bold-borderColor-disabled` |
  | `--salt-actionable-cta-borderColor-hover`          | `--salt-actionable-accented-bold-borderColor-hover`    |
  | `--salt-actionable-cta-borderColor`                | `--salt-actionable-accented-bold-borderColor`          |
  | `--salt-actionable-cta-foreground-active`          | `--salt-actionable-accented-bold-foreground-active`    |
  | `--salt-actionable-cta-foreground-disabled`        | `--salt-actionable-accented-bold-foreground-disabled`  |
  | `--salt-actionable-cta-foreground-hover`           | `--salt-actionable-accented-bold-foreground-hover`     |
  | `--salt-actionable-cta-foreground`                 | `--salt-actionable-accented-bold-foreground`           |
  | `--salt-actionable-primary-background-active`      | `--salt-actionable-bold-background-active`             |
  | `--salt-actionable-primary-background-disabled`    | `--salt-actionable-bold-background-disabled`           |
  | `--salt-actionable-primary-background-hover`       | `--salt-actionable-bold-background-hover`              |
  | `--salt-actionable-primary-background`             | `--salt-actionable-bold-background`                    |
  | `--salt-actionable-primary-borderColor-active`     | `--salt-actionable-bold-borderColor-active`            |
  | `--salt-actionable-primary-borderColor-disabled`   | `--salt-actionable-bold-borderColor-disabled`          |
  | `--salt-actionable-primary-borderColor-hover`      | `--salt-actionable-bold-borderColor-hover`             |
  | `--salt-actionable-primary-borderColor`            | `--salt-actionable-bold-borderColor`                   |
  | `--salt-actionable-primary-foreground-active`      | `--salt-actionable-bold-foreground-active`             |
  | `--salt-actionable-primary-foreground-disabled`    | `--salt-actionable-bold-foreground-disabled`           |
  | `--salt-actionable-primary-foreground-hover`       | `--salt-actionable-bold-foreground-hover`              |
  | `--salt-actionable-primary-foreground`             | `--salt-actionable-bold-foreground`                    |
  | `--salt-actionable-secondary-background-active`    | `--salt-actionable-subtle-background-active`           |
  | `--salt-actionable-secondary-background-disabled`  | `--salt-actionable-subtle-background-disabled`         |
  | `--salt-actionable-secondary-background-hover`     | `--salt-actionable-subtle-background-hover`            |
  | `--salt-actionable-secondary-background`           | `--salt-actionable-subtle-background`                  |
  | `--salt-actionable-secondary-borderColor-active`   | `--salt-actionable-subtle-borderColor-active`          |
  | `--salt-actionable-secondary-borderColor-disabled` | `--salt-actionable-subtle-borderColor-disabled`        |
  | `--salt-actionable-secondary-borderColor-hover`    | `--salt-actionable-subtle-borderColor-hover`           |
  | `--salt-actionable-secondary-borderColor`          | `--salt-actionable-subtle-borderColor`                 |
  | `--salt-actionable-secondary-foreground-active`    | `--salt-actionable-subtle-foreground-active`           |
  | `--salt-actionable-secondary-foreground-disabled`  | `--salt-actionable-subtle-foreground-disabled`         |
  | `--salt-actionable-secondary-foreground-hover`     | `--salt-actionable-subtle-foreground-hover`            |
  | `--salt-actionable-secondary-foreground`           | `--salt-actionable-subtle-foreground`                  |

  Added various tokens for new actionable family tokens.

  ## Salt theme - `theme.css`

  ### Palette

  - `--salt-palette-accent-border-disabled`
  - `--salt-palette-accent-foreground-informative`
  - `--salt-palette-accent-foreground-informative-disabled`
  - `--salt-palette-interact-border-none`
  - `--salt-palette-negative-foreground-disabled`
  - `--salt-palette-negative-background`
  - `--salt-palette-negative-background-hover`
  - `--salt-palette-negative-background-active`
  - `--salt-palette-negative-background-disabled`
  - `--salt-palette-negative-border`
  - `--salt-palette-negative-border-disabled`
  - `--salt-palette-positive-foreground-disabled`
  - `--salt-palette-positive-background`
  - `--salt-palette-positive-background-hover`
  - `--salt-palette-positive-background-active`
  - `--salt-palette-positive-background-disabled`
  - `--salt-palette-positive-border`
  - `--salt-palette-positive-border-disabled`
  - `--salt-palette-warning-border-disabled`
  - `--salt-palette-warning-foreground-informative-disabled`
  - `--salt-palette-warning-action`
  - `--salt-palette-warning-action-hover`
  - `--salt-palette-warning-action-active`
  - `--salt-palette-warning-action-disabled`
  - `--salt-palette-warning-action-foreground`
  - `--salt-palette-warning-action-foreground-disabled`

  #### Foundation

  - `--salt-color-blue-200-fade-foreground`
  - `--salt-color-green-200-fade-foreground`
  - `--salt-color-green-600-fade-foreground`
  - `--salt-color-red-200-fade-foreground`
  - `--salt-color-red-600-fade-foreground`
  - `--salt-color-orange-400-fade-foreground`
  - `--salt-color-orange-850-fade-foreground`
  - `--salt-color-green-500-fade-background`
  - `--salt-color-green-600-fade-background`
  - `--salt-color-red-600-fade-background`

  ## Salt next theme - `theme-next.css`

  ### Palette

  - `--salt-palette-negative-action-hover`
  - `--salt-palette-negative-action-active`
  - `--salt-palette-negative-disabled`
  - `--salt-palette-positive-action-hover`
  - `--salt-palette-positive-action-active`
  - `--salt-palette-positive-disabled`
  - `--salt-palette-warning-disabled`
  - `--salt-palette-warning-action-hover`
  - `--salt-palette-warning-action-active`

  #### Foundation

  - `--salt-color-green-500-40a`
  - `--salt-color-orange-500-40a`
  - `--salt-color-red-500-40a`

- 285a257: Added below new tokens

  - `--salt-overlayable-background-highlight`
  - `--salt-palette-neutral-highlight`
  - `--salt-color-black-fade-background-highlight`
  - `--salt-color-white-fade-background-highlight`

### Patch Changes

- 2263a98: Fixed foreground secondary color token not correctly reflecting design in Salt Next theme, corrected to gray 700/300.

## 1.21.0

### Minor Changes

- fc66238: Added tertiary variables in theme next theme

  ```
  --salt-container-tertiary-borderColor
  --salt-container-tertiary-borderColor-disabled
  ```

  Added tertiary variables in existing theme

  ```
  --salt-container-tertiary-background
  --salt-container-tertiary-background-disabled
  --salt-container-tertiary-borderColor
  --salt-container-tertiary-borderColor-disabled
  ```

  Added gray 30 and 50 fade background in fade.css

  ```
  --salt-color-gray-30-fade-background
  --salt-color-gray-50-fade-background
  ```

  Un-deprecated tertiary palette variables in characteristics.css and palette.css and added those to neutral.css

  ```
  --salt-palette-neutral-tertiary-background
  --salt-palette-neutral-tertiary-background-disabled
  --salt-palette-neutral-tertiary-border
  --salt-palette-neutral-tertiary-border-disabled
  ```

### Patch Changes

- 3c635db: Fixed `--salt-size-selectable` double defined in deprecated token list

## 1.20.0

### Minor Changes

- fc60301: Added status bold background and content bold foreground tokens

  ```
  --salt-status-info-bold-background
  --salt-status-error-bold-background
  --salt-status-warning-bold-background
  --salt-status-success-bold-background

  --salt-content-bold-foreground
  --salt-content-bold-foreground-disabled
  ```

### Patch Changes

- baa5aaa: Added `--salt-overlayable-rangeSelection` variable in theme next, pointing to the same underlying value as before.

  Closes #3517.

## 1.19.0

### Minor Changes

- f89189d: Added theme tokens supporting action font switch.

  ```css
  --salt-text-action-fontFamily: var(--salt-palette-text-fontFamily-action);

  --salt-palette-text-fontFamily-action: var(
    --salt-typography-fontFamily-openSans
  );
  --salt-palette-text-action-fontWeight: var(
    --salt-typography-fontWeight-semiBold
  );
  ```

  Updated `--salt-text-action-fontWeight` to use `var(--salt-palette-text-action-fontWeight)`.

  In theme next, palette layer tokens can be switched between Open Sans and Amplitude.

  Closes #3528.

## 1.18.0

### Minor Changes

- d0b6912: Added display 4 text tokens, which have the same value as display 3.

  In theme next, display sizes are remapped to reflect larger size than h1.

- 87791a1: Updated H1 font weight

  | H1      | Before     | New       |
  | ------- | ---------- | --------- |
  | Default | Bold       | Semi bold |
  | Small   | Medium     | Regular   |
  | Strong  | Extra bold | Bold      |

  Added font weight in palette layer for display, heading, body and notation.

  ```diff
  + --salt-palette-text-display-fontWeight: var(--salt-typography-fontWeight-semiBold);
  + --salt-palette-text-display-fontWeight-small: var(--salt-typography-fontWeight-regular);
  + --salt-palette-text-display-fontWeight-strong: var(--salt-typography-fontWeight-bold);
  + --salt-palette-text-heading-fontWeight: var(--salt-typography-fontWeight-semiBold);
  + --salt-palette-text-heading-fontWeight-small: var(--salt-typography-fontWeight-regular);
  + --salt-palette-text-heading-fontWeight-strong: var(--salt-typography-fontWeight-bold);
  + --salt-palette-text-body-fontWeight: var(--salt-typography-fontWeight-regular);
  + --salt-palette-text-body-fontWeight-small: var(--salt-typography-fontWeight-light);
  + --salt-palette-text-body-fontWeight-strong: var(--salt-typography-fontWeight-semiBold);
  + --salt-palette-text-notation-fontWeight: var(--salt-typography-fontWeight-semiBold);
  + --salt-palette-text-notation-fontWeight-small: var(--salt-typography-fontWeight-regular);
  + --salt-palette-text-notation-fontWeight-strong: var(--salt-typography-fontWeight-bold);
  ```

  Wired text characteristics font weight to newly added palette tokens.

  In theme next, when Amplitude is used for heading, font weight will be adjusted accordingly.

- 400c730: - Added `--salt-opacity-45: 0.45`.
  - Updated `--salt-palette-opacity-primary-border` from `var(--salt-opacity-40)` to `var(--salt-opacity-45)`.
- 416b7dd: Updated foundation color palette used in theme next due to color contrast concerns, below colors are impacted.

  ```
  --salt-color-blue-200
  --salt-color-blue-300
  --salt-color-blue-400
  --salt-color-blue-600
  --salt-color-blue-700
  --salt-color-blue-800
  --salt-color-blue-900
  --salt-color-green-200
  --salt-color-green-300
  --salt-color-green-400
  --salt-color-green-600
  --salt-color-green-700
  --salt-color-green-800
  --salt-color-green-900
  --salt-color-teal-200
  --salt-color-teal-300
  --salt-color-teal-400
  --salt-color-teal-600
  --salt-color-teal-700
  --salt-color-teal-800
  --salt-color-teal-900
  --salt-color-orange-200
  --salt-color-orange-300
  --salt-color-orange-400
  --salt-color-orange-500
  --salt-color-orange-600
  --salt-color-orange-700
  --salt-color-orange-800
  --salt-color-red-300
  --salt-color-red-400
  --salt-color-red-600
  --salt-color-red-700
  --salt-color-red-800
  --salt-color-red-900
  --salt-color-purple-200
  --salt-color-purple-300
  --salt-color-purple-400
  --salt-color-purple-600
  --salt-color-purple-700
  --salt-color-purple-800
  --salt-color-purple-900
  ```

- 081c82b: Added 20 groups of categorical palette and category characteristics tokens, e.g., cat 1 tokens

  Characteristics

  - `--salt-category-1-subtle-foreground`
  - `--salt-category-1-subtle-background`
  - `--salt-category-1-subtle-borderColor`
  - `--salt-category-1-bold-background`
  - `--salt-category-1-bold-foreground`

  Palette

  - `--salt-palette-categorical-1`
  - `--salt-palette-categorical-1-strong`
  - `--salt-palette-categorical-1-weakest`

## 1.17.0

### Minor Changes

- 2199704e: Added categorical colors. Refer to [color page](https://www.saltdesignsystem.com/salt/foundations/color) for more detail. Closes #2523.

### Patch Changes

- 353e9171: Updated status tokens for theme next to match latest design

## 1.16.0

### Minor Changes

- 25e38e48: ## Characteristics

  Added decorative and informative status foreground tokens. This ensures contrast requirements are met for both text and non-text elements.

  ```diff
  +  --salt-status-info-foreground-decorative: var(--salt-palette-info-foreground-decorative);
  +  --salt-status-error-foreground-decorative: var(--salt-palette-error-foreground-decorative);
  +  --salt-status-warning-foreground-decorative: var(--salt-palette-warning-foreground-decorative);
  +  --salt-status-success-foreground-decorative: var(--salt-palette-success-foreground-decorative);
  +
  +  --salt-status-info-foreground-informative: var(--salt-palette-info-foreground-informative);
  +  --salt-status-error-foreground-informative: var(--salt-palette-error-foreground-informative);
  +  --salt-status-warning-foreground-informative: var(--salt-palette-warning-foreground-informative);
  +  --salt-status-success-foreground-informative: var(--salt-palette-success-foreground-informative);
  ```

  Deprecated status foreground tokens.

  | Name                             | Replacement                                 |
  | -------------------------------- | ------------------------------------------- |
  | --salt-status-info-foreground    | --salt-status-info-foreground-decorative    |
  | --salt-status-error-foreground   | --salt-status-error-foreground-decorative   |
  | --salt-status-warning-foreground | --salt-status-warning-foreground-decorative |
  | --salt-status-success-foreground | --salt-status-success-foreground-decorative |

  ## Palette

  Added decorative and informative info, error, warning and success foreground tokens.

  ### Light

  ```diff
  +  --salt-palette-info-foreground-decorative: var(--salt-color-blue-500);
  +  --salt-palette-info-foreground-informative: var(--salt-color-blue-600);
  +  --salt-palette-error-foreground-decorative: var(--salt-color-red-500);
  +  --salt-palette-error-foreground-informative: var(--salt-color-red-600);
  +  --salt-palette-warning-foreground-decorative: var(--salt-color-orange-700);
  +  --salt-palette-warning-foreground-informative: var(--salt-color-orange-850);
  +  --salt-palette-success-foreground-decorative: var(--salt-color-green-500);
  +  --salt-palette-success-foreground-informative: var(--salt-color-green-600);
  ```

  ### Dark

  ```diff
  +  --salt-palette-info-foreground-decorative: var(--salt-color-blue-100);
  +  --salt-palette-info-foreground-informative: var(--salt-color-blue-200);
  +  --salt-palette-error-foreground-decorative: var(--salt-color-red-400);
  +  --salt-palette-error-foreground-informative: var(--salt-color-red-200);
  +  --salt-palette-warning-foreground-decorative: var(--salt-color-orange-500);
  +  --salt-palette-warning-foreground-informative: var(--salt-color-orange-400);
  +  --salt-palette-success-foreground-decorative: var(--salt-color-green-400);
  +  --salt-palette-success-foreground-informative: var(--salt-color-green-200);
  ```

  Updated info and error border tokens.

  ```diff
  -  --salt-palette-info-border: var(--salt-color-blue-500);
  +  --salt-palette-info-border: var(--salt-color-blue-400);
  -  --salt-palette-error-border: var(--salt-color-red-500);
  +  --salt-palette-error-border: var(--salt-color-red-400);
  ```

  Deprecated status foreground tokens.

  | Name                              | Replacement                                  |
  | --------------------------------- | -------------------------------------------- |
  | --salt-palette-info-foreground    | --salt-palette-info-foreground-decorative    |
  | --salt-palette-error-foreground   | --salt-palette-error-foreground-decorative   |
  | --salt-palette-warning-foreground | --salt-palette-warning-foreground-decorative |
  | --salt-palette-success-foreground | --salt-palette-success-foreground-decorative |

  ## Foundations

  Added `--salt-color-orange-850`:

  ```diff
  +  --salt-color-orange-850: rgb(194, 52, 7);
  ```

- eaab9d89: Switched to use new color palette in theme next when using `UNSTABLE_SaltProviderNext`.

  Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.

  Closes #3394

- 5ed8ed88: Added new `--salt-overlayable-rangeSelection` token, which points to new `--salt-palette-neutral-selection` and resolves to black@15% in light mode and white@15% in dark mode.
- e1d4aab8: Supports heading font switch when using `UNSTABLE_SaltProviderNext`.

  Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.

## 1.15.0

### Minor Changes

- 3fa8b97c: Added new tokens

  | Tier       | Token                                    | Value                                   |
  | ---------- | ---------------------------------------- | --------------------------------------- |
  | Foundation | `--salt-typography-fontFamily-openSans`  | "Open Sans"                             |
  | Foundation | `--salt-typography-fontFamily-ptMono`    | "PT Mono"                               |
  | Palette    | `--salt-palette-text-fontFamily`         | `--salt-typography-fontFamily-openSans` |
  | Palette    | `--salt-palette-text-fontFamily-heading` | `--salt-typography-fontFamily-openSans` |
  | Palette    | `--salt-palette-text-fontFamily-code`    | `--salt-typography-fontFamily-ptMono`   |

  Updated existing token value mapping to use new tokens

  ```diff
  - --salt-text-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-fontFamily: var(--salt-palette-text-fontFamily);
  - --salt-text-notation-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-notation-fontFamily: var(--salt-palette-text-fontFamily);
  - --salt-text-h1-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-h1-fontFamily: var(--salt-palette-text-fontFamily-heading);
  - --salt-text-h2-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-h2-fontFamily: var(--salt-palette-text-fontFamily-heading);
  - --salt-text-h3-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-h3-fontFamily: var(--salt-palette-text-fontFamily-heading);
  - --salt-text-h4-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-h4-fontFamily: var(--salt-palette-text-fontFamily-heading);
  - --salt-text-label-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-label-fontFamily: var(--salt-palette-text-fontFamily);
  - --salt-text-display1-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-display1-fontFamily: var(--salt-palette-text-fontFamily-heading);
  - --salt-text-display2-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-display2-fontFamily: var(--salt-palette-text-fontFamily-heading);
  - --salt-text-display3-fontFamily: var(--salt-typography-fontFamily);
  + --salt-text-display3-fontFamily: var(--salt-palette-text-fontFamily-heading);
  - --salt-text-code-fontFamily: var(--salt-typography-fontFamily-code);
  + --salt-text-code-fontFamily: var(--salt-palette-text-fontFamily-code);
  ```

  Deprecated below tokens, use replacement token instead

  ```
    --salt-typography-fontFamily: var(--salt-typography-fontFamily-openSans);
    --salt-typography-fontFamily-code: var(--salt-typography-fontFamily-ptMono);
  ```

- 3fa8b97c: Updated global theme css font family pointing to text chractertics instead of foundation value

  ```diff
  - font-family: var(--salt-typography-fontFamily);
  + font-family: var(--salt-text-fontFamily);
  ```

## 1.14.0

### Minor Changes

- f6202615: Updated `--salt-size-indicator`.

  | Density | Before (px) | After (px) |
  | ------- | ----------- | ---------- |
  | High    | 1           | 2          |
  | Medium  | 2           | 3          |
  | Low     | 3           | 4          |
  | Touch   | 4           | 5          |

## 1.13.1

### Patch Changes

- 4f925b41: Fix `--salt-navigable-background-hover` referencing deprecated value `--salt-palette-navigate-primary-background-hover`, change to reference correct value `--salt-palette-navigate-background-hover`

## 1.13.0

### Minor Changes

- f27ecfa7: Added `theme-next.css` which includes experimental theme implementation. Refer to [documentation](https://storybook.saltdesignsystem.com/?path=/docs/experimental-theme-next--docs) for more information.

## 1.12.1

### Patch Changes

- 9d23fdce: Removed `box-sizing: border-box` from global.css. This was causing issues in applications that were built using `box-sizing: content-box`.

## 1.12.0

### Minor Changes

- a374c206: Added `--salt-color-gray-50-fade-border`.

  ```diff
  + --salt-color-gray-50-fade-border: rgba(206, 210, 217, var(--salt-palette-opacity-disabled));
  ```

  Updated the values of `--salt-palette-neutral-primary-border`, `--salt-palette-neutral-primary-border-disabled`, `--salt-palette-neutral-secondary-border` and `--salt-palette-neutral-secondary-border-disabled`.

  This will affect the border color of Card, InteractableCard, FileDropZone, ToggleButtonGroup, Overlay, CircularProgress, LinearProgress and SteppedTracker.

  New values in light mode:

  ```diff
  - --salt-palette-neutral-primary-border: var(--salt-color-gray-60);
  - --salt-palette-neutral-primary-border-disabled: var(--salt-color-gray-60-fade-border);
  + --salt-palette-neutral-primary-border: var(--salt-color-gray-50);
  + --salt-palette-neutral-primary-border-disabled: var(--salt-color-gray-50-fade-border);
  ```

  ```diff
  - --salt-palette-neutral-secondary-border: var(--salt-color-gray-90);
  - --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-90-fade-border);
  + --salt-palette-neutral-secondary-border: var(--salt-color-gray-50);
  + --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-50-fade-border);
  ```

  New values in dark mode:

  ```diff
  - --salt-palette-neutral-secondary-border: var(--salt-color-gray-90);
  - --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-90-fade-border);
  + --salt-palette-neutral-secondary-border: var(--salt-color-gray-300);
  + --salt-palette-neutral-secondary-border-disabled: var(--salt-color-gray-300-fade-border);
  ```

## 1.11.1

### Patch Changes

- bef0d509: Undeprecated `--salt-track-borderColor`, which was incorrectly deprecated in feb80146.

## 1.11.0

### Minor Changes

- c6db7d56: Added `--salt-color-white-fade-backdrop` token with value `rgba(255, 255, 255, var(--salt-palette-opacity-backdrop))`
  Updated `--salt-color-black-fade-backdrop` token to value `rgba(0, 0, 0, var(--salt-palette-opacity-backdrop))`

## 1.10.1

### Patch Changes

- dbc44243: Add --salt-text-background-selected back as a deprecated token after it was accidentally removed.

## 1.10.0

### Minor Changes

- feb80146: **_Theming and CSS updates_** Although these changes are not considered breaking. For teams customizing theme, the following tokens will be impacted. Update them as per suggestion. Deprecated tokens will be removed in the next major version.

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
    - `text.css` updated to `content.css` as tokens are used for more than just texts i.e. icon
    - consolidating tokens into `text.css` to ensure all text-related tokens are within the same file, aside from text colors, they sit within `content.css`
    - tidying tokens: `container` no longer has a `tertiary` variant

  #### `text-*` to `content`

  ```diff
  - --salt-text-link-foreground-hover
  - --salt-text-link-foreground-active
  - --salt-text-link-foreground-visited
  + --salt-content-foreground-hover
  + --salt-content-foreground-active
  + --salt-content-foreground-visited

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
  ```

  #### `actionable` to `text-action`

  ```diff
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
  ```

  #### `selectable` to various others

  ```diff

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

  #### `track` to various others

  ```diff
  - --salt-track-borderWidth
  - --salt-track-borderWidth-active
  - --salt-track-borderWidth-complete
  - --salt-track-borderWidth-incomplete
  + --salt-size-border-strong
  ```

  #### Miscellaneous

  ```diff
  - --salt-overlayable-shadow-borderRegion
  + --salt-overlayable-shadow-region

  - --salt-text-link-textDecoration
  - --salt-text-link-textDecoration-hover
  - --salt-text-link-textDecoration-selected
  + --salt-navigable-textDecoration
  + --salt-navigable-textDecoration-hover
  + --salt-navigable-textDecoration-selected

  - --salt-navigable-primary-background-hover
  + --salt-navigable-background-hover

  - --salt-accent-fontWeight
  - --salt-accent-fontSize
  - --salt-accent-lineHeight
  + --salt-text-notation-fontWeight
  + --salt-text-notation-fontSize
  + --salt-text-notation-lineHeight: 10px; /* Value previously 11px in HD */

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

  - --salt-container-tertiary-background /* Use `transparent` */
  - --salt-container-tertiary-background-disabled /* Use `transparent` */
  - --salt-container-tertiary-borderColor /* Use `transparent` */
  - --salt-container-tertiary-borderColor-disabled /* Use `transparent` */
  ```

  ### Foundations

  - Updated `neutral` token value in `light` mode

  ```diff
  - --salt-palette-neutral-backdrop: var(--salt-color-black-fade-backdrop)
  + --salt-palette-neutral-backdrop: var(--salt-color-white-fade-backdrop)
  ```

  - Updated `size` token value for HD. Expect components using this token to have visual changes. This change would not affect `Icon` component as the smallest icon size remains as `12px`, like in UITK.

  ```diff
  - --salt-size-icon: 12px;
  + --salt-size-icon: 10px;
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

## 1.9.0

### Minor Changes

- 319140a6: New token added in `size.css` foundations:

  ```diff
  + --salt-size-bar-small
  ```

- 01f3a2b3: New token added in `size.css` foundations:

  ```diff
  + --salt-size-bar-strong
  + --salt-size-bar-small
  ```

## 1.8.0

### Minor Changes

- 7f03e39f: Added a new size token: `--salt-size-indicator`

### Patch Changes

- 7f03e39f: Deprecated the following size tokens:

  | Name                              | Replacement                               |
  | --------------------------------- | ----------------------------------------- |
  | `--salt-size-basis-unit`          | 4px                                       |
  | `--salt-size-adornmentGap`        | `--salt-spacing-75`                       |
  | `--salt-size-container-spacing`   | `--salt-spacing-300`                      |
  | `--salt-size-divider-strokeWidth` | `--salt-size-border`                      |
  | `--salt-size-separator-height`    | `--salt-size-base`                        |
  | `--salt-size-stackable`           | `--salt-size-base` + `--salt-spacing-100` |
  | `--salt-size-unit`                | `--salt-spacing-100`                      |
  | `--salt-size-compact`             | `--salt-size-adornment`                   |
  | `--salt-size-accent`              | `--salt-size-bar`                         |
  | `--salt-size-sharktooth-height`   | 5px                                       |
  | `--salt-size-sharktooth-width`    | 10px                                      |

- f1815504: Deprecated `--salt-zIndex-docked`. You can use `1050` directly if you need to.

## 1.7.1

### Patch Changes

- 2c6d86dd: Theme

  - Added `both` fill-mode to `--salt-animation-slide-out-*` css animation vars

## 1.7.0

### Minor Changes

- 21a76576: Added a new selectable token: `--salt-selectable-borderColor-readonly`.

  Changed the value of `--salt-palette-opacity-border-readonly`.

  ```diff
  - --salt-palette-opacity-border-readonly: var(--salt-opacity-8);
  + --salt-palette-opacity-border-readonly: var(--salt-opacity-15);
  ```

- b2ec14d9: Changed opacity foundation to a new scaled system.
  Deprecated tokens `--salt-opacity-1`, `--salt-opacity-2`, `--salt-opacity-3`, `--salt-opacity-4`.

  | Foundation token (deprecated) | Value | Use instead       |
  | ----------------------------- | ----- | ----------------- |
  | --salt-opacity-1              | 0.15  | --salt-opacity-15 |
  | --salt-opacity-2              | 0.25  | --salt-opacity-25 |
  | --salt-opacity-3              | 0.40  | --salt-opacity-40 |
  | --salt-opacity-4              | 0.70  | --salt-opacity-70 |

  ```diff
  - --salt-opacity-15: 0.15;
  - --salt-opacity-25: 0.25;
  - --salt-opacity-40: 0.40;
  - --salt-opacity-70: 0.70;
  + --salt-opacity-0: 0.00;
  + --salt-opacity-8: 0.08;
  + --salt-opacity-15: 0.15;
  + --salt-opacity-25: 0.25;
  + --salt-opacity-40: 0.40;
  + --salt-opacity-70: 0.70;
  ```

  Added `--salt-palette-opacity-disabled` to replace `--salt-palette-opacity-border`, `--salt-palette-opacity-background`, `--salt-palette-opacity-foreground`, `--salt-palette-opacity-fill`, `--salt-palette-opacity-stroke`

  | Palette token (deprecated)        | Value  | Use instead                     | New value |
  | --------------------------------- | ------ | ------------------------------- | --------- |
  | --salt-palette-opacity-background | 0.40   | --salt-palette-opacity-disabled | 0.40      |
  | --salt-palette-opacity-border     | 0.40   | --salt-palette-opacity-disabled | 0.40      |
  | --salt-palette-opacity-stroke     | 0.40   | --salt-palette-opacity-disabled | 0.40      |
  | --salt-palette-opacity-fill       | 0.40   | --salt-palette-opacity-disabled | 0.40      |
  | --salt-palette-opacity-foreground | 0.70\* | --salt-palette-opacity-disabled | 0.40      |

  \* Usages of `--salt-palette-opacity-foreground` should now map to a value of 0.40 rather than 0.70

  Mapped palette opacity tokens to new opacity values

  | Palette token                              | Old value              | New value               |
  | ------------------------------------------ | ---------------------- | ----------------------- |
  | --salt-palette-opacity-background-readonly | --salt-opacity-1: 0.15 | --salt-opacity-0: 0.00  |
  | --salt-palette-opacity-border-readonly     | --salt-opacity-2: 0.25 | --salt-opacity-8: 0.08  |
  | --salt-palette-opacity-backdrop            | --salt-opacity-4: 0.70 | --salt-opacity-70: 0.70 |
  | --salt-palette-opacity-primary-border      | --salt-opacity-3: 0.40 | --salt-opacity-40: 0.40 |
  | --salt-palette-opacity-secondary-border    | --salt-opacity-2: 0.25 | --salt-opacity-25: 0.25 |
  | --salt-palette-opacity-tertiary-border     | --salt-opacity-1: 0.15 | --salt-opacity-15: 0.15 |

  ```diff
  - --salt-palette-opacity-background: var(--salt-opacity-3);
  - --salt-palette-opacity-border: var(--salt-opacity-3);
  - --salt-palette-opacity-foreground: var(--salt-opacity-4);
  - --salt-palette-opacity-fill: var(--salt-opacity-3);
  - --salt-palette-opacity-stroke: var(--salt-opacity-3);
  - --salt-palette-opacity-background-readonly:   var(--salt-opacity-1);
  - --salt-palette-opacity-border-readonly: var(--salt-opacity-2);
  - --salt-palette-opacity-backdrop: var(--salt-opacity-4);
  - --salt-palette-opacity-primary-border: var(--salt-opacity-3);
  - --salt-palette-opacity-secondary-border: var(--salt-opacity-2);
  - --salt-palette-opacity-tertiary-border: var(--salt-opacity-1);
  + --salt-palette-opacity-backdrop: var(--salt-opacity-70);
  + --salt-palette-opacity-background-readonly: var(--salt-opacity-0);
  + --salt-palette-opacity-border-readonly: var(--salt-opacity-8);
  + --salt-palette-opacity-primary-border: var(--salt-opacity-40);
  + --salt-palette-opacity-secondary-border: var(--salt-opacity-25);
  + --salt-palette-opacity-tertiary-border: var(--salt-opacity-15);
  + --salt-palette-opacity-disabled: var(--salt-opacity-40);
  ```

### Patch Changes

- 1f0cb87d: Refactored the theme file structure for easier maintainability.

  Added the missing deprecated token: `--salt-palette-warning-foreground-disabled`.

- 87556137: Changed `--salt-duration-instant` to 0ms

## 1.6.0

### Minor Changes

- c9981881: New token introduced in `selectable` characteristic, new palette tokens

  ```diff
  + --salt-selectable-background-selectedDisabled: var(--salt-palette-interact-background-activeDisabled);
  ```

  New value in light mode

  ```diff
  + --salt-palette-interact-background-activeDisabled: var(--salt-color-blue-30-fade-background);
  ```

  New value in dark mode

  ```diff
  + --salt-palette-interact-background-activeDisabled: var(--salt-color-blue-700-fade-background);
  ```

- 71fc7474: Add new list components: ListNext, ListItemNext

  ```
  <ListNext>
    <ListItemNext value={Alaska}>
      {Alaska}
    </ListItemNext>
  </ListNext>

  ```

- b52cc743: Deprecated the following tokens: Use hex value as replacement if needed.

  ```diff
  - --salt-status-info-foreground-disabled: #2670A9B3
  - --salt-status-success-foreground-disabled: #24874BB3
  - --salt-status-warning-foreground-disabled: #EA7319B3
  - --salt-status-error-foreground-disabled: #E32B16B3
  - --salt-status-static-foreground-disabled: #61656E | #B4B7BE
  - --salt-status-negative-foreground-disabled: #FF5942B3 | #A6150BB3
  - --salt-status-positive-foreground-disabled: #3CAB60B3 | #0C5D2EB3
  - --salt-status-info-borderColor-disabled: #2670A966
  - --salt-status-success-borderColor-disabled: #24874B66
  - --salt-status-warning-borderColor-disabled: #EA731966
  - --salt-status-error-borderColor-disabled: #E32B1666
  - --salt-palette-error-border-disabled: #E32B1666
  - --salt-palette-warning-border-disabled: #EA731966
  - --salt-palette-success-border-disabled: #24874B66
  - --salt-palette-info-border-disabled: #2670A966
  - --salt-palette-error-foreground-disabled: #E32B16B3
  - --salt-palette-success-foreground-disabled: #24874BB3
  - --salt-palette-info-foreground-disabled: #2670A9B3
  ```

  Any components that have a validation state should not be able to simultaneously be disabled. Consider altering code if this is the case.

- 5227fd57: Added `--salt-selectable-cursor-readonly` token with `not-allowed` value

## 1.5.1

### Patch Changes

- 813daa28: Fixed the duration foundation token values having invalid values

## 1.5.0

### Minor Changes

- b6f304f9: Added size tokens

  ```diff
  + --salt-size-adornment
  + --salt-size-bar
  + --salt-size-selectable
  + --salt-size-icon
  ```

  `--salt-size-base ` changed from a calculation on the basis unit to hardcoded values per density
  `--salt-size-border` defined as 1px per density rather than set globally

- e8b146a5: Add new spacing tokens and a spacing foundation.

  ```css
  --salt-spacing-25
  --salt-spacing-50
  --salt-spacing-75
  --salt-spacing-100
  --salt-spacing-150
  --salt-spacing-200
  --salt-spacing-250
  --salt-spacing-300
  --salt-spacing-350
  --salt-spacing-400
  ```

### Patch Changes

- 1e9ef1a2: Fix duplicate Salt libraries being installed when multiple libraries are installed

## 1.4.0

### Minor Changes

- 8bcc9d04: Deprecated tertiary editable tokens: If needed, use `#00000066` as a replacement for `--salt-editable-tertiary-background-readonly`, and use `transparent` as a replacement for all remaining tokens
  Deprecated `tertiary` variant in FormField
- bf66b578: Deprecated -emphasize tokens in status and palette; replaced with default tokens

  `--salt-status-error-background-emphasize` replaced with `--salt-status-error-background`
  `--salt-status-info-background-emphasize` replaced with `--salt-status-info-background`
  `--salt-status-success-background-emphasize` replaced with `--salt-status-success-background`
  `--salt-status-warning-background-emphasize` replaced with `--salt-status-warning-background`

  `--salt-palette-error-background-emphasize` replaced with `--salt-palette-error-background`
  `--salt-palette-info-background-emphasize` replaced with `--salt-palette-info-background`
  `--salt-palette-success-background-emphasize` replaced with `--salt-palette-success-background`
  `--salt-palette-warning-background-emphasize` replaced with `--salt-palette-warning-background`

- ea857f24: Deprecated `--salt-size-icon-base`, replaced with `--salt-icon-size-base`
  Added `--salt-icon-size-status-adornment`

## 1.3.0

### Minor Changes

- 6d2c3a32: Deprecate delay foundation; replace with duration
- ea010ffa: New `--salt-size-container-spacing` and `--salt-size-adornmentGap` tokens

  ```diff
  +  --salt-size-container-spacing: calc(3 * var(--salt-size-unit));
  +  --salt-size-adornmentGap: calc(0.75 * var(--salt-size-unit));
  ```

- d8f8b305: Added `--salt-accent-foreground-disabled`

  ```diff
  + --salt-accent-foreground-disabled: var(--salt-palette-accent-foreground-disabled)
  + --salt-palette-accent-foreground-disabled
  ```

- 7a025091: Bug fix

  ```diff
  - --salt-palette-interact-foreground-disabled: var(--salt-color-90-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-90-fade-foreground);
  ```

- 91e7cbdf: Added `--salt-accent-borderColor-disabled`

  ```diff
  + --salt-accent-borderColor-disabled: var(--salt-palette-accent-border-disabled);
  + --salt-palette-accent-border-disabled
  ```

### Patch Changes

- 8d29c01f: New font family css variable for all text components which point to `--salt-typography-fontFamily`.

  ```
  --salt-text-display1-fontFamily
  --salt-text-display2-fontFamily
  --salt-text-display3-fontFamily
  --salt-text-h1-fontFamily
  --salt-text-h2-fontFamily
  --salt-text-h3-fontFamily
  --salt-text-h4-fontFamily
  --salt-text-label-fontFamily
  ```

## 1.2.0

### Minor Changes

- 974c92da: - New characteristics introduced in `accent`, new palette token

  ```diff
  + --salt-accent-background-disabled: var(--salt-palette-accent-background-disabled);
  + --salt-palette-accent-background-disabled
  ```

  - New characteristics introduced in `selectable`, new palette tokens

  ```diff
  + --salt-selectable-foreground: var(--salt-palette-interact-foreground);
  + --salt-selectable-foreground-disabled: var(--salt-palette-interact-foreground-disabled);
  + --salt-selectable-foreground-hover: var(--salt-palette-interact-foreground-hover);
  + --salt-selectable-foreground-selected: var(--salt-palette-interact-foreground-active);
  + --salt-selectable-foreground-selectedDisabled: var(--salt-palette-interact-foreground-activeDisabled);
  + --salt-palette-interact-foreground-active
  + --salt-palette-interact-foreground-activeDisabled
  + --salt-palette-interact-foreground-hover
  ```

  Updated values in light mode

  ```diff
  - --salt-palette-interact-foreground: var(--salt-color-gray-900);
  + --salt-palette-interact-foreground: var(--salt-color-gray-200);
  - --salt-palette-interact-foreground-disabled: var(--salt-color-gray-900-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-200-fade-foreground);
  - --salt-palette-interact-foreground-hover: var(--salt-color-gray-500);
  + --salt-palette-interact-foreground-hover: var(--salt-color-blue-500);
  ```

  Updated values in dark mode

  ```diff
  - --salt-palette-interact-foreground: var(--salt-color-white);
  + --salt-palette-interact-foreground: var(--salt-color-gray-90);
  - --salt-palette-interact-foreground-disabled: var(--salt-color-white-fade-foreground);
  + --salt-palette-interact-foreground-disabled: var(--salt-color-gray-90-fade-foreground);
  - --salt-palette-interact-foreground-hover: var(--salt-color-gray-500);
  + --salt-palette-interact-foreground-hover: var(--salt-color-blue-500);
  ```

  - Deprecated the following `selectable` tokens, use `--salt-text-primary-foreground` and `--salt-text-primary-foreground-disabled` as replacements

  ```diff
  - --salt-selectable-cta-foreground
  - --salt-selectable-cta-foreground-disabled
  - --salt-selectable-primary-foreground
  - --salt-selectable-primary-foreground-disabled
  - --salt-selectable-secondary-foreground
  - --salt-selectable-secondary-foreground-disabled
  - --salt-selectable-foreground-partial
  - --salt-selectable-foreground-partialDisabled
  ```

  - `Measured` characteristic replaced with `Track`

  Deprecated tokens prefixed by `--salt-measured-` and corresponding palette tokens
  New `--salt-track-` tokens and corresponding palette tokens

  The following are a direct replacement mapping:

  ```diff
  - --salt-measured-borderStyle
  - --salt-measured-borderStyle-active
  - --salt-measured-borderStyle-complete
  - --salt-measured-borderStyle-incomplete
  + --salt-track-borderStyle
  + --salt-track-borderStyle-active
  + --salt-track-borderStyle-complete
  + --salt-track-borderStyle-incomplete
  - --salt-measured-borderWidth
  - --salt-measured-borderWidth-active
  - --salt-measured-borderWidth-complete
  - --salt-measured-borderWidth-incomplete
  + --salt-track-borderWidth
  + --salt-track-borderWidth-active
  + --salt-track-borderWidth-complete
  + --salt-track-borderWidth-incomplete
  - --salt-measured-fontWeight
  - --salt-measured-textAlign
  + --salt-track-fontWeight
  + --salt-track-textAlign
  - --salt-measured-background: var(--salt-palette-measured-background);
  - --salt-measured-background-disabled: var(--salt-palette-measured-background-disabled);
  - --salt-measured-borderColor: var(--salt-palette-measured-border);
  + --salt-track-background: var(--salt-palette-track-background);
  + --salt-track-background-disabled: var(--salt-palette-track-background-disabled);
  + --salt-track-borderColor: var(--salt-palette-track-border);
  + --salt-track-borderColor-disabled: var(--salt-palette-track-border-disabled);
  - --salt-palette-measured-background
  - --salt-palette-measured-background-disabled
  - --salt-palette-measured-border
  - --salt-palette-measured-border-disabled
  + --salt-palette-track-background
  + --salt-palette-track-background-disabled
  + --salt-palette-track-border
  + --salt-palette-track-border-disabled
  ```

  The following should be replaced with the corresponding `selectable` tokens:

  ```diff
  - --salt-measured-foreground: var(--salt-palette-measured-foreground);
  - --salt-measured-foreground-disabled: var(--salt-palette-measured-foreground-disabled);
  - --salt-measured-foreground-hover: var(--salt-palette-measured-foreground-active);
  - --salt-measured-foreground-active: var(--salt-palette-measured-foreground-active);
  - --salt-measured-foreground-activeDisabled: var(--salt-palette-measured-foreground-activeDisabled);
  - --salt-measured-borderColor-disabled: var(--salt-palette-measured-border-disabled);
  ```

  The following should be replaced with the corresponding `accent` background tokens:

  ```diff
  - --salt-measured-fill: var(--salt-palette-measured-fill);
  - --salt-measured-fill-disabled: var(--salt-palette-measured-fill-disabled);
  ```

  - Usages of `measured` tokens in core and labs components updated to use appropriate characteristic replacement

  - Deprecated the following tokens, use hex value as replacement if needed:

  ```diff
  - --salt-measured-foreground-undo: #2670a9
  - --salt-palette-measured-fill: #2670A9
  - --salt-palette-measured-fill-disabled: #2670A966
  - --salt-palette-measured-foreground-active: #2670A9
  - --salt-palette-measured-foreground-activeDisabled: #2670A966
  - --salt-palette-interact-foreground-partial: #155C93
  - --salt-palette-interact-foreground-partialDisabled: #155C93B3
  ```

- d2b983de: New status tokens

  ```diff
  + --salt-status-info-foreground-disabled: var(--salt-palette-info-foreground-disabled);
  + --salt-status-success-foreground-disabled: var(--salt-palette-success-foreground-disabled);
  + --salt-status-warning-foreground-disabled: var(--salt-palette-warning-foreground-disabled);
  + --salt-status-error-foreground-disabled: var(--salt-palette-error-foreground-disabled);
  + --salt-status-static-foreground-disabled: var(--salt-palette-neutral-secondary-foreground-disabled);
  + --salt-status-negative-foreground-disabled: var(--salt-palette-negative-foreground-disabled);
  + --salt-status-positive-foreground-disabled: var(--salt-palette-positive-foreground-disabled);

  + --salt-status-info-borderColor-disabled: var(--salt-palette-info-border-disabled);
  + --salt-status-success-borderColor-disabled: var(--salt-palette-success-border-disabled);
  + --salt-status-warning-borderColor-disabled: var(--salt-palette-warning-border-disabled);
  + --salt-status-error-borderColor-disabled: var(--salt-palette-error-border-disabled);

  + --salt-palette-info-border-disabled
  + --salt-palette-info-foreground-disabled
  + --salt-palette-warning-border-disabled
  + --salt-palette-warning-foreground-disabled
  + --salt-palette-error-border-disabled
  + --salt-palette-error-foreground-disabled
  + --salt-palette-success-foreground-disabled
  + --salt-palette-success-border-disabled
  + --salt-palette-negative-foreground-disabled
  + --salt-palette-positive-foreground-disabled
  ```

## 1.1.0

### Minor Changes

- d460fb7b: Deprecated `--salt-size-detail`; replaced with `--salt-size-compact`
- 5ead0bbf: Deprecated `--salt-size-selection`; replaced with `--salt-size-selectable`
- 2e0fdff0: Deprecated `--salt-size-graphic-small`, `--salt-size-graphic-medium`, `--salt-size-graphic-large`
  Deprecated `--salt-size-divider-height`, `--salt-size-divider-strokeWidth`, replaced with `--salt-size-separator-height`, `--salt-size-separator-strokeWidth`
- 9d3dda91: Theme update: changed the value of `--salt-palette-warning-border` and `--salt-palette-warning-foreground` to `--salt-color-orange-700` in light mode to fix accessibility issues
- 649d5394: Added a new opacity token for readonly backgrounds

  ```diff
  - --salt-color-white-fade-background-readonly: rgba(255, 255, 255, var(--salt-palette-opacity-readonly));
  - --salt-color-gray-20-fade-background-readonly: rgba(234, 237, 239, var(--salt-palette-opacity-readonly));
  - --salt-color-gray-600-fade-background-readonly: rgba(47, 49, 54, var(--salt-palette-opacity-readonly));
  - --salt-color-gray-800-fade-background-readonly: rgba(36, 37, 38, var(--salt-palette-opacity-readonly));
  + --salt-palette-opacity-background-readonly: var(--salt-opacity-1)
  + --salt-color-white-fade-background-readonly: rgba(255, 255, 255, var(--salt-palette-opacity-background-readonly));
  + --salt-color-gray-20-fade-background-readonly: rgba(234, 237, 239, var(--salt-palette-opacity-background-readonly));
  + --salt-color-gray-600-fade-background-readonly: rgba(47, 49, 54, var(--salt-palette-opacity-background-readonly));
  + --salt-color-gray-800-fade-background-readonly: rgba(36, 37, 38, var(--salt-palette-opacity-background-readonly));
  ```

- e33f5610: Theme update: changed the value of `--salt-palette-success-border` and `--salt-palette-success-foreground` to `--salt-color-green-400` in dark mode to fix accessibility issues
- d975171f: Deprecated `--salt-size-brandBar`; replaced with `--salt-size-accent` with new density dependent values
- 9cae606a: Deprecated differential characteristic; replaced tokens with below
  Moved differential tokens to status characteristic
  Added 'static' status variant

  ```diff
  - --salt-differential-positive-foreground
  - --salt-differential-negative-foreground
  + --salt-status-positive-foreground
  + --salt-status-negative-foreground
  + --salt-status-static-foreground
  ```

- 1f579da6: Added tokens for success, warning, and error backgrounds on selected state

  ```diff
  + --salt-status-success-background-selected
  + --salt-status-warning-background-selected
  + --salt-status-error-background-selected
  + --salt-palette-success-background-selected
  + --salt-palette-warning-background-selected
  + --salt-palette-error-background-selected
  ```

### Patch Changes

- 8e9446bf: Fixed the shadow token value

  ```diff
  - --salt-shadow-5: 0 12px 40px 5px var(--salt-shadow-5-color);
  + --salt-shadow-5: 0 12px 40px 0 var(--salt-shadow-5-color);
  ```

- 1ad02da3: Deprecated `--salt-overlayable-shadow-scroll-color`, use `--salt-shadow-1-color` instead

## 1.0.0

### Major Changes

- c1bc7479: Salt is the J.P. Morgan design system, an open-source solution for building exceptional products and digital experiences in financial services and other industries. It offers you well-documented, accessible components as well as comprehensive design templates, style libraries and assets.

  With this initial release we're providing:

  - AG Grid Theme
  - Border Layout
  - Button
  - Data Grid
  - Flex Layout
  - Flow Layout
  - Grid Layout
  - Icon
  - Link
  - Salt Provider
  - Stack Layout
  - Status Indicator
  - Text
  - Theme

  And a number of other lab components.
