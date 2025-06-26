import { Text, type TextProps, makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import { useCallback, useEffect, useState } from "react";
import { useCarouselContext } from "./CarouselContext";
import carouselProgressLabelCss from "./CarouselProgressLabel.css";

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

  const [currentSlide, setCurrentSlide] = useState("");
  const [totalSlides, setTotalSlides] = useState(0);

  const handleSettle = useCallback((emblaApi: EmblaCarouselType) => {
    const slideIndexInView = emblaApi?.selectedScrollSnap() ?? 0;
    const numberOfSlides = emblaApi?.slideNodes().length ?? 0;
    const scrollSnaps = emblaApi?.scrollSnapList() ?? [];
    const slidesPerTransition = numberOfSlides
      ? Math.ceil(numberOfSlides / scrollSnaps.length)
      : 0;
    const startSlideNumber = Math.min(
      slideIndexInView * slidesPerTransition + 1,
      numberOfSlides - (slidesPerTransition - 1),
    );
    const endSlideNumber = Math.min(
      startSlideNumber + slidesPerTransition - 1,
      numberOfSlides,
    );

    if (startSlideNumber === endSlideNumber) {
      setCurrentSlide(startSlideNumber.toString(10));
    } else {
      setCurrentSlide(`${startSlideNumber}-${endSlideNumber}`);
    }
    setTotalSlides(numberOfSlides);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi
      .on("init", handleSettle)
      .on("reInit", handleSettle)
      .on("settle", handleSettle);
    handleSettle(emblaApi);
    // Cleanup listener on component unmount
    return () => {
      emblaApi
        .off("init", handleSettle)
        .off("reInit", handleSettle)
        .off("settle", handleSettle);
    };
  }, [emblaApi, handleSettle]);

  return (
    <Text className={clsx(withBaseName(), className)} {...props}>
      Slide {currentSlide} of {totalSlides}
    </Text>
  );
}
