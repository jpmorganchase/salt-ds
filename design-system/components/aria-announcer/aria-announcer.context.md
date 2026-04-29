# Aria Announcer (Copilot Context)

Use to announce dynamic updates to screen-reader users through a queued aria-live region.

- API: ./aria-announcer.json
- Guidance: ./aria-announcer.md

## Key rules
- Wrap the relevant subtree with `AriaAnnouncerProvider` before calling `useAriaAnnouncer`.
- Use `AriaAnnounce` when announcements come from changing state/props.
- Use `useAriaAnnouncer` for imperative announce calls and optional debounce/delay.
- Keep messages concise and meaningful (announce outcomes, not implementation details).
- Exclude QA stories when validating Storybook examples.

## Example
```tsx
import { AriaAnnounce, AriaAnnouncerProvider } from "@salt-ds/core";

<AriaAnnouncerProvider>
	<AriaAnnounce announcement="Saved successfully" />
</AriaAnnouncerProvider>
```
