import { H3, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselControls,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import clsx from "clsx";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
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
    <StackLayout direction="row">
      <Carousel aria-label="Account overview bordered">
        <CarouselControls />
        <CarouselSlider>
          {sliderData.map((slide, index) => {
            const carousel1SlideId = useId();
            return (
              <CarouselSlide
                appearance="bordered"
                key={carousel1SlideId}
                aria-labelledby={`slide-title-${carousel1SlideId}`}
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className={clsx(styles.carouselImagePlaceholder)}
                    src={slide.image}
                  />
                }
                header={
                  <H3 id={`slide-title-${carousel1SlideId}`}>{slide.title}</H3>
                }
              >
                <Text>{slide.content}</Text>
              </CarouselSlide>
            );
          })}
        </CarouselSlider>
      </Carousel>
      <Carousel aria-label="Account overview">
        <CarouselControls />
        <CarouselSlider>
          {sliderData.map((slide, index) => {
            const carousel2SlideId = useId();
            return (
              <CarouselSlide
                key={carousel2SlideId}
                aria-labelledby={`slide-title-${carousel2SlideId}`}
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className={clsx(styles.carouselImagePlaceholder)}
                    src={slide.image}
                  />
                }
                header={
                  <H3 id={`slide-title-${carousel2SlideId}`}>{slide.title}</H3>
                }
              >
                <Text>{slide.content}</Text>
              </CarouselSlide>
            );
          })}
        </CarouselSlider>
      </Carousel>
    </StackLayout>
  );
};
