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
   * Actions to be displayed in the content footer.
   */
  actions?: ReactNode;
  /**
   * The media to be displayed inside the slide.
   */
  media?: ReactNode;
  /**
   * The appearance of the slide. Options are 'bordered', and 'transparent'.
   * 'transparent' is the default value.
   * */
  appearance?: "bordered" | "transparent";
  /**
   * Header text
   */
  header?: ReactNode;
}

const withBaseName = makePrefixer("saltCarouselSlide");

export const CarouselSlide = forwardRef<HTMLDivElement, CarouselSlideProps>(
  function CarouselSlide(
    {
      actions,
      appearance,
      media,
      header,
      children,
      "aria-labelledby": ariaLabelledBy,
      style,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSlideCss,
      window: targetWindow,
    });
    const slideRef = useRef<HTMLDivElement>(null);
    const {
      firstVisibleSlide,
      registerSlide,
      unregisterSlide,
      slideRefs,
      visibleSlides,
    } = useCarousel();

    useEffect(() => {
      if (slideRef.current) {
        registerSlide(slideRef);
      }
      return () => unregisterSlide(slideRef);
    }, [registerSlide, unregisterSlide]);

    const index = slideRefs.indexOf(slideRef);
    const isVisible =
      slideRef.current &&
      index >= firstVisibleSlide &&
      index < firstVisibleSlide + visibleSlides;

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
        aria-labelledby={clsx(ariaLabelledBy)}
        ref={useForkRef(ref, slideRef)}
        className={clsx(withBaseName(), {
          [withBaseName("bordered")]: appearance === "bordered",
        })}
        style={SlideStyles}
        tabIndex={isVisible ? 0 : -1}
        hidden={!isVisible ? true : undefined}
        aria-hidden={!isVisible ? true : undefined}
        {...rest}
      >
        {media}
        {children && (
          <div
            className={clsx(withBaseName("container"), {
              [withBaseName("card")]: appearance === "bordered",
            })}
          >
            <div className={withBaseName("content")}>
              <span className={clsx(withBaseName("sr-only"))}>
                {isVisible && `${index + 1} of ${slideRefs.length}`}
              </span>
              {header}
              {children}
            </div>
            {actions && (
              <div
                className={clsx(withBaseName("actions"), {
                  [withBaseName("active")]: isVisible,
                })}
              >
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
