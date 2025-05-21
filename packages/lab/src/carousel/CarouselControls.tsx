import { Button, Text, makePrefixer, useIcon } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  forwardRef,
  useContext,
  useRef,
  useState,
} from "react";
import {
  CarouselDispatchContext,
  CarouselStateContext,
} from "./CarouselContext";

import { clsx } from "clsx";
import carouselControlsCss from "./CarouselControls.css";

const withBaseName = makePrefixer("saltCarouselControls");

export interface CarouselControlsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Callback when Back button is clicked.
   */
  onPrevious?: (
    event: SyntheticEvent<HTMLButtonElement>,
    index: number,
  ) => void;
  /**
   * Callback when Next button is clicked.
   */
  onNext?: (event: SyntheticEvent<HTMLButtonElement>, index: number) => void;
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
  /**
   * The title of the carousel that accompanies the controls.
   */
  title?: ReactNode;
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
    title,
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
  const { slides, carouselId, activeSlideIndex, visibleSlides } =
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

  const currentId = slideIds[activeSlideIndex] || null;
  const prevId = slideIds[activeSlideIndex - 1] || null;
  const nextId = slideIds[activeSlideIndex + 1] || null;

  const isOnFirstSlide = activeSlideIndex === 0;
  const isOnLastSlide = activeSlideIndex === slideCount - visibleSlides;

  const isAnnouncerOn =
    nextButtonRef.current === targetWindow?.document.activeElement ||
    prevButtonRef.current === targetWindow?.document.activeElement;

  const currentSlideDescription =
    (visibleSlides === 1 &&
      currentId &&
      slides.get(currentId)?.slideDescription) ||
    undefined;

  const controlsLabel = slideCount >= 1 && (
    <Text
      as="span"
      aria-live={isAnnouncerOn ? "polite" : undefined}
      aria-atomic="false"
    >
      <strong>
        {`${activeSlideIndex + 1} ${visibleSlides > 1 && slideCount > 1 ? ` - ${activeSlideIndex + visibleSlides}` : ""} of
        ${slideCount}`}

        {
          <span className="saltCarouselControls-sr-only">
            {currentSlideDescription}
          </span>
        }
      </strong>
    </Text>
  );

  function handlePrevClick(event: MouseEvent<HTMLButtonElement>) {
    if (!prevId) return;
    dispatch({ type: "scroll", payload: prevId });
    onPrevious?.(event, slideIds.indexOf(prevId));
  }

  function handleNextClick(event: MouseEvent<HTMLButtonElement>) {
    if (!nextId) return;
    dispatch({ type: "scroll", payload: nextId });
    onNext?.(event, slideIds.indexOf(nextId));
  }

  return (
    <div
      className={clsx(withBaseName("container"), className)}
      ref={ref}
      {...rest}
    >
      {title}
      <div
        className={withBaseName()}
        ref={ref}
        {...rest}
        onFocusCapture={handleFocusCapture}
        onBlurCapture={handleBlurCapture}
      >
        {(labelPlacement === "left" || title) && controlsLabel}
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
        {labelPlacement === "right" && !title && controlsLabel}
      </div>
    </div>
  );
});
