# Semantic Icon Provider

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/semantic-icon-provider
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/semantic-icon-provider/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/semantic-icon-provider/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/semantic-icon-provider/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-semantic-icon-provider--default

## When to use

- You need centralized, semantic icon management for Salt components in a subtree.
- You want to override only specific semantic icons while retaining Salt defaults for all others.
- You are replacing ad-hoc per-component icon wiring with a single provider-based configuration.

## When not to use

- You do not need any icon overrides and have no requirement for scoped icon customization.
- You need per-instance icon changes that should not affect descendant components.

## Accessibility intent

- This component has no direct accessibility behavior; it only supplies icon components via context.
- Ensure replacement icons preserve meaningful labels/semantics expected by consuming components.
- If an icon is decorative, continue to mark it appropriately in consuming UI (`aria-hidden` when appropriate).

## Decision trees

### Provider scope
- Need consistent icon overrides app-wide → place `SemanticIconProvider` near application root.
- Need overrides only for one feature/module → wrap only that subtree.
- Need isolated icon behavior for nested area → add nested provider with local `iconMap`.

### Override strategy
- Need Salt defaults only → omit `iconMap`.
- Need to override a few semantic keys (for example `ExpandIcon`, `CollapseIcon`) → provide partial `iconMap`.
- Need fully custom icon language → provide mappings for all relevant keys consumed by your UI.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `iconMap` keys correspond to semantic keys from `SemanticIconMap`
- [ ] Partial override behavior is intentional (unspecified keys should fall back to defaults)
- [ ] Custom icons are compatible icon components (renderable element types)
- [ ] Storybook IDs validated: `core-semantic-icon-provider--default`, `core-semantic-icon-provider--with-icon-map`

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/semantic-icon-provider/SemanticIconProvider.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/semantic-icon-provider/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/semantic-icon-provider/semantic-icon-provider.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/semantic-icon-provider/semantic-icon-provider.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/semantic-icon-provider/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/semantic-icon-provider/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/semantic-icon-provider/accessibility.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/__tests__/__e2e__/semantic-icon-provider/SemanticIconProvider.cy.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-semantic-icon-provider--default
- https://storybook.saltdesignsystem.com/?path=/story/core-semantic-icon-provider--with-icon-map

## AI generation rules (required)

### Select this component when
- You need scoped semantic icon overrides through context.
- Descendant Salt components or custom components using `useIcon` should resolve icons from a shared map.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { SemanticIconProvider } from "@salt-ds/core";` |
| **Default mode** | When no overrides are requested, render provider without `iconMap` |
| **Override mode** | Provide `iconMap` as a partial object with only keys that need customization |
| **Scope** | Wrap the smallest subtree that should receive icon changes |
| **Compatibility** | Use icon components that are valid React element types and match intended semantics |
| **Hook usage** | Use `useIcon()` in custom descendants when direct semantic icon access is needed |

### Validation
- [ ] Generated usage aligns with `./semantic-icon-provider.md` "When to use"
- [ ] Generated usage avoids `./semantic-icon-provider.md` "When not to use"
- [ ] Required props and value types match `./semantic-icon-provider.json`
- [ ] Accessibility requirements from `./semantic-icon-provider.json` are satisfied