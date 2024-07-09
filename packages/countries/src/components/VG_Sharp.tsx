import { useId } from "@salt-ds/core";
import { clsx } from "clsx";
// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type VG_SharpProps = CountrySymbolProps;

const VG_Sharp = forwardRef<SVGSVGElement, VG_SharpProps>(function VG_Sharp(
  props: VG_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="VG_Sharp"
      aria-label="Virgin Islands (British)"
      viewBox="0 0 72 50"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-VG-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-VG-a)`}>
        <path fill="#004692" d="M0 0h72v50H0z" />
        <mask
          id={`${uid}-VG-b`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002F6C" d="M0 30V0h36v30H0Z" />
        </mask>
        <g mask={`url(#${uid}-VG-b)`}>
          <path fill="#004692" d="M0 0h36v36H0z" />
          <path
            fill="#F5F7F8"
            d="m12.79 1.005-2.12 2.121 26.197 26.197 2.12-2.121L12.792 1.005ZM7.134 6.662l-3.536 3.535 26.197 26.197 3.536-3.535L7.134 6.662Z"
          />
          <path
            fill="#DD2033"
            d="m7.134 6.662 3.535-3.536 26.198 26.197-3.536 3.536L7.134 6.662Z"
          />
          <path fill="#F5F7F8" d="M6 35h4.002V9H36V5H6v30Z" />
          <path fill="#DD2033" d="M0 35h6.002V5h30V0H0v35Z" />
        </g>
        <path fill="#FBD381" d="M65 35H44v5h3v3h15v-3h3v-5Z" />
        <path
          fill="#008259"
          d="M44 17h21v8.743a14.857 14.857 0 0 1-9.36 13.803L54.5 40l-1.14-.454A14.857 14.857 0 0 1 44 25.743V17Z"
        />
        <path fill="#F5F7F8" d="M52 21h5v15h-5z" />
        <path
          fill="#F1B434"
          d="M47.5 22a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm14 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm1.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM47.5 27a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM63 30.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM47.5 32a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default VG_Sharp;
