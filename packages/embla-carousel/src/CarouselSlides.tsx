import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  type Ref,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import carouselSlidesCss from "./CarouselSlides.css";
import { createCustomSettle } from "./createCustomSettle";

/**
 * Props for the CarouselSlides component.
 */
export interface CarouselSlidesProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCarouselSlides");

export const CarouselSlides = forwardRef<HTMLDivElement, CarouselSlidesProps>(
  function CarouselSlides({ children, className, onKeyDown, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slides",
      css: carouselSlidesCss,
      window: targetWindow,
    });
    const { emblaApi, emblaRef } = useCarouselContext();

    const carouselRef = useForkRef(ref, emblaRef) as Ref<HTMLDivElement>;

    const usingArrowNavigation = useRef<boolean>();

    const handleSettle = useCallback(
      (emblaApi: EmblaCarouselType) => {
        if (!usingArrowNavigation.current) {
          return;
        }
        const slideIndexInView = emblaApi?.selectedScrollSnap() ?? 0;
        const snappedSlide = emblaApi.slideNodes()[slideIndexInView];
        if (snappedSlide) {
          const focusableElements = snappedSlide.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
          );
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
          }
        }
        usingArrowNavigation.current = false;
      },
      [usingArrowNavigation.current],
    );

    useEffect(() => {
      if (!emblaApi) {
        return;
      }
      const scrollCallback = createCustomSettle(handleSettle);
      emblaApi.on("scroll", scrollCallback);
      // Cleanup listener on component unmount
      return () => {
        emblaApi.off("scroll", scrollCallback);
      };
    }, [emblaApi, handleSettle]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) {
        return;
      }
      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          emblaApi?.scrollPrev();
          usingArrowNavigation.current = true;
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          emblaApi?.scrollNext();
          usingArrowNavigation.current = true;
          break;
        }
      }
      onKeyDown?.(event);
    };

    return (
      <div
        onKeyDown={handleKeyDown}
        ref={carouselRef}
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        <div className={withBaseName("container")}>{children}</div>
      </div>
    );
  },
);
