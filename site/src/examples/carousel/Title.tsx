import { FlexLayout, H2, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Title = (): ReactElement => {
  const slideId = useId();
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel
      aria-label="Carousel example with title"
      className={styles.carousel}
    >
      <H2 className={styles.carouselHeading}>Title</H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <FlexLayout justify="start" direction="row" gap={1}>
          <CarouselPreviousButton />
          <CarouselNextButton />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {slides.map((index) => (
            <div
              aria-label={`Example slide ${index + 1}`}
              className={styles.carouselSlide}
              key={`slide-${slideId}-${index}`}
            >
              <Text styleAs="display1" className={styles.carouselNumber}>
                {index + 1}
              </Text>
            </div>
          ))}
        </CarouselSlides>
      </div>
    </Carousel>
  );
};
