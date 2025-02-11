import {
  Button,
  H2,
  SplitLayout,
  Text,
  makePrefixer,
  useIcon,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { type HTMLAttributes, forwardRef } from "react";
import { useCarousel } from "./CarouselContext";

import carouselControlsCss from "./CarouselControls.css";

const withBaseName = makePrefixer("saltCarouselControls");

export interface CarouselControlsProps extends HTMLAttributes<HTMLDivElement> {}

export const CarouselControls = forwardRef<
  HTMLDivElement,
  CarouselControlsProps
>(function CarouselControls({ title, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-controls",
    css: carouselControlsCss,
    window: targetWindow,
  });
  const { slides, activeSlide, nextSlide, prevSlide } = useCarousel();
  const { NextIcon, PreviousIcon } = useIcon();

  const slidesCount = slides.length;

  const isOnFirstSlide = activeSlide === 0;
  const isOnLastSlide = activeSlide === slidesCount - 1;

  const ControlsLabel = () => (
    <Text as="span">
      <strong>
        {/* TODO: check w dev, this will need changing or a formatter*/}
        {activeSlide + 1} of {slidesCount}
      </strong>
    </Text>
  );
  const Controls = () => (
    <div role="group" className={withBaseName("controls")}>
      {/*  TODO: check w dev, currently some props are in the context and some out, should title go in context? */}
      {title && <ControlsLabel />}
      <Button
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("prev-button")}
        onClick={prevSlide}
        disabled={isOnFirstSlide}
        aria-label="Previous slide"
      >
        <PreviousIcon aria-hidden />
      </Button>
      <Button
        appearance="bordered"
        sentiment="neutral"
        className={withBaseName("next-button")}
        onClick={nextSlide}
        disabled={isOnLastSlide}
        aria-label="Next slide"
      >
        <NextIcon aria-hidden />
      </Button>
      {!title && <ControlsLabel />}
    </div>
  );

  return (
    <SplitLayout
      align="center"
      className={withBaseName()}
      ref={ref}
      startItem={title ? <H2>{title}</H2> : <Controls />}
      endItem={title && <Controls />}
      {...rest}
    />
  );
});
