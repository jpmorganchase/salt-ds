import {
  type ResponsiveProp,
  resolveResponsiveValue,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
import { type HTMLAttributes, forwardRef } from "react";
import { CarouselProvider } from "./CarouselContext";

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The initial Index enables you to select the active slide in the carousel.
   * Optional, default 0.
   **/
  activeSlideIndex?: number;
  /**
   * Number of slides visible at a time.
   * Optional, default 1.
   **/
  visibleSlides?: ResponsiveProp<number> | number;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      activeSlideIndex = 0,
      visibleSlides: visibleSlidesProp = 1,
      children,
      className,
      id: idProp,
      ...rest
    },
    ref,
  ) {
    const { matchedBreakpoints } = useBreakpoint();
    const visibleSlides = resolveResponsiveValue(
      visibleSlidesProp,
      matchedBreakpoints,
    );
    const id = useId(idProp);
    return (
      <CarouselProvider
        activeSlideIndex={activeSlideIndex}
        visibleSlides={visibleSlides}
        id={id}
      >
        <section
          role="region"
          aria-roledescription="carousel"
          id={id}
          ref={ref}
          {...rest}
        >
          {children}
        </section>
      </CarouselProvider>
    );
  },
);
