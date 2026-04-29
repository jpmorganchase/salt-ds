# Pill

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/pill
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pill/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pill/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pill/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-pill--default
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-pill-pill-group--default

## When to use

- To organize selections that don’t necessarily belong to the same category or need hierarchical arrangement.
- To trigger immediate actions such as filtering content by a specific property.
- To provide context-dependent actions (for example predefined replies that change by message context).
- To represent removable selected values (closable pill pattern), including within other controls like `ComboBox`.

## When not to use

- For hierarchical same-category selection; use `Checkbox`.
- For switching between views (for example grid/card); use `ToggleButton`.
- For binary actions that apply immediately; use `Switch`.
- For actions that do not change with context; use `Button`.
- For non-interactive labeling; use `Tag`.
- For long labels or sentence-like content; pill labels should remain concise.

## Accessibility intent

- Pill behaves as a `button` by default and supports keyboard activation via Enter/Space.
- In selectable groups (`selectionVariant="multiple"`), pills expose `role="checkbox"` with `aria-checked` state.
- Ensure group naming via visible `FormField` label or `aria-label` / `aria-labelledby` when no visible label exists.
- Use clear `aria-label` text for closable/icon-heavy pills to describe the action (for example “Remove Reports”).

## Decision trees

### Pill vs alternatives
- Need compact context-sensitive action or filter chip → use `Pill`
- Need persistent non-interactive label → use `Tag`
- Need standard action control with stable meaning → use `Button`
- Need binary on/off control → use `Switch`
- Need grouped hierarchical options → use `Checkbox`

### Single pill vs group behavior
- One-off quick action/removable token → standalone `Pill`
- Multiple related pills with shared semantics → `PillGroup`
- Multi-select toggles within a group → `PillGroup selectionVariant="multiple"` and provide `value` on each `Pill`
- Need controlled selection state → use `selected` + `onSelectionChange`
- Need uncontrolled initial selection → use `defaultSelected`

## Validation checklist

- [ ] Pill labels are concise and use sentence/title case
- [ ] Selectable groups provide `value` for each pill
- [ ] Group has an accessible name (visible label or ARIA labeling)
- [ ] Keyboard behavior works: Enter/Space activation and selectable-space toggling
- [ ] Storybook IDs validated: `core-pill--default`, `core-pill--disabled`, `core-pill--closable`, `core-pill--icon`
- [ ] Storybook IDs validated: `core-pill-pill-group--default`, `--selectable-group`, `--controlled-selectable-group`
- [ ] SOURCE_GAP noted: legacy `core-pill-group--default` story ID does not resolve

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/pill/Pill.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/pill/PillGroup.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/pill/PillGroupContext.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/pill/pill.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/pill/pill-group.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pill/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pill/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/pill/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-pill--default
- https://storybook.saltdesignsystem.com/?path=/story/core-pill-pill-group--default
- https://storybook.saltdesignsystem.com/?path=/story/core-pill-group--default

## AI generation rules (required)

### Select this component when
- Intent is a compact, context-dependent action/selection token.
- You need optional grouping (`PillGroup`) with either non-selectable or multi-select behavior.
- Labels can stay short and clear.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { Pill, PillGroup } from "@salt-ds/core";` |
| **Standalone pill** | Render `Pill` as a button with optional `onClick`; include concise child text |
| **Selectable groups** | Use `PillGroup selectionVariant="multiple"`; each child pill must include `value` |
| **State model** | Use `selected` + `onSelectionChange` for controlled groups, otherwise `defaultSelected` |
| **Disabled behavior** | Prefer `PillGroup disabled` to disable all items; use per-pill `disabled` only when needed |
| **Accessible naming** | Ensure grouped pills have visible label or ARIA label; use explicit `aria-label` for removable pills |

### Validation
- [ ] Generated usage aligns with `./pill.md` "When to use"
- [ ] Generated usage avoids `./pill.md` "When not to use"
- [ ] Required props and value types match `./pill.json`
- [ ] Accessibility requirements from `./pill.json` are satisfied