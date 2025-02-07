import { Button, makePrefixer, Text, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { forwardRef, type HTMLAttributes } from "react";
import { useCarousel } from "./CarouselContext";

import carouselControlsCss from "./CarouselControls.css";

const withBaseName = makePrefixer("saltCarouselControls");

export interface CarouselControlsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * TODO: check w design
   * This prop will enable compact / reduced width mode.
   * The navigation buttons would be part of indicators
   * Optional. Defaults to false
   **/
  compact?: boolean;
}

export const CarouselControls = forwardRef<
  HTMLDivElement,
  CarouselControlsProps
>(function CarouselControls({ children, className, compact, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });
  const { slides, activeSlide, nextSlide, prevSlide } = useCarousel();
  const { NextIcon, PreviousIcon } = useIcon();

  const slidesCount = slides.length;

  console.log("activeSlide", activeSlide);
  const isOnFirstSlide = activeSlide === 0;
  const isOnLastSlide = activeSlide === slidesCount - 1;
  return (
    <div ref={ref} role="group" className={withBaseName()} {...rest}>
      <Button
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("prev-button")}
        onClick={prevSlide}
        disabled={isOnFirstSlide}
        aria-label="Previous slide"
      >
        <PreviousIcon aria-hidden />
      </Button>
      {children}
      <Button
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("next-button")}
        onClick={nextSlide}
        disabled={isOnLastSlide}
        aria-label="Next slide"
      >
        <NextIcon aria-hidden />
      </Button>
      {/* TODO: check color with design*/}
      <Text as="span" color="secondary">
        {activeSlide + 1} of {slidesCount}
      </Text>
    </div>
  );
});
