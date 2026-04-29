# Skip Link

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/skip-link
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/skip-link/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/skip-link/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/skip-link/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-skip-link--default

## When to use

- Place as the first focusable element in page/app header so keyboard and screen reader users can bypass repeated navigation.
- Use when pages contain repeated masthead/navigation content before primary content.
- Use to reduce repeated keystrokes and repeated screen reader output before main content.

## When not to use

- Do not use when there is no repeated top-of-page content to bypass.
- Do not point to missing/unstable targets; component will not render when `targetId` cannot be resolved.

## Accessibility intent

- Keyboard interactions (from Salt accessibility guidance):
	- `Tab`: enters page focus order and reveals/focuses the skip link.
	- `Shift+Tab`: navigates backward; from skip link, it hides and returns to previous focusable element.
	- `Enter` / `Space`: activates skip link and moves focus to target content.
- Keep label explicit and destination-oriented (for example, “Skip to main content”).
- Ensure target element is focusable or can receive temporary focus (Salt handles temporary tabindex internally).

## Decision trees

### Placement and target
- Building page shell with header/nav before content → place `SkipLink` at top of header.
- Main content has stable heading/landmark ID → set `targetId` to that element ID.
- No reliable target ID available yet → create target element first, then add `SkipLink`.

### Interaction behavior
- Need default skip behavior only → provide `targetId` and label text.
- Need analytics/custom side effects → add `onClick`/`onKeyUp` without replacing focus-transfer behavior.
- Target could disappear conditionally → guard layout so `targetId` remains valid whenever link is expected.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `targetId` points to an existing element in rendered DOM
- [ ] Skip link is first focusable element in page/application context
- [ ] Link label clearly communicates destination
- [ ] Keyboard flow verified for `Tab`, `Shift+Tab`, and `Enter/Space`
- [ ] Storybook ID validated: `core-skip-link--default`

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/skip-link/SkipLink.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/skip-link/internal/useManageFocusOnTarget.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/skip-link/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/skip-link/skip-link.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/__tests__/__e2e__/skip-link/SkipLink.cy.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/skip-link/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/skip-link/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/skip-link/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-skip-link--default

## AI generation rules (required)

### Select this component when
- You need an in-page bypass link for keyboard/screen reader users to jump to main content.
- Repeated header/navigation content precedes the primary content on the page.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { SkipLink } from "@salt-ds/core";` |
| **Required prop** | Always provide `targetId` and ensure matching element exists in rendered output |
| **Placement** | Place SkipLink as earliest focusable control in page shell/header |
| **Labeling** | Use explicit destination text, e.g. “Skip to main content” |
| **Events** | Allow internal focus movement to run; add handlers only for supplementary behavior |
| **Keyboard** | Preserve `Tab`, `Shift+Tab`, `Enter`, and `Space` behavior from accessibility guidance |

### Validation
- [ ] Generated usage aligns with `./skip-link.md` "When to use"
- [ ] Generated usage avoids `./skip-link.md` "When not to use"
- [ ] Required props and value types match `./skip-link.json`
- [ ] Accessibility requirements from `./skip-link.json` are satisfied