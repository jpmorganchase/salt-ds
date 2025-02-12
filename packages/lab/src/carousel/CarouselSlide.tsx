import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { useCarousel } from "./CarouselContext";
import carouselSlideCss from "./CarouselSlide.css";

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Actions to be displayed in the content footer
   */
  actions?: ReactNode;
  /**
   * The image to be displayed inside the slide
   */
  media?: ReactNode;
}

const withBaseName = makePrefixer("saltCarouselSlide");

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide({ actions, media, children }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSlideCss,
      window: targetWindow,
    });

    const slideRef = useRef(useId());
    const { activeSlide, registerSlide, slides, bordered } = useCarousel();

    useEffect(() => {
      slideRef.current && registerSlide(slideRef.current);
    }, [registerSlide]);

    const isActive = slides[activeSlide] === slideRef.current;
    return (
      <div role="group" ref={ref} className={withBaseName()}>
        {media}
        <div
          className={clsx(withBaseName("content"), {
            [withBaseName("bordered")]: bordered,
          })}
        >
          {children}
          <div
            className={clsx(withBaseName("actions"), {
              [withBaseName("active")]: isActive,
            })}
          >
            {actions}
          </div>
        </div>
      </div>
    );
  },
);
