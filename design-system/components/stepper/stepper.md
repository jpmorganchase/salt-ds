# Stepper

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/stepper
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/stepper/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/stepper/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/stepper/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-stepper--horizontal

## When to use

- When a process has clear sequential stages, such as onboarding or multi-step forms.
- When splitting long workflows into smaller, comprehensible sections improves completion.
- When you need to show stage progression (`pending`, `inprogress`, `completed`, `active`, `locked`) and optional warning/error status.

## When not to use

- When there are fewer than three steps.
- As navigation between pages; Stepper does not represent navigable tabs/links.

## Accessibility intent

- Provide a contextual `aria-label` on the parent `Stepper` to identify the process.
- Keyboard interactions apply to nested vertical steppers where expand/collapse buttons are rendered.
- Keep step labels concise and self-explanatory; labels wrap and do not truncate.
- Do not present Stepper as interactive site navigation.

## Decision trees

### When to use this component vs alternatives
- Use `Stepper` when communicating ordered progress through a process.
- Use simpler status text/list patterns when order and progression are not central.

### Orientation and nesting decisions
- Use horizontal orientation for flat, top-level steps.
- Use vertical orientation when nested substeps are required.
- Avoid nesting in horizontal orientation; nested steps are only supported vertically.

### Stage vs status decisions
- Use `stage` for process position/progress (`pending`, `active`, `inprogress`, `completed`, `locked`).
- Use `status` (`warning`/`error`) to override stage appearance when an issue must be highlighted.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] Required props provided with correct types
- [ ] Accessibility attributes properly configured
- [ ] Keyboard navigation works as expected
- [ ] Visual states meet design system standards

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/stepper
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/stepper/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/stepper/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/stepper/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-stepper--horizontal
- https://storybook.saltdesignsystem.com/?path=/story/core-stepper--vertical
- https://storybook.saltdesignsystem.com/?path=/story/core-stepper--stage-status
- https://storybook.saltdesignsystem.com/?path=/story/core-stepper--vertical-depth-1
- https://storybook.saltdesignsystem.com/?path=/story/core-stepper--vertical-depth-2

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./stepper.md`
- Required behavior and constraints can be satisfied using props/states documented in `./stepper.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./stepper.json` |
| **Structure** | Render `Step` elements as direct children of `Stepper`; use nested `Step` only with `orientation="vertical"` |
| **State** | Use `stage` for progression and add `status` only for warning/error overrides |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./stepper.json` |

### Validation
- [ ] Generated usage aligns with `./stepper.md` "When to use"
- [ ] Generated usage avoids `./stepper.md` "When not to use"
- [ ] Required props and value types match `./stepper.json`
- [ ] Accessibility requirements from `./stepper.json` are satisfied