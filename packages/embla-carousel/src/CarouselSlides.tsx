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
  type MouseEventHandler,
  type SyntheticEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  type CarouselAnnouncementTrigger,
  useCarouselContext,
} from "./CarouselContext";
import carouselSlidesCss from "./CarouselSlides.css";
import { createCustomSettle } from "./createCustomSettle";
import { getVisibleSlideDescription } from "./getVisibleSlideDescription";
import { getVisibleSlideIndexes } from "./getVisibleSlideIndexes";

const ANNOUNCEMENT_DURATION = 1200;

/**
 * Props for the CarouselSlides component.
 */
export interface CarouselSlidesProps extends ComponentPropsWithoutRef<"div"> {}

const withBaseName = makePrefixer("saltCarouselSlides");

const announceSlideChangesFrom: CarouselAnnouncementTrigger[] = [
  "drag",
  "navigation",
];

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
      announcementState,
      setAnnouncementState,
      emblaApi,
      emblaRef,
      carouselId,
    } = useCarouselContext();

    const carouselRef = useForkRef<HTMLDivElement>(ref, emblaRef);

    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [focusSlideIndex, setFocusedSlideIndex] = useState<number>(-1);
    const [dragging, setDragging] = useState(false);

    const [stableScrollSnap, setStableScrollSnap] = useState<
      number | undefined
    >(undefined);

    const visibleSlideIndexes = getVisibleSlideIndexes(
      emblaApi,
      stableScrollSnap ?? 0,
    );
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
      const pointerDownCallback = () => {
        setAnnouncementState("drag");
      };
      emblaApi.on("scroll", scrollCallback);
      emblaApi.on("pointerDown", pointerDownCallback);
      // Cleanup listener on component unmount
      return () => {
        emblaApi.off("scroll", scrollCallback);
        emblaApi.off("pointerDown", pointerDownCallback);
      };
    }, [emblaApi, setAnnouncementState]);

    useLayoutEffect(() => {
      if (focusSlideIndex >= 0) {
        const numberOfSnaps = emblaApi?.scrollSnapList().length ?? 1;
        const numberOfSlidesPerSnap = slideRefs.current.length / numberOfSnaps;
        const nearestScrollSnap = Math.floor(
          focusSlideIndex / numberOfSlidesPerSnap,
        );
        if (emblaApi?.selectedScrollSnap() !== nearestScrollSnap) {
          setAnnouncementState("focus");
          emblaApi?.scrollTo(nearestScrollSnap);
        }
        setTimeout(() => {
          slideRefs.current[focusSlideIndex]?.focus();
        }, 0);
      }
    }, [focusSlideIndex, emblaApi, setAnnouncementState]);

    useEffect(() => {
      if (disableSlideAnnouncements === false) {
        setAnnouncementState(undefined);
      }
    }, [disableSlideAnnouncements, setAnnouncementState]);

    useEffect(() => {
      if (
        stableScrollSnap === undefined ||
        disableSlideAnnouncements ||
        !announcementState ||
        announceSlideChangesFrom.indexOf(announcementState) === -1
      ) {
        return;
      }
      const announcement = getVisibleSlideDescription(
        emblaApi,
        stableScrollSnap,
      );
      announce(announcement, ANNOUNCEMENT_DURATION);
    }, [
      announce,
      announcementState,
      disableSlideAnnouncements,
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
          setFocusedSlideIndex((prevState) => Math.max(prevState - 1, 0));
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          setFocusedSlideIndex((prevState) =>
            Math.min(prevState + 1, slideRefs.current.length - 1),
          );
          break;
        }
      }
      onKeyDown?.(event);
    };

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
      setDragging(true);
      rest.onMouseDown?.(event);
    };
    const handleMouseUp: MouseEventHandler<HTMLDivElement> = (event) => {
      setDragging(false);
      rest.onMouseUp?.(event);
    };

    return (
      <div
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={carouselRef}
        className={clsx(
          withBaseName(),
          { [withBaseName("dragging")]: dragging },
          className,
        )}
        {...rest}
      >
        <div
          className={withBaseName("container")}
          id={id ?? `${carouselId}-slides`}
        >
          {Children.map(children, (child, index) => {
            const childElement = child as React.ReactElement;
            const existingId = childElement.props.id;
            const isHidden = !visibleSlideIndexes.includes(index + 1);
            const element = child as React.ReactElement;
            return cloneElement(element, {
              "aria-hidden": isHidden,
              id: existingId ?? `${carouselId}-slide${index + 1}`,
              onMouseDown: (event: SyntheticEvent) => event.preventDefault(),
              onFocus: (event: FocusEvent) => {
                event.preventDefault();
                setFocusedSlideIndex(index);
                element.props?.onFocus?.(event);
              },
              tabIndex: !isHidden ? 0 : -1,
              ref: (el: HTMLDivElement) => {
                slideRefs.current[index] = el;
              },
            });
          })}
        </div>
      </div>
    );
  },
);
