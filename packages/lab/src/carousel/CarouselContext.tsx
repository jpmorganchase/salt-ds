import { createContext } from "@salt-ds/core";
import {
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useContext,
  useRef,
  useState,
} from "react";

export interface CarouselContextValue {
  activeSlide: number;
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

export function CarouselProvider({ children }: { children: ReactNode }) {
  // TODO: check active slide to initialy set the carousel prop
  const [activeSlide, setActiveSlide] = useState(0);
  const [slides, setSlides] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const registerSlide = (slideId: string) => {
    setSlides((prev) => [...prev, slideId]);
  };

  const updateActiveFromScroll = (scrollLeft: number, slideW: number) => {
    const newIndex = Math.round(scrollLeft / slideW);
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
    setActiveSlide(index);
  };
  const nextSlide = () => scrollToSlide(activeSlide + 1);
  const prevSlide = () => scrollToSlide(activeSlide - 1);
  const goToSlide = (index: number) => scrollToSlide(index);

  return (
    <CarouselContext.Provider
      value={{
        activeSlide,
        nextSlide,
        updateActiveFromScroll,
        prevSlide,
        goToSlide,
        slides,
        registerSlide,
        containerRef,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
}
