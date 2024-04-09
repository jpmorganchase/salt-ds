// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type KR_SharpProps = CountrySymbolProps;

const KR_Sharp = forwardRef<SVGSVGElement, KR_SharpProps>(function KR_Sharp(
  props: KR_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { style: styleProp, ...rest } = props;

  const style = {
    ...styleProp,
    borderRadius: "0",
    "--saltCountrySymbol-aspect-ratio-multiplier": "1.44",
  };

  return (
    <CountrySymbol
      data-testid="KR_Sharp"
      style={style}
      aria-label="Korea (the Republic of)"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
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
    </CountrySymbol>
  );
});

export default KR_Sharp;
