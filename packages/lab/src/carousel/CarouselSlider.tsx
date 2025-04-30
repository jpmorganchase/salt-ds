import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type SyntheticEvent,
  type UIEvent,
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
  /**
   * Callback fired when the selected slide change.
   **/
  onSelectionChange?: (
    event: SyntheticEvent<HTMLDivElement>,
    index: number,
  ) => void;
}

const withBaseName = makePrefixer("saltCarouselSlider");

export const CarouselSlider = forwardRef<HTMLDivElement, CarouselSliderProps>(
  function CarouselSlider(
    { children, className, onKeyDown, onScroll, onSelectionChange, ...rest },
    propRef,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slider",
      css: carouselSliderCss,
      window: targetWindow,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const hasRun = useRef(false);
    const { slides, activeSlideIndex, focusedSlideIndex, visibleSlides } =
      useContext(CarouselStateContext);
    const dispatch = useContext(CarouselDispatchContext);
    const slideIds = [...slides.keys()];

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) return;
      switch (event.key) {
        case "ArrowLeft": {
          const prevIndex =
            focusedSlideIndex && focusedSlideIndex > activeSlideIndex
              ? focusedSlideIndex - 1
              : activeSlideIndex - 1;
          const prevId = slideIds[prevIndex] || null;

          if (!prevId) break;
          dispatch({ type: "scroll", payload: prevId });
          onSelectionChange?.(event, prevIndex);
          slides.get(prevId)?.element.focus();

          break;
        }
        case "ArrowRight": {
          const nextIndex = activeSlideIndex + 1;
          const nextId = slideIds[nextIndex] || null;

          if (!nextId) break;

          dispatch({ type: "scroll", payload: nextId });
          onSelectionChange?.(event, nextIndex);

          slides.get(nextId)?.element.focus();

          break;
        }
      }
      onKeyDown?.(event);
    };

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
      const container = containerRef?.current;
      if (!container) return;
      const scrollLeft = container.scrollLeft;
      const slideWidth = container.offsetWidth / visibleSlides;
      const newIndex = Math.round(scrollLeft / slideWidth) || 0;

      if (newIndex !== activeSlideIndex) {
        dispatch({ type: "move", payload: slideIds[newIndex] });
        onSelectionChange?.(event, newIndex);
      }
      onScroll?.(event);
    };

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scrollBehavior = hasRun.current ? "smooth" : "instant";
      const slideWidth = container.offsetWidth / visibleSlides;

      requestAnimationFrame(() => {
        container.scrollTo({
          left: focusedSlideIndex * slideWidth,
          // @ts-ignore ScrollBehavior typescript definition missing instant
          behavior: scrollBehavior,
        });
      });

      hasRun.current = true;
    }, [focusedSlideIndex, visibleSlides]);

    const ref = useForkRef(propRef, containerRef);
    return (
      <div
        ref={ref}
        className={clsx(withBaseName(), className)}
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
