// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GB_ENGProps = CountrySymbolProps;

const GB_ENG = forwardRef<SVGSVGElement, GB_ENGProps>(function GB_ENG(
  props: GB_ENGProps,
  ref
) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="GB_ENG"
      aria-label="England"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-GB-ENG-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-GB-ENG-a)`}>
            <path fill="#F5F7F8" d="M0 0h72v72H0z" />
            <path
              fill="#DD2033"
              d="M30.4 72h12V42H72V30H42.4V0h-12v30H0v12h30.4v30Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-GB-ENG-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-GB-ENG-a)`}>
            <path fill="#F5F7F8" d="M0 0h72v50H0z" />
            <path
              fill="#DD2033"
              d="M30.4 50h12V31H72V19H42.4V0h-12v19H0v12h30.4v19Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default GB_ENG;
