import { makePrefixer, useAriaAnnouncer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import {
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import carouselSlidesCss from "./CarouselSlides.css";
import { createCustomSettle } from "./createCustomSettle";
import { getVisibleSlideDescription } from "./getVisibleSlideDescription";
import { getVisibleSlideIndexes } from "./getVisibleSlideIndexes";

const SR_DELAY = 1200;

/**
 * Props for the CarouselSlides component.
 */
export interface CarouselSlidesProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCarouselSlides");

export const CarouselSlides = forwardRef<HTMLDivElement, CarouselSlidesProps>(
  function CarouselSlides(
    { children, className, id, onKeyDown, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slides",
      css: carouselSlidesCss,
      window: targetWindow,
    });
    const {
      disableSlideAnnouncements,
      emblaApi,
      emblaRef,
      silenceNextAnnoucement,
      setSilenceNextAnnoucement,
      carouselId,
    } = useCarouselContext();

    const carouselRef = useForkRef<HTMLDivElement>(ref, emblaRef);

    const usingArrowNavigation = useRef<boolean>();
    const [stableScrollSnap, setStableScrollSnap] = useState<
      number | undefined
    >(undefined);

    const { announce } = useAriaAnnouncer();

    useEffect(() => {
      const handleSettle = (emblaApi: EmblaCarouselType) => {
        const selectedScrollSnap = emblaApi?.selectedScrollSnap() ?? 0;
        setStableScrollSnap(selectedScrollSnap);
      };

      if (!emblaApi) {
        return;
      }
      const scrollCallback = createCustomSettle(handleSettle);
      emblaApi.on("scroll", scrollCallback);
      // Cleanup listener on component unmount
      return () => {
        emblaApi.off("scroll", scrollCallback);
      };
    }, [emblaApi]);

    useEffect(() => {
      if (
        stableScrollSnap === undefined ||
        silenceNextAnnoucement ||
        disableSlideAnnouncements
      ) {
        setSilenceNextAnnoucement(false);
        return;
      }
      const announcement = getVisibleSlideDescription(
        emblaApi,
        stableScrollSnap,
      );
      announce(announcement, SR_DELAY);
    }, [
      announce,
      disableSlideAnnouncements,
      silenceNextAnnoucement,
      stableScrollSnap,
      emblaApi,
    ]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) {
        return;
      }
      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          emblaApi?.scrollPrev();
          usingArrowNavigation.current = true;
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          emblaApi?.scrollNext();
          usingArrowNavigation.current = true;
          break;
        }
      }
      onKeyDown?.(event);
    };

    const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.stopPropagation();
      }
    };

    const visibleSlideIndexes = getVisibleSlideIndexes(
      emblaApi,
      stableScrollSnap ?? 0,
    );

    return (
      <>
        <div
          onKeyDown={handleKeyDown}
          ref={carouselRef}
          className={clsx(withBaseName(), className)}
          {...rest}
        >
          <div
            className={withBaseName("container")}
            onKeyDown={handleContainerKeyDown}
            id={id ?? `${carouselId}-slides`}
          >
            {Children.map(children, (child, index) => {
              const childElement = child as React.ReactElement;
              const existingId = childElement.props.id;
              return cloneElement(child as React.ReactElement, {
                "aria-hidden": !visibleSlideIndexes.includes(index + 1),
                id: existingId ?? `${carouselId}-slide${index + 1}`,
              });
            })}
          </div>
        </div>
      </>
    );
  },
);
