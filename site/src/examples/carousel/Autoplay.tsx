import { Button, FlexLayout, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  CarouselAnnouncement,
  CarouselAutoplayIndicator,
  CarouselCard,
  type CarouselEmblaApiType,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel";
import { PauseIcon, PlayIcon } from "@salt-ds/icons";
import { default as AutoplayPlugin } from "embla-carousel-autoplay";
import { useCallback, useEffect, useRef, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

const DELAY_MSECS = 8000;

export const Autoplay = () => {
  const slideId = useId();
  const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const autoplay = useRef(
    AutoplayPlugin({ delay: DELAY_MSECS, playOnInit: false }),
  );

  const play = useCallback(() => {
    autoplay.current.play();
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    autoplay.current.stop();
    setIsPlaying(false);
  }, []);

  const handleSlideChange = useCallback(() => {
    const settledSlideIndex = emblaApi?.selectedScrollSnap() ?? 0;
    setSlideIndex(settledSlideIndex + 1);
  }, [emblaApi]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: emblaApiRef.current can update
  useEffect(() => {
    if (!emblaApi || !emblaApi.plugins()?.autoplay) {
      return;
    }

    emblaApi.on("settle", handleSlideChange);
    return () => {
      emblaApi.off("settle", handleSlideChange);
    };
  }, [emblaApi, handleSlideChange]);

  const timeUntilNext = autoplay.current.timeUntilNext() ?? DELAY_MSECS;

  return (
    <Carousel
      aria-label="Autoplay example"
      className={styles.carousel}
      emblaOptions={{ loop: true }}
      emblaPlugins={[autoplay.current, CarouselAnnouncement()]}
      getEmblaApi={setEmblaApi}
    >
      <Text styleAs="h2" className={styles.carouselHeading}>
        Title
      </Text>
      <CarouselSlides onMouseEnter={() => stop()} onFocus={() => stop()}>
        {sliderData.map((slide, index) => (
          <CarouselCard
            appearance="bordered"
            className={styles.carouselSlide}
            key={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
            id={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
            aria-label={`Example slide ${index + 1}`}
            media={
              <img
                alt={`stock content to show in carousel slide ${index}`}
                className={styles.carouselImage}
                src={slide.image}
              />
            }
            header={<Text styleAs="h3">{slide.title}</Text>}
          >
            <Text>{slide.content}</Text>
          </CarouselCard>
        ))}
      </CarouselSlides>
      <FlexLayout justify="space-between" direction="row" gap={1}>
        <StackLayout direction="row" gap={1}>
          {isPlaying ? (
            <Button
              aria-label="Pause play"
              appearance="bordered"
              sentiment="neutral"
              onClick={() => stop()}
            >
              <PauseIcon aria-hidden />
            </Button>
          ) : (
            <Button
              aria-label="Resume play"
              appearance="bordered"
              sentiment="neutral"
              onClick={() => play()}
            >
              <PlayIcon aria-hidden />
            </Button>
          )}
          <CarouselPreviousButton onClick={() => stop()} />
          <CarouselNextButton onClick={() => stop()} />
          <CarouselProgressLabel />
          <CarouselAutoplayIndicator
            slideIndex={slideIndex}
            duration={timeUntilNext ? timeUntilNext : DELAY_MSECS}
            isPlaying={isPlaying}
            aria-label={
              isPlaying
                ? "Progress bar indicating time until next slide"
                : `Carousel paused on slide ${slideIndex}`
            }
          />
        </StackLayout>
      </FlexLayout>
    </Carousel>
  );
};
