import { type HTMLAttributes, forwardRef } from "react";
import { CarouselProvider } from "./CarouselContext";

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The initial Index enables you to select the active slide in the carousel.
   * Optional, default 0.
   **/
  activeSlideIndex?: number;
  /**
   * If this props is passed it will set the aria-label with value to the carousel container.
   * Optional. Defaults to undefined
   */
  carouselDescription?: string;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    { activeSlideIndex = 0, carouselDescription, children, className, ...rest },
    ref,
  ) {
    return (
      <CarouselProvider activeSlideIndex={activeSlideIndex}>
        <div
          aria-label={carouselDescription}
          aria-roledescription="carousel"
          role="region"
          ref={ref}
          {...rest}
        >
          {children}
        </div>
      </CarouselProvider>
    );
  },
);
