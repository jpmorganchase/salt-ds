import {FlexLayout, StackLayout, Text, useId} from "@salt-ds/core";
import {
  Carousel,
  CarouselAnnouncement,
  CarouselCard, CarouselNextButton,
  CarouselPagination, CarouselPreviousButton, CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const Card = (): ReactElement => {
  const slideId = useId();
  return (
    <Carousel
      aria-label="Carousel cards example"
      className={styles.carousel}
      emblaPlugins={[CarouselAnnouncement()]}
    >
      <Text styleAs={"h2"}>Title</Text>
      <CarouselSlides>
        {sliderData.map((slide, index) => {
          return (
            <CarouselCard
              className={styles.carouselSlide}
              key={`${slideId}-${index}`}
              id={`${slideId}-${index}`}
              aria-label={`Example slide ${index + 1}`}
              media={
                <img
                  alt={`stock content to show in carousel slide ${index}`}
                  className={styles.carouselImage}
                  src={slide.image}
                />
              }
              header={<Text styleAs={"h3"}>{slide.title}</Text>}
            >
              <Text>{slide.content}</Text>
            </CarouselCard>
          );
        })}
      </CarouselSlides>
      <FlexLayout justify={"space-between"} direction={"row"} gap={1}>
      <StackLayout direction={"row"} gap={1}>
        <CarouselPreviousButton/>
        <CarouselNextButton />
        <CarouselProgressLabel />
        </StackLayout>
        <CarouselPagination />
      </FlexLayout>
    </Carousel>
  );
};
