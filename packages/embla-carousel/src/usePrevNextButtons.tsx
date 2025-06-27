import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useState } from "react";
import { useCarouselContext } from "./CarouselContext";

type UsePrevNextButtonsType = {
  /**
   * Indicates whether the previous button is disabled.
   */
  prevBtnDisabled: boolean;
  /**
   * Indicates whether the next button is disabled.
   */
  nextBtnDisabled: boolean;
  /**
   * Handles the click event for the previous button.
   */
  onPrevButtonClick: () => void;
  /**
   * Handles the click event for the next button.
   */
  onNextButtonClick: () => void;
};

export const usePrevNextButtons = (): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const { emblaApi } = useCarouselContext();

  const handlePrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const handleNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const handleSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    handleSelect(emblaApi);
    emblaApi
      .on("init", handleSelect)
      .on("reInit", handleSelect)
      .on("select", handleSelect);
    // Cleanup listener on component unmount
    return () => {
      emblaApi
        .off("init", handleSelect)
        .off("reInit", handleSelect)
        .off("select", handleSelect);
    };
  }, [emblaApi, handleSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick: handlePrevButtonClick,
    onNextButtonClick: handleNextButtonClick,
  };
};
