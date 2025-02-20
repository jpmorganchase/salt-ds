import { makePrefixer, useForkRef } from "@salt-ds/core";
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
  bordered?: boolean;
}

const withBaseName = makePrefixer("saltCarouselSlide");

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    { actions, bordered, media, children, style, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSlideCss,
      window: targetWindow,
    });

    const slideRef = useRef<HTMLDivElement>(null);
    const { activeSlide, registerSlide, slideRefs, visibleSlides } =
      useCarousel();

    useEffect(() => {
      if (slideRef.current) {
        registerSlide(slideRef);
      }
    }, [registerSlide]);

    const index = slideRefs.indexOf(slideRef);
    const isActive =
      slideRef.current &&
      index >= activeSlide &&
      index < activeSlide + visibleSlides;

    const SlideStyles = {
      "--carousel-slide-width":
        visibleSlides > 1
          ? `calc((100% / ${visibleSlides}) - var(--salt-spacing-200)/${visibleSlides})`
          : undefined,
      ...style,
    };
    return (
      <div
        role="group"
        aria-roledescription="slide"
        ref={useForkRef(ref, slideRef)}
        className={clsx(withBaseName(), {
          [withBaseName("bordered")]: bordered,
        })}
        style={SlideStyles}
        tabIndex={isActive ? 0 : -1}
        aria-hidden={!isActive}
        {...rest}
      >
        {media}
        {children && (
          <div
            className={clsx(withBaseName("content"), {
              [withBaseName("card")]: bordered,
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
        )}
      </div>
    );
  },
);
