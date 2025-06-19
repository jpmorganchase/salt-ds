import { makePrefixer, type TextProps } from "@salt-ds/core";
import { useCarouselContext } from "./CarouselContext";
import { useCallback, useEffect, useState } from "react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import carouselProgressBarCss from "./CarouselProgressBar.css";

/**
 * Props for the CarouselPreviousButton component.
 */
export interface CarouselProgressBarProps extends TextProps<"div"> {}

const withBaseName = makePrefixer("saltCarouselProgressBar");

export function CarouselProgressBar({
  className,
  styleAs = "label",
  children,
  ...props
}: CarouselProgressBarProps) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-carousel-progress-bar",
    css: carouselProgressBarCss,
    window: targetWindow,
  });

  const { emblaApi } = useCarouselContext();

  const [offset, setOffset] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(0);
  const [totalTime, setTotalTime] = useState<number>(0);

  const updateCountdown = useCallback(() => {
    if (!emblaApi) return;

    const autoplay = emblaApi.plugins().autoplay;
    const { delay } = autoplay.options;
    if (!autoplay) {
      return;
    }

    const delayOption =
      typeof delay === "function"
        ? delay(emblaApi.scrollSnapList(), emblaApi)
        : delay;
    const delayMsecs = Array.isArray(delayOption)
      ? delayOption[emblaApi.slidesInView()[0]]
      : delayOption;
    const timeUntilNext = autoplay.timeUntilNext();

    if (!timeUntilNext || timeUntilNext < 0 || !delayMsecs) {
      setTimeRemaining(null);
      setOffset(0);
      return;
    }
    setTimeRemaining(timeUntilNext);
    setTotalTime(delayMsecs);

    const progressPercentage = totalTime
      ? ((totalTime - timeUntilNext) / totalTime) * 100
      : 0;
    const circumference = 2 * Math.PI * 10; // Calculate circumference for r=10
    const newOffset =
      circumference - (circumference * progressPercentage) / 100;
    setOffset(newOffset);
  }, [emblaApi, totalTime, timeRemaining]);

  useEffect(() => {
    if (!emblaApi) return;

    const intervalId = setInterval(() => {
      updateCountdown();
    }, 1000);

    emblaApi.on("autoplay:timerset", updateCountdown);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      emblaApi.off("autoplay:timerset", updateCountdown);
    };
  }, [emblaApi, updateCountdown]);

  if (!timeRemaining) {
    return null;
  }

  return (
    <div className={clsx(withBaseName(), className)} aria-label={`Time remaining until next slide: ${Math.round(timeRemaining / 1000)} seconds`} {...props}>
      <svg
        className="embla__progress"
        width="24"
        height="24"
        aria-label="Progress bar showing time until next slide"
      >
        <circle
          className={withBaseName("track")}
          cx="12"
          cy="12"
          r="10"
          strokeWidth="4"
        />
        <circle
          className={withBaseName("bar")}
          style={{ strokeDashoffset: offset }}
          cx="12"
          cy="12"
          r="10"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}
