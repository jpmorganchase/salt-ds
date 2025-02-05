import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  type ReactElement,
  useEffect,
  useRef,
} from "react";
import { useCarousel } from "./CarouselContext";
import carouselSliderCss from "./CarouselSlider.css";
import type { CarouselSlideProps } from "./CarouselSlide";

export interface CarouselSliderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The animation when the slides are shown.
   * Optional. Defaults to `slide`
   **/
  animation?: "slide" | "fade";
  /**
   * Collection of slides to render
   * Component must implement CarouselSlideProps. Mandatory.
   */
  children: Array<ReactElement<CarouselSlideProps>>;
}

const withBaseName = makePrefixer("saltCarouselSlider");

export const CarouselSlider = forwardRef<HTMLDivElement, CarouselSliderProps>(
  function CarouselSlider({ animation, children }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSliderCss,
      window: targetWindow,
    });

    const containerRef = useRef<HTMLDivElement>(null);

    const slidesCount = Children.count(children);
    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (slidesCount < 1) {
          console.warn(
            "Carousel component requires more than one children to render. At least two elements should be provided.",
          );
        }
      }
    }, [slidesCount]);

    const { activeSlide } = useCarousel();

    useEffect(() => {
      if (containerRef.current) {
        const slideW = containerRef.current.offsetWidth;
        containerRef.current.scrollTo({
          left: activeSlide * slideW,
          //TODO: double check animations
          behavior: "smooth",
        });
      }
    }, [activeSlide]);
    return (
      <div
        ref={useForkRef(ref, containerRef)}
        className={withBaseName()}
        aria-live="polite"
      >
        {children}
      </div>
    );
  },
);
