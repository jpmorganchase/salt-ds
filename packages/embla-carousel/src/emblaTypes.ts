import type { UseEmblaCarouselType } from "embla-carousel-react";

// Derived from embla-carousel-react rather than imported from embla-carousel, so
// it always matches the instance useEmblaCarousel returns and embla-carousel
// doesn't need to be declared as a dependency.
export type EmblaCarouselType = NonNullable<UseEmblaCarouselType[1]>;
