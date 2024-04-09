// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type GU_SharpProps = CountrySymbolProps;

const GU_Sharp = forwardRef<SVGSVGElement, GU_SharpProps>(function GU_Sharp(
  props: GU_SharpProps,
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
      data-testid="GU_Sharp"
      style={style}
      aria-label="Guam"
      viewBox="0 0 72 50"
      ref={ref}
      {...rest}
    >
      <mask
        id={`${uid}-GU-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-GU-a)`}>
        <path fill="#DD2033" d="M0 0h72v50H0z" />
        <path fill="#004692" d="M0 4h72v42H0z" />
        <path
          fill="#DD2033"
          fillRule="evenodd"
          d="m36.089 7 1.565 1.243c5.564 4.419 8.607 8.802 9.78 13.048 1.182 4.284.375 8.117-1.156 11.231-1.511 3.073-3.74 5.483-5.526 7.095A28.78 28.78 0 0 1 38.44 41.5a21.842 21.842 0 0 1-.928.64l-.063.04-.02.013-.007.004-.003.002c-.001 0-.002.002-1.327-2.084 0 0 21.184-13.13 0-29.952-21.599 17.233 0 29.952 0 29.952-1.276 2.115-1.277 2.114-1.278 2.114l-.003-.002-.008-.005-.02-.012a21.88 21.88 0 0 1-1.011-.662 28.462 28.462 0 0 1-2.36-1.838c-1.823-1.58-4.102-3.952-5.649-7.008-1.57-3.1-2.392-6.934-1.185-11.245 1.194-4.265 4.29-8.695 9.948-13.21L36.09 7Zm.003 33.114 1.325 2.086-1.291.8-1.31-.771 1.276-2.115Z"
          clipRule="evenodd"
        />
        <mask
          id={`${uid}-GU-b`}
          x="26"
          y="10"
          maskUnits="userSpaceOnUse"
          style={{ maskType: "alpha" }}
        >
          <path
            fill="#FBD381"
            d="M36.092 10.162c21.184 16.822 0 29.952 0 29.952s-21.599-12.72 0-29.952Z"
          />
        </mask>
        <g mask={`url(#${uid}-GU-b)`}>
          <path fill="#FBD381" d="M24.462 32.319h23.261v9.847H24.462z" />
          <path fill="#0091DA" d="M24.462 27.395h23.261v4.924H24.462z" />
          <path fill="#86C5FA" d="M24.462 10.162h23.261v17.233H24.462z" />
          <path fill="#936846" d="M34.431 20.009h1.661V34.78h-1.661z" />
          <path
            fill="#009B77"
            d="m35.677 14.265 1.329 2.816 3.002-.703-1.345 2.808 2.414 1.94-3.005.686.008 3.12-2.403-1.952-2.403 1.953.008-3.121-3.005-.686 2.414-1.94-1.344-2.808 3.001.703 1.329-2.816Z"
          />
        </g>
      </g>
    </CountrySymbol>
  );
});

export default GU_Sharp;
