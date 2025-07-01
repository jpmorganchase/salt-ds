import {
  Button,
  FlexLayout,
  Link,
  StackLayout,
  Text,
  useId,
} from "@salt-ds/core";
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
import type { EmblaCarouselType } from "embla-carousel";
import { default as AutoplayPlugin } from "embla-carousel-autoplay";
import Classnames from "embla-carousel-class-names";
import { useEffect, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

const DELAY_MSECS = 8000;
const SETTLE_PIXEL_THRESHOLD = 10;

export const Autoplay = () => {
  const slideId = useId();
  const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  return (
    <div className={"saltCarouselAutoplayExample"}>
      <Carousel
        aria-label="Autoplay example"
        className={styles.carousel}
        emblaOptions={{ loop: true, duration: 20 }}
        emblaPlugins={[
          AutoplayPlugin({ delay: DELAY_MSECS, playOnInit: false }),
          Classnames({
            snapped: styles.carouselSlideIsSnapped,
          }),
          CarouselAnnouncement(),
        ]}
        getEmblaApi={setEmblaApi}
      >
        <Text styleAs="h2" className={styles.carouselHeading}>
          Title
        </Text>
        <CarouselSlides
          onMouseEnter={() => pause()}
          onMouseLeave={() => {
            if (isPlaying) {
              play();
            }
          }}
          onFocus={() => stop()}
        >
          {sliderData.map((slide, index) => (
            <CarouselCard
              appearance="bordered"
              className={styles.carouselSlide}
              key={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
              id={`${slideId}-${slide.title.replace(/ /g, "-")}-${index}`}
              aria-label={slide.title}
              media={
                <img
                  alt={`stock content to show in carousel slide ${index}`}
                  className={styles.carouselImage}
                  src={slide.image}
                />
              }
              header={<Text styleAs="h3">{slide.title}</Text>}
              actions={
                <Link aria-label={"demo action"} tabIndex={0} href="#">
                  Usage examples
                </Link>
              }
            >
              <Text>{slide.content}</Text>
            </CarouselCard>
          ))}
        </CarouselSlides>
        <FlexLayout justify="space-between" direction="row" gap={1}>
          <StackLayout direction="row" gap={1}>
            {isPlaying && !isPaused ? (
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
              isPaused={isPlaying && isPaused}
              aria-label={
                isPlaying
                  ? "Progress bar indicating time until next slide"
                  : `Carousel paused on slide ${slideIndex}`
              }
            />
          </StackLayout>
        </FlexLayout>
      </Carousel>
    </div>
  );
};
