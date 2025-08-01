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

export const TabListBottom = (): ReactElement => {
  const carouselId = useId();

  const slides = Array.from(Array(4).keys());
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={styles.carousel}
    >
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Tablist bottom aligned example
      </H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <FlexLayout gap={1} wrap={true}>
          <CarouselPreviousButton tabIndex={-1} appearance="transparent" />
          <CarouselTabList />
          <CarouselNextButton tabIndex={-1} appearance="transparent" />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {slides.map((index) => (
            <div
              role={"tabpanel"}
              aria-roledescription="slide"
              aria-label={`Placeholder slide ${index + 1}`}
              className={styles.carouselSlide}
              key={`${carouselId}-card-${index}`}
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
