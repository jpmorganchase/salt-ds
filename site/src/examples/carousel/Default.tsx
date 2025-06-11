import { H1 } from "@salt-ds/core";
import { Carousel, CarouselControls, CarouselSlides } from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const Default = (): ReactElement => {
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel aria-label="default carousel example" className={styles.carousel}>
      <CarouselControls />
      <CarouselSlides>
        {slides.map((index) => (
          <div
            aria-label={`Example slide ${index + 1}`}
            aria-roledescription="slide"
            className={styles.carouselSlide}
            key={index}
          >
            <div className={styles.carouselNumber}>
              <H1 style={{ margin: "0px" }}>{index + 1}</H1>
            </div>
          </div>
        ))}
      </CarouselSlides>
    </Carousel>
  );
};
