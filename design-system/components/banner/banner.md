# Banner

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/banner
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/banner/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/banner/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/banner/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-banner--default

## When to use

- To show a notification that applies to the user’s current task or workflow
- To provide a full-width in-context notification in the main content area, positioned directly below navigation
- Use role="alert" for urgent, blocking issues; use role="status" for non-urgent notifications

## When not to use

- **Peripheral or cross-workflow events** → use `Toast`
- **Low-priority notifications that do not require user feedback** → use `Toast`

## Decision trees

### When to use Banner vs Toast
- **Banner**: Workflow notification in the main content area, below navigation, typically spanning the container/page width
- **Toast**: Peripheral or low-priority event notifications that do not require immediate feedback

### When to use each status type
- `info`: General updates, non-urgent notifications, informational messages
- `warning`: Non-blocking issues that may impact workflow (warnings about unsaved changes, deprecated settings)
- `error`: Blocking failures that prevent task completion (validation errors, system outages, critical issues)
- `success`: Confirmation of completed actions (saved successfully, deployment complete)

### When to use interactive vs. static
- **Static**: Pure informational content with no user action required (e.g., system maintenance notice, deployment status)
- **Interactive**: Content requiring user action (dismiss, retry, navigate to resolution) — use BannerActions

## Accessibility intent

| Rule | Detail |
|---|---|
| Role | Use `role="alert"` for alerts; use `role="status"` for notifications |
| Dynamic status content | If `role="status"` does not announce reliably for dynamically inserted content, preload a container with `role="status"` and render Banner inside it |
| Focus | Test all focusable elements included in banner content |
| Keyboard | Tab moves focus through interactive elements |

## Composition

- Use `BannerContent` for the supporting message content
- Use `BannerActions` to add actions such as close or refresh
- Banner includes a status icon aligned with the selected `status`

## Content rules

- Keep content short, clear, and concise (typically one or two lines)
- Make next steps explicit when the message requires action
- If using a title, use Body Strong typography style

## Layout and placement

- Place Banner in the main content area or related container
- Position it directly below navigation
- Let it span the page or container horizontally
- Configure it to close when the issue is resolved (for example, validation fixed or system status restored)

## Types

| Type | Characteristics |
|---|---|
| Static | Informational only, no interactive elements |
| Interactive | Includes at least one action (for example dismiss or refresh), can include links/buttons |
| Multiline | Longer messages and/or multiple actions |

## Variants and status

### Variant
| Variant | Use when |
|---|---|
| `primary` (default) | Standard emphasis for most banners |
| `secondary` | Additional visual emphasis where needed |

### Status
| Status | Use when |
|---|---|
| `info` (default) | General informational updates |
| `error` | Critical issue prevents completion of a task |
| `warning` | Potential issue that may cause errors if ignored |
| `success` | Confirmation a user action succeeded |

## Validation checklist

- [ ] Banner message applies to the current workflow (not peripheral)
- [ ] Status reflects message intent (`info` / `warning` / `error` / `success`)
- [ ] Variant choice is intentional (`primary` default, `secondary` when emphasized)
- [ ] Interactive banners use `BannerActions`
- [ ] Role is set correctly (`alert` vs `status`)
- [ ] Banner is placed below navigation in main content/container

## AI generation rules (required)

### Select this component when
- Intent and interaction match the component-specific "When to use" guidance in `./banner.md`
- Required behavior and constraints can be satisfied using props/states documented in `./banner.json`

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./banner.json` |
| **Props** | Include required props first; then apply optional props only when intent requires them |
| **Accessibility** | Apply `role`, keyboard, and ARIA guidance from `./banner.json` |

### Validation
- [ ] Generated usage aligns with `./banner.md` "When to use"
- [ ] Generated usage avoids `./banner.md` "When not to use"
- [ ] Required props and value types match `./banner.json`
- [ ] Accessibility requirements from `./banner.json` are satisfied

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/banner
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/banner/Banner.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/banner/BannerContent.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/banner/BannerActions.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/banner/index.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/banner/usage.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/banner/examples.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/banner/accessibility.mdx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/banner/banner.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--default
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--static
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--interactive
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--inline
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--issue
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--warning
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--success
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--statuses-primary
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--statuses-secondary
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--dismissible
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--multiple-lines
- https://storybook.saltdesignsystem.com/?path=/story/core-banner--multiple-banners