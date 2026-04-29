# Button

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/button
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/button/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/button/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/button/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-button--default

## When to use

- To allow the user to execute an action, such as submit, merge, or upload.
- In contexts such as dialogs, cards, and forms.
- When action emphasis is needed through `sentiment` and `appearance`.

## When not to use

- When the primary action is navigation to another page or window.
- Use `Link` when navigation is the main intent.

## Accessibility intent

- Provide visible text, or an `aria-label`, for icon-only buttons.
- When button content includes both icon and text, set `aria-hidden` on the icon.
- By default disabled buttons are not focusable; use `focusableWhenDisabled` when a disabled control may become enabled and still needs focus behavior.
- Keyboard follows button interaction model: `Tab`, `Shift + Tab`, and activation with `Enter`/`Space`.
- When `loading` is used, pair with `loadingAnnouncement` for assistive context.

## Decision trees

### Action vs navigation
- Trigger function in current context → use `Button`
- Go to another page/window → use `Link`

### Sentiment selection
- Destructive outcome → `sentiment="negative"`
- Positive confirmation action → `sentiment="positive"`
- Potentially risky action → `sentiment="caution"`
- Standard action → `sentiment="neutral"` (or `accented` for stronger emphasis)

### Disabled vs focusable disabled
- Disabled action should not be focusable → `disabled={true}`
- Disabled action should remain focusable for tooltip/popover guidance → `disabled={true}` + `focusableWhenDisabled={true}`

## Validation checklist

- [ ] Selection matches "When to use"
- [ ] Not used for navigation-only intent
- [ ] `appearance`/`sentiment` reflect action intent
- [ ] Icon-only usage includes `aria-label`
- [ ] Icon + text usage marks icon `aria-hidden`
- [ ] `loading` is paired with `loadingAnnouncement`
- [ ] Disabled focus behavior is intentionally chosen

## Primary references

- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/button/Button.tsx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/src/button/index.ts
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/docs/components/button/usage.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/docs/components/button/examples.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/site/docs/components/button/accessibility.mdx
- https://raw.githubusercontent.com/jpmorganchase/salt-ds/main/packages/core/stories/button/button.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-button--default
- https://storybook.saltdesignsystem.com/?path=/story/core-button--accented
- https://storybook.saltdesignsystem.com/?path=/story/core-button--neutral
- https://storybook.saltdesignsystem.com/?path=/story/core-button--positive
- https://storybook.saltdesignsystem.com/?path=/story/core-button--negative
- https://storybook.saltdesignsystem.com/?path=/story/core-button--caution
- https://storybook.saltdesignsystem.com/?path=/story/core-button--disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-button--loading
- https://storybook.saltdesignsystem.com/?path=/story/core-button--loading-single
- https://storybook.saltdesignsystem.com/?path=/story/core-button--loading-announcement-prop
- https://storybook.saltdesignsystem.com/?path=/story/core-button--focusable-when-disabled
- https://storybook.saltdesignsystem.com/?path=/story/core-button--with-icon
- https://storybook.saltdesignsystem.com/?path=/story/core-button--full-width
- https://storybook.saltdesignsystem.com/?path=/story/core-button--cta
- https://storybook.saltdesignsystem.com/?path=/story/core-button--primary
- https://storybook.saltdesignsystem.com/?path=/story/core-button--secondary

## AI generation rules (required)

### Select this component when
- The user needs to trigger an in-place action (not navigation).
- A standard button action in a dialog, form, or card is needed.
- Action emphasis can be represented with `appearance` and `sentiment`.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { Button } from "@salt-ds/core";` |
| **Type** | Use `type="button"` by default; use `type="submit"` only for form submission |
| **Emphasis** | Default to `sentiment="neutral"` and `appearance="solid"`; use `negative` for destructive actions |
| **Disabled focus** | Set `focusableWhenDisabled` only when disabled actions must still be focus targets |
| **Loading** | If `loading={true}`, also provide `loadingAnnouncement` |
| **Icon-only** | Require `aria-label` |
| **Deprecated variant** | Map `variant="cta"` → accented/solid; `primary` → neutral/solid; `secondary` → neutral/transparent |

### Validation
- [ ] Generated usage aligns with `./button.md` "When to use"
- [ ] Generated usage avoids `./button.md` "When not to use"
- [ ] Required props and value types match `./button.json`
- [ ] Accessibility requirements from `./button.json` are satisfied
