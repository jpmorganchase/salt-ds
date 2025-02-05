import { createContext } from "@salt-ds/core";
import {
  type ReactNode,
  type SyntheticEvent,
  useContext,
  useState,
} from "react";

export interface CarouselContextValue {
  activeSlide: number;
  nextSlide: (event: SyntheticEvent) => void;
  prevSlide: (event: SyntheticEvent) => void;
  goToSlide: (index: number) => void;
  slides: string[];
  registerSlide: (slideId: string) => void;
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

  const registerSlide = (slideId: string) => {
    setSlides((prev) => [...prev, slideId]);
  };
  const scrollToSlide = (index: number) => {
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
        prevSlide,
        goToSlide,
        slides,
        registerSlide,
      }}
    >
      {children}
    </CarouselContext.Provider>
  );
}
