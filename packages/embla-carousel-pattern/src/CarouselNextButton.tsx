import { Button, type ButtonProps, useIcon } from "@salt-ds/core";
import type { EmblaCarouselType } from "embla-carousel";
import {
  type MouseEventHandler,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import { usePrevNextButtons } from "./usePrevNextButtons";

/**
 * Props for the CarouselNextButton component.
 */
export interface CarouselNextButtonProps extends ButtonProps {}

export const CarouselNextButton = forwardRef<
  HTMLButtonElement,
  CarouselNextButtonProps
>(function CarouselNextButton({ className, onClick, ...rest }, ref) {
  const [nextSlideDescription, setNextSlideDescription] = useState<
    string | undefined
  >(undefined);

  const { emblaApi } = useCarouselContext();

  const { NextIcon } = useIcon();

  const handleSettle = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const slideIndexInView = emblaApi?.selectedScrollSnap() ?? 0;

      const numberOfSlides = emblaApi?.slideNodes().length ?? 0;
      const scrollSnaps = emblaApi?.scrollSnapList() ?? [];
      const slidesPerTransition = numberOfSlides
        ? Math.ceil(numberOfSlides / scrollSnaps.length)
        : 0;

      let startSlideNumber = slideIndexInView + slidesPerTransition + 1;
      startSlideNumber = startSlideNumber + slidesPerTransition - 1;
      const endSlideNumber = Math.min(
        startSlideNumber + slidesPerTransition - 1,
        numberOfSlides,
      );

      const label =
        startSlideNumber === endSlideNumber
          ? `Next slide ${startSlideNumber} of ${numberOfSlides}`
          : `Next slides ${startSlideNumber}-${endSlideNumber} of ${numberOfSlides}`;

      setNextSlideDescription(label);
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("init", handleSettle).on("reInit", handleSettle).on("settle", handleSettle);
    handleSettle(emblaApi);
    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("init", handleSettle).off("reInit", handleSettle).off("settle", handleSettle);
    };
  }, [emblaApi, handleSettle]);

  const { nextBtnDisabled, onNextButtonClick } = usePrevNextButtons();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      onNextButtonClick();
      onClick?.(event);
    },
    [onNextButtonClick, onClick],
  );

  return (
    <Button
      onClick={handleClick}
      disabled={nextBtnDisabled}
      focusableWhenDisabled
      appearance="bordered"
      sentiment="neutral"
      aria-label={!nextBtnDisabled ? nextSlideDescription : "End of slides"}
      ref={ref}
      {...rest}
    >
      <NextIcon aria-hidden />
    </Button>
  );
});
