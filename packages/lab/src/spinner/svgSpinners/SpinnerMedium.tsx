import { SVGAttributes } from "react";

const baseName = "uitkSvgSpinner";

export const SpinnerMedium = (props: SVGAttributes<SVGSVGElement>) => (
  <svg className={`${baseName}-spinner`} viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient
        id={`${props.id}-1`}
        x1="100%"
        x2="0%"
        y1="75.6597923%"
        y2="75.6597923%"
      >
        <stop className={`${baseName}-gradientStop1`} offset="0%" />
        <stop className={`${baseName}-gradientStop2`} offset="100%" />
      </linearGradient>
      <linearGradient
        id={`${props.id}-2`}
        x1="25.4178365%"
        x2="100%"
        y1="8.36237837%"
        y2="74.0069615%"
      >
        <stop className={`${baseName}-gradientStop3`} offset="0%" />
        <stop
          className={`${baseName}-gradientStop4`}
          offset="100%"
          stopOpacity="0"
        />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd" strokeWidth="1">
      <path
        d="M12,0 C5.373,0 0,5.373 0,12 L2,12 C2,6.486 6.486,2 12,2 C17.514,2 22,6.486 22,12 L24,12 C24,5.373 18.627,0 12,0"
        fill={`url(#${props.id}-1)`}
      />
      <path
        d="M0,12.0005 C0,18.6275 5.373,24.0005 12,24.0005 L12,22.0005 C6.486,22.0005 2,17.5145 2,12.0005 L0,12.0005 Z"
        fill={`url(#${props.id}-2)`}
      />
    </g>
  </svg>
);
