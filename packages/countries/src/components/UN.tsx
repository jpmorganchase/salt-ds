// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type UNProps = CountrySymbolProps;

const UN = forwardRef<SVGSVGElement, UNProps>(function UN(props: UNProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="UN"
      aria-label="United Nations"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-UN-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-UN-a)`}>
            <path fill="#86C5FA" d="M0 0h72v72H0z" />
            <path
              fill="#F5F7F8"
              fillRule="evenodd"
              d="M44.697 56.214C52.522 52.843 58 45.061 58 36c0-4.666-1.453-8.993-3.93-12.553a22.117 22.117 0 0 0-1.898-2.362l-3.437 3.653A16.936 16.936 0 0 1 53 36c0 9.389-7.611 17-17 17s-17-7.611-17-17c0-4.53 1.772-8.645 4.66-11.693l-3.43-3.646a22.129 22.129 0 0 0-1.954 2.303A21.902 21.902 0 0 0 14 36c0 9.445 5.952 17.5 14.31 20.619.976.364 1.985.66 3.02.884a3.73 3.73 0 0 0-.846 2.886 3.733 3.733 0 0 0 1.068 2.174L36.116 58c.333-.002.665-.011.994-.028l4.591 4.591a3.736 3.736 0 0 0 1.06-3.182 3.732 3.732 0 0 0-1.06-2.12l-.006-.005.017-.005a21.825 21.825 0 0 0 2.985-1.037ZM33.6 40.388a4.93 4.93 0 0 0 1 .413v4.09a8.96 8.96 0 0 1-4.437-2.04l2.845-2.844a5.011 5.011 0 0 0 .592.38Zm-5.41 4.722a12.069 12.069 0 0 1-2.135-2.393A11.931 11.931 0 0 1 24 36a12.115 12.115 0 0 1 .166-2 11.931 11.931 0 0 1 2.265-5.242 12.072 12.072 0 0 1 2.385-2.37 11.945 11.945 0 0 1 7.932-2.365 11.93 11.93 0 0 1 6.494 2.408 12.076 12.076 0 0 1 2.37 2.385A11.94 11.94 0 0 1 48 36a12.112 12.112 0 0 1-.166 2 11.94 11.94 0 0 1-2.724 5.81 12.075 12.075 0 0 1-2.393 2.135A11.93 11.93 0 0 1 36 48a12.086 12.086 0 0 1-2.4-.24 11.945 11.945 0 0 1-5.41-2.65Zm12.353-1.339a9.03 9.03 0 0 0 .85-.565l-2.882-2.881a4.974 4.974 0 0 1-1.91.64v4.015a8.888 8.888 0 0 0 1.97-.353 8.93 8.93 0 0 0 1.972-.856Zm-.007-5.664a4.978 4.978 0 0 1-.53.885l2.845 2.845a9.064 9.064 0 0 0 1.575-2.668 8.939 8.939 0 0 0 .52-2.169H40.9a4.964 4.964 0 0 1-.364 1.107ZM38.042 36l-.082.403c-.059.29-.182.559-.356.792l-.247.33-.355.207a1.967 1.967 0 0 1-.758.254l-.413.049-.393-.114a1.98 1.98 0 0 1-.633-.317l-.33-.247-.207-.355a1.965 1.965 0 0 1-.228-.599L33.958 36l.082-.403c.043-.214.121-.415.228-.6l.207-.354.33-.247c.19-.142.404-.25.633-.317l.392-.114.414.05c.274.032.53.12.758.253l.355.207.247.33c.174.233.297.502.356.792l.082.403Zm2.542-2c.139.318.245.652.316 1h4.045v-.005a8.972 8.972 0 0 0-2.094-4.831l-2.844 2.844a5.011 5.011 0 0 1 .577.992Zm-.041-5.771a9.1 9.1 0 0 1 .842.559l.008.006-2.882 2.881a4.974 4.974 0 0 0-1.91-.64V27.02a9.062 9.062 0 0 1 1.97.353 8.93 8.93 0 0 1 1.972.856Zm-5.943-1.12c-.009 0-.018.002-.026.003a8.95 8.95 0 0 0-4.41 2.037l2.844 2.845a5.011 5.011 0 0 1 1.592-.795v-4.09Zm-6.371 4.348c.17-.291.358-.573.559-.842l.006-.007 2.881 2.881A4.997 4.997 0 0 0 31.1 35h-4.045a8.964 8.964 0 0 1 1.174-3.543ZM27.223 38a8.972 8.972 0 0 1-.168-1H31.1a4.951 4.951 0 0 0 .575 1.511l-2.881 2.881A9.01 9.01 0 0 1 27.223 38Z"
              clipRule="evenodd"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-UN-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-UN-a)`}>
            <path fill="#86C5FA" d="M0 0h72v50H0z" />
            <path
              fill="#F5F7F8"
              fillRule="evenodd"
              d="M44.697 40.214C52.522 36.843 58 29.061 58 20c0-4.666-1.453-8.993-3.93-12.553a22.11 22.11 0 0 0-1.898-2.362l-3.437 3.653A16.936 16.936 0 0 1 53 20c0 9.389-7.611 17-17 17s-17-7.611-17-17c0-4.53 1.772-8.646 4.66-11.693l-3.43-3.646a22.122 22.122 0 0 0-1.954 2.303A21.902 21.902 0 0 0 14 20c0 9.445 5.952 17.5 14.31 20.619.976.364 1.985.66 3.02.884a3.73 3.73 0 0 0-.846 2.886 3.733 3.733 0 0 0 1.068 2.174L36.116 42c.333-.002.665-.011.994-.028l4.591 4.591a3.736 3.736 0 0 0 1.06-3.182 3.732 3.732 0 0 0-1.06-2.12l-.006-.005.017-.005a21.825 21.825 0 0 0 2.985-1.037ZM33.6 24.388a4.93 4.93 0 0 0 1 .413v4.09a8.96 8.96 0 0 1-4.437-2.04l2.845-2.845a5.011 5.011 0 0 0 .592.381Zm-5.41 4.722a12.069 12.069 0 0 1-2.135-2.393A11.931 11.931 0 0 1 24 20a12.115 12.115 0 0 1 .166-2 11.931 11.931 0 0 1 2.265-5.242 12.072 12.072 0 0 1 2.385-2.37 11.945 11.945 0 0 1 7.932-2.365 11.93 11.93 0 0 1 6.494 2.408 12.076 12.076 0 0 1 2.37 2.385A11.94 11.94 0 0 1 48 20a12.112 12.112 0 0 1-.166 2 11.94 11.94 0 0 1-2.724 5.81 12.075 12.075 0 0 1-2.393 2.135A11.93 11.93 0 0 1 36 32a12.086 12.086 0 0 1-2.4-.24 11.945 11.945 0 0 1-5.41-2.65Zm12.353-1.339a9.03 9.03 0 0 0 .85-.565l-2.882-2.881a4.974 4.974 0 0 1-1.91.64v4.015a8.888 8.888 0 0 0 1.97-.353 8.93 8.93 0 0 0 1.972-.856Zm-.007-5.664a4.978 4.978 0 0 1-.53.885l2.845 2.845a9.064 9.064 0 0 0 1.575-2.668 8.939 8.939 0 0 0 .52-2.169H40.9a4.964 4.964 0 0 1-.364 1.107ZM38.042 20l-.082.403c-.059.29-.182.559-.356.792l-.247.33-.355.207a1.967 1.967 0 0 1-.758.254l-.413.049-.393-.114a1.98 1.98 0 0 1-.633-.317l-.33-.247-.207-.355a1.965 1.965 0 0 1-.228-.599L33.958 20l.082-.403c.043-.214.121-.415.228-.6l.207-.354.33-.247c.19-.143.404-.25.633-.317l.392-.114.414.05c.274.032.53.12.758.253l.355.207.247.33c.174.233.297.502.356.792l.082.403Zm2.542-2c.139.317.245.652.316 1h4.045v-.005a8.972 8.972 0 0 0-2.094-4.832l-2.844 2.845a5.011 5.011 0 0 1 .577.992Zm-.041-5.771c.291.17.572.357.842.559l.008.006-2.882 2.881a4.974 4.974 0 0 0-1.91-.64V11.02a9.062 9.062 0 0 1 1.97.353 8.93 8.93 0 0 1 1.972.856Zm-5.943-1.12c-.009 0-.018.002-.026.003a8.95 8.95 0 0 0-4.41 2.037l2.844 2.845a5.011 5.011 0 0 1 1.592-.795v-4.09Zm-6.371 4.348a8.84 8.84 0 0 1 .559-.842l.006-.008 2.881 2.882A4.997 4.997 0 0 0 31.1 19h-4.045a8.964 8.964 0 0 1 1.174-3.543ZM27.223 22a8.972 8.972 0 0 1-.168-.995V21H31.1a4.951 4.951 0 0 0 .575 1.511l-2.881 2.881A9.01 9.01 0 0 1 27.223 22Z"
              clipRule="evenodd"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default UN;
