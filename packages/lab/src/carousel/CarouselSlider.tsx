import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  forwardRef,
  useContext,
  useEffect,
} from "react";
import {
  CarouselDispatchContext,
  CarouselStateContext,
  useCarousel,
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

    const { containerRef } = useCarousel();
    const dispatch = useContext(CarouselDispatchContext);
    const { slides, firstVisibleSlideId, visibleSlides } =
      useContext(CarouselStateContext);
    const slideIds = [...slides.keys()];
    const firstVisibleSlide = slideIds.indexOf(
      firstVisibleSlideId || slideIds[0],
    );

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      requestAnimationFrame(() => {
        container.scrollTo({
          left: firstVisibleSlide * (container.offsetWidth / visibleSlides),
          behavior: "smooth",
        });
      });
    }, [firstVisibleSlideId]);
    const prevId = slideIds[firstVisibleSlide - 1] || null;
    const nextId = slideIds[firstVisibleSlide + 1] || null;
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        if (event.repeat) return;
        event.stopPropagation();
        if (event.key === "ArrowRight") {
          if (!nextId) return;
          dispatch({ type: "move", payload: nextId });
          dispatch({ type: "focus", payload: nextId });
        } else {
          if (!prevId) return;
          dispatch({ type: "move", payload: prevId });
          dispatch({ type: "focus", payload: prevId });
        }
      }
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
