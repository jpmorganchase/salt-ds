import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes } from "react";
import { CarouselProvider } from "./CarouselContext";

import carouselCss from "./Carousel.css";

const withBaseName = makePrefixer("saltCarousel");

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The initial Index enables you to select the active slide in the carousel.
   * Optional, default 0.
   **/
  activeSlideIndex?: number;
  // TODO: should slide have an active prop, that sets it as active in the context?
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
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel",
      css: carouselCss,
      window: targetWindow,
    });

    return (
      <CarouselProvider>
        <div
          aria-label={carouselDescription}
          aria-roledescription="carousel"
          role="region"
          ref={ref}
          className={clsx(withBaseName(), className)}
          {...rest}
        >
          {children}
        </div>
      </CarouselProvider>
    );
  },
);
