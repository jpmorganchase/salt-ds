import { FlexLayout, H2, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const TabListTop = (): ReactElement => {
  const carouselId = useId();

  const slides = Array.from(Array(4).keys());
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={styles.carousel}
    >
      <FlexLayout gap={1} wrap={true}>
        <CarouselPreviousButton tabIndex={-1} appearance="transparent" />
        <CarouselTabList />
        <CarouselNextButton tabIndex={-1} appearance="transparent" />
        <CarouselProgressLabel />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => {
          const tabId = `${carouselId}-tab${index}`;
          return (
            <div
              aria-labelledby={`${tabId}-title`}
              role={"tabpanel"}
              aria-roledescription="slide"
              className={styles.carouselSlide}
              key={tabId}
            >
              <Text
                id={`${tabId}-title`}
                styleAs="display1"
                className={styles.carouselNumber}
                aria-label="Placeholder slide"
              >
                {index + 1}
              </Text>
            </div>
          );
        })}
      </CarouselSlides>
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Tablist top aligned example
      </H2>
    </Carousel>
  );
};
