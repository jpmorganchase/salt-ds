import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import {
  type ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useState,
} from "react";
import carouselTabCss from "./CarouselTab.css";

/**
 * Type definition for the UseCarouselTab hook.
 * Provides state and handlers for tablist navigation in a carousel.
 */
type UseCarouselTabProps = {
  /**
   * The index of the currently selected slide.
   */
  selectedIndex: number;

  /**
   * An array of scroll snap positions for the carousel slides.
   */
  scrollSnaps: number[];
};

const withBaseName = makePrefixer("saltCarouselTab");

export const useCarouselTab = (
  emblaApi: EmblaCarouselType | undefined,
): UseCarouselTabProps => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    const handleInit = (emblaApi: EmblaCarouselType) => {
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    const handleSelect = (emblaApi: EmblaCarouselType) => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    if (!emblaApi) return;

    handleInit(emblaApi);
    handleSelect(emblaApi);
    emblaApi
      .on("init", handleInit)
      .on("reInit", handleInit)
      .on("select", handleSelect);
    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("init", handleInit);
      emblaApi.off("reInit", handleInit);
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi]);

  return {
    selectedIndex,
    scrollSnaps,
  };
};

/**
 * Props for the CarouselTab component.
 */
export interface CarouselTabProps extends ComponentPropsWithRef<"button"> {
  /**
   * Is the selected slide
   */
  selected?: boolean;
}

export const CarouselTab = forwardRef<HTMLButtonElement, CarouselTabProps>(
  function CarouselTab(
    { children, className, selected = false, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-tab",
      css: carouselTabCss,
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
