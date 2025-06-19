import { FlexLayout, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselAnnouncement,
  CarouselCard,
  CarouselPagination,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselNextButton,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const MultipleSlides = (): ReactElement => {
  const slideId = useId();
  return (
    <Carousel
      aria-label="Multiple slides carousel example"
      className={clsx(styles.carousel, styles.carouselMultipleSlides)}
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
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
              appearance={"bordered"}
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

