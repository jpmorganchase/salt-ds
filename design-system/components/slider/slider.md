# Slider

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/slider
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/slider/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/slider/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/slider/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-slider--default

## When to use

- When selecting a single value from a numeric range or relative scale.
- When approximate selection is acceptable and immediate feedback is expected (for example volume-like controls).
- When users benefit from quick keyboard/pointer adjustments rather than typed entry.

## When not to use

- When exact numeric entry across a very large range is required (for example 1–1000); use `Input` instead.
- When representing progress through discrete workflow steps; use `Stepper` instead.

## Accessibility intent

- Keyboard interactions from Salt accessibility guidance:
	- `Tab` / `Shift+Tab`: enter/leave slider in tab order.
	- `ArrowUp` / `ArrowRight`: increment by one step.
	- `ArrowDown` / `ArrowLeft`: decrement by one step.
	- `Home` / `End`: jump to min/max bound.
	- `PageUp` / `PageDown`: larger increment/decrement using `stepMultiplier`.
- Provide an accessible name (`aria-label`, `aria-labelledby`, or `FormField` label association).
- Use `aria-valuetext`/`format` for semantic values (for example day names or currencies).

## Decision trees

### Slider configuration
- Need free numeric movement in range → use `min`/`max` with `step`.
- Need only predefined points → provide `marks` and set `restrictToMarks={true}`.
- Need visual guidance on predefined points → add `showTicks` (with `marks`).
- Need custom display text/value semantics → provide `format` and optionally `aria-valuetext`.

### Labeling and context
- Need boundary context visible → use `minLabel` and `maxLabel`.
- Boundary labels are long and may overflow → set `constrainLabelPosition={true}`.
- Need explicit accessible boundary text distinct from visual labels → set `accessibleMinText` / `accessibleMaxText`.

### State management
- App manages slider state centrally → use controlled `value` + `onChange`.
- Local simple interaction is sufficient → use `defaultValue` uncontrolled mode.
- Need final committed updates tracking → handle `onChangeEnd` in addition to `onChange`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `min`, `max`, and `step` are coherent for expected range behavior
- [ ] `restrictToMarks` is only used when `marks` are provided
- [ ] Controlled/uncontrolled mode is chosen intentionally (no mixed pattern)
- [ ] Accessible name and value text are present and meaningful
- [ ] Keyboard interactions verified (`Arrow`, `Home/End`, `PageUp/PageDown`)
- [ ] Storybook IDs validated for key examples (`core-slider--default`, `--with-inline-labels`, `--with-marks`, `--with-mark-ticks`, `--with-restrict-to-marks`, `--with-input`, `--with-custom-step`, `--disabled`)

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/slider/Slider.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/slider/internal/useSliderThumb.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/slider/internal/utils.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/slider/slider.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/__tests__/__e2e__/slider/Slider.cy.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/slider/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/slider/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/slider/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-slider--default

## AI generation rules (required)

### Select this component when
- The interaction is numeric range selection for a single value with immediate visual feedback.
- Keyboard and pointer adjustment are preferred over direct text entry.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { Slider } from "@salt-ds/core";` |
| **Bounds** | Always define meaningful `min`/`max`; add `step` when non-default precision is required |
| **Marks mode** | If discrete positions are required, provide `marks` and set `restrictToMarks={true}` |
| **Ticks** | Use `showTicks` only when marks are visible and helpful |
| **Text/value semantics** | Use `format` and/or `aria-valuetext` for non-plain numeric meaning |
| **State pattern** | Use either controlled (`value` + `onChange`) or uncontrolled (`defaultValue`) mode consistently |
| **Tooltip** | Keep `showTooltip` enabled unless UI intentionally minimizes hover/focus overlays |

### Validation
- [ ] Generated usage aligns with `./slider.md` "When to use"
- [ ] Generated usage avoids `./slider.md` "When not to use"
- [ ] Required props and value types match `./slider.json`
- [ ] Accessibility requirements from `./slider.json` are satisfied