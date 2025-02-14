import {
  makePrefixer,
  useForkRef,
  useIntersectionObserver,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  forwardRef,
  useCallback,
  useState,
} from "react";
import { type CarouselContextValue, useCarousel } from "./CarouselContext";
import type { CarouselSlideProps } from "./CarouselSlide";
import carouselSliderCss from "./CarouselSlider.css";

export interface CarouselSliderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Collection of slides to render
   * Component must implement CarouselSlideProps. Mandatory.
   */
  children: Array<ReactElement<CarouselSlideProps>>;
}

const withBaseName = makePrefixer("saltCarouselSlider");

const useKeyNavigation = ({
  nextSlide,
  prevSlide,
}: Pick<CarouselContextValue, "nextSlide" | "prevSlide">) => {
  const [isScrolling, setIsScrolling] = useState(false);

  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (isScrolling) return;

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        if (event.repeat) return;

        setIsScrolling(true);

        if (event.key === "ArrowRight") {
          nextSlide?.(event);
        } else if (event.key === "ArrowLeft") {
          prevSlide?.(event);
        }

        setTimeout(() => {
          setIsScrolling(false);
        }, 20000);
      }
    },
    [isScrolling, nextSlide, prevSlide],
  );
};

export const CarouselSlider = forwardRef<HTMLDivElement, CarouselSliderProps>(
  function CarouselSlider({ children, onKeyDown: onKeyDownProp }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSliderCss,
      window: targetWindow,
    });

    const { updateActiveFromScroll, containerRef, prevSlide, nextSlide } =
      useCarousel();
    const handleKeyDown = useKeyNavigation({
      nextSlide,
      prevSlide,
    });

    // Handlers
    const handleScroll = useCallback(() => {
      if (containerRef.current) {
        const scrollLeft = containerRef.current.scrollLeft;
        updateActiveFromScroll(scrollLeft);
      }
    }, [containerRef, updateActiveFromScroll]);
    useIntersectionObserver({
      ref: containerRef,
      onIntersect: handleScroll,
    });

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      handleKeyDown(event);
      onKeyDownProp?.(event);
    };
    return (
      <div
        ref={useForkRef(ref, containerRef)}
        className={withBaseName()}
        aria-live="polite"
        role="region"
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    );
  },
);
