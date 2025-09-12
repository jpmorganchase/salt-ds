import { FlexLayout, H2, H3, Link, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import Classnames from "embla-carousel-class-names";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const CardActions = (): ReactElement => {
  const carouselId = useId();

  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={styles.carousel}
      emblaPlugins={[
        Classnames({
          snapped: styles.carouselSlideIsSnapped,
        }),
      ]}
    >
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Card actions example
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
          {sliderData.map((slide, index) => {
            const tabId = `${carouselId}-tab${index}`;
            return (
              <CarouselCard
                className={styles.carouselSlide}
                key={tabId}
                aria-labelledby={`${tabId}-title`}
                appearance="bordered"
                media={
                  <img
                    aria-hidden={true}
                    className={styles.carouselImage}
                    src={slide.image}
                  />
                }
                header={<H3 id={`${tabId}-title`}>{slide.title}</H3>}
                actions={
                  <Link aria-label="demo action" tabIndex={0} href="#">
                    Usage examples
                  </Link>
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
