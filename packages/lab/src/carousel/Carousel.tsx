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
  defaultActiveSlideIndex?: number;
  /**
   * Controlled index of active slide in the carousel.
   **/
  activeSlideIndex?: number;
  /**
   * Number of slides visible at a time.
   * Optional, default 1.
   **/
  visibleSlides?: ResponsiveProp<number>;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      defaultActiveSlideIndex = 0,
      activeSlideIndex,
      visibleSlides: visibleSlidesProp = 1,
      children,
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
        defaultActiveSlideIndex={defaultActiveSlideIndex}
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
