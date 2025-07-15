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
      <FlexLayout justify={"start"} direction={"row"} gap={1}>
        <CarouselPreviousButton />
        <CarouselNextButton />
        <CarouselProgressLabel />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            role="tabpanel"
            aria-roledescription="slide"
            aria-label={`Example slide ${index + 1}`}
            className={styles.carouselSlide}
            key={`${slideId}-${index}`}
            id={`${slideId}-${index}`}
          >
            <Text styleAs={"display1"} className={styles.carouselNumber}>
              {index + 1}
            </Text>
          </div>
        ))}
      </CarouselSlides>
    </Carousel>
  );
};
