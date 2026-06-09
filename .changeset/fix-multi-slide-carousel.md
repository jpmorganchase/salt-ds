---
"@salt-ds/embla-carousel": patch
---

Fixed several issues with `Carousel` when used in multi-slide mode:

- The carousel no longer snaps back to the first slide when the number of slides is not evenly divisible by `slidesToScroll` (e.g. 5 slides with `slidesToScroll: 2`).
- Arrow key navigation now moves focus one slide at a time, only scrolling the track when the next slide is in a different snap group.
- `Tab` and `Shift+Tab` now move focus only between currently visible slides, preventing unintended scrolling when focusing the last slide group.
