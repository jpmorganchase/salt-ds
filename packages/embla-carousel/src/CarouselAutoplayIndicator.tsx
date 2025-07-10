import { makePrefixer, useDensity } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import carouselAutoplayIndicator from "./CarouselAutoplayIndicator.css";
import { CarouselAutoplayIndicatorSVG } from "./CarouselAutoplayIndicatorSVG";

export interface CarouselAutoplayIndicatorProps
  extends ComponentPropsWithoutRef<"div"> {
  /**
   * Duration of each slide in milliseconds.
   */
  duration: number;
  /**
   * Index of slide currently displayed.
   */
  slideIndex: number;
  /**
   * If `true`, the indicator is animated to visualize the time until the next slide.
   */
  isPlaying: boolean;
  /**
   * If `true`, the animation is paused.
   */
  isPaused?: boolean;
}

const withBaseName = makePrefixer("saltCarouselAutoplayIndicator");

const sizeAndStrokeWidthMapping = {
  high: { size: 10, strokeWidth: 2 },
  medium: { size: 12, strokeWidth: 2 },
  low: { size: 14, strokeWidth: 2 },
  touch: { size: 16, strokeWidth: 2 },
};

export const CarouselAutoplayIndicator = forwardRef<
  HTMLDivElement,
  CarouselAutoplayIndicatorProps
>(
  (
    {
      className,
      duration,
      slideIndex,
      isPlaying,
      isPaused = false,
      children,
      ...props
    },
    ref,
  ) => {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-carousel-autoplay-indicator",
      css: carouselAutoplayIndicator,
      window: targetWindow,
    });

    const barRef = useRef<SVGCircleElement>(null);
    const animationFrameId = useRef<number | null>(null);

    const density = useDensity();
    const { size, strokeWidth } = sizeAndStrokeWidthMapping[density];
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
      if (barRef.current) {
        animationFrameId.current = requestAnimationFrame(() => {
          if (!barRef.current) {
            return;
          }
          barRef.current.style.animation = "none"; // Reset animation
          barRef.current.style.strokeDashoffset = `${circumference}`;
          animationFrameId.current = requestAnimationFrame(() => {
            if (!barRef.current) {
              return;
            }
            barRef.current.style.animation = `indicatorAnimation ${duration}ms linear`;
            barRef.current.style.animationPlayState = isPaused
              ? "paused"
              : isPlaying
                ? "running"
                : "paused";
          });
        });
      }

      return () => {
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      };
    }, [circumference, duration, slideIndex, isPlaying, isPaused]);

    return (
      <div
        ref={ref}
        style={{
          width: size,
          height: size,
          // @ts-ignore
          "--carousel-svg-circumference": circumference,
        }}
        className={clsx(withBaseName(), className)}
        {...props}
      >
        <CarouselAutoplayIndicatorSVG
          size={size}
          strokeWidth={strokeWidth}
          barRef={barRef}
          radius={radius}
        />
      </div>
    );
  },
);
