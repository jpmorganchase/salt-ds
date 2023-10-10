import { SVGAttributes } from "react";
import { makePrefixer } from "../../utils";

const withBaseName = makePrefixer("saltSpinner");

/* SVG based on MD, do not change viewbox attribute */
export const SpinnerSVG = (props: {
  id?: string;
  rest?: Omit<SVGAttributes<SVGSVGElement>, "id">;
}) => {
  const { id: idProp, rest } = props;
  const id = idProp || "svg-spinner";

  return (
    <svg
      className={withBaseName("spinner")}
      viewBox="0 0 28 28"
      id={id}
      {...rest}
    >
      <defs>
        {/* There is no gradient here */}
        <linearGradient id={`${id}-1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop className={withBaseName("gradientStop")} />
        </linearGradient>

        <linearGradient id={`${id}-2`} x1="0" y1="0" x2="100%" y2="0">
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
      <g fill="none" fillRule="evenodd">
        {/* This first path draws the top half of the circle, with block color/ no gradient*/}
        <path
          // adjusted for bigger radius
          d="M26.7,14 a12.7,12.7 0 1,0 -25.4,0"
          // for radius of 1.4 to fit exactly
          // d="M27.3,14 a13.3,13.3 0 1,0 -26.6,0"
          stroke={`url(#${id}-1)`}
          strokeWidth="1.4"
          fill="none"
        />
        {/* This second path draws the left half of the circle with a gradient that is opaque on the left and transparent at the end */}
        {/* TODO: make it only 1/4 by chaning end position */}
        <path
          d="M14,1.3 a12.7,12.7 0 1,0 0,25.4"
          // d="M14,0.7 a13.3,13.3 0 1,0 0,26.6"
          stroke={`url(#${id}-2)`}
          strokeWidth="1.4"
          fill="none"
        />
      </g>
    </svg>
  );
};
