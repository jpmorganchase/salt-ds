import { createContext, useResizeObserver } from "@salt-ds/core";
import {
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface CarouselContextValue {
  firstVisibleSlide: number;
  visibleSlides: number;
  nextSlide: (event: SyntheticEvent) => void;
  prevSlide: (event: SyntheticEvent) => void;
  goToSlide: (index: number) => void;
  updateActiveFromScroll: (scrollLeft: number) => void;
  slideRefs: RefObject<HTMLDivElement>[];
  focusSlide: (index: number) => void;
  registerSlide: (ref: RefObject<HTMLDivElement>) => void;
  containerRef: RefObject<HTMLDivElement>;
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
}: {
  children: ReactNode;
  activeSlideIndex?: number;
  visibleSlides?: number;
}) {
  const [firstVisibleSlide, setFirstVisibleSlide] = useState(activeSlideIndex);
  const [visibleFocus, setVisibleFocus] = useState(0);
  const [sliderW, setSliderW] = useState(0);
  const slideRefs = useRef<Array<RefObject<HTMLDivElement>>>([]).current;
  useEffect(() => {
    if (containerRef.current) {
      scrollToSlide(activeSlideIndex);
    }
  }, [activeSlideIndex]);

  const containerRef = useRef<HTMLDivElement>(null);

  const registerSlide = useCallback(
    (ref: RefObject<HTMLDivElement>) => {
      slideRefs.push(ref);
    },
    [slideRefs],
  );

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
    slideRefs[index]?.current?.focus();
  };
  const goToSlide = (index: number) => scrollToSlide(index);

  const nextSlide = (event: SyntheticEvent) => {
    const nextSlide = firstVisibleSlide + 1;
    if (!containerRef.current || nextSlide >= slideRefs.length) return;
    if (event.type !== "click") {
      const container = containerRef.current;
      const sliderWidth = container.offsetWidth;
      const slideWidth = sliderWidth / visibleSlides;
      const targetScrollLeft = nextSlide * slideWidth;
      if (
        container.scrollLeft - targetScrollLeft - sliderWidth / visibleSlides <
        1
      ) {
        focusSlide(nextSlide);
        if (visibleFocus < visibleSlides - 1) {
          setVisibleFocus((prev) => prev + 1);
        }
        return;
      }
    }
    scrollToSlide(nextSlide);
  };

  const prevSlide = (event: SyntheticEvent) => {
    const previousSlide = firstVisibleSlide - 1;
    if (!containerRef.current || previousSlide < 0) return;
    if (event.type !== "click") {
      if (visibleFocus > 0) {
        focusSlide(previousSlide + visibleFocus);
        // TODO: fix: this should only happen once it returns to the fist page
        // setVisibleFocus((prev) => prev - 1);
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
        slideRefs,
        focusSlide,
        firstVisibleSlide,
        registerSlide,
        nextSlide,
        prevSlide,
        goToSlide,
        containerRef,
        updateActiveFromScroll,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
}
