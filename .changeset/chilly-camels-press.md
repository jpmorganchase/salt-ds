---
"@salt-ds/core": minor
---

- `OverlayHeader` names `OverlayPanel` with its `header` and `preheader`, and describes it with its `description`, so `aria-labelledby` and `aria-describedby` no longer need to be set manually. The accessible name no longer includes the labels of controls passed to `actions`, such as a close button.

Remove the `id` on `OverlayHeader` and the matching `aria-labelledby` on `OverlayPanel`. Any `aria-labelledby` passed to `OverlayPanel` is combined with the header, so leaving this wiring in place repeats the title in the accessible name.

- `OverlayHeader` no longer renders an empty heading when neither `header` nor `preheader` is set.
- Fixed `aria-label` on `OverlayPanel` not naming the overlay.
