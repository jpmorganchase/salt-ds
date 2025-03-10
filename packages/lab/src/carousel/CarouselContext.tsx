import { createContext, useResizeObserver } from "@salt-ds/core";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface CarouselContextValue {
  firstVisibleSlide: number;
  visibleSlides: number;
  slidesCount: number;
  nextSlide: (event: MouseEvent | KeyboardEvent) => void;
  prevSlide: (event: MouseEvent | KeyboardEvent) => void;
  goToSlide: (index: number) => void;
  updateActiveFromScroll: (scrollLeft: number) => void;
  slides: Map<number, HTMLDivElement>;
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
    throw new Error("useCarousel must be used within carousel provider");
  }
  return context;
}

export function CarouselProvider({
  children,
  activeSlideIndex = 0,
  visibleSlides = 1,
  id,
}: {
  children: ReactNode;
  activeSlideIndex?: number;
  visibleSlides?: number;
  id?: string;
}) {
  const [firstVisibleSlide, setFirstVisibleSlide] = useState(activeSlideIndex);
  const [visibleFocus, setVisibleFocus] = useState(0);
  const [sliderW, setSliderW] = useState(0);
  const slides = useRef<Map<number, HTMLDivElement>>(new Map()).current;
  const [slidesCount, setSlidesCount] = useState(slides.size);
  const lastIndex = useRef(0);
  useEffect(() => {
    if (containerRef.current) {
      scrollToSlide(activeSlideIndex);
    }
  }, [activeSlideIndex]);

  const containerRef = useRef<HTMLDivElement>(null);

  const registerSlide = useCallback((element: HTMLDivElement) => {
    const assignedIndex = lastIndex.current++;
    slides.set(assignedIndex, element);
    setSlidesCount(slides.size);
    return assignedIndex;
  }, []);

  const unregisterSlide = useCallback((index: number) => {
    slides.delete(index);
    setSlidesCount(slides.size);
  }, []);

  const updateActiveFromScroll = (scrollLeft: number) => {
    const newIndex = Math.round(scrollLeft / (sliderW / visibleSlides)) || 0;
    if (newIndex !== firstVisibleSlide) {
      setFirstVisibleSlide(newIndex);
    }
  };

  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    setSliderW(containerRef.current.offsetWidth);
  }, []);

  useResizeObserver({ ref: containerRef, onResize: handleResize });

  const scrollToSlide = (index: number) => {
    if (!containerRef.current) return;
    const sliderWidth = containerRef.current.offsetWidth;
    const slideWidth = sliderWidth / visibleSlides;
    const targetScrollLeft = index * slideWidth;
    containerRef.current.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  };

  const focusSlide = (index: number) => {
    console.log(slides.get(index));
    slides.get(index)?.focus();
  };
  const goToSlide = (index: number) => scrollToSlide(index);

  const nextSlide = (event: MouseEvent | KeyboardEvent) => {
    const nextSlide = firstVisibleSlide + 1;
    if (!containerRef.current || nextSlide >= slidesCount) return;
    if (event.type !== "click") {
      const container = containerRef.current;
      const sliderWidth = container.offsetWidth;
      const slideWidth = sliderWidth / visibleSlides;
      const targetScrollLeft = nextSlide * slideWidth;
      const isFullyVisible =
        container.scrollLeft - targetScrollLeft - sliderWidth / visibleSlides <
        1;
      if (isFullyVisible) {
        focusSlide(nextSlide);
        if (visibleFocus < visibleSlides - 1) {
          setVisibleFocus((prev) => prev + 1);
        }
        return;
      }
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
        slidesCount,
        slides,
        focusSlide,
        firstVisibleSlide,
        registerSlide,
        unregisterSlide,
        nextSlide,
        prevSlide,
        goToSlide,
        containerRef,
        updateActiveFromScroll,
        carouselId: id,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
}
