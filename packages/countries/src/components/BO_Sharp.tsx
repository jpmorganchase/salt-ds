// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type BO_SharpProps = CountrySymbolProps;

const BO_Sharp = forwardRef<SVGSVGElement, BO_SharpProps>(function BO_Sharp(
  props: BO_SharpProps,
  ref,
) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="BO_Sharp"
      aria-label="Bolivia (Plurinational State of)"
      viewBox="0 0 29 20"
      ref={ref}
      sharp
      {...props}
    >
      <mask
        id={`${uid}-BO-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#d9d9d9" d="M0 0h29v20H0z" />
      </mask>
      <g mask={`url(#${uid}-BO-a)`}>
        <path fill="#009b77" d="M0 20v-4.4h29V20z" />
        <path fill="#fbd381" d="M0 15.6V4.4h29v11.2z" />
        <path fill="#dd2033" d="M0 4.4V0h29v4.4z" />
        <path
          fill="#936846"
          d="m14.5 11-1.047-.6-2.417 4.157 1.047.6zm.161 0 1.047-.6 2.416 4.157-1.046.6z"
        />
        <path
          fill="#dd2033"
          d="M12.083 8.8 6.847 7.6v4.535c0 .98.88 1.73 1.856 1.581l3.38-.516zm4.834 0 5.236-1.2v4.535c0 .98-.88 1.73-1.856 1.581l-3.38-.516z"
        />
        <path
          fill="#a00009"
          d="M8.056 6.8 13.292 8v4.4l-3.38.516c-.976.15-1.856-.6-1.856-1.581zm12.888 0L15.708 8v4.4l3.38.516c.976.15 1.856-.6 1.856-1.581z"
        />
        <path
          fill="#dd2033"
          d="M9.264 6 14.5 7.2 19.736 6v4.535c0 .98-.88 1.73-1.856 1.581L14.5 11.6l-3.38.516c-.976.15-1.856-.6-1.856-1.581z"
        />
        <path
          fill="#f1b434"
          d="m11.99 12.05 2.51-.45 2.51.45c1.01.18 1.93-.61 1.896-1.627l-.136-4.201-4.27.978-4.27-.978-.136 4.2a1.607 1.607 0 0 0 1.896 1.627"
        />
        <mask
          id={`${uid}-BO-b`}
          x="11"
          y="6"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <ellipse cx="14.5" cy="10" fill="#d9d9d9" rx="2.819" ry="4" />
        </mask>
        <g mask={`url(#${uid}-BO-b)`}>
          <path
            fill="#fbd381"
            d="M17.154 13.287c-.615.872-1.54 1.513-2.654 1.513s-2.04-.641-2.654-1.513c-.616-.874-.971-2.038-.971-3.287s.355-2.413.971-3.287C12.461 5.84 13.386 5.2 14.5 5.2s2.04.641 2.654 1.513c.616.874.971 2.038.971 3.287s-.355 2.413-.971 3.287"
          />
          <path
            fill="#008259"
            d="M13.204 10.042a2.38 2.38 0 0 1 2.592 0c1.984 1.29 1.071 4.371-1.296 4.371s-3.28-3.081-1.296-4.371"
          />
        </g>
        <path
          fill="#005eb8"
          fillRule="evenodd"
          d="M17.154 13.287c-.615.872-1.54 1.513-2.654 1.513s-2.04-.641-2.654-1.513c-.616-.874-.971-2.038-.971-3.287s.355-2.413.971-3.287C12.461 5.84 13.386 5.2 14.5 5.2s2.04.641 2.654 1.513c.616.874.971 2.038.971 3.287s-.355 2.413-.971 3.287M14.5 14c1.557 0 2.82-1.79 2.82-4s-1.263-4-2.82-4-2.82 1.79-2.82 4 1.263 4 2.82 4"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default BO_Sharp;
