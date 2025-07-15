import {
  H2,
  Link,
  StackLayout,
  Text,
  useBreakpoint,
  useId,
} from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import Classnames from "embla-carousel-class-names";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const CardActions = (): ReactElement => {
  const slideId = useId();
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  return (
    <Carousel
      aria-label="Card actions example"
      className={styles.carousel}
      emblaPlugins={[
        Classnames({
          snapped: styles.carouselSlideIsSnapped,
        }),
      ]}
    >
      <H2 className={styles.carouselHeading}>Title</H2>
      <CarouselSlides>
        {sliderData.map((slide, index) => {
          return (
            <CarouselCard
              className={styles.carouselSlide}
              key={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
              id={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
              aria-label={slide.title}
              appearance={"bordered"}
              media={
                <img
                  alt={`stock content to show in carousel slide ${index}`}
                  className={styles.carouselImage}
                  src={slide.image}
                />
              }
              header={<Text styleAs={"h3"}>{slide.title}</Text>}
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
      <StackLayout direction={"row"} gap={1}>
        <CarouselPreviousButton
          tabIndex={!isMobile ? -1 : 0}
          appearance={!isMobile ? "transparent" : "bordered"}
        />
        {!isMobile ? <CarouselTabList /> : null}
        <CarouselNextButton
          tabIndex={!isMobile ? -1 : 0}
          appearance={!isMobile ? "transparent" : "bordered"}
        />
        <CarouselProgressLabel />
      </StackLayout>
    </Carousel>
  );
};
