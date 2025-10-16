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
import { PauseSolidIcon, PlaySolidIcon } from "@salt-ds/icons";
import type { EmblaCarouselType } from "embla-carousel";
import { default as AutoplayPlugin } from "embla-carousel-autoplay";
import Classnames from "embla-carousel-class-names";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { sliderData } from "./exampleData";
import styles from "./index.module.css";

const DELAY_MSECS = 8000;

export const Autoplay = () => {
  const carouselId = useId();
  const [emblaApi, setEmblaApi] = useState<CarouselEmblaApiType | null>(null);
  const [playState, setPlayState] = useState<"stop" | "play" | "pause">("play");
  const manualControlRef = useRef<boolean>(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const autoplay = emblaApi?.plugins().autoplay;

  const play = () => {
    autoplay?.play();
    setPlayState("play");
  };

  const pause = () => {
    autoplay?.stop();
    setPlayState("pause");
  };

  const stop = () => {
    autoplay?.stop();
    setPlayState("stop");
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

  const handlePointerDown = () => {
    stop();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      stop();
    }
  };

  const handleMouseEnter = () => {
    if (!manualControlRef.current && playState === "play") {
      pause();
    }
  };

  const handleMouseLeave = () => {
    if (!manualControlRef.current && playState === "pause") {
      play();
    }
  };

  const handleFocus = () => {
    if (!manualControlRef.current && playState === "play") {
      pause();
    }
  };

  const handleBlur = () => {
    if (!manualControlRef.current && playState === "pause") {
      play();
    }
  };

  const togglePlayState = () => {
    manualControlRef.current = true; // Once a user interaction occurs, then autoplay is furthermore disabled
    if (playState === "play") {
      stop();
    } else {
      play();
    }
  };

  return (
    <Carousel
      aria-labelledby={`${carouselId}-title`}
      className={styles.carousel}
      disableSlideAnnouncements={playState === "play"}
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
      onBlur={handleBlur}
      onFocus={handleFocus}
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
        <FlexLayout justify="start" direction="row" gap={1}>
          <Button
            aria-label={`${playState === "play" ? "stop" : "start"} automatic slide rotation`}
            appearance="bordered"
            sentiment="neutral"
            onPointerDown={() => {
              manualControlRef.current = true;
            }}
            onKeyDown={(event) => {
              if (event.key === "space") {
                manualControlRef.current = true;
              }
            }}
            onClick={togglePlayState}
          >
            {playState === "play" ? (
              <PauseSolidIcon style={{ pointerEvents: "none" }} />
            ) : (
              <PlaySolidIcon style={{ pointerEvents: "none" }} />
            )}
          </Button>
          <CarouselPreviousButton onClick={stop} />
          <CarouselNextButton onClick={stop} />
          <CarouselProgressLabel aria-hidden={true} />
          <CarouselAutoplayIndicator
            slideIndex={slideIndex}
            duration={timeUntilNext ? timeUntilNext : DELAY_MSECS}
            isPlaying={playState === "play"}
          />
        </FlexLayout>
        <CarouselSlides
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onPointerDown={handlePointerDown}
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
