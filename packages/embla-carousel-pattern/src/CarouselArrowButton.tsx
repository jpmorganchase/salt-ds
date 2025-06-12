import { Button, useIcon } from "@salt-ds/core";
import type { EmblaCarouselType } from "embla-carousel";
import type React from "react";
import {
  type ComponentPropsWithRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useCarouselContext } from "./CarouselContext";

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
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
    emblaApi.on("reInit", handleSelect).on("select", handleSelect);
    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("reInit", handleSelect);
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi, handleSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick: handlePrevButtonClick,
    onNextButtonClick: handleNextButtonClick,
  };
};

type PropType = ComponentPropsWithRef<"button">;

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, ...rest } = props;

  const { PreviousIcon } = useIcon();

  return (
    <Button
      focusableWhenDisabled
      appearance="bordered"
      sentiment="neutral"
      aria-label={"Previous slide"}
      tabIndex={0}
      {...rest}
    >
      <PreviousIcon aria-hidden />
    </Button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { children, ...rest } = props;

  const { NextIcon } = useIcon();

  return (
    <Button
      focusableWhenDisabled
      appearance="bordered"
      sentiment="neutral"
      aria-label={"Next slide"}
      tabIndex={0}
      {...rest}
    >
      <NextIcon aria-hidden />
    </Button>
  );
};
