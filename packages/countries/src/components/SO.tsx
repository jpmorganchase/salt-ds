// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SOProps = CountrySymbolProps;

const SO = forwardRef<SVGSVGElement, SOProps>(function SO(props: SOProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="SO"
      aria-label="Somalia"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-SO-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-SO-a)`}>
            <path fill="#0091DA" d="M0 72V0h72v72z" />
            <path
              fill="#F5F7F8"
              d="m36 18-5.365 12.136L18 31.75l9.32 9.115L24.874 54 36 46.5 47.125 54 44.68 40.866 54 31.751l-12.636-1.615L36 18Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-SO-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-SO-a)`}>
            <path fill="#0091DA" d="M0 50V0h72v50z" />
            <path
              fill="#F5F7F8"
              d="m36 7-5.365 12.136L18 20.75l9.32 9.115L24.874 43 36 35.5 47.125 43 44.68 29.866 54 20.751l-12.635-1.615L36 7Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default SO;
