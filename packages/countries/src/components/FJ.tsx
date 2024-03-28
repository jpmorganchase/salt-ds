// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type FJProps = CountrySymbolProps;

const FJ = forwardRef<SVGSVGElement, FJProps>(function FJ(props: FJProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="FJ"
      aria-label="Fiji"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-FJ-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-FJ-a)`}>
            <path fill="#86C5FA" d="M0 0h72v72H0z" />
            <path
              fill="#F5F7F8"
              d="M40.8 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L51.3 58l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V35Z"
            />
            <mask
              id={`${uid}-FJ-b`}
              x="40"
              y="35"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path
                fill="#F5F7F8"
                d="M40.8 35h21v8.743a14.857 14.857 0 0 1-9.36 13.803L51.3 58l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V35Z"
              />
            </mask>
            <g mask={`url(#${uid}-FJ-b)`}>
              <path
                fill="#DD2033"
                d="M40.8 35h21v6h-9v6h9v3h-9v8h-3v-8h-9v-3h9v-6h-9v-6Z"
              />
            </g>
            <mask
              id={`${uid}-FJ-c`}
              x="0"
              y="0"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path fill="#002F6C" d="M0 36C0 16.118 16.118 0 36 0v36H0Z" />
            </mask>
            <g mask={`url(#${uid}-FJ-c)`}>
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
            id={`${uid}-FJ-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-FJ-a)`}>
            <path fill="#86C5FA" d="M0 0h72v50H0z" />
            <path
              fill="#F5F7F8"
              d="M43.8 21h21v8.743a14.857 14.857 0 0 1-9.36 13.803L54.3 44l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V21Z"
            />
            <mask
              id={`${uid}-FJ-b`}
              x="43"
              y="21"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path
                fill="#F5F7F8"
                d="M43.8 21h21v8.743a14.857 14.857 0 0 1-9.36 13.803L54.3 44l-1.14-.454a14.857 14.857 0 0 1-9.36-13.803V21Z"
              />
            </mask>
            <g mask={`url(#${uid}-FJ-b)`}>
              <path
                fill="#DD2033"
                d="M43.8 21h21v6h-9v6h9v3h-9v8h-3v-8h-9v-3h9v-6h-9v-6Z"
              />
            </g>
            <mask
              id={`${uid}-FJ-c`}
              x="0"
              y="0"
              maskUnits="userSpaceOnUse"
              style={{ maskType: "alpha" }}
            >
              <path fill="#002F6C" d="M0 30V0h36v30H0Z" />
            </mask>
            <g mask={`url(#${uid}-FJ-c)`}>
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
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default FJ;
