// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type SXProps = CountrySymbolProps;

const SX = forwardRef<SVGSVGElement, SXProps>(function SX(props: SXProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="SX"
      aria-label="Sint Maarten (Dutch part)"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-SX-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-SX-a)`}>
            <path fill="#004692" d="M0 72V36h72v36z" />
            <path fill="#DD2033" d="M0 36V0h72v36z" />
            <path fill="#F5F7F8" d="M48 36 0 0v72l48-36Z" />
            <path
              fill="#FBD381"
              d="M17.5 30a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM7 48v-5h21v5h-3v3H10v-3H7Z"
            />
            <path
              fill="#86C5FA"
              d="M7 25h21v8.743a14.857 14.857 0 0 1-9.36 13.803L17.5 48l-1.14-.454A14.857 14.857 0 0 1 7 33.743V25Z"
            />
            <path
              fill="#DD2033"
              fillRule="evenodd"
              d="M25 28H10v5.743c0 4.855 2.96 9.22 7.47 11.016l.03.012.03-.012A11.857 11.857 0 0 0 25 33.743V28Zm-7.5 20-1.14-.454A14.857 14.857 0 0 1 7 33.743V25h21v8.743a14.857 14.857 0 0 1-9.36 13.803L17.5 48Z"
              clipRule="evenodd"
            />
            <path
              fill="#F5F7F8"
              d="m16 31 1.5-1.5L19 31v1l3 3v5h-9v-5l3-3v-1Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-SX-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-SX-a)`}>
            <path fill="#004692" d="M0 50V25h72v25z" />
            <path fill="#DD2033" d="M0 25V0h72v25z" />
            <path fill="#F5F7F8" d="M48 25 0-11v72l48-36Z" />
            <path
              fill="#FBD381"
              d="M17.5 19a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM7 37v-5h21v5h-3v3H10v-3H7Z"
            />
            <path
              fill="#86C5FA"
              d="M7 14h21v8.743a14.857 14.857 0 0 1-9.36 13.803L17.5 37l-1.14-.454A14.857 14.857 0 0 1 7 22.743V14Z"
            />
            <path
              fill="#DD2033"
              fillRule="evenodd"
              d="M25 17H10v5.743c0 4.855 2.96 9.22 7.47 11.016l.03.012.03-.012A11.857 11.857 0 0 0 25 22.743V17Zm-7.5 20-1.14-.454A14.857 14.857 0 0 1 7 22.743V14h21v8.743a14.857 14.857 0 0 1-9.36 13.803L17.5 37Z"
              clipRule="evenodd"
            />
            <path
              fill="#F5F7F8"
              d="m16 20 1.5-1.5L19 20v1l3 3v5h-9v-5l3-3v-1Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default SX;
