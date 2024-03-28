// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type KRProps = CountrySymbolProps;

const KR = forwardRef<SVGSVGElement, KRProps>(function KR(props: KRProps, ref) {
  const uid = useId(props.id);

  const viewBoxValue = props.variant === "sharp" ? "0 0 72 50" : "0 0 72 72";

  return (
    <CountrySymbol
      data-testid="KR"
      aria-label="Korea (the Republic of)"
      viewBox={viewBoxValue}
      ref={ref}
      {...props}
    >
      {props.variant !== "sharp" && (
        <>
          <mask
            id={`${uid}-KR-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <circle cx="36" cy="36" r="36" fill="#D9D9D9" />
          </mask>
          <g mask={`url(#${uid}-KR-a)`}>
            <path fill="#F5F7F8" d="M0 0h72v72H0z" />
            <path
              fill="#DD2033"
              fillRule="evenodd"
              d="M49 36.004C49 43.175 43.182 49 35.995 49 28.81 49 23 43.175 23 36.004 23 28.834 28.818 23 36.005 23 43.19 23 49 28.834 49 36.004Z"
              clipRule="evenodd"
            />
            <path
              fill="#004692"
              fillRule="evenodd"
              d="M23.188 33.712c.412 3.275 1.011 6.923 6.104 7.294 1.906.115 5.62-.442 6.891-5.594 1.683-4.94 6.713-6.357 10.14-3.683 1.961 1.257 2.498 3.249 2.623 4.754-.152 4.78-2.944 8.94-6.515 10.8-4.117 2.417-9.81 2.47-14.795-1.195-2.246-2.08-5.388-5.931-4.448-12.376Z"
              clipRule="evenodd"
            />
            <path
              fill="#31373D"
              d="m19.537 9.837-9.9 9.9 2.121 2.12 9.9-9.899-2.121-2.121Zm-9.9 42.427 9.9 9.899 2.12-2.121-9.899-9.9-2.12 2.121Zm38.891-4.95 4.243-4.243 2.12 2.121-4.242 4.243-2.121-2.121Zm7.778-.707-4.243 4.242 2.122 2.122 4.242-4.243-2.12-2.121Zm-.707 7.778 4.243-4.243 2.12 2.121-4.242 4.243-2.121-2.121Zm-8.485-5.657-4.243 4.243 2.121 2.12 4.243-4.242-2.121-2.121Zm-.707 7.778 4.242-4.242 2.121 2.12-4.242 4.243-2.121-2.12Zm7.778-.707-4.243 4.243 2.121 2.121 4.243-4.243-2.121-2.121Zm-36.77-2.829-4.242-4.242 2.12-2.121 4.244 4.242-2.122 2.122Zm3.535-.706-2.12 2.12 4.242 4.243 2.121-2.12-4.242-4.243Zm-7.777-28.992 9.9-9.9 2.12 2.122-9.899 9.9-2.121-2.122Zm33.234-7.778 9.9 9.9 2.12-2.122-9.9-9.9-2.12 2.122ZM16.708 26.808l9.9-9.9 2.121 2.121-9.9 9.9-2.12-2.121Zm0 18.384 9.9 9.9 2.12-2.121-9.899-9.9-2.12 2.121Zm37.477-28.991-4.243-4.243 2.121-2.121 4.243 4.243-2.121 2.121ZM42.871 19.03l4.243 4.242 2.121-2.121-4.243-4.243-2.12 2.121Zm16.971 2.828-4.243-4.243 2.121-2.121 4.243 4.242-2.121 2.122Zm-11.314 2.828 4.243 4.243 2.12-2.121-4.242-4.243-2.121 2.121Z"
            />
          </g>
        </>
      )}
      {props.variant === "sharp" && (
        <>
          <mask
            id={`${uid}-KR-a`}
            x="0"
            y="0"
            maskUnits="userSpaceOnUse"
            style={{ maskType: "alpha" }}
          >
            <path fill="#D9D9D9" d="M0 0h72v50H0z" />
          </mask>
          <g mask={`url(#${uid}-KR-a)`}>
            <path fill="#F5F7F8" d="M0 0h72v50H0z" />
            <path
              fill="#DD2033"
              fillRule="evenodd"
              d="M46.9 25.004c0 6.03-4.892 10.928-10.935 10.928-6.044 0-10.928-4.899-10.928-10.928 0-6.03 4.892-10.935 10.935-10.935 6.044 0 10.928 4.905 10.928 10.935Z"
              clipRule="evenodd"
            />
            <path
              fill="#004692"
              fillRule="evenodd"
              d="M25.195 23.076c.346 2.754.85 5.821 5.133 6.134 1.603.096 4.726-.373 5.795-4.705 1.414-4.154 5.644-5.345 8.527-3.097 1.648 1.057 2.1 2.732 2.205 3.998-.128 4.02-2.476 7.518-5.48 9.081-3.461 2.033-8.248 2.077-12.44-1.004-1.889-1.75-4.53-4.988-3.74-10.407Z"
              clipRule="evenodd"
            />
            <path
              fill="#31373D"
              d="M22.125 3 13.8 11.324l1.784 1.784 8.325-8.324L22.125 3ZM13.8 38.676 22.125 47l1.783-1.784-8.324-8.324-1.784 1.784Zm32.703-4.162 3.568-3.568 1.783 1.784-3.567 3.567-1.784-1.783Zm6.54-.595-3.567 3.568 1.784 1.783 3.567-3.567-1.784-1.784Zm-.594 6.541 3.567-3.568 1.784 1.784-3.567 3.567-1.784-1.784Zm-7.135-4.757-3.568 3.567 1.784 1.784 3.567-3.568-1.783-1.783Zm-.594 6.54 3.567-3.567 1.784 1.783-3.568 3.568-1.784-1.784Zm6.54-.594-3.568 3.567L49.476 47l3.567-3.568-1.783-1.783ZM20.34 39.27l-3.567-3.567 1.784-1.784 3.568 3.568-1.784 1.783Zm2.974-.594-1.784 1.783 3.568 3.568 1.783-1.784-3.567-3.567Zm-6.541-24.379 8.325-8.324 1.783 1.784-8.324 8.324-1.784-1.784Zm27.947-6.54 8.324 8.324 1.783-1.784-8.324-8.324-1.784 1.784ZM19.746 17.27l8.325-8.324 1.783 1.784-8.324 8.324-1.784-1.784Zm0 15.46 8.325 8.324 1.783-1.784-8.324-8.324-1.784 1.784ZM51.26 8.351l-3.568-3.567L49.476 3l3.568 3.568L51.26 8.35Zm-9.514 2.379 3.568 3.567 1.783-1.783-3.567-3.568-1.784 1.784Zm14.27 2.378L52.45 9.541l1.784-1.784 3.567 3.567-1.784 1.784Zm-9.513 2.379 3.568 3.567 1.783-1.784-3.567-3.567-1.784 1.784Z"
            />
          </g>
        </>
      )}
    </CountrySymbol>
  );
});

export default KR;
