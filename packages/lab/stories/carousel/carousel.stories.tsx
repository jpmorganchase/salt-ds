import type { Meta, StoryFn } from "@storybook/react-vite";

import {
  Carousel,
  CarouselControls, CarouselProps, CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import "./carousel.stories.css";
import {
  Button,
  FormField, FormFieldLabel,
  H2,
  H3, RadioButton, RadioButtonGroup,
  StackLayout,
  Text,
  useId
} from "@salt-ds/core";
import { useState } from "react";
import { renderSlides} from "./renderSlides";
import {sliderData} from "@salt-ds/site/src/examples/carousel/exampleData";
import clsx from "clsx";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselExample: StoryFn<typeof Carousel> = (args, navigationBarArgs) => {
  return (
    <div className="carousel-container">
      <Carousel {...args}>
        <CarouselControls />
        <CarouselSlider>{renderSlides()}</CarouselSlider>
      </Carousel>
    </div>
  );
};

export const Default = CarouselExample.bind({});
Default.args = {
  "aria-label": "Account overview",
  id: "carousel-example",
};

export const ActiveSlide = CarouselExample.bind({});
ActiveSlide.args = {
  "aria-label": "Account overview",
  id: "carousel-example",
  defaultActiveSlideIndex: 3,
};

export const Bordered: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-label="Account overview">
        <CarouselControls />
        <CarouselSlider>{renderSlides()}</CarouselSlider>
      </Carousel>
    </div>
  );
};

export const WithControlsPlacement: StoryFn<typeof Carousel> = (args) => {
  const [placement, setPlacement] = useState<CarouselProps["controlsPlacement"]>("top");
  return (
    <div className="carousel-container">
    <StackLayout gap={3} align="center">
      <Carousel aria-label="Account overview" controlsPlacement={placement}>
        <CarouselControls />
        <CarouselSlider>
          {renderSlides()}
        </CarouselSlider>
      </Carousel>
      <StackLayout>
        <FormField>
          <FormFieldLabel>Controls Placement</FormFieldLabel>
          <RadioButtonGroup
            value={placement}
            onChange={(event) =>
              setPlacement(event.target.value as CarouselProps["controlsPlacement"])
            }
            direction="horizontal"
          >
            <RadioButton label="Top" value="top" key="top" />
            <RadioButton label="Bottom" value="bottom" key="bottom" />
          </RadioButtonGroup>
        </FormField>
      </StackLayout>
    </StackLayout></div>);
};

export const WithMultipleSlides = CarouselExample.bind({});
WithMultipleSlides.args = {
  visibleSlides: { sm: 1, md: 2 },
  "aria-label": "Account overview",
  id: "carousel-example",
};

export const WithActions: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel
        {...args}
        visibleSlides={{ sm: 1, md: 2 }}
        aria-label="Account overview"
      >
        <CarouselControls />
        <CarouselSlider>{renderSlides({withActions: true})}</CarouselSlider>
      </Carousel>
    </div>
  );
};

export const WithTitle: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-labelledby="carousel-title">
        <CarouselControls
          title={<H2 id="carousel-title">Account overview</H2>}
        />
        <CarouselSlider>{renderSlides()}</CarouselSlider>
      </Carousel>
    </div>
  );
};

export const Controlled: StoryFn<typeof Carousel> = (args) => {
  const [slide, setSlide] = useState<number>(0);
  return (
    <StackLayout>
      <StackLayout gap={1} direction="row" align="center">
        <Button onClick={() => setSlide(slide - 1)} disabled={slide === 0}>
          Left
        </Button>
        <Button
          onClick={() => setSlide(slide + 1)}
          disabled={slide >= 3}
        >
          Right
        </Button>
        <Text>Current slide: {slide + 1}</Text>
      </StackLayout>
      <div className="carousel-container">
        <Carousel
          {...args}
          aria-labelledby="carousel-title"
          activeSlideIndex={slide}
        >
          <H2 id="carousel-title" className="carousel-title">
            Account overview carousel
          </H2>
          <CarouselSlider onSelectionChange={(_, index) => setSlide(index)}>
            {renderSlides()}
          </CarouselSlider>
        </Carousel>
      </div>
    </StackLayout>
  );
};
