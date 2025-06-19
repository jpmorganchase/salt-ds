import {FlexLayout, StackLayout, Text, useId} from "@salt-ds/core";
import {
  Carousel,
  CarouselSlides,
  CarouselTabList,
  CarouselAnnouncement,
  CarouselPreviousButton,
  CarouselNextButton,
  CarouselProgressLabel,
} from "@salt-ds/embla-carousel-pattern";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const TabList = (): ReactElement => {
  const slideId = useId();
  const slides = Array.from(Array(4).keys());
  return (
    <Carousel
      aria-label="Pagination carousel example"
      className={styles.carousel}
      emblaPlugins={[CarouselAnnouncement()]}
    >
      <Text styleAs={"h2"}>Title</Text>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            role="tabpanel"
            aria-roledescription="slide"
            aria-label={`Example slide ${index + 1}`}
            className={styles.carouselSlide}
            key={`${slideId}-${index}`}
            id={`${slideId}-${index}`}
          >
            <Text styleAs={"h1"} className={styles.carouselNumber}>
              {index + 1}
            </Text>
          </div>
        ))}
      </CarouselSlides>
      <FlexLayout justify={"space-between"} direction={"row"} gap={1}>
        <StackLayout direction={"row"} gap={1}>
          <CarouselPreviousButton />
          <CarouselNextButton />
          <CarouselProgressLabel />
        </StackLayout>
        <CarouselTabList />
      </FlexLayout>
    </Carousel>
  );
};
