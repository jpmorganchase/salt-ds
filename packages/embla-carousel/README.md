# `@salt-ds/embla-carousel`

Salt's React carousel composition, built on [Embla Carousel](https://www.embla-carousel.com/).

## Install

```sh
npm install @salt-ds/embla-carousel embla-carousel-react @salt-ds/core @salt-ds/theme
```

React and React DOM are required peers. `embla-carousel-react` is optional at
the package level but required to render a carousel. Use the current Salt
provider/theme setup; component styles are injected at runtime unless disabled.

## Usage

```tsx
import { Carousel, CarouselSlides } from "@salt-ds/embla-carousel";

export function Headlines() {
  return (
    <Carousel>
      <CarouselSlides>
        {/* Add labelled carousel slides here. */}
      </CarouselSlides>
    </Carousel>
  );
}
```

Applications own slide content, autoplay policy and announcements. Test focus
order and controls with the final content.

See the [Carousel documentation](https://www.saltdesignsystem.com/salt/components/carousel).
