import { Button, Display1, FlexLayout, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  type CarouselEmblaApiType,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import { type ReactElement, useEffect, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const ControlledCarousel = (): ReactElement => {
  const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(null);

  const carouselId = useId();

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const logSnappedSlide = () => {
      const snappedSlideIndex = emblaApi.selectedScrollSnap();
      console.log(
        `Slide ${snappedSlideIndex !== undefined ? snappedSlideIndex + 1 : undefined} is snapped into view.`,
      );
    };

    emblaApi.on("select", logSnappedSlide);

    // Cleanup listener on component unmount
    return () => {
      emblaApi.off("select", logSnappedSlide);
    };
  }, [emblaApi]);

  return (
    <StackLayout>
      <Carousel
        aria-label="Controlled carousel example"
        className={styles.carousel}
        getEmblaApi={setEmblaApi}
      >
        <FlexLayout gap={1} wrap={true}>
          <CarouselPreviousButton tabIndex={-1} appearance="transparent" />
          <CarouselTabList />
          <CarouselNextButton tabIndex={-1} appearance="transparent" />
          <CarouselProgressLabel />
        </FlexLayout>
        <CarouselSlides>
          {sliderData.map((slide, index) => {
            const tabId = `${carouselId}-tab${index}`;
            return (
              <CarouselCard
                className={styles.carouselSlide}
                key={tabId}
                aria-labelledby={`${tabId}-title`}
                appearance="bordered"
                media={
                  <img
                    aria-hidden={true}
                    className={styles.carouselImage}
                    src={slide.image}
                  />
                }
                header={
                  <Display1 id={`${tabId}-title`}>
                    {slide.title}
                  </Display1>
                }
              >
                <Text>{slide.content}</Text>
              </CarouselCard>
            );
          })}
        </CarouselSlides>
      </Carousel>
      <FlexLayout justify="center" align="center" direction="row">
        <Button onClick={() => emblaApi?.scrollTo(2)}>Scroll to slide 3</Button>
      </FlexLayout>
    </StackLayout>
  );
};
