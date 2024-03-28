// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PNProps = CountrySymbolProps;

const PN = forwardRef<SVGSVGElement, PNProps>(function PN(props: PNProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="PN"
      aria-label="Pitcairn"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-PN-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-PN-a)`}>
            <path fill="#004692" d="M0 0h72v72H0z" />
            <path fill="#C1C3C3" d="M46 27.177h9v8h-9z" />
            <path fill="#008259" d="M47 20.177h2.5v3H53v4h-6v-7Z" />
            <path
              fill="#86C5FA"
              d="M40 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L50.5 58l-1.14-.454A14.857 14.857 0 0 1 40 43.743V35Z"
            />
            <mask
              id={`${uid}-PN-b`}
              x="40"
              y="35"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path
                fill="#86C5FA"
                d="M40 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L50.5 58l-1.14-.454A14.857 14.857 0 0 1 40 43.743V35Z"
              />
            </mask>
            <g mask={`url(#${uid}-PN-b)`}>
              <path fill="#FBD381" d="M50.5 35 61 58H40l10.5-23Z" />
              <path fill="#008259" d="m50.5 40.177 10.5 23H40l10.5-23Z" />
            </g>
            <mask
              id={`${uid}-PN-c`}
              x="0"
              y="0"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path fill="#002F6C" d="M0 36C0 16.118 16.118 0 36 0v36H0Z" />
            </mask>
            <g mask={`url(#${uid}-PN-c)`}>
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
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-PN-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-PN-a)`}>
            <path fill="#004692" d="M0 0h72v50H0z" />
            <mask
              id={`${uid}-PN-b`}
              x="0"
              y="0"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path fill="#002F6C" d="M0 30V0h36v30H0Z" />
            </mask>
            <g mask={`url(#${uid}-PN-b)`}>
              <path fill="#004692" d="M0 0h36v36H0z" />
              <path
                fill="#F5F7F8"
                d="m12.79 1.005-2.12 2.12 26.197 26.198 2.12-2.121L12.792 1.005ZM7.134 6.661l-3.536 3.536 26.197 26.197 3.536-3.535L7.134 6.66Z"
              />
              <path
                fill="#DD2033"
                d="m7.134 6.661 3.535-3.535 26.198 26.197-3.536 3.535L7.134 6.662Z"
              />
              <path fill="#F5F7F8" d="M6 35h4.002V9H36V5H6v30Z" />
              <path fill="#DD2033" d="M0 35h6.002V5h30V0H0v35Z" />
            </g>
            <path fill="#C1C3C3" d="M50 12.033h9v8.037h-9z" />
            <path fill="#008259" d="M51 5h2.5v3.014H57v4.019h-6V5Z" />
            <path
              fill="#86C5FA"
              d="M44 19.893h21v8.848a14.857 14.857 0 0 1-9.338 13.794L54.5 43l-1.162-.465A14.857 14.857 0 0 1 44 28.741v-8.848Z"
            />
            <mask
              id={`${uid}-PN-c`}
              x="44"
              y="19"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path
                fill="#86C5FA"
                d="M44 19.893h21v8.848a14.857 14.857 0 0 1-9.338 13.794L54.5 43l-1.162-.465A14.857 14.857 0 0 1 44 28.741v-8.848Z"
              />
            </mask>
            <g mask={`url(#${uid}-PN-c)`}>
              <path fill="#FBD381" d="M54.5 19.893 65 43H44l10.5-23.107Z" />
              <path fill="#008259" d="M54.5 25.093 65 48.201H44l10.5-23.108Z" />
            </g>
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default PN;
