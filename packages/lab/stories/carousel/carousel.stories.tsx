import { Meta, StoryFn } from "@storybook/react";

import { Carousel, CarouselSlide } from "@salt-ds/lab";
import "./carousel.stories.css";
import { Button, FlexLayout } from "@salt-ds/core";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as Meta<typeof Carousel>;

const CarouselExample: StoryFn<typeof Carousel> = (args) => {
  const renderButtonBar = () => <Button variant="cta">Learn more</Button>;

  return (
    <Carousel className="carousel-container" {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <CarouselSlide
          key={index}
          ButtonBar={renderButtonBar}
          Media={
            <FlexLayout
              className={`carousel-image-placeholder carousel-image-placeholder-${
                index + 1
              }`}
              align="center"
              justify="center"
            >
              <span>Carousel Slide {index + 1}</span>
            </FlexLayout>
          }
          description="Image description lorem ipsum dolor amit"
          title="Carousel slide title"
          contentAlignment={"left"}
        />
      ))}
    </Carousel>
  );
};
export const Basic = CarouselExample.bind({});
Basic.args = {};
