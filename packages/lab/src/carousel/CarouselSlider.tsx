import {
  makePrefixer,
  useForkRef,
  useIntersectionObserver,
  useResizeObserver,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  Children,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import { type CarouselContextValue, useCarousel } from "./CarouselContext";
import type { CarouselSlideProps } from "./CarouselSlide";
import carouselSliderCss from "./CarouselSlider.css";

export interface CarouselSliderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The animation when the slides are shown.
   * Optional. Defaults to `slide`
   **/
  // TODO: implement animations, check w design
  animation?: "slide" | "fade";
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
  function CarouselSlider(
    { animation, children, onKeyDown: onKeyDownProp },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSliderCss,
      window: targetWindow,
    });

    const [sliderW, setSliderW] = useState(0);
    const {
      updateActiveFromScroll,
      containerRef,
      prevSlide,
      nextSlide,
      bordered,
    } = useCarousel();
    const handleKeyDown = useKeyNavigation({
      nextSlide,
      prevSlide,
    });
    const slidesCount = Children.count(children);

    const handleResize = useCallback(() => {
      if (!containerRef.current) return;
      if (containerRef.current) {
        setSliderW(containerRef.current.offsetWidth);
      }
    }, [containerRef]);

    useResizeObserver({ ref: containerRef, onResize: handleResize });

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (slidesCount < 1) {
          console.warn(
            "Carousel component requires more than one children to render. At least two elements should be provided.",
          );
        }
      }
    }, [slidesCount]);

    // Handlers
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollLeft = containerRef.current.scrollLeft;
        updateActiveFromScroll(scrollLeft, sliderW);
      }
    };
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
        className={clsx(withBaseName(), {
          [withBaseName("bordered")]: bordered,
        })}
        aria-live="polite"
        role="region"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {children}
      </div>
    );
  },
);
