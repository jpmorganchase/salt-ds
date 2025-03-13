import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  forwardRef,
  useCallback,
} from "react";
import { type CarouselContextValue, useCarousel } from "./CarouselContext";
import type { CarouselSlideProps } from "./CarouselSlide";
import carouselSliderCss from "./CarouselSlider.css";
import { useIntersectionObserver } from "./useIntersectionObserver";

export interface CarouselSliderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Collection of slides to render
   */
  children: Array<ReactElement<CarouselSlideProps>>;
}

const withBaseName = makePrefixer("saltCarouselSlider");

const useKeyNavigation = ({
  nextSlide,
  prevSlide,
}: Pick<CarouselContextValue, "nextSlide" | "prevSlide">) => {
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        if (event.repeat) return;
        event.stopPropagation();
        if (event.key === "ArrowRight") {
          nextSlide?.(event);
        } else {
          prevSlide?.(event);
        }
      }
    },
    [nextSlide, prevSlide],
  );
};

export const CarouselSlider = forwardRef<HTMLDivElement, CarouselSliderProps>(
  function CarouselSlider(
    { children, onKeyDown: onKeyDownProp, ...rest },
    propRef,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slider",
      css: carouselSliderCss,
      window: targetWindow,
    });

    const {
      updateFirstVisibleFromScroll,
      containerRef,
      prevSlide,
      nextSlide,
      visibleSlides,
    } = useCarousel();
    const handleKeyDown = useKeyNavigation({
      nextSlide,
      prevSlide,
    });

    // Handlers
    const handleScroll = useCallback(() => {
      if (containerRef.current) {
        const scrollLeft = containerRef.current.scrollLeft;
        updateFirstVisibleFromScroll(scrollLeft);
      }
    }, [containerRef, updateFirstVisibleFromScroll]);
    useIntersectionObserver({
      ref: containerRef,
      onIntersect: handleScroll,
    });

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      handleKeyDown(event);
      onKeyDownProp?.(event);
    };
    const ref = useForkRef(propRef, containerRef);
    return (
      <div
        ref={ref}
        aria-live={visibleSlides === 1 ? "polite" : undefined}
        className={withBaseName()}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
