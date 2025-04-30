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

export const Appearance = (): ReactElement => {
  return (
    <StackLayout direction="row" gap={6}>
      <Carousel aria-label="Account overview bordered">
        <CarouselControls title={<H2>Bordered</H2>} />
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
        <CarouselControls title={<H2>Transparent</H2>} />
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
