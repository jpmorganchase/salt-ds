---
"@salt-ds/core": patch
"@salt-ds/embla-carousel": patch
---

Documented the native props that these components change:

- `Button`'s `onClick` isn't fired when the button is disabled or loading, including when `focusableWhenDisabled` is `true`.
- `InteractableCard`'s `onClick` is also fired when Enter or Space is pressed, and isn't fired when the card is disabled.
- `Spinner`'s `role` defaults to `"img"`, and its `id` is applied to the spinner's SVG element rather than its root.
- `CarouselCard`'s `id` is how `CarouselTabList` refers to the slide.

`Spinner` no longer redeclares `className`, so it's treated like the other HTML attributes it accepts. It still accepts `className`.

`ListBox` no longer inherits a second `disabled` and `multiselect` from its list control props, so each shows one description instead of two joined together. `StepProps` is no longer declared twice.
