import { Button, FlexLayout, StackLayout, Text, useId } from "@salt-ds/core";
import {
  Carousel,
  type CarouselApi,
  CarouselAnnouncement,
  CarouselProgressBar,
  CarouselCard,
  CarouselNextButton,
  CarouselPreviousButton,
  CarouselProgressLabel,
  CarouselSlides,
} from "@salt-ds/embla-carousel-pattern";
import { PauseIcon, PlayIcon } from "@salt-ds/icons";
import { default as AutoplayPlugin } from "embla-carousel-autoplay";
import {
  type FocusEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./index.module.css";
import { sliderData } from "./exampleData";

export const Autoplay = () => {
  const slideId = useId();
  const emblaApiRef = useRef<CarouselApi | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);

  const autoplay = useRef(AutoplayPlugin({ delay: 20000, playOnInit: false }));

  const handleBlur: FocusEventHandler = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget) && isPlaying) {
      autoplay.current.play();
    }
  };

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: API could update after first render
  useEffect(() => {
    if (!emblaApiRef?.current) {
      return;
    }
    emblaApiRef.current.on("autoplay:play", handlePlay);
    emblaApiRef.current.on("autoplay:stop", handleStop);

    // Cleanup listener on component unmount
    return () => {
      emblaApiRef.current?.off("autoplay:play", handlePlay);
      emblaApiRef.current?.off("autoplay:stop", handleStop);
    };
  }, [emblaApiRef.current]);

  return (
    <Carousel
      aria-label="Account overview"
      className={styles.carousel}
      emblaOptions={{ loop: true }}
      emblaPlugins={[autoplay.current, CarouselAnnouncement()]}
      emblaApiRef={emblaApiRef}
    >
      <Text styleAs={"h2"} className={styles.carouselHeading}>
        Title
      </Text>
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
        {sliderData.map((slide, index) => {
          return (
            <CarouselCard
              appearance={"bordered"}
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
              header={<Text styleAs={"h3"}>{slide.title}</Text>}
            >
              <Text>{slide.content}</Text>
            </CarouselCard>
          );
        })}
      </CarouselSlides>
      <FlexLayout justify={"space-between"} direction={"row"} gap={1}>
        <StackLayout direction={"row"} gap={1}>
          {isPlaying ? (
            <Button
              aria-label="Pause play"
              appearance="bordered"
              sentiment="neutral"
              onClick={() => {
                setIsPlaying(false);
                autoplay.current.stop();
              }}
              tabIndex={1}
            >
              <PauseIcon aria-hidden />
            </Button>
          ) : (
            <Button
              aria-label="Resume play"
              appearance="bordered"
              sentiment="neutral"
              onClick={() => {
                setIsPlaying(true);
                autoplay.current.play();
              }}
              tabIndex={1}
            >
              <PlayIcon aria-hidden />
            </Button>
          )}
          <CarouselPreviousButton onClick={() => autoplay.current.stop()} />
          <CarouselNextButton onClick={() =>  autoplay.current.stop()} />
          <CarouselProgressLabel />
          <CarouselProgressBar />
        </StackLayout>
      </FlexLayout>
    </Carousel>
  );
};
