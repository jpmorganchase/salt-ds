import {
  Button,
  FlexLayout,
  StackLayout,
  Text,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
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

  const slideId = useId();
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  // biome-ignore lint/correctness/useExhaustiveDependencies: API can re-init after first render
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
      <FlexLayout justify={"center"} align={"center"} direction={"row"}>
        <Button onClick={() => emblaApi?.scrollTo(2)}>Scroll to slide 3</Button>
      </FlexLayout>
    </StackLayout>
  );
};
