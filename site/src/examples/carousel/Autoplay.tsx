import {
  Button,
  FlexLayout,
  FormField,
  FormFieldLabel,
  H1,
  H2,
  Link,
} from "@salt-ds/core";
import {
  Carousel,
  CarouselPagination,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import { PauseIcon, PlayIcon } from "@salt-ds/icons";
import { default as autoplayPlugin } from "embla-carousel-autoplay";
import { type FocusEventHandler, useRef, useState } from "react";
import styles from "./index.module.css";

export const Autoplay = () => {
  const [isPlaying, setIsPlaying] = useState(true);

  const autoplay = useRef(autoplayPlugin({ delay: 5000 }));
  const slides = Array.from(Array(4).keys());

  const handleBlur: FocusEventHandler = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget) && isPlaying) {
      autoplay.current.play();
    }
  };

  return (
    <Carousel
      aria-label="Account overview"
      className={styles.carousel}
      emblaOptions={{ loop: true }}
      emblaPlugins={[autoplay.current]}
    >
      <FlexLayout justify={"space-between"} align={"center"} direction={"row"}>
        <H2 style={{ margin: "0px" }}>Title</H2>
        {isPlaying ? (
          <Button
            aria-label="Stop slide rotation"
            appearance="bordered"
            sentiment="neutral"
            onClick={() => {
              setIsPlaying(false);
              autoplay.current.stop();
            }}
            tabIndex={0}
          >
            Pause play
            <PauseIcon aria-hidden />
          </Button>
        ) : (
          <Button
            aria-label="Start slide rotation"
            appearance="bordered"
            sentiment="neutral"
            onClick={() => {
              setIsPlaying(true);
              autoplay.current.play();
            }}
            tabIndex={0}
          >
            Resume play
            <PlayIcon aria-hidden />
          </Button>
        )}
      </FlexLayout>
      <CarouselSlides
        onMouseEnter={() => {
          autoplay.current.stop();
        }}
        onMouseLeave={() => {
          if (isPlaying) {
            autoplay.current.play();
          }
        }}
        onFocus={() => autoplay.current.stop()}
        onBlur={handleBlur}
      >
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
              <FormField style={{ width: "auto" }}>
                <FormFieldLabel>Focusable element</FormFieldLabel>
                <Link aria-label={"demo action"} tabIndex={0} href="#">
                  Link
                </Link>
              </FormField>
            </FlexLayout>
          </div>
        ))}
      </CarouselSlides>
      <FlexLayout justify={"center"} direction={"row"}>
        <CarouselPagination />
      </FlexLayout>
    </Carousel>
  );
};
