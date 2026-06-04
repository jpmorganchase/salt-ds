# MegaMenu — navigation & accessibility contract

The single source of truth for MegaMenu's keyboard, focus, and ARIA behavior.
It reflects the **implemented** behavior, verified by the Cypress specs in
`packages/lab/src/__tests__/__e2e__/mega-menu/`. If code and this document
disagree, that is a bug in one of them — reconcile, don't guess.

---

## 1. Structure & ARIA

- **Trigger** — a `button` (role `button`). It carries `aria-expanded`
  (reflecting open/closed) and, while open, `aria-controls` referencing the
  panel's `id`. Triggers live in a `<nav>` landmark, grouped as `<ul>`/`<ol>`
  with each trigger in its own `<li>`. (If a page has more than one `<nav>`,
  each needs an accessible name.)
- **Panel** — a `<div role="region">`. The author must provide an `aria-label`
  describing the menu (e.g. `aria-label="Solutions menu"`).
- **Section** — renders a `<ul>` with `aria-labelledby` pointing at its
  `MegaMenuHeading`; each item is wrapped in an `<li>`.
- **Heading** — supplies the section list's accessible name.
- **Aside / Footer** — generic content wrappers. The wrapper itself is **not
  focusable** (no `tabindex`); only its interactive descendants participate in
  navigation.

## 2. Layout & focus order

The panel owns its layout. A first-layer child's position is derived from its
**component type** and its **source order** relative to `MegaMenuGroups` — there
are no placement props:

| Child | Before `MegaMenuGroups` | After `MegaMenuGroups` |
| --- | --- | --- |
| `MegaMenuAside` (side content) | left | right |
| `MegaMenuFooter` (full-width content) | top | bottom |
| `MegaMenuGroups` | — (the center; exactly one) | — |

**Focus order equals source (DOM) order.** Because the panel maps source order
onto position, visual order and focus order cannot diverge: content placed
before the groups (top/left) is reached before the link lists; content placed
after (right/bottom) is reached after them.

## 3. The navigation model

Keyboard navigation is built from the panel DOM on each keypress:

- A **column** is any element with `data-mega-menu-column` (every `MegaMenuSection`
  and `MegaMenuAside`). Columns are vertical; arrow movement within a column is
  **Up/Down**.
- A **band** is any element with `data-mega-menu-band` (every `MegaMenuFooter`),
  classified **top** or **bottom** by its DOM position relative to the columns.
  Bands are horizontal rows; arrow movement within a band is **Left/Right**.
- A **cell** is any focusable descendant of a column/band
  (`a[href]`, `button:not([disabled])`, `[tabindex]:not([tabindex="-1"])`),
  excluding anything inside an `aria-hidden`/`inert` subtree. Items carry **no**
  marker — focusability is the only signal.

Columns and bands with no focusable cell are ignored (so static-only content is
skipped automatically).

## 4. Opening & closing

| From | Key | Result |
| --- | --- | --- |
| Trigger (closed) | `Enter` / `Space` | Opens; focus **stays on the trigger**. |
| Trigger (closed) | `ArrowDown` | Opens **and** moves focus to the first item. |
| Trigger (closed) | `Tab` | Does **not** open; normal tab order. |
| Trigger (open) | `Escape` | Closes; focus returns to the trigger. |
| Anywhere in panel | `Escape` | Closes; focus returns to the trigger. |

Activating an item (`Enter`, or `Space` — added for anchor parity) follows the
link and closes the menu.

## 5. Trigger keys

**When closed:**
- `ArrowRight` / `ArrowLeft` → move to the next / previous sibling trigger
  (does not open anything).

**When open (focus still on the trigger):**
- `ArrowDown` or `Tab` → move focus into the panel, onto the first item.
- `ArrowRight` / `ArrowLeft` → **close** this menu and move to the next /
  previous sibling trigger.

## 6. In-panel arrow navigation

### Columns (groups and side regions)
- **Up / Down** — move between cells within the column.
- **Down on the last cell** — cross into the first cell of the **bottom band**
  if one exists; otherwise **no effect** (does not wrap, does not change column).
- **Up on the first cell** — cross into the first cell of the **top band** if one
  exists; otherwise return focus to the **trigger** (menu stays open).
- **Right / Left** — cross to the **adjacent column**, landing on its **first**
  cell. (Crossing happens from any row — you need not be at the column's edge.)
- **Right on the last column** — close the menu and focus the **next sibling
  trigger**; if there is no next trigger, **no effect**.
- **Left on the first column** — return focus to the **trigger** (menu stays
  open).
- **Home / End** — first / last cell of the current column.

### Bands (full-width top/bottom content)
- **Left / Right** — move between cells within the band.
- **Up** — from a **top** band, return to the trigger; from a **bottom** band,
  cross into the first cell of the first column.
- **Down** — from a **top** band, cross into the first cell of the first column;
  from a **bottom** band, **no effect**.
- **Left on the first cell** — if that cell is the very first focusable in the
  panel (a top band before everything), return to the trigger; otherwise no
  effect. Bands do not cross horizontally to other regions.
- **Home / End** — first / last cell of the band.

## 7. Tab / Shift+Tab inside the panel

Tab order is linear over **every** cell in layout (DOM) order — group items
**and** region/band interactive elements, interleaved by their position.

- `Tab` → next cell. On the **last** cell, close the menu and move focus to the
  first focusable **after** the panel (the next trigger, or the next element if
  there is trailing content). The menu does **not** auto-open the next trigger.
- `Shift`+`Tab` → previous cell. On the **first** cell, return focus to the
  **trigger** (menu stays open); `Tab` then re-enters the first cell.

Tab is never suppressed for self-consuming controls (see §8) — it always moves
to the next/previous cell.

## 8. Role-aware controls

When focus is **inside** a self-consuming control — `input`, `textarea`,
`select`, `[contenteditable]`, or `[role=combobox|listbox|slider|spinbutton|textbox]`
— the engine does **not** intercept **arrow keys, Home, or End**; the control
keeps them (caret movement, option lists, value steppers). You move out of such
a control with `Tab`/`Shift`+`Tab` (or `Escape` to close the menu). You can still
*arrow into* a region containing one of these controls; the hand-off only applies
once focus is on the control itself.

## 9. Small viewport (stacked)

When the layout collapses to a single stacked column, the column grid no longer
applies. All arrow keys degrade to one linear walk over every cell in layout
order:
- `ArrowDown` / `ArrowRight` → next cell.
- `ArrowUp` / `ArrowLeft` → previous cell; on the first cell, return to the
  trigger.
- `Home` / `End` → first / last cell in the whole panel.

## 10. Content (region & band) — summary

- Static-only content (text, images) is not focusable and is skipped by all
  navigation.
- Interactive content participates in **both** Tab and arrow navigation, in
  layout order (§2).
- **Side content** (`MegaMenuAside`) behaves as a column: Up/Down within it,
  Left/Right to cross to/from neighbouring columns.
- **Full-width content** (`MegaMenuFooter`) behaves as a row: Left/Right within it,
  Up/Down to cross to/from the link lists.
- Arrow keys move *between cells*, not into unrelated regions: from a group cell,
  Left/Right step to the adjacent **column**, not to content elsewhere in the
  panel. You only reach a content region by crossing at the relevant edge.

---

## Quick reference

| Key | Behavior |
| --- | --- |
| `Enter` / `Space` (trigger, closed) | Open; focus stays on trigger. |
| `ArrowDown` (trigger, closed) | Open and focus the first item. |
| `ArrowDown` / `Tab` (trigger, open) | Move focus into the panel (first item). |
| `ArrowRight` / `ArrowLeft` (trigger) | Move to next/previous trigger; closes the menu if it was open. |
| `Tab` (in panel) | Next cell in layout order; past the last cell, close and move to the next focusable after the menu. |
| `Shift`+`Tab` (in panel) | Previous cell; from the first cell, return to the trigger (menu stays open). |
| `ArrowUp` / `ArrowDown` (column) | Move within the column; at the top/bottom edge cross to a band, or (top, no band) return to the trigger, or (bottom, no band) no effect. |
| `ArrowLeft` / `ArrowRight` (column) | Cross to the adjacent column's first cell. Left on the first column → trigger (stays open). Right on the last column → next trigger + close (no effect if none). |
| `ArrowLeft` / `ArrowRight` (band) | Move within the band. |
| `ArrowUp` / `ArrowDown` (band) | Cross between the band and the column grid (per §6). |
| `Home` / `End` | First / last cell of the current column/band (whole panel when stacked). |
| `Enter` / `Space` (item) | Activate the link and close the menu. |
| `Escape` | Close the menu and return focus to the trigger. |
| Arrows/`Home`/`End` inside a form field/combobox/etc. | Not intercepted — the control keeps them. |
