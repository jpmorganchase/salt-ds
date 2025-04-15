---
"@salt-ds/lab": minor
---

Updated `Carousel` component

- Renamed `initialIndex` to `defaultActiveSlideIndex`
- Added controlled `activeSlideIndex`
- Added `visibleSlides` to control how many slides can be visible at a time.
- Added `CarouselSlider` and extracted the controls to its own component, `CarouselControls` to improve composition.
- Added appearance in `CarouselSlide` to allow for border items.
- Added keyboard navigation.
- Removed usage of `DeckLayout`.

before:

```tsx
<Carousel>
  {items.map((item, index) => (
    <CarouselSlide
      key={index}
      ButtonBar={<Button variant="cta">Learn more</Button>}
      description="Lorem ipsum"
      title="Carousel slide title"
    />
  ))}
</Carousel>
```

after:

```tsx
<Carousel>
  <CarouselControls />
  <CarouselSlider>
    {items.map((slide) => (
      <CarouselSlide
        key={slide.title}
        header={<H3>{slide.title}</H3>}
        actions={<Link href="#">{slide.link}</Link>}
      >
        <Text>{slide.content}</Text>
      </CarouselSlide>
    ))}
  </CarouselSlider>
</Carousel>
```
