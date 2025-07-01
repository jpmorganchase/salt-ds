import {
  FlexLayout,
  Link,
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
        CarouselAnnouncement(),
        Classnames({
          snapped: styles.carouselSlideIsSnapped,
        }),
      ]}
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
