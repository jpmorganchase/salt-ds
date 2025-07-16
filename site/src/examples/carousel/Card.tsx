import { H2, StackLayout, Text, useBreakpoint, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import type { ReactElement } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

export const Card = (): ReactElement => {
  const slideId = useId();
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  return (
    <Carousel aria-label="Carousel cards example" className={styles.carousel}>
      <H2 className={styles.carouselHeading}>Title</H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <StackLayout direction="row" gap={1}>
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
        <CarouselSlides>
          {sliderData.map((slide, index) => {
            const id = `${slideId}-${index}`;
            return (
              <CarouselCard
                role={!isMobile ? "tabpanel" : "group"}
                aria-roledescription={!isMobile ? undefined : "slide"}
                className={styles.carouselSlide}
                key={`slide-${id}`}
                aria-labelledby={id}
                media={
                  <img
                    alt={`stock content to show in carousel slide ${index}`}
                    className={styles.carouselImage}
                    src={slide.image}
                  />
                }
                header={
                  <Text styleAs="h3" id={id}>
                    {slide.title}
                  </Text>
                }
              >
                <Text>{slide.content}</Text>
              </CarouselCard>
            );
          })}
        </CarouselSlides>
      </div>
    </Carousel>
  );
};
