# Mega Menu — Visual Design Specification

## Mega Menu Item

### Size & Spacing

- Mega menu item can have an optional **decorative icon** and **swap instance** (static components only, e.g., badge, tag).
- When a mega menu item has a long label, all text should **wrap**.
- **Flexible width**: The width of each mega menu item, header, and group is flexible and adapts based on content, breakpoints, and specific use cases. For visual consistency, maintain the same width for all mega menu items within a container.

**Spacing tokens (MD density):**

| Token | Value |
|-------|-------|
| `--salt-spacing-50` | Internal spacing |
| `--salt-spacing-100` | Internal spacing |

### Typography

| Element | Text Style |
|---------|------------|
| Item label | `text-body-default` |
| Secondary label | `text-label-default` |

### States — Light & Dark Mode

> Dark mode uses the same tokens as light mode.

| State | Foreground | Background | Border |
|-------|-----------|------------|--------|
| **Default** | `--salt-content-primary-foreground` | — | — |
| **Hover** | `--salt-content-primary-foreground` | `--salt-overlayable-background-hover` | — |
| **Active** | `--salt-content-primary-foreground` | `--salt-navigable-accent-background-active` | `--salt-navigable-accent-border-active` |

#### With Secondary Label

| State | Primary Foreground | Secondary Foreground | Background |
|-------|-------------------|---------------------|------------|
| **Default** | `--salt-content-primary-foreground` | `--salt-content-secondary-foreground` | — |
| **Hover** | `--salt-content-primary-foreground` | `--salt-content-secondary-foreground` | `--salt-overlayable-background-hover` |

---

## Mega Menu Header

### Size & Spacing

- Mega menu header is used to group nested mega menu items.

**Spacing tokens (MD density):**

| Token | Value |
|-------|-------|
| `--salt-spacing-50` | Internal spacing |
| `--salt-spacing-100` | Internal spacing |

### Typography

| Element | Text Style |
|---------|------------|
| Header label | `text-label-strong` |

### States — Light & Dark Mode

> Dark mode uses the same tokens as light mode.

| Property | Token |
|----------|-------|
| Foreground | `--salt-content-secondary-foreground` |
| Border (bottom separator) | `--salt-separable-tertiary-border` |

---

## Mega Menu Group

### Size & Spacing

- A mega menu group contains **one mega menu header** and **up to 10 mega menu items**.

**Spacing tokens (MD density):**

| Token | Usage |
|-------|-------|
| `--salt-spacing-fixed-100` | Gap between header and items |

---

## Mega Menu Container

### Size & Spacing

- The mega menu container holds mega menu groups, an optional content region, and optional links.
- By default, the mega menu expands to fill the available width, stopping at the left and right `--salt-layout-page-margin` so the container edge/shadow doesn't appear clipped.

**Spacing tokens (MD density):**

| Token | Usage |
|-------|-------|
| `--salt-spacing-25` | Internal |
| `--salt-spacing-50` | Internal |
| `--salt-spacing-75` | Internal |
| `--salt-spacing-100` | Internal |
| `--salt-spacing-150` | Internal |
| `--salt-spacing-200` | Internal |
| `--salt-spacing-250` | Internal |
| `--salt-spacing-300` | Container/content padding |
| `--salt-spacing-350` | Internal |
| `--salt-spacing-400` | Internal |
| `--salt-layout-page-margin` | Container boundary margin |

### Container Width Variants

#### Hug-content (Default)

The mega menu container width sizes to fit its menu groups/items (intrinsic width).

#### Full-width

The full-width mega menu spans the available horizontal space. Two configuration options are supported:

| Option | Behavior |
|--------|----------|
| **Max-width content** (recommended) | Container expands to full available width. Content area is constrained to a maximum width and center-aligned, creating balanced left/right margins on large displays. |
| **True full-bleed** | Container expands to the left and right `--salt-layout-page-margin` (so the container edge/shadow remains visible). Content extends to the container edges with no additional left/right spacing. |

### Flexible Height

The mega menu container has a flexible height that hugs its content. The maximum visible height never exceeds the viewport height. If the content is taller than the visible area, the mega menu becomes **scrollable**.

### States — Light & Dark Mode

> Dark mode uses the same tokens as light mode.

| Property | Token |
|----------|-------|
| Border | `--salt-container-primary-border` |
| Background | `--salt-container-primary-background` |
| Shadow | `--salt-overlayable-shadow-modal` |

---

## Content Region

The mega menu container supports an optional content region for adding custom elements. This region can be positioned on the **right**, **left**, **top**, or **bottom** of the container.

### Layout Rules

| Position | Width | Height |
|----------|-------|--------|
| **Left / Right** | Customizable | Hug-content or fill container height |
| **Top / Bottom** | Fills container width | Customizable |

### Default Padding

`--salt-spacing-300` (matching the mega menu container padding).

### Content Best Practices

- Content must comply with **ADA standards**.
- **Background color**: Apply primary, secondary, or tertiary background colors as needed.
- **Custom content**: Can contain text, images, static components (icons, tags), and actions (links, buttons).
- **Modal usage**: Do **not** trigger additional modals from actions within the content region. This often introduces accessibility issues.
- **Accessibility**: Ensure all actions are keyboard accessible, have clear labels for screen readers, and maintain proper focus order and visible focus indicators.
- **Images**: Always include descriptive alt text to support screen readers.

---

## Secondary Label (Future Reference)

> **Note:** For the initial release, the secondary label has been removed as it is not a requirement from product teams. This design is saved for future reference. Adding the secondary label is feasible in the code if needed.

- A secondary label sits beneath the main item text, providing additional context or brief descriptions for each option.
- Items with secondary labels support decorative icons and swap instances.

**Additional spacing tokens (MD density):**

| Token | Usage |
|-------|-------|
| `--salt-spacing-25` | Internal |
| `--salt-spacing-50` | Internal |
| `--salt-spacing-75` | Between label and secondary label |
| `--salt-spacing-100` | Internal |
