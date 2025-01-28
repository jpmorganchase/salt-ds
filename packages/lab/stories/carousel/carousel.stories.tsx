import type { Meta, StoryFn } from "@storybook/react";

import { Carousel, CarouselSlide } from "@salt-ds/lab";
import "./carousel.stories.css";
import { Button, H2, SplitLayout, Text } from "@salt-ds/core";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselExample: StoryFn<typeof Carousel> = (args) => {
  return (
    <div style={{ maxWidth: 600 }}>
      <Carousel {...args}>
        {Array.from({ length: 5 }, (_, index) => (
          <CarouselSlide key={`item-${index}`}>
            <div
              className={`carousel-image-placeholder carousel-image-placeholder-${
                index + 1
              }`}
            />
            <div style={{ padding: " 1rem" }}>
              <H2>Header of the slider {index + 1}</H2>
              <Text> This is a slider in a carousel</Text>
              <SplitLayout endItem={<Button>Learn more</Button>} />
            </div>
          </CarouselSlide>
        ))}
      </Carousel>
    </div>
  );
};
export const Basic = CarouselExample.bind({});
Basic.args = {};
