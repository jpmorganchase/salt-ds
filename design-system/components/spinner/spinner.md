# Spinner

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/spinner
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/spinner/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/spinner/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/spinner/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-spinner--default

## When to use

- To indicate content is loading and reassure users that work is in progress.
- For indeterminate processes and actions expected to take roughly 1–9 seconds.
- For full-page or partial-region loading where completion percentage is unknown.

## When not to use

- Do not use when duration is determinate; use `Progress` instead.
- Do not rely on spinner alone for processes taking longer than about 10 seconds; show an explicit status message.

## Accessibility intent

- Customize `aria-label` with context (for example, "loading settings panel") instead of generic text.
- Screen-reader announcements repeat at `announcerInterval` until `announcerTimeout`.
- Completion announcement is emitted on unmount by default; customize with `completionAnnouncement` or set `null` to suppress.
- Spinner has no direct keyboard interaction requirements.

## Decision trees

### Indicator choice
- Unknown completion percentage and active loading → use `Spinner`.
- Known percentage/buffer progression → use `Progress`.
- Long-running operation beyond short wait expectations → show status messaging alongside/after spinner.

### Size selection
- Embedded inside compact controls/components (e.g., button/input context) → `size="small"`.
- Widget/local container loading (default) → `size="medium"` (or omit size).
- Page-level or large visual loading state → `size="large"`.

### Announcer behavior
- Default announcement cadence is acceptable → keep defaults.
- Need shorter/longer repeats → set `announcerInterval`.
- Need longer/shorter announcement window → set `announcerTimeout`.
- Completion message should be suppressed → `completionAnnouncement={null}`.

## Validation checklist

- [ ] Component usage aligns with "When to use" guidance
- [ ] Not used in "When not to use" scenarios
- [ ] `aria-label` clearly describes what is loading
- [ ] Spinner size matches context (small/medium/large)
- [ ] Announcer settings are intentional (`announcerInterval`, `announcerTimeout`, `completionAnnouncement`)
- [ ] Long-running operations provide additional status feedback
- [ ] Storybook IDs validated: `core-spinner--default`, `--large`, `--small`, `--loading`, `--partial-loading`, `--with-button`

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/spinner/Spinner.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/spinner/svgSpinners/SpinnerSVG.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/spinner/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/spinner/spinner.stories.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/__tests__/__e2e__/spinner/Spinner.cy.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/__tests__/__e2e__/spinner/Spinner.accessibility.cy.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/spinner/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/spinner/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/spinner/accessibility.mdx
- https://storybook.saltdesignsystem.com/?path=/story/core-spinner--default

## AI generation rules (required)

### Select this component when
- You need an indeterminate loading indicator without known progress percentage.
- User reassurance during short-to-medium asynchronous waits is required.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { Spinner } from "@salt-ds/core";` |
| **Accessible label** | Set contextual `aria-label` describing what is loading |
| **Size** | Choose `small`, `medium`, or `large` based on loading scope |
| **Announcement cadence** | Tune `announcerInterval`/`announcerTimeout` only when defaults do not fit UX |
| **Completion message** | Keep default completion announcement unless explicitly suppressed with `null` |
| **Indicator choice** | Use `Progress` instead when completion percentage is known |

### Validation
- [ ] Generated usage aligns with `./spinner.md` "When to use"
- [ ] Generated usage avoids `./spinner.md` "When not to use"
- [ ] Required props and value types match `./spinner.json`
- [ ] Accessibility requirements from `./spinner.json` are satisfied