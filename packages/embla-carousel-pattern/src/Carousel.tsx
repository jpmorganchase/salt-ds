import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import {
  type ComponentPropsWithoutRef,
  type MutableRefObject,
  forwardRef,
  useEffect,
} from "react";
import carouselCss from "./Carousel.css";
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
export interface CarouselProps extends ComponentPropsWithoutRef<"div"> {
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
   * Ref to return the Embla Carousel API.
   * Use this to manage the state of the Carousel
   */
  emblaApiRef?: MutableRefObject<CarouselApi | undefined>;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      children,
      className,
      emblaOptions = {},
      emblaPlugins = [],
      emblaApiRef,
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
      ...emblaPlugins,
    ]);

    useEffect(() => {
      if (!emblaApi || !emblaApiRef) {
        return;
      }
      emblaApiRef.current = emblaApi;
    }, [emblaApiRef, emblaApi]);

    return (
      <CarouselContext.Provider value={{ emblaApi, emblaRef }}>
        <section
          aria-roledescription="carousel"
          role="region"
          className={clsx(withBaseName(), className)}
          ref={ref}
          {...rest}
        >
          {children}
        </section>
      </CarouselContext.Provider>
    );
  },
);
