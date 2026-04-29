# Token Architecture

Salt uses a three-tier token system. Understanding which tier to consume is critical.

## Three tiers

### 1. Foundation tokens (don't consume directly)

Raw design values — literal colors, pixel sizes, font stacks. These are the building blocks but are **not intended for direct use** in application code.

Example: `--salt-color-blue-500` (a raw hex value)

### 2. Palette tokens (don't consume directly)

Foundation tokens mapped per mode (light/dark). They bridge raw values to semantic meaning but are still **internal to the design system**.

Example: `--salt-palette-interact-background` (maps to different foundation tokens in light vs. dark)

### 3. Characteristic tokens ✅ (consume these)

Semantic tokens that describe **what the token is for**, not what it looks like. These are the only tokens you should use in application code.

Example: `--salt-actionable-primary-background`

## Why characteristic tokens?

- **Mode-adaptive**: automatically resolve to the correct color in light and dark mode.
- **Density-adaptive**: spacing and sizing tokens adjust to the current density.
- **Theme-adaptive**: tokens resolve differently per brand/theme.
- **Self-documenting**: the token name tells you its purpose.

## Token naming convention

```
--salt-{characteristic}-{variant}-{property}
```

| Segment          | Meaning                                    | Examples                                    |
| ---------------- | ------------------------------------------ | ------------------------------------------- |
| `characteristic` | Semantic group                             | `actionable`, `container`, `content`        |
| `variant`        | Sub-category within the characteristic     | `primary`, `secondary`, `cta`, `info`       |
| `property`       | CSS property the token maps to             | `background`, `foreground`, `border-color`  |

### Examples

| Token                                      | Reads as                                            |
| ------------------------------------------ | --------------------------------------------------- |
| `--salt-actionable-primary-background`     | Actionable (button) → primary variant → background  |
| `--salt-container-secondary-background`    | Container (surface) → secondary variant → background |
| `--salt-status-error-foreground`           | Status → error variant → foreground (text color)    |
| `--salt-editable-primary-border-color`     | Editable (input) → primary variant → border color   |

## Characteristic groups

| Characteristic | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `actionable`   | Buttons, links, interactive controls             |
| `navigable`    | Navigation items, tabs, breadcrumbs              |
| `status`       | Info, success, warning, error states             |
| `selectable`   | Checkboxes, radio buttons, selection states      |
| `editable`     | Inputs, text areas, editable content             |
| `container`    | Panels, cards, surfaces                          |
| `content`      | Text, labels, general content                    |
| `overlayable`  | Tooltips, dialogs, popovers                      |

## Quick decision guide

1. **Styling a standard UI element?** → Use the matching Salt component (it handles tokens internally).
2. **Writing custom CSS?** → Use `--salt-{characteristic}-*` tokens only.
3. **Tempted to use a foundation or palette token?** → Stop. Find the characteristic equivalent.
4. **Can't find a characteristic token?** → Check the [Salt documentation](https://www.saltdesignsystem.com/salt/themes/index) or ask before inventing one.
