import { Button, FlexLayout, H2, H3, Link, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselAutoplayIndicator,
  CarouselCard,
  type CarouselEmblaApiType,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import { PauseIcon, PlayIcon } from "@salt-ds/icons";
import type { EmblaCarouselType } from "embla-carousel";
import { default as AutoplayPlugin } from "embla-carousel-autoplay";
import Classnames from "embla-carousel-class-names";
import { useEffect, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

const DELAY_MSECS = 8000;

export const Autoplay = () => {
  const carouselId = useId();
  const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const autoplay = emblaApi?.plugins().autoplay;

  const play = () => {
    autoplay?.play();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pause = () => {
    autoplay?.stop();
    setIsPaused(true);
  };

  const stop = () => {
    autoplay?.stop();
    setIsPlaying(false);
    setIsPaused(true);
  };

  useEffect(() => {
    const handleSlideChange = (emblaApi: EmblaCarouselType) => {
      const settledSlideIndex = emblaApi?.selectedScrollSnap() ?? 0;
      setSlideIndex(settledSlideIndex + 1);
    };

    if (!emblaApi || !emblaApi.plugins()?.autoplay) {
      return;
    }
    emblaApi.on("select", handleSlideChange);
    return () => {
      emblaApi.off("select", handleSlideChange);
    };
  }, [emblaApi]);

  const timeUntilNext = autoplay?.timeUntilNext() ?? DELAY_MSECS;

  const isActive = isPlaying && !isPaused;
  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={styles.carousel}
      disableSlideAnnouncements={isPlaying}
      emblaOptions={{ loop: true, duration: 20 }}
      emblaPlugins={[
        AutoplayPlugin({
          delay: DELAY_MSECS,
          playOnInit: true,
        }),
        Classnames({
          snapped: styles.carouselSlideIsSnapped,
        }),
      ]}
      getEmblaApi={setEmblaApi}
    >
      <H2 id={`${carouselId}-title`} className={styles.carouselHeading}>
        Autoplay example
      </H2>
      <div
        style={{
          display: "flex",
          flexDirection: "column-reverse",
          gap: "var(--salt-spacing-100)",
        }}
      >
        <FlexLayout
          justify="start"
          direction="row"
          gap={1}
          onMouseEnter={stop}
          onFocus={stop}
        >
          <Button
            aria-label={`${isActive ? "stop" : "start"} automatic slide rotation`}
            appearance="bordered"
            sentiment="neutral"
            onClick={() => (isActive ? stop() : play())}
          >
            {isActive ? (
              <PauseIcon style={{ pointerEvents: "none" }} />
            ) : (
              <PlayIcon style={{ pointerEvents: "none" }} />
            )}
          </Button>
          <CarouselPreviousButton onClick={() => stop()} />
          <CarouselNextButton onClick={() => stop()} />
          <CarouselProgressLabel aria-hidden={true} />
          <CarouselAutoplayIndicator
            slideIndex={slideIndex}
            duration={timeUntilNext ? timeUntilNext : DELAY_MSECS}
            isPlaying={isPlaying}
          />
        </FlexLayout>
        <CarouselSlides
          onMouseEnter={() => pause()}
          onMouseLeave={() => {
            if (isPlaying) {
              play();
            }
          }}
          onFocus={() => stop()}
        >
          {sliderData.map((slide, index) => {
            const slideId = `${carouselId}-slide${index}`;
            return (
              <CarouselCard
                appearance="bordered"
                className={styles.carouselSlide}
                key={slideId}
                aria-labelledby={`${slideId}-title`}
                media={
                  <img
                    aria-hidden={true}
                    className={styles.carouselImage}
                    src={slide.image}
                  />
                }
                header={<H3 id={`${slideId}-title`}>{slide.title}</H3>}
                actions={
                  <Link tabIndex={0} href="#">
                    Usage examples
                  </Link>
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
