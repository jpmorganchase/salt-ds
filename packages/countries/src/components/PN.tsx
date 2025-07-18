// WARNING: This file was generated by a script. Do not modify it manually

import { useId } from "@salt-ds/core";
import { forwardRef } from "react";

import { CountrySymbol, type CountrySymbolProps } from "../country-symbol";

export type PNProps = CountrySymbolProps;

const PN = forwardRef<SVGSVGElement, PNProps>(function PN(props: PNProps, ref) {
  const uid = useId(props.id);

  return (
    <CountrySymbol
      data-testid="PN"
      aria-label="Pitcairn"
      viewBox="0 0 20 20"
      ref={ref}
      {...props}
    >
      <mask
        id={`${uid}-PN-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <circle cx="10" cy="10" r="10" fill="#d9d9d9" />
      </mask>
      <g mask={`url(#${uid}-PN-a)`}>
        <path fill="#004692" d="M0 0h20v20H0z" />
        <path fill="#c1c3c3" d="M12.778 7.549h2.5v2.222h-2.5z" />
        <path fill="#008259" d="M13.056 5.605h.694v.833h.972V7.55h-1.666z" />
        <path
          fill="#86c5fa"
          d="M11.111 9.722h5.833v2.088a4.63 4.63 0 0 1-2.916 4.301 4.63 4.63 0 0 1-2.917-4.301z"
        />
        <mask
          id={`${uid}-PN-b`}
          x="11"
          y="9"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#86c5fa"
            d="M11.111 9.722h5.833v2.088a4.63 4.63 0 0 1-2.916 4.301 4.63 4.63 0 0 1-2.917-4.301z"
          />
        </mask>
        <g mask={`url(#${uid}-PN-b)`}>
          <path fill="#fbd381" d="m14.028 9.722 2.916 6.39h-5.833z" />
          <path fill="#008259" d="m14.028 11.16 2.916 6.389h-5.833z" />
        </g>
        <mask
          id={`${uid}-PN-c`}
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path fill="#002f6c" d="M0 10C0 4.477 4.477 0 10 0v10z" />
        </mask>
        <g mask={`url(#${uid}-PN-c)`}>
          <path fill="#004692" d="M0 0h10v10H0z" />
          <path
            fill="#f5f7f8"
            d="m3.478.87-.589.59 8.202 8.201.59-.589zM1.907 2.442l-.982.982 8.202 8.202.982-.983z"
          />
          <path
            fill="#dd2033"
            d="m1.907 2.442.982-.982 8.202 8.201-.982.982z"
          />
          <path fill="#f5f7f8" d="M10 3.333v1.39H4.722V10H3.333V3.333z" />
          <path fill="#f5f7f8" d="M10-.556v1.39H1.389V10H0V-.556z" />
          <path
            fill="#dd2033"
            fillRule="evenodd"
            d="M.833 10h2.5V3.333H10v-2.5H.833z"
            clipRule="evenodd"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default PN;
