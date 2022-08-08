import { SVGAttributes } from "react";

const baseName = "uitkSvgSpinner";

export const SpinnerSmall = (props: SVGAttributes<SVGSVGElement>) => (
  <svg className={`${baseName}-spinner`} viewBox="0 0 12 12" {...props}>
    <defs>
      <linearGradient id={`${props.id}-1`} x1="50%" x2="100%" y1="0%" y2="50%">
        <stop className={`${baseName}-gradientStop1`} offset="0%" />
        <stop
          className={`${baseName}-gradientStop2`}
          offset="100%"
          stopOpacity="0"
        />
      </linearGradient>
      <linearGradient
        id={`${props.id}-2`}
        x1="100%"
        x2="0%"
        y1="100%"
        y2="100%"
      >
        <stop className={`${baseName}-gradientStop3`} offset="0%" />
        <stop className={`${baseName}-gradientStop4`} offset="100%" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd" strokeWidth="1">
      <path
        d="M2,6 L2,6 L0,6 C0,9.313 2.687,12 6,12 L6,10 C3.794,10 2,8.206 2,6"
        fill={`url(#${props.id}-1)`}
      />
      <path
        d="M2,6 C2,3.794 3.794,2 6,2 C8.206,2 10,3.794 10,6 L12,6 C12,2.686 9.314,0 6,0 C2.687,0 0,2.686 0,6 L2,6 Z"
        fill={`url(#${props.id}-2)`}
      />
    </g>
  </svg>
);
