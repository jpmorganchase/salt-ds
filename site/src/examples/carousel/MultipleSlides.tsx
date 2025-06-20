import { H3, Text } from "@salt-ds/core";
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

export const MultipleSlides = (): ReactElement => {
  return (
    <Carousel visibleSlides={{ xs: 1, sm: 2 }} aria-label="Account overview">
      <CarouselControls />
      <CarouselSlider>
        {sliderData.map((slide, index) => {
          return (
            <CarouselSlide
              key={slide.title}
              aria-labelledby={`slide-title-${index}`}
              media={
                <img
                  alt={`stock content to show in carousel slide ${index}`}
                  className={clsx(styles.carouselImagePlaceholder)}
                  src={slide.image}
                />
              }
              header={<H3 id={`slide-title-${index}`}>{slide.title}</H3>}
            >
              <Text>{slide.content}</Text>
            </CarouselSlide>
          );
        })}
      </CarouselSlider>
    </Carousel>
  );
};
