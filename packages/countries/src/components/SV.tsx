// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SVProps = CountrySymbolProps;

const SV = forwardRef<SVGSVGElement, SVProps>(function SV(props: SVProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="SV"
      aria-label="El Salvador"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-SV-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-SV-a)`}>
            <path fill="#005EB8" d="M0 0h72v72H0z" />
            <path fill="#F5F7F8" d="M0 52V20h72v32z" />
            <path
              fill="#009B77"
              fillRule="evenodd"
              d="M20 23.746A17.922 17.922 0 0 0 18 32c0 9.941 8.059 18 18 18s18-8.059 18-18c0-2.975-.722-5.782-2-8.254v.411l-5.202 2.601A11.951 11.951 0 0 1 48 32c0 6.627-5.373 12-12 12s-12-5.373-12-12c0-1.88.432-3.658 1.202-5.242L20 24.157v-.411Z"
              clipRule="evenodd"
            />
            <path fill="#FBD381" d="m36 24 9 14H27l9-14Z" />
            <path fill="#009B77" d="M27 38h18l-4.5-7h-9L27 38Z" />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-SV-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-SV-a)`}>
            <path fill="#005EB8" d="M0 0h72v50H0z" />
            <path fill="#F5F7F8" d="M0 41V9h72v32z" />
            <path
              fill="#009B77"
              fillRule="evenodd"
              d="M20 12.746A17.922 17.922 0 0 0 18 21c0 9.941 8.059 18 18 18s18-8.059 18-18c0-2.975-.722-5.782-2-8.254v.411l-5.202 2.601A11.951 11.951 0 0 1 48 21c0 6.627-5.373 12-12 12s-12-5.373-12-12c0-1.88.432-3.658 1.202-5.242L20 13.157v-.411Z"
              clipRule="evenodd"
            />
            <path fill="#FBD381" d="m36 13 9 14H27l9-14Z" />
            <path fill="#009B77" d="M27 27h18l-4.5-7h-9L27 27Z" />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default SV;
