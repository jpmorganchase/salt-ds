import type { Meta, StoryFn } from "@storybook/react";

import {
  Carousel,
  CarouselHeader,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import "./carousel.stories.css";
import { Button, H2, H3, SplitLayout, StackLayout, Text } from "@salt-ds/core";
import { CarouselControls } from "../../src/carousel/CarouselControls";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

function SliderContent(props: { index: number }) {
  return (
    <StackLayout gap={1}>
      <H3>Header of the slider {props.index + 1}</H3>
      <Text>
        We offer solutions to the world's most important corporations,
        governments and institution.
      </Text>
    </StackLayout>
  );
}

const CarouselExample: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args}>
        <CarouselHeader />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              key={`item-${index}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};
export const Basic = CarouselExample.bind({});
Basic.args = {};

export const WithVisibleSlides = CarouselExample.bind({});
WithVisibleSlides.args = {
  visibleSlides: { xs: 1, sm: 2, md: 3 },
};

// TODO: fix active index moves
export const WithActiveIndex = CarouselExample.bind({});
WithActiveIndex.args = {
  activeSlideIndex: 4,
};

export const WithTitle: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-labelledby="carousel-title">
        <CarouselHeader title={<H2 id="carousel-title">Slider</H2>} />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              key={`item-${index}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};
export const WithActions: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} visibleSlides={{ xs: 1, sm: 2, md: 3 }}>
        <CarouselHeader />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              actions={
                <Button onClick={() => console.log("actioned")}>
                  Learn more
                </Button>
              }
              key={`item-${index}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};

export const BorderedSlides: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args}>
        <CarouselHeader />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              bordered
              key={`item-${index}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};

export const BorderedMultipleSlides: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} visibleSlides={{ xs: 1, sm: 2, md: 3 }}>
        <CarouselHeader />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              bordered
              key={`item-${index}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            >
              <SliderContent index={index} />
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};

const ControlsPositioningExample: StoryFn<typeof CarouselControls> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel>
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              key={`item-${index}`}
              media={
                <div
                  className={`carousel-image-placeholder carousel-image-placeholder-${
                    index + 1
                  }`}
                />
              }
            />
          ))}
        </CarouselSlider>
        <SplitLayout
          startItem={
            args.labelPlacement !== "left" && <CarouselControls {...args} />
          }
          endItem={
            args.labelPlacement === "left" && <CarouselControls {...args} />
          }
        />
      </Carousel>
    </div>
  );
};
export const ControlsPositioning = ControlsPositioningExample.bind({});
ControlsPositioning.args = {
  labelPlacement: "left",
};
