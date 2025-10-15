import type { SVGAttributes } from "react";
import type { Density } from "../../theme";
import { makePrefixer } from "../../utils";
import type { SpinnerSVGSize } from "../Spinner";

const withBaseName = makePrefixer("saltSpinner");

interface SpinnerProps {
  id?: string;
  rest?: Omit<SVGAttributes<SVGSVGElement>, "id">;
  size: SpinnerSVGSize;
  density: Density;
}

const sizeAndStrokeWidthMapping = {
  small: {
    high: { width: 12, strokeWidth: 2 },
    medium: { width: 12, strokeWidth: 2 },
    low: { width: 14, strokeWidth: 2 },
    touch: { width: 16, strokeWidth: 2 },
    mobile: { width: 16, strokeWidth: 2 },
  },
  medium: {
    high: { width: 20, strokeWidth: 2 },
    medium: { width: 28, strokeWidth: 4 },
    low: { width: 36, strokeWidth: 6 },
    touch: { width: 44, strokeWidth: 8 },
    mobile: { width: 44, strokeWidth: 8 },
  },
  large: {
    high: { width: 40, strokeWidth: 2 },
    medium: { width: 56, strokeWidth: 4 },
    low: { width: 72, strokeWidth: 6 },
    touch: { width: 88, strokeWidth: 8 },
    mobile: { width: 88, strokeWidth: 8 },
  },
};

export const SpinnerSVG = ({
  id = "svg-spinner",
  rest,
  size,
  density,
}: SpinnerProps) => {
  const { width, strokeWidth } = sizeAndStrokeWidthMapping[size][density];
  const radius = (width - strokeWidth) / 2;

  return (
    <svg
      className={withBaseName("spinner")}
      viewBox={`0 0 ${width} ${width}`}
      id={id}
      {...rest}
    >
      <defs>
        <linearGradient id={`${id}-1`} x1="0" y1="0" x2="100%" y2="0">
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
      <g fill="none">
        {/*
          This first path draws the top half of the circle without a gradient.
          It starts from the right end, moves in a circular arc, and ends at the left end.
        */}
        <path
          d={`M${width - strokeWidth / 2},${
            width / 2
          } a${radius},${radius} 0 1,0 -${width - strokeWidth},0`}
          stroke="var(--saltSpinner-gradient-color, var(--salt-accent-background)"
          strokeWidth="var(--spinner-strokeWidth)"
          fill="none"
        />
        {/*
          This second path draws the left half of the circle with a gradient that transitions
          from opaque on the left to transparent on the right.
          It starts from the top-center, moves in a circular arc, and ends at the bottom-center.
        */}
        <path
          d={`M${width / 2},${strokeWidth / 2} a${radius},${radius} 0 1,0 0,${
            width - strokeWidth
          }`}
          stroke={`url(#${id}-1)`}
          strokeWidth="var(--spinner-strokeWidth)"
          fill="none"
        />
      </g>
    </svg>
  );
};
