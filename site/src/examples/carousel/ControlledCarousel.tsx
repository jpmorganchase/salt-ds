import { Button, H3, StackLayout, Text, useId } from "@salt-ds/core";
import { Carousel, CarouselSlide, CarouselSlider } from "@salt-ds/lab";
import clsx from "clsx";
import { type ReactElement, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const ControlledCarousel = (): ReactElement => {
  const [slide, setSlide] = useState<number>(0);
  return (
    <StackLayout>
      <StackLayout gap={1} direction="row" align="center">
        <Button onClick={() => setSlide(slide - 1)} disabled={slide === 0}>
          Left
        </Button>
        <Button
          onClick={() => setSlide(slide + 1)}
          disabled={slide >= sliderData.length - 1}
        >
          Right
        </Button>
        <Text>Current slide: {slide + 1}</Text>
      </StackLayout>
      <Carousel aria-label="Account overview" activeSlideIndex={slide}>
        <CarouselSlider onSelectionChange={(_, index) => setSlide(index)}>
          {sliderData.map((slide, index) => {
            const slideId = useId();
            return (
              <CarouselSlide
                key={slideId}
                aria-labelledby={`slide-title-${slideId}`}
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className={clsx(styles.carouselImagePlaceholder)}
                    src={slide.image}
                  />
                }
                header={<H3 id={`slide-title-${slideId}`}>{slide.title}</H3>}
              >
                <Text>{slide.content}</Text>
              </CarouselSlide>
            );
          })}
        </CarouselSlider>
      </Carousel>
    </StackLayout>
  );
};
