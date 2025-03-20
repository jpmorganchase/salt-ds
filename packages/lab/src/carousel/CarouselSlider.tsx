import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  forwardRef,
  useContext,
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

    const dispatch = useContext(CarouselDispatchContext);
    const {
      slides,
      firstVisibleSlideIndex,
      focusedSlideIndex,
      visibleSlides,
      containerRef,
    } = useContext(CarouselStateContext);
    const slideIds = [...slides.keys()];
    const prevId =
      focusedSlideIndex && focusedSlideIndex > firstVisibleSlideIndex
        ? slideIds[focusedSlideIndex - 1]
        : slideIds[firstVisibleSlideIndex - 1] || null;
    const nextId = slideIds[firstVisibleSlideIndex + 1] || null;
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        if (event.repeat) return;
        event.stopPropagation();
        if (event.key === "ArrowRight") {
          if (!nextId) return;
          dispatch({ type: "scroll", payload: nextId });
          dispatch({ type: "focus", payload: nextId });
        } else {
          if (!prevId) return;
          dispatch({ type: "scroll", payload: prevId });
          dispatch({ type: "focus", payload: prevId });
        }
      }
      onKeyDownProp?.(event);
    };
    const handleScroll = () => {
      const container = containerRef?.current;
      if (!container) return;
      const scrollLeft = container.scrollLeft;
      const newIndex =
        Math.round(scrollLeft / (container.offsetWidth / visibleSlides)) || 0;
      if (newIndex !== firstVisibleSlideIndex) {
        dispatch({ type: "move", payload: slideIds[newIndex] });
      }
    };

    const ref = useForkRef(propRef, containerRef);
    return (
      <div
        ref={ref}
        className={withBaseName()}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onScroll={handleScroll}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
