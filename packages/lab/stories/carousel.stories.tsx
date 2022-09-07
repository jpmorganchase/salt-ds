import { ComponentMeta, ComponentStory } from "@storybook/react";

import {
  ButtonBar,
  Carousel,
  CarouselSlide,
  OrderedButton,
} from "@jpmorganchase/uitk-lab";
import "./carousel.stories.css";
import { FlexLayout } from "@jpmorganchase/uitk-core";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as ComponentMeta<typeof Carousel>;

const CarouselExample: ComponentStory<typeof Carousel> = (args) => {
  const renderButtonBar = () => (
    <ButtonBar>
      <OrderedButton variant="cta">Learn more</OrderedButton>
    </ButtonBar>
  );

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
export const BasicCarousel = CarouselExample.bind({});
BasicCarousel.args = {};
