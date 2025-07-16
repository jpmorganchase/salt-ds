import { H2, StackLayout, Text, useBreakpoint, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
  CarouselTabList,
} from "@salt-ds/embla-carousel";
import type { ReactElement } from "react";
import styles from "./index.module.css";

export const TabListBottom = (): ReactElement => {
  const slideId = useId();
  const { matchedBreakpoints } = useBreakpoint();
  const isMobile = matchedBreakpoints.indexOf("sm") === -1;

  const slides = Array.from(Array(isMobile ? 2 : 4).keys());
  return (
    <Carousel
      aria-label="Pagination carousel example"
      className={styles.carousel}
    >
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
          {slides.map((index) => (
            <div
              role={!isMobile ? "tabpanel" : "group"}
              aria-roledescription={!isMobile ? undefined : "slide"}
              aria-label={`Example slide ${index + 1}`}
              className={styles.carouselSlide}
              key={`slide-${slideId}-${index}`}
            >
              <Text styleAs="display1" className={styles.carouselNumber}>
                {index + 1}
              </Text>
            </div>
          ))}
        </CarouselSlides>
      </div>
    </Carousel>
  );
};
