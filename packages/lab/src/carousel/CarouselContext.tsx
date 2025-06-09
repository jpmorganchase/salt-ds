import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import type { CarouselApi, CarouselRef } from "./Carousel";

/**
 * Type definition for the Carousel context.
 * Provides access to the Embla Carousel API and reference.
 */
interface CarouselContextType {
  /**
   * The API instance of the Embla Carousel.
   * Provides methods to control the carousel programmatically.
   */
  emblaApi?: CarouselApi;

  /**
   * The reference to the Embla Carousel viewport.
   * Used to directly interact with the carousel DOM element.
   */
  emblaRef?: CarouselRef;
}

export const CarouselContext = createContext<CarouselContextType | undefined>(
  "CarouselContext",
  undefined,
);

export const useCarouselContext = (): CarouselContextType => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error(
      "useCarouselContext must be used within a CarouselProvider",
    );
  }
  return context;
};
