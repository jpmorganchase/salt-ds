import { FlexLayout, Text, useId } from "@salt-ds/core";
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
  const slideId = useId();
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel aria-label="default carousel example" className={styles.carousel}>
      <FlexLayout gap={1} wrap={true} align={"center"}>
        <CarouselPreviousButton />
        <CarouselNextButton />
        <CarouselProgressLabel />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            aria-label={`Placeholder slide ${index + 1}`}
            role="group"
            aria-roledescription="slide"
            className={styles.carouselSlide}
            key={`slide-${slideId}-${index}`}
          >
            <Text styleAs="display1" className={styles.carouselNumber}>
              {index + 1}
            </Text>
          </div>
        ))}
      </CarouselSlides>
    </Carousel>
  );
};
