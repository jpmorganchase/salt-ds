import { Display1, FlexLayout, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Basic = (): ReactElement => {
  const carouselId = useId();
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel aria-label="default carousel example" className={styles.carousel}>
      <FlexLayout gap={1} wrap={true} align={"center"}>
        <CarouselPreviousButton />
        <CarouselNextButton />
        <CarouselProgressLabel />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => {
          const slideId = `${carouselId}-slide${index}`;
          return (
            <div
              aria-labelledby={`${slideId}-title`}
              role="group"
              aria-roledescription="slide"
              className={styles.carouselSlide}
              key={slideId}
            >
              <Display1
                id={`${slideId}-title`}
                className={styles.carouselNumber}
                aria-label={"Placeholder slide"}
              >
                {index + 1}
              </Display1>
            </div>
          );
        })}
      </CarouselSlides>
    </Carousel>
  );
};
