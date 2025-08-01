import { createContext } from "@salt-ds/core";
import { useContext } from "react";
import type { CarouselEmblaApiType, CarouselEmblaRefType } from "./Carousel";

export const CarouselAriaVariantValues = ["group", "tabpanel"] as const;
export type CarouselAriaVariant = (typeof CarouselAriaVariantValues)[number];

/**
 * Type definition for the Carousel context.
 * Provides access to the Embla Carousel API and reference.
 */
interface CarouselContextType {
  /**
   * The API instance of the Embla Carousel.
   * Provides methods to control the carousel programmatically.
   */
  emblaApi?: CarouselEmblaApiType;

  /**
   * The reference to the Embla Carousel viewport.
   * Used to directly interact with the carousel DOM element.
   */
  emblaRef?: CarouselEmblaRefType;
  /**
   * Aria variant for the Carousel.
   * When used with a `CarouselTabList` the screenreader will be presented as a `tablist` of tabpanels.
   * When used without a `CarouselTabList` the screenreader will be presented as a `group` of slides.
   */
  ariaVariant: CarouselAriaVariant;
  /**
   * Function to set the aria variant for the Carousel.
   */
  setAriaVariant: React.Dispatch<React.SetStateAction<CarouselAriaVariant>>;
  /**
   * `silenceNextAnnoucement` is used to prevent the next slide announcement from being read by screen readers.
   */
  silenceNextAnnoucement: boolean;
  /**
   * Function to silence the next annoucement.
   */
  setSilenceNextAnnoucement: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * Disable screenreader announcing slide updates, defaults to false.
   */
  disableSlideAnnouncements?: boolean;
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
