# Characteristic Tokens

Detailed guidance for each characteristic group. Use these tokens in custom CSS to ensure your styles adapt to mode, density, and theme.

---

## Actionable

**What it's for:** Buttons, links, interactive controls — any element the user clicks/taps to trigger an action.

**When to use:** Styling custom interactive elements that aren't covered by a Salt component.

**Tokens:**
- `--salt-actionable-primary-background` / `--salt-actionable-primary-foreground`
- `--salt-actionable-secondary-background` / `--salt-actionable-secondary-foreground`
- `--salt-actionable-cta-background` / `--salt-actionable-cta-foreground`

**Example:**
```css
.customButton {
  background: var(--salt-actionable-primary-background);
  color: var(--salt-actionable-primary-foreground);
  cursor: pointer;
}
```

---

## Navigable

**What it's for:** Navigation items, tabs, breadcrumbs, menu items — elements that move the user between views or sections.

**When to use:** Styling custom navigation elements.

**Tokens:**
- `--salt-navigable-primary-background` / `--salt-navigable-primary-foreground`
- `--salt-navigable-indicator` (active/selected indicator)

**Example:**
```css
.navItem {
  color: var(--salt-navigable-primary-foreground);
}
.navItem[aria-current="page"] {
  border-bottom: 2px solid var(--salt-navigable-indicator);
}
```

---

## Status

**What it's for:** Communicating system state — informational messages, success confirmations, warnings, and errors.

**When to use:** Styling status banners, alerts, inline validation messages, or status badges.

**Tokens:**
- `--salt-status-info-foreground` / `--salt-status-info-background`
- `--salt-status-success-foreground` / `--salt-status-success-background`
- `--salt-status-warning-foreground` / `--salt-status-warning-background`
- `--salt-status-error-foreground` / `--salt-status-error-background`

**Example:**
```css
.warningBanner {
  background: var(--salt-status-warning-background);
  color: var(--salt-status-warning-foreground);
}
```

---

## Selectable

**What it's for:** Selection controls — checkboxes, radio buttons, list item selection, toggle states.

**When to use:** Styling custom selection indicators or selected states.

**Tokens:**
- `--salt-selectable-primary-background` / `--salt-selectable-primary-foreground`

**Example:**
```css
.selectedRow {
  background: var(--salt-selectable-primary-background);
  color: var(--salt-selectable-primary-foreground);
}
```

---

## Editable

**What it's for:** Form inputs, text areas, and any editable content area.

**When to use:** Styling custom input-like elements or editable surfaces.

**Tokens:**
- `--salt-editable-primary-background` / `--salt-editable-primary-foreground`
- `--salt-editable-primary-border-color`

**Example:**
```css
.customInput {
  background: var(--salt-editable-primary-background);
  color: var(--salt-editable-primary-foreground);
  border: 1px solid var(--salt-editable-primary-border-color);
}
```

---

## Container

**What it's for:** Surfaces and structural containers — panels, cards, sections, sidebars.

**When to use:** Styling custom containers, wrappers, or layout surfaces.

**Tokens:**
- `--salt-container-primary-background` / `--salt-container-secondary-background`
- `--salt-container-primary-border-color`

**Example:**
```css
.sidebar {
  background: var(--salt-container-secondary-background);
  border-right: 1px solid var(--salt-container-primary-border-color);
}
```

---

## Content

**What it's for:** Text, labels, and general non-interactive content.

**When to use:** Styling text color when Salt text components aren't sufficient (rare).

**Tokens:**
- `--salt-content-primary-foreground` (main text color)
- `--salt-content-secondary-foreground` (de-emphasized text)

**Example:**
```css
.description {
  color: var(--salt-content-secondary-foreground);
}
```

---

## Overlayable

**What it's for:** Floating surfaces that overlay the page — tooltips, dialogs, popovers, dropdown menus.

**When to use:** Styling custom overlay surfaces.

**Tokens:**
- `--salt-overlayable-background`
- `--salt-overlayable-border-color`

**Example:**
```css
.customTooltip {
  background: var(--salt-overlayable-background);
  border: 1px solid var(--salt-overlayable-border-color);
}
```

---

## General rules

1. **Always pair background and foreground from the same characteristic.** Don't mix actionable foreground with container background.
2. **Prefer Salt components over custom-styled elements.** Components already use the correct tokens internally.
3. **All characteristic tokens adapt to mode and theme.** You never need to write light/dark conditional styles.
