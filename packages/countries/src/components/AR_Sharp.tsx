// WARNING: This file was generated by a script. Do not modify it manually
import { forwardRef } from "react";
import { useId } from "@salt-ds/core";
import { clsx } from "clsx";

import { CountrySymbol, CountrySymbolProps } from "../country-symbol";

export type AR_SharpProps = CountrySymbolProps;

const AR_Sharp = forwardRef<SVGSVGElement, AR_SharpProps>(function AR_Sharp(
  props: AR_SharpProps,
  ref
) {
  const uid = useId(props.id);

  const { className, ...rest } = props;

  return (
    <CountrySymbol
      data-testid="AR_Sharp"
      aria-label="Argentina"
      viewBox="0 0 72 50"
      ref={ref}
      className={clsx(className, { "saltCountrySymbol-sharp": true })}
      {...rest}
    >
      <mask
        id={`${uid}-AR-a`}
        x="0"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: "alpha" }}
      >
        <path fill="#D9D9D9" d="M0 0h72v50H0z" />
      </mask>
      <g mask={`url(#${uid}-AR-a)`}>
        <path fill="#86C5FA" d="M0 50V0h72v50z" />
        <path fill="#F5F7F8" d="M0 39V11h72v28z" />
        <path
          fill="#F1B434"
          d="m46.743 25-4.495 2.223 2.393 4.576-4.88-.982L39.142 36l-3.4-3.812L32.344 36l-.618-5.183-4.881.981 2.393-4.576L24.743 25l4.495-2.223-2.394-4.575 4.88.981.62-5.183 3.399 3.812 3.4-3.812.618 5.183 4.88-.981-2.393 4.576L46.743 25Z"
        />
      </g>
    </CountrySymbol>
  );
});

export default AR_Sharp;
