---
"@salt-ds/embla-carousel-pattern": patch
---

### Summary

The `Carousel` component has been moved from the Lab package to its own package, `@salt-ds/embla-carousel-pattern`.
Initially released as a pre-release in Lab, the Carousel was not fully featured. We have now pivoted to treating Carousel as a pattern using embla, that can compose Salt components as its slides.

[embla](https://www.embla-carousel.com) is a headless open-source carousel library offering a comprehensive set of features and an extensible API.

### Migration Guide

To allow consumers to manage their own version of `embla`, it is defined as a peer dependency.

To migrate from the current Lab version of `Carousel`:

1. Define `embla-carousel-react` in your package.json.

```diff
"dependencies": {
+  "embla-carousel-react": "^8.6.0",
}
```

2. update your imports.

```diff
import {
  Carousel,
  CarouselControls,
- CarouselSlide,
+ CarouselCard,
- CarouselSlider,
+ CarouselSlides
-} from "@salt-ds/lab";
+} from "@salt-ds/embla-carousel-pattern";
```

### Key Changes

- _Controls Placement_: The `controlsPlacement` prop has been removed. Carousel children are now laid out vertically, and control positions are determined through composition.
- _Slide Rename_: `CarouselSlide` has been renamed to `CarouselCard`. While `CarouselCard` is a predefined slide, you can also create custom slides.
- _Slider Rename_: `CarouselSlider` has been renamed to `CarouselSlides`.

Example Update:

```diff
- <Carousel controlsPlacement="bottom">
+ <Carousel>
    <CarouselControls />
-   <CarouselSlider>
+   <CarouselSlides>
    {
      slides.map((slide, index) => (
-         <CarouselSlide
+         <CarouselCard
            key={slide.title}
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
const emblaApiRef = useRef<CarouselApi | undefined>(undefined);
const slides = Array.from(Array(4).keys());

useEffect(() => {
  if (!emblaApiRef?.current) {
    return;
  }

  const logSnappedSlide = () => {
    const snappedSlideIndex = emblaApiRef.current?.selectedScrollSnap();
    console.log(
      `Slide ${snappedSlideIndex !== undefined ? snappedSlideIndex + 1 : undefined} is snapped into view.`,
    );
  };

  emblaApiRef.current?.on("select", logSnappedSlide);

  // Cleanup listener on component unmount
  return () => {
    emblaApiRef.current?.off("select", logSnappedSlide);
  };
}, [emblaApiRef.current]);

return (
  <Carousel
    aria-label="Account overview"
    emblaApiRef={emblaApiRef}
  >
    <CarouselSlides>
      {slides.map((index) => (
        <div
          aria-label={`Example slide ${index + 1}`}
          aria-roledescription="slide"
          key={index}
        >
            {index + 1}
        </div>
      ))}
    </CarouselSlides>
  </Carousel>
);
```

Due to the challenges of making an accessible carousel, please read the documentation to understand the responsibilities the come with usage.

`Carousel` remains in a pre-release state for this release and subject to feedback will be promoted to stable in a forthcoming release.
