import { makePrefixer, useForkRef, useId, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentProps,
  type ReactNode,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  CarouselDispatchContext,
  CarouselStateContext,
} from "./CarouselContext";
import carouselSlideCss from "./CarouselSlide.css";

export type CarouselSlideId = string;
export type CarouselSlideElement = HTMLDivElement;
export type CarouselSlideMeta = {
  element: CarouselSlideElement;
  slideDescription?: string;
};
export interface CarouselSlideProps extends ComponentProps<"div"> {
  /**
   * Actions to be displayed in the content footer.
   **/
  actions?: ReactNode;
  /**
   * Media content to be displayed inside the slide. This could include images, videos, etc., that are visually prominent.
   * It differs from children in that media is intended to be the main visual element of the slide.
   **/
  media?: ReactNode;
  /**
   * The appearance of the slide. Options are 'bordered', and 'transparent'.
   * 'transparent' is the default value.
   **/
  appearance?: "bordered" | "transparent";
  /**
   * Header content to be displayed at the top of the slide. This can be text or any other React node.
   **/
  header?: ReactNode;
  /**
   * Carousel slide id.
   */
  id?: string;
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
      className,
      "aria-labelledby": ariaLabelledBy,
      style,
      id: idProp,
      ...rest
    },
    refProp,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slide",
      css: carouselSlideCss,
      window: targetWindow,
    });
    const dispatch = useContext(CarouselDispatchContext);
    const { slides, visibleSlides, activeSlideIndex } =
      useContext(CarouselStateContext);

    const slideRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const id = useIdMemo(idProp);
    const announcerId = useId();
    const slideCount = slides.size;

    useEffect(() => {
      if (!slideRef.current) return;

      dispatch({
        type: "register",
        payload: [
          id,
          {
            element: slideRef.current,
            slideDescription: headerRef?.current?.innerText,
          },
        ],
      });
      return () => dispatch({ type: "unregister", payload: id });
    }, [dispatch, id]);

    const SlideStyles = {
      "--carousel-slide-width":
        visibleSlides > 1
          ? `calc((100% / ${visibleSlides}) - var(--salt-spacing-200)/${visibleSlides})`
          : "100%",
      ...style,
    };

    const ref = useForkRef(refProp, slideRef);
    const slideIds = [...slides.keys()];
    const index = slideIds.indexOf(id || slideIds[0]);
    const helperText = `${index + 1} of ${slideCount}`;
    const isVisible =
      index >= activeSlideIndex && index < activeSlideIndex + visibleSlides;

    return (
      <div
        role="group"
        aria-roledescription="slide"
        aria-labelledby={clsx(ariaLabelledBy, announcerId)}
        id={id}
        className={clsx(
          withBaseName(),
          {
            [withBaseName("bordered")]: appearance === "bordered",
          },
          className,
        )}
        style={SlideStyles}
        tabIndex={isVisible ? 0 : -1}
        hidden={!isVisible}
        {...rest}
        ref={ref}
      >
        {media}
        {children && (
          <div
            className={clsx(withBaseName("container"), {
              [withBaseName("card")]: appearance === "bordered",
            })}
          >
            <div className={withBaseName("content")}>
              {isVisible && (
                <span
                  id={announcerId}
                  className={withBaseName("sr-only")}
                  aria-hidden="true"
                >
                  {helperText}
                </span>
              )}
              <div ref={headerRef}>{header}</div>
              <div>{children}</div>
            </div>
            {isVisible && actions}
          </div>
        )}
      </div>
    );
  },
);
