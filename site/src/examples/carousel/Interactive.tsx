import { H2, StackLayout, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselControls,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import clsx from "clsx";
import { type ReactElement, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const Interactive = (): ReactElement => {
  return (
    <StackLayout>
      <Carousel visibleSlides={3} aria-labelledby="iteractive-carousel-title">
        <CarouselControls
          title={<H2 id="iteractive-carousel-title">Interactive carousel</H2>}
        />
        <CarouselSlider>
          {sliderData.map((slide, index) => {
            const [filterOn, setFilterOn] = useState(true);
            const carousel1SlideId = useId();
            return (
              <CarouselSlide
                onClick={() => {
                  setFilterOn(!filterOn);
                }}
                appearance="bordered"
                className={clsx(styles.clickableSlide, {
                  [styles.filteredImage]: filterOn,
                })}
                key={carousel1SlideId}
                aria-labelledby={`slide-title-${carousel1SlideId}`}
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className={styles.carouselImagePlaceholder}
                    src={slide.image}
                  />
                }
              />
            );
          })}
        </CarouselSlider>
      </Carousel>
    </StackLayout>
  );
};
