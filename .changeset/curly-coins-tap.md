---
"@salt-ds/embla-carousel": major
---

Carousel is now a stable API.

Features include:

- Composable Salt controls for navigation and progress.
- Composable with custom content within slides.
- Built on the popular `embla-carousel` library, with Salt-specific accessibility and theming enhancements.

```
<Carousel aria-label="carousel example">
  <H2 id="carousel-title">
    Carousel example with 2 slides
  </H2>
  <FlexLayout gap={1} wrap={true} align={"center"}>
    <CarouselPreviousButton />
    <CarouselNextButton />
    <CarouselProgressLabel />
  </FlexLayout>
  <CarouselSlides>
    <CarouselCard
      aria-labelledby="slide1-title"
      media={
        <img
          aria-hidden={true}
          className={styles.carouselImage}
          src={"your-image-url-here"}
        />
      }
      header={<H3 id="slide1-title">Slide 1 Title</H3>}
    >
      <Text>Slide 1 description</Text>
    </CarouselCard>
    <CarouselCard
      aria-labelledby="slide2-title"
      media={
        <img
          aria-hidden={true}
          className={styles.carouselImage}
          src={"your-image-url-here"}
        />
      }
      header={<H3 id="slide2-title">Slide 2 Title</H3>}
    >
      <Text>Slide 2 description</Text>
    </CarouselCard>
  </CarouselSlides>
</Carousel>
```
