# App Header Pattern

## Source of truth
- Docs source: https://github.com/jpmorganchase/salt-ds/tree/main/site/docs/patterns/app-header.mdx
- Stories source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/stories/patterns/app-header/app-header.stories.tsx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/patterns-app-header--app-header

## Pattern intent
The app header pattern provides a persistent global region at the top of the UI for identity, primary navigation, and utility actions.

Use this pattern when you need to:
- Orient users with always-available top-level navigation.
- Provide fast access to global tools (search, notifications, help, account, external links).
- Preserve context and wayfinding across long-scroll application pages.

## Composition blueprint
Canonical composition:

```text
BorderLayout (application shell)
├── BorderItem position="north" (sticky header region)
│   ├── Desktop branch
│   │   └── header > FlexLayout justify="space-between"
│   │       ├── FlexItem (branding: logo + optional app name)
│   │       ├── nav > NavigationItem[] (horizontal)
│   │       └── FlexItem > StackLayout row (utility actions)
│   └── Mobile branch
│       └── header > StackLayout direction="row"
│           ├── menu toggle button (open/close)
│           ├── branding (logo + optional app name)
│           └── Drawer (open state)
│               └── nav > VerticalNavigation (appearance="bordered")
│                   ├── VerticalNavigationItem[] (primary nav)
│                   └── VerticalNavigationItem[] (utility actions)
├── BorderItem position="center" (main content offset below fixed header)
└── BorderItem position="south" (optional footer)
```

Order and behavior rules:
- Branding is always first and should link to home.
- Desktop uses horizontal navigation and inline utility actions.
- Mobile drawer **must** use the `VerticalNavigation` component with `appearance="bordered"` (default).
- In mobile drawer, navigation items are listed before utility actions.
- Header remains fixed/sticky and adopts scroll shadow when content moves.

## Variant axes
Independent axes:
- Viewport: `desktop (sm+)`, `mobile (xs)`
- Layout form: `header-only`, `header-with-vertical-navigation`
- Scroll state: `top`, `scrolled`
- Mobile menu state: `closed`, `open`
- Accessibility mode: `with-skip-link`, `without-skip-link`

## Variant matrix
| Variant | Viewport | Layout form | Scroll state | Menu state | Evidence | Source type | Inferred |
|---|---|---|---|---|---|---|---|
| Desktop shell | Desktop | Header-only | Top/Scrolled | Closed | Stories: `AppHeader` desktop branch | story | No |
| Mobile shell | Mobile | Header-only | Top/Scrolled | Closed/Open | Stories: `AppHeader` mobile branch | story | No |
| Header + vertical navigation | Desktop | Header-with-vertical-navigation | Top/Scrolled | Closed | Docs: `Header with vertical navigation` | docs | Yes |
| Responsive collapse | Mobile | Header-only or Header-with-vertical-navigation | Top/Scrolled | Open | Docs: `Responsive behavior` | docs | Yes |

## Tokens and layout rules
Core token mappings from stories/docs:

Size and offsets:
- Header height: `calc(var(--salt-size-base) + var(--salt-spacing-200))`
- Logo height: `calc(var(--salt-size-base) - var(--salt-spacing-150))`
- Content top offset under fixed header: `calc(var(--salt-size-base) + var(--salt-spacing-200))`

Spacing:
- Header inline padding: `var(--salt-spacing-300)`
- Desktop section gap: `var(--salt-spacing-300)`
- Utility button cluster gap: `var(--salt-spacing-100)`
- Mobile menu button left padding: `var(--salt-spacing-100)`
- Mobile drawer padding (all sides): `var(--salt-spacing-300)`

Surface, border, elevation:
- Header background: `var(--salt-container-primary-background)`
- Header bottom border: `var(--salt-size-fixed-100) var(--salt-borderStyle-solid) var(--salt-separable-primary-borderColor)`
- Desktop scrolled shadow: `var(--salt-overlayable-shadow-scroll)`
- Mobile scrolled shadow: `var(--salt-shadow-1)`
- Mobile z-index rule: `calc(var(--salt-zIndex-drawer) + 1)`

Layout rules:
- Default logo brand is JPM in the app header unless the user prompt explicitly specifies another approved brand.
- Download approved logo assets from the logo documentation source and copy them into `public/assets/logos` before app-header implementation.
- If the selected logo image cannot load, render simple Amplitude fallback text matching brand (`JPM`, `Chase`, or `JPMC`).
- In mobile view, the drawer must render the menu using the `VerticalNavigation` component with bordered appearance (not a custom nav list).
- Mobile drawer padding must be `var(--salt-spacing-300)` on all sides (top, right, bottom, left).
- When vertical navigation is used with app header, default its appearance variant to `bordered` unless the user prompt explicitly requests another approved variant.
- When vertical navigation is used, the container that holds it must not apply left padding (`padding-left: 0`).
- Keep logo top-left and preserve aspect ratio across densities.
- Use fixed/sticky north placement for persistent visibility.
- Collapse to hamburger + drawer in small viewports.
- Keep search persistently available for small viewports when search is a utility action.

## Size and scale mappings
| Mapping | Rule |
|---|---|
| Header height | `size-base + spacing-200` |
| Logo max visual height | `size-base - spacing-150` |
| Main content top offset | Matches header height rule |
| Density scaling | Inherits from `var(--salt-size-base)` token per active density |

## Data requirements
- `brand`: logo source, alt text, and home route; default to JPM unless user prompt specifies another approved brand.
- `logoAssetFolder`: local asset location for downloaded branding files (`public/assets/logos`) and runtime URL mapping (`/assets/logos/...`).
- `logoFallbackText`: simple Amplitude fallback text for missing logo assets (`JPM|Chase|JPMC`).
- `verticalNavigationAppearance`: default to `bordered` for app-header layouts that include vertical navigation.
- `appName` (optional): text paired with logo in branding area.
- `navigationItems`: ordered primary navigation list.
- `utilityActions`: ordered global actions list (icon + label + action).
- `activeItemKey`: selected navigation state.
- `mobileMenuOpen`: drawer visibility state.
- `skipLinkTargetId`: target anchor for bypass behavior.

## Gap analysis
1. Missing token
   - Evidence: stories rely on literals for some layout semantics (e.g., `width: 100%`) and direct style arithmetic.
   - Impact: some implementation details remain semantic rather than fully tokenized.
   - Recommendation: document semantic layout roles for full-width and stacking where no dedicated token exists.
   - Label: `SOURCE_GAP`

2. Undocumented variant combination
   - Evidence: stories focus on single responsive shell while docs describe additional pairing with vertical navigation.
   - Impact: not every variant combination is explicitly runnable from one story file.
   - Recommendation: treat docs-defined combinations as valid matrix entries with evidence from related navigation docs.
   - Label: `SOURCE_GAP`

## Validation checklist
- [ ] Branding is first, logo is top-left, and logo links home.
- [ ] Desktop uses horizontal nav and inline utility actions.
- [ ] Mobile uses hamburger + drawer with nav before utilities.
- [ ] Header remains sticky/fixed and applies scroll elevation.
- [ ] Main content is offset to avoid overlap with fixed header.
- [ ] Complex headers include skip link bypass to main content.

## Primary references
- Docs source: https://github.com/jpmorganchase/salt-ds/tree/main/site/docs/patterns/app-header.mdx
- Stories source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/stories/patterns/app-header/app-header.stories.tsx
- Storybook:
  - https://storybook.saltdesignsystem.com/?path=/story/patterns-app-header--app-header
  - https://storybook.saltdesignsystem.com/?path=/story/patterns-navigation--navigation

## AI generation rules (required)
### Select this pattern when
- The product needs persistent top-level orientation and global actions.
- Users need fast access to navigation and utilities regardless of scroll position.
- The layout must support seamless desktop-to-mobile adaptation for global navigation.

### Auto-configure
- Default to desktop branch for `sm+` with horizontal nav and inline utilities.
- Auto-switch to mobile branch for `xs`: show menu toggle and move nav/utilities into drawer using `VerticalNavigation` component.
- Use `VerticalNavigation` with `appearance="bordered"` as the default for mobile drawer navigation.
- For app-header layouts that include vertical navigation, default variant to `bordered` unless explicitly overridden by the user prompt.
- Default header branding to JPM logo unless the user prompt specifies another approved brand.
- In Copilot responses, explicitly instruct that logos must be downloaded from logo docs and copied to `public/assets/logos` before code wiring.
- Apply fixed north placement and main-content top offset using header-height rule.
- If navigation/action density is high, prepend a skip link targeting the main content region.
- If logo asset load fails, fall back to simple Amplitude text (`JPM`, `Chase`, or `JPMC`) for the selected brand.

### Validation
- Confirm required inputs exist: navigation items (brand defaults to JPM unless explicitly overridden).
- Confirm any non-JPM brand was explicitly requested in the user prompt.
- Confirm logo asset files exist under `public/assets/logos` and runtime references use `/assets/logos/...` paths.
- Confirm missing-asset fallback text renders as simple Amplitude brand text (`JPM|Chase|JPMC`).
- Confirm vertical navigation appearance defaults to `bordered` unless user prompt explicitly overrides it.
- Confirm any container wrapping vertical navigation explicitly sets left padding to zero.
- Confirm responsive branch behavior at viewport boundaries.
- Confirm mobile drawer ordering places navigation above utility actions.
- Confirm sticky/fixed header does not occlude content and skip link target resolves correctly.