import { Button, Text, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type MouseEvent,
  type SyntheticEvent,
  forwardRef,
  useContext,
  useRef,
} from "react";
import {
  CarouselDispatchContext,
  CarouselStateContext,
  useCarousel,
} from "./CarouselContext";

import carouselControlsCss from "./CarouselControls.css";

const withBaseName = makePrefixer("saltCarouselControls");

export interface CarouselControlsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Callback when Back button is clicked.
   */
  onPrevious?: (event: SyntheticEvent<HTMLButtonElement>) => void;
  /**
   * Callback when Next button is clicked.
   */
  onNext?: (event: SyntheticEvent<HTMLButtonElement>) => void;
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
    onPrevious,
    onNext,
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
  const { carouselId } = useCarousel();
  const { slides, firstVisibleSlideId, visibleSlides } =
    useContext(CarouselStateContext);
  const dispatch = useContext(CarouselDispatchContext);

  const slideCount = slides.size;
  const { NextIcon, PreviousIcon } = useIcon();

  const prevButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  const slideIds = [...slides.keys()];
  const firstVisibleSlide = slideIds.indexOf(
    firstVisibleSlideId || slideIds[0],
  );
  const prevId = slideIds[firstVisibleSlide - 1] || null;
  const nextId = slideIds[firstVisibleSlide + 1] || null;

  const isOnFirstSlide = firstVisibleSlide === 0;
  const isOnLastSlide = firstVisibleSlide === slideCount - visibleSlides;

  const controlsLabel = slideCount >= 1 && (
    <Text as="span" aria-live={visibleSlides === 1 ? undefined : "polite"}>
      <strong>{`${firstVisibleSlide + 1} ${visibleSlides > 1 && slideCount > 1 ? ` - ${firstVisibleSlide + visibleSlides}` : ""} of
        ${slideCount}`}</strong>
    </Text>
  );

  function handlePrevClick(event: MouseEvent<HTMLButtonElement>) {
    if (!prevId) return;
    dispatch({ type: "move", payload: prevId });
    onPrevious?.(event);
  }

  function handleNextClick(event: MouseEvent<HTMLButtonElement>) {
    if (!nextId) return;
    dispatch({ type: "move", payload: nextId });
    onNext?.(event);
  }

  return (
    <div className={withBaseName()} ref={ref} {...rest}>
      {labelPlacement === "left" && controlsLabel}
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
      {labelPlacement === "right" && controlsLabel}
    </div>
  );
});
