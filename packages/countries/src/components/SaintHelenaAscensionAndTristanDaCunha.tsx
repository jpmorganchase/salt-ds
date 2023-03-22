// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef, useState } from "react";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SaintHelenaAscensionAndTristanDaCunhaProps = CountrySymbolProps;

const SaintHelenaAscensionAndTristanDaCunha = forwardRef<
  SVGSVGElement,
  SaintHelenaAscensionAndTristanDaCunhaProps
>(function SaintHelenaAscensionAndTristanDaCunha(
  props: SaintHelenaAscensionAndTristanDaCunhaProps,
  ref
) {
  const [uid] = useState(() => props.id || Math.random().toString());

  return (
    <CountrySymbol
      data-testid="SaintHelenaAscensionAndTristanDaCunha"
      aria-label="Saint Helena, Ascension and Tristan da Cunha"
      viewBox="0 0 72 72"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-SH-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
      </mask>
      <g mask={`url(#${uid}-SH-a)`}>
        <path fill="#004692" d="M0 0h72v72H0z" />
        <path
          fill="#F1B434"
          d="M40.4 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L50.9 58l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V35Z"
        />
        <circle cx="50.9" cy="38.5" r="2.5" fill="#FDEFD3" />
        <mask
          id={`${uid}-SH-b`}
          x="40"
          y="42"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#D9D9D9" d="M40.4 42h21v16h-21z" />
        </mask>
        <g mask={`url(#${uid}-SH-b)`}>
          <path
            fill="#86C5FA"
            d="M40.4 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L50.9 58l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V35Z"
          />
          <path fill="#31373D" d="M40.4 42h21v2h-21z" />
        </g>
        <mask
          id={`${uid}-SH-c`}
          x="40"
          y="35"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#F1B434"
            d="M40.4 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L50.9 58l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V35Z"
          />
        </mask>
        <g mask={`url(#${uid}-SH-c)`}>
          <path
            fill="#F5F7F8"
            d="M50.9 50c-2.626 0-2.626 2.182-5.25 2.182-2.625 0-2.625-2.182-5.25-2.182v3.818c2.625 0 2.625 2.182 5.25 2.182 2.624 0 2.624-2.182 5.25-2.182 2.624 0 2.624 2.182 5.25 2.182 2.625 0 2.625-2.182 5.25-2.182V50c-2.625 0-2.625 2.182-5.25 2.182-2.626 0-2.626-2.182-5.25-2.182Z"
          />
        </g>
        <path fill="#936846" d="M51.4 45h-2v2h-2v2h2v4h2v-4h2v-2h-2v-2Z" />
        <path
          fill="#31373D"
          d="M50.9 55.5a4.5 4.5 0 0 0 4.5-4.5h-9a4.5 4.5 0 0 0 4.5 4.5Z"
        />
        <mask
          id={`${uid}-SH-d`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002F6C" d="M0 36C0 16.118 16.118 0 36 0v36H0Z" />
        </mask>
        <g mask={`url(#${uid}-SH-d)`}>
          <path fill="#004692" d="M0 0h36v36H0z" />
          <path
            fill="#F5F7F8"
            d="m12.522 3.134-2.121 2.121 29.526 29.526 2.121-2.121L12.522 3.134ZM6.865 8.79 3.33 12.327l29.526 29.526 3.535-3.535L6.866 8.79Z"
          />
          <path
            fill="#DD2033"
            d="m6.865 8.79 3.536-3.535 29.526 29.526-3.535 3.536L6.864 8.79Z"
          />
          <path fill="#F5F7F8" d="M36 12v5H17v19h-5V12h24Z" />
          <path fill="#F5F7F8" d="M36-2v5H5v33H0V-2h36Z" />
          <path
            fill="#DD2033"
            fillRule="evenodd"
            d="M3 36h9V12h24V3H3v33Z"
            clipRule="evenodd"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default SaintHelenaAscensionAndTristanDaCunha;
