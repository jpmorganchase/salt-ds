import { H3, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselControls,
  CarouselSlides,
} from "@salt-ds/lab";
import clsx from "clsx";
import { default as FadePlugin } from "embla-carousel-fade";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const Fade = (): ReactElement => (
  <Carousel
    aria-label="Account overview bordered"
    className={styles.carousel}
    emblaPlugins={[FadePlugin()]}
  >
    <CarouselControls />
    <CarouselSlides>
      {sliderData.map((slide, index) => {
        const carousel1SlideId = useId();
        return (
          <CarouselCard
            bordered
            key={carousel1SlideId}
            aria-labelledby={`slide-title-${carousel1SlideId}`}
            media={
              <img
                alt={`stock content to show in carousel slide ${index}`}
                className={clsx(styles.carouselImage)}
                src={slide.image}
              />
            }
            header={
              <H3 id={`slide-title-${carousel1SlideId}`}>{slide.title}</H3>
            }
          >
            <Text>{slide.content}</Text>
          </CarouselCard>
        );
      })}
    </CarouselSlides>
  </Carousel>
);
