import {
  FormField,
  FormFieldLabel,
  H2,
  H3, RadioButton,
  RadioButtonGroup,
  StackLayout,
  Text,
  useId
} from "@salt-ds/core";
import {
  Carousel,
  CarouselControls, CarouselProps,
  CarouselSlide,
  CarouselSlider,
} from "@salt-ds/lab";
import clsx from "clsx";
import {ReactElement, useState} from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const ControlsPlacement = (): ReactElement => {
  const [placement, setPlacement] = useState<CarouselProps["controlsPlacement"]>("top");
  return (
    <StackLayout gap={3} align="center">
      <Carousel aria-label="Account overview" controlsPlacement={placement}>
        <CarouselControls />
        <CarouselSlider>
          {sliderData.map((slide, index) => {
            const slideId = useId();
            return (
              <CarouselSlide
                bordered
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
      <StackLayout>
      <FormField>
        <FormFieldLabel>Controls Placement</FormFieldLabel>
        <RadioButtonGroup
        value={placement}
        onChange={(event) =>
          setPlacement(event.target.value as CarouselProps["controlsPlacement"])
        }
        direction="horizontal"
      >
        <RadioButton label="Top" value="top" key="top" />
        <RadioButton label="Bottom" value="bottom" key="bottom" />
      </RadioButtonGroup>
      </FormField>
      </StackLayout>
    </StackLayout>
  );
};
