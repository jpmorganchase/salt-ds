import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  forwardRef,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import carouselSlidesCss from "./CarouselSlides.css";

/**
 * Props for the CarouselSlides component.
 */
export interface CarouselSlidesProps extends HTMLAttributes<HTMLDivElement> {}

const withBaseName = makePrefixer("saltCarouselSlides");

export const CarouselSlides = forwardRef<HTMLDivElement, CarouselSlidesProps>(
  function CarouselSlides(
    { children, className, onKeyDown, ...rest },
    propRef,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slider",
      css: carouselSlidesCss,
      window: targetWindow,
    });
    const { emblaApi, emblaRef } = useCarouselContext();

    const ref = useForkRef(propRef, emblaRef) as Ref<HTMLDivElement>;

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) {
        return;
      }
      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          emblaApi?.scrollPrev();
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          emblaApi?.scrollNext();
          break;
        }
      }
      onKeyDown?.(event);
    };

    return (
      <div
        onKeyDownCapture={handleKeyDown}
        ref={ref}
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        <div className={withBaseName("container")}>{children}</div>
      </div>
    );
  },
);
