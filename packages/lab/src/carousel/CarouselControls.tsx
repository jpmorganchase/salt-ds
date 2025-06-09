import { Text, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";

import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "./CarouselArrowButton";
import { useCarouselContext } from "./CarouselContext";
import carouselControlsCss from "./CarouselControls.css";
import { getSlideDescription } from "./getDescription";

const withBaseName = makePrefixer("saltCarouselControls");

/**
 * Props for the CarouselControls component.
 */
export interface CarouselControlsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Location of the label relative to the controls.
   * Determines whether the label is placed to the 'left' or 'right' of the controls.
   */
  labelPlacement?: "left" | "right";
}

export const CarouselControls = forwardRef<
  HTMLDivElement,
  CarouselControlsProps
>(function CarouselControls(
  { className, labelPlacement = "left", ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });

  const [slideCount, setSlideCount] = useState(0);
  const [slideIndexInView, setSlideIndexInView] = useState(0);
  const [prevSlideDescription, setPrevSlideDescription] = useState<
    string | undefined
  >(undefined);
  const [nextSlideDescription, setNextSlideDescription] = useState<
    string | undefined
  >(undefined);
  const [currentSlideDescription, setCurrentSlideDescription] = useState<
    string | undefined
  >(undefined);

  const { emblaApi } = useCarouselContext();

  const handleSettle = useCallback((emblaApi: EmblaCarouselType) => {
    const newSlideCount = emblaApi?.slideNodes().length || 0;
    const newVisibleSlideCount = emblaApi?.slidesInView()?.length ?? 0;
    const slideIndexInView = emblaApi?.slidesInView()?.[0] ?? 0;

    setSlideCount(newSlideCount);
    setSlideIndexInView(slideIndexInView);
    const slideElement = emblaApi?.slideNodes()[slideIndexInView];
    setCurrentSlideDescription(
      getSlideDescription(slideElement, slideIndexInView, newSlideCount),
    );
    setPrevSlideDescription(
      slideIndexInView - 1 >= 0
        ? getSlideDescription(slideElement, slideIndexInView - 1, newSlideCount)
        : undefined,
    );
    setNextSlideDescription(
      slideIndexInView + 1 <= newSlideCount
        ? getSlideDescription(
            slideElement,
            Math.min(slideIndexInView + 1, newSlideCount),
            newSlideCount,
          )
        : undefined,
    );
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("reInit", handleSettle).on("settle", handleSettle);
    handleSettle(emblaApi);
    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("reInit", handleSettle);
      emblaApi.off("settle", handleSettle);
    };
  }, [emblaApi, handleSettle]);

  const controlsLabel = slideCount >= 1 && slideIndexInView !== null && (
    <Text as="span">
      <strong>{`${slideIndexInView + 1} of ${slideCount}`}</strong>
    </Text>
  );

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons();

  return (
    <div className={clsx(withBaseName(), className)} ref={ref} {...rest}>
      {labelPlacement === "left" && controlsLabel}
      <PrevButton
        onClick={onPrevButtonClick}
        disabled={prevBtnDisabled}
        aria-label={prevSlideDescription}
      />
      <NextButton
        onClick={onNextButtonClick}
        disabled={nextBtnDisabled}
        aria-label={nextSlideDescription}
      />
      {labelPlacement === "right" && controlsLabel}
    </div>
  );
});
