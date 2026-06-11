---
"@salt-ds/lab": minor
---

Updated `MegaMenu` with a revised component structure and API.

`MegaMenuPanel` lays its children out as a single horizontal row. `MegaMenuBody`
is the center navigation area; an optional `MegaMenuSupportingContent` renders
alongside it — to the left when placed before `MegaMenuBody`, to the right when
placed after. Position is derived from source order alone — there are no
placement props.

- **`MegaMenuBody`** — the center navigation area. It stacks a `MegaMenuGroups`
  and an optional `MegaMenuSupportingActions` band beneath it.
- **`MegaMenuGroups`** — arranges the `MegaMenuGroup` columns in a grid that hugs
  its content. Column width is set with the `--saltMegaMenuGroups-columnWidth`
  custom property (default `12rem`).
- **`MegaMenuGroup`** — one category column, composed of a `MegaMenuGroupHeading`
  and a `MegaMenuItemList`.
- **`MegaMenuGroupHeading`** — the group's label.
- **`MegaMenuItemList`** — a `<ul>` that wraps each `MegaMenuItem` in its own
  `<li>`.
- **`MegaMenuItem`** — the focusable item. It renders an `<a>` when given an
  `href` or a `render` element (such as `react-router`'s `Link`), and a
  `<button>` otherwise; it closes the menu on activation.
- **`MegaMenuSupportingContent`** — side content beside `MegaMenuBody`, placed to
  the left or right by source order.
- **`MegaMenuSupportingActions`** — a row of supporting actions inside
  `MegaMenuBody`, beneath the groups and spanning their width.

Responsive behaviour is left to consumers. `MegaMenuGroups` lays its columns out
with grid `auto-fit` and `minmax(0, …)`, so they shrink and wrap to the
available width rather than overflowing; there is no built-in viewport
breakpoint. To stack the panel on small screens, set `flex-direction: column` on
`MegaMenuPanel` at your own breakpoint.

Keyboard navigation follows the panel layout. Up and Down move within a column,
with Down continuing at the top of the next column; Left and Right move between
columns and, on the outer columns, return focus to the trigger while keeping the
menu open. At the end of the last column — or the supporting actions row — Down
and Right move to the next trigger and close the panel (and do nothing, or wrap
back to the current trigger, when there is no next trigger). Tab and Shift+Tab
walk every item in layout order, Escape closes the menu, and navigation degrades
to a linear walk when the columns are stacked.

A `MegaMenuItem` activates on Enter and closes the menu. An item rendered as a
`<button>` (no `href`) also activates on Space; link items follow native `<a>`
behaviour and do not activate on Space.

```tsx
<MegaMenuPanel aria-label="Solutions menu">
  <MegaMenuBody>
    <MegaMenuGroups>
      <MegaMenuGroup>
        <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
        <MegaMenuItemList>
          <MegaMenuItem render={<Link to="/digital-banking" />}>
            Digital banking
          </MegaMenuItem>
        </MegaMenuItemList>
      </MegaMenuGroup>
    </MegaMenuGroups>
    <MegaMenuSupportingActions>
      <Link href="#demo">Book a demo</Link>
    </MegaMenuSupportingActions>
  </MegaMenuBody>
  <MegaMenuSupportingContent>...</MegaMenuSupportingContent>
</MegaMenuPanel>
```

**Breaking changes**

- `MegaMenuHeader` has been removed. Use `MegaMenuGroupHeading` for a group's
  label instead.
- `MegaMenuItem` can no longer be placed directly inside a `MegaMenuGroup`. Wrap
  the items in a `MegaMenuItemList`, which renders the `<ul>`/`<li>` structure.
- `MegaMenuItem` is no longer the list item — it now renders an `<a>` or
  `<button>` (the surrounding `<li>` comes from `MegaMenuItemList`). Update any
  refs or styles that assumed an `<li>` element.
