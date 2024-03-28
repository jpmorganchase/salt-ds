// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type UMProps = CountrySymbolProps;

const UM = forwardRef<SVGSVGElement, UMProps>(function UM(props: UMProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="UM"
      aria-label="United States Minor Outlying Islands (the)"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-UM-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-UM-a)`}>
            <path fill="#F5F7F8" d="M0 63V0h72v63z" />
            <path
              fill="#DD2033"
              d="M36 18V9h36v9zm0 18v-9h36v9zM0 54v-9h72v9zm0 18v-9h72v9z"
            />
            <path fill="#004692" d="M0 36V0h36v36z" />
            <path
              fill="#F5F7F8"
              d="m28.4 22-1.788 4.045-4.212.539 3.106 3.038L24.692 34l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L28.4 22Zm0-24-1.788 4.045-4.212.539 3.106 3.038L24.692 10 28.4 7.5l3.708 2.5-.814-4.378L34.4 2.584l-4.212-.539L28.4-2Zm-8 12-1.788 4.045-4.212.539 3.106 3.038L16.692 22l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L20.4 10Zm-9 12-1.79 4.045-4.211.539 3.106 3.038L7.692 34l3.708-2.5 3.708 2.5-.815-4.378 3.107-3.038-4.212-.539L11.4 22Zm0-24L9.61 2.045l-4.21.539 3.106 3.038L7.692 10 11.4 7.5l3.708 2.5-.815-4.378L17.4 2.584l-4.212-.539L11.4-2Zm-8 12-1.79 4.045-4.211.539 3.106 3.038L-.308 22 3.4 19.5 7.108 22l-.814-4.378L9.4 14.584l-4.212-.539L3.4 10Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-UM-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-UM-a)`}>
            <path fill="#F5F7F8" d="M0 59V-4h72v63z" />
            <path
              fill="#DD2033"
              d="M36 14V5h36v9zm0 18v-9h36v9zM0 50v-9h72v9z"
            />
            <path fill="#004692" d="M0 32V0h36v32z" />
            <path
              fill="#F5F7F8"
              d="m28.4 18-1.788 4.045-4.212.539 3.106 3.038L24.692 30l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L28.4 18Zm0-24-1.788 4.045-4.212.539 3.106 3.038L24.692 6 28.4 3.5 32.108 6l-.814-4.378L34.4-1.416l-4.212-.539L28.4-6Zm-8 12-1.788 4.045-4.212.539 3.106 3.038L16.692 18l3.708-2.5 3.708 2.5-.814-4.378 3.106-3.038-4.212-.539L20.4 6Zm-9 12-1.79 4.045-4.211.539 3.106 3.038L7.692 30l3.708-2.5 3.708 2.5-.815-4.378 3.107-3.038-4.212-.539L11.4 18Zm0-24L9.61-1.955l-4.21.539 3.106 3.038L7.692 6 11.4 3.5 15.108 6l-.815-4.378L17.4-1.416l-4.212-.539L11.4-6Zm-8 12-1.79 4.045-4.211.539 3.106 3.038L-.308 18 3.4 15.5 7.108 18l-.814-4.378L9.4 10.584l-4.212-.539L3.4 6Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default UM;
