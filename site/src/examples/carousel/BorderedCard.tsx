import { FlexLayout, H2, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const BorderedCard = (): ReactElement => {
  const carouselId = useId();

  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={styles.carousel}
    >
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Bordered carousel example
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
          {sliderData.map((slide, index) => {
            const id = `${carouselId}-card${index}`;
            return (
              <CarouselCard
                className={styles.carouselSlide}
                key={`slide-${id}`}
                aria-labelledby={`title-${id}`}
                appearance="bordered"
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className={styles.carouselImage}
                    src={slide.image}
                  />
                }
                header={
                  <Text id={`title-${id}`} styleAs="h3">
                    {slide.title}
                  </Text>
                }
              >
                <Text>{slide.content}</Text>
              </CarouselCard>
            );
          })}
        </CarouselSlides>
      </div>
    </Carousel>
  );
};
