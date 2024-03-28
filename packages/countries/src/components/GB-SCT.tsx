// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GB_SCTProps = CountrySymbolProps;

const GB_SCT = forwardRef<SVGSVGElement, GB_SCTProps>(function GB_SCT(
  props: GB_SCTProps,
  ref
) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="GB_SCT"
      aria-label="Scotland"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-GB-SCT-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-GB-SCT-a)`}>
            <path fill="#005EB8" d="M0 0h72v72H0z" />
            <path
              fill="#F5F7F8"
              d="M65.164 12.364 58.8 6 36.3 28.5 13.888 6.088l-6.364 6.364 22.412 22.412L6.455 58.346l6.364 6.363L36.3 41.228 60.043 64.97l6.364-6.364-23.743-23.743 22.5-22.5Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-GB-SCT-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-GB-SCT-a)`}>
            <path fill="#005EB8" d="M0 0h72v50H0z" />
            <path
              fill="#F5F7F8"
              d="M67.028-.636 60.664-7 36.3 17.364 11.936-7 5.572-.636l24.364 24.364L3.164 50.5l6.364 6.364L36.3 30.092l26.772 26.772 6.364-6.364-26.772-26.772L67.028-.636Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default GB_SCT;
