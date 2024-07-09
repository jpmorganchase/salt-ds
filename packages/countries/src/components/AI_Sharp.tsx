import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type AI_SharpProps = CountrySymbolProps;

const AI_Sharp = forwardRef<SVGSVGElement, AI_SharpProps>(function AI_Sharp(
  props: AI_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="AI_Sharp"
      aria-label="Anguilla"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-AI-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-AI-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <path
          fill="#F5F7F8"
          d="M44.2 21h21v8.743a14.857 14.857 0 0 1-9.36 13.803L54.7 44l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V21Z"
        />
        <mask
          id={`${uid}-AI-b`}
          x="44"
          y="36"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#D9D9D9" d="M44.2 36h22v8h-22z" />
        </mask>
        <g mask={`url(#${uid}-AI-b)`}>
          <path
            fill="#3CCBDA"
            d="M44.2 21h21v8.743a14.857 14.857 0 0 1-9.36 13.803L54.7 44l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V21Z"
          />
        </g>
        <circle cx="51.7" cy="29.5" r="2.5" fill="#FF9E42" />
        <circle cx="56.7" cy="25.5" r="2.5" fill="#FF9E42" />
        <circle cx="58.7" cy="31.5" r="2.5" fill="#FF9E42" />
        <mask
          id={`${uid}-AI-c`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002F6C" d="M0 30V0h36v30H0Z" />
        </mask>
        <g mask={`url(#${uid}-AI-c)`}>
          <path
            fill="#F5F7F8"
            d="m12.79 1.005-2.12 2.12 26.197 26.198 2.12-2.121L12.792 1.005ZM7.134 6.661l-3.536 3.536 26.197 26.197 3.536-3.536L7.134 6.661Z"
          />
          <path
            fill="#DD2033"
            d="m7.134 6.661 3.535-3.535 26.198 26.197-3.536 3.535L7.134 6.661Z"
          />
          <path fill="#F5F7F8" d="M6 35h4.002V9H36V5H6v30Z" />
          <path fill="#DD2033" d="M0 35h6.002V5h30V0H0v35Z" />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default AI_Sharp;
