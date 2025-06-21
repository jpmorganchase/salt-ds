import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import carouselCss from "./Carousel.css";
import { CarouselContext } from "./CarouselContext";

const withBaseName = makePrefixer("saltCarousel");

export type CarouselRef = {
  emblaApi: UseEmblaCarouselType[1];
  emblaRef: UseEmblaCarouselType[0];
};

type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
export type CarouselOptions = UseCarouselParameters[0];
export type CarouselPlugin = UseCarouselParameters[1];

/**
 * Props for the Carousel component.
 * Pass a ref to the carousel to get it to return a reference to the embla API
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
}

export const Carousel = forwardRef<CarouselRef, CarouselProps>(
  function Carousel(
    { children, className, emblaOptions = {}, emblaPlugins = [], ...rest },
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

    useImperativeHandle(ref, () => ({ emblaApi, emblaRef }), [
      emblaApi,
      emblaRef,
    ]);

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
