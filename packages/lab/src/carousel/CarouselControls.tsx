import {
  Button,
  makePrefixer,
  RadioButton,
  RadioButtonGroup,
  useIcon,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { forwardRef, type HTMLAttributes } from "react";
import { useCarousel } from "./CarouselContext";

import carouselControlsCss from "./CarouselControls.css";

const withBaseName = makePrefixer("saltCarousel");

export interface CarouselControlsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * This prop will enable compact / reduced width mode.
   * The navigation buttons would be part of indicators
   * Optional. Defaults to false
   **/
  compact?: boolean;
}

export const CarouselControls = forwardRef<
  HTMLDivElement,
  CarouselControlsProps
>(function CarouselControls({ children, className, compact, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });
  const { slides, activeSlide, nextSlide, prevSlide, goToSlide } =
    useCarousel();
  const { NextIcon, PreviousIcon } = useIcon();

  const slidesCount = slides.length;

  console.log(activeSlide, slidesCount, slides);
  return (
    <div ref={ref} className={withBaseName()} {...rest}>
      <Button
        appearance="transparent"
        sentiment="neutral"
        className={withBaseName("prev-button")}
        onClick={prevSlide}
        disabled={activeSlide === 0}
      >
        <PreviousIcon />
      </Button>
      {children}
      <Button
        appearance="transparent"
        sentiment="neutral"
        className={withBaseName("next-button")}
        onClick={nextSlide}
        disabled={activeSlide === slidesCount - 1}
      >
        <NextIcon />
      </Button>
      <div className={withBaseName("dots")}>
        <RadioButtonGroup
          aria-label="Carousel buttons"
          onChange={(e) => goToSlide(Number(e.target.value))}
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
  );
});
