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
 * Props for the CarouselPreviousButton component.
 */
export interface CarouselPreviousButtonProps extends ButtonProps {}

export const CarouselPreviousButton = forwardRef<
  HTMLButtonElement,
  CarouselPreviousButtonProps
>(function CarouselPreviousButton({ className, onClick, ...rest }, ref) {
  const [prevSlideDescription, setPrevSlideDescription] = useState<
    string | undefined
  >(undefined);

  const { emblaApi } = useCarouselContext();

  const { PreviousIcon } = useIcon();

  const handleSettle = useCallback(
    (emblaApi: EmblaCarouselType) => {
      const slideIndexInView = emblaApi?.slidesInView()?.[0] ?? 0;
      const numberOfSlides = emblaApi?.slideNodes().length ?? 0;
      const scrollSnaps = emblaApi?.scrollSnapList() ?? [];
      const slidesPerTransition = numberOfSlides
        ? Math.ceil(numberOfSlides / scrollSnaps.length)
        : 0;

      const endSlideNumber = slideIndexInView;
      const startSlideNumber = Math.max(
        endSlideNumber - slidesPerTransition + 1,
        1,
      );

      const label =
        startSlideNumber === endSlideNumber
          ? `Previous slide ${startSlideNumber} of ${numberOfSlides}`
          : `Previous slides ${startSlideNumber}-${endSlideNumber} of ${numberOfSlides}`;

      setPrevSlideDescription(label);
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("reInit", handleSettle).on("settle", handleSettle);
    handleSettle(emblaApi);
    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("reInit", handleSettle).off("settle", handleSettle);
    };
  }, [emblaApi, handleSettle]);

  const { prevBtnDisabled, onPrevButtonClick } = usePrevNextButtons();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      onPrevButtonClick();
      onClick?.(event);
    },
    [onPrevButtonClick, onClick],
  );

  return (
    <Button
      onClick={handleClick}
      disabled={prevBtnDisabled}
      focusableWhenDisabled
      appearance="bordered"
      sentiment="neutral"
      aria-label={!prevBtnDisabled ? prevSlideDescription : "No previous slide"}
      ref={ref}
      {...rest}
    >
      <PreviousIcon aria-hidden />
    </Button>
  );
});
