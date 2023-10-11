import { SVGAttributes } from "react";
import { makePrefixer } from "../../utils";

const withBaseName = makePrefixer("saltSpinner");

// TODO: import these
type Density = "high" | "medium" | "low" | "touch";
type Size = "default" | "nested";

interface SpinnerProps {
  id?: string;
  rest?: Omit<SVGAttributes<SVGSVGElement>, "id">;
  size: Size;
  density: Density;
}

const sizeAndStrokeWidthMapping = {
  default: {
    high: { width: 80, strokeWidth: 4 },
    medium: { width: 112, strokeWidth: 8 },
    low: { width: 144, strokeWidth: 12 },
    touch: { width: 176, strokeWidth: 16 },
  },
  nested: {
    high: { width: 12, strokeWidth: 2 },
    medium: { width: 12, strokeWidth: 2 },
    low: { width: 14, strokeWidth: 2 },
    touch: { width: 16, strokeWidth: 2 },
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
      viewBox="0 0 ${width} ${width}"
      id={id}
      {...rest}
    >
      <defs>
        {/* why does this need -1? */}
        <linearGradient id={`${id}-1`} x1="0" y1="0" x2="100%" y2="0">
          <stop
            className={withBaseName("gradientStop")}
            offset="0%"
            stopOpacity="1"
          />
          <stop
            className={withBaseName("gradientStop")}
            offset="100%"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      {/* what is evenodd? */}
      <g fill="none" fillRule="evenodd">
        {/* This first path draws the top half of the circle no gradient*/}
        <path
          d={`M${width - strokeWidth / 2},${
            width / 2
          } a${radius},${radius} 0 1,0 -${width - strokeWidth},0`}
          stroke="var(--saltSpinner-gradient-color, var(--salt-accent-background)"
          strokeWidth="var(--spinner-strokeWidth)"
          fill="none"
        />
        {/* This second path draws the left half of the circle with a gradient that is opaque on the left and transparent at the end */}
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
