import { ComponentMeta, ComponentStory } from "@storybook/react";

import {
  ButtonBar,
  Carousel,
  CarouselSlide,
  OrderedButton,
} from "@jpmorganchase/uitk-lab";
import "./carousel.stories.css";

export default {
  title: "Lab/Carousel",
  component: Carousel,
} as ComponentMeta<typeof Carousel>;

const colors = ["fcd5ce", "f8edeb", "d8e2dc", "ffe5d9", "ffd7ba"];
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
            <img
              alt="placeholder slider"
              src={`https://via.placeholder.com/1140x520/${
                colors[index]
              }?text=Carousel+Slide+${index + 1}`}
            />
          }
          description={"Lorem ipsum dolor sit amet"}
          title={"Carousel Slide"}
          contentAlignment={"left"}
        />
      ))}
    </Carousel>
  );
};
export const BasicCarousel = CarouselExample.bind({});
BasicCarousel.args = {};
