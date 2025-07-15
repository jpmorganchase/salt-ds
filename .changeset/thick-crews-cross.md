---
"@salt-ds/embla-carousel": patch
---

Accessibility updates for Carousel

- enhanced screen reader annoucements.
- remove next/prev buttons from focus order, when displaying a tablist.
- slides are focusable, actions within slides are no longer automatically focused but can be tabbed to.
- add `aria-live="off"` to slide container to avoid duplicated messages.
- a11y recommendation is to group the tablist between the next/prev button.
- Removed embla plugin `CarouselAnnouncementPlugin.ts` as it is no longer used in the codebase. Screen reader support is provided by the `Carousel` component itself, which uses `aria-live` to announce changes to the content.

```diff
- import { CarouselAnnouncementPlugin } from "./CarouselAnnouncementPlugin";
  <Carousel
    aria-label="Account overview"
    getEmblaApi={setEmblaApi}
 -  emblaPlugins={[CarouselAnnouncementPlugin()]}
  >
  </Carousel>
```
