import { Display1, FlexLayout, H2, StackLayout, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const FixedWidth = (): ReactElement => {
  const carouselId = useId();
  const cards = Array.from(Array(10).keys());

  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={styles.fullWidth}
      fixedSlideWidth={550}
      emblaOptions={{ align: "start", slidesToScroll: 1, containScroll: false }}
    >
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Fixed width slide example
      </H2>
      <StackLayout gap={1} direction="column-reverse">
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton tabIndex={-1} />
          <CarouselNextButton tabIndex={-1} />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {cards.map((index) => {
            const slideId = `${carouselId}-slide${index}`;
            return (
              <div
                role="group"
                aria-roledescription="slide"
                aria-labelledby={`${slideId}-title`}
                className={`${styles.carouselSlide} ${styles.numberedSlide}`}
                key={slideId}
              >
                <div className={styles.carouselNumber}>
                  <Display1
                    id={`${slideId}-title`}
                    className={styles.carouselHeading}
                    aria-label={`Slide ${index + 1}`}
                  >
                    {index + 1}
                  </Display1>
                </div>
              </div>
            );
          })}
        </CarouselSlides>
      </StackLayout>
    </Carousel>
  );
};
