import {
  type ResponsiveProp,
  makePrefixer,
  resolveResponsiveValue,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type HTMLAttributes, forwardRef } from "react";
import carouselCss from "./Carousel.css";
import { CarouselProvider } from "./CarouselContext";

const withBaseName = makePrefixer("saltCarousel");

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
   * Set the placement of the CarouselControls relative to the CarouselSlider element. Defaults to `top`.
   */
  controlsPlacement?: "top" | "bottom";
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
      controlsPlacement = "top",
      id: idProp,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel",
      css: carouselCss,
      window: targetWindow,
    });
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
          className={clsx(withBaseName(), {
            [withBaseName(controlsPlacement)]: controlsPlacement === "bottom",
          })}
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
