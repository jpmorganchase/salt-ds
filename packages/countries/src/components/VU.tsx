// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type VUProps = CountrySymbolProps;

const VU = forwardRef<SVGSVGElement, VUProps>(function VU(props: VUProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="VU"
      aria-label="Vanuatu"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-VU-a`}
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
              transform="matrix(1 0 0 -1 0 72)"
            />
          </mask>
          <g mask={`url(#${uid}-VU-a)`}>
            <path fill="#DD2033" d="M0 0v27h72V0z" />
            <path fill="#008259" d="M0 45v27h72V45z" />
            <path
              fill="#31373D"
              d="M72 27H50.8l-36-27H7.4v72h7.4l36-27H72V27Z"
            />
            <path fill="#F1B434" d="M72 39H48.8l-44 33V0l44 33H72v6Z" />
            <path fill="#31373D" d="M21.6 36a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
            <path
              fill="#31373D"
              fillRule="evenodd"
              d="m-4.4 0 48 36-48 36V0Zm32 36c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10Z"
              clipRule="evenodd"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-VU-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-VU-a)`}>
            <path fill="#DD2033" d="M0-11v27h72v-27z" />
            <path fill="#008259" d="M0 34v27h72V34z" />
            <path
              fill="#31373D"
              d="M72 16H48.8l-36-27H5.4v72h7.4l36-27H72V16Z"
            />
            <path fill="#F1B434" d="M72 28H45.8l-44 33v-72l44 33H72v6Z" />
            <path fill="#31373D" d="M18.6 25a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
            <path
              fill="#31373D"
              fillRule="evenodd"
              d="m-7.4-11 48 36-48 36v-72Zm32 36c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10Z"
              clipRule="evenodd"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default VU;
