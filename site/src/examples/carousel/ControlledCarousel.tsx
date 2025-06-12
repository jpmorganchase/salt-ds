import { Button, FlexLayout, H1 } from "@salt-ds/core";
import {
  Carousel,
  type CarouselApi,
  CarouselControls,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import { type ReactElement, useEffect, useRef } from "react";
import styles from "./index.module.css";

export const ControlledCarousel = (): ReactElement => {
  const emblaApiRef = useRef<CarouselApi | undefined>(undefined);
  const slides = Array.from(Array(4).keys());

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
    <Carousel
      aria-label="Account overview"
      className={styles.carousel}
      emblaApiRef={emblaApiRef}
    >
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <Button onClick={() => emblaApiRef.current?.scrollTo(2)}>
          Scroll to slide 3
        </Button>
        <CarouselControls />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            aria-label={`Example slide ${index + 1}`}
            aria-roledescription="slide"
            className={styles.carouselSlide}
            key={index}
          >
            <FlexLayout
              className={styles.carouselNumber}
              justify={"center"}
              direction={"row"}
              gap={3}
            >
              <H1 style={{ margin: "0px" }}>{index + 1}</H1>
            </FlexLayout>
          </div>
        ))}
      </CarouselSlides>
    </Carousel>
  );
};
