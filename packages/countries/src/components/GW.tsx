// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GWProps = CountrySymbolProps;

const GW = forwardRef<SVGSVGElement, GWProps>(function GW(props: GWProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="GW"
      aria-label="Guinea-Bissau"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-GW-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-GW-a)`}>
            <path fill="#009B77" d="M0 72V36h72v36z" />
            <path fill="#F1B434" d="M0 36V0h72v36z" />
            <path fill="#DD2033" d="M0 0h32v72H0z" />
            <path
              fill="#31373D"
              d="m17 25-3.279 7.416L6 33.403l5.695 5.57L10.201 47 17 42.417 23.799 47l-1.494-8.026L28 33.404l-7.721-.988L17 25Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-GW-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-GW-a)`}>
            <path fill="#009B77" d="M0 50V25h72v25z" />
            <path fill="#F1B434" d="M0 25V0h72v25z" />
            <path fill="#DD2033" d="M0 0h34v50H0z" />
            <path
              fill="#31373D"
              d="m17 14-3.279 7.416L6 22.403l5.695 5.57L10.201 36 17 31.417 23.799 36l-1.494-8.026L28 22.404l-7.721-.988L17 14Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default GW;
