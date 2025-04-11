import { H2, H3, StackLayout, Text, useId } from "@salt-ds/core";
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

export const ControlsAlignment = (): ReactElement => {
  return (
    <StackLayout gap={1}>
      <H2 className={styles.carouselHeader}>Account overview</H2>
      <Carousel aria-label="Account overview" controlsPlacement="bottom">
        <CarouselControls />
        <CarouselSlider>
          {sliderData.map((slide, index) => {
            const slideId = useId();
            return (
              <CarouselSlide
                appearance="bordered"
                key={slideId}
                aria-labelledby={`slide-title-${slideId}`}
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className={clsx(styles.carouselImagePlaceholder)}
                    src={slide.image}
                  />
                }
                header={<H3 id={`slide-title-${slideId}`}>{slide.title}</H3>}
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
