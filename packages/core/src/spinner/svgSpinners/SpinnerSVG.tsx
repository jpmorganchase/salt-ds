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
        <linearGradient id={`${id}-1`} x1="100%" x2="0%" y1="78%" y2="78%">
          <stop className={withBaseName("gradientStop")} offset="0%" />
          <stop className={withBaseName("gradientStop")} offset="100%" />
        </linearGradient>

        <linearGradient
          id={`${id}-2`}
          gradientUnits="userSpaceOnUse"
          x1="1"
          y1="14"
          x2="27"
          y2="14"
        >
          <stop
            className={withBaseName("gradientStop")}
            offset="2%"
            stopOpacity="0"
          />
          <stop
            className={withBaseName("gradientStop")}
            offset="50%"
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
        <path
          d="M14,1 a13,13 0 1,1 0,26"
          stroke={`url(#${id}-1)`}
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M1,14 a13,13 0 0,1 26,0"
          stroke={`url(#${id}-2)`}
          strokeWidth="1.4"
          fill="none"
        />
      </g>
    </svg>
  );
};
