import { createContext } from "@salt-ds/core";
import { type SyntheticEvent, useContext } from "react";

export interface CarouselContextValue {
  activeSlide: number;

  nextSlide: (event: SyntheticEvent) => void;
  prevSlide: (event: SyntheticEvent) => void;
  goToSlide: (index: number) => void;
  slides: string[];
  registerSlide: (slideId: string) => void;
}

export const CarouselContext = createContext<CarouselContextValue>(
  "CarouselContext",
  {
    activeSlide: 0,
    nextSlide: () => undefined,
    prevSlide: () => undefined,
    goToSlide: () => undefined,
    slides: [],
    registerSlide: () => undefined,
  },
);

export function useCarousel() {
  return useContext(CarouselContext);
}
