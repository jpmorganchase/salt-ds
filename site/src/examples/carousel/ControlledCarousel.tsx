import { Button, FlexLayout, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselPagination,
  type CarouselApi,
  CarouselSlides,
  CarouselPreviousButton,
  CarouselNextButton,
  CarouselProgressLabel,
} from "@salt-ds/embla-carousel-pattern";
import { type ReactElement, useEffect, useRef } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const ControlledCarousel = (): ReactElement => {
  const emblaApiRef = useRef<CarouselApi | undefined>(undefined);
  const slideId = useId();

  // biome-ignore lint/correctness/useExhaustiveDependencies: API could update after first render
  useEffect(() => {
    if (!emblaApiRef?.current) {
      return;
    }

    const logSnappedSlide = () => {
      const snappedSlideIndex = emblaApiRef.current?.selectedScrollSnap();
      console.log(
        `Slide ${snappedSlideIndex !== undefined ? snappedSlideIndex + 1 : undefined} is snapped into view.`,
      );
    };

    emblaApiRef.current?.on("select", logSnappedSlide);

    // Cleanup listener on component unmount
    return () => {
      emblaApiRef.current?.off("select", logSnappedSlide);
    };
  }, [emblaApiRef.current]);

  return (
    <StackLayout>
      <Carousel
        aria-label="Account overview"
        className={styles.carousel}
        emblaApiRef={emblaApiRef}
      >
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
      <FlexLayout justify={"center"} align={"center"} direction={"row"}>
        <Button onClick={() => emblaApiRef.current?.scrollTo(2)}>
          Scroll to slide 3
        </Button>
      </FlexLayout>
    </StackLayout>
  );
};
