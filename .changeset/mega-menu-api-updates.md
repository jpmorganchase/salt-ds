---
"@salt-ds/lab": minor
---

Updated `MegaMenu` with a revised component structure and API.

`MegaMenuPanel` lays its children out as a single horizontal row. `MegaMenuBody`
is the center navigation area; an optional `MegaMenuSupportingContent` renders
alongside it — to the left when placed before `MegaMenuBody`, to the right when
placed after. Position is derived from component type and source order alone —
there are no placement props.

- **`MegaMenuBody`** — the center navigation area. It arranges `MegaMenuGroup`
  columns in a grid and renders an optional `MegaMenuSupportingActions` band
  beneath them. Column width is set with the `--saltMegaMenuBody-columnWidth`
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
- **`MegaMenuSupportingActions`** — a full-width row of supporting actions,
  inside `MegaMenuBody` beneath the groups.

Responsive behaviour is left to consumers. `MegaMenuBody` lays its columns out
with grid `auto-fit` and `minmax(0, …)`, so they shrink and wrap to the
available width rather than overflowing; there is no built-in viewport
breakpoint. To stack the panel on small screens, set `flex-direction: column` on
`MegaMenuPanel` at your own breakpoint. Keyboard navigation degrades to a linear
walk automatically when the columns are stacked.

```tsx
<MegaMenuPanel aria-label="Solutions menu">
  <MegaMenuBody>
    <MegaMenuGroup>
      <MegaMenuGroupHeading>Financial services</MegaMenuGroupHeading>
      <MegaMenuItemList>
        <MegaMenuItem render={<Link to="/digital-banking" />}>
          Digital banking
        </MegaMenuItem>
      </MegaMenuItemList>
    </MegaMenuGroup>
    <MegaMenuSupportingActions>
      <Link href="#demo">Book a demo</Link>
    </MegaMenuSupportingActions>
  </MegaMenuBody>
  <MegaMenuSupportingContent>...</MegaMenuSupportingContent>
</MegaMenuPanel>
```
