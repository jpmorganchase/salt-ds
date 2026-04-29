# Status Adornment

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/status-adornment
- Usage docs: SOURCE_GAP (no dedicated status-adornment page found)
- Examples docs: SOURCE_GAP (no dedicated status-adornment examples page found)
- Accessibility docs: SOURCE_GAP (no dedicated status-adornment accessibility page found)
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-status-adornment--default

## When to use

- When you need compact validation feedback inside or adjacent to form controls.
- As an adornment-level status cue for `error`, `warning`, or `success` states.
- When used by higher-level field components (for example `Input`/`PillInput`) that already provide validation context.

## When not to use

- Do not use as the only communication for validation state; pair with labels/helper/error text.
- Do not use for informational state (`info`) in this adornment pattern; use broader status components where appropriate.
- Do not force status values that are not mapped to adornment icons; unmapped statuses render nothing.

## Accessibility intent

- Component has no interactive behavior; keyboard support is inherited from surrounding control.
- Rendered icon is labeled with the status value (`aria-label={status}`).
- Provide textual validation messaging in addition to iconography for robust accessibility.

## Decision trees

### Status choice
- Critical input issue blocks completion → `status="error"`.
- Potential issue that allows continuation → `status="warning"`.
- Positive validation confirmation → `status="success"`.
- Need general informational state → prefer `StatusIndicator` or status-capable parent components rather than `StatusAdornment`.

### Integration approach
- Adding inline field validation affordance → use `StatusAdornment` in adornment area.
- Need richer message hierarchy (icon + title + description/actions) → use `Banner`, `Toast`, or other status components.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `status` is one of expected adornment statuses (`error`, `warning`, `success`)
- [ ] Icon is paired with accessible text/field messaging
- [ ] Adornment placement is inside an appropriate form/validation context
- [ ] SOURCE_GAP acknowledged: no dedicated status-adornment docs page currently found
- [ ] SOURCE_GAP acknowledged: `core-status-adornment--default` Storybook ID does not resolve in current taxonomy

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/status-adornment/StatusAdornment.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/status-adornment/StatusAdornment.css
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/status-adornment/ErrorAdornment.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/status-adornment/WarningAdornment.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/status-adornment/SuccessAdornment.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/status-adornment/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/pill-input/PillInput.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/semantic-icon-provider/SemanticIconProvider.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-status-adornment--default

## AI generation rules (required)

### Select this component when
- You need compact inline validation iconography in form-oriented controls.
- Status is specifically field validation-oriented (error/warning/success).

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { StatusAdornment } from "@salt-ds/core";` |
| **Status mapping** | Use `status` values that map to adornment icons (`error`, `warning`, `success`) |
| **Context** | Render inside field/adornment patterns, not as standalone status messaging UI |
| **A11y pairing** | Pair icon with readable validation text/help/error messaging |
| **Fallback** | Avoid unsupported status values because component returns `null` for unmapped icons |

### Validation
- [ ] Generated usage aligns with `./status-adornment.md` "When to use"
- [ ] Generated usage avoids `./status-adornment.md` "When not to use"
- [ ] Required props and value types match `./status-adornment.json`
- [ ] Accessibility requirements from `./status-adornment.json` are satisfied