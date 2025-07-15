import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCarouselContext } from "./CarouselContext";
import carouselSlidesCss from "./CarouselSlides.css";
import { createCustomSettle } from "./createCustomSettle";
import { getVisibleSlideDescriptions } from "./getVisibleSlideDescriptions";

/**
 * Props for the CarouselSlides component.
 */
export interface CarouselSlidesProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCarouselSlides");

export const CarouselSlides = forwardRef<HTMLDivElement, CarouselSlidesProps>(
  function CarouselSlides({ children, className, onKeyDown, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-slides",
      css: carouselSlidesCss,
      window: targetWindow,
    });
    const { emblaApi, emblaRef } = useCarouselContext();

    const carouselRef = useForkRef<HTMLDivElement>(ref, emblaRef);

    const usingArrowNavigation = useRef<boolean>();
    const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

    useEffect(() => {
      const handleSettle = (emblaApi: EmblaCarouselType) => {
        const selectedScrollSnap = emblaApi?.selectedScrollSnap() ?? 0;
        const contentDescriptions = getVisibleSlideDescriptions(
          emblaApi,
          selectedScrollSnap,
        );
        const announcement =
          contentDescriptions?.length > 1
            ? `Currently visible slides: ${contentDescriptions.join(", ")}`
            : contentDescriptions[0];
        setLiveAnnouncement(announcement);
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

    return (
      <>
        <div
          aria-live={"off"}
          onKeyDown={handleKeyDown}
          ref={carouselRef}
          className={clsx(withBaseName(), className)}
          tabIndex={0}
          {...rest}
        >
          <div
            className={withBaseName("container")}
            onKeyDown={handleContainerKeyDown}
          >
            {children}
          </div>
        </div>
        <div aria-live="polite" className={withBaseName("sr-only")}>
          {liveAnnouncement}
        </div>
      </>
    );
  },
);
