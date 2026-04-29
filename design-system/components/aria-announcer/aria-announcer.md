# Aria Announcer

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/aria-announcer
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/aria-announcer/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/aria-announcer/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/aria-announcer/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-aria-announcer-provider--aria-announce-debounce-and-delay

## When to use

- To announce dynamic UI updates to assistive technologies when visible context changes.
- When components emit non-visual state changes (loading progress, page updates, delayed actions).
- When you need queued announcements to prevent overlapping screen-reader output.

## When not to use

- For static content that is already described by visible labels or semantic HTML.
- As a replacement for required control labeling (`aria-label`, `aria-labelledby`, field labels).
- For high-frequency events that would overwhelm users with repeated announcements.

## Accessibility intent

- `AriaAnnouncerProvider` renders an off-screen `aria-live="assertive"` region with `aria-atomic="true"`.
- Announcements are queued and emitted sequentially to preserve message order.
- `AriaAnnounce` triggers announcements from reactive state changes without rendering visible UI.
- Keep messages concise and user-centric (announce outcomes, not implementation details).

## Decision trees

### AriaAnnounce vs useAriaAnnouncer
- Announcing directly from changing state/props in a component render path → use `AriaAnnounce`.
- Announcing from handlers/effects/workflows with optional delay/debounce → use `useAriaAnnouncer`.

### Provider placement
- Need announcements available across many components → wrap app/root with `AriaAnnouncerProvider`.
- Need announcements only in a bounded subtree → wrap only that subtree.

## Validation checklist

- [ ] `AriaAnnouncerProvider` wraps the subtree where announcements are published
- [ ] Message text is concise and meaningful for screen-reader users
- [ ] Debounce/delay settings are intentional and do not suppress critical messages
- [ ] Implementation avoids replacing required control labels with announcements

## AI generation rules (required)

### Select this component when
- The user needs non-visual feedback for dynamic state transitions.
- A screen-reader announcement is required without introducing visible UI chrome.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use `import { AriaAnnounce, AriaAnnouncerProvider, useAriaAnnouncer } from "@salt-ds/core";` as needed |
| **Provider** | Ensure an ancestor `AriaAnnouncerProvider` exists before calling `useAriaAnnouncer` |
| **Message cadence** | Use debounce only for rapid, repeated announcements; keep critical alerts immediate |
| **Message quality** | Announce outcome-focused plain language (e.g., "Page 2", "Saved") |

### Validation
- [ ] Generated usage aligns with "When to use"
- [ ] Generated usage avoids "When not to use"
- [ ] API usage matches `./aria-announcer.json` (`AriaAnnounce`, provider, hook options)
- [ ] Announcement messages are concise and do not duplicate required labels

## Notes

- SOURCE_GAP: `usage.mdx`, `examples.mdx`, and `accessibility.mdx` are unavailable (404) under `site/docs/components/aria-announcer`.
- SOURCE_GAP: `core-aria-announcer--default` story ID is not confirmed; verified Storybook coverage currently uses `core-aria-announcer-provider--aria-announce-debounce-and-delay`.

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/aria-announcer
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/aria-announcer/index.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/aria-announcer/AriaAnnounce.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/aria-announcer/AriaAnnouncerProvider.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/aria-announcer/useAriaAnnouncer.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/aria-announcer/aria-announcer.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-aria-announcer-provider--aria-announce-debounce-and-delay