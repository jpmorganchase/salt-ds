import {
  FlexLayout,
  StackLayout,
  Text,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
import {
  Carousel,
  CarouselAnnouncement,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import { clsx } from "clsx";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const MultipleSlides = (): ReactElement => {
  const slideId = useId();
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  return (
    <Carousel
      aria-label="Multiple slides carousel example"
      className={clsx(styles.carouselMultipleSlides)}
      emblaOptions={{ align: "center", slidesToScroll: "auto" }}
      emblaPlugins={[CarouselAnnouncement()]}
    >
      <Text styleAs={"h2"}>Title</Text>
      <CarouselSlides>
        {sliderData.map((slide, index) => {
          return (
            <CarouselCard
              className={styles.carouselSlide}
              key={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
              id={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
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
          <CarouselPreviousButton />
          <CarouselNextButton />
          <CarouselProgressLabel />
        </StackLayout>
        {!isMobile ? <CarouselTabList /> : null}
      </FlexLayout>
    </Carousel>
  );
};
