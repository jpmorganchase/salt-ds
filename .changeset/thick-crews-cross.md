---
"@salt-ds/embla-carousel": patch
---

Accessibility updates for Carousel

- Carousel now passes WCAG 2.1 AA requirements, if implemented as per documentation.
- Removed next/prev buttons from focus order, when displaying a tablist.
- Slides and actions within slides are now focusable.

Removed embla plugin `CarouselAnnouncementPlugin.ts` as it is no longer needed.

```diff
- import { CarouselAnnouncementPlugin } from "./CarouselAnnouncementPlugin";
  <Carousel
    aria-label="Account overview"
    getEmblaApi={setEmblaApi}
 -  emblaPlugins={[CarouselAnnouncementPlugin()]}
  >
  </Carousel>
```
