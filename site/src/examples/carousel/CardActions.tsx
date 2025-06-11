import { FlexLayout, H2, H3, Link, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselControls,
  CarouselSlides,
} from "@salt-ds/lab";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const CardActions = (): ReactElement => {
  return (
    <Carousel aria-label="Account overview" className={styles.carousel}>
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <H2 style={{ margin: "0px" }}>Title</H2>
        <CarouselControls />
      </FlexLayout>
      <CarouselSlides>
        {sliderData.map((slide, index) => {
          const slideId = useId();
          return (
            <CarouselCard
              key={slideId}
              appearance={"bordered"}
              aria-labelledby={`slide-title-${slideId}`}
              media={
                <img
                  alt={`stock content to show in carousel slide ${index}`}
                  className={styles.carouselImage}
                  src={slide.image}
                />
              }
              header={<H3 id={`slide-title-${slideId}`}>{slide.title}</H3>}
              actions={
                <Link aria-label={"demo action"} tabIndex={0} href="#">
                  Usage examples
                </Link>
              }
            >
              <Text>{slide.content}</Text>
            </CarouselCard>
          );
        })}
      </CarouselSlides>
    </Carousel>
  );
};
