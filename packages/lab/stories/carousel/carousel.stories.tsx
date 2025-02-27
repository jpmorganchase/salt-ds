import type { Meta, StoryFn } from "@storybook/react";

import {
  Carousel,
  CarouselNavigationBar,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import "./carousel.stories.css";
import { Button, H2, H3, StackLayout, Text } from "@salt-ds/core";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

function SliderContent(props: { index: number }) {
  return (
    <StackLayout gap={1}>
      <H3 id={`slide-title-${props.index}`}>
        Categorical bold background {props.index + 1}
      </H3>
      <Text>
        Categorical colors are used for data visualization and other components
        that support categories.
      </Text>
    </StackLayout>
  );
}

const CarouselExample: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args}>
        <CarouselNavigationBar />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              key={`item-${index}`}
              aria-labelledby={`slide-title-${index}`}
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
export const Default = CarouselExample.bind({});
Default.args = {
  "aria-label": "Categorical backgrounds",
};

export const Bordered: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-label="Categorical backgrounds">
        <CarouselNavigationBar />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              appearance="bordered"
              key={`item-${index}`}
              aria-labelledby={`slide-title-${index}`}
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

export const WithMultipleSlides = CarouselExample.bind({});
WithMultipleSlides.args = {
  visibleSlides: { sm: 1, md: 2 },
  "aria-label": "Categorical backgrounds",
};

export const WithActions: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel
        {...args}
        visibleSlides={{ sm: 1, md: 2 }}
        aria-label="Categorical backgrounds"
      >
        <CarouselNavigationBar />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              appearance="bordered"
              actions={
                <Button onClick={() => console.log("actioned")}>
                  Learn more
                </Button>
              }
              key={`item-${index}`}
              aria-labelledby={`slide-title-${index}`}
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

export const WithTitleInNavigationBar: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args} aria-labelledby="carousel-title">
        <CarouselNavigationBar
          title={<H2 id="carousel-title">Categorical Backgrounds</H2>}
        />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide
              key={`item-${index}`}
              aria-labelledby={`slide-title-${index}, ${index + 1} of 5`}
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
