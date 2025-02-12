import type { Meta, StoryFn } from "@storybook/react";

import {
  Carousel,
  CarouselControls,
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
      <H3>Header of the slider {props.index + 1}</H3>
      <Text>
        We offer solutions to the world's moast important corporations,
        governments and institution.
      </Text>
    </StackLayout>
  );
}

const CarouselExample: StoryFn<typeof Carousel> = (args) => {
  return (
    <div className="carousel-container">
      <Carousel {...args}>
        <CarouselControls title={<H2>Slides</H2>} />
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
              actions={<Button>Learn more</Button>}
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
Basic.args = {
  bordered: false,
};
