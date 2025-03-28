import { Button, Text, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type ClassAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type SyntheticEvent,
  forwardRef,
  useContext,
  useRef,
  useState,
} from "react";
import type { JSX } from "react/jsx-runtime";
import {
  CarouselDispatchContext,
  CarouselStateContext,
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

const LiveCarouselAnnouncer = (
  props: JSX.IntrinsicAttributes &
    ClassAttributes<HTMLDivElement> &
    HTMLAttributes<HTMLDivElement>,
) => {
  const { slides, firstVisibleSlideIndex, visibleSlides } =
    useContext(CarouselStateContext);
  const slideIds = [...slides.keys()];
  const currentId = slideIds[firstVisibleSlideIndex] || null;
  const currentLabelId =
    (visibleSlides === 1 && currentId && slides.get(currentId)?.labelId) ||
    undefined;
  const slideCount = slides.size;

  const announcement = `${firstVisibleSlideIndex + 1} ${visibleSlides > 1 && slideCount > 1 ? ` - ${firstVisibleSlideIndex + visibleSlides}` : ""} of
  ${slideCount}`;
  return (
    <div
      aria-live="polite"
      aria-labelledby={currentLabelId}
      aria-atomic="false"
      {...props}
    >
      {announcement}
    </div>
  );
};
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
  const { slides, carouselId, firstVisibleSlideIndex, visibleSlides } =
    useContext(CarouselStateContext);
  const dispatch = useContext(CarouselDispatchContext);

  const slideCount = slides.size;
  const { NextIcon, PreviousIcon } = useIcon();

  const [isFocused, setIsFocused] = useState(false);
  function handleFocusCapture() {
    !isFocused && setIsFocused(true);
  }
  function handleBlurCapture() {
    isFocused && setIsFocused(false);
  }

  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const slideIds = [...slides.keys()];

  const prevId = slideIds[firstVisibleSlideIndex - 1] || null;
  const nextId = slideIds[firstVisibleSlideIndex + 1] || null;

  const isOnFirstSlide = firstVisibleSlideIndex === 0;
  const isOnLastSlide = firstVisibleSlideIndex === slideCount - visibleSlides;

  const controlsLabel = slideCount >= 1 && (
    <Text as="span">
      <strong>
        {`${firstVisibleSlideIndex + 1} ${visibleSlides > 1 && slideCount > 1 ? ` - ${firstVisibleSlideIndex + visibleSlides}` : ""} of
        ${slideCount}`}
      </strong>
    </Text>
  );

  function handlePrevClick(event: MouseEvent<HTMLButtonElement>) {
    if (!prevId) return;
    dispatch({ type: "scroll", payload: prevId });
    onPrevious?.(event);
  }

  function handleNextClick(event: MouseEvent<HTMLButtonElement>) {
    if (!nextId) return;
    dispatch({ type: "scroll", payload: nextId });
    onNext?.(event);
  }

  return (
    <div
      className={withBaseName()}
      ref={ref}
      {...rest}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <LiveCarouselAnnouncer className={withBaseName("sr-only")} />
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
