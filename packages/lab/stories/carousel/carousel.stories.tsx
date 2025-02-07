import type { Meta, StoryFn } from "@storybook/react";

import {
  Carousel,
  CarouselControls,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import "./carousel.stories.css";
import { H2, StackLayout, Text } from "@salt-ds/core";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselExample: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel activeSlideIndex={2} {...args}>
        <CarouselControls />
        <CarouselSlider>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselSlide key={`item-${index}`}>
              <div
                className={`carousel-image-placeholder carousel-image-placeholder-${
                  index + 1
                }`}
              />
              <StackLayout gap={2}>
                <H2>Header of the slider {index + 1}</H2>
                <Text>
                  We offer solutions to the world's moast important
                  corporations, governments and institution.
                </Text>
              </StackLayout>
            </CarouselSlide>
          ))}
        </CarouselSlider>
      </Carousel>
    </div>
  );
};
export const Basic = CarouselExample.bind({});
Basic.args = {};
