# Salt Provider

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/salt-provider
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/salt-provider/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/salt-provider/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/salt-provider/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-salt-provider--default

## When to use

- At app root to establish shared Salt theme, mode, and density defaults.
- When you need scoped theming/mode/density behavior in part of a page.
- When responsive behavior requires custom breakpoints consumed by Salt hooks.
- When nested providers should inherit and selectively override parent values.

## When not to use

- For local visual tweaks on a single component; use component props/styles instead.
- For broad arbitrary nesting of many providers without clear UX need; docs recommend using nested providers sparingly.
- SOURCE_GAP: usage.mdx does not publish an explicit “When not to use” list.

## Accessibility intent

- This component has no dedicated accessibility guidance.
- Treat SaltProvider as contextual infrastructure rather than an interactive control.
- Ensure downstream components remain accessible across chosen `theme`, `mode`, and `density` values.

## Decision trees

### Provider placement and scope
- Need global design-system context for the app → root `SaltProvider`
- Need local override in one section → nested `SaltProvider`
- Need to apply classes/data attrs to a single child element → `applyClassesTo="child"` and provide exactly one valid child
- Need wrapper container with scoped classes → `applyClassesTo="scope"`

### Configuration choices
- Default app density/mode are acceptable → omit props and inherit defaults
- Touch-first devices require larger targets → prefer `density="touch"` (or `mobile` where supported)
- Theming requires multiple classes → pass space-separated `theme` names
- Component CSS is pre-bundled manually → set `enableStyleInjection={false}`
- Responsive hooks need custom thresholds → supply `breakpoints`

## Validation checklist

- [ ] Root provider exists where global Salt context is required
- [ ] Nested providers override only needed values and intentionally inherit the rest
- [ ] `applyClassesTo` choice (`root`/`scope`/`child`) matches DOM/theming intent
- [ ] `enableStyleInjection` is true unless CSS is intentionally provided externally
- [ ] `theme`, `mode`, `density`, and `breakpoints` values are valid and coherent
- [ ] Storybook IDs validated: `core-salt-provider--default`, `--toggle-theme`, `--nested-providers`
- [ ] SOURCE_GAP noted: `core-salt-provider-next--default` story ID does not resolve

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/salt-provider/SaltProvider.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/salt-provider/ThemeApplicator.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/salt-provider/SaltProvider.css
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/salt-provider/salt-provider.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/salt-provider/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/salt-provider/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/salt-provider/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-salt-provider--default
- https://storybook.saltdesignsystem.com/?path=/story/core-salt-provider--nested-providers
- https://storybook.saltdesignsystem.com/?path=/story/core-salt-provider-next--default

## AI generation rules (required)

### Select this component when
- The requirement is to provide or override Salt context values (`theme`, `mode`, `density`, `breakpoints`) across a subtree.
- Multiple descendant components must share the same design-system environment.
- Nested, scoped overrides are needed without manual prop threading.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { SaltProvider } from "@salt-ds/core";` |
| **Scope** | Root provider for app-wide context; nested providers for local overrides only |
| **Defaults** | Omit props when default behavior (`mode=light`, `density=medium`) is intended |
| **applyClassesTo** | Use `child` only with one valid React element child; otherwise prefer `scope`/`root` |
| **Style injection** | Keep `enableStyleInjection` enabled unless external CSS loading is guaranteed |
| **Hooks** | Use `useTheme`, `useDensity`, and `useBreakpoints` for contextual reads inside provider subtree |

### Validation
- [ ] Generated usage aligns with `./salt-provider.md` "When to use"
- [ ] Generated usage avoids `./salt-provider.md` "When not to use"
- [ ] Required props and value types match `./salt-provider.json`
- [ ] Accessibility requirements from `./salt-provider.json` are satisfied