import { Display1, FlexLayout, H2, useId } from "@salt-ds/core";
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
          <CarouselPreviousButton tabIndex={-1} />
          <CarouselTabList />
          <CarouselNextButton tabIndex={-1} />
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
                <Display1
                  id={`${tabId}-title`}
                  className={styles.carouselNumber}
                  aria-label="Placeholder slide"
                >
                  {index + 1}
                </Display1>
              </div>
            );
          })}
        </CarouselSlides>
      </div>
    </Carousel>
  );
};
