import { H3, StackLayout, Text } from "@salt-ds/core";
import {
  Carousel,
  CarouselNavigationBar,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

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
export const Default = (): ReactElement => {
  return (
    <Carousel>
      <CarouselNavigationBar />
      <CarouselSlider>
        {Array.from({ length: 5 }, (_, index) => (
          <CarouselSlide
            key={`item-${index}`}
            aria-labelledby={`slide-title-${index}`}
          >
            <SliderContent index={index} />
          </CarouselSlide>
        ))}
      </CarouselSlider>
    </Carousel>
  );
};
