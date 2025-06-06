import { H2, H3, Text, useId } from "@salt-ds/core";
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

export const WithTitle = (): ReactElement => {
  return (
    <Carousel aria-labelledby="carousel-title">
      <CarouselControls title={<H2 id="carousel-title">Account overview</H2>} />
      <CarouselSlider>
        {sliderData.map((slide, index) => {
          const slideId = useId();
          return (
            <CarouselSlide
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
  );
};
