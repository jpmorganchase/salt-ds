import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import {
  type ComponentPropsWithRef,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import carouselDotButtonCss from "./CarouselDotButton.css";

/**
 * Type definition for the useDotButton hook.
 * Provides state and handlers for dot button navigation in a carousel.
 */
type UseDotButtonType = {
  /**
   * The index of the currently selected slide.
   */
  selectedIndex: number;

  /**
   * An array of scroll snap positions for the carousel slides.
   */
  scrollSnaps: number[];

  /**
   * Handler function for clicking a dot button to navigate to a specific slide.
   *
   * @param index - The index of the slide to navigate to.
   */
  onDotButtonClick: (index: number) => void;
};

const withBaseName = makePrefixer("saltCarouselDotButton");

export const useDotButton = (
  emblaApi: EmblaCarouselType | undefined,
): UseDotButtonType => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const handleDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const handleInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const handleSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    handleInit(emblaApi);
    handleSelect(emblaApi);
    emblaApi
      .on("reInit", handleInit)
      .on("reInit", handleSelect)
      .on("select", handleSelect);
    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("reInit", handleInit);
      emblaApi.off("reInit", handleSelect);
      emblaApi.off("settle", handleSelect);
    };
  }, [emblaApi, handleInit, handleSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick: handleDotButtonClick,
  };
};

/**
 * Props for the CarouselDotButton component.
 */
export interface DotButtonProps extends ComponentPropsWithRef<"button"> {
  /**
   * Is the selected slide
   */
  selected?: boolean;
}

export const CarouselDotButton = forwardRef<HTMLButtonElement, DotButtonProps>(
  function DotButton(
    { children, className, selected = false, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-dot-button",
      css: carouselDotButtonCss,
      window: targetWindow,
    });

    return (
      <button
        className={clsx(
          withBaseName(),
          { [withBaseName("selected")]: selected },
          className,
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
