import { makePrefixer, Text, type TextProps } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import { useEffect, useState } from "react";
import { useCarouselContext } from "./CarouselContext";
import carouselProgressLabelCss from "./CarouselProgressLabel.css";
import { getVisibleSlideIndexes } from "./getVisibleSlideIndexes";

/**
 * Props for the CarouselProgressLabel component.
 */
export interface CarouselProgressLabelProps extends TextProps<"div"> {}

const withBaseName = makePrefixer("saltCarouselTabList");

export function CarouselProgressLabel({
  className,
  styleAs = "label",
  children,
  ...props
}: CarouselProgressLabelProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-progress-label",
    css: carouselProgressLabelCss,
    window: targetWindow,
  });

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
      setProgress(`Slide ${slidePosition} of ${numberOfSlides}.`);
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
    <Text className={clsx(withBaseName(), className)} {...props}>
      {progress}
    </Text>
  );
}
