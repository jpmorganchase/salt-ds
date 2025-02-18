import { Button, Text, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type HTMLAttributes, type SyntheticEvent, forwardRef } from "react";
import { useCarousel } from "./CarouselContext";

import carouselControlsCss from "./CarouselControls.css";

const withBaseName = makePrefixer("saltCarouselControls");

export interface CarouselControlsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  onMoveBack?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  onMoveForward?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  labelPlacement?: "left" | "right";
  disabled?: boolean;
}

export const CarouselControls = forwardRef<
  HTMLDivElement,
  CarouselControlsProps
>(function CarouselControls(
  {
    onMoveBack,
    onMoveForward,
    disabled,
    className,
    labelPlacement = "right",
    ...rest
  },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });
  const { slides, activeSlide, nextSlide, prevSlide, visibleSlides } =
    useCarousel();
  const { NextIcon, PreviousIcon } = useIcon();

  const slidesCount = slides.length;

  const isOnFirstSlide = activeSlide === 0;
  const isOnLastSlide = activeSlide === slidesCount - visibleSlides;

  const ControlsLabel = () => (
    <Text as="span">
      <strong>
        {activeSlide + 1}
        {visibleSlides > 1 && ` - ${activeSlide + visibleSlides}`} of{" "}
        {slidesCount}
      </strong>
    </Text>
  );

  function handlePrevClick(event: SyntheticEvent<HTMLButtonElement>) {
    prevSlide(event);
    onMoveBack?.(event);
  }
  function handleNextClick(event: SyntheticEvent<HTMLButtonElement>) {
    nextSlide(event);
    onMoveForward?.(event);
  }

  return (
    <div role="group" className={withBaseName()} ref={ref} {...rest}>
      {labelPlacement === "left" && <ControlsLabel />}
      <Button
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("prev-button")}
        onClick={handlePrevClick}
        disabled={isOnFirstSlide || disabled}
        aria-label="Previous slide"
      >
        <PreviousIcon aria-hidden />
      </Button>
      <Button
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("next-button")}
        onClick={handleNextClick}
        disabled={isOnLastSlide || disabled}
        aria-label="Next slide"
      >
        <NextIcon aria-hidden />
      </Button>
      {labelPlacement === "right" && <ControlsLabel />}
    </div>
  );
});
