---
"@salt-ds/embla-carousel": patch
---

Accessibility updates for Carousel

- screenreader now passes WCAG 2.1 AA requirements, if implemented as per documentation.
- remove next/prev buttons from focus order, when displaying a tablist.
- slides are focusable, actions within slides are focusable.
- a11y recommendation is to group the tablist between the next/prev button.
- Removed embla plugin `CarouselAnnouncementPlugin.ts` as it is no longer used in the codebase.

```diff
- import { CarouselAnnouncementPlugin } from "./CarouselAnnouncementPlugin";
  <Carousel
    aria-label="Account overview"
    getEmblaApi={setEmblaApi}
 -  emblaPlugins={[CarouselAnnouncementPlugin()]}
  >
  </Carousel>
```

- `AriaAnnouncer` improvements, previously `delay` was used to queue announcements, but it could create overlapping announcements. We have deprecated `delay`, although it is still supported. Instead, we have added a new options API.
  - `duration`: provides a sequential delay between announcements, ensuring they do not overlap.
  - `ariaLive` determines the importance and urgency of the announcement.
    The default duration is 500 msecs, unless specified.

```diff
import { useAriaAnnouncer } from "./useAriaAnnouncer";
const { announce } = useuseAriaAnnouncer();

- const delayMsec = 1000;
- announce("my announcement", delayMsec);

+ announce("my announcement", { duration: 1000, ariaLive: "polite"});
```
