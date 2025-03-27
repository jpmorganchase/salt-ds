import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";
import {
  CarouselDispatchContext,
  CarouselStateContext,
} from "./CarouselContext";
import type { CarouselSlideProps } from "./CarouselSlide";
import carouselSliderCss from "./CarouselSlider.css";

export interface CarouselSliderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Collection of slides to render
   */
  children: Array<ReactElement<CarouselSlideProps>>;
}

const withBaseName = makePrefixer("saltCarouselSlider");

export const CarouselSlider = forwardRef<HTMLDivElement, CarouselSliderProps>(
  function CarouselSlider({ children, onKeyDown, ...rest }, propRef) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slider",
      css: carouselSliderCss,
      window: targetWindow,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const hasRun = useRef(false);
    const { slides, firstVisibleSlideIndex, focusedSlideIndex, visibleSlides } =
      useContext(CarouselStateContext);
    const dispatch = useContext(CarouselDispatchContext);
    const slideIds = [...slides.keys()];

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) return;
      switch (event.key) {
        case "ArrowLeft": {
          const prevId =
            focusedSlideIndex && focusedSlideIndex > firstVisibleSlideIndex
              ? slideIds[focusedSlideIndex - 1]
              : slideIds[firstVisibleSlideIndex - 1] || null;

          if (!prevId) break;

          dispatch({ type: "scroll", payload: prevId });

          slides.get(prevId)?.focus();

          break;
        }
        case "ArrowRight": {
          const nextId = slideIds[firstVisibleSlideIndex + 1] || null;

          if (!nextId) break;

          dispatch({ type: "scroll", payload: nextId });

          slides.get(nextId)?.focus();

          break;
        }
      }
      onKeyDown?.(event);
    };

    const handleScroll = () => {
      const container = containerRef?.current;
      if (!container) return;
      const scrollLeft = container.scrollLeft;
      const slideWidth = container.offsetWidth / visibleSlides;
      const newIndex = Math.round(scrollLeft / slideWidth) || 0;

      if (newIndex !== firstVisibleSlideIndex) {
        dispatch({ type: "move", payload: slideIds[newIndex] });
      }
    };

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scrollBehavior = hasRun.current ? "smooth" : "instant";
      const slideWidth = container.offsetWidth / visibleSlides;

      requestAnimationFrame(() => {
        container.scrollTo({
          left: focusedSlideIndex * slideWidth,
          // @ts-ignore
          behavior: scrollBehavior,
        });
      });

      hasRun.current = true;
    }, [focusedSlideIndex, visibleSlides]);

    const ref = useForkRef(propRef, containerRef);
    return (
      <div
        ref={ref}
        aria-live={visibleSlides === 1 ? "polite" : undefined}
        className={withBaseName()}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
