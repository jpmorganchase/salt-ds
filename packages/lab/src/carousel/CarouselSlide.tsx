import { makePrefixer, useForkRef, useIdMemo } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  CarouselDispatchContext,
  CarouselStateContext,
} from "./CarouselContext";
import carouselSlideCss from "./CarouselSlide.css";
import { useIntersectionObserver } from "./useIntersectionObserver";

export interface CarouselSlideProps extends HTMLAttributes<HTMLDivElement> {
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
    const { slides, visibleSlides } = useContext(CarouselStateContext);

    const slideRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const id = useIdMemo(idProp);
    const slideCount = slides.size;
    useEffect(() => {
      if (!slideRef.current) return;
      dispatch({ type: "register", payload: [id, slideRef.current] });
      return () => dispatch({ type: "unregister", payload: id });
    }, [dispatch, id]);

    useIntersectionObserver({
      ref: slideRef,
      onIntersect: (isVisible) => {
        setIsVisible(isVisible);
      },
    });
    const SlideStyles = {
      "--carousel-slide-width":
        visibleSlides > 1
          ? `calc((100% / ${visibleSlides}) - var(--salt-spacing-200)/${visibleSlides})`
          : undefined,
      ...style,
    };
    const ref = useForkRef(refProp, slideRef);
    return (
      <div
        role="group"
        aria-roledescription="slide"
        aria-labelledby={ariaLabelledBy}
        id={id}
        className={clsx(withBaseName(), {
          [withBaseName("bordered")]: appearance === "bordered",
        })}
        style={SlideStyles}
        tabIndex={isVisible ? 0 : -1}
        hidden={!isVisible ? true : undefined}
        aria-hidden={!isVisible ? true : undefined}
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
              <span className={withBaseName("sr-only")}>
                {isVisible && `${slideCount} of ${slideCount}`}
              </span>
              {header}
              {children}
            </div>
            {actions && (
              <div
                className={clsx(withBaseName("actions"), {
                  [withBaseName("visible")]: isVisible,
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
