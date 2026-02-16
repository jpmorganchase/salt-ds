import { makePrefixer, useAriaAnnouncer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import type { EmblaCarouselType } from "embla-carousel";
import {
  Children,
  type ComponentPropsWithoutRef,
  cloneElement,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type MouseEventHandler,
  type ReactElement,
  useEffect,
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
  "focus",
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

    const containerRef = useRef<HTMLDivElement>(null);
    const forkedEmblaRef = useForkRef<HTMLDivElement>(ref, emblaRef);
    const carouselRef = useForkRef<HTMLDivElement>(
      forkedEmblaRef,
      containerRef,
    );

    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [focusedSlideIndex, setFocusedSlideIndex] = useState<number>(-1);
    const [dragging, setDragging] = useState(false);
    const focusOnSettle = useRef<boolean>(false);

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
        const numberOfSnaps = emblaApi?.scrollSnapList().length ?? 1;
        const numberOfSlidesPerSnap = slideRefs.current.length / numberOfSnaps;
        const settledSlideIndex = Math.floor(
          selectedScrollSnap * numberOfSlidesPerSnap,
        );
        setFocusedSlideIndex(settledSlideIndex);
        if (focusOnSettle.current) {
          slideRefs.current[settledSlideIndex]?.focus();
          setAnnouncementState("focus");
          focusOnSettle.current = false;
        }
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

    useEffect(() => {
      const numberOfSnaps = emblaApi?.scrollSnapList().length ?? 1;
      const numberOfSlidesPerSnap = slideRefs.current.length / numberOfSnaps;
      if (focusedSlideIndex >= 0) {
        const nearestScrollSnap = Math.floor(
          focusedSlideIndex / numberOfSlidesPerSnap,
        );
        if (emblaApi?.selectedScrollSnap() !== nearestScrollSnap) {
          emblaApi?.scrollTo(nearestScrollSnap);
          focusOnSettle.current = true;
        }
      } else if (focusedSlideIndex === -1) {
        const initialSnap = emblaApi?.selectedScrollSnap();
        const initialSlideIndex =
          initialSnap !== undefined
            ? Math.floor(initialSnap * numberOfSlidesPerSnap)
            : 0;
        setFocusedSlideIndex(initialSlideIndex);
        setStableScrollSnap(initialSnap);
      }
    }, [focusedSlideIndex, emblaApi]);

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
      if (!emblaApi) return;

      const numberOfSnaps = emblaApi.scrollSnapList().length ?? 1;
      const numberOfSlidesPerSnap = slideRefs.current.length / numberOfSnaps;
      const currentSnap = Math.floor(focusedSlideIndex / numberOfSlidesPerSnap);
      let newSnap = currentSnap;

      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          newSnap = event.repeat ? 0 : Math.max(currentSnap - 1, 0);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          newSnap = event.repeat
            ? numberOfSnaps - 1
            : Math.min(currentSnap + 1, numberOfSnaps - 1);
          break;
        }
        default:
          return;
      }

      emblaApi.scrollTo(newSnap);
      focusOnSettle.current = true;
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
            const childElement = child as ReactElement;
            const existingId = childElement.props.id;
            const isFocused = focusedSlideIndex === index;
            const isHidden =
              !visibleSlideIndexes.includes(index + 1) && !isFocused;
            const element = child as ReactElement;
            return cloneElement(element, {
              "aria-hidden": isHidden,
              id: existingId ?? `${carouselId}-slide${index + 1}`,
              onFocus: (event: FocusEvent) => {
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
