import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import {
  Children,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useState,
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
  function CarouselSlider({ animation, children, onKeyDown }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSliderCss,
      window: targetWindow,
    });

    const [sliderW, setSliderW] = useState(0);
    const {
      updateActiveFromScroll,
      activeSlide,
      containerRef,
      prevSlide,
      nextSlide,
    } = useCarousel();
    const slidesCount = Children.count(children);

    useEffect(() => {
      if (containerRef.current) {
        setSliderW(containerRef.current.offsetWidth);
      }
      const handleResize = () => {
        if (containerRef.current) {
          setSliderW(containerRef.current.offsetWidth);
        }
      };
      targetWindow?.addEventListener("resize", handleResize);
      return () => targetWindow?.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (slidesCount < 1) {
          console.warn(
            "Carousel component requires more than one children to render. At least two elements should be provided.",
          );
        }
      }
    }, [slidesCount]);

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current?.addEventListener("scroll", handleScroll);
      }
      return () =>
        containerRef?.current?.removeEventListener("scroll", handleScroll);
    }, [sliderW, activeSlide]);

    // Handlers
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollLeft = containerRef.current.scrollLeft;
        updateActiveFromScroll(scrollLeft, sliderW);
      }
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      // TODO: we might need a longer delay
      if (event.repeat) return;
      if (event.key === "ArrowRight") nextSlide(event);
      if (event.key === "ArrowLeft") prevSlide(event);
      onKeyDown?.(event);
    };

    return (
      <div
        ref={useForkRef(ref, containerRef)}
        className={withBaseName()}
        aria-live="polite"
        role="region"
        tabIndex={0}
        onKeyDown={() => handleKeyDown}
      >
        {children}
      </div>
    );
  },
);
