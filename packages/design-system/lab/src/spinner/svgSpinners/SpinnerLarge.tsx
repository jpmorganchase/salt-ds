import { SVGAttributes } from "react";

const baseName = "uitkSvgSpinner";

export const SpinnerLarge = (props: SVGAttributes<SVGSVGElement>) => (
  <svg className={`${baseName}-spinner`} viewBox="0 0 48 48" {...props}>
    <defs>
      <linearGradient id={`${props.id}-1`} x1="13%" x2="100%" y1="0%" y2="87%">
        <stop className={`${baseName}-gradientStop1`} offset="0%" />
        <stop
          className={`${baseName}-gradientStop2`}
          offset="100%"
          stopOpacity="0"
        />
      </linearGradient>
      <linearGradient id={`${props.id}-2`} x1="100%" x2="0%" y1="78%" y2="78%">
        <stop className={`${baseName}-gradientStop3`} offset="0%" />
        <stop className={`${baseName}-gradientStop4`} offset="100%" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd" strokeWidth="1">
      <path
        d="M2,24 L0,24 C0,37.255 10.745,48 24,48 L24,46 C11.869,46 2,36.131 2,24"
        fill={`url(#${props.id}-1)`}
      />
      <path
        d="M24,0 C10.745,0 0,10.745 0,24 L2,24 C2,11.869 11.869,2 24,2 C36.131,2 46,11.869 46,24 L48,24 C48,10.745 37.255,0 24,0"
        fill={`url(#${props.id}-2)`}
      />
    </g>
  </svg>
);
