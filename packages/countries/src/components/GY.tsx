// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GYProps = CountrySymbolProps;

const GY = forwardRef<SVGSVGElement, GYProps>(function GY(props: GYProps, ref) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "50%",
  };

  return (
    <CountrySymbol
      data-testid="GY"
      style={style}
      aria-label="Guyana"
      viewBox="0 0 72 72"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-GY-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle
          cx="36"
          cy="36"
          r="36"
          fill="#D9D9D9"
          transform="rotate(-90 36 36)"
        />
      </mask>
      <g mask={`url(#${uid}-GY-a)`}>
        <path fill="#009B77" d="M72 72H0V0h72z" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M63.583 35.5-8.6 68.68V2.32L63.583 35.5Zm-7.183 0L-5.6 7v57l62-28.5Z"
          clipRule="evenodd"
        />
        <path fill="#FBD381" d="M56.4 35.5-5.6 64V7l62 28.5Z" />
        <path
          fill="#31373D"
          fillRule="evenodd"
          d="M30.406 35.5-3.6 73.915v-76.83L30.406 35.5Zm-4.006 0L-.6 66V5l27 30.5Z"
          clipRule="evenodd"
        />
        <path fill="#DD2033" d="M26.4 35.5-.6 66V5l27 30.5Z" />
      </g>
    </CountrySymbol>
  );
});

export default GY;
