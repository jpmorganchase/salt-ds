import { makePrefixer } from "@salt-ds/core";
import clsx from "classnames";
import { type Ref, type SVGAttributes, forwardRef } from "react";

const withBaseName = makePrefixer("saltCarouselAutoplayIndicatorSVG");

export interface CarouselAutoplayIndicatorSVGProps
  extends SVGAttributes<SVGSVGElement> {
  /**
   * Class name to apply to the SVG element.
   */
  className?: string;
  /**
   * Ref to attach to progress indicator element
   */
  barRef: Ref<SVGCircleElement>;
  /**
   * Size of the SVG in pixels.
   */
  size: number;
  /**
   * Stroke width of the progress indicator in pixels.
   */
  strokeWidth: number;
  /**
   * Radius of the progress indicator circle.
   */
  radius: number;
}

export const CarouselAutoplayIndicatorSVG = forwardRef<
  SVGSVGElement,
  CarouselAutoplayIndicatorSVGProps
>(
  (
    {
      barRef,
      className,
      radius,
      size,
      strokeWidth,
    }: CarouselAutoplayIndicatorSVGProps,
    ref,
  ) => {
    return (
      <svg
        className={clsx(withBaseName(), className)}
        width={size}
        height={size}
        aria-hidden
        ref={ref}
      >
        <circle
          className={withBaseName("track")}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={barRef}
          className={withBaseName("bar")}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
      </svg>
    );
  },
);
