import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { type HTMLAttributes, forwardRef, useEffect } from "react";
import carouselCss from "./Carousel.css";
import { CarouselAnnouncement } from "./CarouselAnnouncementPlugin";
import { CarouselContext } from "./CarouselContext";

const withBaseName = makePrefixer("saltCarousel");

export type CarouselRef = UseEmblaCarouselType[0];
export type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
export type CarouselOptions = UseCarouselParameters[0];
export type CarouselPlugin = UseCarouselParameters[1];

/**
 * Props for the Carousel component.
 */
export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Options to configure the Embla Carousel.
   * These options are passed directly to the Embla Carousel instance.
   */
  emblaOptions?: CarouselOptions;

  /**
   * Plugins to enhance the functionality of the Embla Carousel.
   * These options are passed directly to the Embla Carousel instance.
   */
  emblaPlugins?: CarouselPlugin;

  /**
   * Callback function to set the Embla Carousel API.
   * This function is called with the Embla Carousel API instance.
   * Use this to manage the state of the Carousel
   */
  setApi?: (api: CarouselApi) => void;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      children,
      className,
      emblaOptions = {},
      emblaPlugins = [],
      setApi,
      ...rest
    },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel",
      css: carouselCss,
      window: targetWindow,
    });

    const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [
      CarouselAnnouncement(),
      ...emblaPlugins,
    ]);

    useEffect(() => {
      if (!emblaApi || !setApi) {
        return;
      }
      setApi(emblaApi);
    }, [emblaApi, setApi]);

    return (
      <CarouselContext.Provider value={{ emblaApi, emblaRef }}>
        <section
          aria-roledescription="carousel"
          role="region"
          className={clsx(withBaseName(), className)}
          {...rest}
        >
          {children}
        </section>
      </CarouselContext.Provider>
    );
  },
);
