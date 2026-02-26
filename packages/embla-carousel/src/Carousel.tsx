import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useState,
} from "react";
import carouselCss from "./Carousel.css";
import {
  type CarouselAnnouncementTrigger,
  type CarouselAriaVariant,
  CarouselContext,
} from "./CarouselContext";

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
  /**
   * Get embla API instance, use this to manage the state of the Carousel
   **/
  getEmblaApi?: (embla: CarouselEmblaApiType) => void;
  /**
   * Disable screenreader announcing slide updates, defaults to false.
   */
  disableSlideAnnouncements?: boolean;
}

export const Carousel = forwardRef<HTMLElement, CarouselProps>(
  function Carousel(
    {
      children,
      className,
      disableSlideAnnouncements,
      emblaOptions = {},
      emblaPlugins = [],
      getEmblaApi,
      id,
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

    const carouselId = useId(id);

    useEffect(() => {
      if (emblaApi) {
        getEmblaApi?.(emblaApi);
      }
      return undefined;
    }, [emblaApi, getEmblaApi]);

    const [ariaVariant, setAriaVariant] =
      useState<CarouselAriaVariant>("group");
    const [announcementState, setAnnouncementState] = useState<
      CarouselAnnouncementTrigger | undefined
    >(undefined);

    return (
      <CarouselContext.Provider
        value={{
          ariaVariant,
          disableSlideAnnouncements,
          emblaApi,
          emblaRef,
          setAriaVariant,
          announcementState,
          setAnnouncementState,
          carouselId,
        }}
      >
        <section
          key={`carousel-${ariaVariant}}`}
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
