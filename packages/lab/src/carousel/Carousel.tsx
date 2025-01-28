import {
  Button,
  RadioButton,
  RadioButtonGroup,
  makePrefixer,
  useIcon,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ChangeEventHandler,
  Children,
  type HTMLAttributes,
  type ReactElement,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";
import { CarouselContext } from "./CarouselContext";
import type { CarouselSlideProps } from "./CarouselSlide";

import carouselCss from "./Carousel.css";

const withBaseName = makePrefixer("saltCarousel");

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The initial Index enables you to select the active slide in the carousel.
   * Optional, default 0.
   **/
  activeSlideIndex?: number;
  /**
   * The animation when the slides are shown.
   * Optional. Defaults to `slide`
   **/
  animation?: "slide" | "fade";
  /**
   * If this props is passed it will set the aria-label with value to the carousel container.
   * Optional. Defaults to undefined
   */
  carouselDescription?: string;
  /**
   * Collection of slides to render
   * Component must implement CarouselSlideProps. Mandatory.
   */
  children: Array<ReactElement<CarouselSlideProps>>;
  /**
   * This prop will enable compact / reduced width mode.
   * The navigation buttons would be part of indicators
   * Optional. Defaults to false
   **/
  compact?: boolean;
}

export const Carousel = forwardRef<HTMLDivElement, CarouselProps>(
  function Carousel(
    {
      activeSlideIndex = 0,
      animation = "slide",
      carouselDescription,
      children,
      className,
      compact,
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
    const { NextIcon, PreviousIcon } = useIcon();

    const containerRef = useRef<HTMLDivElement>(null);
    const slidesCount = Children.count(children);
    const [activeSlide, setActiveSlide] = useState(activeSlideIndex);
    const [slides, setSlides] = useState<string[]>([]);

    const registerSlide = (slideId: string) => {
      setSlides((prev) => [...prev, slideId]);
    };

    const scrollToSlide = (index: number) => {
      if (containerRef.current) {
        const slideW = containerRef.current.offsetWidth;
        containerRef.current.scrollTo({
          left: index * slideW,
          behavior: "smooth",
        });
        setActiveSlide(index);
      }
    };
    const nextSlide = () => scrollToSlide(activeSlide + 1);
    const prevSlide = () => scrollToSlide(activeSlide - 1);
    const goToSlide = (index: number) => scrollToSlide(index);

    // TODO: implement on scroll
    const handleRadioChange: ChangeEventHandler<HTMLInputElement> = ({
      target: { value },
    }) => {
      goToSlide(Number(value));
    };

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (slidesCount < 1) {
          console.warn(
            "Carousel component requires more than one children to render. At least two elements should be provided.",
          );
        }
      }
    }, [slidesCount]);

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
        <div
          aria-label={carouselDescription}
          aria-roledescription="carousel"
          role="region"
          ref={ref}
          className={clsx(
            withBaseName(),
            compact && withBaseName("compact"),
            className,
          )}
          {...rest}
        >
          <Button
            appearance="transparent"
            sentiment="neutral"
            className={withBaseName("prev-button")}
            onClick={prevSlide}
            disabled={activeSlide === 0}
          >
            <PreviousIcon size={2} />
          </Button>
          <div
            ref={containerRef}
            className={withBaseName("scroll")}
            aria-live="polite"
          >
            {children}
          </div>
          <Button
            appearance="transparent"
            sentiment="neutral"
            className={withBaseName("next-button")}
            onClick={nextSlide}
            disabled={activeSlide === slidesCount - 1}
          >
            <NextIcon size={2} />
          </Button>
          <div className={withBaseName("dots")}>
            <RadioButtonGroup
              aria-label="Carousel buttons"
              onChange={handleRadioChange}
              value={`${activeSlide}`}
              direction={"horizontal"}
            >
              {Array.from({ length: slidesCount }, (_, index) => ({
                value: `${index}`,
              })).map((radio) => (
                <RadioButton {...radio} key={radio.value} />
              ))}
            </RadioButtonGroup>
          </div>
        </div>
      </CarouselContext.Provider>
    );
  },
);
