// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type PT_SharpProps = CountrySymbolProps;

const PT_Sharp = forwardRef<SVGSVGElement, PT_SharpProps>(function PT_Sharp(
  props: PT_SharpProps,
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
      data-testid="PT_Sharp"
      style={style}
      aria-label="Portugal"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-PT-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-PT-a)`}>
        <path fill="#005B33" d="M0 0h28v50H0z" />
        <path fill="#DD2033" d="M28 0h44v50H28z" />
        <circle cx="27.4" cy="25" r="14" fill="#F1B434" />
        <path
          fill="#F5F7F8"
          fillRule="evenodd"
          d="M18.4 17v9.822a9.7 9.7 0 0 0 6.065 8.992c1.883.76 3.987.76 5.87 0a9.699 9.699 0 0 0 6.065-8.992V17h-18Z"
          clipRule="evenodd"
        />
        <path
          fill="#DD2033"
          fillRule="evenodd"
          d="M32.4 21h-10v5.822a5.699 5.699 0 0 0 3.564 5.284 3.834 3.834 0 0 0 2.872 0 5.699 5.699 0 0 0 3.564-5.284V21Zm-14-4v9.822a9.7 9.7 0 0 0 6.065 8.992c1.883.76 3.987.76 5.87 0a9.699 9.699 0 0 0 6.065-8.992V17h-18Z"
          clipRule="evenodd"
        />
      </g>
    </CountrySymbol>
  );
});

export default PT_Sharp;
