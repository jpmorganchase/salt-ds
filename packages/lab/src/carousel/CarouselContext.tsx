import { createContext } from "@salt-ds/core";
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
  bordered: boolean;
  nextSlide: (event: SyntheticEvent) => void;
  prevSlide: (event: SyntheticEvent) => void;
  goToSlide: (index: number) => void;
  updateActiveFromScroll: (scrollLeft: number, sliderW: number) => void;
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
  bordered = false,
}: {
  children: ReactNode;
  activeSlideIndex?: number;
  bordered?: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState(activeSlideIndex);
  const [slides, setSlides] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const registerSlide = useCallback((slideId: string) => {
    setSlides((prev) => [...prev, slideId]);
  }, []);

  const updateActiveFromScroll = (scrollLeft: number, slideW: number) => {
    const newIndex = Math.round(scrollLeft / slideW) | 0;
    if (newIndex !== activeSlide) {
      setActiveSlide(newIndex);
    }
  };

  const scrollToSlide = (index: number) => {
    if (containerRef.current) {
      const slideW = containerRef.current.offsetWidth;
      containerRef.current.scrollTo({
        left: index * slideW,
        behavior: "smooth",
      });
    }
  };

  const goToSlide = (index: number) => scrollToSlide(index);
  const nextSlide = () => scrollToSlide(activeSlide + 1);
  const prevSlide = () => scrollToSlide(activeSlide - 1);

  return (
    <CarouselContext.Provider
      value={{
        slides,
        activeSlide,
        bordered,
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
