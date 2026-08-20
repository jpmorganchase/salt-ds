# Plan 001: Add a composable Core List for passive and actionable rows

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 47fa5db83..HEAD -- packages/core/src/index.ts packages/core/src/list packages/core/src/__tests__/@typings/List.tsx packages/core/src/__tests__/__e2e__/list packages/core/stories/list site/docs/components/list site/src/examples/list .changeset/add-core-list.md plans/README.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `47fa5db83`, 2026-08-20

## Why this matters

Core has selection-oriented `ListBox`, menu, and navigation components, but no
neutral list that can consistently present passive rows, rows with secondary
controls, or persistent button/link rows inside content surfaces such as a
Dialog or Overlay. Consumers therefore have to assemble the DOM, spacing,
focus treatment, and action layout themselves. This plan adds one composable
Core family while keeping the semantic boundary explicit: the list and list
item remain structural, and each interaction remains a real sibling button or
link in normal document tab order.

## Current state

### Existing Core behavior and conventions

- `packages/core/src/index.ts:36-37` exports `list-box` and `list-control`; there
  is no Core `list` export:

  ```ts
  export * from "./list-box";
  export * from "./list-control";
  ```

- `packages/core/src/list-box/ListBox.tsx:251-273` renders a managed selection
  widget. Its root has `role="listbox"`, focus state, and keyboard behavior.
  It is a form-control choice, not the basis for this component.

- `packages/core/src/mega-menu/MegaMenuList.tsx:21-39,61-70` is the closest
  structural Core precedent. It defaults to `<ul>`, permits an ordered-list
  variant, forwards its ref/props, and injects component CSS:

  ```tsx
  export type MegaMenuListProps<T extends ElementType = "ul"> =
    PolymorphicComponentPropWithRef<T, { children?: ReactNode }>;

  const Component = as || "ul";
  return (
    <Component ref={ref as PolymorphicRef<T>} {...rest}>
      {children}
    </Component>
  );
  ```

  For the new generic `List`, narrow the generic element type to `"ul" |
"ol"`; do not permit arbitrary non-list roots.

- `packages/core/src/navigation-item/NavigationItem.tsx:88-116` establishes the
  Core convention that `href !== undefined` selects link behavior and no
  `href` selects a button. `packages/core/src/navigation-item/NavigationItemAction.tsx:1-8`
  uses the shared `renderProps` utility. Apply the same convention to
  `ListItemAction`, including Salt's documented JSX/callback `render` forms.

- `site/docs/getting-started/render-prop.mdx:8-45` requires custom rendered
  elements to receive Salt's class names, behavior, accessibility props,
  children, and forwarded ref. A callback is the documented way to map
  `href` to a router's `to` prop.

- Each Core component injects its stylesheet with `useComponentCssInjection`,
  `useWindow`, and a stable test ID. Use the same pattern as
  `packages/core/src/mega-menu/MegaMenuList.tsx:45-58`.

- Core selectable styling uses existing tokens. Useful precedents are
  `packages/core/src/mega-menu/MegaMenuListItem.css:7-61` and
  `packages/core/src/menu/MenuItem.css:1-31`. Reuse the relevant content,
  selectable, focus-outline, cursor, size, and spacing tokens; do not add theme
  tokens.

- Dialog and Overlay already own focus containment, Escape dismissal, and
  focus return. See `site/docs/components/dialog/accessibility.mdx:19-51` and
  `site/docs/components/overlay/accessibility.mdx:13-40`. Their content
  containers already own vertical scrolling at
  `packages/core/src/dialog/DialogContent.css:17` and
  `packages/core/src/overlay/OverlayPanelContent.css:12`.

- Component docs use four files under `site/docs/components/<name>/`:
  `index.mdx`, `usage.mdx`, `examples.mdx`, and `accessibility.mdx`. Runnable
  examples live under `site/src/examples/<name>/` and are barrel-exported from
  `index.ts`. Model metadata and layout after
  `site/docs/components/vertical-navigation/index.mdx`.

- Core stories use `packages/core/stories/<name>/<name>.stories.tsx`. Visual QA
  stories add `<name>.qa.stories.tsx`, use `QAContainer`, transpose density,
  and enable Chromatic snapshots; see
  `packages/core/stories/mega-menu/mega-menu.qa.stories.tsx`.

- Cypress component tests live under
  `packages/core/src/__tests__/__e2e__/<name>/`. Use
  `packages/core/src/__tests__/__e2e__/navigation-item/NavigationItem.cy.tsx:5-33,105-170`
  for button/link/render assertions and
  `packages/core/src/__tests__/__e2e__/link/Link.cy.tsx:68-102` for render-prop
  merging. Accessibility tests call `cy.checkAxeComponent()` and keyboard tests
  use `cy.realPress(...)`.

- `CONTRIBUTING.md:114` requires present-tense PR titles and commit messages.
  Recent examples include `Add Link button (#6914)` and
  `Promote Tabs to core (#6465)`.

### Decided public model

Implement exactly this additive Core family:

| Component         | Default DOM                                                     | Responsibility                                                                                                       |
| ----------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `List`            | `<ul>`                                                          | List structure only; `as="ol"` is the only alternate root.                                                           |
| `ListItem`        | `<li>`                                                          | One visual row and its two-column layout; never focusable or clickable.                                              |
| `ListItemContent` | `<span>`                                                        | Passive primary content and spacing. A span keeps the same component valid inside a button or anchor.                |
| `ListItemAction`  | `<button type="button">` without `href`; `<a href>` with `href` | The optional primary interactive surface. It occupies the primary grid cell and supports Salt's `render` convention. |
| `ListItemActions` | `<div>`                                                         | One or more independent trailing controls. It has no role by default.                                                |

The child grammar is deliberately narrow:

- A `List` has `ListItem` children; direct divider `<div>` elements are invalid.
  Use item borders or pseudo-elements if separation is needed.
- A `ListItem` has exactly one direct `ListItemContent` or one direct
  `ListItemAction` in its primary region, followed by at most one
  `ListItemActions` region.
- `ListItemContent` is a direct child of `ListItem` for passive content and a
  child of `ListItemAction` for actionable content.
- Passive and actionable items may be mixed in one List. Actionable styling
  must distinguish the interactive surface in its hover, focus, and active
  states, following Core Menu and MegaMenu selectable-item precedent without
  implying persistent selected state.
- Treat this as the documented/supported grammar; do not add runtime child
  parsing that would reject fragments or wrapper components. Tests and examples
  should establish the contract.

These four compositions are first-class and must share the same row geometry:

```tsx
// 1. Passive content
<ListItem>
  <ListItemContent>Quarterly report</ListItemContent>
</ListItem>

// 2. Passive content plus secondary actions
<ListItem>
  <ListItemContent>Quarterly report</ListItemContent>
  <ListItemActions>
    <Button aria-label="Download quarterly report" />
  </ListItemActions>
</ListItem>

// 3. Primary button plus a secondary action
<ListItem>
  <ListItemAction onClick={openReport}>
    <ListItemContent>Quarterly report</ListItemContent>
  </ListItemAction>
  <ListItemActions>
    <Button aria-label="More options for quarterly report" />
  </ListItemActions>
</ListItem>

// 4. Primary link plus a secondary action
<ListItem>
  <ListItemAction href="/reports/quarterly">
    <ListItemContent>Quarterly report</ListItemContent>
  </ListItemAction>
  <ListItemActions>
    <Button aria-label="Download quarterly report" />
  </ListItemActions>
</ListItem>
```

The required DOM for the interactive cases is sibling-based:

```html
<ul>
  <li>
    <button type="button"><span>Quarterly report</span></button>
    <div><button type="button">Download</button></div>
  </li>
</ul>
```

Never put `onClick`, `tabIndex`, or an interactive role on `<li>`. Never place
`ListItemActions` or any other focusable element inside `ListItemAction`.
Secondary-action events must not need internal `stopPropagation`: they cannot
activate the primary action because the controls are siblings.

### Accessibility and interaction contract

- This is a native structural list, not an ARIA `menu`, `toolbar`, `grid`, or
  `listbox`. Do not add selection state, active-descendant behavior, roving
  tabindex, arrow-key handling, typeahead, autofocus, Escape handling, focus
  trapping, or focus restoration.
- Normal browser focus order applies. Static content adds no tab stop. Each
  button/link appears once in DOM order. Buttons activate with Enter/Space and
  links with Enter through native behavior.
- `ListItemAction` is named “Action,” not “Trigger,” because it may execute a
  command or navigate; it does not necessarily open or disclose anything.
- The singular/plural names are not container/item counterparts:
  `ListItemAction` is the one primary row action, while `ListItemActions` is the
  trailing region containing independent controls. Never place the singular
  component inside the plural component.
- `href` is the semantic discriminator even when `render` is used. A rendered
  router link must also receive `href`; callback renderers may map it to `to`.
  Without `href`, the custom rendered control is treated as the button branch
  and receives `type="button"` by default. Match Salt render-prop precedence:
  an explicit public or rendered-element `type="submit" | "reset"` is an
  intentional native override, not something the component silently rewrites.
- The button branch supports native `disabled`. The link branch exposes native
  anchor props and does not add a `disabled` convenience prop or fake disabled
  link behavior. Disabling the primary button must not disable sibling actions.
- The `ListItemAction` content contract is non-interactive content only.
  `ListItemActions` is the sole place for trailing buttons, links, checkboxes,
  or other focusable descendants. Icon-only controls need an accessible name
  that includes the row context.
- `ListItemActions` accepts native `div` and ARIA props so a consumer can add
  `role="group"` plus an accessible name when multiple controls form a named
  group; do not force a group role for every row.
- Dialog/Overlay own initial focus, focus containment, Escape, dismissal, and
  return focus. `List` must be unaware of either parent.
- `List` does not own overflow. The enclosing surface remains the only scroll
  container.
- If an action removes its focused row, the application—not `List`—moves focus
  to the next logical row, previous row, or stable surrounding control.
- When the list is the primary content of a navigation landmark, consumers wrap
  it in a labelled `<nav>`; they do not change List to menu semantics.

### Type contract

- Type `List` as a polymorphic component restricted to `"ul" | "ol"`, defaulting
  to `"ul"`, with the matching non-event native props and ref. Omit consumer
  `role` and `tabIndex` so the root cannot be converted into a
  synthetic/composite widget through this API.
- `ListItem`, `ListItemContent`, and `ListItemActions` start from the native
  props/ref for `li`, `span`, and `div`, respectively. Define a small private
  structural-props helper that omits `keyof React.DOMAttributes<...>` plus
  `tabIndex` and `role`, then explicitly re-adds `children?: ReactNode`. Apply it
  to `List`, `ListItem`, `ListItemContent`, and `ListItemActions`. This removes
  all bubbling and capture event handlers—not only `onClick`/keyboard
  handlers—so structural containers cannot become synthetic controls or
  intercept descendant actions. Keep native ARIA/data/class/style props that do
  not change the interaction model. Re-add only `role?: "group"` to
  `ListItemActions`; its children are the intentional controls and remain the
  only event targets in that region.
- Export a discriminated `ListItemActionProps` union (and named button/link
  branch types if needed for clarity):
  - button branch: `href?: undefined`, native button props including explicit
    `type`, `render?`, and an `HTMLButtonElement` ref. Default `type` to
    `"button"` only when neither public nor rendered-element props override it;
  - link branch: required `href: string`, native anchor props, `render?`, and an
    `HTMLAnchorElement` ref.
- Give the public component overloads/call signatures that infer
  `HTMLButtonElement` refs and button events for the button branch and
  `HTMLAnchorElement` refs and anchor events for the link branch. The internal
  implementation may use a union, but consumers must not receive only a union
  ref/event type. Do not copy the older `ComponentPropsWithoutRef<any>` shortcut
  from `NavigationItemAction.tsx`.
- Give each branch its own public `render` callback-prop type so callback
  parameters contain the correct native attributes, event types, children, and
  ref instead of `any`. It is acceptable to cast once at the private call into
  the existing `renderProps` utility; do not expose that utility's loose
  callback type in `ListItemActionProps`.
- Every component merges the Salt class with consumer `className` and forwards
  `children`, `style`, `data-*`, allowed ARIA/event props, and its ref.

## Commands you will need

No dependency installation is expected; this Yarn 4.17 workspace is already
configured.

| Purpose                 | Command                                                                                                                                                                                                                                                                                               | Expected on success                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Drift check             | `git diff --stat 47fa5db83..HEAD -- packages/core/src/index.ts packages/core/src/list packages/core/src/__tests__/@typings/List.tsx packages/core/src/__tests__/__e2e__/list packages/core/stories/list site/docs/components/list site/src/examples/list .changeset/add-core-list.md plans/README.md` | No output before work starts.                                |
| Typecheck               | `yarn typecheck`                                                                                                                                                                                                                                                                                      | Exit 0, no TypeScript errors.                                |
| Core build              | `yarn workspace @salt-ds/core build`                                                                                                                                                                                                                                                                  | Exit 0 and Core artifacts build.                             |
| Core CSS bundle         | `yarn bundle:core:css`                                                                                                                                                                                                                                                                                | Exit 0; the new component CSS is included.                   |
| Focused component tests | `yarn test:components --spec "packages/core/src/__tests__/__e2e__/list/List.cy.tsx"`                                                                                                                                                                                                                  | Cypress exits 0; all List tests pass.                        |
| JS/TS lint              | `yarn biome ci --reporter=github`                                                                                                                                                                                                                                                                     | Exit 0, no diagnostics.                                      |
| Core CSS lint           | `yarn lint:style:core`                                                                                                                                                                                                                                                                                | Exit 0, no stylelint errors.                                 |
| Formatting              | `yarn prettier:ci`                                                                                                                                                                                                                                                                                    | Exit 0; all files are formatted.                             |
| Storybook integration   | `yarn build-storybook`                                                                                                                                                                                                                                                                                | Exit 0; Core stories compile.                                |
| Site prop generation    | `yarn workspace @salt-ds/site gen:props`                                                                                                                                                                                                                                                              | Exit 0; ignored Core prop data includes all five components. |
| Site spelling           | `yarn workspace @salt-ds/site spellcheck`                                                                                                                                                                                                                                                             | Exit 0; new MDX/examples have no spelling errors.            |
| Site build              | `yarn workspace @salt-ds/site build`                                                                                                                                                                                                                                                                  | Exit 0; component docs and live examples compile.            |
| Changeset validation    | `yarn changeset status`                                                                                                                                                                                                                                                                               | Exit 0; `@salt-ds/core` has one pending minor changeset.     |

## Suggested executor toolkit

- Read the WAI-ARIA Authoring Practices patterns for
  [Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
  [Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), and
  [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) only to preserve the
  boundaries above. Do not import their composite keyboard behavior into this
  structural list.
- Check the HTML content models for
  [button](https://html.spec.whatwg.org/dev/form-elements.html#the-button-element)
  and [anchor](https://html.spec.whatwg.org/dev/text-level-semantics.html#the-a-element)
  before changing the child contract.
- Use `autoreview` after implementation if it is available, focusing the review
  on DOM validity, public TypeScript types, focus order, and event isolation.

## Scope

**In scope** (the only files you should modify):

- `packages/core/src/list/List.tsx` (create)
- `packages/core/src/list/List.css` (create)
- `packages/core/src/list/ListItem.tsx` (create)
- `packages/core/src/list/ListItem.css` (create)
- `packages/core/src/list/ListItemContent.tsx` (create)
- `packages/core/src/list/ListItemContent.css` (create)
- `packages/core/src/list/ListItemAction.tsx` (create)
- `packages/core/src/list/ListItemAction.css` (create)
- `packages/core/src/list/ListItemActions.tsx` (create)
- `packages/core/src/list/ListItemActions.css` (create)
- `packages/core/src/list/index.ts` (create)
- `packages/core/src/index.ts`
- `packages/core/src/__tests__/@typings/List.tsx` (create)
- `packages/core/src/__tests__/__e2e__/list/List.cy.tsx` (create)
- `packages/core/stories/list/list.stories.tsx` (create)
- `packages/core/stories/list/list.qa.stories.tsx` (create)
- `site/docs/components/list/index.mdx` (create)
- `site/docs/components/list/usage.mdx` (create)
- `site/docs/components/list/examples.mdx` (create)
- `site/docs/components/list/accessibility.mdx` (create)
- `site/src/examples/list/Default.tsx` (create)
- `site/src/examples/list/WithSecondaryActions.tsx` (create)
- `site/src/examples/list/ActionItems.tsx` (create)
- `site/src/examples/list/RoutingLibraries.tsx` (create)
- `site/src/examples/list/InDialog.tsx` (create)
- `site/src/examples/list/InOverlay.tsx` (create)
- `site/src/examples/list/index.ts` (create)
- `.changeset/add-core-list.md` (create)
- `plans/README.md` (status update only)

**Out of scope** (do not touch, even if they look related):

- Every file under `packages/lab/**` and every Lab doc, example, story, test,
  export, changelog, or changeset. This is explicitly Core-only; do not inspect
  Lab implementations as a design source during execution.
- Renaming, aliasing, deprecating, or migrating any existing component.
- Changing `ListBox`, `Menu`, `Toolbar`, `NavigationItem`, `VerticalNavigation`,
  `MegaMenu`, Dialog, or Overlay behavior.
- Selection/current-item APIs, keyboard composites, drag-and-drop, reordering,
  virtualization, disclosure/submenus, automatic close-on-action, or async
  loading behavior.
- A fake-disabled link API, nested interactive descendants in the primary
  action, or a click handler on the row container.
- New design tokens, global CSS, or ownership of scrolling.
- A codemod or adoption changes in product/pattern stories outside the new List
  stories and examples.

## Git workflow

- Branch: `codex/001-core-list`
- Commit per logical unit, with present-tense messages. Suggested sequence:
  `Add Core List components`, `Test Core List compositions`, and
  `Document Core List`.
- Do not push or open a PR unless the operator explicitly instructs it.

## Steps

### Step 1: Add the structural and passive primitives

Create `packages/core/src/list/List.tsx`, `ListItem.tsx`,
`ListItemContent.tsx`, and `ListItemActions.tsx` with their matching CSS files.

- `List` defaults to `<ul>` and supports only `as="ol"`; restrict the generic
  rather than accepting an arbitrary `ElementType`.
- `ListItem` always renders `<li>`. It owns the row grid but has no click or
  focus behavior. Omit activation handlers, `tabIndex`, and `role` from its
  public props rather than relying on documentation alone.
- `ListItemContent` always renders `<span>`. It owns the primary-area padding,
  minimum height, content typography, alignment, gap, and `min-width: 0` needed
  for truncation/wrapping. It must work both directly under `ListItem` and
  inside `ListItemAction`.
- `ListItemActions` renders a sibling `<div>` aligned in the second grid cell.
  It owns trailing-area padding/alignment and a tokenized gap between multiple
  controls. Do not assign `role="group"` by default.
- Use the collision-resistant internal class namespace `saltCoreList`,
  `saltCoreListItem`, `saltCoreListItemContent`, `saltCoreListItemAction`, and
  `saltCoreListItemActions`, with corresponding unique `salt-core-list-*`
  style-injection test IDs. Public component names remain `List*`. Do not use
  broad `.saltList*` selectors or package-shared `--saltList-*` custom
  properties; use existing Salt tokens.
- Reset native list margin/padding/markers without adding overflow. Preserve
  native list/listitem exposure. During supported Safari + VoiceOver manual QA,
  if the marker reset removes list exposure, add an explicit `role="list"` to
  the root as the narrowly scoped fallback; do not add menu/listbox roles.
- Make `ListItem` a two-column grid equivalent to
  `minmax(0, 1fr) auto`. Keep padding off the `<li>` so the primary action can
  fill the first cell and the secondary controls remain a separate hit region.
- Export all components and public prop types from
  `packages/core/src/list/index.ts`, then add `export * from "./list";` next to
  the other list exports in `packages/core/src/index.ts`.

**Verify**:

- `yarn typecheck` → exit 0, no TypeScript errors.
- `yarn workspace @salt-ds/core build` → exit 0.

### Step 2: Add the primary button/link action

Create `packages/core/src/list/ListItemAction.tsx` and
`ListItemAction.css`.

- Implement the discriminated native-prop contract from “Type contract.”
- Select `<a>` only when `href !== undefined`; otherwise select a button and
  supply `type="button"` as its default. Pass the selected element and props
  through the shared `renderProps` utility so JSX and callback renderers merge
  Salt props. Preserve the repository's merge precedence: an explicitly passed
  `type="submit" | "reset"`, including on a JSX render element, may override the
  default intentionally.
- Require `href` whenever a custom renderer represents link/navigation
  semantics. Do not infer a link only from the rendered element.
- Forward the native element ref and merge consumer props/class names.
- Fill only the primary grid cell. Use an actual flex/grid element rather than
  an absolutely positioned overlay, so the primary action cannot cover or
  intercept the secondary controls.
- Reset native button/anchor presentation with existing Salt tokens. Provide
  hover, active, `:focus-visible`, and native disabled-button styling based on
  the cited Menu/MegaMenu precedents. Do not dim or disable the entire row when
  only the primary button is disabled.
- Keep action padding compatible with nested `ListItemContent` without doubling
  it. `ListItemContent` remains the canonical child and supplies the content
  layout; the action supplies the interactive state surface.
- Add the component and prop types to `packages/core/src/list/index.ts`.
- For `target="_blank"`, do not silently duplicate Core `Link`'s external-link
  icon/announcement logic. Document `render={<Link />}` as the supported way to
  opt into that established behavior while keeping a single final anchor.

**Verify**:

- `yarn typecheck` → exit 0; button, anchor, render, and ref types compile.
- `yarn lint:style:core` → exit 0, including all new List CSS.
- `yarn workspace @salt-ds/core build` → exit 0.

### Step 3: Lock down semantics, events, and keyboard behavior with tests

Create `packages/core/src/__tests__/@typings/List.tsx` and
`packages/core/src/__tests__/__e2e__/list/List.cy.tsx`. Model their style on the
existing `@typings/BorderLayout.tsx`, NavigationItem, and Link tests cited
above.

The typing file must compile valid `ul`/`ol`, button, anchor, branch-inferred
render callbacks, event, and branch-correct ref examples. Add `@ts-expect-error`
cases for `as="div"`,
`href + disabled`, button-only props in the link branch, anchor-only props in
the button branch, mismatched refs, `ListItem onClick`, and structural root/item
`tabIndex`/role overrides. Include representative negative bubbling/capture
cases across click, keyboard, and pointer events so a later native-prop refactor
cannot reopen structural event handling accidentally. Verify that
`ListItemActions role="group"` is valid while its `onClick`, `tabIndex`, and
any other role value are rejected.

Add named tests for all of the following:

1. `List` renders as `<ul>` by default, as `<ol>` with `as="ol"`, and forwards
   native props/className/ref; every `ListItem` is an `<li>`.
2. A passive row has no tabbable element and exposes list/listitem semantics,
   with no `menu`, `listbox`, `option`, or `menuitem` role.
3. A passive row plus `ListItemActions` tabs only to its secondary controls in
   DOM order.
4. `ListItemAction` without `href` renders `<button type="button">` by default;
   the default does not submit an enclosing form, and click, Enter, and Space
   each invoke only its own callback. An explicit native or JSX-rendered
   `type="submit"` override remains `submit` and follows normal form behavior.
5. `ListItemAction` with `href` renders an anchor with the supplied destination,
   forwards `target`, `rel`, `download`, and `aria-current`, and has no stray
   `type` attribute. Enter activates its native click path and Space does not.
6. In button-primary and link-primary rows with a secondary button, primary and
   secondary controls are DOM siblings, no interactive element contains another
   interactive element, and Tab reaches primary then secondary exactly once.
7. Clicking/keyboard-activating the secondary control never invokes the primary
   callback. Prove event isolation through call counts; do not add
   `stopPropagation` to make the test pass.
8. Native `disabled` prevents the primary button action while a sibling
   secondary action stays enabled and tabbable.
9. JSX `render` merges classes, children, native attributes, and refs for both a
   custom button and a router-like link. Callback `render` can map `href` to a
   `to`-style destination without dropping accessibility/event props.
10. Every primitive forwards `className`, arbitrary `data-*`, allowed ARIA
    props, and its ref to the documented DOM element.
11. The four canonical compositions pass `cy.checkAxeComponent()`.
12. A List mounted in an open Dialog and one mounted in an open Overlay retain
    ordinary Tab/Shift+Tab order while the parent owns focus containment and
    Escape behavior. Assert that List itself adds no `tabIndex` to
    `ul`/`ol`/`li`, arrow keys do not move focus between rows, actions do not
    automatically dismiss either surface, and Escape still reaches the owning
    surface.

**Verify**:

- `yarn test:components --spec "packages/core/src/__tests__/__e2e__/list/List.cy.tsx"`
  → Cypress exits 0 and every new test passes.
- `yarn typecheck` → exit 0, including the public prop/ref usage in tests.

### Step 4: Add stories and visual QA coverage

Create `packages/core/stories/list/list.stories.tsx` with readable stories for
the four canonical compositions, ordered lists, span-safe multi-line content
(icons plus primary and secondary text), multiple trailing actions, disabled
primary buttons, router-style links, and embedding in both Dialog and Overlay.

Create `packages/core/stories/list/list.qa.stories.tsx` using `QAContainer`.
Include:

- all four compositions at every Salt density;
- long/wrapping and truncated content;
- zero, one, and multiple secondary controls;
- button and link primary actions in default, hover, keyboard-focus, active,
  and disabled-button states where Storybook can represent them;
- LTR and RTL layout, ensuring trailing controls remain visually trailing;
- 200% zoom and forced-colors manual checks for visible, unclipped focus and
  usable action target sizes;
- narrow Dialog/Overlay content so the row grid and parent-owned scroll behavior
  are visible;
- Chromatic snapshots enabled.

Do not add story-only production API or global CSS to force states. If a state
cannot be represented without changing production behavior, document it in the
story description and leave it to interaction/manual QA.

**Verify**:

- `yarn typecheck` → exit 0; Storybook stories compile.
- `yarn prettier:ci` → exit 0 for the new source/test/story files.

### Step 5: Publish complete usage and accessibility guidance

Create the four component-doc files and seven example files listed in Scope.

- In `index.mdx`, use `@salt-ds/core`, source path
  `packages/core/src/list`, and `initialVersion: "1.71.0"` (the planned next
  minor after the current Core `1.70.0`).
- In `usage.mdx`, document the component responsibilities and all four
  compositions. Include a comparison table:
  - `List`: passive content and persistent independent actions/links;
  - `ListBox`: choosing one or more form values;
  - `Menu`: a transient command-menu composite;
  - `VerticalNavigation`/`MegaMenu`: application/site navigation systems.
- State that “nested actions” means controls nested within `ListItem` as
  siblings of `ListItemAction`, never controls nested inside a button or link.
- State that v1 `ListItemContent` supports phrasing/non-interactive content in
  both passive and actionable forms. Core `Text` or layout primitives inside it
  must be configured to render a span-safe host. Arbitrary block-host content
  is not part of the v1 content-slot contract; do not make the host switch based
  on context.
- Document the `href` discriminator, render-prop router pattern, native disabled
  button behavior, unsupported fake-disabled links, and optional named
  `role="group"` on `ListItemActions`.
- Explain Salt render-prop precedence: prefer a self-closing JSX render element,
  and verify that it does not replace the action's visible/accessibility label.
  For `target="_blank"`, demonstrate rendering Core `Link` so its established
  external-link icon and announcement remain available without nesting anchors.
- In `accessibility.mdx`, document native Tab/Shift+Tab order, button
  Enter/Space, link Enter, the absence of arrow-key navigation, contextual
  accessible names for icon-only secondary actions, and Dialog/Overlay focus
  ownership.
- In `examples.mdx`, expose live previews for every example in
  `site/src/examples/list/index.ts`.
- `Default.tsx` shows passive content; `WithSecondaryActions.tsx` shows passive
  rows with one/multiple trailing controls; `ActionItems.tsx` shows both button
  and link primary rows with sibling controls; `RoutingLibraries.tsx` shows JSX
  and callback `render` conventions; `InDialog.tsx` and `InOverlay.tsx` show the
  motivating integrations and parent-owned focus/scrolling.
- Use only Core imports in docs/examples. Do not mention or link to Lab.
- Document that mixed passive/actionable rows are supported, `List` never
  dismisses a parent surface, navigation lists belong inside a labelled
  `<nav>`, and applications own focus recovery after removing a focused row.

**Verify**:

- `yarn typecheck` → exit 0; every example compiles.
- `yarn workspace @salt-ds/site gen:props` → exit 0; the generated ignored Core
  props data contains `List`, `ListItem`, `ListItemContent`, `ListItemAction`,
  and `ListItemActions`.
- `yarn workspace @salt-ds/site spellcheck` → exit 0.
- `yarn workspace @salt-ds/site build` → exit 0; MDX and all live examples
  resolve.
- `yarn build-storybook` → exit 0; the Core stories resolve.

### Step 6: Complete the manual accessibility and visual matrix

Run `yarn storybook`, open the List QA stories, and record the browser/OS/version,
story name, result, and screenshot or short capture in the executor's completion
handoff. If a PR already exists, copy the same evidence into its description;
do not create or modify a PR solely for this step. All rows below must pass
before release:

| Environment                                                   | Check                                                 | Expected result                                                                                                                                                                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Safari 15.4 or newer on macOS with VoiceOver                  | Navigate default `ul`, explicit `ol`, and mixed rows. | VoiceOver announces a list and the correct item count; each primary/secondary control is announced once with its native role/name. If marker removal suppresses list exposure, add only `role="list"` to the root and rerun. |
| Current Chrome or Edge on Windows with forced-colors mode     | Tab through button/link rows and trailing controls.   | Every control has a visible, unclipped focus indicator; primary and trailing hit regions remain distinct; disabled primary buttons remain distinguishable.                                                                   |
| Current Chrome at 200% browser zoom and a 320 CSS px viewport | Review long labels and multiple trailing actions.     | Text reflows without two-dimensional page scrolling, clipping, or controls covering content; Dialog/Overlay remain the only vertical scroll owners.                                                                          |
| Current Chrome in LTR and RTL                                 | Review all four compositions.                         | Primary content and trailing controls mirror correctly, retain DOM/Tab order, and meet the intended target size.                                                                                                             |
| Current Chrome, keyboard-only, in Dialog and Overlay examples | Use Tab/Shift+Tab, Enter/Space, arrows, and Escape.   | Native activation remains correct; arrows do not move row focus; actions do not auto-dismiss; Escape and focus return remain owned by the surface.                                                                           |

If Safari/VoiceOver is unavailable, do not claim this gate passed: set the plan
status to `BLOCKED (Safari/VoiceOver QA pending)` and hand the exact story URL
and remaining row to a reviewer with access. If the `role="list"` fallback or a
normal in-scope CSS correction does not produce the expected result, stop and
report.

### Step 7: Add release metadata and run the complete gate

Create `.changeset/add-core-list.md`:

```md
---
"@salt-ds/core": minor
---

Added `List`, `ListItem`, `ListItemContent`, `ListItemAction`, and
`ListItemActions` for passive and actionable list rows.
```

Run the complete checks below, address only failures caused by files in Scope,
and review the final diff for accidental composite roles, row click handlers,
overflow, non-token values, or out-of-scope edits. Update the Plan 001 status
in `plans/README.md` to `DONE` only after every check succeeds.

**Verify**:

- `yarn lint:check:error` → exit 0.
- `yarn biome ci --reporter=github` → exit 0.
- `yarn lint:style:core` → exit 0.
- `yarn prettier:ci` → exit 0.
- `yarn typecheck` → exit 0.
- `yarn workspace @salt-ds/core build` → exit 0.
- `yarn bundle:core:css` → exit 0.
- `yarn test:components --spec "packages/core/src/__tests__/__e2e__/list/List.cy.tsx"`
  → Cypress exits 0 and all List tests pass.
- `yarn build-storybook` → exit 0.
- `yarn workspace @salt-ds/site gen:props` → exit 0; generated ignored props
  data contains all five List exports.
- `yarn workspace @salt-ds/site spellcheck` → exit 0.
- `yarn workspace @salt-ds/site build` → exit 0.
- `yarn changeset status` → exit 0 and reports one pending Core minor change.
- `git status --short` → every modified/untracked path is in Scope; there are no
  changes under `packages/lab/**`.

## Test plan

- Primary automated coverage lives in
  `packages/core/src/__tests__/__e2e__/list/List.cy.tsx` and covers the 12 cases
  enumerated in Step 3.
- Use `NavigationItem.cy.tsx` for link/button/render structure and `Link.cy.tsx`
  for render merging. Do not copy navigation-specific active state or behavior.
- The regression focus is invalid/nested interactive DOM and event leakage:
  every primary control must be a sibling of `ListItemActions`, and activating a
  trailing control must never activate the primary control.
- Axe coverage must mount all four public compositions, including multiple
  secondary actions with contextual labels.
- Dialog and Overlay integration tests must prove that adding List introduces no
  second focus-management system, does not auto-dismiss either surface, and
  leaves Escape to the owner.
- Visual review in the QA story must cover density, RTL, long content, focus
  rings, forced colors, 200% zoom, primary-state backgrounds,
  secondary-control hit targets, and a single parent-owned scroll container.
- Manual acceptance uses the exact five-row environment/check/expected-result
  matrix in Step 6; include its evidence in the completion handoff (and an
  existing PR, if available) or block the plan for a reviewer who can complete
  it.
- Verification:
  `yarn test:components --spec "packages/core/src/__tests__/__e2e__/list/List.cy.tsx"`
  → all List tests pass with zero accessibility violations.

## Done criteria

- [ ] All five components and their public prop types are exported from
      `@salt-ds/core`.
- [ ] Default DOM is native `ul > li`; `as="ol"` produces native `ol > li`.
- [ ] All four canonical compositions render with identical row geometry.
- [ ] Interactive rows contain sibling primary and secondary controls; there are
      no nested interactive descendants and no focusable/clickable `<li>`.
- [ ] No `menu`, `listbox`, `option`, toolbar, selection, roving-tabindex,
      arrow-key, Escape, focus-trap, focus-return, or automatic scrolling behavior
      exists in the new family.
- [ ] `href` selects an anchor; no `href` defaults to
      `button type="button"`; explicit native submit/reset overrides remain
      possible; both branches and custom renderers forward native props and infer
      branch-correct events/refs; the `@typings/List.tsx` positive and negative
      cases compile.
- [ ] Disabled-button and independent secondary-action behavior is tested; no
      fake-disabled link API exists.
- [ ] `List` sets no overflow and adds no theme token.
- [ ] The focused Cypress command exits 0 with all 12 named behavior groups and
      axe coverage passing.
- [ ] `yarn lint:check:error`, `yarn biome ci --reporter=github`,
      `yarn lint:style:core`, `yarn prettier:ci`, `yarn typecheck`,
      `yarn workspace @salt-ds/core build`, `yarn bundle:core:css`,
      `yarn build-storybook`, `yarn workspace @salt-ds/site spellcheck`, and
      `yarn workspace @salt-ds/site build` all exit 0.
- [ ] The Step 6 manual matrix has browser/version evidence for every row, or
      the plan is marked BLOCKED rather than DONE.
- [ ] The Core minor changeset exists and lists all five new exports.
- [ ] `yarn workspace @salt-ds/site gen:props` and `yarn changeset status` both
      exit 0 with the five List components and one Core minor change reported.
- [ ] `git status --short` contains only files listed in Scope and no Lab path.
- [ ] `plans/README.md` marks Plan 001 `DONE`.

## STOP conditions

Stop and report back; do not improvise if any of these occurs:

- The drift check shows an existing Core `List` export/directory or any in-scope
  file differs materially from the “Current state” excerpts.
- The current Core version is no longer `1.70.0`; report the version so the
  documentation's `initialVersion` can be revised deliberately.
- A required use case needs selection state, a single composite tab stop,
  arrow-key/typeahead navigation, or Menu/ListBox roles. That is a different
  component contract.
- A required design puts a button, link, checkbox, or focusable element inside
  `ListItemAction`. Report the content structure; do not ship invalid nested
  interactive DOM.
- A full-row pointer target appears to require an absolute overlay that covers
  `ListItemActions`. Keep the sibling hit regions and request design direction.
- Product requirements add disabled-link behavior. Native anchors have no
  disabled state; this needs an explicit separate decision.
- Correct rendering or ref forwarding would require weakening the public action
  props to `any` or abandoning the `href` discriminator.
- A required content composition needs an arbitrary block host inside
  `ListItemContent`; v1 deliberately uses a fixed, phrasing-safe `span` in both
  passive and actionable rows.
- Styling cannot be expressed with existing Salt tokens or requires List to own
  scrolling.
- Completion requires changing any file under `packages/lab/**`, migrating an
  existing component, or touching any other out-of-scope file.
- A verification command fails twice after one reasonable in-scope correction,
  or failure is clearly unrelated to this change. Capture the command and
  output and report it rather than expanding scope.
- Any required environment in the Step 6 manual matrix is unavailable or still
  fails after the specified in-scope fallback/correction. Mark the plan BLOCKED
  with the exact remaining environment and result.

## Maintenance notes

- Keep this component structural. If consumers later request selection or rich
  composite row navigation, evaluate a separate ListBox/GridList-style API
  rather than layering state and roving focus onto `List`.
- Reviewers should scrutinize the action prop union/ref types, merged render
  props, actual rendered DOM, and pointer/focus isolation between primary and
  trailing controls.
- If Safari/VoiceOver in the supported browser range does not expose a
  markerless native list, the acceptable narrow fix is an explicit
  `role="list"` on the root. Do not introduce a composite role.
- `ListItemContent` is deliberately a `span`, not a `div`, so its canonical use
  inside button actions remains valid HTML.
- Lab migration, aliases, adoption codemods, separators/dividers, drag/reorder,
  virtualization, and disabled links are deliberately deferred.
