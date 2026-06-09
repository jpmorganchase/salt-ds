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
    const pendingFocusIndex = useRef<number | null>(null);
    const hasSettled = useRef<boolean>(false);

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
        if (hasSettled.current) return;
        hasSettled.current = true;

        const selectedScrollSnap = emblaApi?.selectedScrollSnap() ?? 0;
        setStableScrollSnap(selectedScrollSnap);
        const numberOfSnaps = emblaApi?.scrollSnapList().length ?? 1;
        const numberOfSlides = slideRefs.current.length;
        const numberOfSlidesPerSnap = Math.ceil(numberOfSlides / numberOfSnaps);
        const settledSlideIndex =
          pendingFocusIndex.current ??
          Math.min(
            selectedScrollSnap * numberOfSlidesPerSnap,
            numberOfSlides - 1,
          );
        pendingFocusIndex.current = null;
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
      const selectCallback = () => {
        hasSettled.current = false;
      };
      const pointerDownCallback = () => {
        setAnnouncementState("drag");
      };
      emblaApi.on("scroll", scrollCallback);
      emblaApi.on("select", selectCallback);
      emblaApi.on("pointerDown", pointerDownCallback);
      // Cleanup listener on component unmount
      return () => {
        emblaApi.off("scroll", scrollCallback);
        emblaApi.off("select", selectCallback);
        emblaApi.off("pointerDown", pointerDownCallback);
      };
    }, [emblaApi, setAnnouncementState]);

    useEffect(() => {
      if (!emblaApi) return;

      const numberOfSnaps = emblaApi.scrollSnapList().length;
      if (numberOfSnaps === 0) return;

      const numberOfSlides = slideRefs.current.length;
      const numberOfSlidesPerSnap = Math.ceil(numberOfSlides / numberOfSnaps);

      if (focusedSlideIndex >= 0) {
        const currentSnap = emblaApi.selectedScrollSnap();
        const currentVisibleIndexes = getVisibleSlideIndexes(
          emblaApi,
          currentSnap,
        );

        // Don't scroll if the focused slide is already visible in the current snap
        if (!currentVisibleIndexes.includes(focusedSlideIndex + 1)) {
          const nearestScrollSnap = Math.min(
            Math.floor(focusedSlideIndex / numberOfSlidesPerSnap),
            numberOfSnaps - 1,
          );
          if (currentSnap !== nearestScrollSnap) {
            emblaApi.scrollTo(nearestScrollSnap);
            focusOnSettle.current = true;
          }
        }
      } else if (focusedSlideIndex === -1) {
        const initialSnap = emblaApi.selectedScrollSnap();
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
      onKeyDown?.(event);

      if (!emblaApi) return;

      const numberOfSnaps = emblaApi.scrollSnapList().length;

      if (numberOfSnaps === 0) return;

      const numberOfSlides = slideRefs.current.length;
      const numberOfSlidesPerSnap = Math.ceil(numberOfSlides / numberOfSnaps);

      let newFocusIndex = focusedSlideIndex;

      switch (event.key) {
        case "ArrowLeft": {
          event.preventDefault();
          newFocusIndex = Math.max(focusedSlideIndex - 1, 0);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          newFocusIndex = Math.min(focusedSlideIndex + 1, numberOfSlides - 1);
          break;
        }
        default:
          return;
      }

      if (newFocusIndex === focusedSlideIndex) return;

      const currentSnap = emblaApi.selectedScrollSnap();
      const currentVisibleIndexes = getVisibleSlideIndexes(
        emblaApi,
        currentSnap,
      );

      if (currentVisibleIndexes.includes(newFocusIndex + 1)) {
        // Slide is already visible in current snap - move focus directly without scrolling
        setFocusedSlideIndex(newFocusIndex);
        slideRefs.current[newFocusIndex]?.focus({ preventScroll: true });
        setAnnouncementState("focus");
      } else {
        // Different group - scroll first, then focus on settle
        const targetSnap = Math.floor(newFocusIndex / numberOfSlidesPerSnap);
        hasSettled.current = false;
        pendingFocusIndex.current = newFocusIndex;
        emblaApi.scrollTo(targetSnap);
        focusOnSettle.current = true;
      }
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
            const isVisible = visibleSlideIndexes.includes(index + 1);
            const isHidden = !isVisible && !isFocused;
            const element = child as ReactElement;
            return cloneElement(element, {
              "aria-hidden": isHidden,
              id: existingId ?? `${carouselId}-slide${index + 1}`,
              onFocus: (event: FocusEvent) => {
                setFocusedSlideIndex(index);
                element.props?.onFocus?.(event);
              },
              // Only visible slides are tabbable. overflow:clip on the container
              // prevents native browser scroll, and watchFocus:false on Embla
              // prevents Embla from scrolling on Tab-triggered focus.
              tabIndex: isVisible ? 0 : -1,
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
