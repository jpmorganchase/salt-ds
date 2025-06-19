import { Button, FlexLayout, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  type CarouselApi,
  CarouselAnnouncement,
  CarouselAutoplayIndicator,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import { PauseIcon, PlayIcon } from "@salt-ds/icons";
import { default as AutoplayPlugin } from "embla-carousel-autoplay";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.css";
import { sliderData } from "./exampleData";

const DELAY_MSECS = 8000;

export const Autoplay = () => {
  const slideId = useId();
  const emblaApiRef = useRef<CarouselApi | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const autoplay = useRef(
    AutoplayPlugin({ delay: DELAY_MSECS, playOnInit: false }),
  );

  const play = useCallback(() => {
    autoplay.current.play();
    setIsPlaying(true);
  }, [autoplay.current]);

  const stop = useCallback(() => {
    autoplay.current.stop();
    setIsPlaying(false);
  }, [autoplay.current]);

  const handleSlideChange = useCallback(() => {
    const settledSlideIndex = emblaApiRef.current?.selectedScrollSnap() ?? 0;
    setSlideIndex(settledSlideIndex + 1);
  }, []);

  useEffect(() => {
    const emblaApi = emblaApiRef.current;
    if (!emblaApi?.plugins()?.autoplay) {
      return;
    }

    emblaApi.on("settle", handleSlideChange);
    return () => {
      emblaApi.off("settle", handleSlideChange);
    };
  }, [emblaApiRef.current]);

  const timeUntilNext = autoplay.current.timeUntilNext() ?? DELAY_MSECS;

  return (
    <Carousel
      aria-label="Autoplay example"
      className={styles.carousel}
      emblaOptions={{ loop: true }}
      emblaPlugins={[autoplay.current, CarouselAnnouncement()]}
      emblaApiRef={emblaApiRef}
    >
      <Text styleAs="h2" className={styles.carouselHeading}>
        Title
      </Text>
      <CarouselSlides onMouseEnter={() => stop()} onFocus={() => stop()}>
        {sliderData.map((slide, index) => (
          <CarouselCard
            appearance="bordered"
            className={styles.carouselSlide}
            key={`${slideId}-${index}`}
            id={`${slideId}-${index}`}
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
              tabIndex={1}
            >
              <PauseIcon aria-hidden />
            </Button>
          ) : (
            <Button
              aria-label="Resume play"
              appearance="bordered"
              sentiment="neutral"
              onClick={() => play()}
              tabIndex={1}
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
            aria-label={isPlaying ? `Progress bar indicating time until next slide` : `Carousel paused on slide ${slideIndex}`}
          />
        </StackLayout>
      </FlexLayout>
    </Carousel>
  );
};
