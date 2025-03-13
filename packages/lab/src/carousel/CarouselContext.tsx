import { createContext, useResizeObserver } from "@salt-ds/core";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface CarouselContextValue {
  firstVisibleSlide: number;
  visibleSlides: number;
  slideCount: number;
  nextSlide: (event: MouseEvent | KeyboardEvent) => void;
  prevSlide: (event: MouseEvent | KeyboardEvent) => void;
  updateFirstVisibleFromScroll: (scrollLeft: number) => void;
  focusSlide: (index: number) => void;
  registerSlide: (element: HTMLDivElement) => number;
  unregisterSlide: (index: number) => void;
  containerRef: RefObject<HTMLDivElement>;
  carouselId?: string;
}

export const CarouselContext = createContext<CarouselContextValue | null>(
  "CarouselContext",
  null,
);

export function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within CarouselProvider");
  }
  return context;
}

export function CarouselProvider({
  children,
  firstVisibleSlideIndex = 0,
  visibleSlides = 1,
  id,
}: {
  children: ReactNode;
  firstVisibleSlideIndex?: number;
  visibleSlides?: number;
  id?: string;
}) {
  const [firstVisibleSlide, setFirstVisibleSlide] = useState(
    firstVisibleSlideIndex,
  );
  const [visibleFocus, setVisibleFocus] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const slides = useRef<Map<number, HTMLDivElement>>(new Map());
  const [slideCount, setSlideCount] = useState(slides.current.size);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({
        left: firstVisibleSlideIndex * (container.offsetWidth / visibleSlides),
        behavior: "instant",
      });
    });
  }, [firstVisibleSlideIndex]);

  const containerRef = useRef<HTMLDivElement>(null);

  const registerSlide = useCallback((element: HTMLDivElement) => {
    const assignedIndex = slides.current.size;
    slides.current.set(assignedIndex, element);
    setSlideCount(assignedIndex + 1);
    return assignedIndex;
  }, []);

  const unregisterSlide = useCallback((index: number) => {
    slides.current.delete(index);
    setSlideCount(slides.current.size);
  }, []);

  const updateFirstVisibleFromScroll = (scrollLeft: number) => {
    const newIndex =
      Math.round(scrollLeft / (sliderWidth / visibleSlides)) || 0;
    if (newIndex !== firstVisibleSlide) {
      setFirstVisibleSlide(newIndex);
    }
  };

  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    setSliderWidth(containerRef.current.offsetWidth);
  }, []);

  useResizeObserver({ ref: containerRef, onResize: handleResize });

  const scrollToSlide = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const sliderWidth = container.offsetWidth;
    const slideWidth = sliderWidth / visibleSlides;
    const targetScrollLeft = index * slideWidth;
    containerRef.current.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  };

  const focusSlide = (index: number) => {
    slides.current.get(index)?.focus();
  };

  const nextSlide = (event: MouseEvent | KeyboardEvent) => {
    const nextSlide = firstVisibleSlide + 1;
    if (!containerRef.current || nextSlide >= slideCount) return;
    if (event.type !== "click") {
      focusSlide(nextSlide);
      if (visibleFocus < visibleSlides - 1) {
        setVisibleFocus((prev) => prev + 1);
      }
      return;
    }
    scrollToSlide(nextSlide);
  };

  const prevSlide = (event: MouseEvent | KeyboardEvent) => {
    const previousSlide = firstVisibleSlide - 1;
    if (!containerRef.current || firstVisibleSlide < 0) return;
    if (event.type !== "click") {
      if (visibleFocus >= 0) {
        focusSlide(previousSlide + visibleFocus);
        if (previousSlide === firstVisibleSlide) {
          setVisibleFocus((prev) => prev - 1);
        }
        return;
      }
      focusSlide(previousSlide);
    }
    scrollToSlide(previousSlide);
  };

  return (
    <CarouselContext.Provider
      value={{
        visibleSlides,
        slideCount,
        focusSlide,
        firstVisibleSlide,
        registerSlide,
        unregisterSlide,
        nextSlide,
        prevSlide,
        containerRef,
        updateFirstVisibleFromScroll,
        carouselId: id,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
}
