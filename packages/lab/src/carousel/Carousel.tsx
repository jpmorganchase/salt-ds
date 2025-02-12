import { type HTMLAttributes, forwardRef } from "react";
import { CarouselProvider } from "./CarouselContext";

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The initial Index enables you to select the active slide in the carousel.
   * Optional, default 0.
   **/
  activeSlideIndex?: number;
  /**
   * A boolean. When `true`, the slider will receive a full border.
   */
  bordered?: boolean;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    { activeSlideIndex = 0, bordered = false, children, className, ...rest },
    ref,
  ) {
    return (
      <CarouselProvider activeSlideIndex={activeSlideIndex} bordered={bordered}>
        <div aria-roledescription="carousel" role="region" ref={ref} {...rest}>
          {children}
        </div>
      </CarouselProvider>
    );
  },
);
