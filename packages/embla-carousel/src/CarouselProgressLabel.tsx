import { makePrefixer, Text, type TextProps } from "@salt-ds/core";
import { clsx } from "clsx";
import { forwardRef, useEffect, useState } from "react";
import { useCarouselContext } from "./CarouselContext";
import type { EmblaCarouselType } from "./emblaTypes";
import { getVisibleSlideIndexes } from "./getVisibleSlideIndexes";

/**
 * Props for the CarouselProgressLabel component.
 */
export interface CarouselProgressLabelProps
  extends Omit<TextProps<"div">, "children"> {}

const withBaseName = makePrefixer("saltCarouselTabList");

export const CarouselProgressLabel = forwardRef<
  HTMLDivElement,
  CarouselProgressLabelProps
>(function CarouselProgressLabel({ className, ...props }, ref) {
  const { emblaApi } = useCarouselContext();

  const [progress, setProgress] = useState("");

  useEffect(() => {
    const handleSelect = (emblaApi: EmblaCarouselType) => {
      const selectedScrollSnap = emblaApi?.selectedScrollSnap() ?? 0;
      const numberOfSlides = emblaApi?.slideNodes().length ?? 0;
      const visibleSlides = getVisibleSlideIndexes(
        emblaApi,
        selectedScrollSnap,
      );
      const startSlideNumber = visibleSlides.length >= 1 ? visibleSlides[0] : 0;
      const endSlideNumber =
        visibleSlides.length > 1 ? visibleSlides[visibleSlides.length - 1] : 0;
      const slidePosition = endSlideNumber
        ? `${startSlideNumber}-${endSlideNumber}`
        : startSlideNumber;
      setProgress(`Slide ${slidePosition} of ${numberOfSlides}`);
    };

    if (!emblaApi) return;
    emblaApi
      .on("init", handleSelect)
      .on("reInit", handleSelect)
      .on("select", handleSelect);
    handleSelect(emblaApi);
    // Cleanup listener on component unmount
    return () => {
      emblaApi
        .off("init", handleSelect)
        .off("reInit", handleSelect)
        .off("select", handleSelect);
    };
  }, [emblaApi]);

  return (
    <Text className={clsx(withBaseName(), className)} ref={ref} {...props}>
      {progress}
    </Text>
  );
});
