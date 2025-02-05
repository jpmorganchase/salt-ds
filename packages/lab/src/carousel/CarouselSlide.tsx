import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect, useRef } from "react";
import { useCarousel } from "./CarouselContext";
import carouselSlideCss from "./CarouselSlide.css";

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("saltCarouselSlide");

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide({ children }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSlideCss,
      window: targetWindow,
    });

    const slideRef = useRef(useId());
    const { activeSlide, registerSlide, slides } = useCarousel();

    useEffect(() => {
      slideRef.current && registerSlide(slideRef.current);
    }, []);

    const isActive = slides[activeSlide] === slideRef.current;
    return (
      <div
        role="group"
        ref={ref}
        className={clsx(withBaseName(), {
          [withBaseName("active")]: isActive,
        })}
      >
        {children}
      </div>
    );
  },
);
