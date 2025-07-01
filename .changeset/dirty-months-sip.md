---
"@salt-ds/embla-carousel": patch
---

### Summary

The `Carousel` component has been moved from the Lab package to its own package, `@salt-ds/embla-carousel`.
Initially released as a pre-release in Lab, the Carousel was not fully featured. We have now pivoted to treating Carousel as a pattern using Embla, that can compose Salt components as its slides.

[Embla](https://www.embla-carousel.com) is a headless open-source carousel library offering a comprehensive set of features and an extensible API.

### Migration Guide

To allow consumers to manage their own version of Embla, it's defined as a peer dependency.

To migrate from the current Lab version of `Carousel`:

1. Define `embla-carousel-react` in your package.json.

```diff
"dependencies": {
+  "embla-carousel-react": "^8.6.0",
}
```

2. Update your imports.

```diff
import {
  Carousel,
- CarouselControls,
+ CarouselNextButton,
+ CarouselPreviousButton,
+ CarouselProgressLabel,
- CarouselSlide,
+ CarouselCard,
- CarouselSlider,
+ CarouselSlides
-} from "@salt-ds/lab";
+} from "@salt-ds/embla-carousel";
```

### Key Changes

- `CarouselControls` has been broken into `CarouselPreviousButton`, `CarouselNextButton`, and `CarouselProgressLabel` for composability.
- `CarouselSlide` has been renamed to `CarouselCard`. While `CarouselCard` is a predefined slide, you can also create custom slides.
- `CarouselSlider` has been renamed to `CarouselSlides`.

Example Update:

```diff
  const slideId = useId();

- <Carousel controlsPlacement="bottom">
+ <Carousel>
-   <CarouselControls />
+   <CarouselPreviousButton />
+   <CarouselNextButton />
+   <CarouselProgressLabel />
-   <CarouselSlider>
+   <CarouselSlides>
    {
      slides.map((slide, index) => (
-         <CarouselSlide
+         <CarouselCard
            key={`${slideId}-${index}`}
+           id={`${slideId}-${index}`}
            appearance={appearance}
            header={<H3>{slide.title}</H3>}
            media={
            <img
               className="carousel-image-placeholder"
               alt="stock content to show carousel slide"
               src={slide.image}
            />}
            actions={withActions && <Link href="#">{slide.link}</Link>}
         >
            <Text>{slide.content}</Text>
         </CarouselCard>
  ))
  }
-   </CarouselSlider>
+   </CarouselSlides>
</Carousel>
```

### Additional Configuration/Control of Carousel

The Carousel can be configured using the Embla API.

To configure embla, pass `emblaOptions` or `emblaPlugins` to the Carousel.

To control the behavior of the Carousel through the embla API, obtain a reference to the embla API through the `setApiRef` prop.

```
const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(null);

const slideId = useId();
const { matchedBreakpoints } = useBreakpoint();
const isMobile = matchedBreakpoints.indexOf("sm") === -1;

useEffect(() => {
  if (!emblaApi) {
    return;
  }

  const logSnappedSlide = () => {
    const snappedSlideIndex = emblaApi.selectedScrollSnap();
    console.log(
      `Slide ${snappedSlideIndex !== undefined ? snappedSlideIndex + 1 : undefined} is snapped into view.`,
    );
  };

  emblaApi.on("select", logSnappedSlide);

  // Cleanup listener on component unmount
  return () => {
    emblaApi.off("select", logSnappedSlide);
  };
}, [emblaApi]);

return (
  <Carousel
    aria-label="Account overview"
    getEmblaApi={setEmblaApi}
  >
    <CarouselSlides>
      {slides.map((index) => (
        <div
          aria-label={`Example slide ${index + 1}`}
          aria-roledescription="slide"
          key={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
          id={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
        >
            {index + 1}
        </div>
      ))}
    </CarouselSlides>
  </Carousel>
);
```

Due to the challenges of making an accessible carousel, please read the documentation to understand the responsibilities that come with usage.

`Carousel` remains in a pre-release state for this release and subject to feedback will be promoted to stable in a forthcoming release.

### Additional components

- `CarouselTabList`: A tablist for navigating between slides.
- `CarouselTab`: A tab button used by `CarouselTabList`.
- `CarouselAutoplayIndicator`: An animated countdown indicator for autoplay functionality.
- `CarouselAnnouncementPlugin`: A plugin for announcing slide changes to assistive technologies.
