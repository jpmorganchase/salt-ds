import { FlexLayout, H1, H2 } from "@salt-ds/core";
import {
  Carousel,
  CarouselControls,
  CarouselPagination,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import cx from "classnames";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const MultipleSlides = (): ReactElement => {
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel
      aria-label="default carousel example"
      className={cx(styles.carousel, styles.carouselMultipleSlides)}
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
    >
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <H2 style={{ margin: "0px" }}>Title</H2>
        <CarouselControls />
      </FlexLayout>
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
      <FlexLayout justify={"center"} direction={"row"}>
        <CarouselPagination />
      </FlexLayout>
    </Carousel>
  );
};
