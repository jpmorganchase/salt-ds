// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type TLProps = CountrySymbolProps;

const TL = forwardRef<SVGSVGElement, TLProps>(function TL(props: TLProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="TL"
      aria-label="Timor-Leste"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-TL-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-TL-a)`}>
            <path fill="#DD2033" d="M0 0h72v72H0z" />
            <path fill="#FBD381" d="M66 36 0 0v72l66-36Z" />
            <path fill="#31373D" d="M48 36 0 0v72l48-36Z" />
            <path
              fill="#F5F7F8"
              d="m14.636 29.636 2.394 6.188-3.896 5.038 6.517-.072 3.78 5.507 1.281-6.585 6.585-1.281-5.507-3.78.072-6.517-5.038 3.896-6.188-2.394Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-TL-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-TL-a)`}>
            <path fill="#DD2033" d="M0 0h72v50H0z" />
            <path fill="#FBD381" d="M59 25 0-11v72l59-36Z" />
            <path fill="#31373D" d="M40 25 0-11v72l40-36Z" />
            <path
              fill="#F5F7F8"
              d="m9.636 18.636 2.394 6.188-3.896 5.038 6.517-.072 3.78 5.507 1.281-6.585 6.585-1.281-5.507-3.78.072-6.517-5.038 3.896-6.188-2.394Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default TL;
