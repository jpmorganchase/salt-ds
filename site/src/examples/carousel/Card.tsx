import { FlexLayout, H2, H3, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselControls,
  CarouselPagination,
  CarouselSlides,
} from "@salt-ds/lab";
import clsx from "clsx";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const Card = (): ReactElement => (
  <Carousel aria-label="Account overview bordered" className={styles.carousel}>
    <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
      <H2 style={{ margin: "0px" }}>Title</H2>
      <CarouselControls />
    </FlexLayout>
    <CarouselSlides>
      {sliderData.map((slide, index) => {
        const carousel1SlideId = useId();
        return (
          <CarouselCard
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
    <FlexLayout justify={"center"} direction={"row"}>
      <CarouselPagination />
    </FlexLayout>
  </Carousel>
);
