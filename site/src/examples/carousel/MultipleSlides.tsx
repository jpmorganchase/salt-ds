import { FlexLayout, H2, Text, useBreakpoint, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const MultipleSlides = (): ReactElement => {
  const carouselId = useId();
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1; // switch to single slide for mobile
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={clsx(styles.carousel, {
        [styles.carouselMultipleSlides]: !isMobile,
      })}
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
    >
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Multiple slides carousel example
      </H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <FlexLayout gap={1} wrap={true} align={"center"}>
          <CarouselPreviousButton aria-label="Previous slide group" />
          <CarouselNextButton aria-label="Next slide group" />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {sliderData.map((slide, index) => {
            const slideId = `${carouselId}-slide${index}`;
            return (
              <CarouselCard
                className={styles.carouselSlide}
                key={slideId}
                aria-labelledby={`${slideId}-title`}
                appearance="bordered"
                media={
                  <img
                    aria-hidden={true}
                    className={styles.carouselImage}
                    src={slide.image}
                  />
                }
                header={
                  <Text id={`${slideId}-title`} styleAs="h3">
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
