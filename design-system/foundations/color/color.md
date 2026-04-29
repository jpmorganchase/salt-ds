# Color

Salt uses semantic color tokens organized by **characteristic**. These tokens adapt automatically to light/dark mode and theming — you never need to write conditional color logic.

## Core rule

**Never use raw color values** (hex, rgb, hsl, named colors). Always use `--salt-*` characteristic tokens.

## Characteristic → UI intent mapping

| UI intent                        | Characteristic   | Example token                              |
| -------------------------------- | ---------------- | ------------------------------------------ |
| Buttons, links, interactive controls | `actionable` | `--salt-actionable-primary-background`     |
| Navigation items, tabs, breadcrumbs  | `navigable`  | `--salt-navigable-primary-foreground`      |
| Info, success, warning, error states | `status`     | `--salt-status-error-foreground`           |
| Checkboxes, radios, selection        | `selectable` | `--salt-selectable-primary-background`     |
| Text inputs, text areas              | `editable`   | `--salt-editable-primary-background`       |
| Panels, cards, surfaces             | `container`  | `--salt-container-primary-background`      |
| Text, labels, body copy             | `content`    | `--salt-content-primary-foreground`        |
| Tooltips, dialogs, popovers         | `overlayable`| `--salt-overlayable-background`            |

## Background/foreground pairing

Always use matched pairs from the **same** characteristic:

```css
/* ✅ Correct — same characteristic */
.myButton {
  background: var(--salt-actionable-primary-background);
  color: var(--salt-actionable-primary-foreground);
}

/* ❌ Wrong — mixed characteristics */
.myButton {
  background: var(--salt-actionable-primary-background);
  color: var(--salt-content-primary-foreground);
}
```

## Rules

- **Never hard-code colors.** No `#fff`, `rgb(0,0,0)`, or `color: red`.
- **Use characteristic tokens only.** Don't consume foundation or palette tokens directly — they are internal to the design system.
- **Match background and foreground from the same characteristic.** This ensures proper contrast in all modes.
- **Don't mix characteristics.** Each element should draw its colors from a single characteristic group.
- **All tokens work in both modes.** A component styled with `--salt-container-primary-background` will have the correct color in both light and dark mode with no extra work.
- **Test in both modes.** Custom CSS using Salt tokens will work automatically, but always verify visually.

## Examples

### Container with content text

```css
.myPanel {
  background: var(--salt-container-primary-background);
  border: 1px solid var(--salt-container-primary-border-color);
}

.myPanel p {
  color: var(--salt-content-primary-foreground);
}
```

### Status message

```css
.errorBanner {
  background: var(--salt-status-error-background);
  color: var(--salt-status-error-foreground);
}
```

### Don't

```css
/* ❌ Hard-coded colors break in dark mode */
.myPanel {
  background: #ffffff;
  color: #333333;
}
```
