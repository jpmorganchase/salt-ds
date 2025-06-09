import { Button, FlexLayout, H1 } from "@salt-ds/core";
import {
  Carousel,
  type CarouselApi,
  CarouselControls,
  CarouselSlides,
} from "@salt-ds/lab";
import { type ReactElement, useEffect, useState } from "react";
import styles from "./index.module.css";

export const ControlledCarousel = (): ReactElement => {
  const [emblaApi, setEmblaApi] = useState<CarouselApi | undefined>(undefined);
  const slides = Array.from(Array(4).keys());

  useEffect(() => {
    if (!emblaApi) return;

    const logSnappedSlide = () => {
      const snappedSlideIndex = emblaApi.selectedScrollSnap();
      console.log(`Slide ${snappedSlideIndex + 1} is snapped into view.`);
    };

    emblaApi.on("select", logSnappedSlide);

    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("select", logSnappedSlide);
    };
  }, [emblaApi]);

  return (
    <Carousel
      aria-label="Account overview bordered"
      className={styles.carousel}
      setApi={setEmblaApi}
    >
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <Button onClick={() => emblaApi?.scrollTo(2)}>Scroll to slide 3</Button>
        <CarouselControls />
      </FlexLayout>
      <CarouselSlides>
        {slides.map((index) => (
          <div
            role="slide"
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
