# Kbd

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/kbd
- Core source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/kbd/Kbd.tsx
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/kbd/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/kbd/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/kbd/accessibility.mdx
- Stories source: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/kbd/kbd.stories.tsx
- E2E tests: https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/kbd/Kbd.cy.tsx
- Storybook: SOURCE_GAP — direct story IDs for Kbd did not resolve in hosted Storybook during this audit.

## When to use

- To display keyboard shortcuts by visually highlighting keys or key combinations.
- Inline with instructional text that references keyboard actions.
- Inside inputs or menus to show associated shortcut keys.
- To help users quickly identify available keyboard shortcuts, especially in power-user workflows.

## When not to use

- For non-keyboard actions (mouse gestures, pointer-only actions, or decorative UI labels).
- For purely decorative styling unrelated to keyboard input.
- For long text, sentences, or paragraphs; use it only for keys or short key combinations.

## Accessibility intent

- `Kbd` is announced by screen readers as plain text.
- Always pair `Kbd` with nearby descriptive text that explains what the shortcut does.
- For key combinations, include explicit separators such as `+` between keys.
- `Kbd` is not focusable; keyboard interactions are handled by the containing interactive element.

## Decision trees

### Kbd vs alternatives
- Need to denote specific keyboard key(s) in UI copy? → Use `Kbd`.
- Need generic emphasis for non-keyboard text? → Use regular text styles/components.

### Shortcut formatting
- Single key shortcut? → Use one `Kbd` element.
- Multi-key shortcut? → Use multiple `Kbd` elements separated by visible text (for example `+`).
- Shortcut appears in control copy (menu/input/button)? → Keep `Kbd` adjacent to the action label text.

### Variant choice
- Default surface usage? → Use `primary`.
- Alternate surfaces or hierarchy needs? → Use `secondary` or `tertiary` to match context.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `Kbd` content represents real keyboard keys/shortcuts
- [ ] Multi-key shortcuts include clear separators (for example `+`)
- [ ] Descriptive surrounding text explains shortcut purpose
- [ ] Variant matches background/surface context
- [ ] Keyboard behavior remains owned by parent interactive elements

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/kbd
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/kbd/Kbd.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/kbd/Kbd.css
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/kbd/index.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/kbd/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/kbd/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/kbd/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/kbd/kbd.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/__tests__/__e2e__/kbd/Kbd.cy.tsx

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./kbd.md`
- Required behavior and constraints can be satisfied using props/states documented in `./kbd.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./kbd.json` |
| **Scope** | Use only for keyboard keys and shortcut combinations |
| **Combinations** | Render each key token separately and include visible separators like `+` |
| **Context** | Pair with descriptive text that explains resulting action |
| **Variant** | Choose `primary`/`secondary`/`tertiary` based on surrounding surface |
| **Accessibility** | Keep `Kbd` non-focusable and rely on parent controls for keyboard handling |

### Validation
- [ ] Generated usage aligns with `./kbd.md` "When to use"
- [ ] Generated usage avoids `./kbd.md` "When not to use"
- [ ] Required props and value types match `./kbd.json`
- [ ] Accessibility requirements from `./kbd.json` are satisfied
