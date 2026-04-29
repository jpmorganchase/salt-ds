# Link

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/link
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link/Link.tsx
- Styles source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link/Link.css
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link/accessibility.mdx
- Stories source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/link/link.stories.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/link/Link.cy.tsx
- Storybook: SOURCE_GAP — direct hosted Storybook link IDs for this component did not resolve during this audit.

## When to use

- To provide navigation to a page on the same or different site.
- To link to documents, email addresses, and phone numbers.
- To jump users to a specific section on the same page.
- To provide additional help or reference information (for example terms, support, or contact details).

## When not to use

- To trigger an action (for example submit, open dialog, toggle UI state); use `Button` instead.

## Accessibility intent

- Link text should be meaningful out of context and accurately describe the destination.
- Avoid duplicate ambiguous labels that point to different targets.
- For icon + text links, mark decorative icon as `aria-hidden`.
- For icon-only links, provide an `aria-label` on the link.
- Keyboard behavior follows anchor semantics: Enter activates navigation when `href` is present.

## Decision trees

### Link vs alternatives
- Need navigation to another destination or resource? → Use `Link`.
- Need to perform an in-place action? → Use `Button`.
- Need card-style navigational block? → Consider `LinkCard`.

### Target and security choices
- Same-tab navigation is acceptable? → Keep default `target="_self"`.
- Must open in new tab for workflow reasons? → Use `target="_blank"` and set `rel="noopener"` or `rel="noreferrer"` for cross-origin links.
- Need custom external-link icon behavior? → Use `IconComponent` (or `null` in approved contexts).

### Content and styling choices
- Need subtle hierarchy changes? → Use `color` (`primary`, `secondary`, `accent`, `inherit`).
- Need no underline styling? → Use `underline="never"` sparingly.
- Need truncated link text? → Use `maxRows` with constrained container width.
- Need custom anchor implementation integration? → Use `render` element or callback.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Link text accurately describes destination and makes sense out of context
- [ ] `_blank` usage is intentional and paired with appropriate `rel`
- [ ] Icon-only links include `aria-label`
- [ ] Decorative icons inside links are marked `aria-hidden`
- [ ] Link style choices (`color`, `underline`) preserve discoverability and contrast

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/link
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link/Link.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link/Link.css
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/link/LinkAction.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/link/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/link/link.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/link/Link.cy.tsx

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./link.md`
- Required behavior and constraints can be satisfied using props/states documented in `./link.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./link.json` |
| **Intent** | Use `Link` for navigation, not for in-place actions |
| **Text quality** | Generate concise, destination-specific link text that stands alone |
| **External targets** | If using `target="_blank"`, include secure `rel` for cross-origin links |
| **Icons** | Keep icon semantics accessible (`aria-hidden` for decorative, `aria-label` for icon-only links) |
| **Customization** | Use `render` for custom anchor integrations while preserving link semantics |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./link.json` |

### Validation
- [ ] Generated usage aligns with `./link.md` "When to use"
- [ ] Generated usage avoids `./link.md` "When not to use"
- [ ] Required props and value types match `./link.json`
- [ ] Accessibility requirements from `./link.json` are satisfied
