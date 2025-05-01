import {
  Button,
  H3,
  RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
import { Carousel, CarouselSlide, CarouselSlider } from "@salt-ds/lab";
import clsx from "clsx";
import { type ChangeEvent, type ReactElement, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const ControlledCarousel = (): ReactElement => {
  const [slide, setSlide] = useState<number>(0);

  const handleRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const newIndex = sliderData.findIndex((i) => i.title === value);
    setSlide(newIndex);
  };

  return (
    <StackLayout>
      <StackLayout direction="row" gap={1}>
        <Button
          appearance="transparent"
          onClick={() => setSlide(Math.max(0, slide - 1))}
          disabled={slide === 0}
          className={styles.carouselButton}
        >
          Left
        </Button>
        <Carousel aria-label="Account overview" activeSlideIndex={slide}>
          <CarouselSlider>
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
        <Button
          appearance="transparent"
          onClick={() => setSlide(Math.min(sliderData.length - 1, slide + 1))}
          disabled={slide >= sliderData.length - 1}
          className={styles.carouselButton}
        >
          Right
        </Button>
      </StackLayout>
      <StackLayout gap={1} direction="column" align="center">
        <RadioButtonGroup
          direction="horizontal"
          onChange={(event) => handleRadioChange(event)}
          value={sliderData[slide].title}
        >
          {sliderData.map((slideData) => {
            return (
              <RadioButton key={slideData.title} value={slideData.title} />
            );
          })}
        </RadioButtonGroup>
      </StackLayout>
    </StackLayout>
  );
};
