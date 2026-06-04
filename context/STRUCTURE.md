# MegaMenu — structure contract

Defines the legal component tree, naming, cardinality, and layout of MegaMenu.
Companion to `ACCESSIBILITY.md` (behavior). This is the canonical structure; the
current implementation still uses older names/shape and must be migrated to match
(see "Code changes required").

---

## Components

Nine public components. Six are essential, two are optional content slots, one is a
section label. A basic menu uses six; `Aside`/`Footer` appear only when used.

| Component | Role | Renders | Essential? |
| --- | --- | --- | --- |
| `MegaMenu` | provider — open state + floating context | nothing (context) | yes |
| `MegaMenuTrigger` | wires `aria-expanded`/`aria-controls` + nav-bar keys onto the trigger element | clones its one child | yes |
| `MegaMenuPanel` | the floating container ("Container") | `<div role="region">` | yes |
| `MegaMenuAside` | side content, full panel height, left or right | `<aside>`-like wrapper | optional |
| `MegaMenuMain` | the navigation area (center): columns + footer | layout wrapper | yes |
| `MegaMenuSection` | one category column: heading + links | wrapper → `<ul>` | yes |
| `MegaMenuHeading` | a section's label | heading element | yes* |
| `MegaMenuLink` | one navigable link | `<a>` (or `render`) | yes |
| `MegaMenuFooter` | footer link(s), under the columns | full-width wrapper | optional |

\* `MegaMenuHeading` is a child component (not a `Section` prop) so headings can hold
an icon, badge, or rich content and to stay consistent with the compound pattern.

## Legal tree

```
MegaMenu                          (provider — no DOM)
├─ MegaMenuTrigger                (exactly 1)   → wraps one element (NavigationItem/Button)
│  └─ <NavigationItem | Button>   (exactly 1 child element)
└─ MegaMenuPanel                  (exactly 1)   → role="region", the "Container"
   ├─ MegaMenuAside               (0–1, left)        ← before MegaMenuMain
   ├─ MegaMenuMain                (exactly 1, center)
   │  ├─ MegaMenuSection          (1–n)              ← the columns
   │  │  ├─ MegaMenuHeading       (0–1, first child)
   │  │  └─ MegaMenuLink          (0–n)  → rendered as <li><a>
   │  └─ MegaMenuFooter           (0–1)              ← the "link", under the columns
   └─ MegaMenuAside               (0–1, right)       ← after MegaMenuMain
```

The panel's only direct descendants are **side content** (`MegaMenuAside`) and the
**navigation area** (`MegaMenuMain`). The footer lives inside `MegaMenuMain`.

## Element contract

| Element | Parent | Children | Count | Position |
| --- | --- | --- | --- | --- |
| `MegaMenu` | app | `MegaMenuTrigger` + `MegaMenuPanel` | root | — |
| `MegaMenuTrigger` | `MegaMenu` | one element (`NavigationItem`/`Button`) | 1 | — |
| `MegaMenuPanel` | `MegaMenu` | `MegaMenuAside`* + `MegaMenuMain` | 1 | floats from trigger |
| `MegaMenuAside` | `MegaMenuPanel` | arbitrary | 0–1 left, 0–1 right | left/right by source order |
| `MegaMenuMain` | `MegaMenuPanel` | `MegaMenuSection`+ + `MegaMenuFooter`? | 1 | center |
| `MegaMenuSection` | `MegaMenuMain` | `MegaMenuHeading`? + `MegaMenuLink`* | 1–n | auto-fit columns |
| `MegaMenuHeading` | `MegaMenuSection` | text / rich label | 0–1 | top of section |
| `MegaMenuLink` | `MegaMenuSection` | text + optional icon/adornment | 0–n | list item |
| `MegaMenuFooter` | `MegaMenuMain` | arbitrary (links) | 0–1 | bottom of center |

## Layout (intent)

- **Panel** is a single horizontal row: optional side content, the center
  navigation area, optional side content. Side content **stretches the full height**
  of the panel and sits **left** or **right** depending on whether it is placed
  before or after `MegaMenuMain` in source order.
- **Main** lays its `MegaMenuSection`s out as **columns that wrap** when space runs
  out; the `MegaMenuFooter` sits on its own row **beneath** the columns and is
  exactly **as wide as them** — never the side content (which is outside `Main`).
- **Section** stacks its heading above its list of links.
- **Small viewport:** the panel collapses to a single column and everything stacks
  in source order (left content → center → right content, footer under the columns).

Position is always derived from **component type + source order** — there are no
placement props.

## Confirmed rules

- The panel's only direct descendants are `MegaMenuAside` (side content) and
  `MegaMenuMain` (center).
- **Side content is left/right only** — no top/bottom content.
- **The footer is bottom-only, inside `MegaMenuMain`**, width-bound to the columns.
  There is no top band.
- Content sizing knobs (hug/fill height, custom width) are **not** in the contract.
- Exactly one `MegaMenuMain`; exactly one set of sections within it.
- `MegaMenuLink` belongs only inside a `MegaMenuSection`; `MegaMenuHeading` is a
  section's first child.
- A `MegaMenuAside`/`MegaMenuFooter` with no interactive descendants is
  presentational and is skipped by keyboard navigation.

---

## Naming migration (current → contract)

| Current | Contract |
| --- | --- |
| `MegaMenuRegion` | `MegaMenuAside` |
| `MegaMenuBand` | `MegaMenuFooter` (moves inside `MegaMenuMain`, bottom-only) |
| `MegaMenuGroups` | folded into **`MegaMenuMain`** (no separate columns wrapper) |
| `MegaMenuGroup` | `MegaMenuSection` |
| `MegaMenuHeader` | `MegaMenuHeading` |
| `MegaMenuItem` | `MegaMenuLink` |
| — (new) | `MegaMenuMain` |
| `MegaMenuColumn` (internal marker) | internal nav marker, applied to `Section`/`Aside` |

## Code changes required

The implementation must be migrated to this contract (separate task, not yet done):

- **Rename** the components per the table above; update `index.ts`, stories,
  examples, tests, and `ACCESSIBILITY.md`.
- **New `MegaMenuMain`** — lays out the `MegaMenuSection` columns and renders the
  optional `MegaMenuFooter` beneath them (absorbs the old `MegaMenuGroups`).
- **`MegaMenuPanel`** lays its children out as a single row (`[Aside | Main |
  Aside]`); remove the old panel-level positioning logic — source order now drives
  left/right.
- **`MegaMenuFooter`** moves inside `MegaMenuMain`, bottom-only; remove top-band
  positioning.
- **`useMegaMenuNavigation.ts`** — remove top-band handling (`topBands` split and
  the related arrow branches); the footer is always the bottom of the center area.
- Keep the navigation behavior described in `ACCESSIBILITY.md` (only the top-band
  parts of §2/§6 change).
