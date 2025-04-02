import { H3, StackLayout, Text } from "@salt-ds/core";
import {
  Carousel,
  CarouselControls,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import clsx from "clsx";
import type { ReactElement } from "react";
import styles from "./index.module.css";

function renderSlideContent(index: number) {
  return (
    <StackLayout gap={1}>
      <H3 id={`slide-title-${index}`}>
        Categorical bold background {index + 1}
      </H3>
      <Text>
        Categorical colors are used for data visualization and other components
        that support categories.
      </Text>
    </StackLayout>
  );
}

const renderMediaPlaceholder = (index: number) => (
  <div
    className={clsx(
      styles.carouselImagePlaceholder,
      styles[`carouselImagePlaceholder-${index + 1}`],
    )}
  />
);

export const Appearance = (): ReactElement => {
  return (
    <Carousel aria-label="Categorical colors">
      <CarouselControls />
      <CarouselSlider>
        {Array.from({ length: 5 }, (_, index) => (
          <CarouselSlide
            appearance="bordered"
            key={`item-${index}`}
            aria-labelledby={`slide-title-${index}`}
            media={renderMediaPlaceholder(index)}
          >
            {renderSlideContent(index)}
          </CarouselSlide>
        ))}
      </CarouselSlider>
    </Carousel>
  );
};
