import { H1, H2 } from "@salt-ds/core";
import { Carousel, CarouselControls, CarouselSlides } from "@salt-ds/lab";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const BottomControls = (): ReactElement => {
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel aria-label="default carousel example" className={styles.carousel}>
      <H2 style={{ margin: "0px" }}>Title</H2>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            role="slide"
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
      <CarouselControls />
    </Carousel>
  );
};
