# Segmented Button Group

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/segmented-button-group
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/segmented-button-group/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/segmented-button-group/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/segmented-button-group/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-segmented-button-group--default

## When to use

- To display a related set of actionable buttons flush with separators.
- When grouped actions should appear as one connected control cluster.
- When all actions in the group can use a consistent button variant.

## When not to use

- When grouped actions require mixed variants in one group; variants should stay consistent per group.
- When actions are not meaningfully related; use standalone buttons or another layout pattern.
- SOURCE_GAP: usage.mdx does not provide a dedicated “When not to use” section.

## Accessibility intent

- Follow Button accessibility guidance for each child button.
- Tab enters the group and progresses through buttons in tab order.
- Enter/Space activates the focused button.
- For icon-only segmented actions, provide clear accessible names and tooltip text.

## Decision trees

### Segmented group vs alternatives
- Need a compact cluster of related actions with visual segmentation → use `SegmentedButtonGroup`
- Need independent actions without grouped affordance → use separate `Button` controls
- Need one primary action plus expandable secondary actions → consider split-button pattern using `SegmentedButtonGroup` + `Menu`

### Group content strategy
- Text labels fit clearly → use text buttons
- Icon-only controls needed → add `aria-label` + `Tooltip` for each button
- Disabled actions are present → keep them in same group only if relationship remains clear
- Multiple appearances/sentiments needed → split into separate groups rather than mixing in one group

## Validation checklist

- [ ] Grouped actions are genuinely related and intended as one cluster
- [ ] All buttons in a group use the same variant/visual treatment
- [ ] Icon-only buttons include `aria-label` and supporting tooltip text
- [ ] Keyboard flow works: Tab/Shift+Tab navigation and Enter/Space activation
- [ ] Storybook IDs validated: `core-segmented-button-group--default`, `--icons`
- [ ] SOURCE_GAP noted: `core-segmented-button-group--all-buttons` story ID does not resolve

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/segmented-button-group/SegmentedButtonGroup.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/segmented-button-group/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/segmented-button-group/segmented-button-group.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/segmented-button-group/segmented-button-group.qa.stories.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/segmented-button-group/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/segmented-button-group/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/segmented-button-group/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-segmented-button-group--default
- https://storybook.saltdesignsystem.com/?path=/story/core-segmented-button-group--icons
- https://storybook.saltdesignsystem.com/?path=/story/core-segmented-button-group--all-buttons

## AI generation rules (required)

### Select this component when
- The UI needs a connected set of related actions represented as segmented buttons.
- Action grouping and separator affordance improve scanability and intent.
- Buttons can be presented with a consistent variant in one group.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { SegmentedButtonGroup } from "@salt-ds/core";` |
| **Children** | Render grouped `Button` children; keep action variants consistent within one group |
| **Icon-only pattern** | For icon-only buttons, always include `aria-label` and `Tooltip` |
| **Split-button usage** | Pair with `Menu`/`MenuTrigger` when one segment opens additional actions |
| **Spacing/layout** | Use SegmentedButtonGroup itself for grouping; avoid extra wrappers that break contiguous affordance |
| **A11y flow** | Ensure keyboard tab order through grouped buttons is preserved |

### Validation
- [ ] Generated usage aligns with `./segmented-button-group.md` "When to use"
- [ ] Generated usage avoids `./segmented-button-group.md` "When not to use"
- [ ] Required props and value types match `./segmented-button-group.json`
- [ ] Accessibility requirements from `./segmented-button-group.json` are satisfied