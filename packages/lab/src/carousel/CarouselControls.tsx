import { Button, Text, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type SyntheticEvent,
  forwardRef,
  useRef,
} from "react";
import { useCarousel } from "./CarouselContext";

import carouselControlsCss from "./CarouselControls.css";

const withBaseName = makePrefixer("saltCarouselControls");

export interface CarouselControlsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Callback when back button is clicked.
   */
  onMoveBack?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * Callback when forward button is clicked.
   */
  onMoveForward?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * Location of the label relative to the controls.
   *
   * Either 'left', or 'right'`.
   */
  labelPlacement?: "left" | "right";
  /**
   * If `true`, the carousel controls will be disabled.
   * **/
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
  const {
    slideRefs,
    firstVisibleSlide,
    nextSlide,
    prevSlide,
    visibleSlides,
    carouselId,
  } = useCarousel();
  const { NextIcon, PreviousIcon } = useIcon();
  const prevButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const slidesCount = slideRefs?.length;

  const isOnFirstSlide = firstVisibleSlide === 0;
  const isOnLastSlide = firstVisibleSlide === slidesCount - visibleSlides;

  const controlsLabel = `${firstVisibleSlide + 1} ${visibleSlides > 1 ? ` - ${firstVisibleSlide + visibleSlides}` : ""} of
        ${slidesCount}`;

  const ControlsLabel = () => (
    <Text as="span" id="carousel-controls-announcer">
      <span className={withBaseName("sr-only")}>Moved to</span>
      <strong>{controlsLabel}</strong>
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
        ref={prevButtonRef}
        focusableWhenDisabled
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("prev-button")}
        onClick={handlePrevClick}
        disabled={isOnFirstSlide || disabled}
        aria-controls={carouselId}
        aria-label={`Previous slide${visibleSlides > 1 ? "s" : ""}`}
      >
        <PreviousIcon aria-hidden />
      </Button>
      <Button
        ref={nextButtonRef}
        focusableWhenDisabled
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("next-button")}
        onClick={handleNextClick}
        disabled={isOnLastSlide || disabled}
        aria-controls={carouselId}
        aria-label={`Next slide${visibleSlides > 1 ? "s" : ""}`}
      >
        <NextIcon aria-hidden />
      </Button>
      {labelPlacement === "right" && <ControlsLabel />}
    </div>
  );
});
