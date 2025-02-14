import { createContext, useResizeObserver } from "@salt-ds/core";
import {
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export interface CarouselContextValue {
  activeSlide: number;
  visibleSlides: number;
  nextSlide: (event: SyntheticEvent) => void;
  prevSlide: (event: SyntheticEvent) => void;
  goToSlide: (index: number) => void;
  updateActiveFromScroll: (scrollLeft: number) => void;
  slides: string[];
  registerSlide: (slideId: string) => void;
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
  const [activeSlide, setActiveSlide] = useState(activeSlideIndex);
  const [slides, setSlides] = useState<string[]>([]);
  const [sliderW, setSliderW] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const registerSlide = useCallback((slideId: string) => {
    setSlides((prev) => [...prev, slideId]);
  }, []);

  const updateActiveFromScroll = (scrollLeft: number) => {
    const newIndex =
      Math.round(scrollLeft / (sliderW / visibleSlides)) | activeSlideIndex;
    if (newIndex !== activeSlide) {
      setActiveSlide(newIndex);
    }
  };

  const handleResize = useCallback(() => {
    if (!containerRef.current) return;
    if (containerRef.current) {
      setSliderW(containerRef.current.offsetWidth);
    }
  }, [containerRef]);

  useResizeObserver({ ref: containerRef, onResize: handleResize });

  const scrollToSlide = (index: number) => {
    if (containerRef.current) {
      const slideW = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: index * (slideW / visibleSlides),
        behavior: "smooth",
      });
    }
  };

  const goToSlide = (index: number) => scrollToSlide(index);
  const nextSlide = () => scrollToSlide(activeSlide + visibleSlides);
  const prevSlide = () => scrollToSlide(activeSlide - visibleSlides);

  return (
    <CarouselContext.Provider
      value={{
        visibleSlides,
        slides,
        activeSlide,
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
