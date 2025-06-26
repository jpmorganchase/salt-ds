import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { type ComponentPropsWithoutRef, forwardRef, useEffect } from "react";
import carouselCss from "./Carousel.css";
import { CarouselContext } from "./CarouselContext";

const withBaseName = makePrefixer("saltCarousel");

export type CarouselEmblaRefType = UseEmblaCarouselType[0];
export type CarouselEmblaApiType = UseEmblaCarouselType[1];

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
export type CarouselOptions = UseCarouselParameters[0];
export type CarouselPlugin = UseCarouselParameters[1];

/**
 * Props for the Carousel component.
 * Pass a ref to the carousel to get it to return a reference to the embla API
 */
export interface CarouselProps extends ComponentPropsWithoutRef<"section"> {
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
  /** Get embla API as ref, use this to manage the state of the Carousel */
  getEmblaApi?: (embla: CarouselEmblaApiType) => void;
}

export const Carousel = forwardRef<HTMLElement, CarouselProps>(
  function Carousel(
    {
      children,
      className,
      emblaOptions = {},
      emblaPlugins = [],
      getEmblaApi,
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
      if (emblaApi) {
        getEmblaApi?.(emblaApi);
      }
      return undefined;
    }, [emblaApi]);

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
