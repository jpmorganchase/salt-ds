import type { ComponentPropsWithoutRef } from "react";
import { makePrefixer } from "../../utils";

const withBaseName = makePrefixer("saltSpinner");

type SpinnerSVGProps = ComponentPropsWithoutRef<"svg">;

/**
 * Draws the spinner as two overlapping circles. Each circle is half-stroked
 * (`stroke-dasharray="50 50"` against a normalised `pathLength` of 100) and
 * rotated via `stroke-dashoffset`: the first draws the top half, the second
 * draws the left half with a fading gradient. Radius and stroke width come
 * from CSS custom properties set by the parent `.saltSpinner-*` size class.
 */
export const SpinnerSVG = ({
  id = "svg-spinner",
  ...rest
}: SpinnerSVGProps) => {
  const gradientId = `${id}-1`;

  return (
    <svg
      className={withBaseName("spinner")}
      preserveAspectRatio="xMidYMid meet"
      id={id}
      {...rest}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="50%" y2="0">
          <stop
            className={withBaseName("gradientStop")}
            offset="15%"
            stopOpacity="1"
          />
          <stop
            className={withBaseName("gradientStop")}
            offset="100%"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <circle
        className={withBaseName("arc")}
        cx="50%"
        cy="50%"
        fill="none"
        stroke="var(--saltSpinner-gradient-color, var(--salt-sentiment-accent-background))"
        strokeWidth="var(--spinner-strokeWidth)"
        pathLength="100"
        strokeDasharray="50 50"
        strokeDashoffset="50"
      />
      <circle
        className={withBaseName("arc")}
        cx="50%"
        cy="50%"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="var(--spinner-strokeWidth)"
        pathLength="100"
        strokeDasharray="50 50"
        strokeDashoffset="75"
      />
    </svg>
  );
};
